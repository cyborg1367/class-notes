// Read-only view model. XP and completion are accepted only from server snapshots.
function labView(lesson,result){
 if(!lesson.lab)return null;
 const s=result?.status==='fulfilled'?result.value:null;
 if(!s||s.mission!==lesson.lab.mission||!Array.isArray(s.tasks)||!s.tasks.length||!Number.isFinite(s.xp)||!Number.isFinite(s.maximum)||s.maximum<=0)return {status:'unavailable'};
 const tasks=[...s.tasks].sort((a,b)=>a.position-b.position),ids=new Set(tasks.map(t=>t.id));
 const completed=new Set((Array.isArray(s.completed)?s.completed:[]).filter(id=>ids.has(id)));
 const next=tasks.find(t=>!completed.has(t.id));
 return {status:'ready',xp:Math.max(0,Math.min(s.maximum,s.xp)),maximum:s.maximum,tasks,completed,done:completed.size,count:tasks.length,finished:s.badge===true&&completed.size===tasks.length,nextTitle:(lesson.lab_steps||[]).find(t=>t.id===next?.id)?.title||'مأموریت بعدی',attempts:Number(s.attempts)||0};
}
export function dashboardModel({courses,results=[],study={},states={}}){
 const lessons=courses.flatMap(course=>course.lessons.map(lesson=>{
  const read=study[course.id]||{},opened=Array.isArray(read.opened)&&read.opened.includes(lesson.id),last=read.last===lesson.id;
  const quiz=results.filter(r=>r.lesson_id===lesson.id&&Number(r.version)===Number(lesson.quiz_version)&&Number(r.attempts)>0).sort((a,b)=>(Date.parse(b.last_at)||0)-(Date.parse(a.last_at)||0))[0]||null;
  return {...lesson,course,opened,last,quiz,progress:labView(lesson,states[lesson.id])};
 }));
 const labs=lessons.filter(l=>l.lab),ready=labs.filter(l=>l.progress.status==='ready'),incomplete=ready.filter(l=>!l.progress.finished);
 const started=incomplete.filter(l=>l.progress.done>0||l.progress.attempts>0);
 let target=started.find(l=>l.last)||started[0]||null,mode=target?'lab':null;
 const incompleteUnknown=labs.some(l=>l.progress.status!=='ready');
 if(!target&&incompleteUnknown){mode='unavailable';target=labs.find(l=>l.progress.status!=='ready')}
 if(!target){target=incomplete.find(l=>l.last&&l.opened)||incomplete.find(l=>l.opened)||null;if(target)mode='lab'}
 if(!target&&labs.length&&ready.length===labs.length&&ready.every(l=>l.progress.finished)){target=labs.at(-1);mode='complete'}
 if(!target){target=lessons.find(l=>!l.opened&&(!l.progress||!l.progress.finished))||null;if(target)mode='study'}
 if(!target&&incomplete.length){target=incomplete[0];mode='lab'}
 if(!target&&labs.length&&ready.every(l=>l.progress.finished)){target=labs.at(-1);mode='complete'}
 if(!target&&lessons.length){target=lessons.find(l=>l.last)||lessons[0];mode='study'}
 const skills=[...new Set(ready.flatMap(l=>(l.practice_skills||[]).filter(s=>l.progress.completed.has(s.task)).map(s=>s.label)))];
 const known=labs.length>0&&!incompleteUnknown;
 return {courses,lessons,labs,target,mode,skills,known,hasLabs:labs.length>0,xp:known?ready.reduce((sum,l)=>sum+l.progress.xp,0):null,maximum:known?ready.reduce((sum,l)=>sum+l.progress.maximum,0):null};
}
