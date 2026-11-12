import {test,expect} from './fixtures/classroom';
import {course,firstLesson} from './fixtures/content';
import {expectPageLayout,openLab} from './fixtures/assertions';
for(const lesson of course.lessons)test(`lab ${lesson.number}: title, filename and toolbar layout`,async({page})=>{
 await openLab(page,'/'+lesson.lab.path);await expect(page.locator('.lab-mission-header h1')).toHaveText(lesson.lab.title);
 await expect(page.locator('.lab-filename')).not.toHaveText(/undefined|^$/);await expect(page.locator('.lab-filename')).toHaveCSS('direction','ltr');
 await expect(page.locator('[data-run]')).toBeVisible();await expect(page.locator('[data-check]')).toBeVisible();await expectPageLayout(page);
});
test('editing, worker messages and reload preserve code without granting XP',async({page,classroom})=>{
 await openLab(page,'/'+firstLesson.lab.path);const code='# browser draft\nprint("hello")';await page.locator('#lab-code').fill(code);await page.locator('[data-run]').click();
 await expect(page.locator('[data-output]')).toContainText('browser fixture output');await expect.poll(()=>classroom.calls.filter(c=>c.name==='classroom_lab_save').length).toBeGreaterThan(0);
 expect(classroom.grades).toEqual([]);expect(classroom.snapshots.get(firstLesson.lab.mission)!.xp).toBe(0);
 await page.reload();await expect(page.locator('#lab-code')).toHaveValue(code);
});
test('malformed grading preserves code and retry reuses the submission ID',async({page,classroom})=>{
 classroom.failGrading=true;await openLab(page,'/'+firstLesson.lab.path);const code='# preserve me\nprint(42)';await page.locator('#lab-code').fill(code);await page.locator('[data-check]').click();
 await expect(page.getByRole('heading',{name:'ارتباط بررسی کامل نشد'})).toBeVisible();expect(classroom.grades).toHaveLength(1);expect(classroom.snapshots.get(firstLesson.lab.mission)!.xp).toBe(0);
 await page.getByRole('button',{name:/برگشت به کد/}).click();await expect(page.locator('#lab-code')).toHaveValue(code);classroom.failGrading=false;await page.locator('[data-check]').click();
 await expect.poll(()=>classroom.grades.length).toBe(2);expect(classroom.grades[1].request_id).toBe(classroom.grades[0].request_id);
 await expect.poll(()=>classroom.snapshots.get(firstLesson.lab.mission)!.xp).toBe(30);await expectPageLayout(page);
});
test('a failed cloud save still restores the browser draft after reload',async({page,classroom})=>{
 classroom.failSaves=true;await openLab(page,'/'+firstLesson.lab.path);const code='# offline draft\nprint(7)';await page.locator('#lab-code').fill(code);
 await expect.poll(()=>classroom.calls.filter(c=>c.name==='classroom_lab_save').length).toBeGreaterThan(0);await page.reload();await expect(page.locator('#lab-code')).toHaveValue(code);
 expect(classroom.grades).toEqual([]);expect(classroom.snapshots.get(firstLesson.lab.mission)!.xp).toBe(0);
});
