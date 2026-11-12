import {test,expect} from './fixtures/classroom';
import {course} from './fixtures/content';
import {expectPageLayout} from './fixtures/assertions';
test.use({classroomRole:'guest'});
test('the production homepage hydrates and navigates to the course',async({page})=>{
 await page.goto('/');
 await expect(page.locator('[data-site-header-root]')).toHaveAttribute('data-shell-mounted','true');
 await expect(page.locator('main h1')).toHaveCount(1);await expectPageLayout(page);
 await page.locator('main a[href="machine-learning/"]').first().click();
 await expect(page).toHaveURL(/\/machine-learning\/$/);
 await expect(page.locator('[data-course-lesson]')).toHaveCount(course.lessons.length);
});
test('search and topics filter the lesson cards and preserve lab links',async({page})=>{
 await page.goto('/machine-learning/');await expect(page.locator('.course-access-guest')).toBeVisible();
 await expect(page.locator('[data-course-lesson]')).toHaveCount(course.lessons.length);
 for(const lesson of course.lessons)await expect(page.locator(`[data-course-lesson="${lesson.id}"]`).getByRole('link',{name:`لابراتورِ ${lesson.title}`,exact:true})).toBeVisible();
 await page.getByRole('searchbox').fill('آستانه');await expect(page.locator('[data-course-lesson]')).toHaveCount(1);await expectPageLayout(page);
 await page.getByRole('button',{name:/پاک‌کردن فیلترها/}).click();
 await page.getByRole('combobox',{name:'انتخاب موضوع'}).selectOption({label:'NumPy'});await expect(page.locator('[data-course-lesson]')).toHaveCount(2);
 await page.getByRole('searchbox').fill('unfindable-fixture');await expect(page.locator('.course-search-empty')).toBeVisible();
 await page.getByRole('button',{name:/نمایش همهٔ یادداشت‌ها/}).click();await expect(page.locator('[data-course-lesson]')).toHaveCount(course.lessons.length);
});
test('a guest cannot read protected pages or trigger private RPCs',async({page,classroom})=>{
 for(const path of ['/dashboard/','/review/','/instructor/','/quiz/'+course.lessons[0].id+'/','/'+course.lessons[0].id+'/','/'+course.lessons[0].lab.path]){
  await page.goto(path);await expect(page.locator('[data-login-link]').first()).toBeVisible();
  await expect(page.locator('[data-reader-document], #lab-code, [data-react-instructor]')).toHaveCount(0);await expectPageLayout(page);
 }expect(classroom.calls).toEqual([]);
});
test('Google sign-in uses the local PKCE callback',async({page})=>{
 await page.goto('/account/');const button=page.locator('[data-account-react-root] [data-signin]');await expect(button).toBeEnabled();await button.click();
 await expect(page).toHaveURL(/^https:\/\/classroom-e2e\.supabase\.co\/auth\/v1\/authorize\?/);
 const url=new URL(page.url()),callback=new URL(url.searchParams.get('redirect_to')!);
 expect(url.searchParams.get('provider')).toBe('google');expect(callback.pathname).toBe('/account/');
 expect(callback.hostname).toBe('127.0.0.1');expect(url.searchParams.get('code_challenge_method')).toBe('s256');
});
test('mobile navigation closes with Escape and restores focus',async({page})=>{
 await page.goto('/machine-learning/');await expect(page.locator('[data-site-header-root]')).toHaveAttribute('data-shell-mounted','true');
 const toggle=page.locator('.nav-menu'),nav=page.getByRole('navigation',{name:'پیمایش اصلی'});
 if(await toggle.isVisible()){
  await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');await expect(nav).toBeVisible();await expectPageLayout(page);
  await page.keyboard.press('Escape');await expect(toggle).toHaveAttribute('aria-expanded','false');await expect(toggle).toBeFocused();
 }else await expect(nav).toBeVisible();
});
