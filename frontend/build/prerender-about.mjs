import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function prerenderAbout(root, renderer) {
  const filename = path.join(root, 'web/about/index.html');
  const original = await readFile(filename, 'utf8');
  const html = renderer.renderAbout();
  let updated = original.replace(/<main\b[^>]*id="main"[^>]*>[\s\S]*?<\/main>/,
    () => '<main id="main" data-about-react-root=""><!-- about-react:start -->' + html + '<!-- about-react:end --></main>');
  if (!updated.includes('data-about-react-root')) throw new Error('MISSING_ABOUT_REACT_SLOT');
  if (updated !== original) await writeFile(filename, updated, 'utf8');
  await writeFile(path.join(root, 'frontend/generated/about-page.json'), JSON.stringify({ html }) + '\n', 'utf8');
  console.log('Prerendered the React about page.');
}
