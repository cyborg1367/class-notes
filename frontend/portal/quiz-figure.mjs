import {portalEscape} from './quiz-format';
export function portalFigure(f){
 const e=portalEscape;const description=f.type==='distance2d'?`محورها هم‌مقیاس‌اند؛ U در (${f.u.join(', ')}) و V در (${f.v.join(', ')}) است.`:`محورها هم‌مقیاس‌اند؛ q در (${f.query.join(', ')}) است. `+f.points.map(p=>`${p.id}: (${p.x.join(', ')}), کلاس ${p.y}`).join('؛ ')+'. دایره کلاس صفر و مربع کلاس یک است.';let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 360" role="img" aria-label="'+e(description)+'">';
 const min=f.type==='knn2d'?3.8:0,max=f.type==='knn2d'?7.4:7,unit=270/(max-min),xy=p=>[65+(p[0]-min)*unit,305-(p[1]-min)*unit];
 for(let v=Math.ceil(min);v<=max;v++){const[x,y]=xy([v,v]);s+=`<path d="M${x},35V305 M65,${y}H335" stroke="#dce6d4"/><text x="${x}" y="325" text-anchor="middle" font-size="11" fill="#708368">${v}</text><text x="48" y="${y+4}" text-anchor="middle" font-size="11" fill="#708368">${v}</text>`;}
 s+='<path d="M65,35V305H335" fill="none" stroke="#7f9873"/><text x="355" y="310" font-size="12" fill="#506c43">x₁</text><text x="55" y="23" font-size="12" fill="#506c43">x₂</text>';
 if(f.type==='distance2d'){
  const a=xy(f.u),b=xy(f.v);s+=`<path d="M${a}L${b[0]},${a[1]}L${b}" fill="none" stroke="#a8b99a" stroke-dasharray="5 4"/><path d="M${a}L${b}" stroke="#326940" stroke-width="3"/>`;
  [[a,'U',f.u],[b,'V',f.v]].forEach(([p,id,coords])=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#326940"/><text x="${p[0]+12}" y="${p[1]+4}" font-size="12" fill="#375332">${id} (${coords.join(', ')})</text>`;});
 }else{
  f.points.forEach(p=>{const[x,y]=xy(p.x);s+=p.y===0?`<circle cx="${x}" cy="${y}" r="6" fill="#2d7560"/>`:`<rect x="${x-6}" y="${y-6}" width="12" height="12" rx="1" fill="#b76844"/>`;const off=p.id==='A'?[-18,-14]:[12,5];s+=`<text x="${x+off[0]}" y="${y+off[1]}" fill="#516d46" font-size="12">${e(p.id)} · ${p.y}</text>`;});
  const[x,y]=xy(f.query);s+=`<path d="M${x},${y-7}L${x+7},${y}L${x},${y+7}L${x-7},${y}Z" fill="#193f30"/><text x="${x-18}" y="${y+21}" fill="#193f30" font-size="13">q</text>`;
 }
 return s+'</svg>';
}
