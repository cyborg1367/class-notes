(function(){
 'use strict';
 if(document.body.dataset.lessonId!=='machine-learning/evaluating-knn')return;
 document.addEventListener('click',async event=>{
  const button=event.target.closest?.('.copy-code[data-copy-code]');if(!button||button.disabled)return;
  const pre=document.getElementById(button.dataset.copyCode);if(!pre)return;
  const text=pre.textContent;button.disabled=true;
  try{
   if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
   else{
    const field=document.createElement('textarea');field.value=text;field.setAttribute('readonly','');field.style.cssText='position:fixed;top:0;left:-9999px';document.body.append(field);field.select();
    try{if(!document.execCommand('copy'))throw Error('COPY_FAILED')}finally{field.remove();button.focus()}
   }
   button.textContent='کپی شد ✓';button.setAttribute('aria-live','polite');
  }catch{button.textContent='دوباره تلاش کن'}
  finally{button.disabled=false;setTimeout(()=>{if(button.isConnected)button.textContent='کپی کد'},1800)}
 });
 const observed=new WeakSet();
 function fit(table){const box=table.closest('.evaluation-dataset-scroll');if(!box)return;const rows=[...table.tBodies[0]?.rows||[]].slice(0,5);if(!rows.length)return;const height=(table.tHead?.getBoundingClientRect().height||0)+rows.reduce((n,row)=>n+row.getBoundingClientRect().height,0);if(height>0)box.style.maxHeight=Math.ceil(height+1)+'px'}
 function mount(){document.querySelectorAll('.evaluation-dataset table').forEach(table=>{fit(table);if(observed.has(table))return;observed.add(table);if(window.ResizeObserver)new ResizeObserver(()=>fit(table)).observe(table)})}
 new MutationObserver(mount).observe(document.querySelector('#main')||document.body,{childList:true,subtree:true});
 window.addEventListener('resize',mount);document.fonts?.ready.then(mount);mount();
})();
