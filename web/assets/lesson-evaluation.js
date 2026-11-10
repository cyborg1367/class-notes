(function(){
 'use strict';
 if(document.body.dataset.lessonId!=='machine-learning/evaluating-knn')return;
 const main=document.querySelector('#main');if(!main)return;
 let mounted=null,dispose=()=>{};
 function fit(table){
  const box=table.closest('.evaluation-dataset-scroll');if(!box)return;
  const rows=[...table.tBodies[0]?.rows||[]].slice(0,5);if(!rows.length)return;
  const height=(table.tHead?.getBoundingClientRect().height||0)+rows.reduce((n,row)=>n+row.getBoundingClientRect().height,0);
  if(height>0)box.style.maxHeight=Math.ceil(height+1)+'px';
 }
 function mount(){
  const body=main.querySelector('.lesson-body');
  if(body===mounted)return;
  dispose();mounted=body;
  if(!body)return;
  const tables=[...body.querySelectorAll('.evaluation-dataset table')];
  const update=()=>{if(body.isConnected&&body===mounted)tables.forEach(fit);};
  const resize=window.ResizeObserver?new ResizeObserver(update):null;
  tables.forEach(table=>resize?.observe(table));
  window.addEventListener('resize',update);document.fonts?.ready.then(update);update();
  dispose=()=>{resize?.disconnect();window.removeEventListener('resize',update);};
 }
 new MutationObserver(mount).observe(main,{childList:true,subtree:true});mount();
})();
