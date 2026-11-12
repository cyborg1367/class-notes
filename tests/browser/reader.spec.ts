import {test,expect} from './fixtures/classroom';
import {course} from './fixtures/content';
import {expectPageLayout} from './fixtures/assertions';
for(const[index,lesson]of course.lessons.entries())test(`lesson ${lesson.number}: template, assets, downloads and adjacent navigation`,async({page})=>{
 await page.goto('/'+lesson.id+'/');await expect(page.locator('[data-reader-document]')).toBeVisible();
 await expect(page.locator('main h1')).toHaveCount(1);await expect(page.locator('[data-lesson-start]')).toHaveCount(1);
 await expect(page.locator('[data-lesson-resources]')).toHaveCount(1);
 await expect.poll(()=>page.locator('img[data-private-path]').evaluate((node:HTMLImageElement)=>node.complete&&node.naturalWidth>0)).toBe(true);
 await expect(page.locator('#browser-code')).toHaveCSS('direction','ltr');await expectPageLayout(page);
 const previous=page.locator('[data-lesson-pager] a[rel="prev"]'),next=page.locator('[data-lesson-pager] a[rel="next"]');
 await expect(previous).toHaveCount(index>0?1:0);await expect(next).toHaveCount(index<course.lessons.length-1?1:0);
 for(const card of await page.locator('[data-lesson-pager] a').all()){
  const number=await card.locator('.reader-pager-number').boundingBox(),direction=await card.locator('.reader-pager-direction').boundingBox();
  expect(number!.x).toBeGreaterThan(direction!.x);
 }
 if(page.viewportSize()!.width>=1024){const copy=await page.locator('[data-lesson-hero] .hero-copy').boundingBox(),figure=await page.locator('[data-lesson-hero] .hero-figure').boundingBox();expect(figure!.x+figure!.width).toBeLessThanOrEqual(copy!.x+1);}
 const download=page.waitForEvent('download');await page.locator('[data-lesson-resources]').getByRole('button',{name:/دریافت PDF/}).click();expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
 if(index<course.lessons.length-1){await next.click();await expect(page).toHaveURL(new RegExp('/'+course.lessons[index+1].id+'/$'));await expect(page.locator('[data-reader-document]')).toBeVisible();}
});
test('reading progress responds to scrolling',async({page})=>{
 await page.goto('/'+course.lessons[0].id+'/');await expect(page.locator('[data-reader-document]')).toBeVisible();await page.locator('#sample-reflection').scrollIntoViewIfNeeded();
 await expect.poll(async()=>Number((await page.locator('#reader-reading-progress').getAttribute('style'))?.match(/scaleX\(([^)]+)\)/)?.[1]||0)).toBeGreaterThan(0);await expectPageLayout(page);
});
test.describe('pending member',()=>{
 test.use({classroomMembership:'pending'});
 test('keeps the lesson body unavailable',async({page,classroom})=>{
  await page.goto('/'+course.lessons[0].id+'/');await expect(page.locator('main')).toContainText('درخواست');
  await expect(page.locator('[data-reader-document]')).toHaveCount(0);expect(classroom.calls.some(c=>c.name==='classroom_lesson')).toBe(false);await expectPageLayout(page);
 });
});
