(function(){
 'use strict';
 if(document.body.dataset.lessonId!=='machine-learning/thresholds-and-roc')return;
 const main=document.querySelector('#main');if(!main)return;
 let mounted=null,frame=null,cleanup=()=>{};
 const ratio=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1;
 function example(host){
  let data;try{data=JSON.parse(host.querySelector('#threshold-example-data')?.textContent||'null')}catch{return}
  if(!data||!Array.isArray(data.actual)||!Array.isArray(data.scores)||data.actual.length!==data.scores.length||data.actual.length<2||data.actual.length>200||!data.actual.every(v=>v===0||v===1)||!data.scores.every(ratio)||!data.actual.includes(0)||!data.actual.includes(1))return;
  const input=host.querySelector('[data-threshold-control]'),label=host.querySelector('#lesson-threshold-value'),score=host.querySelector('[data-threshold-score-plot]'),roc=host.querySelector('[data-threshold-roc-plot]'),counts=host.querySelector('[data-threshold-counts]'),matrix=host.querySelector('[data-threshold-matrix]');if(!input||!label||!score||!roc||!counts||!matrix)return;
  const curve=data.roc;if(!curve||!Array.isArray(curve.fpr)||!Array.isArray(curve.tpr)||curve.fpr.length!==curve.tpr.length||curve.fpr.length<2||curve.fpr.length>1000||!ratio(curve.auc)||!curve.fpr.every(ratio)||!curve.tpr.every(ratio))return;
  const n=data.actual.length;
  function paint(){
   const t=Math.max(0,Math.min(1,Number(input.value)/100));if(!Number.isFinite(t))return;
   let tp=0,fp=0,fn=0,tn=0;data.scores.forEach((s,i)=>{if(s>=t){if(data.actual[i])tp++;else fp++}else{if(data.actual[i])fn++;else tn++}});
   const p=tp+fp?tp/(tp+fp):0,r=tp/(tp+fn),f=2*tp+fp+fn?2*tp/(2*tp+fp+fn):0,fpr=fp/(fp+tn);
   label.textContent=t.toFixed(2);input.setAttribute('aria-valuetext',t.toFixed(2));
   counts.innerHTML='<dl class="threshold-values"><div><dt>Precision</dt><dd>'+p.toFixed(3)+'</dd></div><div><dt>Recall</dt><dd>'+r.toFixed(3)+'</dd></div><div><dt>F1</dt><dd>'+f.toFixed(3)+'</dd></div></dl><p class="small-note">'+(tp+fp)+' اعلام مثبت از '+n+' نمونه</p>';
   matrix.innerHTML='<table class="threshold-example-matrix"><caption>Actual rows / Predicted columns</caption><thead><tr><th>Actual / Predicted</th><th>0</th><th>1</th></tr></thead><tbody><tr><th>0</th><td data-count="tn">'+tn+'</td><td data-count="fp">'+fp+'</td></tr><tr><th>1</th><td data-count="fn">'+fn+'</td><td data-count="tp">'+tp+'</td></tr></tbody></table>';
   const height=82+n*23,x=s=>42+s*250,y=i=>43+i*23;
   let s='<svg direction="ltr" viewBox="0 0 330 '+height+'" role="img" aria-label="امتیازهای ثابت؛ شکل و رنگ هر علامت کلاس واقعی است"><rect x="'+x(t)+'" y="26" width="'+(x(1)-x(t))+'" height="'+(n*23+8)+'" fill="#ead8ab" opacity=".45"/><path d="M42 '+(height-35)+'H292" stroke="#92917d"/>';
   for(let i=0;i<n;i++){const a=x(data.scores[i]),b=y(i);s+=data.actual[i]?'<rect x="'+(a-4.5)+'" y="'+(b-4.5)+'" width="9" height="9" fill="#b75242"/>':'<circle cx="'+a+'" cy="'+b+'" r="4.5" fill="#18564e"/>'}
   s+='<path d="M'+x(t)+' 24V'+(height-35)+'" stroke="#575d4f" stroke-dasharray="4 4"/><g fill="#4c5549" font-family="monospace" font-size="10" text-anchor="middle"><text x="42" y="'+(height-18)+'">0</text><text x="292" y="'+(height-18)+'">1</text><text x="167" y="'+(height-3)+'">Score for class 1</text></g></svg>';score.innerHTML=s;
   const cx=v=>43+244*v,cy=v=>277-244*v,path=curve.fpr.map((v,i)=>(i?'L':'M')+cx(v)+' '+cy(curve.tpr[i])).join(' ');
   roc.innerHTML='<svg direction="ltr" viewBox="0 0 330 320" role="img" aria-label="نقطهٔ تصمیم فعلی روی ROC؛ منحنی و امتیازهای مدل ثابت‌اند"><path d="M43 33V277H287" fill="none" stroke="#92917d"/><path d="M43 277L287 33" stroke="#b6ad96" stroke-dasharray="5 5"/><path d="'+path+'" fill="none" stroke="#18564e" stroke-width="2.5"/><circle cx="'+cx(fpr)+'" cy="'+cy(r)+'" r="5" fill="#b75242" stroke="#fff" stroke-width="1.5"/><g fill="#4c5549" font-family="monospace" font-size="10" text-anchor="middle"><text x="43" y="293">0</text><text x="287" y="293">1</text><text x="165" y="313">FPR</text><text transform="translate(13 155) rotate(-90)">TPR</text><text x="165" y="18">ROC-AUC = '+Number(data.roc.auc).toFixed(4)+'</text></g></svg>';
  }
  input.addEventListener('input',paint);paint();return()=>input.removeEventListener('input',paint);
 }
 function mount(){
  const article=main.querySelector('.lesson-body');if(article===mounted)return;cleanup();mounted=article;if(!article)return;
  const links=[...main.querySelectorAll('.rail-list a[href^="#"],.mobile-toc a[href^="#"]')],sections=[...article.querySelectorAll('.lesson-section')],bar=main.querySelector('#reading-progress'),side=main.querySelector('#sidebar-progress'),reading=main.querySelector('#reading-label');
  function update(){
   frame=null;let id=sections[0]?.id;for(const section of sections)if(section.getBoundingClientRect().top<=135)id=section.id;
   for(const a of links){const active=a.getAttribute('href')==='#'+id;a.classList.toggle('is-current',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}
   const rect=article.getBoundingClientRect(),screen=window.innerHeight||document.documentElement.clientHeight||1,span=Math.max(1,rect.height-screen+135),value=Math.max(0,Math.min(1,(135-rect.top)/span));
   if(bar)bar.style.transform='scaleX('+value+')';if(side)side.style.width=Math.round(value*100)+'%';if(reading)reading.textContent=Math.round(value*100).toLocaleString('fa-IR')+'٪ مطالعه شده';
  }
  function schedule(){if(frame===null)frame=requestAnimationFrame(update)}
  const copy=async event=>{const button=event.target.closest?.('.copy-code');if(!button||!article.contains(button))return;const pre=button.closest('.code-block')?.querySelector('pre');if(!pre)return;try{await navigator.clipboard.writeText(pre.textContent);if(button.isConnected){button.textContent='کپی شد';setTimeout(()=>{if(button.isConnected)button.textContent='کپی کد'},1500)}}catch{button.textContent='کد را انتخاب و کپی کنید'}};
  function fit(){for(const table of article.querySelectorAll('.threshold-dataset table,.threshold-five-rows table')){const box=table.closest('.table-scroll')||table.closest('.threshold-five-rows');if(!box)continue;const rows=[...table.querySelectorAll('tbody tr')].slice(0,5),head=table.querySelector('thead');if(!rows.length||!head)continue;const h=head.getBoundingClientRect().height+rows.reduce((s,r)=>s+r.getBoundingClientRect().height,0);if(h>0)box.style.maxHeight=Math.ceil(h+1)+'px'}schedule()}
  const ro=window.ResizeObserver?new ResizeObserver(fit):null;article.querySelectorAll('.threshold-dataset table,.threshold-five-rows table').forEach(t=>ro?.observe(t));
  const disposeExamples=[...article.querySelectorAll('[data-threshold-explorer]')].map(example).filter(Boolean);
  article.addEventListener('click',copy);article.addEventListener('load',schedule,true);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',fit);document.fonts?.ready.then(()=>{if(article.isConnected)fit()});fit();
  cleanup=()=>{article.removeEventListener('click',copy);article.removeEventListener('load',schedule,true);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',fit);ro?.disconnect();disposeExamples.forEach(fn=>fn());if(frame!==null)cancelAnimationFrame(frame);frame=null};
 }
 new MutationObserver(mount).observe(main,{childList:true,subtree:true});mount();
})();
