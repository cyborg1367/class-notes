from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re
ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='html':assert a.get('lang')=='fa' and a.get('dir')=='rtl'
  if a.get('id'):self.ids.append(a['id'])
  for k in ['src','href']:
   if a.get(k):self.links.append(a[k])
pages={}
for p in DIST.rglob('*.html'):
 q=Page();q.feed(p.read_text());assert len(q.ids)==len(set(q.ids)),p;pages[p.resolve()]=q
for p,q in pages.items():
 for value in q.links:
  u=urlsplit(value)
  if u.scheme or u.netloc:continue
  assert not u.path.startswith('/'),value
  target=(p.parent/unquote(u.path)).resolve() if u.path else p
  if target.is_dir():target=target/'index.html'
  assert target.exists(),(p,value)
  if u.fragment and target.suffix=='.html':assert u.fragment in pages[target].ids,(p,value)
for p in DIST.rglob('*.css'):
 for v in re.findall(r'url\([\'\"]?([^\)\'\"]+)',p.read_text()):
  if not v.startswith(('data:','http:','https:')):assert (p.parent/urlsplit(v).path).exists(),(p,v)
assert not list(DIST.rglob('*.pdf')),'Private PDFs cannot be in the public build'
assert not list(DIST.rglob('*.ipynb')),'Private notebooks cannot be in the public build'
for p in DIST.rglob('*'):
 if p.is_file() and p.suffix in ['.html','.js','.mjs','.json','.py']:
  s=p.read_text()
  assert 'vd-05' not in s and 'kn-05' not in s,'Quiz bank leaked'
  assert 'q_new = np.array' not in s,'Lesson source leaked'
lab=DIST/'lab/machine-learning/vector-distance/index.html'
assert lab.exists(),'Missing first-lesson lab route'
assert 'data-page="lab"' in lab.read_text(),'Lab must use the existing authentication router'
assert 'data-gate' in lab.read_text(),'Lab route must start gated'
assert not list(DIST.rglob('__pycache__')),'Do not ship Python bytecode caches'
for asset in ['coding-lab.js','coding-lab.css','coding-lab-model.mjs','coding-lab-classification.mjs','coding-lab-layout.mjs','lab-paper-grain.svg','coding-lab-worker.mjs','lab-service.json']:
 assert (DIST/'assets'/asset).exists(),('Missing lab dependency',asset)
print(f'Checked {len(pages)} RTL routes, local links/assets, and public/private separation.')

assert not (DIST/"server").exists(), "Trusted server code must not ship as website content"
assert not (DIST/"supabase").exists(), "Edge Function source must stay in the instructor package"
assert not any(p.name.startswith('.env') for p in DIST.rglob('*')), 'Do not publish environment files'
for p in DIST.rglob('*'):
 if p.is_file() and p.suffix in ['.json','.js','.mjs','.html','.py']:
  assert not re.search(r'sb_secret_[A-Za-z0-9_-]{20,}',p.read_text()), 'A server-only key is present in the public build'
  assert not re.search(r'\be2b_[A-Za-z0-9_-]{20,}',p.read_text()), 'An E2B key is present in the public build'

second=DIST/'lab/machine-learning/prediction-problem/index.html'
assert second.exists() and 'data-page="lab"' in second.read_text() and 'data-gate' in second.read_text(),'Missing gated second-lesson lab'
