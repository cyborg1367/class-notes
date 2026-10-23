اصلاح معرفی لابراتور — 3.5.1

این بسته روی نسخهٔ 3.5 نصب می‌شود. معرفی جدید برای همهٔ حساب‌ها، حتی دارای XP یا پیش‌نویس، یک‌بار در هر مرورگر و هر لابراتور نمایش داده می‌شود. دکمهٔ حساب دارای پیشرفت «ادامهٔ مأموریت» است. پس از کلیک، ورود بعدی مستقیم به مأموریت می‌رود. نشانِ معرفی نسخهٔ قبلی مانع نمایش این معرفی نمی‌شود.

کد، مرحله، XP و تنظیمات سرور تغییر نمی‌کنند. SQL و استقرار Edge Function لازم نیست.

ZIP را کنار build.py در ریشهٔ مخزن بگذار:

```bash
python3 -m zipfile -e class-notes-v3.5.1-intro-fix.zip .
python3 build.py
python3 check.py
git add web/assets/coding-lab.js web/assets/coding-lab-experience.mjs web/lab/machine-learning/vector-distance/index.html web/lab/machine-learning/prediction-problem/index.html
git commit -m "Show revised lab introduction once for all students"
git push origin main
```

بعد از سبز شدن Actions، با Ctrl+Shift+R یا Cmd+Shift+R بازخوانی کن. معرفی هر دو لابراتور مستقل است. اگر ذخیرهٔ مرورگر پاک شود، معرفی دوباره دیده می‌شود.

۳۷ آزمون رفتار رابط موفق بود؛ ساخت سایت و check.py نیز موفق بودند. بررسی تصویری مرورگر در این محیط انجام نشده است.
