(function(){
 'use strict';
 if(document.body.dataset.lessonId!=='machine-learning/evaluating-knn')return;
 const observed=new WeakSet();
 function fit(table){const box=table.closest('.evaluation-dataset-scroll');if(!box)return;const rows=[...table.tBodies[0]?.rows||[]].slice(0,5);if(!rows.length)return;const height=(table.tHead?.getBoundingClientRect().height||0)+rows.reduce((n,row)=>n+row.getBoundingClientRect().height,0);if(height>0)box.style.maxHeight=Math.ceil(height+1)+'px'}
 function mount(){document.querySelectorAll('.evaluation-dataset table').forEach(table=>{fit(table);if(observed.has(table))return;observed.add(table);if(window.ResizeObserver)new ResizeObserver(()=>fit(table)).observe(table)})}
 new MutationObserver(mount).observe(document.querySelector('#main')||document.body,{childList:true,subtree:true});
 window.addEventListener('resize',mount);document.fonts?.ready.then(mount);mount();
})();
