"""Release contracts for shared React shell output and stale-source rejection."""
import hashlib,json,re,shutil,tempfile,unittest
from pathlib import Path
from build_assets import prepare_public_assets

ROOT=Path(__file__).resolve().parents[1]


class SharedShellTests(unittest.TestCase):
    def test_every_route_has_shared_shell_data_and_one_module_entry(self):
        for page in (ROOT/'web').rglob('*.html'):
            with self.subTest(page=page):
                source=page.read_text(encoding='utf-8')
                data=re.search(r'<script id="site-shell-data" type="application/json">(.*?)</script>',source,re.S)
                self.assertIsNotNone(data)
                self.assertEqual(json.loads(data[1])['route'],page.relative_to(ROOT/'web').as_posix())
                self.assertEqual(source.count('data-site-header-root'),1)
                self.assertEqual(source.count('data-site-footer-root'),1)
                self.assertEqual(source.count('data-site-ui'),1)
                self.assertRegex(source,r'<script type="module" data-site-ui src="[^\"]*site-shell\.js\?v=build">')
                self.assertIn('data-shell-account-slot',source)
                self.assertIn('data-shell-presence-slot',source)

    def test_modified_component_source_cannot_ship_stale_prerendered_shell(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            for name in ['build.py','build_assets.py']:
                shutil.copyfile(ROOT/name,root/name)
            (root/'web/assets').mkdir(parents=True)
            (root/'web/assets/catalog.json').write_text('[{"id":"course","lessons":[]}]',encoding='utf-8')
            (root/'web/assets/auth-config.json').write_text('{"supabaseUrl":"","publishableKey":""}',encoding='utf-8')
            (root/'web/index.html').write_text('<header data-site-header-root><!-- site-header:start -->old<!-- site-header:end --></header><footer><!-- site-footer:start -->old<!-- site-footer:end --></footer><script id="catalog-data" type="application/json"></script>',encoding='utf-8')
            (root/'frontend/generated').mkdir(parents=True)
            component=root/'frontend/site-shell.tsx'
            component.write_text('first version',encoding='utf-8')
            digest=hashlib.sha256(b'frontend/site-shell.tsx\0first version\0').hexdigest()
            (root/'frontend/generated/site-shells.json').write_text(json.dumps({'source_files':['frontend/site-shell.tsx'],'source_sha256':digest,'shells':{'index.html':{'header':'new header','footer':'new footer'}}}),encoding='utf-8')
            shutil.copytree(root/'web',root/'dist')
            prepare_public_assets(root,root/'dist')
            self.assertIn('new header',(root/'dist/index.html').read_text(encoding='utf-8'))
            component.write_text('changed component',encoding='utf-8')
            shutil.rmtree(root/'dist')
            shutil.copytree(root/'web',root/'dist')
            with self.assertRaisesRegex(AssertionError,'React shell sources changed'):
                prepare_public_assets(root,root/'dist')
