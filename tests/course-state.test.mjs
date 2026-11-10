import {test} from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import {parseHTML} from 'linkedom';
import {createViewChannel,getViewChannel} from '../web/assets/view-channel.mjs';
import {projectCourseView,INITIAL_COURSE_VIEW} from '../web/assets/course-view-model.mjs';
import {createCourseController} from '../web/assets/course-service.mjs';
const course=JSON.parse(fs.readFileSync('web/assets/catalog.json','utf8'))[0];
const links={login:'../account/',dashboard:'../dashboard/',result:(id,attempt)=>'../quiz/'+id+'/?attempt='+encodeURIComponent(attempt)};
const context=(status,userId='student-a')=>({ready:true,userId,memberships:status?[{course_id:course.id,status}]:[],results:[],study:{opened:[],last:null}});
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return{promise,resolve}};

test('Access states distinguish unresolved, guest, pending, suspended, restricted and active',()=>{
 assert.equal(projectCourseView(course,{ready:false},links).phase,'loading');
 assert.equal(projectCourseView(course,{ready:true,userId:null},links).phase,'guest');
 assert.equal(projectCourseView(course,{ready:true,error:true,userId:null},links).phase,'error');
 for(const [input,output] of [[null,'unregistered'],['active','active'],['pending','pending'],['suspended','suspended'],['rejected','restricted']])assert.equal(projectCourseView(course,context(input),links).phase,output);
});
test('Private view accepts only this course/current quiz version and does not invent completion or XP',()=>{
 const c=context('active');c.study={opened:[course.lessons[0].id,'other/note'],last:'other/note'};
 c.results=[{lesson_id:course.lessons[0].id,version:99,last_score:99,maximum:100,last_id:'old'},
 {lesson_id:course.lessons[1].id,version:course.lessons[1].quiz_version,last_score:7,maximum:10,last_id:'valid'},
 {lesson_id:'other/note',version:1,last_score:100,maximum:100,last_id:'foreign'}];
 const projected=projectCourseView(course,c,links);
 assert.deepEqual(projected.opened,[course.lessons[0].id]);assert.equal(projected.last,null);
 assert.deepEqual(Object.keys(projected.results),[course.lessons[1].id]);
 assert.equal(projected.results[course.lessons[1].id].score,7);
 assert.equal(Object.hasOwn(projected,'xp'),false);assert.equal(Object.hasOwn(projected,'completed'),false);
 for(const status of ['pending','suspended'])assert.deepEqual(projectCourseView(course,{...c,memberships:[{course_id:course.id,status}]},links).results,{});
});
test('Request access is authenticated, allowed only without membership, and deduplicated while pending',async()=>{
 const host={isConnected:true},pending=deferred();let ctx=context(null),requests=0,refreshes=0;
 const controller=createCourseController({host,course,links,readContext:()=>ctx,isCurrent:()=>true,
  requestAccess:async()=>{requests++;await pending.promise;ctx=context('pending')},refresh:async()=>{refreshes++}});
 const channel=getViewChannel(host,INITIAL_COURSE_VIEW);
 const first=channel.perform('request-access'),second=channel.perform('request-access');await Promise.resolve();await Promise.resolve();
 assert.equal(requests,1);assert.equal(channel.getSnapshot().busy,'request-access');
 pending.resolve();await Promise.all([first,second]);assert.equal(refreshes,1);assert.equal(channel.getSnapshot().phase,'pending');
 await channel.perform('request-access');assert.equal(requests,1);
 ctx={ready:true,userId:null};controller.update();await channel.perform('request-access');assert.equal(requests,1);
 assert.equal(await channel.perform('__proto__'),false);controller.dispose();
});
test('Account switches reject late membership completions without touching the replacement account',async()=>{
 const host={isConnected:true},pending=deferred();let ctx=context(null),refreshes=0;
 const old=createCourseController({host,course,links,readContext:()=>ctx,isCurrent:()=>true,requestAccess:()=>pending.promise,refresh:async()=>{refreshes++}});
 const channel=getViewChannel(host,INITIAL_COURSE_VIEW);const request=channel.perform('request-access');await Promise.resolve();await Promise.resolve();
 ctx=context('active','student-b');old.dispose();
 const current=createCourseController({host,course,links,readContext:()=>ctx,isCurrent:()=>true,requestAccess:async()=>{},refresh:async()=>{}});
 pending.resolve();await request;
 assert.equal(refreshes,0);assert.equal(channel.getSnapshot().ownerId,'student-b');assert.equal(channel.getSnapshot().phase,'active');current.dispose();
});
test('Disposing an older renderer/service binding cannot clear a newer view',()=>{
 const host={isConnected:true};let ctx=context('active','student-a');
 const props={host,course,links,readContext:()=>ctx,isCurrent:()=>true,refresh:async()=>{},requestAccess:async()=>{}};
 const old=createCourseController(props);ctx=context('active','student-b');const current=createCourseController(props);
 old.dispose();assert.equal(getViewChannel(host,INITIAL_COURSE_VIEW).getSnapshot().ownerId,'student-b');current.dispose();
});
test('Failures expose a retryable view error and disconnected roots cannot publish late data',async()=>{
 const host={isConnected:true},wait=deferred();const ctx=context(null);let calls=0;
 const controller=createCourseController({host,course,links,readContext:()=>ctx,isCurrent:()=>true,requestAccess:async()=>{throw Error('network')},refresh:async()=>{calls++;await wait.promise}});
 const channel=getViewChannel(host,INITIAL_COURSE_VIEW);await channel.perform('request-access');assert.ok(channel.getSnapshot().error);assert.equal(channel.getSnapshot().busy,null);
 const refresh=channel.perform('refresh');await Promise.resolve();await Promise.resolve();host.isConnected=false;wait.resolve();await refresh;
 assert.equal(calls,1);controller.dispose();assert.equal(channel.getSnapshot().ownerId,null);
});
test('External-store snapshots are cached and subscriptions can be safely released',()=>{
 const channel=createViewChannel({phase:'loading'});let notifications=0;const unsubscribe=channel.subscribe(()=>notifications++);
 assert.equal(channel.getSnapshot(),channel.getSnapshot());channel.publish({phase:'guest'});assert.equal(notifications,1);
 unsubscribe();channel.publish({phase:'active'});assert.equal(notifications,1);
 const input={phase:'active',opened:['course/note'],results:{note:{score:5}}};channel.publish(input);
 assert.throws(()=>channel.getSnapshot().opened.push('foreign/note'),TypeError);
 input.results.note.score=1;assert.equal(channel.getSnapshot().results.note.score,5);
});
test('React prerender supports ten independent lessons and escapes authored labels',async()=>{
 const {renderCourse}=await import('../.cache/react/course-render.mjs');
 const c={id:'sample',title:'Sample',lessons:Array.from({length:10},(_,i)=>({id:'sample/note-'+(i+1),number:String(i+1).padStart(2,'0'),title:i===9?'<script>alert(1)</script>':'Lesson '+(i+1),tags:[],quiz_version:1,lab:{path:'lab/sample/note-'+(i+1)+'/'}}))};
 const before=JSON.stringify(c);c.lessons.reverse();const html=renderCourse(c);assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;script&gt;/);
 const {document}=parseHTML('<div>'+html+'</div>');const cards=[...document.querySelectorAll('[data-course-lesson]')];
 assert.equal(cards.length,10);assert.equal(new Set(cards.map(card=>card.parentElement)).size,10);
 assert.equal(cards[0].dataset.courseLesson,'sample/note-1');assert.equal(cards[9].dataset.courseLesson,'sample/note-10');
 assert.equal(cards.flatMap(card=>[...card.querySelectorAll('.portal-actions a')]).length,30);
 assert.equal(document.querySelector('[data-course-results-link]'),null);
 assert.equal(JSON.stringify({...c,lessons:[...c.lessons].reverse()}),before);
});
