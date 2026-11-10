"""Deterministic public asset versions. Python standard library; no runtime fetch."""
from pathlib import Path
from urllib.parse import urlsplit, parse_qsl, urlencode
import hashlib, json, re, posixpath

VERSIONED_SUFFIXES={'.css','.js','.mjs','.svg','.png','.webp','.woff','.woff2','.ttf','.csv'}
CONFIG_FILES={'auth-config.json','lab-service.json'}
OBSOLETE_ASSETS={'lab-checks.py','dashboard-ui.mjs','coding-lab-layout.mjs','instructor.mjs'}

def lesson_order(lesson, index):
    """Catalog lesson numbers determine teaching order, including 09 -> 10."""
    try:
        number=int(lesson.get('number',index+1))
        return number if number>0 else index+1
    except (TypeError,ValueError):
        return index+1

def asset_version(root):
    digest=hashlib.sha256()
    for name in ['build.py','build_assets.py']:
        digest.update(name.encode()+b'\0'+(root/name).read_bytes())
    for path in sorted((root/'web/assets').rglob('*')):
        if path.is_file() and path.name not in OBSOLETE_ASSETS and (path.suffix in VERSIONED_SUFFIXES or path.name=='catalog.json'):
            digest.update(path.relative_to(root/'web').as_posix().encode()+b'\0'+path.read_bytes()+b'\0')
    return digest.hexdigest()[:16]

def with_version(value,version):
    u=urlsplit(value)
    query=dict(parse_qsl(u.query,keep_blank_values=True));query['v']=version
    return u._replace(query=urlencode(query)).geturl()

def rewrite_asset_url(value,page,dist,version):
    u=urlsplit(value)
    if u.scheme or u.netloc or not u.path:return value
    target=(page.parent/u.path).resolve()
    assets=(dist/'assets').resolve()
    if target.is_relative_to(assets) and target.is_file() and target.suffix in VERSIONED_SUFFIXES:
        return with_version(value,version)
    return value

def validate_catalog(catalog, dist):
    missions=set(); routes=set()
    for course in catalog:
        for lesson in course['lessons']:
            lab=lesson.get('lab')
            if lab is None: continue
            assert isinstance(lab,dict) and set(lab)=={'mission','title','path','model','bridge'}, 'Invalid lab catalog fields'
            assert all(isinstance(v,str) and v.strip() for v in lab.values()), 'Empty lab catalog field'
            assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',lab['mission']), 'Invalid lab mission id'
            assert lab['mission'] not in missions, 'Duplicate lab mission id'
            assert lab['path']=='lab/'+lesson['id']+'/' and '..' not in lab['path'].split('/'), 'Invalid lab route'
            assert lab['path'] not in routes and (dist/lab['path']/'index.html').is_file(), 'Missing or duplicate lab route'
            assert re.fullmatch(r'coding-lab-[a-z0-9-]+\.mjs',lab['model']) and (dist/'assets'/lab['model']).is_file(), 'Missing or invalid lab model'
            model=(dist/'assets'/lab['model']).read_text(encoding="utf-8")
            match=re.search(r"export const missionId\s*=\s*['\"]([^'\"]+)['\"]",model)
            assert match and match[1]==lab['mission'], 'Lab model mission differs from catalog'
            task_ids=set(re.findall(r"\bid\s*:\s*['\"]([^'\"]+)['\"]",model))
            for field in ['lab_steps','practice_skills']:
                values=lesson.get(field,[])
                assert isinstance(values,list), 'Invalid dashboard lesson metadata'
                for value in values:
                    key='id' if field=='lab_steps' else 'task'
                    label='title' if field=='lab_steps' else 'label'
                    assert isinstance(value,dict) and set(value)=={key,label} and value[key] in task_ids and isinstance(value[label],str) and 0<len(value[label])<=80, 'Invalid dashboard task metadata'
            assert lesson.get('dashboard_art','greenhouse') in {'greenhouse','sms','evaluation'}, 'Invalid dashboard artwork'
            missions.add(lab['mission']); routes.add(lab['path'])

def prepare_public_assets(root,dist):
    version=asset_version(root)
    catalog=json.loads((dist/'assets/catalog.json').read_text(encoding="utf-8"))
    ids=[lesson['id'] for course in catalog for lesson in course['lessons']]
    assert len(ids)==len(set(ids)), 'Duplicate lesson ids in canonical catalog'
    validate_catalog(catalog,dist)
    serialized=json.dumps(catalog,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    shells=None
    for page in sorted(dist.rglob('*.html')):
        text=page.read_text(encoding="utf-8")
        if 'data-site-header-root' in text:
            if shells is None:
                compiled=root/'frontend/generated/site-shells.json'
                assert compiled.is_file(), 'Run npm run build:course to compile the shared React shell.'
                shells=json.loads(compiled.read_text(encoding='utf-8'))
                digest=hashlib.sha256()
                for name in shells['source_files']:
                    public_inputs={'web/assets/view-channel.mjs','web/assets/course-view-model.mjs','web/assets/home-view-model.mjs','web/assets/paper-icons.mjs','web/assets/notifications.mjs','web/assets/classroom-presence.mjs','web/assets/account-model.mjs','web/assets/account-controller.mjs','web/assets/dashboard-model.mjs','web/assets/instructor-model.mjs','web/assets/review.mjs'}
                    assert (name.startswith('frontend/') or name in public_inputs) and '..' not in Path(name).parts, 'Invalid shell source path'
                    digest.update(name.encode()+b'\0'+(root/name).read_bytes()+b'\0')
                assert shells['source_sha256']==digest.hexdigest(), 'React shell sources changed; run npm run build:course.'
            route=page.relative_to(dist).as_posix()
            assert route in shells['shells'], ('Missing compiled React shell',route)
            for kind in ['header','footer']:
                start='<!-- site-'+kind+':start -->';end='<!-- site-'+kind+':end -->'
                text,count=re.subn(re.escape(start)+'.*?'+re.escape(end),lambda m:shells['shells'][route][kind],text,flags=re.S)
                assert count==1, ('Each route needs one shared shell slot',route,kind)
        if '<!-- course-react:start -->' in text:
            text=re.sub(r'(data-course-react-root[^>]*>)\s*(<!-- course-react:start -->)',r'\1\2',text)
            text=re.sub(r'(<!-- course-react:end -->)\s*(</section>)',r'\1\2',text)
            compiled=root/'frontend/generated/course-pages.json'
            assert compiled.exists(), 'Run npm run build:course before building the site.'
            rendered=json.loads(compiled.read_text(encoding='utf-8'))
            assert rendered['catalog_sha256']==hashlib.sha256((dist/'assets/catalog.json').read_bytes()).hexdigest(), 'Catalog changed; run npm run build:course.'
            course_id=page.relative_to(dist).parent.as_posix()
            assert course_id in rendered['pages'], ('Missing React course page',course_id)
            text,count=re.subn(r'(<!-- course-react:start -->).*?(<!-- course-react:end -->)',lambda m:rendered['pages'][course_id],text,flags=re.S)
            assert count==1, ('Course page needs one React slot',page)
        if '<!-- account-react:start -->' in text:
            compiled=root/'frontend/generated/account-page.json'
            assert compiled.is_file(), 'Run npm run build:course to compile the React account page.'
            rendered=json.loads(compiled.read_text(encoding='utf-8'))
            text,count=re.subn(r'<!-- account-react:start -->.*?<!-- account-react:end -->',lambda m:rendered['html'],text,flags=re.S)
            assert count==1, ('Account page needs one React slot',page)
        if '<!-- about-react:start -->' in text:
            compiled=root/'frontend/generated/about-page.json'
            assert compiled.is_file(), 'Run npm run build:course to compile the React about page.'
            rendered=json.loads(compiled.read_text(encoding='utf-8'))
            text,count=re.subn(r'<!-- about-react:start -->.*?<!-- about-react:end -->',lambda m:rendered['html'],text,flags=re.S)
            assert count==1, ('About page needs one React slot',page)
        if '<!-- home-react:start -->' in text:
            compiled=root/'frontend/generated/home-page.json'
            assert compiled.is_file(), 'Run npm run build:course to compile the React homepage.'
            rendered=json.loads(compiled.read_text(encoding='utf-8'))
            assert rendered['catalog_sha256']==hashlib.sha256((dist/'assets/catalog.json').read_bytes()).hexdigest(), 'Homepage catalog changed; run npm run build:course.'
            text,count=re.subn(r'<!-- home-react:start -->.*?<!-- home-react:end -->',lambda m:rendered['html'],text,flags=re.S)
            assert count==1, ('Homepage needs one React slot',page)
        text,count=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script>)',lambda m:m[1]+serialized+m[2],text,flags=re.S)
        assert count==1, ('Each route needs one catalog slot',page)
        text=re.sub(r'\b(src|href)="([^"\n]+)"',lambda m:f'{m[1]}="{rewrite_asset_url(m[2],page,dist,version)}"',text)
        # Start the already-required SDK download while auth-config is fetched.
        config=json.loads((dist/'assets/auth-config.json').read_text(encoding="utf-8"))
        if config['supabaseUrl']:
            sdk=posixpath.relpath('assets/vendor/supabase/supabase.js',page.relative_to(dist).parent.as_posix())
            hint=f'<link rel="preload" as="script" href="{with_version(sdk,version)}">'
            text=text.replace('</head>',hint+'</head>',1)
        page.write_text(text, encoding="utf-8")
    for css in sorted((dist/'assets').rglob('*.css')):
        text=css.read_text(encoding="utf-8")
        text=re.sub(r'url\((\s*[\'\"]?)([^\)\'\"\s]+)([\'\"]?\s*)\)',lambda m:'url('+m[1]+rewrite_asset_url(m[2],css,dist,version)+m[3]+')',text)
        css.write_text(text, encoding="utf-8")
    for js in (dist/'assets').glob('*.js'):
        text=js.read_text(encoding="utf-8").replace('?v=build',f'?v={version}')
        js.write_text(text, encoding="utf-8")
    manifest={'version':version,'files':{p.relative_to(dist).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((dist/'assets').rglob('*')) if p.is_file() and p.name not in CONFIG_FILES|{'asset-manifest.json'}}}
    (dist/'assets/asset-manifest.json').write_text(json.dumps(manifest,sort_keys=True,separators=(',',':'))+'\n', encoding="utf-8")
    return version
