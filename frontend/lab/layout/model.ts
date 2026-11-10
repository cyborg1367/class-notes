export const tabs = [
  { id:'mission',label:'مأموریت',className:'lab-task' },
  { id:'data',label:'داده‌ها',className:'mission-dataset' },
  { id:'guide',label:'راهنما',className:'mission-guide' },
  { id:'assistant',label:'دستیار',className:'' },
] as const;
export type Tab = typeof tabs[number]['id'];
export type LayoutState = {
  tab: Tab;
  sidebarHidden: boolean;
  consoleMode: 'normal' | 'collapsed' | 'focus';
  editorShare: number;
  panelShare: number;
};
export type SplitAxis = 'row' | 'column';

const layoutKey='classroom-lab-layout:v2', panelKey='classroom-lab-panel-width:v1';
export const defaultShare={row:67,column:41.85};
const finite = (value: unknown, fallback: number) => typeof value==='number'&&Number.isFinite(value)?value:fallback;

export function splitBounds(axis: SplitAxis,size: number) {
  if(axis==='row'){
    const usable=Math.max(1,size-12);
    return {min:Math.max(20,Math.min(55,160/usable*100)),max:Math.min(85,Math.max(60,100-110/usable*100))};
  }
  const usable=Math.max(1,size-8);
  const minimum=Math.min(320,usable*.45),maximum=Math.max(minimum,Math.min(900,usable-420));
  return {min:minimum/usable*100,max:maximum/usable*100};
}
export function boundedShare(axis: SplitAxis,value: number,size: number) {
  const {min,max}=splitBounds(axis,size);
  return Math.min(max,Math.max(min,finite(value,defaultShare[axis])));
}
export function tabAfter(tab: Tab,key: string,visible: readonly Tab[],rtl: boolean) {
  const index=visible.indexOf(tab);
  if(index<0)return null;
  if(key==='Home')return visible[0];
  if(key==='End')return visible[visible.length-1] || null;
  if(key!=='ArrowLeft'&&key!=='ArrowRight')return null;
  const step=(key==='ArrowRight')!==rtl?1:-1;
  return visible[(index+step+visible.length)%visible.length];
}

export function createLabLayout(storage: Storage | null) {
  function read(key: string): unknown {
    try{return JSON.parse(storage?.getItem(key)||'null');}catch{return null;}
  }
  const saved=read(layoutKey);
  const prefs=saved&&typeof saved==='object'?saved as {ratio?:unknown;collapsed?:unknown}:{};
  let state: LayoutState={
    tab:'mission',sidebarHidden:false,consoleMode:prefs.collapsed===true?'collapsed':'normal',
    editorShare:finite(prefs.ratio,defaultShare.row),panelShare:finite(read(panelKey),defaultShare.column),
  };
  const listeners=new Set<()=>void>();
  function set(patch: Partial<LayoutState>) {
    if(!Object.entries(patch).some(([key,value])=>state[key as keyof LayoutState]!==value))return;
    state={...state,...patch};
    listeners.forEach(notify=>notify());
  }
  function save(axis: SplitAxis){
    try{
      if(axis==='row')storage?.setItem(layoutKey,JSON.stringify({ratio:state.editorShare,collapsed:state.consoleMode==='collapsed'}));
      else storage?.setItem(panelKey,JSON.stringify(state.panelShare));
    }catch{/* Presentation preferences are optional. */}
  }
  return {
    get:()=>state,
    subscribe(notify:()=>void){listeners.add(notify);return()=>{listeners.delete(notify);};},
    set,
    save,
    changeShare(axis: SplitAxis,value: number,remember: boolean){
      set(axis==='row'?{editorShare:value}:{panelShare:value});
      if(remember)save(axis);
    },
  };
}
export type LabLayout = ReturnType<typeof createLabLayout>;
export type LayoutControls = {
  layout: LabLayout;
  toggleSidebar(): void;
  toggleConsole(): void;
  toggleConsoleFocus(): void;
};
