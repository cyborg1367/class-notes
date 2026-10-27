const {test}=require('node:test'),assert=require('node:assert/strict');
const {portalCreateReadCoordinator,portalCreatePublicConfigLoader,portalMissingBootstrap,portalAbortable}=require('../web/assets/portal.js');
test('identical simultaneous reads share a request but subsequent reads remain fresh',async()=>{
 let calls=0,resolve;const rpc=portalCreateReadCoordinator({request:()=>{calls++;return new Promise(r=>resolve=r)}});
 const a=rpc.call('classroom_lab_state',{p_mission:'one'}),b=rpc.call('classroom_lab_state',{p_mission:'one'});assert.equal(a,b);await Promise.resolve();assert.equal(calls,1);resolve({xp:20});assert.deepEqual(await a,{xp:20});await b;
 const c=rpc.call('classroom_lab_state',{p_mission:'one'});await Promise.resolve();assert.equal(calls,2);resolve({xp:30});assert.equal((await c).xp,30);assert.equal(rpc.report().classroom_lab_state.shared,1);
});
test('different missions and all writes have independent requests',async()=>{
 let calls=0;const rpc=portalCreateReadCoordinator({request:async()=>++calls});
 await Promise.all([rpc.call('classroom_lab_state',{p_mission:'one'}),rpc.call('classroom_lab_state',{p_mission:'two'}),rpc.call('classroom_lab_save',{p_state:{code:'x'}}),rpc.call('classroom_lab_save',{p_state:{code:'x'}})]);assert.equal(calls,4);
 await rpc.call('classroom_lab_save',{toJSON(){throw Error('The read coordinator must not serialize learner code writes')}});assert.equal(calls,5);
});
test('identity reset rejects a late read and clears diagnostic history',async()=>{
 let resolve;const rpc=portalCreateReadCoordinator({request:()=>new Promise(r=>resolve=r)});const a=rpc.call('classroom_state');await Promise.resolve();rpc.reset();resolve({memberships:['old account']});await assert.rejects(a,/ACCOUNT_CHANGED/);assert.deepEqual(rpc.snapshot(),[]);
});
test('a post-write read cannot join a request started before that write',async()=>{
 const resolvers=[];const rpc=portalCreateReadCoordinator({request:(name)=>name==='classroom_lab_state'?new Promise(resolve=>resolvers.push(resolve)):true});
 const before=rpc.call('classroom_lab_state',{p_mission:'one'});await Promise.resolve();await rpc.call('classroom_lab_save');
 const after=rpc.call('classroom_lab_state',{p_mission:'one'});assert.notEqual(before,after);await Promise.resolve();resolvers[0]({xp:20});resolvers[1]({xp:50});assert.equal((await after).xp,50);await before;
});
test('an identity change before dispatch prevents a queued write using a new account',async()=>{
 let calls=0;const rpc=portalCreateReadCoordinator({request:async()=>++calls});const write=rpc.call('classroom_submit');rpc.reset();await assert.rejects(write,/ACCOUNT_CHANGED/);assert.equal(calls,0);
});
test('failed reads retry; diagnostics retain timing only and have bounded size',async()=>{
 let failure=true,time=0;const rpc=portalCreateReadCoordinator({limit:2,clock:()=>time++,request:async()=>{if(failure)throw Error('offline');return {private:'secret learner code'}}});
 await assert.rejects(rpc.call('classroom_state',{private:'not in report'}),/offline/);failure=false;await rpc.call('classroom_state');await rpc.call('classroom_state');assert.equal(rpc.snapshot().length,2);assert.ok(!JSON.stringify(rpc.snapshot()).includes('private'));assert.ok(!JSON.stringify(rpc.report()).includes('secret'));assert.equal(rpc.report().classroom_state.requests,2);
});
test('fingerprinted public config reuses successes, isolates versions and retries failures',async()=>{
 let calls=0;const load=portalCreatePublicConfigLoader(async url=>{calls++;if(url==='fail'&&calls===1)throw Error('offline');return {url}});
 await assert.rejects(load('fail'));assert.deepEqual(await load('fail'),{url:'fail'});await Promise.all([load('same?v=one'),load('same?v=one')]);await load('same?v=two');assert.equal(calls,4);
});
test('only missing-function errors activate compatibility fallback',()=>{
 assert.ok(portalMissingBootstrap({code:'PGRST202',message:'Could not find public.classroom_bootstrap in the schema cache'}));assert.ok(portalMissingBootstrap({code:'42883',message:'function public.classroom_bootstrap does not exist'}));assert.equal(portalMissingBootstrap({code:'42883',message:'function missing_internal_helper does not exist'}),false);for(const code of ['42501','57014','P0001','NETWORK','INVALID_BOOTSTRAP_RESPONSE'])assert.equal(portalMissingBootstrap({code}),false);
});
test('cancelling one configuration consumer does not cancel the shared request',async()=>{
 let resolve;const shared=new Promise(r=>resolve=r),controller=new AbortController();const a=portalAbortable(shared,controller.signal),b=portalAbortable(shared,new AbortController().signal);controller.abort();await assert.rejects(a,{name:'AbortError'});resolve('endpoint');assert.equal(await b,'endpoint');
});
test('an already-cancelled consumer cannot continue into a submission',async()=>{
 const controller=new AbortController();controller.abort();await assert.rejects(portalAbortable(Promise.resolve('endpoint'),controller.signal),{name:'AbortError'});
});
