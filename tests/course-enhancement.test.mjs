// DOM integration exercises the production bundle. Browser layout QA is separate.
import {test} from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import zlib from 'node:zlib';
import path from 'node:path';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {getViewChannel} from '../web/assets/view-channel.mjs';
import {INITIAL_COURSE_VIEW,projectCourseView} from '../web/assets/course-view-model.mjs';
import {previewDocument} from '../frontend/preview-plugin.mjs';
import {evaluateBuiltModule} from './helpers/built-module.mjs';
const html=fs.readFileSync('dist/machine-learning/index.html','utf8');
const bundle=fs.readFileSync('web/assets/course-index.js','utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,35));
const waitFor=async predicate=>{const end=Date.now()+2500;while(!predicate()){if(Date.now()>end)throw Error('React state did not settle');await tick()}};

test('Hydration, filters and authenticated receipts stay under one React owner',async t=>{
 const dom=new JSDOM(html,{url:'http://class.test/machine-learning/',runScripts:'outside-only',pretendToBeVisual:true});
 t.after(()=>{dom.window.ClassNotesCourseApp?.disposeAll();dom.window.close()});
 const {window}=dom,document=window.document,host=document.querySelector('[data-course-react-root]');
 const originalCard=host.querySelector('[data-course-lesson]');
 const errors=[];
 const context=dom.getInternalVMContext();
 context.console={...console,warn:(...args)=>errors.push(args)};
 context.setImmediate=setImmediate;context.clearImmediate=clearImmediate;
 await evaluateBuiltModule(dom,'course-index.js');await tick();
 assert.equal(host.querySelector('[data-course-lesson]'),originalCard,'Hydration reuses the prerendered card');
 assert.equal(host.dataset.reactRecovery,undefined);
 const channel=getViewChannel(host,INITIAL_COURSE_VIEW);
 const course=JSON.parse(document.querySelector('#catalog-data').textContent)[0];
 const links={login:'../account/',dashboard:'../dashboard/',result:()=> '../quiz/machine-learning/thresholds-and-roc/?attempt=current'};
 channel.publish(projectCourseView(course,{ready:true,userId:null},links));await waitFor(()=>host.querySelector('[data-login-link]'));
 assert.ok(host.querySelector('[data-login-link]'));assert.equal(host.querySelector('[data-course-results-link]'),null);
 const fourth=course.lessons[3];
 const member={ready:true,userId:'student-a',memberships:[{course_id:course.id,status:'active'}],study:{opened:[fourth.id],last:fourth.id},results:[{lesson_id:fourth.id,version:fourth.quiz_version,last_score:8,maximum:10,last_id:'current'}]};
 channel.publish(projectCourseView(course,member,links));await tick();
 assert.ok(host.querySelector('[data-course-results-link]'));
 assert.equal(host.querySelector('[data-login-link]'),null);
 assert.match(host.querySelector('[data-course-continue]').getAttribute('href'),/thresholds-and-roc/);
 const input=host.querySelector('input[type="search"]');input.value='آستانه';input.dispatchEvent(new window.Event('input',{bubbles:true}));await tick();
 assert.equal(host.querySelectorAll('[data-course-lesson]').length,1);
 assert.match(host.querySelector('[data-course-result]').textContent,/8 \/ 10/);
 member.results[0].last_score=6;channel.publish(projectCourseView(course,member,links));await tick();
 assert.match(host.querySelector('[data-course-result]').textContent,/6 \/ 10/);
 input.value='not found';input.dispatchEvent(new window.Event('input',{bubbles:true}));await tick();
 assert.ok(host.querySelector('.course-search-empty'));host.querySelector('.course-search-empty button').click();await tick();
 assert.equal(host.querySelectorAll('[data-course-lesson]').length,4);
 const select=host.querySelector('select');for(const option of select.options)option.removeAttribute('selected');select.querySelector('option[value="NumPy"]').selected=true;
 select.dispatchEvent(new window.Event('change',{bubbles:true}));await tick();assert.equal(host.querySelectorAll('[data-course-lesson]').length,2);
 host.querySelector('.course-filter-meta button').click();await tick();
 channel.reset();await tick();
 assert.equal(host.querySelector('[data-course-results-link]'),null);
 assert.equal(host.querySelector('[data-course-result]'),null);
 assert.equal(host.querySelector('[data-login-link]'),null,'Identity reset is neutral, never a guest flash');
 assert.equal(errors.length,0);

});
test('The course runtime has no remote dependency or lab-write path and stays within its budget',()=>{
 const modules=new Map(),assets=path.resolve('web/assets');
 function collect(file){
  file=path.resolve(file);if(modules.has(file))return;
  assert.ok(file.startsWith(assets+path.sep));const source=fs.readFileSync(file,'utf8');modules.set(file,source);
  for(const specifier of new vm.SourceTextModule(source).dependencySpecifiers){
   assert.ok(specifier.startsWith('.'));collect(path.resolve(path.dirname(file),specifier));
  }
 }
 for(const name of ['course-index.js','site-shell.js','homepage.js','account-page.js','dashboard-page.js'])collect(path.join(assets,name));
 assert.equal([...modules.values()].filter(source=>source.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__')).length,1,'All entries must reuse one React runtime');
 assert.ok([...modules.values()].reduce((sum,source)=>sum+zlib.gzipSync(source).length,0)<125_000);
 for(const source of modules.values()){
  assert.doesNotMatch(source,/https:\/\/(?:esm\.sh|unpkg\.com|cdn\.jsdelivr\.net)/);
  assert.doesNotMatch(source,/classroom_lab_finish|classroom_lab_save|createClient\(|localStorage|sessionStorage/);
 }

});
test('Fixture hydration preserves relative lesson links and resolves them to actual lesson routes',async t=>{
 const preview=await previewDocument(process.cwd(),'member');
 const dom=new JSDOM(preview,{url:'http://class.test/__preview__/course/?state=member',runScripts:'outside-only',pretendToBeVisual:true});
 t.after(()=>{dom.window.ClassNotesCourseApp?.disposeAll();dom.window.close()});
 const {window}=dom,document=window.document,host=document.querySelector('[data-course-react-root]');
 const card=host.querySelector('[data-course-lesson]'),errors=[];
 const context=dom.getInternalVMContext();context.console={...console,warn:(...args)=>errors.push(args),error:(...args)=>errors.push(args)};
 context.setImmediate=setImmediate;context.clearImmediate=clearImmediate;
 await evaluateBuiltModule(dom,'course-index.js');
 const course=JSON.parse(document.querySelector('#catalog-data').textContent)[0];
 const channel=getViewChannel(host,INITIAL_COURSE_VIEW);
 channel.publish(projectCourseView(course,{ready:true,userId:'fixture',memberships:[{course_id:course.id,status:'active'}]},{}));
 await waitFor(()=>host.querySelector('[data-course-results-link]'));
 assert.equal(host.querySelector('[data-course-lesson]'),card);
 assert.equal(host.dataset.reactRecovery,undefined);assert.deepEqual(errors,[]);
 for(const element of host.querySelectorAll('a[href]')){
  const href=new URL(element.href);assert.equal(href.origin,'http://class.test');
  assert.ok(!href.pathname.startsWith('/__preview__/'),element.href);
 }
 assert.ok([...card.querySelectorAll('a')].some(a=>new URL(a.href).pathname==='/machine-learning/vector-distance/'));
 assert.ok([...document.querySelectorAll('#local-preview-banner nav a')].every(a=>new URL(a.href).pathname==='/__preview__/course/'));
});
