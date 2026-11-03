const {test}=require('node:test'),assert=require('node:assert/strict');
const model=import('../web/assets/instructor-model.mjs');
test('late instructor reads cannot cross refresh, course or account boundaries',async()=>{
 const {createRequestGate}=await model;let owner=true;const gate=createRequestGate(()=>owner);
 const old=gate.ticket('students'),newer=gate.ticket('students');assert.equal(old(),false);assert.equal(newer(),true);
 const otherView=gate.ticket('overview');assert.equal(newer(),true);assert.equal(otherView(),true);
 gate.invalidate();assert.equal(newer(),false);assert.equal(otherView(),false);
 const oldAccount=gate.ticket('attempt');owner=false;assert.equal(oldAccount(),false);owner=true;
 gate.dispose();assert.equal(gate.ticket('students')(),false);
});
test('cursor arguments preserve exact microseconds and filtered context',async()=>{
 const {freshFilters,pageArgs,resetPages}=await model,f=freshFilters().attempts;
 const cursor={created_at:'2026-01-01T10:00:00.000003+00:00',id:'one'};f.cursors.push(cursor);f.index=1;f.asOf='2026-01-02T01:02:03.123456+00:00';f.query='نام';f.kind='first';
 const args=pageArgs('attempts','course',f);assert.equal(args.p_after,cursor);assert.equal(args.p_as_of,f.asOf);assert.equal(args.p_query,'نام');assert.equal(args.p_kind,'first');
 resetPages(f);assert.deepEqual(f.cursors,[null]);assert.equal(f.asOf,null);assert.equal(f.query,'نام');
});
test('unknown or unavailable reports never become a fabricated zero',async()=>{
 const {overviewReport,reportPage,studentReport,labFor,relative}=await model;
 for(const value of [null,{}, {rows:[],total:null,page_size:20,next_cursor:null}])assert.throws(()=>reportPage(value));
 assert.throws(()=>overviewReport({stats:{active_students:0}}));assert.throws(()=>studentReport({user_id:'one',status:'active'}));
 assert.equal(labFor({lab:{missions:[]}},'unknown'),null);assert.equal(relative(null),'ثبت نشده');
});
test('CSV escapes markup, quotes, newlines and spreadsheet formulas',async()=>{
 const {csvText,escapeHTML}=await model;const csv=csvText([['name','score'],['=IMPORTXML("evil")',7],[' \t+1',8],['A,"B"\nC',9]]);
 assert.ok(csv.startsWith('\ufeff'));assert.ok(csv.includes('"\'=IMPORTXML(""evil"")"'));assert.ok(csv.includes('"\' \t+1"'));assert.ok(csv.includes('"A,""B""\nC"'));
 assert.equal(escapeHTML('<img src=x onerror="x">'),'&lt;img src=x onerror=&quot;x&quot;&gt;');
});
test('filtered CSV can include every record beyond the old 200-row boundary',async()=>{
 const {collectPages}=await model,calls=[],stamp='2026-01-01T00:00:00.000009Z';
 const rows=await collectPages(async args=>{calls.push(args);const start=args.p_after?.index||0;return {rows:Array.from({length:Math.min(100,263-start)},(_,i)=>({id:'id-'+(start+i)})),total:263,page_size:100,as_of:stamp,next_cursor:start+100<263?{index:start+100,created_at:stamp}:null};},{p_course:'course',p_query:'same filter',p_kind:'first'});
 assert.equal(rows.length,263);assert.equal(calls.length,3);assert.equal(calls[1].p_as_of,stamp);assert.equal(calls[2].p_query,'same filter');assert.equal(calls[2].p_kind,'first');
});
test('changed, duplicate or interrupted exports are refused instead of truncated',async()=>{
 const {collectPages}=await model;let n=0;
 await assert.rejects(collectPages(async()=>({rows:[{id:'same'}],total:2,page_size:100,next_cursor:{id:++n}}),{}),/REPORT_CHANGED/);
 n=0;await assert.rejects(collectPages(async()=>({rows:[{id:'id-'+n}],total:++n,page_size:100,next_cursor:{id:n}}),{}),/REPORT_CHANGED/);
 let alive=true;await assert.rejects(collectPages(async()=>{alive=false;return {rows:[],total:0,page_size:100,next_cursor:null};},{},{alive:()=>alive}),/EXPORT_CANCELLED/);
});
