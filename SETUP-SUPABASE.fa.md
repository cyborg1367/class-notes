# اتصال ورود Google به دفتر کلاس

این بسته نسخهٔ وبِ اصلاح‌شدهٔ یادداشت ۰۲، صفحهٔ حساب دانشجو و ذخیرهٔ پاسخ‌های هر دو جزوه را دارد. ظاهر اصلی سایت حفظ شده است. تنظیمات واقعی Supabase و Google هنوز انجام نشده‌اند؛ تا آن زمان مطالعهٔ جزوه‌ها و ذخیرهٔ محلی کار می‌کنند و ورود غیرفعال است.

در این نسخه جزوه‌ها عمومی‌اند. هر دارندهٔ حساب Google می‌تواند حساب شخصی بسازد؛ عضویت در کلاس و تأیید مدرس پیاده نشده است. هر دانشجو فقط ردیف‌های پاسخ متعلق به خودش را از API می‌بیند. صاحب پروژه همچنان از داشبورد مدیریتی به داده‌ها دسترسی دارد. دکمهٔ ذخیره، پاسخ همین درس را به‌روزرسانی می‌کند؛ ارسال نهایی تکلیف یا تصحیح خودکار نیست.

## ۱. پروژهٔ Supabase را بساز

در [داشبورد Supabase](https://supabase.com/dashboard) وارد شو و New project را بزن. یک پروژهٔ مشخص برای همین سایت بساز؛ نام `class-notes` مناسب است. رمز پایگاه داده را خودت در جای امن نگه دار؛ در کد سایت استفاده نمی‌شود.

پس از آماده‌شدن پروژه، از بخش Connect یا تنظیمات API این دو مقدار را بردار:

- Project URL، مانند `https://PROJECT_REF.supabase.co`
- Publishable key که با `sb_publishable_` شروع می‌شود.

کلید عمومی برای قرارگرفتن در مرورگر طراحی شده است. کلید Secret، کلید service_role، رمز پایگاه داده و Google Client Secret نباید در GitHub یا گفتگو قرار بگیرند.

## ۲. نشانی‌های برگشت را در Supabase ثبت کن

در Authentication → URL Configuration:

Site URL:

```text
https://cyborg1367.github.io/class-notes/
```

در Redirect URLs این نشانی را اضافه کن:

```text
https://cyborg1367.github.io/class-notes/account/
```

مسیر و اسلش انتهایی را دقیقاً حفظ کن. کد، مسیر درس قبلی را در همان تب نگه می‌دارد؛ برای برگشت به درس نیازی به wildcard در فهرست نشانی‌ها ندارد.

## ۳. Google را به پروژه متصل کن

در Supabase به Authentication → Sign In / Providers → Google برو. نشانی Callback نمایش‌داده‌شده را کپی کن؛ در پروژه‌های معمولی شبیه این است:

```text
https://PROJECT_REF.supabase.co/auth/v1/callback
```

در [Google Cloud Console](https://console.cloud.google.com/) یک پروژه برای کلاس انتخاب یا ایجاد کن. سپس Google Auth Platform را باز کن:

1. در Branding نام برنامه، ایمیل پشتیبانی و اطلاعات تماس خودت را وارد کن؛ مثلاً نام `Class Notes — Masoud Ahangary`.
2. در Audience برای دانشجویانی که حساب شخصی Google دارند، External را انتخاب کن. در مرحلهٔ Testing ایمیل حساب آزمایشی خودت و هر آزمایش‌کننده را به Test users اضافه کن. برای استفادهٔ عمومی دانشجویان، تنظیمات انتشار را در همین بخش تکمیل کن؛ نیاز به بررسی برند را خود کنسول Google مشخص می‌کند.
3. در Data Access فقط دسترسی‌های ورود را تنظیم کن: `openid`، `.../auth/userinfo.email` و `.../auth/userinfo.profile`. دسترسی Gmail، Drive یا Calendar لازم نیست.
4. در Clients یک OAuth client از نوع Web application بساز.
5. در Authorized JavaScript origins فقط این origin را وارد کن؛ مسیر مخزن اینجا وارد نمی‌شود:

```text
https://cyborg1367.github.io
```

6. در Authorized redirect URIs همان Callback کپی‌شده از Supabase را وارد کن. این نشانی با صفحهٔ `account/` سایت متفاوت است: Google به Supabase برمی‌گردد، سپس Supabase کاربر را به سایت برمی‌گرداند.
7. Client ID و Client Secret را مستقیماً در تنظیمات Google Provider داخل Supabase قرار بده، Google را فعال کن و ذخیره کن. Client Secret فقط در داشبورد Supabase می‌ماند.

برای این روش ورود، تنظیم سرویس ارسال ایمیل لازم نیست.

## ۴. جدول پاسخ‌ها را بساز

در SQL Editor پروژهٔ درست، محتوای این فایل را یک بار اجرا کن:

```text
supabase/001_student_answers.sql
```

این فایل جدول تازه‌ای با نام `class_notes_answers` و قواعد Row Level Security می‌سازد. دسترسی ناشناس ندارد و خواندن، نوشتن، به‌روزرسانی و حذف فقط برای صاحب ردیف مجاز است. محدودیت اندازهٔ پاسخ و ارتباط با حساب Auth هم در پایگاه داده اعمال می‌شود. اگر جدول از قبل وجود دارد، آن را حذف نکن؛ این مهاجرت برای اجرای نخست است و اجرای دوباره عمداً متوقف می‌شود.

## ۵. تنظیم عمومی سایت را تکمیل کن

در فایل `assets/auth-config.json` دو مقدار واقعی پروژه را جایگزین کن:

```json
{
  "supabaseUrl": "https://PROJECT_REF.supabase.co",
  "publishableKey": "sb_publishable_YOUR_PUBLIC_KEY"
}
```

هیچ مقدار دیگری از تنظیمات Google یا رمزها را به این فایل اضافه نکن. سازندهٔ سایت کلیدهای غیرعمومی را رد می‌کند. نسخهٔ ثابتِ Supabase JS، شمارهٔ 2.118.0، همراه مجوز MIT داخل بسته است؛ برای بارگذاری کتابخانه به CDN وابسته نیستیم.

فایل‌های داخل ZIP را با حفظ مسیر پوشه‌ها در ریشهٔ مخزن `class-notes` قرار بده؛ پوشه‌ای به نام ZIP در مخزن نساز. پوشهٔ `.github` در این بسته وجود ندارد؛ همان Action فعلیِ سالم را نگه دار. بخش `dist/` را نیز لازم نیست آپلود کنی؛ Action با `python3 build.py` آن را می‌سازد.

## ۶. ورود واقعی را بررسی کن

پس از اتمام Action، صفحهٔ زیر را باز کن:

```text
https://cyborg1367.github.io/class-notes/account/
```

از یک جزوه وارد حساب شو؛ باید با Google وارد شوی و به همان درس برگردی. در جدول تمرین یک پاسخ آزمایشی بنویس و «ذخیره / به‌روزرسانی پاسخ‌ها» را بزن. روی مرورگر دیگری با همان حساب وارد شو و «دریافت نسخهٔ حساب» را بزن؛ پاسخ باید بازیابی شود. سپس با حساب دوم امتحان کن؛ پاسخ حساب اول نباید نمایش داده شود.

پیش‌نویسِ بدون ورود خودکار به حساب تازه منتقل نمی‌شود. اگر پیش از ورود پاسخ نوشته شده باشد، گزینهٔ «آوردن پیش‌نویسِ بدون ورود» آن را پس از تأیید در جدول می‌آورد؛ ارسال به حساب همچنان دکمهٔ ذخیره می‌خواهد. پیش‌نویسِ هر حساب در همان مرورگر جدا نگه داشته می‌شود. خروج از حساب، پیش‌نویس‌های محلی را حذف نمی‌کند. دریافت نسخهٔ حساب در صورت وجود پاسخ متفاوت، پیش از جایگزین‌کردن از دانشجو تأیید می‌گیرد.

خطای `redirect_uri_mismatch` معمولاً از Callback ثبت‌شده در Google است. خطای عدم اجازهٔ کاربر در حالت Testing را با Test users بررسی کن. اگر برگشت به سایت اشتباه است، Site URL و Redirect URLs در Supabase را بررسی کن. اگر ورود موفق است ولی ذخیره انجام نمی‌شود، اجرای SQL در پروژهٔ درست و فعال‌بودن RLS را بررسی کن؛ RLS را برای حل خطا خاموش نکن.

## بررسی انجام‌شده روی بسته

مسیرهای پنج صفحه، دارایی‌ها و فرمول‌های جزوهٔ اول بررسی شده‌اند. آزمون‌های کد، رابط ورود با کلاینت آزمایشی، جداسازی پیش‌نویس‌ها و قواعد SQL در PostgreSQL اجرا شده‌اند. آزمایش ورود واقعی Google، تنظیمات پروژهٔ زنده و نمایش در مرورگر واقعی پس از اتصال و انتشار باید انجام شود؛ آزمون‌های محلی جای آن را نمی‌گیرند.

برای تکرار آزمون‌های وابسته به Node، دو وابستگی آزمایشی لازم است؛ سایت و Action ساخت به آن‌ها وابسته نیستند:

```bash
npm install --no-save linkedom@0.18.12 @electric-sql/pglite@0.3.14
python3 build.py
python3 check.py
node --test tests/*.test.cjs
```

منابع رسمی: [Google در Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)، [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)، [کلیدهای API](https://supabase.com/docs/guides/getting-started/api-keys)، [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)، [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow).
