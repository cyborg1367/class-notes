import React from 'react';
import {hydrateRoot,Root} from 'react-dom/client';
import {Course} from './course/CoursePage';
import {CourseApplication} from './course/CourseApplication';
import {getViewChannel} from '../web/assets/view-channel.mjs';
import {INITIAL_COURSE_VIEW} from '../web/assets/course-view-model.mjs';
const roots=new Map<HTMLElement,Root>();
let resolveReady:()=>void;
export const ready=new Promise<void>(resolve=>{resolveReady=resolve});
export function mountCoursePage(host:HTMLElement){
  if(roots.has(host))return;
  let course:Course|undefined;
  try{
    const catalog=JSON.parse(document.querySelector('#catalog-data')?.textContent||'[]');
    course=Array.isArray(catalog)?catalog.find((item:Course)=>item.id===document.body.dataset.lessonId):undefined;
  }catch(error){console.warn('Course page:',error);resolveReady();return;}
  if(!course){resolveReady();return;}
  const channel=getViewChannel(host,INITIAL_COURSE_VIEW);
  const onReady=()=>{host.dataset.courseMounted='true';resolveReady()};
  const root=hydrateRoot(host,<CourseApplication course={course} channel={channel} onReady={onReady}/>,{
    identifierPrefix:'course-',
    onRecoverableError(error){host.dataset.reactRecovery='true';console.warn('Course render recovery:',error)},
  });
  roots.set(host,root);
}
export function disposeAll(){for(const [host,root] of roots){root.unmount();delete host.dataset.courseMounted}roots.clear()}
function boot(){document.querySelectorAll<HTMLElement>('[data-course-react-root]').forEach(mountCoursePage)}
window.ClassNotesCourseApp={ready,mountCoursePage,disposeAll};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
