# انتقال میزبانی دفتر کلاس به Cloudflare

این تنظیمات برای نسخهٔ نهایی ارسالی با نام class-notes(4).rar آماده شده‌اند. سایت با React ساخته می‌شود، اما خروجی آن چند صفحهٔ HTML مستقل در dist است. بنابراین مسیرهای فعلی حفظ می‌شوند و fallback تک‌صفحه‌ای فعال نمی‌شود.

فرانت‌اند روی Workers Static Assets میزبانی می‌شود. دیتابیس، ورود، فایل‌های خصوصی، بررسی لابراتور و داده‌های دانشجوها در همان Supabase فعلی می‌مانند.

## ۱. نصب فایل‌های آماده‌شده

سرور محلی را با Ctrl+C ببند. ZIP بستهٔ Cloudflare را استخراج کن. در PowerShell از داخل پوشهٔ استخراج‌شده اجرا کن:

```powershell
py .\install-cloudflare.py "E:\MyProjects\class-notes"
cd "E:\MyProjects\class-notes"
npm.cmd ci
```

نصب‌کننده ابتدا نسخهٔ فایل‌های هدف را بررسی می‌کند. اگر تغییری با نسخهٔ ارسالی سازگار نباشد، فایل‌های پروژه را تغییر نمی‌دهد. تنظیمات عمومی Supabase، کد صفحات، مطالب و workflow فعلی GitHub Pages را بازنویسی نمی‌کند.

## ۲. پیش‌نمایش محلی با محیط Cloudflare

```powershell
npm.cmd run preview:cloudflare
```

آدرس http://localhost:8787 را باز کن. این دستور build را انجام می‌دهد و خروجی را با Wrangler به صورت محلی ارائه می‌کند؛ چیزی منتشر نمی‌شود.

علاوه بر صفحهٔ اصلی، مسیرهای زیر را مستقیم باز کن و Refresh بزن:

- /account/
- /machine-learning/
- /machine-learning/prediction-problem/
- /quiz/machine-learning/thresholds-and-roc/
- /lab/machine-learning/thresholds-and-roc/

در این محیط، صفحه‌های محافظت‌شده همان قواعد ورود و عضویت فعلی را دارند. برای ورود روی این آدرس، redirect دقیق http://localhost:8787/account/ باید در فهرست Redirect URLs پروژهٔ Supabase مجاز باشد. Site URL اصلی و آدرس‌های قبلی را نگه دار. برای تست صرفاً ظاهر صفحه‌های عمومی، ورود لازم نیست.

## ۳. اولین انتشار روی آدرس آزمایشی Cloudflare

از ریشهٔ پروژه اجرا کن:

```powershell
npx.cmd wrangler login
npm.cmd run deploy:cloudflare
```

دستور اول صفحهٔ ورود Cloudflare را در مرورگر باز می‌کند. وارد همان حسابی شو که دامنه را در آن داری. دستور دوم آزمون‌های پروژه را اجرا می‌کند و در صورت موفقیت، Worker با نام class-notes-web را منتشر می‌کند.

Wrangler آدرسی شبیه این می‌دهد؛ مقدار account متعلق به حساب Cloudflare خودت است:

```text
https://class-notes-web.ACCOUNT.workers.dev
```

در تنظیمات این بسته هیچ دامنه یا route تولیدی ثبت نشده است. انتشار اولیه روی workers.dev انجام می‌شود. دامنهٔ cyborgmass.ir و میزبانی فعلی در این مرحله تغییر نمی‌کنند.

برای تست ورود روی آدرس آزمایشی، مسیر دقیق زیر را در Supabase → Authentication → URL Configuration → Redirect URLs اضافه کن؛ ACCOUNT را با بخش واقعی آدرس جایگزین کن:

```text
https://class-notes-web.ACCOUNT.workers.dev/account/
```

Site URL را همچنان روی دامنهٔ اصلی نگه دار. پروژهٔ Supabase و callback آن در Google تغییر نمی‌کنند.

با حساب خودت یا حساب تست، ورود و خروج، دریافت یادداشت و تصاویر، دانلودها، دفتر مرور، اعلان‌ها و لابراتور را بررسی کن. اگر Edge Function روی originها محدودیت CORS دارد، origin آدرس آزمایشی باید در همان سیاست موجود مجاز شود؛ برای این کار به توکن یا کلید خصوصی در فرانت‌اند نیاز نیست.

## ۴. انتشار خودکار از GitHub

بعد از تست انتشار اولیه، می‌توانی در داشبورد Cloudflare، Worker ساخته‌شده را به مخزن GitHub وصل کنی. در Settings → Build از این مقادیر استفاده کن:

| گزینه | مقدار |
| --- | --- |
| Worker name | class-notes-web |
| Root directory | ریشهٔ مخزن، همان محل package.json |
| Production branch | main |
| Build command | npm run check |
| Deploy command | npx wrangler deploy |

نسخهٔ Wrangler در package.json و package-lock.json ثابت شده است. فایل‌های .nvmrc و .python-version، Node 24 و Python 3.12 را برای محیط build مشخص می‌کنند. نیازی به واردکردن Supabase service-role یا secret key در Cloudflare نیست؛ فرانت‌اند از تنظیمات عمومی موجود در web/assets استفاده می‌کند.

workflow فعلی GitHub Pages را فعلاً حفظ کن. پس از تأیید مهاجرت، انتشار خودکار قدیمی را می‌توان جداگانه غیرفعال کرد.

## ۵. اتصال دامنهٔ اصلی، پس از تأیید تست

در این مرحله ابتدا رکوردهای فعلی cyborgmass.ir و www و ریدایرکت‌ها را بررسی می‌کنیم. سپس در Worker از Settings → Domains & Routes → Add → Custom Domain دامنهٔ اصلی را متصل می‌کنیم.

فعلاً رکوردهای فعلی DNS را حذف نکن. این بسته DNS را تغییر نمی‌دهد.

چون آدرس اصلی همچنان https://cyborgmass.ir می‌ماند، آدرس‌های فعلی ورود و API حفظ می‌شوند. پس از اتصال و فعال‌شدن TLS، مسیرهای مستقیم، ورود و خروج و کارکرد لابراتور را روی خود دامنه دوباره بررسی می‌کنیم.

## جزئیات تنظیمات

- فقط dist به عنوان asset directory منتشر می‌شود؛ سورس frontend و فایل‌های سرور مستقیماً در دسترس قرار نمی‌گیرند.
- html_handling روی force-trailing-slash است تا مسیرهای پوشه‌ای مانند account/ و lab/.../ حفظ شوند.
- آدرس ناموجود، پاسخ 404 می‌گیرد؛ به صفحهٔ اصلی بازنویسی نمی‌شود.
- فایل‌های HTML و تنظیمات عمومی از سیاست پیش‌فرض revalidation استفاده می‌کنند. فقط chunkهای دارای هش در assets/react دارای کش بلندمدت‌اند.
- آدرس workers.dev در پاسخ‌ها noindex دارد تا آدرس آزمایشی در جست‌وجوها به جای دامنهٔ اصلی مطرح نشود.
- متادیتای مخصوص GitHub، مانند CNAME و .nojekyll، از upload Cloudflare کنار گذاشته می‌شود.
- این مرحله شامل استقرار دیتابیس، اجرای migration یا انتقال فایل‌های خصوصی نیست.

## منابع رسمی

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/
- https://developers.cloudflare.com/workers/static-assets/headers/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/ci-cd/builds/build-image/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/functions/cors
