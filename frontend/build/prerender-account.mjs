import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function prerenderAccount(root, renderer) {
  const filename = path.join(root, 'web/account/index.html');
  const original = await readFile(filename, 'utf8');
  const html = renderer.renderAccountPage();
  const retry = '<section class="shell portal-main" data-account-startup-error hidden>' +
    '<header class="page-head"><h1>حساب کاربری</h1></header>' +
    '<div class="panel-card"><p class="status-line" role="alert">صفحهٔ حساب آماده نشد.</p>' +
    '<a class="button-outline" href="">بارگیری دوباره</a></div></section>';
  let updated = original.replace(/<main\b[^>]*id="main"[^>]*>[\s\S]*?<\/main>/,
    () => '<main id="main"><div data-account-react-root=""><!-- account-react:start -->' + html +
      '<!-- account-react:end --></div>' + retry + '</main>');
  if (!updated.includes('data-account-react-root')) throw new Error('MISSING_ACCOUNT_REACT_SLOT');
  if (!updated.includes('data-account-ui')) updated = updated.replace('</head>', '<script type="module" data-account-ui src="../assets/account-page.js?v=build"></script></head>');
  if (updated !== original) await writeFile(filename, updated, 'utf8');
  await writeFile(path.join(root, 'frontend/generated/account-page.json'), JSON.stringify({ html }) + '\n', 'utf8');
  console.log('Prerendered the neutral React account page.');
}
