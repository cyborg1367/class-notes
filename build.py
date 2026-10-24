from pathlib import Path
import shutil,json,re
from urllib.parse import urlsplit
from build_assets import prepare_public_assets
r=Path(__file__).resolve().parent
c=json.loads((r/'web/assets/auth-config.json').read_text())
assert set(c)=={'supabaseUrl','publishableKey'}, 'Only public project configuration belongs here.'
if c['supabaseUrl'] or c['publishableKey']:
 u=urlsplit(c['supabaseUrl'])
 assert u.scheme=='https' and u.hostname and not (u.username or u.password or u.query or u.fragment) and u.path in ('','/'), 'Use the HTTPS project URL.'
 assert re.fullmatch(r'sb_publishable_[A-Za-z0-9_-]+',c['publishableKey']), 'Only a publishable key may be deployed.'
if (r/'dist').exists():shutil.rmtree(r/'dist')
lab_config=json.loads((r/'web/assets/lab-service.json').read_text())
assert set(lab_config)=={'checkURL'}, 'Only the public check endpoint belongs in lab-service.json.'
if lab_config['checkURL']:
 u=urlsplit(lab_config['checkURL'])
 assert u.scheme=='https' and u.netloc==urlsplit(c['supabaseUrl']).netloc and u.path=='/functions/v1/classroom-lab/check' and not (u.username or u.password or u.query or u.fragment), 'Use this Supabase project\'s HTTPS classroom-lab/check endpoint.'
shutil.copytree(r/'web',r/'dist',ignore=shutil.ignore_patterns('__pycache__','*.pyc','.DS_Store','.idea','lab-checks.py'))
version=prepare_public_assets(r,r/'dist')
print('Built public classroom application; private material is fetched after authorization.')
