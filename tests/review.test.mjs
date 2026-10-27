import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeSearch,reviewEntries,reviewReference,reviewOutcome,latestReviewWriting,reviewSessionEntries} from '../web/assets/review.mjs';
const state={concepts:[{id:'one',lesson_id:'machine-learning/vector-distance',description:'اندیس همسایه'}],entries:[{id:'a',concept_id:'one',title:'ویژگی‌ها',note:'یادداشت شخصی',due:true,bookmarked:false},{id:'b',concept_id:null,title:'آزاد',note:'فاصله',due:false,bookmarked:true}]};
test('Persian search handles Arabic letter variants and zero-width separators',()=>{assert.equal(normalizeSearch(' ويژگي‌ها '),'ویژگیها');assert.equal(reviewEntries(state,{search:'ويژگيها'}).length,1);assert.equal(reviewEntries(state,{search:'اندیس'}).length,1)});
test('filters combine due, bookmark, lesson and search without treating free notes as quizzes',()=>{assert.deepEqual(reviewEntries(state).map(e=>e.id),['a']);assert.deepEqual(reviewEntries(state,{tab:'bookmarked'}).map(e=>e.id),['b']);assert.equal(reviewEntries(state,{tab:'all',lesson:'machine-learning/vector-distance'}).length,1);assert.equal(reviewEntries(state,{tab:'due',search:'missing'}).length,0)});
test('reference URLs only accept known lesson route syntax and safe anchor characters',()=>{const url=path=>'https://class.test/notes/'+path;assert.equal(reviewReference({lesson_id:'machine-learning/evaluating-knn',review_anchor:'confusion-matrix'},url),'https://class.test/notes/machine-learning/evaluating-knn/#confusion-matrix');assert.equal(reviewReference({lesson_id:'javascript:alert(1)'},url),null);assert.equal(reviewReference({lesson_id:'machine-learning/evaluating-knn',review_anchor:'" onmouseover="bad'},url),'https://class.test/notes/machine-learning/evaluating-knn/')});
test('notebook ships an authenticated shell and private exercise answers stay out of public sources',()=>{const html=fs.readFileSync(new URL('../web/review/index.html',import.meta.url),'utf8'),module=fs.readFileSync(new URL('../web/assets/review.mjs',import.meta.url),'utf8');assert.ok(html.includes('data-page="review"'));assert.ok(html.includes('data-review-root'));assert.ok(html.includes('aria-busy="true"'));assert.ok(html.includes('review.css?v=build'));assert.ok(!module.includes('reviewbank'));assert.ok(!module.includes('GROQ_API_KEY'));assert.ok(!module.includes('classroom_lab_finish'));assert.ok(!module.includes('classroom_submit'))});
test('outcomes distinguish retrieval, reading, hints and unknown legacy evidence',()=>{
 assert.equal(reviewOutcome({correct:false}).status,'needs-review');
 assert.equal(reviewOutcome({correct:true,hint_used:true,preparation_used:true}).status,'with-hint');
 assert.equal(reviewOutcome({correct:true,preparation_used:true}).status,'after-reading');
 assert.equal(reviewOutcome({correct:true,preparation_used:false}).status,'retrieval');
 assert.equal(reviewOutcome({correct:true,preparation_used:null}).status,'unclassified');
 assert.equal(reviewOutcome({correct:true}).status,'unclassified');
});
test('the newest reflection is shown without replacing or mutating the original personal note',()=>{
 const entries=[{id:'a',note:'original',updated_at:'2026-10-20',last_reflection:{text:'reflection',at:'2026-10-27'}}],before=JSON.stringify(entries);
 assert.equal(latestReviewWriting(entries).note,'reflection');assert.equal(latestReviewWriting(entries).isReflection,true);assert.equal(JSON.stringify(entries),before);
 assert.equal(latestReviewWriting([]),undefined);
 assert.equal(latestReviewWriting([{id:'legacy',note:'old'},{id:'new',note:'new',updated_at:'2026-10-27'}]).id,'new');
});
test('a review session contains at most three due topics and leaves the backlog intact',()=>{
 const entries=Array.from({length:10},(_,i)=>({id:String(i),due:true})),snapshot={entries,concepts:[]};
 assert.deepEqual(reviewSessionEntries(snapshot).map(e=>e.id),['0','1','2']);
 assert.equal(snapshot.entries.length,10);
 assert.deepEqual(reviewSessionEntries({entries:[{id:'scheduled',due:false},{id:'ready',due:true}],concepts:[]}).map(e=>e.id),['ready']);
});
