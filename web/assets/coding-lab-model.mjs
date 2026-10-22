export const missionId='greenhouse-v1';
export const dataset={
 columns:[{name:'moisture',label:'رطوبت'},{name:'light',label:'روشنایی'},{name:'warmth',label:'گرما'}],
 names:['GH-01','GH-02','GH-03','GH-04','GH-05','GH-06','GH-07','GH-08','GH-09','GH-10'],
 X:[[2,8,3],[7,3,8],[4,6,5],[8,2,7],[3,7,4],[6,4,6],[1,9,2],[9,1,9],[5,5,3],[4,4,8]],
 query:[4.5,6.5,4],query_new:[7,3,7]
};
export const bootstrap=`import numpy as np\nnames = ${JSON.stringify(dataset.names)}\nX = np.array(${JSON.stringify(dataset.X)}, dtype=float)\nquery = np.array(${JSON.stringify(dataset.query)}, dtype=float)\nquery_new = np.array(${JSON.stringify(dataset.query_new)}, dtype=float)\n`;
export const stages=[
 {id:'inspect',title:"ساختار داده را بشناس",xp:20,function:'inspect_data',
 inputTitle:"ورودی: جدول سابقه‌های گلخانه",
 resultTitle:"خروجی: گزارشی از تعداد سطرها و ستون‌ها",
 brief:"قرار است سابقه‌های شبیه به وضعیت امروز گلخانه را پیدا کنیم. از شناخت جدول شروع کن: چند سابقه داریم و هر سابقه چند ویژگی دارد؟",
 action:"تابع <code dir=\"ltr\">inspect_data(X)</code> را کامل کن.",
 input:"<code>X</code>؛ یک جدول دوبعدی، با یک سابقه در هر سطر.",
 result:"دیکشنری با <code>n_samples</code> (تعداد سطرها) و <code>n_features</code> (تعداد ستون‌ها)، هر دو عدد صحیح.",
 concept:"می‌خواهیم سابقه‌هایی را پیدا کنیم که به وضعیت امروز گلخانه شبیه‌اند. قدم اول شناخت جدول است: چند سابقه و چند ویژگی داریم؟ هر سطر جدول، یک نوبت ثبت است و هر ستون یک ویژگی مثل رطوبت. در جدول این گلخانه ۱۰ سطر و ۳ ستون داریم؛ تابع تو باید بتواند اندازهٔ هر جدول ورودی را گزارش کند.",
 task:"<p>تابع <code>inspect_data(X)</code> را کامل کن تا دو چیز را گزارش کند:</p><ul><li><code>n_samples</code>: تعداد سطرها، یعنی تعداد سابقه‌ها.</li><li><code>n_features</code>: تعداد ستون‌ها، یعنی تعداد ویژگی‌های هر سابقه.</li></ul><p>این دو عدد را در یک دیکشنری برگردان. آن‌ها را از خود ورودی به دست بیاور.</p>",
 example:'inspect_data(np.zeros((4, 2)))\n# {"n_samples": 4, "n_features": 2}',
 hints:['به این فکر کن که نمونه و ویژگی در کدام جهت جدول قرار دارند.','خروجی باید اندازهٔ دو محور ورودی را گزارش کند؛ عدد ثابت ننویس.','ویژگی shape در آرایهٔ NumPy اندازهٔ محورهای آن را نگه می‌دارد.'],
 starter:'# Mission 1: Describe any rectangular dataset.\ndef inspect_data(X):\n    pass\n\nprint(inspect_data(X))\n'},
 {id:'pair',title:"دو وضعیت را مقایسه کن",xp:30,function:'pair_distance',
 inputTitle:"ورودی: دو وضعیت هم‌اندازه",
 resultTitle:"خروجی: یک عدد برای فاصلهٔ دو وضعیت",
 brief:"برای سنجیدن شباهت دو وضعیت، فاصلهٔ اقلیدسی آن‌ها را حساب کن. فاصلهٔ کمتر یعنی شباهت بیشتر؛ دو وضعیت یکسان فاصلهٔ صفر دارند.",
 action:"تابع <code dir=\"ltr\">pair_distance(a, b)</code> را کامل کن.",
 input:"دو بردار هم‌اندازهٔ <code>a</code> و <code>b</code>.",
 result:"یک عدد: فاصلهٔ اقلیدسی دو وضعیت.",
 concept:"حالا می‌خواهیم برای شباهت یک معیار عددی داشته باشیم. مثلاً وضعیت ثبت‌شدهٔ اول را با وضعیت امروز مقایسه می‌کنیم. معیار این تمرین «فاصلهٔ اقلیدسی» است: هرچه دو بردار نزدیک‌تر باشند، عدد کوچک‌تری می‌گیریم؛ برای دو بردار یکسان، فاصله صفر است.",
 task:"<p>تابع <code>pair_distance(a, b)</code> را کامل کن:</p><ul><li><code>a</code> و <code>b</code> دو وضعیت با تعداد ویژگی برابرند.</li><li>فاصلهٔ اقلیدسی آن‌ها را حساب کن و یک عدد برگردان.</li></ul><p>فعلاً فقط دو وضعیت را مقایسه می‌کنی؛ جست‌وجوی کل جدول مربوط به مرحلهٔ بعد است.</p>",
 example:'pair_distance(np.array([1., 2.]), np.array([4., 6.]))\n# 5.0',
 hints:['از تعریف هندسی فاصلهٔ اقلیدسی شروع کن.','اختلاف مؤلفه‌ها باید بدون خنثی‌کردن علامت یکدیگر جمع شوند.','مربع اختلاف‌ها را جمع کن و ریشهٔ دوم بگیر؛ جزوه مثال مستقلی دارد.'],
 starter:'\n# Mission 2: Compare two states.\ndef pair_distance(a, b):\n    pass\n\nprint(pair_distance(X[0], query))\n'},
 {id:'distances',title:"امروز را با همهٔ سابقه‌ها بسنج",xp:50,function:'distances_to',
 inputTitle:"ورودی: سابقه‌ها و وضعیت امروز",
 resultTitle:"خروجی: یک فاصله برای هر سابقه",
 brief:"وضعیت امروز را با تمام سابقه‌ها مقایسه کن. به ازای هر سطر جدول، یک فاصله لازم داریم؛ ترتیب فاصله‌ها باید همان ترتیب سطرها باشد.",
 action:"تابع <code dir=\"ltr\">distances_to(X, query)</code> را کامل کن.",
 input:"سابقه‌های <code>X</code> و وضعیت امروز، <code>query</code>.",
 result:"یک آرایهٔ یک‌بعدی؛ به ازای هر سطر، یک فاصله. خود <code>X</code> را تغییر نده.",
 concept:"مقایسهٔ یک سابقه کافی نیست؛ پژوهشگر می‌خواهد بداند هر کدام از ۱۰ وضعیت قبلی چقدر به امروز نزدیک‌اند. پس به ازای هر سطر X، یک فاصله تا query لازم داریم. query فقط نام برداری است که وضعیت امروز را نگه می‌دارد.",
 task:"<p>تابع <code>distances_to(X, query)</code> را کامل کن:</p><ul><li>برای هر سطر <code>X</code>، فاصلهٔ اقلیدسی تا <code>query</code> را به دست بیاور.</li><li>فاصله‌ها را به همان ترتیب سطرها در یک آرایهٔ یک‌بعدی برگردان.</li></ul><p>جدول ورودی را تغییر نده. در دادهٔ این گلخانه، خروجی ۱۰ عضو خواهد داشت.</p>",
 example:'distances_to(np.array([[0.,0.],[3.,4.]]), np.array([0.,0.]))\n# array([0., 5.])',
 hints:['پس از مقایسه، برای هر سطر به چند عدد خروجی نیاز داری؟','برای یک راه‌حل برداری، بردار پرس‌وجو با تمام سطرها مقایسه می‌شود.','جمع روی محور ویژگی‌ها انجام می‌شود؛ نتیجه باید فقط محور نمونه‌ها را داشته باشد.'],
 starter:'\n# Mission 3: Score every reference state.\ndef distances_to(X, query):\n    pass\n\nprint(distances_to(X, query))\n'},
 {id:'neighbors',title:"نزدیک‌ترین سابقه‌ها را پیدا کن",xp:60,function:'neighbors',
 inputTitle:"ورودی: سابقه‌ها، وضعیت امروز و تعداد همسایه‌ها",
 resultTitle:"خروجی: اندیس نزدیک‌ترین سابقه‌ها",
 brief:"از بین سابقه‌ها، k مورد نزدیک‌تر به وضعیت امروز را انتخاب کن. جایگاه سطرها را برگردان؛ این جایگاه‌ها «اندیس» هستند و از صفر شروع می‌شوند.",
 action:"تابع <code dir=\"ltr\">neighbors(X, query, k)</code> را کامل کن.",
 input:"<code>X</code>، <code>query</code> و تعداد همسایه‌ها، <code>k</code>.",
 result:"دقیقاً <code>k</code> اندیس صحیح و متفاوت، از نزدیک به دور. برای فاصله‌های برابر، هر ترتیب درست پذیرفته است.",
 concept:"اکنون فاصله‌ها را داریم؛ وقت انتخاب است. پژوهشگر می‌خواهد سه سابقهٔ شبیه‌تر را ببیند. تابع تو باید جایگاه سطرهای نزدیک‌تر را بدهد، نه نام GH یا خود فاصله‌ها. این جایگاه را «اندیس» می‌نامیم و از صفر می‌شماریم.",
 task:"<p>تابع <code>neighbors(X, query, k)</code> را کامل کن:</p><ul><li>اندیس <code>k</code> سطر نزدیک‌تر به <code>query</code> را انتخاب کن.</li><li>آن‌ها را از نزدیک‌ترین به دورترین برگردان؛ اندیس تکراری نداشته باش.</li></ul><p>عدد <code>k</code> تعداد سابقه‌های درخواستی است؛ همیشه ۳ نیست. در این تمرین از ۱ تا تعداد سطرهاست. برای فاصله‌های برابر، هر ترتیب درست پذیرفته می‌شود.</p>",
 example:'neighbors(np.array([[0.,0.],[3.,4.],[1.,0.]]), np.array([0.,0.]), 2)\n# array([0, 2])',
 hints:['آیا این تسک مقدار فاصله را می‌خواهد یا جایگاه نمونه‌ها را؟','اول ترتیب نزدیکی را مشخص کن، سپس k مورد را نگه دار.','خروجی argsort اندیس‌های ترتیب‌داده‌شده است؛ با sort مقایسه‌اش کن.'],
 starter:'\n# Mission 4: Return k nearest row indices.\ndef neighbors(X, query, k):\n    pass\n\nprint(neighbors(X, query, 3))\n'},
 {id:'search',title:"گزارش جست‌وجو را بساز",xp:80,function:'search',
 inputTitle:"ورودی: سابقه‌ها، وضعیت امروز و تعداد همسایه‌ها",
 resultTitle:"خروجی: indices و distances در یک دیکشنری",
 brief:"کدام سابقه‌ها به وضعیت امروز نزدیک‌ترند؟ فاصلهٔ هر سابقه را هم در گزارش برگردان.",
 action:"تابع <code dir=\"ltr\">search(X, query, k)</code> را کامل کن.",
 input:"سابقه‌های <code>X</code>، وضعیت <code>query</code> و تعداد همسایه‌ها، <code>k</code>.",
 result:"دیکشنری با <code>indices</code> و <code>distances</code>؛ هر دو به طول <code>k</code>، از نزدیک به دور و با ترتیب متناظر.",
 concept:"دیدن اندیس‌ها به‌تنهایی برای پژوهشگر کافی نیست؛ او می‌خواهد بداند هر سابقه چقدر نزدیک بوده است. حالا انتخاب‌ها و فاصله‌هایشان را در یک گزارش کنار هم قرار می‌دهی.",
 task:"<p>تابع <code>search(X, query, k)</code> را کامل کن و یک دیکشنری برگردان:</p><ul><li><code>indices</code>: اندیس <code>k</code> سابقهٔ نزدیک‌تر، از نزدیک به دور.</li><li><code>distances</code>: فاصلهٔ همان سابقه‌ها، دقیقاً با همان ترتیب.</li></ul><p>مثلاً عضو اول هر دو آرایه باید به یک سابقه مربوط باشد. می‌توانی از تابع‌های قبلی خودت استفاده کنی.</p>",
 example:'search(np.array([[0.,0.],[3.,4.]]), np.array([0.,0.]), 2)\n# {"indices": [0, 1], "distances": [0., 5.]}',
 hints:['خروجی باید رابطهٔ نمونه و فاصله‌اش را حفظ کند.','می‌توانی از تابع‌های قبلی خودت استفاده کنی یا راه‌حل مستقل بنویسی.','فاصله‌های انتخاب‌شده را با همان اندیس‌های انتخاب‌شده بردار، سپس دیکشنری خروجی را بساز.'],
 starter:'\n# Mission 5: Package a reusable search result.\ndef search(X, query, k):\n    pass\n\nprint(search(X, query, 3))\n'},
 {id:'compare',title:"تغییر وضعیت را آزمایش کن",xp:60,function:'compare_queries',
 inputTitle:"ورودی: سابقه‌ها و دو وضعیت متفاوت",
 resultTitle:"خروجی: همسایه‌های هر وضعیت و changed",
 brief:"با تغییر وضعیت، آیا اعضای گروه همسایه‌ها عوض می‌شوند؟ changed فقط با تغییر اعضا True می‌شود؛ جابه‌جایی ترتیب همان اعضا، تغییر گروه نیست.",
 action:"تابع <code dir=\"ltr\">compare_queries(X, before, after, k)</code> را کامل کن.",
 input:"سابقه‌های <code>X</code>، دو وضعیت <code>before</code> و <code>after</code> و تعداد <code>k</code>.",
 result:"دیکشنری با <code>before_indices</code>، <code>after_indices</code> و مقدار بولیِ <code>changed</code>. اندیس‌های هر گروه از نزدیک به دور باشند.",
 concept:"اگر وضعیت حسگرها عوض شود، آیا همان سابقه‌های قبلی هنوز نزدیک‌ترین‌اند؟ پیش از اجرا حدس بزن. سپس دو جست‌وجو انجام بده: یکی برای وضعیت اول و دیگری برای وضعیت تازه.",
 task:"<p>تابع <code>compare_queries(X, before, after, k)</code> را کامل کن:</p><ul><li><code>before_indices</code>: اندیس همسایه‌های وضعیت <code>before</code>، از نزدیک به دور.</li><li><code>after_indices</code>: اندیس همسایه‌های وضعیت <code>after</code>، از نزدیک به دور.</li><li><code>changed</code>: اگر اعضای دو گروه فرق کرده‌اند، <code>True</code>؛ وگرنه <code>False</code>.</li></ul><p>فقط جابه‌جایی ترتیب همان اعضا، تغییر گروه نیست. پیش‌بینی و نتیجه‌ات را هم در یادداشت ثبت کن.</p>",
 example:"X_demo = np.array([[0., 0.], [2., 0.], [9., 0.]])\ncompare_queries(X_demo, np.array([0., 0.]), np.array([10., 0.]), 2)\n# {\"before_indices\": [0, 1],\n#  \"after_indices\": [2, 1], \"changed\": True}",
 hints:['ممکن است ورودی عوض شود اما مجموعهٔ نزدیک‌ترین همسایه‌ها ثابت بماند.','خروجی دو جست‌وجو را مقایسه کن؛ مراقب تفاوت مجموعه و ترتیب باش.','برای changed، مجموعهٔ اندیس‌های دو نتیجه را مقایسه کن. توضیح نوشتاری جدا از بررسی محاسبه ذخیره می‌شود.'],
 starter:'\n# Mission 6: Test whether the neighbor set changed.\ndef compare_queries(X, before, after, k):\n    pass\n\nprint(compare_queries(X, query, query_new, 3))\n'}
];
export function normalize(raw){return {codes:stages.map((s,i)=>typeof raw?.codes?.[i]==='string'?raw.codes[i].slice(0,20000):(i===0?s.starter:'')),active:Number.isInteger(raw?.active)?Math.max(0,Math.min(5,raw.active)):0,explanation:typeof raw?.explanation==='string'?raw.explanation.slice(0,3000):'',hints:stages.map((_,i)=>Number.isInteger(raw?.hints?.[i])?Math.max(0,Math.min(3,raw.hints[i])):0)}};
export function available(snapshot){const done=new Set(snapshot.completed||[]);const i=stages.findIndex(s=>!done.has(s.id));return i<0?5:i;}
const keywords=new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'.split(' '));
const builtins=new Set('print len range int float bool str set dict list tuple sum min max abs all any enumerate zip sorted isinstance round'.split(' '));
// A small lexical highlighter only; Python execution remains in the worker.
// Scan strings/comments as whole tokens so their contents cannot become markup.
export function highlight(code){
 const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const parts=[];let i=0;
 function token(end,kind){const text=escape(code.slice(i,end));parts.push(kind?`<span class="syn-${kind}">${text}</span>`:text);i=end}
 while(i<code.length){
  const rest=code.slice(i);
  if(code[i]==='#'){const end=code.indexOf('\n',i);token(end<0?code.length:end,'comment');continue}
  const string=/^(?:[rubf]{1,2})?("""|'''|"|')/i.exec(rest);
  if(string){
   const quote=string[1];let end=i+string[0].length;
   while(end<code.length){
    if(code[end]==='\\'){end=Math.min(code.length,end+2);continue}
    if(code.startsWith(quote,end)){end+=quote.length;break}
    if(quote.length===1&&(code[end]==='\n'||code[end]==='\r'))break;
    end++;
   }
   token(end,'string');continue;
  }
  const word=/^[A-Za-z_]\w*/.exec(rest);
  if(word){const value=word[0];token(i+value.length,keywords.has(value)?(value==='return'?'return':'keyword'):builtins.has(value)&&code[i-1]!=='.'?'builtin':null);continue}
  const number=/^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?[\d_]+)?)[jJ]?/.exec(rest);
  if(number){token(i+number[0].length,'number');continue}
  token(i+1,null);
 }
 return parts.join('');
}
