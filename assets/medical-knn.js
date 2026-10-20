"use strict";
function classifyMedical(data, query, k) {
  if (!Number.isInteger(k)||k<1||k>data.X.length||k%2!==1) throw new RangeError("Use a valid odd k.");
  const ordered=data.X.map((p,i)=>({index:i,name:data.names[i],label:data.y[i],distance:Math.sqrt(p.reduce((s,v,j)=>s+(v-query[j])**2,0))})).sort((a,b)=>a.distance-b.distance||a.index-b.index);
  const neighbors=ordered.slice(0,k);
  const boundaryTie=k<ordered.length&&ordered[k-1].distance===ordered[k].distance;
  const votes1=neighbors.filter(p=>p.label===1).length;
  return {neighbors,votes0:k-votes1,votes1,prediction:votes1>k/2?1:0,boundaryTie};
}
if(typeof module!=="undefined"&&module.exports)module.exports={classifyMedical};
if(typeof document!=="undefined"){
 const source=document.querySelector('#medical-knn-data');
 if(source){
  const data=JSON.parse(source.textContent);
  document.querySelectorAll('[data-knn-explorer]').forEach((root,n)=>{
   const svg=root.querySelector('[data-knn-svg]'),inputs=[...root.querySelectorAll('[data-knn-input]')];
   const outcome=root.querySelector('[data-knn-outcome]'),reveal=root.querySelector('[data-knn-reveal]');
   const clipId=`knn-clip-${n}`,ns='http://www.w3.org/2000/svg';
   let query=data.query.slice(),k=3,drag=null;
   const clamp=v=>Math.round(Math.max(0,Math.min(10,v))*10)/10;
   const xy=p=>[70+p[0]*40,460-p[1]*40];
   function el(tag,attrs,text){const node=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,String(value)));if(text!==undefined)node.textContent=text;return node;}
   function render(){
    outcome.hidden=true;reveal.setAttribute('aria-expanded','false');reveal.textContent='نمایشِ رأی‌ها و پیش‌بینی';
    const r=classifyMedical(data,query,k);
    root.querySelector('[data-knn-tie]').hidden=!r.boundaryTie;
    inputs.forEach((v,i)=>{v.value=query[i].toFixed(1);v.setAttribute('aria-valuetext',v.value);});
    root.querySelector('[data-knn-m1]').textContent=query[0].toFixed(1);
    root.querySelector('[data-knn-m2]').textContent=query[1].toFixed(1);
    root.querySelector('[data-knn-query]').textContent=`[${query.map(v=>v.toFixed(1)).join(', ')}]`;
    root.querySelectorAll('[data-knn-k]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.knnK)===k)));
    root.querySelector('[data-knn-votes]').textContent=`کلاس ۰: ${r.votes0.toLocaleString('fa-IR')} رأی · کلاس ۱: ${r.votes1.toLocaleString('fa-IR')} رأی`;
    root.querySelector('[data-knn-prediction]').textContent=`پیش‌بینی مدل: کلاس ${r.prediction.toLocaleString('fa-IR')} — ${r.prediction?'مثبت':'منفی'}`;
    const list=root.querySelector('[data-knn-neighbors]');list.replaceChildren();
    r.neighbors.forEach(p=>{const li=document.createElement('li'),id=document.createElement('strong'),detail=document.createElement('span');id.textContent=p.name;id.dir='ltr';detail.textContent=`کلاس ${p.label} · فاصله ≈ ${p.distance.toFixed(3)}`;li.append(id,detail);list.append(li);});
    const scene=document.createDocumentFragment(),defs=el('defs',{}),clip=el('clipPath',{id:clipId});clip.append(el('rect',{x:70,y:60,width:400,height:400}));defs.append(clip);scene.append(defs);
    scene.append(el('rect',{x:70,y:60,width:400,height:400,fill:'#fbfdfa',stroke:'#cadbcf'}));
    for(let t=0;t<=10;t+=2){const [x,y]=xy([t,t]);scene.append(el('path',{d:`M${x} 60V460M70 ${y}H470`,stroke:'#dce7df','stroke-width':1,fill:'none'}));scene.append(el('text',{x,y:484,'text-anchor':'middle',fill:'#59745f','font-size':15},String(t)));scene.append(el('text',{x:53,y:y+5,'text-anchor':'end',fill:'#59745f','font-size':15},String(t)));}
    scene.append(el('text',{x:270,y:520,'text-anchor':'middle',fill:'#244f39','font-size':18},'M1'));scene.append(el('text',{x:21,y:260,transform:'rotate(-90 21 260)','text-anchor':'middle',fill:'#244f39','font-size':18},'M2'));
    const [qx,qy]=xy(query),rays=el('g',{'clip-path':`url(#${clipId})`});rays.append(el('circle',{cx:qx,cy:qy,r:r.neighbors.at(-1).distance*40,fill:'#eee8d8','fill-opacity':.45,stroke:'#a08a50','stroke-dasharray':'5 5','stroke-width':1.5}));
    r.neighbors.forEach(p=>{const [x,y]=xy(data.X[p.index]);rays.append(el('line',{x1:qx,y1:qy,x2:x,y2:y,stroke:'#8fa38d','stroke-width':1.5}));});scene.append(rays);
    data.X.forEach((p,i)=>{const [x,y]=xy(p),positive=data.y[i]===1;if(r.neighbors.some(a=>a.index===i))scene.append(el('circle',{cx:x,cy:y,r:12,fill:'none',stroke:'#a08a50','stroke-width':2}));scene.append(positive?el('rect',{x:x-6,y:y-6,width:12,height:12,rx:1,fill:'#bd603e',stroke:'white','stroke-width':1.5}):el('circle',{cx:x,cy:y,r:6,fill:'#0f766e',stroke:'white','stroke-width':1.5}));const [dx,dy]=i===4?[-31,-12]:i===5?[12,22]:[12,-12];scene.append(el('text',{x:x+dx,y:y+dy,fill:'#355441','font-size':14},data.names[i]));});
    scene.append(el('path',{d:`M${qx} ${qy-8}l8 8-8 8-8-8z`,fill:'#203c4b',stroke:'white','stroke-width':1.5}));scene.append(el('text',{x:qx-23,y:qy+4,fill:'#203c4b','font-size':18,'font-weight':700},'q'));svg.replaceChildren(scene);
   }
   inputs.forEach((input,i)=>input.addEventListener('input',()=>{query[i]=clamp(Number(input.value));render();}));
   root.querySelectorAll('[data-knn-k]').forEach(b=>b.addEventListener('click',()=>{k=Number(b.dataset.knnK);render();}));
   function reset(){query=data.query.slice();k=3;render();}root.querySelector('[data-knn-reset]').addEventListener('click',reset);
   reveal.addEventListener('click',()=>{outcome.hidden=!outcome.hidden;reveal.setAttribute('aria-expanded',String(!outcome.hidden));reveal.textContent=outcome.hidden?'نمایشِ رأی‌ها و پیش‌بینی':'پنهان کردنِ نتیجه';});
   function pick(e,initial=false){const box=svg.getBoundingClientRect(),scale=Math.min(box.width/560,box.height/540);if(!scale)return false;const x=(e.clientX-box.left-(box.width-560*scale)/2)/scale,y=(e.clientY-box.top-(box.height-540*scale)/2)/scale;if(initial&&(x<70||x>470||y<60||y>460))return false;query=[clamp((x-70)/40),clamp((460-y)/40)];render();return true;}
   svg.addEventListener('pointerdown',e=>{if(e.isPrimary===false||(e.button!==undefined&&e.button!==0))return;if(pick(e,true)){drag=e.pointerId;svg.setPointerCapture?.(e.pointerId);}});
   svg.addEventListener('pointermove',e=>{if(drag!==null&&e.pointerId===drag)pick(e);});
   ['pointerup','pointercancel','lostpointercapture'].forEach(type=>svg.addEventListener(type,e=>{if(e.pointerId===drag)drag=null;}));
   svg.addEventListener('keydown',e=>{const m={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]};if(e.key==='Home'){e.preventDefault();reset();}else if(m[e.key]){e.preventDefault();query=query.map((v,i)=>clamp(v+m[e.key][i]));render();}});
   render();svg.removeAttribute('hidden');root.querySelector('[data-knn-fallback]').hidden=true;root.classList.add('is-ready');
  });
 }
}
