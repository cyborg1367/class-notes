import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

export async function prerenderHome(root, renderer, catalog, catalogBytes) {
  const filename = path.join(root, 'web/index.html');
  const original = await readFile(filename, 'utf8');
  const html = renderer.renderHome(catalog);
  let updated = original.replace(/<main\b[^>]*id="main"[^>]*>[\s\S]*?<\/main>/,
    () => '<main id="main" data-home-react-root=""><!-- home-react:start -->' + html + '<!-- home-react:end --></main>');
  if (!updated.includes('data-home-react-root')) throw new Error('MISSING_HOME_REACT_SLOT');

  // These renderers must not attach a second owner to React's homepage DOM.
  updated = updated.replace(/<script defer src="assets\/(?:space3d|scroll-motion)\.js[^"\n]*"><\/script>/g, '');
  if (!updated.includes('data-home-ui')) {
    updated = updated.replace('</head>', '<script type="module" data-home-ui src="assets/homepage.js?v=build"></script></head>');
  }
  if (!updated.includes('assets/homepage.css')) {
    updated = updated.replace('</head>', '<link rel="stylesheet" href="assets/homepage.css?v=build"></head>');
  }
  if (updated !== original) await writeFile(filename, updated, 'utf8');

  await writeFile(path.join(root, 'frontend/generated/home-page.json'), JSON.stringify({
    catalog_sha256: createHash('sha256').update(catalogBytes).digest('hex'),
    html,
  }) + '\n', 'utf8');
  console.log('Prerendered the React homepage from the canonical public catalog.');
}
