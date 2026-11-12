import {test as base,expect,type BrowserContext,type Route} from '@playwright/test';
import {makeInstructorFixture,instructorFixture} from '../../../frontend/instructor-preview.mjs';
import {prompts,record} from '../../../frontend/quiz-result-preview.mjs';
import {course,firstLesson,lessonPayload,sampleDate,sampleImage,workerFixture} from './content';
const backend='https://classroom-e2e.supabase.co',studentId='11111111-1111-4111-8111-111111111111';
type Role='guest'|'student'|'teacher';
type Membership='active'|'pending'|'suspended';
type Args=Record<string,any>;
type Snapshot={mission:string;revision:number;draft:any;completed:string[];xp:number;maximum:number;attempts:number;badge:boolean;tasks:{id:string;position:number}[]};
type Options={classroomRole:Role;classroomMembership:Membership};
function session(role:Role){
 if(role==='guest')return null;
 const now=Math.floor(Date.now()/1000),user={id:studentId,aud:'authenticated',role:'authenticated',email:'learner@example.test',
  user_metadata:{full_name:role==='teacher'?'مدرس نمونه':'دانشجوی نمونه'},app_metadata:{provider:'google',providers:['google']},created_at:sampleDate};
 const encode=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url');
 return {access_token:encode({alg:'HS256',typ:'JWT'})+'.'+encode({sub:studentId,aud:'authenticated',role:'authenticated',iat:now,exp:now+3600})+'.browser-fixture',
  refresh_token:'browser-fixture-refresh',token_type:'bearer',expires_in:3600,expires_at:now+3600,user};
}
export class ClassroomFixture{
 readonly calls:{name:string;args:Args}[]=[];
 readonly problems:string[]=[];
 readonly navigationCancellations:string[]=[];
 readonly snapshots=new Map<string,Snapshot>();
 readonly instructor=makeInstructorFixture(structuredClone(instructorFixture));
 failGrading=false;failBootstrap=false;failSaves=false;
 readonly grades:Args[]=[];
 readonly reviews={entries:[{id:'browser-note',concept_id:null,title:'یادداشت آزمایشی من',note:'شکل داده را پیش از نوشتن کد بررسی می‌کنم.',revision:0,due:false,bookmarked:true,updated_at:sampleDate}],concepts:[]};
 readonly notices:{id:string;episode:string;kind:string;title:string;description:string;action:string;active:boolean;path:string;occurred_at:string;read_at:string|null;snoozed_until:string|null}[]=[
  {id:'browser-notice',episode:'1',kind:'content',title:'یادداشت تازه منتشر شد',description:'نمونهٔ اعلان برای بررسی رابط.',action:'مطالعهٔ یادداشت',active:true,path:firstLesson.id+'/',occurred_at:sampleDate,read_at:null,snoozed_until:null}];
 private readonly currentSession;
 private readonly quizDrafts=new Map<string,unknown>();
 constructor(readonly role:Role,readonly membership:Membership){
  this.currentSession=session(role);
  for(const lesson of course.lessons)this.snapshots.set(lesson.lab.mission,{mission:lesson.lab.mission,revision:0,draft:null,completed:[],xp:0,maximum:300,attempts:0,badge:false,tasks:lesson.lab_steps.map(({id},position)=>({id,position}))});
 }
 private state(){return {memberships:[{course_id:course.id,title:course.title,status:this.membership,role:this.role==='teacher'?'teacher':'student'}],results:[]};}
 private async rpc(name:string,args:Args):Promise<unknown>{
  if(this.role==='guest')throw Error('Guest requested private RPC '+name);
  if(name==='classroom_bootstrap'){
   if(this.failBootstrap)throw Error('FIXTURE_BOOTSTRAP_UNAVAILABLE');
   return {state:this.state(),lesson:args.p_page==='lesson'&&this.membership==='active'?lessonPayload(args.p_lesson):null,
    lab:args.p_page==='lab'?this.snapshots.get(args.p_mission):null,labs:Object.fromEntries([...this.snapshots].map(([id,value])=>[id,{status:'fulfilled',value}]))};
  }
  if(name==='classroom_state')return this.state();
  if(name==='classroom_presence_visibility')return {visible:false};
  if(name==='classroom_presence')return {visible:false,members:[],server_now:new Date().toISOString()};
  if(name==='classroom_notifications')return {items:this.notices,unread_count:this.notices.filter(n=>!n.read_at).length,next_cursor:null,server_now:new Date().toISOString(),preferences:{revision:0,lab:true,review:true,content:true,access:true}};
  if(name==='classroom_notification_read'){this.notices.forEach(n=>{n.read_at=new Date().toISOString()});return null;}
  if(name==='classroom_review_summary')return {due_count:0};
  if(name==='classroom_review_state')return this.reviews;
  if(name==='classroom_review_save'){
   const item=this.reviews.entries.find(item=>item.id===args.p_entry);if(!item)throw Error('Unknown review note');
   Object.assign(item,{title:args.p_title,note:args.p_note,bookmarked:args.p_bookmarked});return ++item.revision;
  }
  if(name==='classroom_request_access')return null;
  if(name==='classroom_lesson')return lessonPayload(args.p_lesson);
  if(name==='classroom_lab_state')return this.snapshots.get(args.p_mission);
  if(name==='classroom_lab_save'){
   if(this.failSaves)throw Error('FIXTURE_SAVE_UNAVAILABLE');
   const value=this.snapshots.get(args.p_mission);if(!value)throw Error('Unknown mission');
   if(value.revision!==args.p_revision)throw Error('LAB_PROGRESS_CONFLICT');
   value.draft=structuredClone(args.p_state);value.revision++;return value;
  }
  if(name==='classroom_quiz')return {version:2,questions:prompts.map(p=>({...p,points:2,skill:'تمرین نمونه',...(p.blanks?{blanks:p.blanks.map(b=>({...b,label:b.id}))}:{})}))};
  if(name==='classroom_draft'){
   if('p_answers' in args){this.quizDrafts.set(args.p_lesson,args.p_answers);return null;}return this.quizDrafts.get(args.p_lesson)??null;
  }
  if(name==='classroom_submit')return {id:record.id,attempt_no:1,created_at:sampleDate,result:record.result};
  if(name==='classroom_attempt')return record;
  if(name.startsWith('classroom_instructor_')){if(this.role!=='teacher')throw Error('Student requested teacher RPC');return this.instructor.rpc(name,args);}
  throw Error('Unimplemented browser RPC: '+name);
 }
 private async handle(route:Route,origin:string){
  const url=new URL(route.request().url());
  const json=(body:unknown,status=200)=>route.fulfill({status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':origin},body:JSON.stringify(body)});
  if(url.origin===origin){
   if(url.pathname==='/assets/auth-config.json')return json({supabaseUrl:backend,publishableKey:'sb_publishable_browser_fixture'});
   if(url.pathname==='/assets/lab-service.json')return json({checkURL:backend+'/functions/v1/classroom-lab/check'});
   if(url.pathname==='/assets/coding-lab-worker.mjs')return route.fulfill({contentType:'text/javascript',body:workerFixture});
   return route.continue();
  }
  if(url.origin!==backend){this.problems.push('Unexpected external request: '+url.origin+url.pathname);return route.abort('blockedbyclient');}
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'}});
  if(url.pathname==='/auth/v1/user')return json(this.currentSession?.user);
  if(url.pathname==='/auth/v1/logout')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':origin}});
  if(url.pathname==='/auth/v1/authorize')return route.fulfill({contentType:'text/html',body:'<h1>Test OAuth endpoint</h1>'});
  if(url.pathname.startsWith('/storage/v1/object/'))return route.fulfill({contentType:url.pathname.endsWith('.svg')?'image/svg+xml':'application/octet-stream',body:url.pathname.endsWith('.svg')?sampleImage:'browser test download',headers:{'Access-Control-Allow-Origin':origin}});
  if(url.pathname==='/functions/v1/classroom-lab/check'){
   const args=route.request().postDataJSON() as Args;this.grades.push(args);
   if(this.failGrading)return route.fulfill({status:502,contentType:'text/plain',body:'Fixture unavailable',headers:{'Access-Control-Allow-Origin':origin}});
   const value=this.snapshots.get(args.mission);if(!value)throw Error('Unknown grading mission');
   // revision belongs to draft saves; grading does not write that draft.
   const added=value.completed.includes(args.task)?0:30;if(added)value.completed.push(args.task);value.xp+=added;value.attempts++;
   return json({status:'passed',snapshot:value,xp_added:added,feedback:{code:'PASSED'}});
  }
  const match=url.pathname.match(/^\/rest\/v1\/rpc\/(\w+)$/);
  if(match){const name=match[1],args=route.request().postDataJSON()||{};this.calls.push({name,args});
   try{return await json(await this.rpc(name,args));}catch(error){const message=String(error);if(!message.includes('FIXTURE_'))this.problems.push(message);return json({code:'P0001',message},503);}
  }
  this.problems.push('Unhandled backend request: '+url.pathname);return route.abort('blockedbyclient');
 }
 async install(context:BrowserContext,baseURL:string,browserName:string){
  const origin=new URL(baseURL).origin;if(new URL(origin).hostname!=='127.0.0.1')throw Error('Browser fixtures require localhost');
  await context.addInitScript(({session,origin})=>{
   if(location.origin!==origin||localStorage.getItem('browser-fixture-seeded'))return;
   localStorage.setItem('browser-fixture-seeded','1');if(session)localStorage.setItem('class-notes-auth:/',JSON.stringify(session));
  },{session:this.currentSession,origin});
  await context.route('**/*',route=>this.handle(route,origin));
  await context.routeWebSocket('**/*',socket=>{
   const url=new URL(socket.url());if(url.hostname!==new URL(backend).hostname||url.pathname!=='/realtime/v1/websocket'){this.problems.push('Unexpected WebSocket: '+socket.url());socket.close();return;}
   socket.onMessage(message=>{const[join,ref,topic,event]=JSON.parse(String(message));if(['phx_join','heartbeat','phx_leave'].includes(event))socket.send(JSON.stringify([join,ref,topic,'phx_reply',{status:'ok',response:{}}]));});
  });
  context.on('page',page=>{
   let replacing=false;
   page.on('request',r=>{if(r.isNavigationRequest()&&r.frame()===page.mainFrame())replacing=true});
   page.on('domcontentloaded',()=>{replacing=false});
   page.on('pageerror',error=>{
    // Exact unload-time synthetic presence exception: microsoft/playwright#43120.
    if(browserName==='webkit'&&replacing&&/(?:https?:\/\/|\/)classroom-e2e\.supabase\.co\/rest\/v1\/rpc\/classroom_presence due to access control checks\.$/.test(error.message)){this.navigationCancellations.push(error.message);return;}
    this.problems.push(error.message);
   });
   page.on('console',m=>{if(m.type()==='error'&&/Minified React error|Hydration failed|hydration.*mismatch/i.test(m.text()))this.problems.push(m.text());});
  });
 }
}
export const test=base.extend<{classroom:ClassroomFixture}&Options>({
 classroomRole:['student',{option:true}],classroomMembership:['active',{option:true}],
 classroom:[async({context,baseURL,browserName,classroomRole,classroomMembership},use,info)=>{
  const fixture=new ClassroomFixture(classroomRole,classroomMembership);await fixture.install(context,baseURL!,browserName);await use(fixture);
  if(fixture.navigationCancellations.length)await info.attach('webkit-navigation-cancellations',{body:JSON.stringify(fixture.navigationCancellations,null,2),contentType:'application/json'});
  expect(fixture.problems,'No unexpected external requests, RPCs, or browser errors').toEqual([]);
 },{auto:true}],
});
export {expect};
