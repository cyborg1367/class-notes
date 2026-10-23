// Presentation preferences only. This module never reads or writes mission XP.
export function splitBounds(height=560){
 const usable=Math.max(1,(Number(height)||560)-12);
 return {min:Math.max(20,Math.min(55,160/usable*100)),max:Math.min(85,Math.max(60,100-110/usable*100))};
}
export function clampSplit(value,height){const {min,max}=splitBounds(height);return Math.min(max,Math.max(min,Number.isFinite(Number(value))?Number(value):67))}

export function mountLayout(root,{storage}={}){
 if(storage===undefined){try{storage=globalThis.localStorage}catch{storage=null}}
 const $=s=>root.querySelector(s),win=root.ownerDocument.defaultView;
 const area=$('[data-split]'),separator=$('[data-resizer]'),consoleBody=$('[data-console-body]'),toggle=$('[data-console-toggle]'),workspace=$('.lab-workspace'),aside=$('.lab-instructions'),focus=$('[data-focus]');
 const key='classroom-lab-layout:v2';let saved={};try{saved=JSON.parse(storage?.getItem(key)||'{}')||{}}catch{}
 let ratio=clampSplit(saved.ratio),collapsed=saved.collapsed===true,drag=null,disposed=false,consoleFocused=false;
 const consoleFocus=$('[data-output-focus]'),codeRegion=$('.lab-code-wrap');
 const height=()=>area.getBoundingClientRect().height||560;
 function persist(){try{storage?.setItem(key,JSON.stringify({ratio,collapsed}))}catch{}}
 function render(){
  ratio=clampSplit(ratio,height());area.style.setProperty('--editor-share',`${ratio}fr`);area.style.setProperty('--console-share',`${100-ratio}fr`);
  const bounds=splitBounds(height());separator.setAttribute('aria-valuemin',String(Math.round(bounds.min)));separator.setAttribute('aria-valuemax',String(Math.round(bounds.max)));separator.setAttribute('aria-valuenow',String(Math.round(ratio)));separator.setAttribute('aria-valuetext',`${Math.round(ratio)}% editor`);
  area.classList.toggle('is-console-collapsed',collapsed);area.classList.toggle('is-console-focused',consoleFocused);consoleBody.hidden=collapsed;separator.hidden=collapsed||consoleFocused;
  if(codeRegion)codeRegion.hidden=consoleFocused;
  if(consoleFocus){consoleFocus.setAttribute('aria-pressed',String(consoleFocused));consoleFocus.setAttribute('aria-label',consoleFocused?'بازگرداندن اندازهٔ خروجی':'بزرگ‌کردن خروجی');consoleFocus.title=consoleFocused?'بازگرداندن اندازهٔ خروجی':'بزرگ‌کردن خروجی'}
  toggle.setAttribute('aria-expanded',String(!collapsed));toggle.setAttribute('aria-label',collapsed?'نمایش خروجی':'جمع کردن خروجی');toggle.title=collapsed?'نمایش خروجی':'جمع کردن خروجی';
  if(!toggle.querySelector('svg'))toggle.textContent=collapsed?'نمایش خروجی':'جمع کردن خروجی';
 }
 function openConsole(){if(disposed)return;consoleFocused=false;collapsed=false;render();persist()}
 toggle.onclick=()=>{consoleFocused=false;collapsed=!collapsed;render();persist()};
 if(consoleFocus)consoleFocus.onclick=()=>{consoleFocused=!consoleFocused;collapsed=false;render()};
 function move(e){if(!drag||e.pointerId!==drag.id)return;ratio=clampSplit(drag.ratio+(e.clientY-drag.y)/Math.max(1,drag.height-12)*100,drag.height);render()}
 function finish(save=true){
  if(!drag)return;const id=drag.id;drag=null;root.classList.remove('is-resizing');
  win.removeEventListener('pointermove',move);win.removeEventListener('pointerup',up);win.removeEventListener('pointercancel',cancel);
  try{if(separator.hasPointerCapture?.(id))separator.releasePointerCapture(id)}catch{}
  if(save)persist();
 }
 function up(e){if(drag&&e.pointerId===drag.id)finish()}
 function cancel(e){if(drag&&e.pointerId===drag.id)finish()}
 separator.onpointerdown=e=>{
  if(disposed||collapsed||(e.button!==undefined&&e.button!==0)||drag)return;
  e.preventDefault();separator.focus();drag={id:e.pointerId,y:e.clientY,ratio,height:height()};root.classList.add('is-resizing');
  try{separator.setPointerCapture?.(e.pointerId)}catch{}
  win.addEventListener('pointermove',move);win.addEventListener('pointerup',up);win.addEventListener('pointercancel',cancel);
 };
 separator.addEventListener('lostpointercapture',()=>finish());
 separator.ondblclick=()=>{ratio=67;render();persist()};
 separator.onkeydown=e=>{
  if(disposed||collapsed)return;const bounds=splitBounds(height()),amount=e.shiftKey?10:5;
  if(e.key==='ArrowUp')ratio-=amount;else if(e.key==='ArrowDown')ratio+=amount;else if(e.key==='Home')ratio=bounds.min;else if(e.key==='End')ratio=bounds.max;else return;
  e.preventDefault();render();persist();
 };
 function setFocus(value){workspace.classList.toggle('is-focused',value);aside.hidden=value;focus.setAttribute('aria-pressed',String(value));$('[data-focus-label]').textContent=value?'نمایش مأموریت':'تمرکز';focus.title=value?'نمایش پنل مأموریت':'فضای بیشتر برای کدنویسی';render()}
 focus.onclick=()=>setFocus(!workspace.classList.contains('is-focused'));
 function escape(e){if(e.key==='Escape'&&!$('[data-celebration]')?.open&&!$('.lab-feedback-dialog')?.open){if(consoleFocused){consoleFocused=false;render()}else if(workspace.classList.contains('is-focused'))setFocus(false)}}
 root.addEventListener('keydown',escape);
 const tabs=[...root.querySelectorAll('[data-lab-tab]')];
 function selectTab(name,moveFocus=false){
  for(const tab of tabs){const selected=tab.dataset.labTab===name;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;$('#'+tab.getAttribute('aria-controls')).hidden=!selected;if(selected&&moveFocus)tab.focus()}
 }
 tabs.forEach((tab,index)=>{tab.onclick=()=>selectTab(tab.dataset.labTab);tab.onkeydown=e=>{
  const rtl=tab.parentElement.getAttribute('dir')!=='ltr';
  let next;if(e.key==='ArrowLeft')next=(index+(rtl?1:tabs.length-1))%tabs.length;else if(e.key==='ArrowRight')next=(index+(rtl?tabs.length-1:1))%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;
  e.preventDefault();selectTab(tabs[next].dataset.labTab,true);
 }});
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(!disposed)render()}):null;observer?.observe(area);
 selectTab('mission');render();
 return {openConsole,selectTab,showMission(){consoleFocused=false;setFocus(false);selectTab('mission')},dispose(){if(disposed)return;disposed=true;finish(false);observer?.disconnect();root.removeEventListener('keydown',escape)}};
}
