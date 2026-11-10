import React from 'react';
import {renderToString} from 'react-dom/server';
import {Course} from './course/CoursePage';
import {CourseApplication} from './course/CourseApplication';
import {createViewChannel} from '../web/assets/view-channel.mjs';
import {INITIAL_COURSE_VIEW} from '../web/assets/course-view-model.mjs';
import {shellModel,ShellPage} from './shell/shell-model';
import {SiteHeader} from './shell/SiteHeader';
import {SiteFooter} from './shell/SiteFooter';
import {HomePage} from './home/HomePage';
import {HomeCourseList} from './home/PublishedCourses';
import type {PublicCourse} from './catalog/types';
import {INITIAL_HOME_VIEW} from '../web/assets/home-view-model.mjs';
import {createAccountController} from '../web/assets/account-controller.mjs';
import type {AccountPort,AccountLinks} from './account/contracts';
import {AccountPage} from './account/AccountPage';
import {AccountControls} from './account/AccountControls';
import {accountLinks} from './account/account-links';
import {AboutPage} from './about/AboutPage';
export function renderCourse(course:Course){
  return renderToString(<CourseApplication course={course} channel={createViewChannel(INITIAL_COURSE_VIEW)}/>,{identifierPrefix:'course-'});
}
export function renderShell(page:ShellPage){
  const model=shellModel(page);
  return{header:renderToString(<SiteHeader model={model} account={createAccountController({links:model.accountLinks}) as AccountPort}/>,{identifierPrefix:'site-header-'}),
    footer:renderToString(<SiteFooter model={model}/>,{identifierPrefix:'site-footer-'})};
}
export function renderHome(catalog:PublicCourse[]){
  return renderToString(<HomePage catalog={catalog} channel={createViewChannel(INITIAL_HOME_VIEW)}/>,{identifierPrefix:'home-'});
}
export function renderHomeCourses(catalog:PublicCourse[]){
  return renderToString(<HomeCourseList catalog={catalog}/>);
}

export function renderAccountPage(){
  return renderToString(<AccountPage port={createAccountController({links:accountLinks('../')}) as AccountPort}/>,{identifierPrefix:'account-page-'});
}
export function renderAbout(){
  return renderToString(<AboutPage/>,{identifierPrefix:'about-'});
}
export function renderAccountControls(input:unknown,links:AccountLinks,scope:string,compact=false){
  const controller=createAccountController({links}) as AccountPort;
  controller.update(input);
  const port={...controller,getServerSnapshot:controller.getSnapshot};
  return renderToString(<AccountControls port={port} scope={scope} compact={compact}/>);
}
