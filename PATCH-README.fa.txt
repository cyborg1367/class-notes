نصب مستقل Exams — نسخهٔ دوم

۱) محتوای این ZIP را مستقیماً داخل پوشهٔ ریشهٔ class-notes (همان پوشهٔ package.json) Extract کن؛ frontend، web، docs، tests را با فایل‌های موجود Merge و فایل‌های همنام را Replace کن.
۲) در ZIP عمومی هیچ پاسخ صحیحی قرار نگرفته است.
۳) در Supabase فقط فایل خصوصی جداگانهٔ exams-setup-private.sql را از طریق SQL Editor اجرا کن؛ این فایل هرگز به ریشه پروژه یا GitHub نمی‌رود.
۴) نصب وابستگی و ساخت:
   npm.cmd ci
   npm.cmd run check
   npm.cmd run build
۵) راهنمای کامل: docs/EXAMS-INSTALL.fa.md
۶) SQL امتحان را ابتدا منتشر نمی‌کند (published=false)؛ پس از تست خودت با یک Query آن را فعال کن.
۷) هر دانشجو یک تلاش ۶۰ دقیقه‌ای دارد و پس از نهایی‌کردن، کارنامهٔ تشریحی و فرم بازخورد مشاهده می‌کند.
