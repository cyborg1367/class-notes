# نصب بخش مستقل Exams — بدون اتصال ChatGPT به حساب‌های شما

## فایل‌ها

**فایل شماره ۱، ZIP مخصوص ریشهٔ class-notes** را Extract کنید و پوشه‌های `frontend/`، `web/`، `docs/` و `tests/` را در همان ریشهٔ دارای `package.json` ادغام کنید. فایل‌های هم‌نام را جایگزین کنید. ZIP هیچ کلید پاسخ یا credential خصوصی ندارد.

**فایل شماره ۲، `exams-setup-private.sql`** خصوصی است؛ آن را داخل ریشهٔ پروژه، GitHub، `web` یا `dist` کپی نکنید. محتوا را در **Supabase → SQL Editor → New query** اجرا کنید. این فایل جداول و توابع مستقل امتحانات و بانک ۱۵ سؤال را داخل Supabase ایجاد می‌کند.

## قبل از اجرای SQL خصوصی — کنترل پیش‌نیاز

در Supabase → SQL Editor این کوئری فقط‌خواندنی را اجرا کنید:

```sql
select n.nspname as schema_name, p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as return_type
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='classroom_state';
```

باید تابع `public.classroom_state()` **بدون پارامتر** وجود داشته باشد که برای کاربر جاری `memberships` و وضعیت `active` را برمی‌گرداند. این پیش‌نیاز از رفتار موجود سایت استخراج شده است؛ چون ساختار واقعی جدول عضویت ارسال نشده، اگر تابع تعریف یا خروجی دیگری دارد SQL خصوصی را **اجرا نکنید** و ابتدا نگاشت عضویت را بررسی کنید.

## ترتیب پیشنهادی نصب

1. از پروژهٔ Git و دیتابیس نسخهٔ پشتیبان داشته باشید.
2. ZIP مربوط به ریشه را Extract کنید و فایل‌ها را ادغام کنید.
3. در ریشه روی ویندوز PowerShell، ابزارها را چک کنید: Node مطابق `.nvmrc` (نسخه ۲۴) و Python مطابق `.python-version` (نسخه ۳٫۱۲).
4. از داخل ریشه اجرا کنید:

   ```powershell
   npm.cmd ci
   npm.cmd run check
   npm.cmd run build
   ```

   `npm run check` تست‌ها و کنترل صحت Build را اجرا می‌کند؛ `npm run build` خروجی نهایی را در **`dist/`** می‌سازد. به صورت دستی `dist` را به GitHub اضافه نکنید (در `.gitignore` قرار دارد).
5. پس از تأیید پیش‌نیاز `classroom_state()`، فایل خصوصی `exams-setup-private.sql` را فقط در **Supabase SQL Editor** اجرا کنید. این فایل امتحان را با `published=false` ایجاد می‌کند؛ Quizها و Lessons موجود را تغییر نمی‌دهد.
6. در SQL Editor با دستور زیر کنترل کنید:

   ```sql
   select e.id,e.published,e.duration_minutes,count(q.id) as questions
   from classroom_exam_private.exams e
   left join classroom_exam_private.questions q on q.exam_id=e.id
   where e.id='machine-learning-midterm'
   group by e.id,e.published,e.duration_minutes;
   ```

   انتظار: `published=false`، `duration_minutes=60` و `questions=15`.
7. فایل‌های سورس ادغام‌شده را طبق روال خودتان commit/push کنید. اتصال کنونی GitHub→Cloudflare، طبق پیکربندی پروژه، Build و انتشار را انجام می‌دهد. اگر فرمان Build در Cloudflare قابل پیکربندی است، از `npm run check` + `npx wrangler deploy` استفاده کنید؛ در حالت build-only مسیر خروجی **`dist`** است. بی‌جهت دوباره `wrangler deploy` محلی اجرا نکنید.
8. در آدرس انتشار یافته، `/exams/` و `/exams/machine-learning-midterm/` را بازبینی کنید. تا وقتی `published=false` است امتحان برای دانشجویان نمایان نیست.
9. برای فعال‌سازی پس از آماده بودن، در SQL Editor بزنید:

   ```sql
   update classroom_exam_private.exams
   set published=true
   where id='machine-learning-midterm';
   ```

   برای غیرفعال‌کردن **شروع‌های جدید** نیز `published=false` بگذارید؛ تلاش شروع‌شده تا مهلت خودش ادامه می‌یابد.

## رفتار آزمون

- دانشجو پس از شروع، **یک تلاش** مصرف می‌کند، حتی اگر صفحه را ببندد. تا زمان پایان می‌تواند از همان تلاش ادامه دهد.
- محدودیت زمان در پایگاه‌داده کنترل می‌شود. اگر زمان تمام شود، آخرین پاسخ‌های ذخیره‌شده در سرور تصحیح می‌شوند؛ یک بازدید/درخواست بعدی نیز می‌تواند نهایی‌سازی تلاش منقضی‌شده را انجام دهد.
- پس از ثبت، نتیجهٔ عددی و پاسخ‌نامهٔ کامل ۱۵ سؤال نمایش داده می‌شود. در مراجعهٔ بعدی هم از بخش Exams قابل مشاهده است.
- ارزیابی دانشجو: یک امتیاز ۱ تا ۵ و یک نظر اختیاری که فقط پس از ثبت امتحان پذیرفته می‌شود.
- انتشار **بلافاصلهٔ** پاسخ‌نامه ممکن است سبب به‌اشتراک‌گذاری پاسخ‌ها میان دانشجویان شود؛ این یکی از پیامدهای سیاست بازخورد فوری است.

## مشاهدهٔ بازخورد دانشجویان توسط مدرس

از Supabase SQL Editor این Query فقط‌خواندنی را اجرا کنید:

```sql
select a.user_id, a.status, a.score, a.feedback_rating,
       a.feedback_comment, a.feedback_at
from classroom_exam_private.attempts a
where a.exam_id='machine-learning-midterm'
order by a.feedback_at desc nulls last;
```

در نسخهٔ فعلی، فرم بازخورد داخل صفحهٔ کارنامهٔ دانشجو وجود دارد و بازخوردها در دیتابیس ذخیره می‌شوند. **پنل تحلیلی مدرس برای بازخوردها در رابط سایت هنوز افزوده نشده است**؛ فعلاً گزارش از SQL Editor قابل مشاهده است.

## نکته‌های امنیتی

- SQL خصوصی حاوی متن ۱۵ سؤال، پاسخ صحیح و دلایل است. آن را push نکنید، حتی در پوشهٔ `docs`.
- فرانت‌اند از کلید publishable موجود در `web/assets/auth-config.json` استفاده می‌کند؛ هیچ کلید service role یا رمز جدیدی لازم نیست.
- در Supabase فقط `SECURITY DEFINER` RPCها دسترسی کنترل‌شده می‌دهند؛ کلیدها پیش از ثبت نهایی به مرورگر تحویل داده نمی‌شوند.
- تست نهایی با یک حساب دانشجوی **آزمایشی** انجام شود؛ شروع امتحان برای آن حساب یک تلاش مصرف می‌کند.
- بعد از اجرای SQL، تغییر متن/کلیدها را برای امتحانی که حتی یک تلاش شروع شده است با نسخهٔ جدید انجام دهید؛ فایل SQL عمداً از بازنویسی سؤال پس از اولین تلاش جلوگیری می‌کند.
