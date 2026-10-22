export const stages = [
  {title:'داده را بشناس', concept:'هر سطر یک نمونه است و هر ستون یک ویژگی. پیش از محاسبه، اندازهٔ ورودی را بشناس.', task:'از <code>X.shape</code>، دو عدد <code>n_samples</code> و <code>n_features</code> را تعریف کن و آن‌ها را چاپ کن.', hint:'X.shape یک زوج مرتب است: ابتدا تعداد سطرها، سپس تعداد ستون‌ها.', starter:'# Task 1: Inspect the dataset.\n# Define n_samples and n_features using X.shape.\n'},
  {title:'سطر و ستون را جدا کن', concept:'یک نمونه و یک ویژگی، دو برش متفاوت از یک ماتریس‌اند.', task:'سطر اول را در <code>first_sample</code> و ستون اول را برای تمام نمونه‌ها در <code>first_feature</code> قرار بده. هر دو خروجی باید یک‌بعدی باشند.', hint:'در X[row, column]، علامت : یعنی تمام مقادیر آن محور.', starter:'\n# Task 2: Select the first row and the first column.\n# Define first_sample and first_feature.\n'},
  {title:'اختلاف‌ها را بساز', concept:'در broadcasting، بردار پرس‌وجو با تک‌تک سطرهای ماتریس مقایسه می‌شود.', task:'اختلاف <code>X - query</code> را در <code>differences</code> بساز. سپس شکل آن را چاپ و با شکل X مقایسه کن.', hint:'برای این تفریق به حلقه نیاز نداری. نتیجه باید برای هر نمونه، اختلاف تمام ویژگی‌ها را نگه دارد.', starter:'\n# Task 3: Subtract query from every row.\n# Define differences and inspect its shape.\n'},
  {title:'فاصله‌ها را محاسبه کن', concept:'فاصلهٔ اقلیدسی: ریشهٔ مجموع مربع اختلاف ویژگی‌ها؛ یک عدد برای هر نمونه.', task:'با استفاده از <code>differences</code>، آرایهٔ یک‌بعدی <code>distances</code> را محاسبه کن. توان دوم، جمع روی ویژگی‌ها و ریشه را خودت بنویس.', hint:'پس از توان دوم، باید ستون‌های هر سطر با هم جمع شوند؛ axis را با توجه به این هدف انتخاب کن.', starter:'\n# Task 4: Compute one Euclidean distance per sample.\n# Define distances using square, sum, and square root.\n'},
  {title:'نزدیک‌ترین نمونه را پیدا کن', concept:'مقدار کمینهٔ فاصله با اندیس نمونه‌ای که آن فاصله را دارد متفاوت است.', task:'اندیس صحیحِ نزدیک‌ترین سطر را در <code>nearest_index</code> قرار بده. با آن، نام نمونه را از <code>names</code> چاپ کن.', hint:'در NumPy، توابع min و argmin خروجی یکسانی ندارند. مشخص کن این مرحله کدام را لازم دارد.', starter:'\n# Task 5: Find the index of the nearest sample.\n# Define nearest_index, then print the sample name.\n'},
  {title:'سه همسایه را انتخاب کن', concept:'برای یافتن چند همسایه، ترتیب اندیس‌ها بر اساس فاصله به کار می‌آید.', task:'سه اندیس نزدیک‌تر را از نزدیک به دور در آرایهٔ <code>neighbor_indices</code> قرار بده. این آرایه باید دقیقاً سه عضو داشته باشد.', hint:'argsort اندیس‌های مرتب‌سازی را می‌دهد؛ سپس می‌توانی سه عضو اول را برش بزنی.', starter:'\n# Task 6: Select three nearest neighbors in distance order.\n# Define neighbor_indices and inspect their distances.\n'},
  {title:'پرس‌وجو را تغییر بده', concept:'نزدیکی به پرس‌وجو وابسته است. تغییر یک ویژگی ممکن است فاصله‌ها یا ترتیب همسایه‌ها را تغییر بدهد.', task:'یک کپی مستقل از query با نام <code>query_new</code> بساز، دست‌کم یک ویژگی آن را تغییر بده و فاصله‌های تازه را در <code>distances_new</code> محاسبه کن. سپس در کادر توضیح، نتیجه را با حالت قبلی مقایسه کن.', hint:'از copy برای نگه‌داشتن query اصلی استفاده کن. همان مسیر محاسبهٔ فاصله را برای پرس‌وجوی تازه تکرار کن؛ لازم نیست نزدیک‌ترین نمونه حتماً عوض شود.', starter:'\n# Task 7: Explore a different query.\n# Define query_new without changing query.\n# Change at least one feature and compute distances_new.\n'}
];
export function normalize(raw) {
  const passed = Number.isInteger(raw?.passed) ? Math.max(0,Math.min(7,raw.passed)) : 0;
  return {version:1, passed, active:Number.isInteger(raw?.active)?Math.max(0,Math.min(6,passed,raw.active)):Math.min(passed,6),
    codes: stages.map((s,i)=>typeof raw?.codes?.[i]==='string'?raw.codes[i].slice(0,20000):(i===0?s.starter:'')),
    explanation:typeof raw?.explanation==='string'?raw.explanation.slice(0,3000):''};
}
export function invalidate(state) { state.passed = Math.min(state.passed,state.active); }
export function complete(state) { state.passed = Math.max(state.passed,state.active+1); }
export function advance(state) {
  if(state.active>=6 || state.active>=state.passed) return false;
  const old=state.active++; if(!state.codes[state.active]) state.codes[state.active]=state.codes[old]+stages[state.active].starter;
  return true;
}
export function highlight(code) {
  const escape = s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return code.split(/(#[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:import|from|as|for|in|if|else|def|return|while|True|False|None|and|or|not)\b|\b\d+(?:\.\d+)?\b)/g).map((s,i)=>i%2?`<span class="syn-${s[0]==='#'?'comment':/^['"]/.test(s)?'string':/^\d/.test(s)?'number':'keyword'}">${escape(s)}</span>`:escape(s)).join('');
}
