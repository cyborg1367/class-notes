from pathlib import Path
import shutil, json, re, hashlib
from urllib.parse import urlsplit

r = Path(__file__).resolve().parent
c = json.loads((r / 'web/assets/auth-config.json').read_text())
assert set(c) == {'supabaseUrl', 'publishableKey'}, 'Only public project configuration belongs here.'
if c['supabaseUrl'] or c['publishableKey']:
    u = urlsplit(c['supabaseUrl'])
    assert u.scheme == 'https' and u.hostname and not (
                u.username or u.password or u.query or u.fragment) and u.path in ('', '/'), 'Use the HTTPS project URL.'
    assert re.fullmatch(r'sb_publishable_[A-Za-z0-9_-]+',
                        c['publishableKey']), 'Only a publishable key may be deployed.'
if (r / 'dist').exists(): shutil.rmtree(r / 'dist')
lab_config = json.loads((r / 'web/assets/lab-service.json').read_text())
assert set(lab_config) == {'checkURL'}, 'Only the public check endpoint belongs in lab-service.json.'
if lab_config['checkURL']:
    u = urlsplit(lab_config['checkURL'])
    assert u.scheme == 'https' and u.netloc == urlsplit(
        c['supabaseUrl']).netloc and u.path == '/functions/v1/classroom-lab/check' and not (
                u.username or u.password or u.query or u.fragment), 'Use this Supabase project\'s HTTPS classroom-lab/check endpoint.'
shutil.copytree(r / 'web', r / 'dist', ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))


def asset_stamp(directory):
    # Content stamp of the shipped assets; check.py must compute it the same way.
    h = hashlib.sha256()
    for p in sorted(directory.rglob('*')):
        if p.is_file() and '__pycache__' not in p.parts and p.suffix != '.pyc':
            h.update(p.relative_to(directory).as_posix().encode())
            h.update(hashlib.sha256(p.read_bytes()).digest())
    return h.hexdigest()[:12]


version = asset_stamp(r / 'web' / 'assets')
for p in (r / 'dist').rglob('*'):
    if p.suffix not in ('.html', '.css', '.js', '.mjs'):
        continue
    text = p.read_text()
    if p.suffix == '.html':
        text = re.sub(r'((?:href|src)="[^"]*assets/[^"]*\.(?:css|js|mjs))"',
                      r'\1?v=' + version + '"', text)
    p.write_text(re.sub(r'\?v=[A-Za-z0-9._-]*', '?v=' + version, text))
print(f'Built public classroom application with asset version {version}; private material is fetched after authorization.')
