import ast,hashlib,json,re,sys,tempfile,shutil,unittest
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from build_assets import prepare_public_assets

class Cards(HTMLParser):
 def __init__(self,text):super().__init__();self.rows=[];self.li=0;self.links=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='li':self.li+=1
  if 'data-course-lesson' in attrs:self.rows.append((self.li,attrs['data-course-lesson']))
  if tag=='a':self.links.append(attrs)

class CourseIndexTests(unittest.TestCase):
 def test_four_prerendered_cards_have_independent_rows_and_existing_destinations(self):
  text=(ROOT/'web/machine-learning/index.html').read_text(encoding='utf-8');cards=Cards(text)
  catalog=json.loads((ROOT/'web/assets/catalog.json').read_text(encoding='utf-8'))[0]
  self.assertEqual([row[1] for row in cards.rows],[lesson['id'] for lesson in catalog['lessons']])
  self.assertEqual(len({row[0] for row in cards.rows}),4)
  for lesson in catalog['lessons']:
   self.assertTrue(any(link.get('href')=='../'+lesson['lab']['path'] for link in cards.links))
 def test_initial_html_has_no_private_receipts_or_personal_results_link(self):
  text=(ROOT/'web/machine-learning/index.html').read_text(encoding='utf-8')
  self.assertNotIn('data-course-results-link',text)
  self.assertNotIn('data-course-result=',text)
  self.assertNotIn('data-login-link',text)
  self.assertIn('بررسی دسترسی',text)
 def test_generated_course_is_bound_to_the_exact_catalog(self):
  value=json.loads((ROOT/'frontend/generated/course-pages.json').read_text(encoding='utf-8'))
  self.assertEqual(value['catalog_sha256'],hashlib.sha256((ROOT/'web/assets/catalog.json').read_bytes()).hexdigest())
  text=(ROOT/'web/machine-learning/index.html').read_text(encoding='utf-8')
  self.assertIn(value['pages']['machine-learning'],text)
 def test_stale_catalog_cannot_silently_ship_old_react_content(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);(root/'web/assets').mkdir(parents=True);(root/'frontend/generated').mkdir(parents=True)
   for name in ['build.py','build_assets.py']:shutil.copyfile(ROOT/name,root/name)
   catalog=[{'id':'course','lessons':[{'id':'course/note'}]}]
   (root/'web/assets/catalog.json').write_text(json.dumps(catalog),encoding='utf-8')
   (root/'web/assets/auth-config.json').write_text('{"supabaseUrl":"","publishableKey":""}',encoding='utf-8')
   (root/'web/course').mkdir();(root/'web/course/index.html').write_text('<!-- course-react:start --><!-- course-react:end --><script id="catalog-data" type="application/json"></script>',encoding='utf-8')
   (root/'frontend/generated/course-pages.json').write_text('{"catalog_sha256":"stale","pages":{"course":"old"}}',encoding='utf-8')
   shutil.copytree(root/'web',root/'dist')
   with self.assertRaisesRegex(AssertionError,'Catalog changed'):prepare_public_assets(root,root/'dist')
 def test_all_build_and_check_text_io_is_explicit_utf8_on_windows(self):
  for name in ['build.py','build_assets.py','check.py']:
   for node in ast.walk(ast.parse((ROOT/name).read_text(encoding='utf-8'))):
    if isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute) and node.func.attr in {'read_text','write_text'}:
     self.assertTrue(any(k.arg=='encoding' and isinstance(k.value,ast.Constant) and k.value.value.lower()=='utf-8' for k in node.keywords),(name,node.lineno))
 def test_other_route_shells_do_not_load_the_course_runtime(self):
  for page in (ROOT/'web').rglob('*.html'):
   if page.parent.name!='machine-learning':self.assertNotIn('course-index.js',page.read_text(encoding='utf-8'))

if __name__=='__main__':unittest.main()
