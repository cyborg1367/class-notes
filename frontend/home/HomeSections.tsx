import React from 'react';
import { usePaperReveal } from './usePaperReveal';

export function LearningMethod() {
  return (
    <section className="method-section" id="method">
      <div className="shell method-grid">
        <div><p className="eyebrow">روال یادگیری</p><h2>بخوان.<br />امتحان کن.<br />دوباره نگاه کن.</h2></div>
        <article><span>مطالعهٔ یادداشت</span><h3>مفهوم را بساز.</h3><p>با متن فارسی، نمودار، رابطهٔ ریاضی و مثال‌های کوچک جلو برو.</p></article>
        <article><span>تمرین و آزمایش</span><h3>خودت دست به کد شو.</h3><p>محاسبه‌ها را دنبال کن و در حالت تمرین، از راهنمایی استفاده کن.</p></article>
        <article><span>ارزیابی و بازخورد</span><h3>قدم بعدی را بشناس.</h3><p>آزمون را ثبت کن، دلیل پاسخ‌ها را بخوان و به بخش نیازمند مرور برگرد.</p></article>
      </div>
    </section>
  );
}

export function InstructorTeaser() {
  const reveal = usePaperReveal<HTMLElement>();
  return (
    <section ref={reveal.ref} style={reveal.style} className={'shell instructor-teaser' + reveal.suffix} id="instructor" aria-labelledby="instructor-preview-title">
      <div className="profile-badge"><div className="monogram" aria-label="حروف نام Masoud Ahangary">MA</div></div>
      <div>
        <p className="eyebrow">دربارهٔ مدرس</p><h2 id="instructor-preview-title">مسعود آهنگری</h2>
        <p lang="en" dir="ltr" className="teaser-name">Masoud Ahangary</p>
        <p>یادگیری ماشین، بهینه‌سازی و توسعهٔ سامانه‌های داده‌محور.</p>
      </div>
      <a className="button-outline" href="about/">معرفی و پروژه‌ها ←</a>
    </section>
  );
}

export function DashboardCallout() {
  return (
    <section className="shell"><div className="landing-end">
      <div><h2>یادداشت‌ها و نتایج آزمون‌ها</h2><p>از داشبورد به کلاس‌ها، پیش‌نویس پاسخ‌ها و نتایج آزمون‌ها دسترسی داری.</p></div>
      <a className="button-outline" href="dashboard/">ورود به داشبورد ←</a>
    </div></section>
  );
}
