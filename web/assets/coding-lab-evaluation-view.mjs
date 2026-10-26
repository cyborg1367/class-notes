// Local, untrusted practice output only. This module never grants XP.
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const point=p=>Array.isArray(p)&&p.length===2&&p.every(n=>finite(n)&&n>=0&&n<=14);
const labels=a=>Array.isArray(a)&&a.every(n=>n===0||n===1);
export function regionSVG(v){
 if(!v||v.kind!=='region'||!labels(v.labels)||v.labels.length!==625)return null;
 for(const key of ['train','test'])if(!Array.isArray(v[key])||v[key].length>200||!v[key].every(point)||!labels(v[key+'_y'])||v[key].length!==v[key+'_y'].length)return null;
 const x=n=>58+n/14*336,y=n=>390-n/14*336;
 let s='<svg class="lab-evaluation-chart" viewBox="0 0 450 450" role="img" aria-label="نواحی پیش‌بینی مدل؛ رنگ نقطه کلاس واقعی، رنگ زمینه پیش‌بینی، دایره آموزش و لوزی آزمون است."><rect width="450" height="450" fill="#f7f1df"/>';
 // Cells are centered on the same grid points passed to the learner's function.
 for(let i=0;i<625;i++){const col=i%25,row=Math.floor(i/25),left=Math.max(0,(col-.5)*14/24),right=Math.min(14,(col+.5)*14/24),bottom=Math.max(0,(row-.5)*14/24),top=Math.min(14,(row+.5)*14/24);s+=`<rect x="${x(left)}" y="${y(top)}" width="${x(right)-x(left)+.15}" height="${y(bottom)-y(top)+.15}" fill="${v.labels[i]?'#ffd49b':'#afd6ef'}"/>`;}
 for(let t=0;t<=14;t+=2)s+=`<path d="M${x(t)} 54V390M58 ${y(t)}H394" stroke="#565647" opacity=".15"/><g fill="#484c40" font-size="11"><text x="${x(t)}" y="408" text-anchor="middle">${t}</text><text x="48" y="${y(t)+4}" text-anchor="end">${t}</text></g>`;
 for(const group of ['train','test'])v[group].forEach((p,i)=>{const cx=x(p[0]),cy=y(p[1]),color=v[group+'_y'][i]?'#963c08':'#084d85';s+=group==='train'?`<circle cx="${cx}" cy="${cy}" r="4.5" fill="${color}" stroke="#fff" stroke-width="1.4"/>`:`<path d="M${cx} ${cy-7}l7 7-7 7-7-7z" fill="${color}" stroke="#24241f" stroke-width="3"/><path d="M${cx} ${cy-7}l7 7-7 7-7-7z" fill="${color}" stroke="#fff" stroke-width="1.2"/>`;});
 s+='<path d="M58 54V390H394" fill="none" stroke="#33382c" stroke-width="1.4"/><g font-size="12" fill="#33382c"><text x="226" y="435" text-anchor="middle">link_count</text><text transform="translate(16 225) rotate(-90)" text-anchor="middle">promo_word_count</text></g></svg>';return s;
}
export function reportHTML(v){
 if(!v||v.kind!=='report'||!Number.isInteger(v.n_train)||v.n_train<1||!Number.isInteger(v.n_test)||v.n_test<1||!finite(v.accuracy)||v.accuracy<0||v.accuracy>1||!Number.isInteger(v.fp)||v.fp<0||!Array.isArray(v.matrix)||v.matrix.length!==2||!v.matrix.every(row=>Array.isArray(row)&&row.length===2&&row.every(n=>Number.isInteger(n)&&n>=0)))return null;
 return `<h3>گزارش اجرای آزمایشی</h3><dl class="lab-evaluation-report"><div><dt>Train / Test</dt><dd>${v.n_train} / ${v.n_test}</dd></div><div><dt>Accuracy</dt><dd>${(v.accuracy*100).toFixed(1)}%</dd></div><div><dt>False Positives</dt><dd>${v.fp}</dd></div></dl><table class="lab-evaluation-matrix" dir="ltr"><caption>ماتریس خطا · سطر واقعی، ستون پیش‌بینی</caption><thead><tr><th scope="col">Actual / Predicted</th><th scope="col">0</th><th scope="col">1</th></tr></thead><tbody><tr><th scope="row">0</th><td>${v.matrix[0][0]}</td><td>${v.matrix[0][1]}</td></tr><tr><th scope="row">1</th><td>${v.matrix[1][0]}</td><td>${v.matrix[1][1]}</td></tr></tbody></table><p>این گزارش خروجی کدِ اجرای محلی است. نتیجهٔ این مجموعه، تضمین عملکرد روی همهٔ پیام‌های آینده نیست.</p>`;
}
export function renderEvaluationPreview(host,value){
 const plot=value?.kind==='region'?regionSVG(value):null,report=reportHTML(value);
 host.hidden=false;
 host.innerHTML=plot?'<h3>نقشهٔ تصمیم · اجرای آزمایشی</h3>'+plot+'<div class="lab-evaluation-legend"><span>آبی: عادی</span><span>نارنجی: اسپم</span><span>دایره: آموزش</span><span>لوزی: آزمون</span></div><p>رنگ نقطه، کلاس واقعی است؛ رنگ ناحیه، تصمیم مدل. تفاوت این دو رنگ برای یک نمونهٔ آزمون، یک پیش‌بینی اشتباه را نشان می‌دهد.</p>':report||'<p>خروجی تصویری هنوز با قرارداد مرحله هماهنگ نیست. خروجی تابع را در کنسول بررسی کن.</p>';
}
