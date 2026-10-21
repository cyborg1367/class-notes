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
 if p.is_file() and p.suffix in ['.html','.js','.mjs','.json']:
  s=p.read_text()
  assert 'vd-05' not in s and 'kn-05' not in s,'Quiz bank leaked'
  assert 'q_new = np.array' not in s,'Lesson source leaked'
print(f'Checked {len(pages)} RTL routes, local links/assets, and public/private separation.')
