"""Author lesson 02 from one source; export the classroom HTML and typeset PDF."""
from pathlib import Path
import os,re,json,html,subprocess,io,tokenize,keyword,shutil
import fitz
from weasyprint import HTML

ROOT=Path(__file__).resolve().parents[1]
WORK=Path(os.environ.get('NOTES_AUTHORING_WORKSPACE',ROOT))
TMP=WORK/'tmp/lesson2'; TMP.mkdir(parents=True,exist_ok=True)
ASSET=ROOT/'assets/prediction'; ASSET.mkdir(exist_ok=True)
OUT=WORK/'output/pdf'; OUT.mkdir(parents=True,exist_ok=True)
TITLE='از مشورت گرفتن تا طبقه‌بندی باینری'
equations=[]
def p(s,cls=''):return f'<p class="{cls}">{s}</p>'
def note(s):return p(s,'note note--teal')
def math(tex,width=380):
    i=len(equations);equations.append(tex)
    return f'<div class="formula-card lesson-formula" data-equation="{i}" data-width="{width}" data-tex="{html.escape(tex,quote=True)}"></div>'
def code(s):
    s=s.strip();lines=s.splitlines(keepends=True);offsets=[0]
    for line in lines:offsets.append(offsets[-1]+len(line))
    out=[];last=0
    for t in tokenize.generate_tokens(io.StringIO(s).readline):
        if t.type in (tokenize.NEWLINE,tokenize.NL,tokenize.ENDMARKER,tokenize.INDENT,tokenize.DEDENT):continue
        a=offsets[t.start[0]-1]+t.start[1];b=offsets[t.end[0]-1]+t.end[1]
        cls=''
        if t.type==tokenize.COMMENT:cls='comment'
        elif t.type==tokenize.STRING:cls='string'
        elif t.type==tokenize.NUMBER:cls='number'
        elif t.type==tokenize.NAME:
            if keyword.iskeyword(t.string):cls='keyword'
            elif t.string in {'np','array','copy','float'}:cls='function'
        out.append(html.escape(s[last:a]));v=html.escape(s[a:b]);out.append(f'<span class="{cls}">{v}</span>' if cls else v);last=b
    out.append(html.escape(s[last:]))
    return '<div class="code-block"><div class="code-head"><span dir="ltr">Python / NumPy</span><button type="button" class="copy-code" aria-label="کپی کد پایتون">کپی کد</button></div><pre tabindex="0" dir="ltr">'+''.join(out)+'</pre></div>'
def fig(name,caption):return f'<figure class="teaching-figure prediction-figure"><img src="{{{{ASSETS}}}}prediction/{name}" alt="{caption}"><figcaption>{caption}</figcaption></figure>'

DATA={
 'names':['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10'],
 'X':[[2,2],[3,3],[2,4],[4,2],[5,5],[6,4],[6,6],[7,5],[8,7],[7,8]],
 'y':[0,0,0,0,1,0,1,1,1,1],
 'query':[5.7,4.6]
}
(ASSET/'medical-data.json').write_text(json.dumps(DATA,indent=2)+'\n')
import math as pymath
def classify(query,k):
    order=sorted(range(len(DATA['X'])),key=lambda i:(sum((a-b)**2 for a,b in zip(DATA['X'][i],query)),i))
    chosen=order[:k];ones=sum(DATA['y'][i] for i in chosen)
    return chosen,1 if ones>k//2 else 0
def plot(name,k=None,query=None):
    # The horizontal and vertical unit lengths are identical (40 SVG units).
    chosen,pred=classify(query,k) if query is not None else ([],None)
    x0,y0,unit=76,444,40
    xy=lambda p:(x0+p[0]*unit,y0-p[1]*unit)
    s=['<svg xmlns="http://www.w3.org/2000/svg" width="680" height="520" viewBox="0 0 680 520" role="img" aria-labelledby="plot-title"><title id="plot-title">Synthetic medical records in a two-feature plane</title><rect x=".5" y=".5" width="679" height="519" rx="14" fill="#fbfdfa" stroke="#cdd8d2"/>']
    s.append('<defs><clipPath id="plot-clip"><rect x="76" y="44" width="400" height="400"/></clipPath></defs>')
    for t in range(0,11,2):
        x,y=xy([t,t]);s.append(f'<path d="M{x} 44V444M76 {y}H476" stroke="#e0e9e1" stroke-width="1"/>')
        s.append(f'<g font-family="DejaVu Sans" font-size="16" fill="#617868"><text x="{x}" y="465" text-anchor="middle">{t}</text><text x="62" y="{y+4}" text-anchor="end">{t}</text></g>')
    s.append('<path d="M76 36V444H485" fill="none" stroke="#799481" stroke-width="1.6"/><g font-family="DejaVu Sans" font-size="15" fill="#244b39"><text x="276" y="497" text-anchor="middle">M1</text><text x="24" y="244" text-anchor="middle" transform="rotate(-90 24 244)">M2</text></g>')
    if query is not None:
        qx,qy=xy(query)
        r=pymath.dist(DATA['X'][chosen[-1]],query)*unit
        s.append(f'<g clip-path="url(#plot-clip)"><circle cx="{qx}" cy="{qy}" r="{r}" fill="#e8e6d9" fill-opacity=".35" stroke="#9b8754" stroke-width="1.5" stroke-dasharray="5 5"/>')
        for idx in chosen:
            x,y=xy(DATA['X'][idx]);s.append(f'<path d="M{qx} {qy}L{x} {y}" stroke="#8a9e8e" stroke-width="1.4"/>')
        s.append('</g>')
    for i,p in enumerate(DATA['X']):
        x,y=xy(p);color='#0f766e' if DATA['y'][i]==0 else '#bd603e'
        if i in chosen:s.append(f'<circle cx="{x}" cy="{y}" r="11" fill="none" stroke="#9b8754" stroke-width="2"/>')
        if DATA['y'][i]==0:s.append(f'<circle cx="{x}" cy="{y}" r="6" fill="{color}" stroke="white" stroke-width="1.5"/>')
        else:s.append(f'<rect x="{x-6}" y="{y-6}" width="12" height="12" rx="1" fill="{color}" stroke="white" stroke-width="1.5"/>')
        dx,dy=(-29,-12) if i==4 else (12,19) if i==5 else (12,-10)
        s.append(f'<text x="{x+dx}" y="{y+dy}" fill="#355441" font-size="16" font-family="DejaVu Sans">{DATA["names"][i]}</text>')
    if query is not None:
        qx,qy=xy(query)
        s.append(f'<path d="M{qx} {qy-8}l8 8-8 8-8-8z" fill="#203c4b" stroke="white" stroke-width="1.5"/><text x="{qx-23}" y="{qy+4}" font-family="DejaVu Sans" font-size="19" font-weight="bold" fill="#203c4b">q</text>')
    s.append('<g font-family="DejaVu Sans" font-size="16" fill="#365541"><text x="510" y="69" font-size="11" fill="#7b8c77">SYNTHETIC DATA</text><circle cx="519" cy="110" r="6" fill="#0f766e"/><text x="534" y="114">Class 0</text><rect x="513" y="138" width="12" height="12" fill="#bd603e"/><text x="534" y="149">Class 1</text>')
    if k is not None:
        s.extend([f'<text x="510" y="205" font-size="22">k = {k}</text>',f'<text x="510" y="239">Votes 0: {sum(DATA["y"][i]==0 for i in chosen)}</text>',f'<text x="510" y="265">Votes 1: {sum(DATA["y"][i]==1 for i in chosen)}</text>',f'<text x="510" y="314">Prediction: {pred}</text>'])
    else:s.extend(['<text x="510" y="218">10 records</text>','<text x="510" y="245">2 features</text>','<text x="510" y="272">2 classes</text>'])
    s.append('</g></svg>');(ASSET/name).write_text(''.join(s))
plot('medical-space.svg');plot('medical-k1.svg',1,DATA['query']);plot('medical-k3.svg',3,DATA['query'])
from knn_diagram import comparison_plot
for selected_k in (1,3):
    (ASSET/f'medical-k{selected_k}-detail.svg').write_text(comparison_plot(DATA,DATA['query'],selected_k))
shutil.copyfile(ASSET/'medical-space.svg',ASSET/'input-target.svg')

dataset_table='<div class="table-scroll"><table class="dataset-table medical-table"><thead><tr><th>پرونده</th><th>M1 / تنفسی</th><th>M2 / خستگی</th><th>برچسبِ ثبت‌شده</th></tr></thead><tbody>'+''.join(f'<tr><td>{name}</td><td>{x[0]}</td><td>{x[1]}</td><td class="class-{label}">{"○ ۰ — منفی" if label==0 else "■ ۱ — مثبت"}</td></tr>' for name,x,label in zip(DATA['names'],DATA['X'],DATA['y']))+'</tbody></table></div>'

def neighbor_table(k):
    inds,_=classify(DATA['query'],k)
    return '<div class="table-scroll"><table class="dataset-table neighbor-readout"><thead><tr><th>ترتیبِ نزدیکی</th><th>پرونده</th><th>فاصلهٔ تقریبی تا q</th><th>برچسب</th></tr></thead><tbody>'+''.join(f'<tr><td>{rank}</td><td>{DATA["names"][i]}</td><td>{pymath.dist(DATA["X"][i],DATA["query"]):.3f}</td><td>{DATA["y"][i]}</td></tr>' for rank,i in enumerate(inds,1))+'</tbody></table></div>'

parts=[]
parts.append(('consult','برای یک تصمیم تازه، سراغ چه کسی می‌رویم؟',
p('فرض کنید می‌خواهید در یک دورهٔ آموزشی شرکت کنید و هنوز مطمئن نیستید انتخابِ مناسبی است. از کسی که قبلاً آن دوره را گذرانده می‌پرسید: «برای من هم مناسب است؟» پاسخِ او وقتی برایتان مفیدتر می‌شود که شرایطش به شما شبیه باشد؛ مثلاً پیش‌زمینه و هدفِ یادگیریِ نزدیک‌تری داشته باشد.')+
p('حالا به‌جای یک نفر، از سه نفر با شرایطِ مشابه مشورت می‌گیرید. دو نفر تجربهٔ مثبتی داشته‌اند و یک نفر نظرِ منفی دارد. اگر قرار باشد هر نفر یک رأی داشته باشد، جمع‌بندیِ این سه تجربه، نظرِ مثبت خواهد بود. با این حال، رأیِ بیشتر، درست بودنِ تصمیم را تضمین نمی‌کند؛ کیفیتِ تجربه‌ها و میزانِ شباهتِ شرایط هم اهمیت دارد.')+
'''<div class="consult-votes"><div><span>تجربهٔ مشابه ۱</span><strong class="vote-yes">موافق</strong></div><div><span>تجربهٔ مشابه ۲</span><strong class="vote-no">مخالف</strong></div><div><span>تجربهٔ مشابه ۳</span><strong class="vote-yes">موافق</strong></div></div>'''+
p('برای تبدیلِ این تمثیل به الگوریتم، باید روشن کنیم چه چیزی جایِ هر بخش را می‌گیرد. شرایطِ افراد، همان ویژگی‌هاست؛ نزدیک بودنِ شرایط را با فاصله می‌سنجیم؛ تجربهٔ قبلیِ هر فرد، یک پاسخِ ثبت‌شده دارد؛ و جمع‌بندیِ چند تجربه، رأی‌گیری می‌شود. در مثالِ پزشکیِ ما، پرونده‌ها نظر نمی‌دهند؛ نتیجهٔ بررسیِ قبلیِ هر پرونده، رأیِ آن را مشخص می‌کند.')+
'''<table class="analogy-map"><thead><tr><th>در تمثیلِ مشورت</th><th>در مدل</th></tr></thead><tbody><tr><td>شرایطِ فرد</td><td>ویژگی‌های ورودی</td></tr><tr><td>شباهتِ شرایط</td><td>فاصله در فضای ویژگی</td></tr><tr><td>نتیجهٔ تجربهٔ قبلی</td><td>برچسبِ ثبت‌شده</td></tr><tr><td>جمع‌بندیِ چند تجربه</td><td>رأیِ اکثریتِ همسایه‌ها</td></tr></tbody></table>'''+
p('در جلسهٔ قبل، بخشِ «پیدا کردنِ نمونه‌های مشابه» را ساخته‌ایم: بردارهای ویژگی را می‌خوانیم، فاصله‌ها را حساب می‌کنیم و نزدیک‌ترین‌ها را برمی‌گزینیم. این بار می‌خواهیم یک قدم جلوتر برویم و از همسایه‌های انتخاب‌شده، برای تعیینِ یک کلاس استفاده کنیم.')+
note('در تمثیلِ ما، تعدادِ افرادی که از آن‌ها مشورت می‌گیریم، نقشِ k را دارد. در الگوریتم، هر رأی از برچسبِ ثبت‌شدهٔ یک نمونهٔ نزدیک می‌آید.')))

parts.append(('patients','پرونده‌های قبلی، همراهِ پاسخ‌اند',
p('یک درمانگاهِ کاملاً فرضی را تصور کنید. برای هر مراجعه‌کننده، دو امتیازِ آموزشی ثبت کرده‌ایم: M1 امتیازِ نشانه‌های تنفسی و M2 امتیازِ خستگی است. هر امتیاز بین صفر و ده قرار دارد. نتیجهٔ یک بررسیِ مرجعِ فرضی نیز از قبل ثبت شده و وجود یا نبودِ وضعیتِ S را مشخص می‌کند: صفر برای «منفی» و یک برای «مثبت».')+
dataset_table+
p('این امتیازدهی، پرونده‌ها و وضعیتِ S برای آموزش ابداع شده‌اند و ابزارِ بالینی نیستند. برچسبِ منفی یا مثبت، فقط پاسخِ همان بررسیِ فرضی است. برای اینکه اثرِ فاصله را ساده ببینیم، در این مثال یک واحد تغییرِ هر امتیاز را هم‌وزن می‌گیریم؛ مشترک بودنِ بازهٔ صفر تا ده، به‌خودیِ‌خود اهمیتِ واقعیِ دو ویژگی را برابر نمی‌کند.')+
p('اکنون مراجعه‌کنندهٔ تازه‌ای داریم که دو شاخصش معلوم است، اما نتیجهٔ بررسیِ مرجعِ او را در اختیار نداریم. هدفِ ما پیش‌بینیِ یکی از دو برچسب، با کمکِ پرونده‌های قبلی است. دو شاخص، <b>ویژگی‌های ورودی</b> هستند و نتیجهٔ ثبت‌شدهٔ بررسی، <b>متغیرِ هدف یا برچسب</b> است.')+
note('این یک مسئلهٔ یادگیری نظارت‌شده است: برای نمونه‌های گذشته، هم ورودی و هم پاسخِ معلوم داریم و می‌خواهیم برای ورودیِ تازه پیش‌بینی بسازیم.')))

parts.append(('binary','دو ویژگی روی صفحه، دو کلاس برای پاسخ',
fig('medical-space.svg','محور افقی: امتیازِ تنفسی M1؛ محور عمودی: امتیازِ خستگی M2. دایره‌ها کلاس ۰ و مربع‌ها کلاس ۱ هستند.')+
p('هر پرونده با دو عدد مشخص می‌شود، پس می‌توانیم آن را روی یک صفحه قرار دهیم. برای مثال، P5 با مختصاتِ ۵ و ۵ و P6 با مختصاتِ ۶ و ۴ رسم شده‌اند. شکل و رنگِ علامت، پاسخِ ثبت‌شدهٔ هر پرونده را نشان می‌دهند؛ مختصاتِ نقطه از دو ویژگی می‌آید.')+
math(r'y\in\{0,1\}',195)+
p('این مسئله <b>طبقه‌بندیِ باینری یا دودویی</b> است، چون مجموعهٔ پاسخ‌های ممکن دقیقاً دو کلاس دارد. «باینری بودن» به تعدادِ کلاس‌ها مربوط است. «دوبعدی بودنِ فضای ویژگی» به تعدادِ ویژگی‌های ورودی مربوط است. در این مثال هر دو تعداد برابرِ دو شده‌اند، اما دو مفهومِ متفاوت را می‌شمارند: اگر ویژگیِ سومی اضافه کنیم، فضا سه‌بعدی می‌شود و مسئله با همین دو برچسب همچنان باینری باقی می‌ماند.')+
p('صفر و یک در اینجا کدِ دو دسته‌اند، نه اندازهٔ یک کمیت. برچسبِ ۱ به معنی یک واحد بیشتر بودنِ وضعیتِ S نیست و عددِ ۰٫۵ هم نامِ یک کلاس در قراردادِ ما نیست. خروجیِ طبقه‌بندی، انتخابِ یکی از دو کلاس است. در مقابل، اگر هدفِ مسئله تخمینِ یک مقدارِ عددی، مانند مقدارِ شاخصِ دیگری، بود، دربارهٔ رگرسیون صحبت می‌کردیم.')+
note('هنگامِ محاسبهٔ فاصله، فقط دو مختصاتِ M1 و M2 را به کار می‌بریم. برچسبِ صفر یا یک، محورِ سومِ این نمودار و یکی از ورودی‌های فاصله نیست.')))

parts.append(('one-neighbor','ابتدا از نزدیک‌ترین تجربه کمک بگیریم',
p('دو امتیازِ مراجعه‌کنندهٔ تازه را با بردارِ پرس‌وجوی q نشان می‌دهیم. در شکل، این نمونه یک لوزیِ تیره است؛ هنوز برچسبِ واقعیِ آن را نمی‌دانیم. پیش از خواندنِ نتیجه، نزدیک‌ترین نقطه را در نمای بزرگ‌شده پیدا کنید و برچسبِ آن را بخوانید.')+
math(r'\mathbf{q}=(5.7,\,4.6)',245)+
fig('medical-k1-detail.svg','چپ: تمامِ پرونده‌ها؛ راست: بزرگ‌نماییِ محدودهٔ پرس‌وجو. در هر نما مقیاسِ دو محور برابر است؛ خط‌چین تا مرکزِ همسایهٔ انتخاب‌شده می‌رسد.')+
p('نزدیک‌ترین پرونده به q، نمونهٔ P6 است. برچسبِ ثبت‌شدهٔ آن صفر است. اگر فقط از همین یک تجربه کمک بگیریم، پیش‌بینیِ ما برای q نیز کلاسِ صفر خواهد بود. این همان ایدهٔ یک همسایهٔ نزدیک است: پاسخِ نزدیک‌ترین نمونه را به‌عنوانِ حدسِ خود پیشنهاد می‌کنیم.')+
p('در اینجا k برابرِ یک است؛ یعنی تعدادِ همسایه‌هایی که حقِ رأی دارند، یک مورد است. q را به جدولِ پرونده‌های قبلی اضافه نکرده‌ایم و برچسبِ فرضی به آن نداده‌ایم. فاصلهٔ نمونهٔ تازه را با نمونه‌هایی سنجیده‌ایم که پاسخِ آن‌ها از قبل معلوم بوده است.')+
note('نزدیک‌ترین نقطه، یک شاهدِ محلی است. اینکه این شاهد برای پیش‌بینی کافی باشد، موضوعی است که باید با دادهٔ دارای پاسخ بررسی کنیم.')))

parts.append(('three-neighbors','اگر سه تجربه را کنار هم بگذاریم چه می‌شود؟',
p('مقدارِ k را از یک به سه تغییر دهید و q را ثابت نگه دارید. پیش از خواندنِ جدول، در نمای بزرگ‌شده سه همسایهٔ مشخص‌شده را ببینید و رأی‌های دو کلاس را بشمارید. تعدادِ همسایه‌ها عوض شده است؛ تعدادِ کلاس‌ها همان دو مورد است.')+
fig('medical-k3-detail.svg','همان پرونده‌ها و همان q، با سه همسایه. نمای بزرگ‌شده، فاصلهٔ P7 از مرزِ انتخاب را خواناتر می‌کند؛ برای انتخاب، فاصلهٔ مرکزِ نقاط ملاک است.')+
neighbor_table(3)+
p('اکنون به سه نزدیک‌ترین پرونده نگاه می‌کنیم. P6 به کلاسِ صفر تعلق دارد، اما P5 و P8 برچسبِ یک دارند. با یک رأیِ برابر برای هر همسایه، کلاسِ صفر یک رأی و کلاسِ یک دو رأی می‌گیرد. بنابراین پیش‌بینیِ سه‌همسایه‌ای، کلاسِ یک است؛ پاسخ با حالتِ تک‌همسایه‌ای فرق کرده است.')+
p('این روش، <b>k نزدیک‌ترین همسایه یا kNN</b> نام دارد. برای یک ورودیِ تازه، فاصله تا نمونه‌های قبلی را محاسبه می‌کنیم، k نمونهٔ نزدیک‌تر را برمی‌گزینیم و در طبقه‌بندیِ ساده، کلاسی را پیش‌بینی می‌کنیم که رأیِ بیشتری دارد. در این جزوه وزنِ رأیِ همسایه‌ها برابر است؛ نزدیک‌تر بودن، ترتیبِ انتخاب را تعیین می‌کند.')+
p('k تعدادِ کلاس‌ها نیست؛ تعدادِ همسایه‌های انتخاب‌شده است. در هر دو حالتِ k=1 و k=3، مسئله همچنان دو کلاس دارد. استفاده از چند همسایه می‌تواند اثرِ یک نمونه را کمتر کند، اما بزرگ‌تر کردنِ k تضمینِ بهتر شدنِ نتیجه نیست. هنوز نمی‌دانیم برچسبِ واقعیِ q چیست و از روی این دو حدس نمی‌توانیم یکی را درست اعلام کنیم.')))

parts.append(('arrays','از شکل به آرایه‌های NumPy برسیم',
p('اکنون همان پرونده‌ها را واردِ NumPy می‌کنیم. شناسه‌ها را برای گزارش نگه می‌داریم، دو ویژگی را در X قرار می‌دهیم و برچسب‌ها را در y می‌گذاریم. ترتیبِ دو ویژگی در همهٔ سطرها و در پرس‌وجو ثابت است: ابتدا M1 و سپس M2.')+
p('در نسخهٔ سادهٔ kNN، مرحلهٔ آموزش شاملِ نگه‌داشتنِ نمونه‌های دارای پاسخ است. هنگامِ پیش‌بینی، ورودیِ تازه با همین نمونه‌ها مقایسه می‌شود. پس مدلِ ما علاوه بر k و معیارِ فاصله، به X و y ثبت‌شده نیاز دارد. این روش برای ساختنِ پیش‌بینی، خط یا معادله‌ای با ضرایبِ آموخته‌شده پیدا نمی‌کند.')+
code('''import numpy as np

names = np.array([
    "P1", "P2", "P3", "P4", "P5",
    "P6", "P7", "P8", "P9", "P10"
])

X = np.array([
    [2, 2], [3, 3], [2, 4], [4, 2], [5, 5],
    [6, 4], [6, 6], [7, 5], [8, 7], [7, 8],
], dtype=float)

y = np.array([0, 0, 0, 0, 1, 0, 1, 1, 1, 1])
query = np.array([5.7, 4.6], dtype=float)

X.shape      # (10, 2)
y.shape      # (10,)
query.shape  # (2,)''')+
p('برای نمونهٔ P6، سطرِ <code>X[5]</code> دو ویژگیِ ۶ و ۴ را نگه می‌دارد و <code>y[5]</code> برچسبِ صفرِ همان نمونه است. هماهنگیِ اندیس‌ها، اتصالِ «شرایطِ تجربه» به «پاسخِ تجربه» را حفظ می‌کند. اگر فقط یکی از دو آرایه را جابه‌جا کنیم، این اتصال خراب می‌شود.')+
p('X ده نمونه با دو ویژگی دارد؛ y ده پاسخِ متناظر را نگه می‌دارد. پرس‌وجو فقط دو ویژگی دارد. به آن مؤلفهٔ سومی برای برچسب اضافه نمی‌کنیم، زیرا همان برچسب را می‌خواهیم پیش‌بینی کنیم. همچنین نامِ P6 یا P10 واردِ محاسبهٔ فاصله نمی‌شود.')+
note('شکلِ X تعدادِ سطرها و ویژگی‌ها را توصیف می‌کند. وجودِ فقط دو مقدارِ متفاوت در y، باینری بودنِ مسئله را مشخص می‌کند.')))

parts.append(('numpy','همسایه‌ها را پیدا کنیم، سپس رأی‌ها را بشماریم',
p('پیش از اجرای کد، شکلِ خروجیِ <code>X - query</code> و تعدادِ فاصله‌های نهایی را پیش‌بینی کنید. فاصلهٔ دو‌بعدی همان رابطهٔ جلسهٔ قبل است؛ این بار هر سطر دو مؤلفه دارد:')+
math(r'd(\mathbf{x},\mathbf{q})=\sqrt{(x_1-q_1)^2+(x_2-q_2)^2}',405)+
code('''differences = X - query
squared = differences ** 2
sum_squared = np.sum(squared, axis=1)
distances = np.sqrt(sum_squared)  # shape: (10,)''')+
p('در مرحلهٔ بعد، از اندیسِ فاصله‌های مرتب‌شده استفاده می‌کنیم تا هم شناسهٔ پرونده‌ها و هم برچسبِ آن‌ها با همان ترتیب انتخاب شوند:')+
code('''k = 3
order = np.argsort(distances, kind="stable")
neighbors = order[:k]

names[neighbors]  # ['P6', 'P5', 'P8']
neighbor_labels = y[neighbors]  # [0, 1, 1]''')+
p('اکنون مسئلهٔ رأی‌گیری، فقط شمارشِ دو برچسب است. مقایسهٔ بولی برای هر همسایه مشخص می‌کند آیا به یک کلاس تعلق دارد؛ جمعِ آن، تعدادِ رأی‌های همان کلاس را می‌دهد:')+
code('''votes_0 = np.sum(neighbor_labels == 0)  # 1
votes_1 = np.sum(neighbor_labels == 1)  # 2

if votes_1 > votes_0:
    prediction = 1
else:
    prediction = 0

prediction  # 1''')+
p('در این مثال، k=3 و وزنِ رأی‌ها برابر است؛ فرد بودنِ k مانعِ تساویِ تعدادِ رأی‌های دو کلاس می‌شود. تساویِ فاصله، مسئلهٔ دیگری است: اگر دو نمونه در مرزِ انتخاب هم‌فاصله باشند، <code>kind="stable"</code> موردِ زودتر در داده را مقدم می‌کند. تغییرِ ترتیبِ سطرها در چنین مرزی ممکن است انتخاب را عوض کند؛ این فقط قراردادِ ما برای رفعِ تساوی است.')))

parts.append(('exercise','نوبت شما: از مشورت تا یک پیش‌بینیِ قابلِ توضیح',
p('برای هر بخش، علاوه بر نتیجهٔ محاسبه، توضیح دهید کدام اطلاعات در تصمیم دخالت کرده‌اند. جوابِ تمرینِ تازه در این جزوه نوشته نشده است.')+
'''<ol class="tasks"><li><b>دو «دو» را از هم جدا کنید.</b> توضیح دهید چرا مسئلهٔ ما باینری و فضای ویژگیِ آن دوبعدی است. اگر تعدادِ شاخص‌ها پنج شود و برچسب‌ها همچنان صفر و یک بمانند، کدام ویژگیِ مسئله تغییر می‌کند؟</li>
<li><b>پیش از اجرا، روی کاغذ پیش‌بینی کنید.</b> جایِ <code>q_new = np.array([4.6, 4.4])</code> را روی صفحه علامت بزنید. برای k برابرِ ۱، ۳ و ۵، همسایه‌ها و کلاسِ پیشنهادی را حدس بزنید؛ سپس با کد بررسی کنید و دلیلِ هر اختلاف را توضیح دهید.</li>
<li><b>معنای کدِ برچسب را بررسی کنید.</b> فقط کدهای صفر و یک را در y با هم عوض کنید و مختصات و ترتیبِ سطرها را ثابت نگه دارید. همسایه‌ها، کدِ پیش‌بینی و معنای آن را قبل و بعد از این تغییر مقایسه کنید.</li>
<li><b>مرزِ تمثیل را بشناسید.</b> در مشورت گرفتن، همهٔ افراد ممکن است تجربهٔ مرتبط نداشته باشند. توضیح دهید این نکته در kNN به انتخابِ ویژگی‌ها و تعریفِ فاصله چه ارتباطی دارد.</li>
<li><b>پیش‌بینی را با واقعیت یکی نگیرید.</b> مدل برای پرس‌وجوی اصلی، با k=1 کلاسِ صفر و با k=3 کلاسِ یک را پیشنهاد داد. برای فهمیدنِ اینکه کدام پیش‌بینی درست بوده، به چه اطلاعاتی نیاز داریم؟ آیا هم‌رأی بودنِ تمامِ همسایه‌ها به‌تنهایی درستیِ پاسخ را ثابت می‌کند؟</li></ol>'''+
'''<table class="exercise-results"><thead><tr><th>k</th><th>همسایه‌ها به ترتیب</th><th>رأی ۰ / رأی ۱</th><th>پیش‌بینی</th></tr></thead><tbody><tr><td>1</td><td>…</td><td>…</td><td>…</td></tr><tr><td>3</td><td>…</td><td>…</td><td>…</td></tr><tr><td>5</td><td>…</td><td>…</td><td>…</td></tr></tbody></table>'''+
p('جدول را برای پرس‌وجوی تازه کامل کنید و نتیجهٔ کد را با حدسِ اولیه‌تان مقایسه کنید. در نسخهٔ وب، پس از جابه‌جاییِ q ابتدا رأی‌ها را خودتان بشمارید و سپس دکمهٔ نمایشِ نتیجه را بزنید. سهمِ رأیِ یک کلاس، به‌تنهایی احتمالِ واقعیِ وضعیتِ S را مشخص نمی‌کند.')+
p('این ده پرونده برای دیدنِ سازوکارِ روش‌اند. برای ارزیابیِ یک مدل، به نمونه‌های دارای پاسخ نیاز داریم که پاسخِ آن‌ها هنگامِ ساختنِ پیش‌بینی استفاده نشده باشد. در یادداشتِ بعد، همین نیاز را به تقسیمِ داده به آموزش و آزمون وصل می‌کنیم. مقیاس‌بندیِ مناسبِ ویژگی‌ها نیز بخشی از همان مسیر خواهد بود؛ هم‌مقیاس بودنِ دو شاخصِ این مثال، ویژگیِ دادهٔ ساختگیِ ماست.')+
'''<div class="sources">برای مراجعهٔ بیشتر، توضیحِ مفهومیِ همسایه‌های نزدیک و مستنداتِ ابزارهای NumPy:
<div dir="ltr"><a href="https://scikit-learn.org/stable/modules/neighbors.html#nearest-neighbors-classification">Nearest neighbors · Conceptual guide</a><br><a href="https://numpy.org/doc/stable/reference/generated/numpy.argsort.html">NumPy · argsort</a><br><a href="https://developers.google.com/machine-learning/intro-to-ml/supervised">Google · Supervised learning</a></div></div>'''))

groups=[('consult','تمثیلِ مشورت',[0]),('patients','پرونده‌ها و پاسخ‌های معلوم',[1]),('binary','دو ویژگی، دو کلاس',[2]),('neighbors','یک همسایه یا چند همسایه؟',[3,4]),('numpy','از نمودار تا NumPy',[5,6]),('exercise','تمرینِ شما',[7])]

explorer='''<div class="knn-explorer" data-knn-explorer><div class="knn-explorer-head"><div><p class="lab-kicker">دادهٔ پزشکیِ کاملاً ساختگی</p><h3>جایِ پرس‌وجو را عوض کنید.</h3></div><button type="button" data-knn-reset class="knn-reset">بازگشت به مثال</button></div><div class="knn-explorer-grid"><div class="knn-plot"><img data-knn-fallback src="{{ASSETS}}prediction/medical-k3.svg" alt="سه همسایهٔ پرس‌وجوی نمونه و رأی‌های آن‌ها"><svg data-knn-svg viewBox="0 0 560 540" tabindex="0" role="img" aria-label="نمودار دوبعدی نمونه‌های ساختگی؛ با کلیک، لمس یا کلیدهای جهت، پرس‌وجو را جابه‌جا کنید." hidden></svg></div><div class="knn-panel"><div class="knn-query" dir="ltr">q = <output data-knn-query>[5.7, 4.6]</output></div><label for="knn-m1">امتیازِ تنفسی M1 <output data-knn-m1>5.7</output></label><input id="knn-m1" data-knn-input="0" type="range" min="0" max="10" step="0.1" value="5.7"><label for="knn-m2">امتیازِ خستگی M2 <output data-knn-m2>4.6</output></label><input id="knn-m2" data-knn-input="1" type="range" min="0" max="10" step="0.1" value="4.6"><div class="knn-k" role="group" aria-label="تعدادِ همسایه‌ها"><button type="button" data-knn-k="1" aria-pressed="false">k = 1</button><button type="button" data-knn-k="3" aria-pressed="true">k = 3</button><button type="button" data-knn-k="5" aria-pressed="false">k = 5</button></div><p class="knn-tie" data-knn-tie role="status" hidden>در مرزِ انتخاب، فاصلهٔ چند پرونده برابر است؛ برای انتخابِ k نمونه، ترتیبِ اولیهٔ سطرها را حفظ می‌کنیم.</p><p class="knn-pause">ابتدا رأی‌ها را بشمارید؛ سپس نتیجه را ببینید.</p><button type="button" data-knn-reveal aria-expanded="false" aria-controls="knn-outcome" class="knn-reveal">نمایشِ رأی‌ها و پیش‌بینی</button><div id="knn-outcome" data-knn-outcome hidden><p class="knn-vote-summary" data-knn-votes aria-live="polite">کلاس ۰: یک رأی · کلاس ۱: دو رأی</p><p class="knn-prediction" data-knn-prediction>پیش‌بینی مدل: کلاس ۱ — مثبت</p></div><ol class="knn-neighbor-list" data-knn-neighbors></ol></div></div><p class="knn-explorer-note">دایره‌های سبز: کلاس ۰ · مربع‌های مرجانی: کلاس ۱ · لوزیِ تیره: پرس‌وجو. روی نمودار کلیک کنید یا از لغزنده‌ها استفاده کنید.</p></div>'''

# Compile real LaTeX to vector outlines for the PDF, and KaTeX for the website.
tex=r'''\documentclass[12pt]{article}
\usepackage[paperwidth=190mm,paperheight=34mm,margin=2mm]{geometry}
\usepackage{amsmath,amssymb,fontspec,unicode-math}
\setmainfont{DejaVuSerif.ttf}[Path=/usr/share/fonts/truetype/dejavu/]
\setmathfont{latinmodern-math.otf}[Path=/usr/share/texmf/fonts/opentype/public/lm-math/]
\pagestyle{empty}\setlength{\parindent}{0pt}\begin{document}
'''+ '\n\\newpage\n'.join('\\[\n'+e+'\n\\]' for e in equations)+'\n\\end{document}\n'
(TMP/'equations.tex').write_text(tex)
env=os.environ.copy();env.update(TEXINPUTS='/usr/share/texlive/texmf-dist/tex//:',TFMFONTS='/usr/share/texlive/texmf-dist/fonts/tfm//:',TEXFORMATS=str(WORK/'tmp/texmf')+'//:',T1FONTS='/usr/share/texlive/texmf-dist/fonts/type1//:',OPENTYPEFONTS='/usr/share/texmf/fonts/opentype//:',ENCFONTS='/usr/share/texlive/texmf-dist/fonts/enc//:',TEXPSHEADERS='/usr/share/texlive/texmf-dist/fonts//:')
r=subprocess.run(['xelatex','-interaction=nonstopmode','-halt-on-error','-output-directory='+str(TMP),str(TMP/'equations.tex')],env=env,cwd=WORK,capture_output=True,text=True)
if r.returncode:raise RuntimeError(r.stdout[-2500:]+r.stderr[-1000:])
doc=fitz.open(TMP/'equations.pdf');assert len(doc)==len(equations)
for i,pg in enumerate(doc):
    rects=[fitz.Rect(b['bbox']) for b in pg.get_text('dict')['blocks']]+[d['rect'] for d in pg.get_drawings()]
    box=rects[0]
    for rect in rects[1:]:box|=rect
    box+=(-3,-3,3,3);pg.set_cropbox(box)
    (ASSET/f'eq-{i:02}.svg').write_text(pg.get_svg_image(text_as_path=True))
node_script='const fs=require("fs"); const k=require(process.argv[1]); const x=JSON.parse(fs.readFileSync(0,"utf8")); process.stdout.write(JSON.stringify(x.map(t=>k.renderToString(t,{displayMode:true,throwOnError:true,output:"htmlAndMathml"}))));'
rendered=json.loads(subprocess.run(['node','-e',node_script,str(ROOT/'assets/katex/katex.min.js')],input=json.dumps(equations),capture_output=True,text=True,check=True).stdout)
def web(s):
    def repl(m):
        i=int(m.group(1));return m.group(0).replace('</div>',rendered[i]+'</div>')
    return re.sub(r'<div class="formula-card lesson-formula" data-equation="(\d+)"[^>]*></div>',repl,s)
def pdf(s):
    def repl(m):return f'<div class="math-panel"><img src="{ASSET}/eq-{int(m.group(1)):02}.svg" style="width:{int(m.group(2))}px"></div>'
    s=re.sub(r'<div class="formula-card lesson-formula" data-equation="(\d+)" data-width="(\d+)"[^>]*></div>',repl,s)
    s=s.replace('{{ASSETS}}',str(ROOT/'assets')+'/')
    s=re.sub(r'<div class="code-head">.*?</div>','',s)
    return s

web_sections=[]
for n,(section,label,indices) in enumerate(groups,1):
    body=''.join(parts[i][2] for i in indices)
    if section=='neighbors':body+=explorer
    web_sections.append(f'<section class="lesson-section" id="{section}" aria-labelledby="{section}-title"><header class="section-head"><p class="section-kicker"><span>{n:02}</span>{label}</p><h2 id="{section}-title">{parts[indices[0]][1]}</h2></header><div class="lesson-prose">{web(body)}</div></section>')
(ROOT/'content/machine-learning/prediction-problem.html').write_text('\n'.join(web_sections)+'\n<script type="application/json" id="medical-knn-data">'+json.dumps(DATA)+'</script>')

cover=f'''<section class="pdf-page cover"><div class="cover-top"><img src="{ROOT}/assets/logo.svg"><div>دفتر کلاس<br><span>یادداشت‌های کلاس ماشین لرنینگ</span></div></div><p class="cover-number">یادداشت ۰۲</p><h1>از مشورت گرفتن<br>تا طبقه‌بندیِ<br><em>باینری</em></h1><p class="cover-deck">دو ویژگی، دو کلاس، یک پرس‌وجو<br>فهم kNN با دادهٔ پزشکیِ ساختگی</p><div class="cover-art"><img src="{ASSET}/input-target.svg"></div><div class="cover-credit" dir="ltr"><span>Instructor</span><strong>Masoud Ahangary</strong></div><p class="cover-bottom">ادامهٔ یادداشت «از یک جدول تا نزدیک‌ترین نمونه»</p></section>'''
pages=[cover]
for i,(_,title,body) in enumerate(parts,1):
    pages.append(f'<section class="pdf-page body-page page-{i}"><p class="page-kicker">یادداشت ۰۲ <span> / </span> طبقه‌بندیِ باینری با همسایه‌ها</p><h2>{title}</h2>{pdf(body)}</section>')

CSS=f'''
@font-face{{font-family:Vazir;src:url('{ROOT}/assets/fonts/Vazirmatn-Regular.ttf');font-weight:400}}
@font-face{{font-family:Vazir;src:url('{ROOT}/assets/fonts/Vazirmatn-Bold.ttf');font-weight:700}}
@font-face{{font-family:Code;src:url('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf')}}
@page{{size:A4;margin:17mm 19mm 18mm;@top-right{{content:'{TITLE}';font:7.5pt Vazir;color:#698375;border-bottom:1px solid #d9e3da;padding-bottom:5px}}@bottom-right{{content:'Machine Learning · Masoud Ahangary';font:7.3pt Vazir;color:#698375;border-top:1px solid #d9e3da;padding-top:5px}}@bottom-left{{content:counter(page);font:9pt Vazir;color:#0f766e;border-top:2px solid #0f766e;padding-top:4px}}}}
@page:first{{@top-right{{content:none}}@bottom-right{{content:none}}@bottom-left{{content:none}}}}
*{{box-sizing:border-box}}body{{margin:0;font-family:Vazir;color:#243e37;font-size:10.4pt;line-height:1.85;direction:rtl}}.pdf-page{{break-after:page}}.pdf-page:last-child{{break-after:auto}}h2{{font-size:21pt;line-height:1.6;color:#19364b;border-right:3px solid #0f766e;padding-right:10px;margin:0 0 17px}}p{{text-align:justify;margin:0 0 13px}}b,strong{{font-weight:700}}.page-kicker{{font-size:8pt;color:#a77553;margin:0 0 8px}}.page-kicker span{{margin:0 7px;color:#adbdaf}}
table{{width:100%;border-collapse:separate;border-spacing:0;border:1px solid #d7e2d8;border-radius:7px;overflow:hidden;margin:15px 0 17px;break-inside:avoid;font-size:9.3pt}}th{{background:#19364b;color:#fff;font-weight:700;padding:8px}}td{{padding:6px 9px;border-bottom:1px solid #e1e8df}}tr:last-child td{{border-bottom:0}}tbody tr:nth-child(even){{background:#f1f6ee}}.dataset-table{{direction:ltr}}.dataset-table th,.dataset-table td{{text-align:center}}.prediction-device-table th:nth-child(2){{background:#b7754a}}.prediction-device-table td:nth-child(2){{background:#fbefe4;color:#805735}}.prediction-device-table th:nth-child(3),.prediction-device-table th:nth-child(4){{background:#0f766e}}.prediction-device-table td:nth-child(3),.prediction-device-table td:nth-child(4){{background:#e9f3ec;color:#205e42}}.problem-comparison th,.problem-comparison td{{text-align:right}}
.note{{background:#eef5ec;border-right:3px solid #0f766e;padding:10px 13px;color:#47694c;font-size:9.5pt;line-height:1.9;margin-top:15px;break-inside:avoid}}code{{display:inline-block;font:8.6pt/1.5 Code;direction:ltr;unicode-bidi:embed;color:#1f6261;background:#edf3f1;padding:0 3px;border-radius:3px}}pre{{font:8.3pt/1.65 Code;direction:ltr;text-align:left;white-space:pre;background:#f0f3f7;color:#1f3e4f;padding:12px 14px;border:1px solid #dde5e9;border-left:3px solid #7567b5;border-radius:6px;margin:13px 0 16px;break-inside:avoid}}.keyword{{color:#76559d}}.function{{color:#0f766e}}.number{{color:#aa593e}}.string{{color:#76559d}}.comment{{color:#657e84}}
.math-panel{{direction:ltr;background:#fbfdfa;border:1px solid #cdd8d2;border-radius:7px;padding:12px;margin:13px 0 16px;break-inside:avoid}}.math-panel img{{display:block;max-width:95%;height:auto;margin:0 auto}}figure{{margin:14px 0 17px;break-inside:avoid}}figure img{{display:block;width:100%;height:auto}}figcaption{{font-size:8pt;line-height:1.8;text-align:center;color:#718672;margin-top:6px}}.tasks{{padding-right:22px;margin:0}}.tasks li{{padding-right:3px;margin-bottom:15px;text-align:justify}}.sources{{font-size:8pt;color:#71836d;line-height:1.9;border-top:1px solid #dbe5d9;padding-top:13px;margin-top:15px}}.sources a{{color:#0f766e;text-decoration:none}}.sources>div{{font-size:7.7pt;margin-top:6px}}
.cover{{padding-top:7px}}.cover-top{{display:flex;align-items:center;gap:12px;color:#244a3c;font-size:14pt;font-weight:700}}.cover-top img{{width:48px;height:48px}}.cover-top span{{font-size:8.5pt;font-weight:400;color:#71836e}}.cover-number{{margin:43px 0 13px;font-size:10pt;color:#ad704d}}h1{{font-size:33pt;line-height:1.7;color:#19364b;margin:0;font-weight:700}}h1 em{{font-style:normal;color:#0f766e}}.cover-deck{{font-size:12pt;color:#6b8271;line-height:2;margin:18px 0 0}}.cover-art{{margin:29px 0 26px}}.cover-art img{{width:100%;height:197px;object-fit:contain}}.cover-credit{{text-align:left;font-size:12pt;border-top:1px solid #cfded1;padding-top:16px}}.cover-credit span{{font-size:8pt;color:#7d8d7b;display:block;margin-bottom:5px}}.cover-credit strong{{color:#244939}}.cover-bottom{{font-size:8pt;color:#7d8d7b;margin-top:13px}}.page-2 pre{{font-size:8pt;line-height:1.55;padding-top:10px;padding-bottom:10px}}.page-3 p{{margin-bottom:10px}}.page-3 figure img{{max-height:188px}}.page-3 figure{{margin-top:3px;margin-bottom:12px}}.page-3 h2{{margin-bottom:10px}}.page-6 p{{margin-bottom:10px}}.page-6 table{{margin-top:9px;margin-bottom:12px}}.page-6 td{{padding:5px 9px}}.page-6 .math-panel{{padding:8px;margin:9px 0 11px}}.page-7{{font-size:10pt;line-height:1.85}}.page-7 .tasks li{{margin-bottom:13px}}
'''
CSS+='\n.cover-number{margin-top:30px}.cover-art{margin-top:20px;margin-bottom:20px}.cover-art img{height:227px}.medical-table{font-size:9.5pt}.medical-table th{background:#19364b}.medical-table th:nth-child(2),.medical-table th:nth-child(3){background:#0f766e}.medical-table td:nth-child(2),.medical-table td:nth-child(3){background:#edf4ed}.medical-table .class-0{color:#0f766e}.medical-table .class-1{color:#a34e31}.consult-votes{display:flex;gap:10px;margin:20px 0 24px;direction:rtl}.consult-votes>div{width:33.333%;border:1px solid #d6e3d7;border-radius:8px;padding:18px 8px;background:#fbfdfa;text-align:center}.consult-votes span{display:block;font-size:9pt;color:#687e6c}.consult-votes strong{display:block;margin-top:7px;font-size:14pt}.vote-yes{color:#0f766e}.vote-no{color:#bd603e}.page-3 figure img{max-height:280px}.page-3 h2{margin-bottom:12px}.page-4 figure img,.page-5 figure img{max-height:280px}.page-4 .math-panel{padding:7px;margin-top:7px;margin-bottom:8px}.page-4 p,.page-5 p{margin-bottom:11px}.page-5 .neighbor-readout{font-size:9pt;margin:8px 0 11px}.page-5 .neighbor-readout td,.page-5 .neighbor-readout th{padding:4px 9px}.page-6 pre{font-size:8.2pt;line-height:1.6;padding-top:10px;padding-bottom:10px}.page-7{font-size:10pt;line-height:1.8}.page-7 p{margin-bottom:8px}.page-7 pre{font-size:8pt;line-height:1.5;margin:8px 0 11px;padding:9px 12px}.page-7 .math-panel{padding:7px;margin:8px 0 11px}.page-8{font-size:10pt;line-height:1.85}.page-8 .tasks li{margin-bottom:12px}\n'
CSS+='\n.page-3 figure img{max-height:335px}.page-4 figure img{max-height:390px}.page-5 figure img{max-height:350px}.cover-art img{height:260px}\n'
CSS+='\n.analogy-map{font-size:9pt;margin:12px 0}.analogy-map td,.analogy-map th{padding:5px 9px}.page-1 p{margin-bottom:11px}.page-1 .consult-votes{margin:14px 0 16px}.exercise-results{font-size:9pt;margin:12px 0}.exercise-results td{height:24px;text-align:center}.exercise-results th{text-align:center;padding:5px}.page-8 .tasks li{margin-bottom:10px}.page-8 .sources{margin-top:10px;padding-top:10px}.page-4 figure img,.page-5 figure img{max-height:310px}\n'
source='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>'+TITLE+'</title><meta name="author" content="Masoud Ahangary"><style>'+CSS+'</style></head><body>'+''.join(pages)+'</body></html>'
(TMP/'prediction-problem-pdf.html').write_text(source)
document=HTML(string=source,base_url=str(ROOT)).render()
document.write_pdf(OUT/'prediction_problem_fa.pdf')
print('PDF pages:',len(document.pages))
shutil.copyfile(OUT/'prediction_problem_fa.pdf',ROOT/'assets/prediction-problem-tutorial.pdf')

catalog=json.loads((ROOT/'site.json').read_text())
lesson={'slug':'prediction-problem','title':TITLE,'subtitle':'دو ویژگی، دو کلاس؛ فهم kNN با دادهٔ پزشکیِ ساختگی','description':'با تمثیلِ مشورت گرفتن شروع می‌کنیم، دو کلاس را روی صفحه می‌بینیم و رأی همسایه‌ها را با NumPy محاسبه می‌کنیم.','number':'02','source':'content/machine-learning/prediction-problem.html','hero_intro':'<p class="">وقتی برای یک تصمیمِ تازه مشورت می‌گیریم، تجربهٔ کسانی را جدی‌تر می‌گیریم که شرایطشان به ما نزدیک‌تر است. در این یادداشت، همین ایده را به یک الگوریتم تبدیل می‌کنیم: ده پروندهٔ پزشکیِ ساختگی، دو امتیاز، دو کلاس و یک پرس‌وجوی تازه.</p>','hero_title':'از مشورت گرفتن<br>تا طبقه‌بندیِ <em>باینری</em>','hero_figure':False,'hero_meta':['۱۰ پروندهٔ ساختگی','۲ ویژگی','۲ کلاس'],'sections':[{'id':key,'label':label}for key,label,_ in groups],'tags':['طبقه‌بندی باینری','kNN','NumPy'],'pdf':'prediction-problem-tutorial.pdf','scripts':['medical-knn.js'],'takeaways':['دو ویژگی، مختصاتِ هر نمونه را می‌سازند.','دو کلاس، پاسخ‌های ممکن را مشخص می‌کنند.','k تعدادِ همسایه‌هایی است که رأی می‌دهند.'],'teaching_shape':'10 × 2','teaching_shape_note':'۱۰ نمونه، ۲ ویژگی؛ هدف شامل ۲ کلاس'}
lessons=catalog['courses'][0]['lessons'];lessons[:]=[l for l in lessons if l['slug']!='prediction-problem'];lessons.append(lesson)
(ROOT/'site.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
print('Updated binary medical kNN lesson, graphics, PDF and catalog.')
