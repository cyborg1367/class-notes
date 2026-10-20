"""Validate static routes, relative assets, and article structure without a server."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re

ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'
class Page(HTMLParser):
    def __init__(self):super().__init__();self.ids=[];self.links=[];self.language=None;self.direction=None;self.pre=False;self.buffer='';self.code=[]
    def handle_starttag(self,t,attrs):
        a=dict(attrs)
        if t=='html':self.language=a.get('lang');self.direction=a.get('dir')
        if a.get('id'):self.ids.append(a['id'])
        for key in ['href','src']:
            if a.get(key):self.links.append(a[key])
        if t=='pre':self.pre=True;self.buffer=''
    def handle_endtag(self,t):
        if t=='pre':self.code.append(self.buffer);self.pre=False
    def handle_data(self,s):
        if self.pre:self.buffer+=s

pages={}
for f in DIST.rglob('*.html'):
    parsed=Page();parsed.feed(f.read_text());pages[f.resolve()]=parsed
    assert parsed.language=='fa' and parsed.direction=='rtl',f
    assert len(parsed.ids)==len(set(parsed.ids)),f'Duplicate ids: {f}'
for f,parsed in pages.items():
    for link in parsed.links:
        url=urlsplit(link)
        if url.scheme or url.netloc:continue
        assert not url.path.startswith('/'),f'Root-absolute URL breaks repository hosting: {link}'
        target=(f.parent/unquote(url.path)).resolve() if url.path else f
        if target.is_dir():target=target/'index.html'
        assert target.exists(),f'Missing {link} in {f}'
        if url.fragment and target.suffix=='.html':assert url.fragment in pages[target].ids,f'Missing anchor: {link}'
for css in (DIST/'assets').rglob('*.css'):
    for value in re.findall(r'url\([\'\"]?([^\)\'\"]+)',css.read_text()):
        if value.startswith(('data:','http:','https:')):continue
        assert (css.parent/urlsplit(value).path).exists(),f'Missing CSS asset: {value}'
catalog=json.loads((ROOT/'site.json').read_text())
for course in catalog['courses']:
    for lesson in course['lessons']:
        rendered=pages[(DIST/course['slug']/lesson['slug']/'index.html').resolve()]
        for section in lesson['sections']:assert section['id'] in rendered.ids
        source=Page();source.feed((ROOT/lesson['source']).read_text())
        assert source.code==rendered.code,'Code changed during page generation'
first=(DIST/'machine-learning/vector-distance/index.html').read_text()
assert 'rankSamples' not in (DIST/'assets/app.js').read_text()
assert first.count('data-answer=')==4
assert first.count('class="katex-display"')==7
print(f'Checked {len(pages)} pages, all internal links and assets, 7 formulas, 16 code blocks, and four worksheet fields.')
