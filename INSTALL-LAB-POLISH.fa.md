# نصب اصلاحات لابراتور 3.3.1

فونت کد و کنسول ۱۲ پیکسل، متن اصلی توضیحات ۱۶ پیکسل، تایپوگرافی کوچک‌تر، اسکرول باریک و مستقل و بازگشت دکمه‌های اجرا و بررسی پاسخ به بالای کد.

۱. فایل ZIP را در ریشهٔ مخزن، کنار build.py بگذار و این دستورات را اجرا کن:

```bash
python3 -m zipfile -e class-notes-v3.3.1-lab-polish.zip .
python3 build.py
python3 check.py
```

داخل پوشهٔ web استخراج نکن. پوشهٔ web را حذف نکن؛ فقط فایل‌های هم‌نام جایگزین شوند.

۲. پس از موفقیت بررسی‌ها:

```bash
git add check.py web/assets/coding-lab.js web/assets/coding-lab.css web/assets/coding-lab-model.mjs web/assets/coding-lab-layout.mjs web/assets/lab-paper-grain.svg web/lab/machine-learning/vector-distance/index.html
git commit -m "Refine lab typography scrolling and toolbar"
git push origin main
```

اگر نام شاخهٔ شما main نیست، نام شاخهٔ خودتان را جایگزین کن.

۳. بعد از سبز شدن GitHub Actions، صفحه را با Ctrl+Shift+R یا Cmd+Shift+R تازه کن.

تغییری در SQL، Supabase یا E2B لازم نیست. XP، کدهای ذخیره‌شده و منطق بررسی پاسخ تغییر نکرده‌اند.

اعتبارسنجی: ۴۱ آزمون رفتار لابراتور، ساخت سایت و check.py موفق بودند. بررسی تصویری مرورگر در محیط تهیهٔ این نسخه ممکن نبود.
