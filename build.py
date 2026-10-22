from pathlib import Path
import shutil,json,re
from urllib.parse import urlsplit
r=Path(__file__).resolve().parent
c=json.loads((r/'web/assets/auth-config.json').read_text())
assert set(c)=={'supabaseUrl','publishableKey'}, 'Only public project configuration belongs here.'
if c['supabaseUrl'] or c['publishableKey']:
 u=urlsplit(c['supabaseUrl'])
 assert u.scheme=='https' and u.hostname and not (u.username or u.password or u.query or u.fragment) and u.path in ('','/'), 'Use the HTTPS project URL.'
 assert re.fullmatch(r'sb_publishable_[A-Za-z0-9_-]+',c['publishableKey']), 'Only a publishable key may be deployed.'
if (r/'dist').exists():shutil.rmtree(r/'dist')
shutil.copytree(r/'web',r/'dist',ignore=shutil.ignore_patterns('__pycache__','*.pyc'))
print('Built public classroom application; private material is fetched after authorization.')
