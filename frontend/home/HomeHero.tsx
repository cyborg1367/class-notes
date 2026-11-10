import React from 'react';
import { GradientHero } from './GradientHero';
import { HomeAccountLink } from './HomeAccountLink';
import type { HomeChannel } from './contracts';
import { usePaperReveal } from './usePaperReveal';

export function HomeHero({ channel }: { channel: HomeChannel }) {
  const copy = usePaperReveal<HTMLDivElement>();
  return (
    <section className="landing-hero landing-hero--editorial" id="top">
      <div className="shell landing-grid">
        <div ref={copy.ref} style={copy.style} className={'landing-copy' + copy.suffix}>
          <p className="eyebrow">دفتر کلاس</p>
          <h1><span>هوش مصنوعی را</span>{' '}<span><em>با ساختن</em> یاد بگیر</span></h1>
          <p className="intro">با یک مثال شروع کن، منطق مدل را بفهم و خودت آن را در کد امتحان کن.</p>
          <div className="portal-actions">
            <a className="button-forest" href="#classes">مشاهدهٔ کلاس‌ها ←</a>
            <HomeAccountLink channel={channel} />
          </div>
          <p className="hero-signature" lang="en">Masoud Ahangary</p>
        </div>
        <GradientHero />
      </div>
      <div className="shell landing-band">
        <div><strong dir="ltr">۰۱</strong><span>مسئله را ببین</span></div>
        <div><strong dir="ltr">۰۲</strong><span>مدل را بساز</span></div>
        <div><strong dir="ltr">۰۳</strong><span>نتیجه را بسنج</span></div>
      </div>
    </section>
  );
}
