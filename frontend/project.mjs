import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {coursePreviewPlugin} from './preview-plugin.mjs';
import {reviewPreviewPlugin} from './review-preview.mjs';
import {readerPreviewPlugin} from './reader-preview.mjs';
import {quizResultPreviewPlugin} from './quiz-result-preview.mjs';
import {instructorPreviewPlugin} from './instructor-preview.mjs';
import {labPreviewPlugin} from './lab-preview.mjs';
import {labMissionPreviewPlugin} from './lab-mission-preview.mjs';
import {labTutorPreviewPlugin} from './lab-tutor-preview.mjs';
import {labXpPreviewPlugin} from './lab-xp-preview.mjs';
import {notificationsPreviewPlugin} from './notifications-preview.mjs';
import {PUBLIC_RENDER_INPUTS} from './build/inputs.mjs';
export const projectRoot=fileURLToPath(new URL('../',import.meta.url));

export function pythonCommand(platform=process.platform,env=process.env,exists=existsSync){
  const candidate=env.VIRTUAL_ENV&&path.join(env.VIRTUAL_ENV,platform==='win32'?'Scripts/python.exe':'bin/python');
  return candidate&&exists(candidate)?candidate:platform==='win32'?'py':'python3';
}
export function run(command,args){
  return new Promise((resolve,reject)=>{
    const child=spawn(command,args,{cwd:projectRoot,stdio:'inherit',shell:false});
    child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error(`Command failed (${code}): ${path.basename(command)}`)));
  });
}
export function buildProject(frontend=true,check=false){
  return run(pythonCommand(),['-X','utf8','build.py',...(frontend||check?['--node',process.execPath]:[]),check?'--test':'--verify']);
}

async function dev(){
  await buildProject();
  const {createServer}=await import('vite');
  let server;
  let timer,busy=false,queued=false,needsFrontend=false;
  async function rebuild(){
    if(busy){queued=true;return}
    busy=true;const frontend=needsFrontend;needsFrontend=false;
    try{await buildProject(frontend);server.ws.send({type:'full-reload'});console.log('Local preview rebuilt.');}
    catch(error){console.error(error.message);console.error('The build did not finish. Fix the source error; the next edit will retry.');}
    finally{busy=false;if(queued){queued=false;clearTimeout(timer);timer=setTimeout(rebuild,250)}}
  }
  server=await createServer({configFile:false,root:path.join(projectRoot,'dist'),publicDir:false,appType:'mpa',
    // Assets in dist are already built; only fixture modules need Vite analysis.
    server:{host:'127.0.0.1',port:5173,strictPort:true,preTransformRequests:false,fs:{strict:true,allow:[path.join(projectRoot,'dist')]}},
    plugins:[notificationsPreviewPlugin(projectRoot),labTutorPreviewPlugin(projectRoot),labXpPreviewPlugin(projectRoot),labMissionPreviewPlugin(projectRoot),labPreviewPlugin(projectRoot),instructorPreviewPlugin(projectRoot),quizResultPreviewPlugin(projectRoot),readerPreviewPlugin(projectRoot),reviewPreviewPlugin(projectRoot),coursePreviewPlugin(projectRoot)],
  });
  await server.listen();
  const buildFiles=['build.py','build_assets.py','build_lock.py','check.py'];
  const watched=['web','frontend',...buildFiles].map(name=>path.join(projectRoot,name));
  server.watcher.add(watched);
  server.watcher.on('all',(_event,file)=>{
    const relative=path.relative(projectRoot,file).replaceAll('\\','/');
    if(relative.startsWith('dist/')||relative.startsWith('.cache/')||relative.startsWith('frontend/generated/')||relative.startsWith('web/assets/react/')||['web/assets/course-index.js','web/assets/site-shell.js','web/assets/homepage.js','web/assets/account-page.js','web/assets/dashboard-page.js'].includes(relative))return;
    if(!relative.startsWith('web/')&&!relative.startsWith('frontend/')&&!buildFiles.includes(relative))return;
    needsFrontend ||= relative.startsWith('frontend/')||relative==='web/assets/catalog.json'||PUBLIC_RENDER_INPUTS.includes(relative);
    clearTimeout(timer);timer=setTimeout(rebuild,250);
  });
  console.log('\nLocal course: http://127.0.0.1:5173/machine-learning/');
  console.log('Isolated UI states: http://127.0.0.1:5173/__preview__/course/?state=guest');
  console.log('Sample dashboard: http://127.0.0.1:5173/__preview__/dashboard/');
  console.log('Sample review notebook: http://127.0.0.1:5173/__preview__/review/');
  console.log('Sample lesson reader: http://127.0.0.1:5173/__preview__/lesson/');
  console.log('Sample quiz result: http://127.0.0.1:5173/__preview__/quiz-result/');
  console.log('Sample instructor panel: http://127.0.0.1:5173/__preview__/instructor/');
  console.log('Preview fixtures make no Supabase, grading or XP requests. Ctrl+C stops this server.\n');
  const stop=async()=>{clearTimeout(timer);await server.close();process.exit(0)};
  process.once('SIGINT',stop);process.once('SIGTERM',stop);
}
async function main(){
 const command=process.argv[2]||'build';
 if(command==='dev')await dev();
 else if(command==='build')await buildProject();
 else if(command==='frontend')await run(pythonCommand(),['-X','utf8','build.py','--node',process.execPath,'--frontend-only']);
 else if(command==='check')await buildProject(true,true);
 else throw Error('Unknown command');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1});
