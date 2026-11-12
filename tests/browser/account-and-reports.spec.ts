import {test,expect} from './fixtures/classroom';
import {quizLesson} from './fixtures/content';
import {expectPageLayout} from './fixtures/assertions';
test('dashboard survives reload and sign-out removes personal content',async({page})=>{
 await page.goto('/dashboard/');await expect(page.locator('[data-dashboard-lesson]')).toHaveCount(4);await expectPageLayout(page);
 await page.reload();await expect(page.locator('[data-dashboard-lesson]')).toHaveCount(4);await page.locator('[data-account-trigger]').click();
 const menu=page.locator('[role="menu"][aria-label="عملیات حساب"]');await expect(menu).toBeVisible();await expectPageLayout(page);
 await menu.getByRole('menuitem',{name:'خروج از حساب'}).click();await expect(page).toHaveURL(/\/(?:index\.html)?$/);await expect(page.locator('[data-account-signin]').first()).toBeVisible();
 await page.goto('/dashboard/');await expect(page.locator('[data-login-link]').first()).toBeVisible();await expect(page.locator('[data-dashboard-lesson]')).toHaveCount(0);
});
test('a backend failure stays distinct from sign-in and the dashboard can retry',async({page,classroom})=>{
 classroom.failBootstrap=true;await page.goto('/dashboard/');await expect(page.getByRole('heading',{name:'اطلاعات کلاس دریافت نشد.'})).toBeVisible();
 await expect(page.locator('[data-dashboard] [data-login-link]')).toHaveCount(0);classroom.failBootstrap=false;await page.locator('[data-dashboard-retry]').click();await expect(page.locator('[data-dashboard-lesson]')).toHaveCount(4);await expectPageLayout(page);
});
test('notification count is visible before opening the inbox',async({page})=>{
 await page.goto('/dashboard/');await expect(page.locator('.notice-badge').first()).toBeVisible();await page.goto('/notifications/');await expect(page.getByText('یادداشت تازه منتشر شد',{exact:true}).first()).toBeVisible();await expectPageLayout(page);
});
test('a student cannot mount instructor reports',async({page,classroom})=>{
 await page.goto('/instructor/');await expect(page.getByRole('heading',{name:'دسترسی مدرس لازم است.'})).toBeVisible();await expect(page.locator('[data-react-instructor]')).toHaveCount(0);expect(classroom.calls.some(c=>c.name.startsWith('classroom_instructor_'))).toBe(false);
});
test('quiz drafts survive reload and a confirmed submission displays its receipt',async({page,classroom})=>{
 await page.goto('/quiz/'+quizLesson.id+'/');await page.locator('[data-start]').click();await page.locator('[data-question="choice"][value="a"]').check();await page.locator('[data-blank="op"]').fill('<');await page.locator('[data-blank="limit"]').fill('۹');
 await expect(page.locator('[data-answer-count]')).toContainText('2 از 2');await expectPageLayout(page);await page.reload();await page.locator('[data-start]').click();
 await expect(page.locator('[data-question="choice"][value="a"]')).toBeChecked();await expect(page.locator('[data-blank="op"]')).toHaveValue('<');await expect(page.locator('[data-blank="limit"]')).toHaveValue('۹');
 await page.locator('[data-submit]').click();await expect(page.locator('[data-review]')).toBeVisible();await page.locator('[data-confirm-submit]').click();await expect(page.locator('[data-react-quiz-result]')).toBeVisible();
 expect(classroom.calls.filter(c=>c.name==='classroom_submit')).toHaveLength(1);expect(classroom.calls.find(c=>c.name==='classroom_submit')!.args.p_answers.fill.limit).toBe('9');await expectPageLayout(page);
 await test.info().attach('quiz-result-layout',{body:await page.screenshot({fullPage:true,scale:'css'}),contentType:'image/png'});
});
test('the personal notebook renders its account-scoped notes',async({page})=>{
 await page.goto('/review/');await expect(page.getByText('یادداشت آزمایشی من',{exact:true})).toBeVisible();await expectPageLayout(page);
});
test.describe('teacher',()=>{
 test.use({classroomRole:'teacher'});
 test('overview, student details and saved answers work',async({page})=>{
  await page.goto('/instructor/');await expect(page.locator('.teacher-metrics')).toBeVisible();await expectPageLayout(page);
  await page.locator('[data-view="students"]').click();await page.getByRole('button',{name:'پروندهٔ سارا رضایی'}).click();await expect(page.locator('[data-detail][open]')).toBeVisible();await expectPageLayout(page);
  await page.locator('[data-detail] .attempt-link').click();await expect(page.locator('.instructor-answer-table')).toBeVisible();await page.getByRole('button',{name:'بستن جزئیات'}).click();await expect(page.locator('[data-detail]')).not.toBeVisible();
 });
});
