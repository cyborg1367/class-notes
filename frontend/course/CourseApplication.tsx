import React,{useEffect,useSyncExternalStore} from 'react';
import {CoursePage,Course,CourseView} from './CoursePage';
import {INITIAL_COURSE_VIEW} from '../../web/assets/course-view-model.mjs';
type Channel={subscribe:(listener:()=>void)=>()=>void;getSnapshot:()=>CourseView;perform:(name:string)=>Promise<unknown>};
export function CourseApplication({course,channel,onReady}:{course:Course;channel:Channel;onReady?:()=>void}){
 const view=useSyncExternalStore(channel.subscribe,channel.getSnapshot,()=>INITIAL_COURSE_VIEW) as CourseView;
 useEffect(()=>{onReady?.()},[onReady]);
 return <CoursePage course={course} view={view} channel={channel}/>;
}
