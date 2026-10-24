from pathlib import Path
import re

root = Path(__file__).resolve().parent
page = root / 'web/about/index.html'
if not page.is_file():
    raise SystemExit('Place this script beside build.py, then run it again.')
source = page.read_text(encoding='utf-8')
content = '''<div class="portfolio-grid instructor-profile"><figure class="portrait instructor-portrait"><img src="../assets/masoud-ahangary.webp" width="640" height="800" alt="مسعود آهنگری" decoding="async"></figure>
 <div class="portfolio-copy"><p>من مسعود آهنگری هستم؛ تحصیل‌کردهٔ دانشگاه صنعتی شریف و فعال در حوزه‌های یادگیری ماشین، یادگیری عمیق و مهندسی ایجنت‌های هوش مصنوعی. تجربهٔ من همچنین شامل اجرای پروژه‌های مهم در حوزهٔ علم شبکه‌ها، حل مسائل بهینه‌سازی و توسعهٔ سامانه‌های داده‌محور است. در این مسیر، به پیوند میان مبانی نظری، صورت‌بندی دقیق مسئله و ساخت راه‌حل‌های عملی توجه دارم.</p>
 <p>در تدریس، تلاش می‌کنم مفاهیم از طریق توضیح روشن، مثال و تجربهٔ عملی قابل فهم شوند. در این کلاس‌ها، از شناخت مسئله و داده‌ها شروع می‌کنیم و قدم‌به‌قدم به پیاده‌سازی و بررسی نتیجه می‌رسیم؛ با این هدف که دانشجو علاوه بر نوشتن کد، منطق راه‌حل، دلیل انتخاب روش و محدودیت‌های آن را هم درک کند.</p>
 <h2 class="instructor-skills-title">حوزه‌های تخصص</h2><div class="expertise" aria-label="حوزه‌های تخصص"><span>یادگیری ماشین</span><span>یادگیری عمیق</span><span>مهندسی ایجنت‌های هوش مصنوعی</span><span>علم شبکه‌ها</span><span>بهینه‌سازی</span><span>جست‌وجوی معنایی و بازیابی اطلاعات</span><span>معماری سامانه‌های داده‌محور</span></div></div></div>
'''
pattern = r'<div class="portfolio-grid(?: instructor-profile)?">.*?(?=</section>)'
if len(re.findall(pattern, source, flags=re.S)) != 1:
    raise SystemExit('Expected one instructor profile block. No files changed.')
source = re.sub(pattern, lambda _: content, source, count=1, flags=re.S)
if 'assets/about-instructor.css' not in source:
    source = source.replace('</head>', '<link rel="stylesheet" href="../assets/about-instructor.css?v=instructor-1"></head>', 1)
page.write_text(source, encoding='utf-8')
print('Instructor introduction updated. Next: build.py, then check.py.')
