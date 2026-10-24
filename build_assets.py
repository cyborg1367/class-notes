"""Deterministic public asset versions. Python standard library; no runtime fetch."""
from pathlib import Path
from urllib.parse import urlsplit, parse_qsl, urlencode
import hashlib, json, re, posixpath

VERSIONED_SUFFIXES={'.css','.js','.mjs','.svg','.png','.woff','.woff2','.ttf'}
CONFIG_FILES={'auth-config.json','lab-service.json'}

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

def prepare_public_assets(root,dist):
    version=asset_version(root)
    catalog=json.loads((dist/'assets/catalog.json').read_text())
    ids=[lesson['id'] for course in catalog for lesson in course['lessons']]
    assert len(ids)==len(set(ids)), 'Duplicate lesson ids in canonical catalog'
    serialized=json.dumps(catalog,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    for page in sorted(dist.rglob('*.html')):
        text=page.read_text()
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
