"""Deterministic public asset versions. Python standard library; no runtime fetch."""
from pathlib import Path
from urllib.parse import urlsplit, parse_qsl, urlencode
import hashlib, json, re, posixpath
from html import escape

VERSIONED_SUFFIXES={'.css','.js','.mjs','.svg','.png','.webp','.woff','.woff2','.ttf','.csv'}
CONFIG_FILES={'auth-config.json','lab-service.json'}

def lesson_order(lesson, index):
    """Catalog lesson numbers determine teaching order, including 09 -> 10."""
    try:
        number=int(lesson.get('number',index+1))
        return number if number>0 else index+1
    except (TypeError,ValueError):
        return index+1

def public_content_path(value):
    assert isinstance(value,str) and re.fullmatch(r'[a-z0-9]+(?:[/-][a-z0-9]+)*',value), 'Invalid public content path'
    return value+'/'

def render_home_courses(catalog):
    """Emit static homepage summaries from the public catalog, without runtime I/O.

    Catalog membership denotes publication. The highest lesson number is the
    latest release in this sequential course; array order breaks numbering ties.
    """
    arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6"/></svg>'
    seal='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 3 2 3.6.4.8 3.5L22 11l-2 3 .1 3.6-3.5 1L14 21l-3-1.8-3.5.2-1.1-3.3L3 14l1-3.4L3.6 7 7 5.7 9 3Z"/><path d="m9 11 2 2 4-4"/></svg>'
    digits=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')
    cards=[]
    for course in catalog:
        lessons=course.get('lessons',[])
        if not lessons:
            continue
        course_path=public_content_path(course['id'])
        index,latest=max(enumerate(lessons),key=lambda item:(lesson_order(item[1],item[0]),item[0]))
        latest_path=public_content_path(latest['id'])
        assert latest['id'].startswith(course['id']+'/'), 'Latest lesson belongs to a different course'
        title=str(course.get('display_title') or course['title'])
        lead=str(course.get('home_description') or course.get('description') or '')
        latest_title=str(latest['title'])
        subtitle=str(latest.get('subtitle') or latest.get('description') or '')
        counts=[(len(lessons),'یادداشت'),(sum(bool(l.get('lab')) for l in lessons),'لابراتور'),(sum(type(l.get('quiz_version')) is int and l['quiz_version']>0 for l in lessons),'آزمون')]
        statistics=''.join(f'<li><bdi>{str(count).translate(digits)}</bdi> {label}</li>' for count,label in counts)
        number=lesson_order(latest,index)
        language='en' if title.isascii() else 'fa'
        heading_id=f'home-course-title-{len(cards)+1}'
        cards.append(f'''<article class="home-course-card" data-home-course="{escape(course['id'])}" data-note-count="{counts[0][0]}" data-lab-count="{counts[1][0]}" data-quiz-count="{counts[2][0]}" data-latest-lesson="{escape(latest['id'])}" aria-labelledby="{heading_id}">
 <div class="home-course-summary">
  <span class="home-course-kicker">مسیر آموزشی</span>
  <h3 id="{heading_id}" class="home-course-title" lang="{language}" dir="auto">{escape(title)}</h3>
  <p class="home-course-lead">{escape(lead)}</p>
  <ul class="home-course-stats" aria-label="محتواهای منتشرشده">{statistics}</ul>
  <div class="home-course-actions"><a class="home-course-open" href="{escape(course_path)}" aria-label="مشاهدهٔ مسیر دورهٔ {escape(title)}"><span>مشاهدهٔ مسیر دوره</span>{arrow}</a><span class="home-course-access">{seal}با تأیید مدرس</span></div>
 </div>
 <section class="home-course-latest" aria-label="تازه‌ترین یادداشت">
  <div class="home-course-latest-head"><p>تازه‌ترین یادداشت</p><span class="home-course-new">جدید</span></div>
  <div class="home-course-note"><span class="home-course-number" dir="ltr" lang="en" aria-label="یادداشت {str(number).translate(digits)}">{number:02d}</span><div><h4>{escape(latest_title)}</h4><p>{escape(subtitle)}</p></div></div>
  <div class="home-course-latest-bottom"><img class="home-course-ink" src="assets/home-course-ink.svg" width="220" height="140" alt="" aria-hidden="true" loading="lazy" decoding="async"><a class="home-course-read" href="{escape(latest_path)}" aria-label="مطالعهٔ یادداشت {escape(latest_title)}"><span>مطالعهٔ یادداشت</span>{arrow}</a></div>
 </section>
</article>''')
    return '\n'.join(cards) if cards else '<p class="home-courses-empty">هنوز دوره‌ای منتشر نشده است.</p>'

def asset_version(root):
    digest=hashlib.sha256()
    for name in ['build.py','build_assets.py']:
        digest.update(name.encode()+b'\0'+(root/name).read_bytes())
    for path in sorted((root/'web/assets').rglob('*')):
        if path.is_file() and (path.suffix in VERSIONED_SUFFIXES or path.name=='catalog.json'):
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
            model=(dist/'assets'/lab['model']).read_text()
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
    catalog=json.loads((dist/'assets/catalog.json').read_text())
    ids=[lesson['id'] for course in catalog for lesson in course['lessons']]
    assert len(ids)==len(set(ids)), 'Duplicate lesson ids in canonical catalog'
    validate_catalog(catalog,dist)
    serialized=json.dumps(catalog,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    for page in sorted(dist.rglob('*.html')):
        text=page.read_text()
        text,count=re.subn(r'(<!-- home-courses:start -->).*?(<!-- home-courses:end -->)',lambda m:m[1]+'\n'+render_home_courses(catalog)+'\n'+m[2],text,flags=re.S)
        assert count<=1, ('Each homepage needs one course summary slot',page)
        text,count=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script>)',lambda m:m[1]+serialized+m[2],text,flags=re.S)
        assert count==1, ('Each route needs one catalog slot',page)
        text=re.sub(r'\b(src|href)="([^"\n]+)"',lambda m:f'{m[1]}="{rewrite_asset_url(m[2],page,dist,version)}"',text)
        # Start the already-required SDK download while auth-config is fetched.
        config=json.loads((dist/'assets/auth-config.json').read_text())
        if config['supabaseUrl']:
            sdk=posixpath.relpath('assets/vendor/supabase/supabase.js',page.relative_to(dist).parent.as_posix())
            hint=f'<link rel="preload" as="script" href="{with_version(sdk,version)}">'
            text=text.replace('</head>',hint+'</head>',1)
        page.write_text(text)
    for css in sorted((dist/'assets').rglob('*.css')):
        text=css.read_text()
        text=re.sub(r'url\((\s*[\'\"]?)([^\)\'\"\s]+)([\'\"]?\s*)\)',lambda m:'url('+m[1]+rewrite_asset_url(m[2],css,dist,version)+m[3]+')',text)
        css.write_text(text)
    for js in (dist/'assets').glob('*.js'):
        text=js.read_text().replace('?v=build',f'?v={version}')
        js.write_text(text)
    manifest={'version':version,'files':{p.relative_to(dist).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((dist/'assets').rglob('*')) if p.is_file() and p.name not in CONFIG_FILES|{'asset-manifest.json'}}}
    (dist/'assets/asset-manifest.json').write_text(json.dumps(manifest,sort_keys=True,separators=(',',':'))+'\n')
    return version
