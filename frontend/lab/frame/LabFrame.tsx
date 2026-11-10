import { useSyncExternalStore, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { PaperIcon } from '../../components/PaperIcon';
import { tabAfter, tabs, type LabLayout, type Tab } from '../layout/model';
import { useSplitter } from '../layout/useSplitter';

export type FrameOptions = {
  title:string; finish:string; stageCount:number; assistant:boolean;
  links:{home:string;lesson:string;quiz:string;course:string;dashboard:string};
};
export type FrameStatus = {
  storyOpen:boolean; reflection:boolean; busy:boolean; finished:boolean;
  nextVisible:boolean; nextDisabled:boolean; message:string; error:boolean;
};
type StatusChannel = {get():FrameStatus;subscribe(listener:()=>void):()=>void};
export type FrameActions = {
  onTabChange(tab:Tab|null):void;
  showHints():void;
  next():void;
  editReflection(value:string):void;
};
type ViewActions = Omit<FrameActions,'onTabChange'> & {
  selectTab(tab:Tab,focus:boolean):void;
  escape(event:KeyboardEvent<HTMLElement>):void;
  changePanel(value:number,remember:boolean):void;
};

function LabHeader({options,storyOpen}:{options:FrameOptions;storyOpen:boolean}){
  const {title,links}=options;
  return <header className="lab-top mission-top lab-mission-header" dir="rtl">
    <div className="lab-mission-heading">
      <div className="lab-heading-copy">
        <h1>{title}</h1><button className="lab-story-review" data-story-review="" type="button" hidden={storyOpen}>مرور داستان</button>
      </div>
      <nav className="mission-navigation" aria-label="مراحل مأموریت">
        <span className="mission-navigation-label">مسیر مأموریت</span>
        <ol data-react-mission-path="" className="mission-path" aria-label="مراحل مأموریت" />
      </nav>
    </div>
    <div className="lab-header-utilities">
      <div data-react-lab-xp="" style={{display:'contents'}} />
      <div className="lab-identity">
        <a className="lab-wordmark" href={links.home}><strong>دفتر کلاس</strong><small lang="en" dir="ltr">CLASS NOTES</small></a>
        <div data-lab-account="" />
      </div>
      <nav className="lab-site-links" aria-label="پیمایش لابراتور">
        <a href={links.lesson}>یادگیری</a><a href={links.quiz}>تمرین‌ها</a><a href={links.course}>مسیرها</a>
        <span data-lab-presence-slot="" style={{display:'contents'}} />
      </nav>
    </div>
  </header>;
}

const fa=new Intl.NumberFormat('fa-IR');
function MissionPanel({options,status,actions}:{options:FrameOptions;status:FrameStatus;actions:ViewActions}){
  return <>
    <div data-react-mission-brief="" />
    <div className="mission-task-actions">
      <button type="button" className="lab-hint-button" data-show-hints="" onClick={actions.showHints}><PaperIcon name="hint" />راهنمایی</button>
      {options.assistant&&<button type="button" className="lab-help-button" data-tutor-open="" onClick={()=>actions.selectTab('assistant',true)}>کمک آموزشی</button>}
    </div>
    <div data-reflection="" hidden={!status.reflection}>
      <label htmlFor="lab-explanation">پیش‌بینی و نتیجهٔ آزمایش تو</label>
      <textarea id="lab-explanation" maxLength={3000} rows={3} disabled={status.busy}
        onInput={event=>actions.editReflection(event.currentTarget.value)}
        placeholder="پیش از اجرا چه حدسی داشتی؟ پس از اجرا چه چیزی فهمیدی؟" />
    </div>
    <div className="lab-feedback" data-feedback="" role="status" aria-live="polite" hidden={!status.message} data-error={status.error}>{status.message}</div>
    <button type="button" className="button-forest lab-next" data-next="" hidden={!status.nextVisible} disabled={status.nextDisabled}
      onClick={actions.next}>مرحلهٔ بعد ←</button>
    <div className="lab-finish" data-finish="" hidden={!status.finished}>
      <span className="mission-seal" aria-hidden="true">✓</span><h3 tabIndex={-1}>{options.finish}</h3>
      <p>هر {options.stageCount===6?'شش':fa.format(options.stageCount)} مرحله را انجام دادی.</p>
      <a href={options.links.dashboard}>دیدن مسیر رشد در داشبورد ←</a>
    </div>
  </>;
}

function LabTabs({visible,active,select}:{visible:typeof tabs[number][];active:Tab;select:ViewActions['selectTab']}){
  function keydown(event:KeyboardEvent<HTMLButtonElement>,id:Tab){
    if(event.altKey||event.ctrlKey||event.metaKey||event.nativeEvent.isComposing)return;
    const list=event.currentTarget.parentElement;
    const rtl=!!list && list.ownerDocument.defaultView?.getComputedStyle(list).direction==='rtl';
    const next=tabAfter(id,event.key,visible.map(item=>item.id),rtl);
    if(next){event.preventDefault();select(next,true);}
  }
  return <div className="lab-tabs" role="tablist" dir="ltr" aria-label="راهنمای لابراتور" aria-orientation="horizontal">
    {visible.map(({id,label})=><button key={id} id={'lab-tab-'+id} data-lab-tab={id} role="tab" type="button"
      aria-controls={'lab-panel-'+id} aria-selected={active===id} tabIndex={active===id?0:-1}
      onClick={()=>select(id,false)} onKeyDown={event=>keydown(event,id)}>{label}</button>)}
  </div>;
}

export function LabFrame({options,layout,channel,actions}:{
  options:FrameOptions;layout:LabLayout;channel:StatusChannel;actions:ViewActions;
}){
  const state=useSyncExternalStore(layout.subscribe,layout.get);
  const status=useSyncExternalStore(channel.subscribe,channel.get);
  const splitter=useSplitter({
    axis:'column',share:state.panelShare,disabled:state.sidebarHidden||status.storyOpen,
    change:actions.changePanel,save:()=>layout.save('column'),
  });
  const visible=tabs.filter(item=>options.assistant||item.id!=='assistant');
  const panels:Record<Tab,ReactNode>={
    mission:<MissionPanel options={options} status={status} actions={actions} />,
    data:<div data-react-lab-dataset="" style={{display:'contents'}} />,
    guide:<><p className="lab-panel-kicker">وقتی به کمک نیاز داری</p><h2>قدم بعدی را پیدا کن</h2>
      <div data-react-mission-hints="" /><div data-react-lab-guide="" style={{display:'contents'}} /></>,
    assistant:<div data-lab-tutor-host="" style={{display:'contents'}} />,
  };
  const style={'--lab-panel-share':splitter.ratio+'fr','--lab-code-share':100-splitter.ratio+'fr'} as CSSProperties;
  return <>
    <LabHeader options={options} storyOpen={status.storyOpen} />
    <div data-lab-intro-slot="" style={{display:'contents'}} />
    <div ref={splitter.container} data-react-lab-frame="" onKeyDown={actions.escape}
      className={'lab-workspace'+(state.sidebarHidden?' is-focused':'')+(splitter.dragging?' is-panel-resizing':'')}
      hidden={status.storyOpen} inert={status.storyOpen} style={style}>
      <aside id="lab-instructions" className={'lab-instructions'+(state.tab==='assistant'?' is-tutor-active':'')}
        aria-label="پنل مأموریت" hidden={state.sidebarHidden}>
        <LabTabs visible={visible} active={state.tab} select={actions.selectTab} />
        <div className="lab-instruction-scroll">
          {visible.map(({id,className})=><section key={id} className={className||undefined} id={'lab-panel-'+id}
            role="tabpanel" aria-labelledby={'lab-tab-'+id} tabIndex={state.tab===id?0:-1} hidden={state.tab!==id}>{panels[id]}</section>)}
        </div>
      </aside>
      <div className="lab-panel-resizer" data-panel-resizer="" role="separator" aria-label="تغییر عرض پنل راهنما و دستیار"
        aria-orientation="vertical" aria-controls="lab-instructions lab-editor-panel" {...splitter.handle} />
      <section className="lab-editor-panel" id="lab-editor-panel" data-react-lab-workspace="" aria-label="ویرایشگر و خروجی" />
    </div>
    <div data-lab-feedback-slot="" style={{display:'contents'}} />
    <div data-lab-reward-slot="" style={{display:'contents'}} />
  </>;
}
