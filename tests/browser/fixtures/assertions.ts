import { expect,type Page } from '@playwright/test';
export async function expectPageLayout(page:Page) {
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await page.evaluate(()=>document.fonts.ready);
  const sizes=await page.evaluate(()=>({width:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),viewport:document.documentElement.clientWidth}));
  expect(sizes.width,'The page itself must not scroll horizontally').toBeLessThanOrEqual(sizes.viewport+1);
}
export async function openLab(page:Page,path:string) {
  await page.goto(path);
  // This follows auth/bootstrap and lazy feature loading, not an immediate
  // interaction. Keep its budget above the application's individual deadlines.
  await expect(page.locator('[data-react-lab-frame]')).toBeAttached({timeout:20_000});
  const start=page.locator('[data-intro-start]');
  if(await start.isVisible())await start.click();
  await expect(page.locator('#lab-code')).toBeVisible();
}
