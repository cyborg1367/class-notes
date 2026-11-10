import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { KeyboardEvent } from 'react';
import { LabFrame, type FrameActions, type FrameOptions, type FrameStatus } from './LabFrame';
import { createLabLayout, tabs, type LayoutControls, type Tab } from '../layout/model';

export function mountLabFrame(root:HTMLElement,options:FrameOptions,actions:FrameActions){
  let storage:Storage|null=null;
  try{storage=root.ownerDocument.defaultView?.localStorage||null;}catch{/* Optional preference storage. */}
  const layout=createLabLayout(storage);
  let status:FrameStatus={storyOpen:false,reflection:false,busy:false,finished:false,nextVisible:false,nextDisabled:true,message:'',error:false};
  let disposed=false;
  const listeners=new Set<()=>void>();
  const channel={
    get:()=>status,
    subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};},
  };
  function setStatus(patch:Partial<FrameStatus>){
    if(disposed||!Object.entries(patch).some(([key,value])=>status[key as keyof FrameStatus]!==value))return;
    flushSync(()=>{status={...status,...patch};listeners.forEach(listener=>listener());});
  }
  const activeTab=()=>status.storyOpen||layout.get().sidebarHidden?null:layout.get().tab;
  function publish(before:Tab|null,again=false){
    const current=activeTab();
    if(again||before!==current)actions.onTabChange(current);
  }
  function change(patch:Parameters<typeof layout.set>[0],notify=false){
    if(disposed)return;
    const before=activeTab();
    flushSync(()=>layout.set(patch));
    if(notify)publish(before);
  }
  function selectTab(tab:Tab,focus=false){
    if(disposed||!tabs.some(item=>item.id===tab)||(tab==='assistant'&&!options.assistant))return;
    const before=activeTab();
    change({tab});
    if(focus&&activeTab()===tab)root.querySelector<HTMLElement>('#lab-tab-'+tab)?.focus({preventScroll:true});
    publish(before,true);
  }
  const layoutControls:LayoutControls={
    layout,
    toggleSidebar(){change({sidebarHidden:!layout.get().sidebarHidden},true);},
    toggleConsole(){
      change({consoleMode:layout.get().consoleMode==='collapsed'?'normal':'collapsed'});
      layout.save('row');
    },
    toggleConsoleFocus(){change({consoleMode:layout.get().consoleMode==='focus'?'normal':'focus'});},
  };
  function escape(event:KeyboardEvent<HTMLElement>){
    if(event.key!=='Escape'||event.nativeEvent.isComposing||event.nativeEvent.defaultPrevented||
       root.querySelector('dialog[open]')||(event.target as Element).closest?.('details[open]'))return;
    if(layout.get().consoleMode==='focus')change({consoleMode:'normal'});
    else if(layout.get().sidebarHidden)change({sidebarHidden:false},true);
  }
  const view=createRoot(root,{identifierPrefix:'lab-frame-'});
  flushSync(()=>view.render(<LabFrame options={options} layout={layout} channel={channel}
    actions={{...actions,selectTab,escape,changePanel:(value,remember)=>flushSync(()=>layout.changeShare('column',value,remember))}} />));
  return {
    layoutControls,activeTab,selectTab,setStatus,
    openConsole(){change({consoleMode:'normal'});layout.save('row');},
    showMission(){
      change({tab:'mission',sidebarHidden:false,consoleMode:layout.get().consoleMode==='focus'?'normal':layout.get().consoleMode},true);
    },
    setStoryVisible(storyOpen:boolean){
      const before=activeTab();
      setStatus({storyOpen});
      publish(before);
    },
    dispose(){
      if(disposed)return;
      disposed=true;view.unmount();listeners.clear();
    },
  };
}
