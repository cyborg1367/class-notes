from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re
ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=[];self.course_cards=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='article' and 'data-home-course' in a:self.course_cards.append(a)
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
for asset in ['coding-lab.js','coding-lab.css','coding-lab-model.mjs','coding-lab-classification.mjs','coding-lab-layout.mjs','coding-lab-experience.mjs','lab-paper-grain.svg','coding-lab-worker.mjs','lab-service.json']:
 assert (DIST/'assets'/asset).exists(),('Missing lab dependency',asset)
print(f'Checked {len(pages)} RTL routes, local links/assets, and public/private separation.')

assert not (DIST/"server").exists(), "Trusted server code must not ship as website content"
assert not (DIST/"supabase").exists(), "Edge Function source must stay in the instructor package"
assert not any(p.name.startswith('.env') for p in DIST.rglob('*')), 'Do not publish environment files'
review=DIST/'review/index.html'
assert review.exists() and 'data-page="review"' in review.read_text() and 'data-review-root' in review.read_text(),'Missing authenticated personal notebook route'
for asset in ['review.mjs','review.css']:
 assert (DIST/'assets'/asset).exists(),('Missing review dependency',asset)
notices=DIST/'notifications/index.html'
assert notices.exists() and 'data-page="notifications"' in notices.read_text() and 'data-notifications-page' in notices.read_text(),'Missing authenticated notifications route'
for asset in ['notifications.mjs','notifications.css']:
 assert (DIST/'assets'/asset).exists(),('Missing notification dependency',asset)
for p in pages:
 assert 'notifications.css' in p.read_text(),('Missing shared notification styles',p)
assert not (DIST/'classroom_notice_private').exists(),'Notification server tables cannot ship publicly'
assert not any('reviewbank' in p.read_text() for p in DIST.rglob('*') if p.is_file() and p.suffix in ['.js','.mjs','.json','.html']), 'Private retrieval bank leaked'
for p in DIST.rglob('*'):
 if p.is_file() and p.suffix in ['.json','.js','.mjs','.html','.py']:
  assert not re.search(r'sb_secret_[A-Za-z0-9_-]{20,}',p.read_text()), 'A server-only key is present in the public build'
  assert not re.search(r'\bgsk_[A-Za-z0-9_-]{20,}',p.read_text()), 'A Groq API key is present in the public build'
  assert not re.search(r'\be2b_[A-Za-z0-9_-]{20,}',p.read_text()), 'An E2B key is present in the public build'

second=DIST/'lab/machine-learning/prediction-problem/index.html'
assert second.exists() and 'data-page="lab"' in second.read_text() and 'data-gate' in second.read_text(),'Missing gated second-lesson lab'

# Version drift and catalog drift must fail CI, not surprise students after deploy.
import json,hashlib
manifest=json.loads((DIST/'assets/asset-manifest.json').read_text())
version=manifest['version']
assert re.fullmatch(r'[a-f0-9]{16}',version),'Invalid asset fingerprint'
for name,digest in manifest['files'].items():
 assert hashlib.sha256((DIST/name).read_bytes()).hexdigest()==digest,('Asset changed after fingerprinting',name)
canonical=json.loads((DIST/'assets/catalog.json').read_text())
from build_assets import lesson_order
courses=[c for c in canonical if c.get('lessons')]
cards=pages[(DIST/'index.html').resolve()].course_cards
assert len(cards)==len(courses),'Homepage must contain one summary per published course'
for card,course in zip(cards,courses):
 lessons=course['lessons']
 latest=max(enumerate(lessons),key=lambda item:(lesson_order(item[1],item[0]),item[0]))[1]
 assert card['data-home-course']==course['id'],'Homepage course differs from catalog'
 assert card['data-latest-lesson']==latest['id'],'Homepage latest lesson is stale'
 assert int(card['data-note-count'])==len(lessons),'Homepage lesson count is stale'
 assert int(card['data-lab-count'])==sum(bool(l.get('lab')) for l in lessons),'Homepage lab count is stale'
 assert int(card['data-quiz-count'])==sum(type(l.get('quiz_version')) is int and l['quiz_version']>0 for l in lessons),'Homepage quiz count is stale'
for p,q in pages.items():
 s=p.read_text();m=re.search(r'<script id="catalog-data" type="application/json">(.*?)</script>',s,re.S)
 assert m and json.loads(m[1])==canonical,('Catalog differs from canonical source',p)
 for value in q.links:
  u=urlsplit(value)
  if u.scheme or u.netloc or not u.path:continue
  target=(p.parent/unquote(u.path)).resolve()
  if target.is_relative_to((DIST/'assets').resolve()) and target.suffix in {'.js','.mjs','.css','.woff2','.ttf','.svg','.png','.webp'}:
   from urllib.parse import parse_qs
   assert parse_qs(u.query).get('v')==[version],('Stale asset URL',p,value)
assert not (DIST/'assets/lab-checks.py').exists(),'Legacy browser grader must not ship'
print('Checked shared asset fingerprint, canonical catalog and obsolete-file exclusion.')
print('Checked generated homepage course counts and latest-note links.')
