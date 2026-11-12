export function portalEscape(value: unknown){const entities:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};return String(value??"").replace(/[&<>"']/g,c=>entities[c]);}
export function portalInline(value: unknown){return String(value??'').split(/(`[^`]+`)/g).map(s=>s.startsWith('`')&&s.endsWith('`')?'<code dir="ltr" class="portal-inline-code">'+portalEscape(s.slice(1,-1))+'</code>':portalEscape(s)).join('');}
export function portalBlankValue(value: unknown){return String(value??'').trim().replace(/[۰-۹٠-٩]/g,c=>String(c.charCodeAt(0)-(c.charCodeAt(0)>=1776?1776:1632)));}
export function portalBlankError(value: unknown,kind: string){
 const s=portalBlankValue(value);if(!s)return '';
 if(s.length>200)return 'پاسخ باید حداکثر 200 نویسه داشته باشد.';
 if(kind==='integer'&&!/^[+-]?[0-9]+$/.test(s))return 'یک عدد صحیح وارد کن؛ از نوشتن عبارت یا عدد اعشاری استفاده نکن.';
 if(kind==='identifier'&&!/^[A-Za-z_][A-Za-z0-9_]*$/.test(s))return 'فقط نام خواسته‌شده را بنویس؛ بدون پیشوند، فاصله یا پرانتز.';
 if(kind==='operator'&&!/^(?:==|!=|<=|>=|<|>)$/.test(s))return 'یک عملگر مقایسهٔ معتبر بنویس؛ بین نویسه‌های آن فاصله نگذار.';
 if(kind==='stringLiteral'&&!/^(?:"(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*')$/.test(s))return 'متن را داخل یک جفت کوتیشن انگلیسی بنویس؛ کوتیشن آغاز و پایان باید یکسان باشند.';
 return '';
}
export function portalBlankHelp(kind: string){return ({integer:'عدد صحیح؛ اعداد فارسی هم پذیرفته می‌شوند.',identifier:'فقط نام خواسته‌شده؛ بدون پرانتز یا پیشوند.',operator:'عملگر مقایسه؛ نویسه‌های آن را بدون فاصله بنویس.',stringLiteral:'رشته داخل کوتیشن انگلیسی تکی یا دوتایی.'} as Record<string,string>)[kind]||'فقط قطعهٔ خواسته‌شده را وارد کن.';}
