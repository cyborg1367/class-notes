export const INITIAL_COURSE_VIEW=Object.freeze({phase:'loading',ownerId:null,opened:[],last:null,results:{},busy:null,error:''});

// Project only the current course/current quiz version. Opening a note is not
// completion. This adapter never reads, calculates or awards lab XP.
export function projectCourseView(course,context,links) {
  const base={...INITIAL_COURSE_VIEW,loginURL:links.login, dashboardURL:links.dashboard};
  if(!context.ready)return base;
  if(context.error)return{...base,phase:'error',ownerId:context.userId||null};
  if(!context.userId)return{...base,phase:'guest'};
  const membership=context.memberships?.find(item=>item.course_id===course.id);
  const status=membership?.status;
  const phase=status==='active'?'active':status==='pending'?'pending':status==='suspended'?'suspended':membership?'restricted':'unregistered';
  if(phase!=='active')return{...base,phase,ownerId:context.userId};
  const ids=new Set(course.lessons.map(lesson=>lesson.id));
  const results={};
  for(const lesson of course.lessons){
    const result=context.results?.find(item=>item.lesson_id===lesson.id&&Number(item.version)===Number(lesson.quiz_version));
    if(!result||!lesson.quiz_version)continue;
    results[lesson.id]={version:Number(result.version),score:typeof result.last_score==='number'&&Number.isFinite(result.last_score)?result.last_score:null,
      maximum:typeof result.maximum==='number'&&Number.isFinite(result.maximum)?result.maximum:null,
      href:typeof result.last_id==='string'?links.result(lesson.id,result.last_id):null};
  }
  return{...base,phase,ownerId:context.userId,opened:(context.study?.opened||[]).filter(id=>ids.has(id)),
    last:ids.has(context.study?.last)?context.study.last:null,results};
}

