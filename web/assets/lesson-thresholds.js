(function(){
 'use strict';
 if(document.body.dataset.lessonId!=='machine-learning/thresholds-and-roc')return;
 let mounted=null,frame=0,cleanup=()=>{};
 const main=document.querySelector('#main');if(!main)return;
 function mount(){const article=main.querySelector('.lesson-body');if(article===mounted)return;cleanup();mounted=article;if(!article)return;
  const links=[...main.querySelectorAll('.rail-list a[href^="#"]')],sections=links.map(a=>document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  function progress(){frame=0;let id=sections[0]?.id;for(const section of sections)if(section.getBoundingClientRect().top<=130)id=section.id;for(const a of links){const current=a.getAttribute('href')==='#'+id;a.classList.toggle('is-current',current);if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}}
  function onScroll(){if(!frame)frame=requestAnimationFrame(progress)}
  const copy=async event=>{const button=event.target.closest('.copy-code');if(!button||!article.contains(button))return;const text=button.closest('.code-block')?.querySelector('pre code')?.textContent;if(text==null)return;try{await navigator.clipboard.writeText(text);button.textContent='کپی شد';setTimeout(()=>{if(button.isConnected)button.textContent='کپی کد'},1500)}catch{button.textContent='کپی نشد؛ کد را انتخاب کن'}};
  function fit(){for(const box of article.querySelectorAll('.threshold-five-rows')){const table=box.querySelector('table'),rows=[...table.querySelectorAll('tbody tr')].slice(0,5);const h=table.querySelector('thead').getBoundingClientRect().height+rows.reduce((n,r)=>n+r.getBoundingClientRect().height,0);if(h>0)box.style.maxHeight=Math.ceil(h+1)+'px'}}
  const ro=window.ResizeObserver?new ResizeObserver(fit):null;article.querySelectorAll('.threshold-five-rows table').forEach(t=>ro?.observe(t));
  article.addEventListener('click',copy);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',fit);document.fonts?.ready.then(()=>{if(article.isConnected)fit()});progress();fit();
  cleanup=()=>{article.removeEventListener('click',copy);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',fit);ro?.disconnect();if(frame)cancelAnimationFrame(frame);frame=0};
 }
 new MutationObserver(mount).observe(main,{childList:true,subtree:true});mount();
})();
