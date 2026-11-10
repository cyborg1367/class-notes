import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { MAX_TURNS, type TutorController } from './controller';

const prompts = ['مسئله را ساده‌تر توضیح بده','چرا خروجی من درست نیست؟'];

export function TutorPanel({ controller, onClose }: { controller: TutorController; onClose(): void }) {
  const state = useSyncExternalStore(controller.subscribe,controller.get);
  const transcript = useRef<HTMLDivElement>(null), question = useRef<HTMLTextAreaElement>(null);
  const lastKey = useRef('');
  const positions = useRef(new Map<string,number>());
  const follow = useRef(true);
  useLayoutEffect(() => {
    const element = transcript.current;
    if (!state.open || !element) return;
    if (lastKey.current !== state.key) {
      lastKey.current = state.key;
      element.scrollTop = positions.current.get(state.key) ?? element.scrollHeight;
      follow.current = element.scrollHeight-element.clientHeight-element.scrollTop < 64;
    } else if (follow.current) element.scrollTop = element.scrollHeight;
  },[state.key,state.open,state.turns]);

  const maxed = state.turns.length >= MAX_TURNS;
  return <section data-react-lab-tutor="" className="lab-tutor lab-tutor-docked" dir="rtl" hidden={!state.open}
    aria-labelledby="lab-tutor-title" onKeyDown={event=>{
      if (event.key === 'Escape' && !event.nativeEvent.isComposing) {
        event.preventDefault();event.stopPropagation();onClose();
      }
    }}>
    <header className="lab-tutor-head">
      <div><p className="lab-tutor-eyebrow">همراه یادگیری · گفتگوی آموزشی</p><h2 id="lab-tutor-title">کمک آموزشی</h2></div>
      <button className="lab-tutor-close" type="button" aria-label="بستن کمک آموزشی" onClick={onClose}>×</button>
    </header>
    <div className="lab-tutor-stage-row">
      <p className="lab-tutor-stage"><bdi>{state.title}</bdi></p>
      <button className="lab-tutor-reset" type="button" disabled={state.busy} onClick={()=>{
        controller.reset();positions.current.delete(state.key);follow.current=true;question.current?.focus({preventScroll:true});
      }}>گفتگوی تازه</button>
    </div>
    <div ref={transcript} className="lab-tutor-transcript" tabIndex={0} aria-label="تاریخچهٔ گفتگو"
      onScroll={event=>{
        const element=event.currentTarget;
        positions.current.set(state.key,element.scrollTop);
        follow.current=element.scrollHeight-element.clientHeight-element.scrollTop < 64;
      }}>
      <div key={state.key} className="lab-tutor-thread" role="log" aria-label="گفتگوی این مرحله" aria-live="polite" aria-relevant="additions">
        {state.turns.map(turn=><TurnMessages key={turn.id} question={turn.question} reply={turn.reply} />)}
      </div>
      {!state.turns.length && <>
        <p className="lab-tutor-welcome">از مسئله، داده‌ها یا بخشی از کدت بپرس. کمکت می‌کنم خودت راه‌حل را پیدا کنی؛ کد کامل تمرین را نمی‌نویسم.</p>
        <div className="lab-tutor-prompts" aria-label="شروع گفتگو">
          {prompts.map(prompt=><button key={prompt} type="button" onClick={()=>{
            controller.edit(prompt);question.current?.focus({preventScroll:true});
          }}>{prompt}</button>)}
        </div>
      </>}
    </div>
    <footer className="lab-tutor-composer">
      <form className="lab-tutor-form" aria-busy={state.busy} onSubmit={event=>{event.preventDefault();void controller.submit();}}>
        <label htmlFor="lab-tutor-question">سؤالت را بنویس</label>
        <textarea ref={question} id="lab-tutor-question" dir="auto" maxLength={600} rows={3}
          placeholder="مثلاً: منظورت از حفظ ترتیب سطرها چیه؟" value={state.draft}
          onChange={event=>controller.edit(event.target.value)}
          onKeyDown={event=>{
            if (event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing) {
              event.preventDefault();void controller.submit();
            }
          }} />
        <label className="lab-tutor-consent">
          <input type="checkbox" id="lab-tutor-share" checked={state.attach} disabled={state.busy}
            onChange={event=>controller.attach(event.target.checked)} />
          <span>کد و خروجی فعلی را فقط به همین پیام ضمیمه کن</span>
        </label>
        <details className="lab-tutor-details">
          <summary>دربارهٔ ارسال اطلاعات</summary>
          <p className="lab-tutor-privacy">سؤال و سابقهٔ این گفتگو برای پاسخ‌نویسی و بررسی پاسخ به Groq ارسال می‌شوند. ضمیمه اختیاری است: تا ۴۰۰۰ نویسهٔ آخر کد و ۸۰۰ نویسهٔ آخر خروجی. اطلاعات شخصی یا کلید API ننویس. گفتگو با بستن این پنل حفظ و با بازخوانی صفحه پاک می‌شود.</p>
        </details>
        <button className="button-forest lab-tutor-send" type="submit" disabled={state.busy || maxed}>
          {state.busy ? 'در حال دریافت پاسخ…' : 'ارسال سؤال ←'}
        </button>
      </form>
      <p className="lab-tutor-status" data-kind={state.status?.kind} role="status" aria-live="polite">{state.status?.text}</p>
    </footer>
  </section>;
}

function TurnMessages({ question, reply }: { question: string; reply: string }) {
  return <>
    <article className="lab-tutor-message" data-role="student">
      <p className="lab-tutor-message-label">تو</p><p className="lab-tutor-message-text" dir="auto">{question}</p>
    </article>
    <article className="lab-tutor-message" data-role="assistant">
      <p className="lab-tutor-message-label">همراه یادگیری</p><p className="lab-tutor-message-text" dir="auto">{reply}</p>
    </article>
  </>;
}
