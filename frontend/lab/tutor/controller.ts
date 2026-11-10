export type TutorContext = { mission: string; task: string; title: string; code: string; output: string };
type TutorRequest = { mission: string; task: string; question: string; conversation: string; code: string; output: string };
type Turn = { id: number; question: string; reply: string };
type Conversation = { token: string; draft: string; turns: readonly Turn[] };
type Status = { text: string; kind: 'info' | 'error' };
export type TutorView = {
  open: boolean; key: string; title: string; turns: readonly Turn[]; draft: string; attach: boolean; busy: boolean; status?: Status;
};
export type TutorOptions = {
  request(body: TutorRequest, signal: AbortSignal): Promise<unknown>;
  getContext(): TutorContext;
  isCurrent(): boolean;
};
export const MAX_TURNS = 6;
const REQUEST_TIMEOUT_MS = 70_000;
const TUTOR_ERRORS: Readonly<Record<string,string>> = {
  TUTOR_PAUSED: 'کمک آموزشی فعلاً فعال نیست.',
  TUTOR_RATE_LIMIT: 'کمی صبر کن؛ تعداد درخواست‌های اخیر به حد مجاز رسیده است.',
  TUTOR_DAILY_LIMIT: 'سهمیهٔ امروز تمام شده است. Hint و اجرای کد همچنان در دسترس‌اند.',
  PROVIDER_LIMIT: 'Groq فعلاً به سقف مصرف رسیده است. کمی بعد دوباره ارسال کن.',
  PROVIDER_UNAVAILABLE: 'ارتباط با Groq برقرار نشد. پاسخ آماده جایگزین نشده است؛ کمی بعد دوباره تلاش کن.',
  INVALID_MODEL_OUTPUT: 'مدل پاسخ قابل استفاده‌ای نداد. دوباره با سؤال کوتاه‌تر امتحان کن.',
  GUIDANCE_TOO_DIRECT: 'پاسخ پیشنهادی بیش از حد به حل کامل نزدیک بود و نمایش داده نشد. سؤالت را روی یک مفهوم یا خط مشخص متمرکز کن.',
  GUIDANCE_UNCERTAIN: 'پاسخ پیشنهادی برای نمایش تأیید نشد. ابهامت را با جزئیات بیشتری توضیح بده.',
  CONVERSATION_EXPIRED: 'این گفتگو منقضی شده است. برای ادامه «گفتگوی تازه» را بزن.',
  CONVERSATION_LIMIT: 'این گفتگو به پایان شش نوبت رسیده است. می‌توانی گفتگوی تازه‌ای شروع کنی.',
  INVALID_REQUEST: 'نسخهٔ دستیار آمادهٔ این درخواست نیست. صفحه را تازه کن یا به مدرس اطلاع بده.',
  TASK_LOCKED: 'این مرحله هنوز باز نشده است.',
  SIGN_IN_REQUIRED: 'برای ادامه دوباره وارد حساب شو.',
  CLASS_ACCESS_REQUIRED: 'دسترسی کلاس فعال نیست.',
  TUTOR_TIMEOUT: 'پاسخ بیش از حد طول کشید. سؤالت حفظ شده است؛ می‌توانی دوباره ارسال کنی.',
  SERVICE_UNAVAILABLE: 'دستیار پاسخ نداد. سؤال و کد تو حفظ شده‌اند؛ دوباره تلاش کن.',
};
const empty: Conversation = { token:'',draft:'',turns:[] };
const keyFor = (context: TutorContext) => JSON.stringify([context.mission,context.task]);
const quota = new Intl.NumberFormat('fa-IR');
function record(value: unknown): Record<string,unknown> {
  return value !== null && typeof value === 'object' ? value as Record<string,unknown> : {};
}

async function requestReply(options: TutorOptions, body: TutorRequest, controller: AbortController) {
  const { signal } = controller;
  signal.throwIfAborted();
  let onAbort: () => void = () => {};
  const cancelled = new Promise<never>((_resolve,reject) => {
    onAbort = ()=>reject(signal.reason);
    signal.addEventListener('abort',onAbort,{ once:true });
  });
  // The service can make two consecutive model calls before returning.
  const timeout = setTimeout(()=>controller.abort({ code:'TUTOR_TIMEOUT' }),REQUEST_TIMEOUT_MS);
  try {
    return await Promise.race([options.request(body,signal),cancelled]);
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort',onAbort);
  }
}

export function createTutorController(options: TutorOptions) {
  const entries = new Map<string,Conversation>();
  const listeners = new Set<() => void>();
  let current: TutorView = { open:false,key:'',title:'',turns:[],draft:'',attach:false,busy:false };
  let active: AbortController | null = null;
  let ticket = 0, disposed = false;
  const alive = () => !disposed && options.isCurrent();

  function update(patch: Partial<TutorView>) {
    if (!alive()) return;
    current = { ...current,...patch };
    listeners.forEach(listener => listener());
  }
  function cancel() {
    ticket++;
    active?.abort();
    active = null;
  }
  function setStage(context: TutorContext) {
    if (!alive()) return;
    const key = keyFor(context);
    if (current.key === key) return;
    cancel();
    const stored = entries.get(key) || empty;
    update({ key,title:context.title,open:false,turns:stored.turns,draft:stored.draft,attach:false,busy:false,status:undefined });
  }
  function edit(draft: string) {
    if (!alive() || !current.open) return;
    draft = draft.slice(0,600);
    if (draft === current.draft) return;
    entries.set(current.key,{ ...(entries.get(current.key) || empty),draft });
    update({ draft });
  }
  async function submit() {
    if (!alive() || !current.open || active || current.turns.length >= MAX_TURNS) return;
    const context = options.getContext(), key = keyFor(context);
    if (key !== current.key) return;
    const question = current.draft.trim();
    if (!question) {
      update({ status:{ kind:'error',text:'اول سؤالت را بنویس.' } });
      return;
    }
    const conversation = entries.get(key) || empty;
    const attachment = current.attach;
    const controller = new AbortController(), id = ++ticket;
    const stillCurrent = () => alive() && id === ticket && current.open && current.key === key && keyFor(options.getContext()) === key;
    active = controller;
    // An attachment belongs to exactly this request, including a failed attempt.
    update({ attach:false,busy:true,status:{ kind:'info',text:'در حال نوشتن و بررسی پاسخ…' } });
    try {
      const result = record(await requestReply(options,{
        mission:context.mission,task:context.task,question,conversation:conversation.token,
        code:attachment ? context.code.slice(-4000) : '',output:attachment ? context.output.slice(-800) : '',
      },controller));
      if (!stillCurrent()) return;
      const { version,task,source,reply,conversation:token,remaining } = result;
      if (version !== 2 || task !== context.task || source !== 'model' ||
          typeof reply !== 'string' || !reply.trim() || reply.length > 900 ||
          typeof token !== 'string' || token.length > 40000) throw new Error('Invalid tutor response');
      const turns = [...conversation.turns,{ id,question,reply }];
      const draft = current.draft.trim() === question ? '' : current.draft;
      entries.set(key,{ token,turns,draft });
      const text = turns.length >= MAX_TURNS ? TUTOR_ERRORS.CONVERSATION_LIMIT :
        typeof remaining === 'number' && Number.isInteger(remaining) && remaining >= 0 ? quota.format(remaining)+' درخواست دیگر برای امروز' : '';
      update({ turns,draft,status:text ? { kind:'info',text } : undefined });
    } catch (error) {
      if (!stillCurrent()) return;
      const code = record(error).code;
      const known = typeof code === 'string' && Object.prototype.hasOwnProperty.call(TUTOR_ERRORS,code);
      update({ status:{ kind:'error',text:known ? TUTOR_ERRORS[code as string] : TUTOR_ERRORS.SERVICE_UNAVAILABLE } });
    } finally {
      if (id === ticket && active === controller) {
        active = null;
        update({ busy:false });
      }
    }
  }
  return {
    get: () => current,
    subscribe(listener: () => void) { listeners.add(listener);return () => { listeners.delete(listener); }; },
    setStage,edit,submit,
    open() {
      if (!alive()) return;
      setStage(options.getContext());
      if (!current.open) update({ open:true,status:current.turns.length >= MAX_TURNS ?
        { kind:'info',text:TUTOR_ERRORS.CONVERSATION_LIMIT } : undefined });
    },
    close() {
      const wasOpen = current.open;
      cancel();
      if (wasOpen) update({ open:false,attach:false,busy:false,status:undefined });
      return wasOpen;
    },
    attach(value: boolean) { if (current.open && !active) update({ attach:value }); },
    reset() {
      if (!alive() || !current.open || active) return;
      entries.delete(current.key);
      update({ turns:[],draft:'',attach:false,status:undefined });
    },
    dispose() { disposed = true;cancel();entries.clear();listeners.clear(); },
  };
}
export type TutorController = ReturnType<typeof createTutorController>;
