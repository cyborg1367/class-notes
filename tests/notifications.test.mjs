import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {noticeURL,validNotice,mergeNotices} from '../web/assets/notifications.mjs';
const base='https://class.test/class-notes/';
test('notification destinations remain within this app for root and project hosting',()=>{
 assert.equal(noticeURL('lab/machine-learning/evaluating-knn/',base),base+'lab/machine-learning/evaluating-knn/');
 assert.equal(noticeURL('review/','https://class.test/'),'https://class.test/review/');
 for(const path of ['//evil.test/','https://evil.test/','../account/','review/?next=evil','review/#x','review/%2e%2e/','javascript:alert(1)','review/\\evil','Review/',''])assert.equal(noticeURL(path,base),null);
});
test('unsupported or unsafe notices cannot create links; history updates merge without duplicates',()=>{
 const item={id:'one',episode:'revision1',kind:'review',path:'review/'};
 assert.ok(validNotice(item,base));assert.ok(!validNotice({...item,kind:'unknown'},base));assert.ok(!validNotice({...item,path:'../private/'},base));
 assert.deepEqual(mergeNotices([item],[{...item,read_at:'now'},{...item,id:'two'}]).map(i=>[i.id,i.read_at]),[['one','now'],['two',undefined]]);
});
test('all page shells include the shared notification stylesheet and the history page is authenticated',()=>{
 const root=new URL('../web/',import.meta.url);let count=0;
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())walk(file);else if(entry.name==='index.html'){const html=fs.readFileSync(file,'utf8');assert.ok(html.includes('notifications.css?v=build'),file.href);assert.equal((html.match(/notifications\.css/g)||[]).length,1);count++}}}walk(root);assert.ok(count>=17);
 const html=fs.readFileSync(new URL('../web/notifications/index.html',import.meta.url),'utf8'),portal=fs.readFileSync(new URL('../web/assets/portal.js',import.meta.url),'utf8'),module=fs.readFileSync(new URL('../web/assets/notifications.mjs',import.meta.url),'utf8');
 assert.ok(html.includes('data-page="notifications"')&&html.includes('data-notifications-page')&&html.includes('aria-busy="true"'));
 assert.ok(portal.includes("'review','notifications'"));
 for(const forbidden of ['requestPermission','localStorage','classroom_lab_finish','classroom_submit','GROQ_API_KEY'])assert.ok(!module.includes(forbidden),forbidden);
});
