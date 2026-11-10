declare module '*.svg?raw' {const value:string;export default value}
interface Window {
  ClassNotesHome?:{mountHome:()=>void;dispose:()=>void};
  ClassNotesSiteUI?:{ready:Promise<void>;mountShell:()=>void;dispose:()=>void;mountAccountUI:(options:import('./account/runtime').AccountMountOptions)=>import('./account/runtime').AccountUI};
  ClassNotesAccountPage?:{ready:Promise<void>;mountAccountPage:()=>void;dispose:()=>void};
  ClassNotesCourseApp?:{ready:Promise<void>;mountCoursePage:(host:HTMLElement)=>void;disposeAll:()=>void};
}
