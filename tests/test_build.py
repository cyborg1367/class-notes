"""Public build contracts; synthetic fixtures only, standard library only."""
import unittest,tempfile,shutil,subprocess,json,hashlib,re
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from build_assets import asset_version,prepare_public_assets,with_version

ROOT=Path(__file__).resolve().parents[1]

class PublicBuildTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
  for name in ['build.py','build_assets.py']:shutil.copyfile(ROOT/name,self.root/name)
  (self.root/'web/assets').mkdir(parents=True)
  self.assets=self.root/'web/assets'
  (self.assets/'catalog.json').write_text(json.dumps([{'id':'course','lessons':[{'id':'course/one'}]}]))
  (self.assets/'app.js').write_text("const version='?v=build';")
  (self.assets/'font.woff2').write_bytes(b'synthetic font fixture')
  (self.assets/'style.css').write_text("body{background:url('mark.svg');} @font-face{src:url('font.woff2')}")
  (self.assets/'mark.svg').write_text('<svg/>')
  (self.assets/'auth-config.json').write_text('{"supabaseUrl":"","publishableKey":""}')
  (self.assets/'lab-service.json').write_text('{"checkURL":""}')
  (self.root/'web/index.html').write_text('<html><head><link href="assets/style.css?v=old"><script src="assets/app.js?v=other"></script></head><body><p>UNCHANGED CONTENT</p><script id="catalog-data" type="application/json"></script></body></html>')
 def tearDown(self):self.temp.cleanup()
 def build(self):
  d=self.root/'dist';shutil.rmtree(d,ignore_errors=True);shutil.copytree(self.root/'web',d);v=prepare_public_assets(self.root,d);return d,v
 def test_repeated_build_is_byte_deterministic(self):
  d,v=self.build();first={str(p.relative_to(d)):p.read_bytes() for p in d.rglob('*') if p.is_file()};d,w=self.build();self.assertEqual(v,w);self.assertEqual(first,{str(p.relative_to(d)):p.read_bytes() for p in d.rglob('*') if p.is_file()})
 def test_dependency_change_invalidates_shared_fingerprint(self):
  old=asset_version(self.root);(self.assets/'app.js').write_text('changed');self.assertNotEqual(old,asset_version(self.root))
 def test_build_logic_change_invalidates_fingerprint(self):
  old=asset_version(self.root);(self.root/'build_assets.py').write_text('# changed transform');self.assertNotEqual(old,asset_version(self.root))
 def test_public_config_is_not_turned_into_a_long_lived_asset(self):
  old=asset_version(self.root);(self.assets/'lab-service.json').write_text('{"checkURL":"updated"}');self.assertEqual(old,asset_version(self.root))
 def test_catalog_injected_without_network_request_or_body_change(self):
  d,v=self.build();s=(d/'index.html').read_text();self.assertIn('<p>UNCHANGED CONTENT</p>',s);self.assertIn('course/one',s);self.assertIn('assets/style.css?v='+v,s);self.assertIn('assets/app.js?v='+v,s);self.assertIn('?v='+v,(d/'assets/app.js').read_text())
 def test_css_and_font_urls_share_preload_version(self):
  d,v=self.build();s=(d/'assets/style.css').read_text();self.assertIn('font.woff2?v='+v,s);self.assertIn('mark.svg?v='+v,s)
 def test_manifest_matches_emitted_bytes(self):
  d,v=self.build();m=json.loads((d/'assets/asset-manifest.json').read_text());self.assertNotIn('assets/asset-manifest.json',m['files']);self.assertNotIn('assets/auth-config.json',m['files']);self.assertNotIn('assets/lab-service.json',m['files'])
  for file,digest in m['files'].items():self.assertEqual(digest,hashlib.sha256((d/file).read_bytes()).hexdigest())
 def test_duplicate_catalog_ids_fail_before_publish(self):
  (self.assets/'catalog.json').write_text('[{"lessons":[{"id":"same"},{"id":"same"}]}]')
  with self.assertRaisesRegex(AssertionError,'Duplicate lesson'):self.build()
 def test_nested_route_sdk_preload_matches_runtime_url(self):
  p=self.root/'web/lab/course/one/index.html';p.parent.mkdir(parents=True);p.write_text((self.root/'web/index.html').read_text().replace('assets/','../../../assets/'))
  sdk=self.assets/'vendor/supabase/supabase.js';sdk.parent.mkdir(parents=True);sdk.write_text('sdk');(self.assets/'auth-config.json').write_text('{"supabaseUrl":"https://project.example","publishableKey":"public"}')
  d,v=self.build();self.assertIn('../../../assets/vendor/supabase/supabase.js?v='+v,(d/'lab/course/one/index.html').read_text())
 def test_external_and_fragment_urls_not_rewritten(self):
  p=self.root/'web/index.html';p.write_text(p.read_text().replace('</head>','<script src="https://example.test/sdk.js?v=pinned"></script></head>').replace('</body>','<a href="#section">jump</a></body>'));d,v=self.build();self.assertIn('https://example.test/sdk.js?v=pinned',(d/'index.html').read_text());self.assertIn('href="#section"',(d/'index.html').read_text())
 def test_legacy_grader_and_editor_noise_are_excluded(self):
  (self.assets/'lab-checks.py').write_text('legacy grader')
  (self.assets/'.DS_Store').write_bytes(b'editor noise')
  result=subprocess.run([sys.executable,str(self.root/'build.py')],capture_output=True,text=True)
  self.assertEqual(result.returncode,0,result.stderr)
  self.assertFalse((self.root/'dist/assets/lab-checks.py').exists())
  self.assertFalse((self.root/'dist/assets/.DS_Store').exists())
 def test_query_and_fragment_preserved(self):self.assertEqual(with_version('a.css?theme=paper&v=old#x','new'),'a.css?theme=paper&v=new#x')

if __name__=='__main__':unittest.main()


class LabCatalogTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
  (self.root/'assets').mkdir();(self.root/'lab/course/one').mkdir(parents=True)
  (self.root/'lab/course/one/index.html').write_text('<html></html>')
  (self.root/'assets/coding-lab-example.mjs').write_text("export const missionId='stable-v1';")
  self.lab={'mission':'stable-v1','title':'Lab','path':'lab/course/one/','model':'coding-lab-example.mjs','bridge':'Apply the lesson to fresh data.'}
  self.catalog=[{'lessons':[{'id':'course/one','lab':self.lab}]}]
 def tearDown(self):self.temp.cleanup()
 def validate(self):
  from build_assets import validate_catalog
  validate_catalog(self.catalog,self.root)
 def test_valid_lab_and_lessons_without_labs(self):
  self.catalog[0]['lessons'].append({'id':'course/two'});self.validate()
 def test_wrong_model_mission_cannot_publish(self):
  self.lab['mission']='different-v1'
  with self.assertRaisesRegex(AssertionError,'model mission'):self.validate()
 def test_missing_model_cannot_publish(self):
  self.lab['model']='coding-lab-missing.mjs'
  with self.assertRaisesRegex(AssertionError,'lab model'):self.validate()
 def test_wrong_or_missing_route_cannot_publish(self):
  self.lab['path']='lab/course/two/'
  with self.assertRaisesRegex(AssertionError,'lab route'):self.validate()
 def test_duplicate_mission_cannot_publish(self):
  self.catalog[0]['lessons'].append({'id':'course/two','lab':dict(self.lab)})
  with self.assertRaisesRegex(AssertionError,'Duplicate lab mission'):self.validate()
 def test_external_model_cannot_publish(self):
  self.lab['model']='https://example.org/model.mjs'
  with self.assertRaisesRegex(AssertionError,'lab model'):self.validate()
 def test_current_catalog_preserves_existing_mission_identity(self):
  catalog=json.loads((ROOT/'web/assets/catalog.json').read_text())
  labs={l['id']:l['lab'] for c in catalog for l in c['lessons'] if l.get('lab')}
  self.assertEqual(labs['machine-learning/vector-distance']['mission'],'greenhouse-v1')
  self.assertEqual(labs['machine-learning/prediction-problem']['mission'],'quality-knn-v1')
  source=(ROOT/'web/assets/portal.js').read_text()
  self.assertNotIn('greenhouse-v1',source);self.assertNotIn('quality-knn-v1',source)
 def test_dashboard_skill_must_reference_a_real_task(self):
  self.catalog[0]['lessons'][0]['practice_skills']=[{'task':'made-up','label':'Unverified skill'}]
  with self.assertRaisesRegex(AssertionError,'dashboard task'):self.validate()
 def test_dashboard_steps_accept_public_task_contracts(self):
  (self.root/'assets/coding-lab-example.mjs').write_text("export const missionId='stable-v1'; export const stages=[{id:'inspect'}];")
  lesson=self.catalog[0]['lessons'][0]
  lesson['lab_steps']=[{'id':'inspect','title':'Inspect data'}]
  lesson['practice_skills']=[{'task':'inspect','label':'Data shape'}]
  lesson['dashboard_art']='greenhouse'
  self.validate()
