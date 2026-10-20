"""Build a portable static classroom website. Python standard library only."""
from pathlib import Path
import json,html,shutil,hashlib,re
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'
data=json.loads((ROOT/'site.json').read_text())
auth_config=json.loads((ROOT/'assets/auth-config.json').read_text())
if auth_config.get('supabaseUrl') or auth_config.get('publishableKey'):
    url=urlsplit(auth_config.get('supabaseUrl',''))
    assert url.scheme=='https' and url.hostname and not (url.username or url.password or url.query or url.fragment) and url.path in ('','/'), 'Use the HTTPS Supabase project URL.'
    assert re.fullmatch(r'sb_publishable_[A-Za-z0-9_-]+',auth_config.get('publishableKey','')), 'Only a publishable key may be included in the public site.'
if DIST.exists():shutil.rmtree(DIST)
DIST.mkdir()
shutil.copytree(ROOT/'assets',DIST/'assets')
(DIST/'.nojekyll').write_text('')
E=html.escape
style_version=hashlib.sha256((ROOT/'assets/reference.css').read_bytes()+(ROOT/'assets/site.css').read_bytes()+(ROOT/'assets/auth.css').read_bytes()).hexdigest()[:12]
script_version=hashlib.sha256((ROOT/'assets/app.js').read_bytes()+(ROOT/'assets/space3d.js').read_bytes()).hexdigest()[:12]
auth_version=hashlib.sha256((ROOT/'assets/auth.js').read_bytes()).hexdigest()[:12]
config_version=hashlib.sha256((ROOT/'assets/auth-config.json').read_bytes()).hexdigest()[:12]
instructor=f'<p class="instructor-credit" lang="en" dir="ltr"><span>Instructor</span><strong>{E(data.get("instructor","Masoud Ahangary"))}</strong></p>'

def document(title,desc,body,prefix,lesson=False,pdfasset=None,extra_scripts=None):
    assets=prefix+'assets/'
    icon=f'<img class="brand-mark" src="{assets}logo.svg" width="36" height="36" alt="" aria-hidden="true">'
    lesson_scripts=''.join(f'<script defer src="{assets}{E(name,quote=True)}?v={hashlib.sha256((ROOT/"assets"/name).read_bytes()).hexdigest()[:12]}"></script>' for name in (extra_scripts or []))
    pdf=f'<a class="header-query-link" href="{assets}{E(pdfasset)}" download>نسخهٔ PDF <span aria-hidden="true">↓</span></a>' if pdfasset else f'<a class="header-query-link" href="{prefix}index.html#classes">همهٔ کلاس‌ها <span aria-hidden="true">←</span></a>'
    course_nav=''.join(f'<a href="{prefix}{E(c["slug"])}/">{E(c["title"])}</a>' for c in data['courses'])
    return f'''<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{E(desc,quote=True)}"><meta name="theme-color" content="#f3f6f1"><title>{E(title)} | دفتر کلاس</title>
<link rel="icon" href="{assets}favicon.svg?v={style_version}"><link rel="preload" href="{assets}fonts/Vazirmatn-Regular.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="{assets}reference.css?v={style_version}"><link rel="stylesheet" href="{assets}site.css?v={style_version}"><link rel="stylesheet" href="{assets}auth.css?v={style_version}">{f'<link rel="stylesheet" href="{assets}katex/katex.min.css"><script defer src="{assets}katex/katex.min.js"></script>' if lesson else ''}<script defer src="{assets}app.js?v={script_version}"></script><script defer src="{assets}space3d.js?v={script_version}"></script>{lesson_scripts}<script defer data-class-auth data-config-version="{config_version}" src="{assets}auth.js?v={auth_version}"></script></head>
<body><a class="skip-link" href="#main">رفتن به محتوای اصلی</a>{'<div id="reading-progress" aria-hidden="true"></div>' if lesson else ''}
<header class="site-header"><div class="shell header-inner"><a class="brand" href="{prefix}index.html" aria-label="دفتر کلاس، صفحهٔ اصلی">{icon}<span>دفتر کلاس</span></a><button type="button" class="menu-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="باز کردن فهرست">فهرست <span aria-hidden="true">☰</span></button><nav class="site-nav" id="main-nav" aria-label="پیمایش اصلی"><a href="{prefix}index.html#classes">کلاس‌ها</a>{course_nav}{'<a href="#exercise">تمرین این درس</a>' if lesson and 'id="exercise"' in body else ''}<a data-account-link href="{prefix}account/">ورود دانشجو</a></nav>{pdf}</div></header>
<main id="main">{body}</main><footer class="site-footer"><div class="shell"><a class="brand" href="{prefix}index.html">{icon}<span>دفتر کلاس</span></a><div class="footer-credit"><p>برای فهمیدن، تمرین کردن و دوباره برگشتن.</p>{instructor}</div><a href="#top">بازگشت به بالا ↑</a></div></footer><div id="toast" role="status" aria-live="polite"></div></body></html>'''

def space_view(prefix,mode='samples'):
    fallback='hero-space.svg' if mode=='samples' else 'diagrams/space.svg'
    label='نمای سه‌بعدیِ قابل چرخش؛ با کلیدهای جهت یا کشیدن بچرخانید. کلید Home نمای اولیه را بازمی‌گرداند.'
    return f'''<div class="space-view" data-space3d="{mode}"><img class="space-fallback" src="{prefix}assets/{fallback}" width="520" height="400" alt="نمای مفهومیِ فضای سه‌بعدی"><svg class="space-canvas" viewBox="0 0 520 400" role="img" tabindex="0" aria-label="{label}" hidden></svg><div class="space-tools"><p>بکشید و بچرخانید <span aria-hidden="true">↔</span></p><div class="space-controls" role="group" aria-label="کنترل زاویهٔ نمای سه‌بعدی"><button type="button" data-orbit="left" aria-label="چرخش به چپ">←</button><button type="button" data-orbit="right" aria-label="چرخش به راست">→</button><button type="button" data-orbit="up" aria-label="چرخش به بالا">↑</button><button type="button" data-orbit="down" aria-label="چرخش به پایین">↓</button><button type="button" data-orbit="reset">نمای اولیه</button></div></div><p class="space-legend">{('نقاط سبز: نمونه‌ها · نقطهٔ مرجانی: پرس‌وجوی q' if mode=='samples' else 'خط پیوسته: فاصلهٔ مستقیم · خط‌چین‌ها: اختلاف روی هر محور')}</p><span class="space-status sr-only" role="status" aria-live="polite"></span></div>'''

def figure(prefix):
    return f'''<figure class="hero-figure"><div class="figure-topline"><span class="figure-label">فضای ویژگی‌ها</span><span class="figure-status"><span class="status-dot" aria-hidden="true"></span>یک پرس‌وجو، چند نمونه</span></div>{space_view(prefix)}<figcaption>نمای مفهومی؛ جایگاه نقاط، نمایش واقعی جدولِ تمرین نیست.</figcaption></figure>'''

cards=[]
total=sum(len(c['lessons']) for c in data['courses'])
for course in data['courses']:
    lessons=course['lessons']; first=lessons[0]
    tags=' '.join(t for l in lessons for t in l['tags'])
    cards.append(f'''<article class="course-card" data-search="{E(course['title']+' '+course['description']+' '+tags,quote=True)}"><div class="course-card-copy"><div class="course-card-meta"><span class="course-type">کلاس</span><span>{len(lessons)} یادداشت منتشرشده</span></div><h3><a href="{course['slug']}/">{E(course['title'])}</a></h3><p>{E(course['description'])}</p><a class="text-link" href="{course['slug']}/">ورود به کلاس <span aria-hidden="true">←</span></a></div><div class="course-latest"><span class="latest-label">از اینجا شروع کنید</span><span class="lesson-number" dir="ltr">{first['number']}</span><a href="{course['slug']}/{first['slug']}/">{E(first['title'])}</a><div class="tag-list">{''.join('<span>'+E(t)+'</span>' for t in first['tags'])}</div></div></article>''')
home=f'''<section class="hero" id="top"><div class="shell hero-grid"><div class="hero-copy"><p class="eyebrow"><span class="eyebrow-rule" aria-hidden="true"></span>یادداشت‌های کلاس</p><h1>یک جا برای<br><em>یاد گرفتن.</em></h1><p class="hero-lede">درس‌ها را با حوصله بخوانید، کدها را امتحان کنید و با تمرین جلو بروید. اینجا نقطهٔ شروعِ جزوه‌ها و مطالب کلاس است.</p><div class="hero-actions"><a class="button-primary" href="#classes">کلاس‌ها را ببینید <span aria-hidden="true">←</span></a><p class="hero-meta"><span>{len(data['courses'])} کلاس</span><span>{total} جزوه</span><span>فارسی و همراه با کد</span></p></div></div>{figure('')}</div><div class="shell"><ul class="hero-strip"><li><span class="strip-number">01</span><span class="strip-text">بخوانید؛ از یک سؤال روشن شروع کنید.</span></li><li><span class="strip-number">02</span><span class="strip-text">اجرا کنید؛ هر خط کد را بفهمید.</span></li><li><span class="strip-number">03</span><span class="strip-text">تمرین کنید؛ پاسخ را خودتان بسازید.</span></li></ul></div></section>
<section class="shell catalog-section" id="classes" aria-labelledby="classes-title"><div class="catalog-head"><div><p class="section-kicker"><span>کلاس‌ها</span>مسیر یادگیری شما</p><h2 id="classes-title">کلاس را انتخاب کنید.</h2></div><div class="catalog-search"><label for="course-search">جست‌وجو در کلاس‌ها و موضوع‌ها</label><div><input type="search" id="course-search" placeholder="مثلاً NumPy یا بردار…" autocomplete="off"><button type="button" id="clear-search" aria-label="پاک کردن جست‌وجو" hidden>×</button></div></div></div><div class="course-grid">{''.join(cards)}</div><p id="search-empty" class="empty-state" hidden>نتیجه‌ای پیدا نشد. عبارت دیگری بنویسید.</p><p id="search-status" class="sr-only" aria-live="polite"></p></section>'''
home=home.replace('<div class="hero-actions">',instructor+'<div class="hero-actions">',1)
(DIST/'index.html').write_text(document('کلاس‌ها',data['description'],home,''))

for course in data['courses']:
    course_dir=DIST/course['slug'];course_dir.mkdir()
    lesson_cards=[]
    for lesson_index,lesson in enumerate(course['lessons']):
        lesson_cards.append(f'''<article class="lesson-list-card"><span class="lesson-number" dir="ltr">{lesson['number']}</span><div><p class="table-kicker">جزوهٔ آموزشی</p><h3><a href="{lesson['slug']}/">{E(lesson['title'])}</a></h3><p>{E(lesson['description'])}</p><div class="tag-list">{''.join('<span>'+E(t)+'</span>' for t in lesson['tags'])}</div></div><a class="text-link" href="{lesson['slug']}/">مطالعهٔ جزوه <span aria-hidden="true">←</span></a></article>''')
        prefix='../../';assets=prefix+'assets/'
        rail=''.join(f'<li><a href="#{s["id"]}" data-rail="{s["id"]}"><span class="rail-num">{i:02}</span><span>{E(s["label"])}</span></a></li>' for i,s in enumerate(lesson['sections'],1))
        mobile=''.join(f'<a href="#{s["id"]}">{E(s["label"])}</a>' for s in lesson['sections'])
        inner=(ROOT/lesson['source']).read_text().replace('{{ASSETS}}',assets)
        # Add editable web-only exercise cells; keep the PDF/source lesson unchanged.
        if lesson['slug']=='prediction-problem':
            for k in [1,3,5]:
                cells=''.join(f'<td><textarea rows="2" maxlength="10000" data-answer="k{k}-{key}" aria-label="{label} برای k برابر {k}" placeholder="پاسخ شما…"></textarea></td>' for key,label in [('neighbors','همسایه‌ها'),('votes','رأی‌های دو کلاس'),('prediction','پیش‌بینی')])
                inner=inner.replace(f'<tr><td>{k}</td><td>…</td><td>…</td><td>…</td></tr>',f'<tr><td>{k}</td>{cells}</tr>')
            inner=inner.replace('<table class="exercise-results">','<div class="table-scroll"><table class="exercise-results">')
            inner=inner.replace('</tbody></table><p class="">جدول را', '</tbody></table></div><p id="answer-note" class="answer-note">یادداشت‌های این جدول فقط در همین مرورگر ذخیره می‌شوند.</p><p class="">جدول را')
        if 'data-answer=' in inner:
            lesson_id=course['slug']+'/'+lesson['slug']
            cloud=f'''<div class="cloud-tools" data-cloud-tools data-lesson-id="{E(lesson_id)}"><p data-cloud-description>برای نگه‌داشتن پاسخ‌ها در حساب شخصی، وارد شو.</p><a data-cloud-login href="{prefix}account/">ورود برای ذخیرهٔ پاسخ‌ها ←</a><div class="cloud-buttons" data-cloud-buttons hidden><button type="button" data-cloud-save>ذخیره / به‌روزرسانی پاسخ‌ها</button><button type="button" data-cloud-load>دریافت نسخهٔ حساب</button><button type="button" data-draft-import hidden>آوردن پیش‌نویسِ بدون ورود</button></div><p class="cloud-status" data-cloud-status role="status" aria-live="polite"></p></div>'''
            inner=re.sub(r'(<p[^>]*id="answer-note"[^>]*>.*?</p>)',lambda m:m.group(1)+cloud,inner,count=1,flags=re.S)
        old_space=f'<figure class="teaching-figure space"><img src="{assets}diagrams/space.svg" alt="نمایش هندسی و شکلیِ مفهوم توضیح‌داده‌شده در متن" loading="lazy"></figure>'
        inner=inner.replace(old_space,f'<figure class="teaching-figure space interactive-distance">{space_view(prefix,"distance")}<figcaption>دو نقطه در فضای سه‌بعدی؛ با چرخش، مختصات و فاصله تغییر نمی‌کنند.</figcaption></figure>')
        intro=lesson['hero_intro'].replace('class=""','class="hero-lede"',1)+instructor
        hero_title=lesson.get('hero_title',E(lesson['title']))
        start_id=lesson['sections'][0]['id']
        hero_meta=''.join('<span>'+E(t)+'</span>' for t in lesson.get('hero_meta',lesson['tags']))
        takeaway_items=''.join(f'<li><span class="strip-number">{i:02}</span><span class="strip-text">{E(t)}</span></li>' for i,t in enumerate(lesson.get('takeaways',[]),1))
        takeaway_strip=f'<div class="shell"><ul class="hero-strip">{takeaway_items}</ul></div>' if takeaway_items else ''
        teaching_fact=f'<div class="rail-fact"><p>دادهٔ مرجع کلاس</p><strong dir="ltr">{E(lesson["teaching_shape"])}</strong><span>{E(lesson.get("teaching_shape_note",""))}</span></div>' if lesson.get('teaching_shape') else ''
        download=f'<a class="rail-download" href="{assets}{E(lesson["pdf"])}" download>دریافت جزوهٔ PDF ↓</a>' if lesson.get('pdf') else ''
        hero_figure=figure(prefix) if lesson.get('hero_figure') else ''
        hero_grid='hero-grid' if hero_figure else 'hero-grid hero-grid--single'
        adjacent=[]
        if lesson_index:
            prev=course['lessons'][lesson_index-1]
            adjacent.append(f'<a href="../{E(prev["slug"])}/" rel="prev">یادداشت قبلی: {E(prev["title"])}</a>')
        if lesson_index+1<len(course['lessons']):
            following=course['lessons'][lesson_index+1]
            adjacent.append(f'<a href="../{E(following["slug"])}/" rel="next">یادداشت بعدی: {E(following["title"])}</a>')
        lesson_navigation='<nav class="adjacent-lessons" aria-label="یادداشت‌های پیوسته">'+''.join(adjacent)+'</nav>' if adjacent else ''
        body=f'''<section class="hero lesson-hero" id="top"><div class="shell {hero_grid}"><div class="hero-copy"><a class="breadcrumb" href="../">{E(course['title'])} <span aria-hidden="true">/</span> یادداشت {lesson['number']}</a><p class="eyebrow"><span class="eyebrow-rule" aria-hidden="true"></span>{E(lesson['subtitle'])}</p><h1>{hero_title}</h1>{intro}<div class="hero-actions"><a class="button-primary" href="#{start_id}">شروع مطالعه <span aria-hidden="true">←</span></a><p class="hero-meta">{hero_meta}</p></div></div>{hero_figure}</div>{takeaway_strip}</section>
<div class="shell lesson-shell"><aside class="lesson-rail" aria-label="فهرست درس"><p class="rail-title">مسیر این درس</p><ol class="rail-list">{rail}</ol>{teaching_fact}<div class="reading-state"><span id="reading-label">۰٪ مطالعه شده</span><div aria-hidden="true"><i id="sidebar-progress"></i></div></div>{download}</aside><div class="lesson-body"><nav class="mobile-toc" aria-label="فهرست بخش‌های درس">{mobile}</nav>{inner}<footer class="lesson-footer"><p>این یادداشت بخشی از کلاس {E(course['title'])} است.</p><a href="../">بازگشت به فهرست کلاس ←</a></footer></div></div>'''
        folder=course_dir/lesson['slug'];folder.mkdir()
        body=body.replace('<footer class="lesson-footer">',lesson_navigation+'<footer class="lesson-footer">')
        (folder/'index.html').write_text(document(lesson['title'],lesson['description'],body,prefix,lesson=True,pdfasset=lesson.get('pdf'),extra_scripts=lesson.get('scripts')))
    course_hero_title=course.get('hero_title',E(course['title']))
    course_hero_figure=figure('../') if course.get('hero_figure') else ''
    course_grid='hero-grid' if course_hero_figure else 'hero-grid hero-grid--single'
    body=f'''<section class="hero course-hero" id="top"><div class="shell {course_grid}"><div class="hero-copy"><a class="breadcrumb" href="../index.html#classes">همهٔ کلاس‌ها ←</a><p class="eyebrow"><span class="eyebrow-rule"></span>جزوه‌ها و تمرین‌های کلاس</p><h1>{course_hero_title}</h1><p class="hero-lede">{E(course['description'])}</p><div class="hero-actions"><a class="button-primary" href="{course['lessons'][0]['slug']}/">اولین یادداشت را بخوانید <span aria-hidden="true">←</span></a><p class="hero-meta"><span>{len(course['lessons'])} یادداشت منتشرشده</span><span>جزوه‌ها و تمرین‌های کلاس</span></p></div></div>{course_hero_figure}</div></section><section class="shell catalog-section course-lessons" aria-labelledby="lessons-title"><div class="catalog-head"><div><p class="section-kicker"><span>مسیر کلاس</span>یک گام در هر یادداشت</p><h2 id="lessons-title">یادداشت‌های کلاس</h2></div></div><div class="lesson-list">{''.join(lesson_cards)}</div></section>'''
    body=body.replace('<div class="hero-actions">',instructor+'<div class="hero-actions">',1)
    (course_dir/'index.html').write_text(document(course['title'],course['description'],body,'../'))

account_dir=DIST/'account';account_dir.mkdir()
account_body=(ROOT/'content/account.html').read_text()
(account_dir/'index.html').write_text(document('حساب دانشجو','ورود با Google و ذخیرهٔ پاسخ تمرین‌ها در حساب شخصی',account_body,'../'))

print('Built classroom hub, course page, and all published lessons in dist/.')
