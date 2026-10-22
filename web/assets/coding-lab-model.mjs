export const missionId='greenhouse-v1';
export const dataset={
 columns:[{name:'moisture',label:'رطوبت'},{name:'light',label:'روشنایی'},{name:'warmth',label:'گرما'}],
 names:['GH-01','GH-02','GH-03','GH-04','GH-05','GH-06','GH-07','GH-08','GH-09','GH-10'],
 X:[[2,8,3],[7,3,8],[4,6,5],[8,2,7],[3,7,4],[6,4,6],[1,9,2],[9,1,9],[5,5,3],[4,4,8]],
 query:[4.5,6.5,4],query_new:[7,3,7]
};
export const bootstrap=`import numpy as np\nnames = ${JSON.stringify(dataset.names)}\nX = np.array(${JSON.stringify(dataset.X)}, dtype=float)\nquery = np.array(${JSON.stringify(dataset.query)}, dtype=float)\nquery_new = np.array(${JSON.stringify(dataset.query_new)}, dtype=float)\n`;
export const stages=[
 {id:'inspect',title:'پروندهٔ گلخانه را باز کن',xp:20,function:'inspect_data',
 concept:'ده وضعیت ساختگی از گلخانه ثبت شده است. هر سطر یک وضعیت و هر ستون یک امتیاز محیطی است. برای شروع، گزارشی قابل استفاده از ساختار ورودی بساز.',
 task:'تابع <code>inspect_data(X)</code> را بساز. خروجی یک دیکشنری با دو عدد صحیحِ <code>n_samples</code> و <code>n_features</code> باشد. تابع باید برای جدول‌های هم‌ساخت با اندازه‌های دیگر هم کار کند.',
 example:'inspect_data(np.zeros((4, 2)))\n# {"n_samples": 4, "n_features": 2}',
 hints:['به این فکر کن که نمونه و ویژگی در کدام جهت جدول قرار دارند.','خروجی باید اندازهٔ دو محور ورودی را گزارش کند؛ عدد ثابت ننویس.','ویژگی shape در آرایهٔ NumPy اندازهٔ محورهای آن را نگه می‌دارد.'],
 starter:'# Mission 1: Describe any rectangular dataset.\ndef inspect_data(X):\n    pass\n\nprint(inspect_data(X))\n'},
 {id:'pair',title:'شباهت دو وضعیت را اندازه بگیر',xp:30,function:'pair_distance',
 concept:'برای مقایسهٔ دو وضعیت، به یک عدد نیاز داریم که با تفاوت بیشتر ویژگی‌ها بزرگ‌تر شود. در این مأموریت معیار ما فاصلهٔ اقلیدسی است.',
 task:'تابع <code>pair_distance(a, b)</code> فاصلهٔ اقلیدسی دو بردار هم‌اندازه را به‌صورت یک عدد برگرداند. ورودی‌ها می‌توانند تعداد ویژگی متفاوتی با جدول فعلی داشته باشند.',
 example:'pair_distance(np.array([1., 2.]), np.array([4., 6.]))\n# 5.0',
 hints:['از تعریف هندسی فاصلهٔ اقلیدسی شروع کن.','اختلاف مؤلفه‌ها باید بدون خنثی‌کردن علامت یکدیگر جمع شوند.','مربع اختلاف‌ها را جمع کن و ریشهٔ دوم بگیر؛ جزوه مثال مستقلی دارد.'],
 starter:'\n# Mission 2: Compare two states.\ndef pair_distance(a, b):\n    pass\n\nprint(pair_distance(X[0], query))\n'},
 {id:'distances',title:'تمام سابقه‌ها را جست‌وجو کن',xp:50,function:'distances_to',
 concept:'اکنون وضعیت تازهٔ حسگرها را با تمام سابقه‌ها مقایسه کن. هر وضعیت ثبت‌شده باید یک فاصلهٔ مستقل داشته باشد.',
 task:'تابع <code>distances_to(X, query)</code> یک آرایهٔ یک‌بعدی به طول تعداد سطرهای X برگرداند. عضو i، فاصلهٔ سطر i تا query باشد. ورودی X را تغییر نده.',
 example:'distances_to(np.array([[0.,0.],[3.,4.]]), np.array([0.,0.]))\n# array([0., 5.])',
 hints:['پس از مقایسه، برای هر سطر به چند عدد خروجی نیاز داری؟','برای یک راه‌حل برداری، بردار پرس‌وجو با تمام سطرها مقایسه می‌شود.','جمع روی محور ویژگی‌ها انجام می‌شود؛ نتیجه باید فقط محور نمونه‌ها را داشته باشد.'],
 starter:'\n# Mission 3: Score every reference state.\ndef distances_to(X, query):\n    pass\n\nprint(distances_to(X, query))\n'},
 {id:'neighbors',title:'سه سابقهٔ نزدیک‌تر را انتخاب کن',xp:60,function:'neighbors',
 concept:'گروه باغبانی می‌خواهد چند سابقهٔ مشابه را مرور کند. نام‌ها برای نمایش‌اند؛ تابع باید جایگاه سطرها را برگرداند.',
 task:'تابع <code>neighbors(X, query, k)</code> دقیقاً k اندیس صحیح و متفاوت را از نزدیک به دور برگرداند. همسایه‌ها را از صفر شماره‌گذاری کن. اگر فاصله‌ها مساوی بودند، هر ترتیب صحیح پذیرفته است. در ورودی‌های بررسی، <code>1 ≤ k ≤ len(X)</code> برقرار است.',
 example:'neighbors(np.array([[0.,0.],[3.,4.],[1.,0.]]), np.array([0.,0.]), 2)\n# array([0, 2])',
 hints:['آیا این تسک مقدار فاصله را می‌خواهد یا جایگاه نمونه‌ها را؟','اول ترتیب نزدیکی را مشخص کن، سپس k مورد را نگه دار.','خروجی argsort اندیس‌های ترتیب‌داده‌شده است؛ با sort مقایسه‌اش کن.'],
 starter:'\n# Mission 4: Return k nearest row indices.\ndef neighbors(X, query, k):\n    pass\n\nprint(neighbors(X, query, 3))\n'},
 {id:'search',title:'ابزار جست‌وجوی قابل استفاده بساز',xp:80,function:'search',
 concept:'پژوهشگر فقط اندیس‌ها را نمی‌خواهد؛ باید بداند هر سابقه چقدر نزدیک است. یک خروجی منظم بساز که برای پرس‌وجوی بعدی هم قابل استفاده باشد.',
 task:'تابع <code>search(X, query, k)</code> دیکشنری با دو کلید <code>indices</code> و <code>distances</code> برگرداند. هر دو آرایه طول k داشته باشند و فاصلهٔ هر عضو با اندیس همان جایگاه مطابقت داشته باشد. ترتیب از نزدیک به دور است.',
 example:'search(np.array([[0.,0.],[3.,4.]]), np.array([0.,0.]), 2)\n# {"indices": [0, 1], "distances": [0., 5.]}',
 hints:['خروجی باید رابطهٔ نمونه و فاصله‌اش را حفظ کند.','می‌توانی از تابع‌های قبلی خودت استفاده کنی یا راه‌حل مستقل بنویسی.','فاصله‌های انتخاب‌شده را با همان اندیس‌های انتخاب‌شده بردار، سپس دیکشنری خروجی را بساز.'],
 starter:'\n# Mission 5: Package a reusable search result.\ndef search(X, query, k):\n    pass\n\nprint(search(X, query, 3))\n'},
 {id:'compare',title:'فرضیه‌ات را با یک وضعیت تازه بیازما',xp:60,function:'compare_queries',
 concept:'پرس‌وجوی دوم، وضعیت متفاوتی از گلخانه است. پیش‌بینی کن کدام همسایه‌ها عوض می‌شوند؛ سپس با ابزار خودت آزمایش کن.',
 task:'تابع <code>compare_queries(X, before, after, k)</code> سه کلید برگرداند: <code>before_indices</code> و <code>after_indices</code> برای k همسایهٔ مرتب هر پرس‌وجو؛ و <code>changed</code> که یک bool است و تغییر مجموعهٔ همسایه‌ها را نشان می‌دهد. جابه‌جایی ترتیب همان اعضا، تغییر مجموعه محسوب نمی‌شود. نتیجه و استدلالت را هم در یادداشت آزمایش بنویس.',
 example:'# Return contract:\n# {"before_indices": [...], "after_indices": [...], "changed": True or False}',
 hints:['ممکن است ورودی عوض شود اما مجموعهٔ نزدیک‌ترین همسایه‌ها ثابت بماند.','خروجی دو جست‌وجو را مقایسه کن؛ مراقب تفاوت مجموعه و ترتیب باش.','برای changed، مجموعهٔ اندیس‌های دو نتیجه را مقایسه کن. توضیح نوشتاری جدا از بررسی محاسبه ذخیره می‌شود.'],
 starter:'\n# Mission 6: Test whether the neighbor set changed.\ndef compare_queries(X, before, after, k):\n    pass\n\nprint(compare_queries(X, query, query_new, 3))\n'}
];
export function normalize(raw){return {codes:stages.map((s,i)=>typeof raw?.codes?.[i]==='string'?raw.codes[i].slice(0,20000):(i===0?s.starter:'')),active:Number.isInteger(raw?.active)?Math.max(0,Math.min(5,raw.active)):0,explanation:typeof raw?.explanation==='string'?raw.explanation.slice(0,3000):'',hints:stages.map((_,i)=>Number.isInteger(raw?.hints?.[i])?Math.max(0,Math.min(3,raw.hints[i])):0)}};
export function available(snapshot){const done=new Set(snapshot.completed||[]);const i=stages.findIndex(s=>!done.has(s.id));return i<0?5:i;}
export function highlight(code){const e=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));return code.split(/(#[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:import|from|as|for|in|if|else|def|return|while|True|False|None|and|or|not|pass)\b|\b\d+(?:\.\d+)?\b)/g).map((s,i)=>i%2?`<span class="syn-${s[0]==='#'?'comment':/^['"]/.test(s)?'string':/^\d/.test(s)?'number':'keyword'}">${e(s)}</span>`:e(s)).join('');}
