(function(){
'use strict';let current,mountTicket=0;
async function mount(root,options){
 const ticket=++mountTicket;current?.dispose();
 const {userId,assets,lessonURL,isCurrent,saveDraft,refresh,submit,getAttempt}=options;
 if(!userId||!isCurrent())return;
 const assetURL=path=>{const u=new URL(path,assets);u.search=options.assetVersion||'?v=build';return u;};
 if(!options.lab?.model||!options.lab?.mission)throw Error('LAB_CATALOG_REQUIRED');
 const [model,{mountLabFrame},{mountExperience},{mountLabPresentation},{mountLabMission,mountLabReference},{mountLabWorkspace},{mountLabXp}]=await Promise.all([
  import(assetURL(options.lab.model)),import(assetURL('site-shell.js')).then(module=>module.loadLabFrame()),
  import(assetURL('coding-lab-experience.mjs')),import(assetURL('site-shell.js')).then(module=>module.loadLabPresentation()),
  import(assetURL('site-shell.js')).then(module=>module.loadLabMission()),
  import(assetURL('site-shell.js')).then(module=>module.loadLabWorkspace()),
  import(assetURL('site-shell.js')).then(module=>module.loadLabXp())
 ]);
 if(ticket!==mountTicket||!root.isConnected||!isCurrent())return;
 const {stages,dataset,bootstrap,normalize,available,highlight,missionId}=model;
 if(missionId!==options.lab.mission||options.snapshot?.mission&&options.snapshot.mission!==missionId)throw Error('LAB_CATALOG_MISMATCH');
 const meta={...model.meta,filename:model.meta?.filename||'exercise.py',lessonId:options.lessonId,title:options.lab.title,lessonBridge:options.lab.bridge};
 const key=`classroom-mission:${userId}:${missionId}`;
 let cached;try{cached=JSON.parse(localStorage.getItem(key)||'null')}catch{}
 const maximum=stages.reduce((sum,stage)=>sum+Number(stage.xp||0),0)||300;
 let trusted=options.snapshot&&typeof options.snapshot==='object'?options.snapshot:{mission:missionId,revision:0,draft:null,completed:[],xp:0,maximum,attempts:0,badge:false};
 let revision=Number(trusted.revision||0);
 const restoredDraft=cached?.dirty?cached.state:trusted.draft;
 let state=normalize(restoredDraft);
 // Locally distinguish an intentionally empty draft from an unopened stage.
 // The server continues to receive the existing four-field draft object.
 const initialized=new Set();
 function resetInitialized(draft,cache){
  initialized.clear();
  state.codes.forEach((code,index)=>{if(code!==''||(Array.isArray(cache?.initialized)&&cache.initialized.includes(index)&&cache.state?.codes?.[index]===code))initialized.add(index);});
  if(Number.isInteger(draft?.active)&&typeof draft.codes?.[draft.active]==='string')initialized.add(draft.active);
 }
 resetInitialized(restoredDraft,cached?.dirty||cached?.revision===revision?cached:null);
 let dirty=!!cached?.dirty,conflict=dirty&&cached.revision!==revision,changed=0,saving=false,cloudLoading=false;
 let worker=null,phase='idle',checking=false,hasRun=false,disposed=false,epoch=0,request=0,activeRequest=0,timer,autosave,pollTimer,controller,localSaveTimer=null,paintFrame=null;
 let pending=cached?.pending||null;
 state.active=Math.min(state.active,available(trusted));
 root.classList.toggle('lab-thresholds',missionId==='threshold-knn-v1');
 if(missionId==='evaluation-knn-v1')root.classList.add('lab-evaluation');else root.classList.remove('lab-evaluation');
 const baseURL=new URL('../',assets);
 let tutor=null,tutorLoading=false,tutorSuspended=false;
 const layout=mountLabFrame(root,{
  title:meta.title,finish:meta.finish,stageCount:stages.length,assistant:!!options.tutorRequest,
  links:{home:new URL('index.html',baseURL).href,lesson:lessonURL,quiz:new URL(`quiz/${meta.lessonId}/`,baseURL).href,
   course:new URL('machine-learning/',baseURL).href,dashboard:new URL('dashboard/',baseURL).href},
 },{
  onTabChange(name){if(name==='assistant')void openTutor();else tutor?.close(false);},
  showHints(){if(navigationBusy())return;layout.selectTab('guide',true);if(!state.hints[state.active])revealHint();},
  next(){if((trusted.completed||[]).includes(stages[state.active].id))chooseStage(state.active+1);},
  editReflection(value){if(!alive())return;state.explanation=value;change();},
 });
 const $=s=>root.querySelector(s);
 const previewOnly=options.previewOnly===true||root.hasAttribute('data-lab-fixture');
 const simulated=previewOnly&&typeof options.createRuntimeWorker==='function';
 const canRun=!previewOnly||simulated;
 const workspaceView=mountLabWorkspace($('[data-react-lab-workspace]'),{
  filename:meta.filename,mode:simulated?'simulated-preview':previewOnly?'readonly-preview':'normal',
  links:{account:new URL('account/',baseURL).href,dashboard:new URL('dashboard/',baseURL).href,teacher:new URL('instructor/',baseURL).href}
 },{
  run:startRun,stop:stopRun,activate:activateRuntime,check:submitAnswer,input:editCode,scroll:sync,keydown:editorShortcut,
  command:runCommand,clear:()=>workspaceView.clearOutput(),download:downloadCode,imports:addImports,reset:resetCode,
  load:loadCloudDraft,refresh:refreshProgress
 },layout.layoutControls);
 const editor=$('#lab-code'),explanation=$('#lab-explanation'),command=$('#lab-command');
 root.classList.add('lab-open-notebook');document.body.classList.add('lab-notebook-ready');
 const alive=()=>!disposed&&root.isConnected&&isCurrent();
 const referenceView=mountLabReference(root,{dataset,meta,bootstrap,lessonURL,
  csvURL:model.csvAsset?assetURL(model.csvAsset).href:undefined,
  loadPreview:model.previewCode?()=>import(assetURL(model.previewModule||'coding-lab-evaluation-view.mjs')).then(module=>module.renderEvaluationPreview):undefined});
 async function preview(value,runRequest){
  const runEpoch=epoch;
  const isRunCurrent=()=>alive()&&epoch===runEpoch&&activeRequest===runRequest;
  const shown=await referenceView.showPreview(value,isRunCurrent);
  const instructions=$('.lab-instructions');
  if(shown&&isRunCurrent()&&layout.activeTab()==='mission'&&!instructions.contains(root.ownerDocument.activeElement))
   layout.selectTab('data',false);
 }
 const missionView=mountLabMission(root,{choose:chooseStage,reveal:revealHint});
 renderMission();
 const experience=mountExperience(root,{missionId,meta,dataset,stages,mountLabPresentation,setStoryVisible:layout.setStoryVisible,hasProgress:!!(trusted.draft||trusted.attempts||trusted.completed?.length||cached?.dirty)});
 const tutorButton=$('[data-tutor-open]');
 const tutorContext=()=>({mission:missionId,task:stages[state.active].id,title:stages[state.active].title,code:editor.value,output:workspaceView.getOutput()});
 async function openTutor(){
  const host=$('[data-lab-tutor-host]');
  if(!host||layout.activeTab()!=='assistant'||tutorLoading||tutorSuspended||!alive())return;
  tutorLoading=true;
  try{
   if(!tutor){
    host.textContent='در حال دریافت دستیار…';
    const {mountTutor}=await import(assetURL('site-shell.js')).then(module=>module.loadLabTutor());
    if(!alive()||layout.activeTab()!=='assistant'||tutorSuspended)return;
    host.replaceChildren();
    tutor=mountTutor(root,{host,onClose:()=>layout.selectTab('mission',true),request:options.tutorRequest,
     getContext:tutorContext,isCurrent:alive,opener:tutorButton});
   }
   if(layout.activeTab()==='assistant')tutor.open({focus:false});
  }catch{
   if(alive()&&layout.activeTab()==='assistant'&&!tutorSuspended)host.textContent='دستیار دریافت نشد؛ دوباره این تب را باز کن.';
  }finally{tutorLoading=false;}
 }

 const toolsMenu=$('[data-tools]'),consoleTools=$('.lab-console-tools');
 $('[data-lab-teacher-link]').hidden=document.querySelector('[data-teacher-link]')?.hidden!==false;
 function dismissTools(e){for(const menu of [toolsMenu,consoleTools])if(!menu.contains(e.target)||e.target.closest('.lab-tools-menu button,.lab-console-menu button'))menu.open=false}
 function closeTools(e){if(e.key==='Escape')for(const menu of [toolsMenu,consoleTools])if(menu.open){menu.open=false;menu.querySelector('summary').focus()}}
 root.addEventListener('click',dismissTools);root.addEventListener('keydown',closeTools);
 let runWhenReady=false;
 function saveStatus(message,attention=false){workspaceView.setSave(message,attention)}
 const celebrated=new Set(trusted.completed||[]);
 const xpView=mountLabXp(root,{onDismiss(step,advance){
  if(!alive()||step!==state.active)return;
  if(!advance){editor.focus({preventScroll:true});return}
  if(step<stages.length-1&&step+1<=available(trusted))chooseStage(step+1);
  else if(trusted.badge){
   layout.showMission();
   $('[data-finish] h3').focus();
  }
 }});
 function showCelebration(task,added,before){
  const stage=stages.findIndex(s=>s.id===task);
  if(stage<0||celebrated.has(task)||!(trusted.completed||[]).includes(task))return false;
  const maximum=Number(trusted.maximum)||300,to=Math.min(maximum,Math.max(0,Number(trusted.xp)||0)),from=Math.min(to,Math.max(0,before));
  const shown=xpView.show({stage,earned:added,from,to,maximum,finished:!!trusted.badge});
  if(shown)celebrated.add(task);
  return shown;
 }
 current={dispose,prepareSignOut};
 function feedback(text,error=false){layout.setStatus({message:text,error})}
 function persist(){try{localStorage.setItem(key,JSON.stringify({state,dirty,revision,pending,initialized:[...initialized]}));return true}catch{saveStatus('ذخیرهٔ مرورگر ممکن نیست؛ کدت را دانلود کن.',true);return false}}
 function change(){dirty=true;changed++;clearTimeout(localSaveTimer);localSaveTimer=setTimeout(()=>{localSaveTimer=null;if(alive())persist()},150);clearTimeout(autosave);if(conflict)saveStatus('کد محلی با نسخهٔ حساب تفاوت دارد. ابتدا کدت را دانلود کن؛ سپس نسخهٔ حساب را دریافت کن.',true);else{saveStatus('در حال ذخیره…');autosave=setTimeout(flush,1000)}}
 let flushPromise=null;
 function flush(){if(flushPromise)return flushPromise;flushPromise=flushDraft().finally(()=>{flushPromise=null;});return flushPromise;}
 async function flushDraft(){
  if(!alive()||saving||cloudLoading||!dirty||conflict)return;
  saving=true;const serial=changed;
  try{const remote=await saveDraft(JSON.parse(JSON.stringify(state)),revision);if(!alive())return;applyTrusted(remote);revision=Number(remote.revision);if(changed===serial){dirty=false;saveStatus('در حساب ذخیره شد.')}persist()}
  catch(error){if(!alive())return;conflict=/LAB_PROGRESS_CONFLICT/.test(String(error?.message));saveStatus(conflict?'نسخهٔ حساب تغییر کرده است. پیش از دریافت آن، کد محلی را دانلود کن.':'ذخیره در حساب کامل نشد. کد این مرورگر حفظ شده است.',true)}
  finally{saving=false;if(alive()&&dirty&&!conflict&&changed!==serial)autosave=setTimeout(flush,1000)}
 }
 async function prepareSignOut(){
  clearTimeout(autosave);clearTimeout(localSaveTimer);const localSaved=persist();
  for(let attempt=0;attempt<3&&alive()&&dirty&&!conflict&&!cloudLoading;attempt++)await flush();
  return {saved:!dirty,localSaved:persist()&&localSaved};
 }
 function applyTrusted(remote){
  if(remote?.mission!==missionId||!Number.isSafeInteger(remote.xp)||remote.xp<0||
     !Number.isSafeInteger(remote.maximum)||remote.maximum<=0||remote.xp>remote.maximum||
     !Array.isArray(remote.completed)||remote.completed.some(id=>!stages.some(step=>step.id===id)))
   throw Error('INVALID_LAB_SNAPSHOT');
  trusted={...remote,xp:Math.max(Number(trusted.xp||0),remote.xp),
   completed:[...new Set([...(trusted.completed||[]),...remote.completed])],badge:trusted.badge===true||remote.badge===true};
  progress();
 }
 function progress(){
  const completed=new Set(trusted.completed||[]),limit=available(trusted),busy=checking||['loading','running'].includes(phase);
  xpView.update({xp:Number(trusted.xp),maximum:Number(trusted.maximum),completed:completed.size,total:stages.length});
  renderMission();
  const done=completed.has(stages[state.active].id);
  layout.setStatus({nextVisible:state.active<stages.length-1&&done,nextDisabled:!done||busy||cloudLoading,finished:!!trusted.badge});
 }
 function sync(){const pre=$('[data-highlight]');pre.scrollTop=editor.scrollTop;pre.scrollLeft=editor.scrollLeft;$('.lab-lines').scrollTop=editor.scrollTop}
 function paint(){ $('[data-highlight]').innerHTML=highlight(editor.value)+'\n';$('.lab-lines').textContent=editor.value.split('\n').map((_,i)=>i+1).join('\n');sync() }
 function navigationBusy(){return !alive()||checking||cloudLoading||['loading','running'].includes(phase);}
 function renderMission(){
  missionView.render({steps:stages,active:state.active,limit:available(trusted),completed:new Set(trusted.completed||[]),
   busy:navigationBusy(),revealed:state.hints[state.active]});
 }
 function chooseStage(index){
  if(navigationBusy()||!Number.isInteger(index)||index<0||index>=stages.length||index>available(trusted)||index===state.active)return;
  state.codes[state.active]=editor.value;initialized.add(state.active);
  state.active=index;select(true);change();
 }
 function revealHint(){
  if(navigationBusy()||state.hints[state.active]>=stages[state.active].hints.length)return;
  state.hints[state.active]++;renderMission();change();
 }
 function missingImports(code){
  const present=new Set(code.split('\n').map(line=>line.replace(/\s+#.*$/,'').trimEnd()));
  return (model.imports||'').split('\n').filter(line=>line&&!present.has(line)).join('\n');
 }
 function starterCode(){
  const code=(state.active?state.codes[state.active-1]:'')+stages[state.active].starter;
  const missing=missingImports(code);return missing?missing+'\n\n'+code:code;
 }
 function select(focus=false){
  xpView.clear();
  if(!initialized.has(state.active)){state.codes[state.active]=starterCode();initialized.add(state.active);}
  editor.value=state.codes[state.active];explanation.value=state.explanation;hasRun=false;
  const isFinal=state.active===stages.length-1;
  layout.setStatus({reflection:isFinal});referenceView.selectStage(isFinal);
  layout.showMission();$('.lab-instruction-scroll').scrollTop=0;feedback('');
  workspaceView.clearOutput();
  tutor?.setStage(tutorContext());
  paint();controls();if(focus)$('#lab-task-title').focus();
 }
 function controls(message='',error=false,refreshProgress=true){
  const busy=checking||['loading','running'].includes(phase);
  layout.setStatus({busy});
  workspaceView.setControls({busy,running:['loading','running'].includes(phase),hasWorker:!!worker,
   canConsole:canRun&&!busy&&phase==='ready'&&hasRun,canImport:!busy&&!!missingImports(editor.value),
   canLoad:!previewOnly&&!busy&&!saving&&!cloudLoading,message,error});
  root.setAttribute('aria-busy',String(busy));experience.setBusy(busy);if(refreshProgress)progress();
 }
 function append(text){workspaceView.appendOutput(text)}
 function terminate(){referenceView.clearPreview();runWhenReady=false;clearTimeout(timer);epoch++;worker?.terminate();worker=null;hasRun=false;phase='idle'}
 function fail(message){terminate();controls(message,true)}
 function activateRuntime(){
  if(!canRun||!alive()||checking||worker)return;
  try{worker=simulated?options.createRuntimeWorker():new Worker(assetURL('coding-lab-worker.mjs'),{type:'module'});const generation=++epoch;phase='loading';controls(model.packages?'در حال آماده‌سازی Python، pandas و scikit-learn…':'در حال آماده‌سازی Python و NumPy…');timer=setTimeout(()=>fail('بارگذاری کامل نشد؛ اتصال را بررسی و دوباره فعال‌سازی کن.'),120000);
   worker.onerror=e=>{e.preventDefault?.();if(alive()&&generation===epoch)fail('محیط محلی دریافت نشد؛ اتصال اینترنت را بررسی کن. بررسی نهایی سرور مستقل از این محیط است.')};
   worker.onmessage=({data})=>{if(!alive()||generation!==epoch||data?.request!==activeRequest)return;
    if(data.type==='stage')controls('Python آماده است؛ در حال دریافت NumPy…');
    if(data.type==='preview'){void preview(data.value,data.request);return;}
    if(data.type==='ready'){clearTimeout(timer);phase='ready';controls();if(runWhenReady){runWhenReady=false;run('run')}}
    if(data.type==='load-error'){fail('دریافت محیط کامل نشد؛ اتصال را بررسی کن.');return}
    if(phase!=='running')return;
    if(data.type==='output')append(data.text);
    if(data.type==='error'||data.type==='done'){clearTimeout(timer);if(data.type==='error')append('\n'+data.text);if(!workspaceView.getOutput())append('# Finished. No printed output.\n');hasRun=true;phase='ready';controls()}
   };activeRequest=++request;worker.postMessage({type:'init',request:activeRequest,packages:model.packages||['numpy']})
  }catch{fail('محیط محلی باز نشد؛ مرورگر و اتصال را بررسی کن.')}
 };
 function run(type,code=editor.value){
  if(!canRun||!alive()||phase!=='ready'||checking||!code.trim())return;
  layout.openConsole();
  if(type==='console')append('>>> '+code+'\n');else workspaceView.clearOutput();
  phase='running';controls('در حال اجرا…');activeRequest=++request;
  timer=setTimeout(()=>{append('\n[Stopped: time limit]\n');fail('اجرا پس از ۱۵ ثانیه متوقف شد. کدت را بررسی و محیط را دوباره فعال کن.')},15000);
  if(type==='run')referenceView.clearPreview();worker.postMessage({type,code,bootstrap:type==='console'?undefined:bootstrap,
   previewCode:type==='run'&&state.active>=(model.previewFromStage??4)?model.previewCode:undefined,request:activeRequest});
 }
 function startRun(){
  if(!canRun||!alive()||checking||['loading','running'].includes(phase))return;
  layout.openConsole();
  if(phase==='idle'){runWhenReady=true;activateRuntime()}else run('run');
 }
 function stopRun(){
  if(!alive()||!['loading','running'].includes(phase))return;
  terminate();append('\n[Stopped]\n');controls();
 }
 function runCommand(){
  if(!canRun||!hasRun||phase!=='ready'||checking)return;
  const code=command.value;
  if(code.trim()){command.value='';run('console',code);}
 }
 function editCode(){
  if(!alive())return;
  state.codes[state.active]=editor.value;hasRun=false;change();
  if(typeof requestAnimationFrame==='function'){
   if(paintFrame===null)paintFrame=requestAnimationFrame(()=>{paintFrame=null;if(alive())paint()});
  }else paint();
  controls(undefined,false,false);
 }
 let escapeTab=false;
 function editorShortcut(e){
  if(e.isComposing)return;
  if(e.key==='Escape'){escapeTab=true;return;}
  if(e.key==='Tab'&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!escapeTab&&!navigationBusy()){
   e.preventDefault();
   if(editor.value.length-(editor.selectionEnd-editor.selectionStart)+4<=20000){
    editor.setRangeText('    ',editor.selectionStart,editor.selectionEnd,'end');editCode();
   }
  }else if(canRun&&(e.ctrlKey||e.metaKey)&&e.key==='Enter'){
   e.preventDefault();startRun();
  }
  escapeTab=false;
 }
 function addImports(){
  if(navigationBusy())return;
  const missing=missingImports(editor.value);if(!missing)return;
  if(/^\s*from\s+__future__\b/m.test(editor.value)){saveStatus('کد شامل __future__ است؛ importهای ابزارها را پس از آن اضافه کن.',true);return;}
  const prefix=missing+'\n\n';
  if(editor.value.length+prefix.length>20000){saveStatus('برای افزودن importها، چند خط از کد را کوتاه کن؛ سقف ویرایشگر ۲۰٬۰۰۰ نویسه است.',true);return;}
  const start=editor.selectionStart,end=editor.selectionEnd,top=editor.scrollTop,left=editor.scrollLeft;
  editor.value=prefix+editor.value;editor.selectionStart=start+prefix.length;editor.selectionEnd=end+prefix.length;
  editCode();paint();editor.scrollTop=top;editor.scrollLeft=left;sync();toolsMenu.open=false;editor.focus();
 };
 function resetCode(){if(navigationBusy()||!confirm('کد این تسک با قالب آغازین جایگزین شود؟ XP قبلی حفظ می‌شود.'))return;state.codes[state.active]=starterCode();select();change()};
 function downloadCode(){const text=bootstrap+'\n'+editor.value+'\n# Reflection\n'+state.explanation.split('\n').map(l=>'# '+l).join('\n'),href=URL.createObjectURL(new Blob([text],{type:'text/x-python;charset=utf-8'})),a=document.createElement('a');a.href=href;a.download=`${meta.downloadPrefix||missionId}-${stages[state.active].id}.py`;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000)};
 function pollDelay(ms,signal){return new Promise((resolve,reject)=>{const cancel=()=>{clearTimeout(pollTimer);reject(new Error('Aborted'))};signal.addEventListener('abort',cancel,{once:true});pollTimer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve()},ms)})}
 async function submitAnswer(){
  if(previewOnly||navigationBusy())return;
  if(!editor.value.trim()){experience.showFeedback({code:'EMPTY_CODE'},'failed',stages[state.active]);return}
  const checkedStage=stages[state.active],returnPoint=experience.capture();
  const task=checkedStage.id,code=editor.value,xpBefore=Number(trusted.xp||0);
  if(!pending||pending.task!==task||pending.code!==code)pending={task,code,request_id:crypto.randomUUID()};
  persist();xpView.clear();checking=true;controller=new AbortController();controls('در حال بررسی پاسخ…');feedback('');
  try{
   let result=await submit({mission:missionId,...pending},controller.signal);
   for(let i=0;result?.status==='running'&&i<40&&!controller.signal.aborted;i++){await pollDelay(1500,controller.signal);const found=await getAttempt(pending.request_id);if(found)result=found}
   if(!alive()||controller.signal.aborted)return;
   if(result?.status==='running'){experience.showFeedback({code:'CHECK_PENDING'},'error',checkedStage,returnPoint);return}
   if(!result?.snapshot||!['passed','failed','error'].includes(result.status))throw Error('INVALID_SERVER_RESPONSE');
   applyTrusted(result.snapshot);document.dispatchEvent(new CustomEvent('classroom-progress-changed'));pending=null;persist();
   if(result.status!=='passed')experience.showFeedback(result.feedback,result.status,checkedStage,returnPoint);
   else if(Array.isArray(result.snapshot.completed)&&result.snapshot.completed.includes(task)&&
           showCelebration(task,Number(result.xp_added),xpBefore))experience.rememberFeedback({code:'PASSED'},'passed',checkedStage);
   else experience.showFeedback({code:'ALREADY_PASSED'},'passed',checkedStage,returnPoint);
  }catch(error){if(alive()&&!controller.signal.aborted&&error?.name!=='AbortError')experience.showFeedback({code:error?.code||'CHECK_UNAVAILABLE'},'error',checkedStage,returnPoint)}
  finally{checking=false;if(alive())controls()}
 };
 async function refreshProgress(){if(previewOnly)return;try{const remote=await refresh();if(alive()){applyTrusted(remote);feedback('پیشرفت ثبت‌شدهٔ حساب دریافت شد.')}}catch{if(alive())feedback('دریافت پیشرفت کامل نشد؛ اتصال را بررسی کن.',true)}};
 async function loadCloudDraft(){
  if(previewOnly||saving||checking||cloudLoading||['running','loading'].includes(phase))return;
  if(dirty&&!confirm('کد محلی با نسخهٔ حساب جایگزین شود؟ برای نگهداری تغییرها، ابتدا کدت را دانلود کن.'))return;
  cloudLoading=true;clearTimeout(autosave);const before=changed;controls();
  try{const remote=await refresh();if(!alive())return;if(changed!==before){saveStatus('هنگام دریافت، کدت تغییر کرد؛ تغییرهای تازه حفظ شدند.',true);return}applyTrusted(remote);revision=Number(remote.revision);conflict=false;if(remote.draft){state=normalize(remote.draft);resetInitialized(remote.draft);state.active=Math.min(state.active,available(trusted));dirty=false;persist();select();saveStatus('نسخهٔ حساب دریافت شد.')}else{dirty=true;changed++;cloudLoading=false;await flush()}}
  catch{if(alive())saveStatus('نسخهٔ حساب دریافت نشد؛ کد محلی حفظ شده است.',true)}
  finally{cloudLoading=false;if(alive())controls()}
 };
 function pagehide(){tutorSuspended=true;tutor?.close(false);experience.close(false);xpView.clear();clearTimeout(localSaveTimer);persist();controller?.abort();terminate();if(alive())controls('برای ادامه محیط محلی را دوباره فعال کن.')}
 function pageshow(event){
  tutorSuspended=false;
  if(event.persisted&&alive()){experience.start();void openTutor();}
 }
 function dispose(){if(disposed)return;clearTimeout(localSaveTimer);if(paintFrame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(paintFrame);persist();disposed=true;document.body.classList.remove('lab-notebook-ready');root.classList.remove('lab-open-notebook');experience.dispose();missionView.dispose();referenceView.dispose();xpView.dispose();workspaceView.dispose();tutor?.dispose();options.onFrameDispose?.(root);layout.dispose();root.removeEventListener('click',dismissTools);root.removeEventListener('keydown',closeTools);clearTimeout(autosave);clearTimeout(pollTimer);controller?.abort();terminate();window.removeEventListener('pagehide',pagehide);window.removeEventListener('pageshow',pageshow);if(current?.dispose===dispose)current=null}
 window.addEventListener('pagehide',pagehide);window.addEventListener('pageshow',pageshow);select();persist();saveStatus(conflict?'نسخهٔ محلی با حساب تفاوت دارد؛ پیش از دریافت نسخهٔ حساب، کدت را دانلود کن.':dirty?'کد این مرورگر بازیابی شد.':'ذخیرهٔ خودکار فعال است.',conflict);experience.start();return current
}
window.ClassNotesCodingLab={mount,dispose:()=>{mountTicket++;current?.dispose()},prepareSignOut:()=>current?.prepareSignOut()||Promise.resolve({saved:true})};
})();

