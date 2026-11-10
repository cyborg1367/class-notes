// Pure presentation helpers. Neither this module nor the UI grants XP.
export const views=[['overview','نمای کلی'],['students','دانشجویان'],['attempts','آزمون‌ها'],['labs','لابراتورها'],['requests','درخواست‌ها']];
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const inline=value=>String(value??'').split(/(`[^`]+`)/g).map(s=>s.startsWith('`')&&s.endsWith('`')?'<code dir="ltr">'+escapeHTML(s.slice(1,-1))+'</code>':escapeHTML(s)).join('');
export const fa=n=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(Number(n));
export const latin=n=>new Intl.NumberFormat('en-US',{useGrouping:false,maximumFractionDigits:2}).format(Number(n));
export function date(value,time=false){if(!value||!Number.isFinite(Date.parse(value)))return 'ثبت نشده';return new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',...(time?{timeStyle:'short'}:{}),timeZone:'Asia/Tehran'}).format(new Date(value));}
export function relative(value,clock=Date.now()){
 if(!value||!Number.isFinite(Date.parse(value)))return 'ثبت نشده';
 const days=Math.floor(Math.max(0,clock-Date.parse(value))/86400000);
 return days===0?'امروز':days===1?'دیروز':days<14?fa(days)+' روز پیش':date(value);
}
export function freshFilters(){return {
 students:{query:'',status:'enrolled',cursors:[null],index:0},
 attempts:{query:'',lesson:null,kind:'all',section:'attempts',cursors:[null],index:0,asOf:null},
 labs:{query:'',mission:'all',cursors:[null],index:0},
 requests:{query:'',cursors:[null],index:0}
};}
export function resetPages(filter){filter.cursors=[null];filter.index=0;if('asOf'in filter)filter.asOf=null;}
export function createRequestGate(isCurrent=()=>true){
 let epoch=0,disposed=false;const tickets=new Map();
 return {
  current:()=>!disposed&&isCurrent(),
  ticket(channel){const at=epoch,number=(tickets.get(channel)||0)+1;tickets.set(channel,number);return ()=>!disposed&&at===epoch&&tickets.get(channel)===number&&isCurrent();},
  cancel(channel){tickets.set(channel,(tickets.get(channel)||0)+1);},
  invalidate(){epoch++;tickets.clear();},
  dispose(){disposed=true;epoch++;tickets.clear();}
 };
}
function nonnegative(value){return typeof value==='number'&&Number.isFinite(value)&&value>=0;}
export function reportPage(value){
 if(!value||!Array.isArray(value.rows)||!nonnegative(value.total)||value.rows.length>100
  ||!(value.next_cursor===null||typeof value.next_cursor==='object'&&!Array.isArray(value.next_cursor))
  ||!nonnegative(value.page_size)||value.page_size<1)throw Error('INVALID_INSTRUCTOR_RESPONSE');
 return value;
}
export function overviewReport(value){
 if(value?.schema_version!==1||!value.stats||!['active_students','pending_students','total_attempts'].every(k=>nonnegative(value.stats[k]))
  ||!Array.isArray(value.labs)||!Array.isArray(value.pending)||!Array.isArray(value.concepts))throw Error('INVALID_INSTRUCTOR_RESPONSE');
 return value;
}
export function studentReport(value){
 if(!value?.user_id||!['active','pending','suspended'].includes(value.status)||!value.lab
  ||!['xp','maximum','completed','task_count','attempts'].every(k=>nonnegative(value.lab[k]))
  ||!Array.isArray(value.lab.missions))throw Error('INVALID_INSTRUCTOR_RESPONSE');
 return value;
}
export function labFor(student,mission='all'){
 if(mission==='all')return student.lab;
 const m=student.lab.missions.find(m=>m.mission===mission);
 return m?{...m,completed:Array.isArray(m.completed)?m.completed.length:m.completed_count}:null;
}
// Keep cursor timestamps as the exact server strings: Date/ISO conversion
// would discard PostgreSQL microseconds and can skip tied records.
export function pageArgs(view,course,filter,limit=20){
 if(view==='attempts')return {p_course:course,p_query:filter.query,p_lesson:filter.lesson,p_kind:filter.kind,
  p_after:filter.cursors[filter.index],p_limit:limit,p_as_of:filter.asOf};
 return {p_course:course,p_query:filter.query,
  p_status:view==='requests'?'pending':view==='labs'?'active':filter.status,
  p_after:filter.cursors[filter.index],p_limit:limit};
}
export function message(error){
 if(/TEACHER_REQUIRED|CLASS_ACCESS_REQUIRED/.test(error?.message||''))return 'دسترسی مدرس برای این کلاس تأیید نشد. وضعیت حساب را بررسی کنید.';
 if(['PGRST202','42883'].includes(error?.code)&&/classroom_instructor_/.test(error?.message||''))return 'نسخهٔ سرور پنل مدرس نیاز به به‌روزرسانی دارد.';
 if(/STUDENT_UNAVAILABLE/.test(error?.message||''))return 'این دانشجو دیگر در فهرست اعضای کلاس نیست. گزارش را به‌روزرسانی کنید.';
 if(/INSTRUCTOR_REPORT_CHANGED/.test(error?.message||''))return 'اطلاعات هنگام دریافت تغییر کرد؛ گزارش را به‌روزرسانی و دوباره امتحان کنید.';
 return 'دریافت یا ثبت اطلاعات کامل نشد. اتصال را بررسی کنید و دوباره تلاش کنید.';
}
export function csvText(rows){
 const cell=value=>{let text=String(value??'');if(/^[\s\uFEFF]*[=+@-]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
 return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
export function exportRows(view,rows,mission='all'){
 if(view==='attempts')return [['name','email','lesson','version','attempt','score','maximum','registered_at'],
  ...rows.map(a=>[a.name,a.email,a.title,a.version,a.attempt_no,a.score,a.maximum,a.created_at])];
 if(view==='labs')return [['name','email','mission','xp','maximum','completed_tasks','task_count'],...rows.map(p=>{
  const lab=labFor(p,mission);return [p.name,p.email,mission,lab?.xp??'',lab?.maximum??'',lab?.completed??'',lab?.task_count??''];
 })];
 return [['name','email','access_status','lab_xp','lab_xp_maximum','completed_tasks','task_count','last_registered_at'],
  ...rows.map(p=>[p.name,p.email,p.status,p.lab.xp,p.lab.maximum,p.lab.completed,p.lab.task_count,p.last_registered_at])];
}
/**
 * @param {(args: Record<string, any>) => Promise<unknown>} load
 * @param {Record<string, any>} initialArgs
 * @param {{alive?: () => boolean, onProgress?: (count: number, total: number) => void}} [options]
 */
export async function collectPages(load,initialArgs,{alive=()=>true,onProgress=()=>{}}={}){
 const rows=[],ids=new Set(),cursors=new Set();let args={...initialArgs,p_after:null,p_limit:100},expected=null;
 while(true){
  if(!alive())throw Error('INSTRUCTOR_EXPORT_CANCELLED');
  const page=reportPage(await load(args));if(!alive())throw Error('INSTRUCTOR_EXPORT_CANCELLED');
  if(expected===null)expected=page.total;else if(expected!==page.total)throw Error('INSTRUCTOR_REPORT_CHANGED');
  if(page.as_of)args.p_as_of=page.as_of;
  for(const row of page.rows){const id=row.id||row.user_id;if(!id||ids.has(id))throw Error('INSTRUCTOR_REPORT_CHANGED');ids.add(id);rows.push(row);}
  onProgress(rows.length,expected);
  if(!page.next_cursor)break;
  const cursor=JSON.stringify(page.next_cursor);if(cursors.has(cursor)||!page.rows.length)throw Error('INSTRUCTOR_REPORT_CHANGED');cursors.add(cursor);args.p_after=page.next_cursor;
 }
 if(rows.length!==expected)throw Error('INSTRUCTOR_REPORT_CHANGED');
 return rows;
}
