(function () {
  'use strict';
  const STARTER = `# np, names, X and query are ready.
print("X.shape:", X.shape)
print("query.shape:", query.shape)

# TODO: subtract, square, sum along the correct axis, then sqrt.
# TODO: find the nearest sample and the three nearest samples.
# TODO: repeat with prices expressed in millions.
`;
  const BINARY_STARTER = `# np, names, X, y, query and q_new are ready.
# query is the worked example; q_new is your exercise.
print("X.shape:", X.shape)
print("y.shape:", y.shape)
print("q_new.shape:", q_new.shape)

# TODO: compute distances from every reference row to q_new.
# TODO: sort the distances and select neighbors for k = 1, 3, 5.
# TODO: count class votes and explain each prediction.
`;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let current = null;
  function mount(root, {userId, workerURL, lessonId}) {
    const binary = lessonId === 'machine-learning/prediction-problem';
    if ((!binary && lessonId !== 'machine-learning/vector-distance') || !userId) return null;
    if (current?.element.isConnected && current.userId === userId && current.lessonId === lessonId) return current;
    current?.dispose();
    const target = root.querySelector('#exercise .lesson-prose');
    const source = root.querySelector(binary ? '#numpy .code-block pre' : '#vectors .code-block pre');
    if (!target || !source || !source.textContent.includes('query =')) return null;
    let bootstrap = source.textContent;
    if (binary) {
      const exerciseQuery = Array.from(root.querySelectorAll('#exercise code')).find(code => /^q_new\s*=\s*np\.array\(/.test(code.textContent.trim()));
      if (!exerciseQuery) return null;
      bootstrap += '\n' + exerciseQuery.textContent.trim() + '\n';
    }
    const starter = binary ? BINARY_STARTER : STARTER;
    const variables = binary ? 'np, names, X, y, query, q_new' : 'np, names, X, query';
    const instruction = binary ? 'پیش از اجرا، همسایه‌های پرس‌وجوی تازهٔ <code>q_new</code> را حدس بزن. <code>query</code> مربوط به مثال حل‌شدهٔ جزوه است. برای دیدن نتیجه از <code>print()</code> استفاده کن.' : 'اول شکلِ خروجی هر مرحله را پیش‌بینی کن؛ بعد کدت را بنویس و نتیجه را بررسی کن. برای دیدن نتیجه از <code>print()</code> استفاده کن.';
    const el = document.createElement('section');
    el.className = 'python-lab';
    el.setAttribute('aria-labelledby', 'python-lab-title');
    el.innerHTML = `<div class="python-lab-heading"><h3 id="python-lab-title">کدت را همین‌جا اجرا کن</h3><span lang="en" dir="ltr">Python + NumPy</span></div>
      <p>${instruction}</p>
      <details class="python-lab-data"><summary>داده‌های آماده: <bdi dir="ltr">${variables}</bdi></summary><pre dir="ltr" tabindex="0">${escape(bootstrap)}</pre></details>
      <label class="python-lab-label" for="python-lab-code">کد تمرین</label>
      <textarea id="python-lab-code" dir="ltr" lang="en" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" maxlength="20000" rows="10" aria-describedby="python-lab-help python-lab-save"></textarea>
      <p id="python-lab-help" class="small-note">هر اجرا با داده‌های اولیه شروع می‌شود؛ متغیرهای اجرای قبلی باقی نمی‌مانند. میان‌بر اجرا: <bdi dir="ltr">Ctrl / ⌘ + Enter</bdi>. برای تورفتگی از فاصله استفاده کن.</p>
      <div class="python-lab-actions"><button type="button" class="button-forest" data-python-run>فعال‌سازی محیط Python</button><button type="button" class="button-outline" data-python-stop disabled>توقف</button><button type="button" class="quiet-button" data-python-reset>بازنشانی کد</button><button type="button" class="quiet-button" data-python-download>دانلود کد</button></div>
      <p class="python-lab-status" data-python-status role="status" aria-live="polite">محیط هنوز بارگذاری نشده است. فعال‌سازی نخست به اینترنت نیاز دارد و ممکن است کمی طول بکشد.</p>
      <div class="python-lab-result"><h4>خروجی اجرا</h4><pre data-python-output dir="ltr" tabindex="0" aria-label="خروجی Python">هنوز کدی اجرا نشده است.</pre></div>
      <p id="python-lab-save" class="small-note" data-python-save></p><p class="small-note">این محیط برای تمرین است؛ اجرای کد، پاسخِ تکلیف یا نتیجهٔ آزمون ثبت نمی‌کند.</p>`;
    // Join the exercise before its answer worksheet, without rewriting stored lesson HTML.
    const worksheet = target.querySelector('.answer-table, .worksheet, table')?.closest('.table-scroll, .table-card');
    if (worksheet?.parentElement === target) worksheet.before(el); else target.append(el);
    const $ = s => el.querySelector(s), editor = $('#python-lab-code'), run = $('[data-python-run]'),
      stop = $('[data-python-stop]'), reset = $('[data-python-reset]'), download = $('[data-python-download]'),
      notice = $('[data-python-status]'), output = $('[data-python-output]'), save = $('[data-python-save]');
    const key = `classroom-python:${userId}:${lessonId}:v1`;
    let worker = null, state = 'idle', timer = null, epoch = 0, disposed = false, hasOutput = false, size = 0;
    editor.value = starter;
    try { const saved = localStorage.getItem(key); if (saved !== null && saved.length <= 20000) editor.value = saved; }
    catch { /* The editor remains usable if browser storage is unavailable. */ }
    function persist() {
      try { localStorage.setItem(key, editor.value); save.textContent = 'کد به‌صورت خودکار، جدا برای حساب تو در همین مرورگر ذخیره می‌شود؛ در حساب آنلاین ذخیره نمی‌شود.'; }
      catch { save.textContent = 'مرورگر اجازهٔ ذخیرهٔ کد را نمی‌دهد؛ پیش از بستن صفحه، کدت را دانلود کن.'; }
    }
    function show(next, message, error = false) {
      state = next; notice.textContent = message; notice.dataset.error = String(error);
      run.disabled = next === 'loading' || next === 'running';
      run.textContent = next === 'loading' ? 'در حال آماده‌سازی…' : next === 'idle' ? 'فعال‌سازی محیط Python' : 'اجرای کد';
      stop.disabled = !['loading','running'].includes(next);
      reset.disabled = next === 'loading' || next === 'running';
      editor.readOnly = next === 'running';
      el.setAttribute('aria-busy', String(next === 'loading' || next === 'running'));
    }
    function terminate() { clearTimeout(timer); timer = null; epoch++; worker?.terminate(); worker = null; if (state === 'running' && !hasOutput) output.textContent = 'اجرا متوقف شد؛ خروجی چاپی دریافت نشد.'; }
    function append(text) {
      if (size >= 16000) return;
      if (!hasOutput) { output.textContent = ''; hasOutput = true; }
      const slice = String(text).slice(0, 16000 - size); size += slice.length; output.textContent += slice;
    }
    function fail(message) { terminate(); show('idle', message, true); }
    function start() {
      if (typeof Worker === 'undefined') { show('idle', 'این مرورگر از محیط اجرا پشتیبانی نمی‌کند. مرورگر را به‌روز کن یا کدت را دانلود و در Python اجرا کن.', true); return; }
      show('loading', 'در حال دریافت و آماده‌سازی Python… پس از آماده‌شدن، دکمهٔ «اجرای کد» را بزن.');
      try {
        worker = new Worker(workerURL, {type: 'module'});
        const generation = ++epoch;
        timer = setTimeout(() => fail('بارگذاری کامل نشد. اتصال اینترنت یا دسترسی به CDN را بررسی کن و دوباره فعال‌سازی را بزن؛ کدت حفظ شده است.'), 120000);
        worker.onerror = event => { event.preventDefault?.(); if (generation === epoch) fail('محیط Python بارگذاری نشد. اتصال اینترنت را بررسی کن و دوباره فعال‌سازی را بزن؛ کدت حفظ شده است.'); };
        worker.onmessage = ({data}) => {
          if (disposed || generation !== epoch || !data || typeof data.type !== 'string') return;
          if (data.type === 'stage' && state === 'loading') show('loading', 'Python آماده است؛ در حال دریافت NumPy…');
          if (data.type === 'ready' && state === 'loading') { clearTimeout(timer); show('ready', 'محیط آماده است. اکنون «اجرای کد» را بزن.'); }
          if (data.type === 'load-error') fail('دریافت Python یا NumPy کامل نشد. اتصال اینترنت را بررسی کن و دوباره فعال‌سازی را بزن؛ کدت حفظ شده است.');
          if (state !== 'running') return;
          if (data.type === 'output' && typeof data.text === 'string') append(data.text);
          if (data.type === 'truncated') append('\n[Output shortened: 12000-character limit]\n');
          if (data.type === 'python-error') { append('\n' + String(data.text)); clearTimeout(timer); show('ready', 'کد خطا دارد. پیام Python در خروجی آمده است؛ کدت را اصلاح کن و دوباره اجرا کن.', true); }
          if (data.type === 'done') { clearTimeout(timer); if (!hasOutput) output.textContent = 'اجرا تمام شد؛ خروجی چاپی وجود ندارد. برای نمایش نتیجه از print() استفاده کن.'; show('ready', 'اجرا پایان یافت. خروجی را با پیش‌بینی خودت مقایسه کن.'); }
        };
        worker.postMessage({type: 'init'});
      } catch { fail('محیط اجرا در این مرورگر باز نشد. مرورگر و اتصال را بررسی کن یا کدت را دانلود کن.'); }
    }
    run.addEventListener('click', () => {
      if (disposed || ['loading','running'].includes(state)) return;
      if (!worker) { start(); return; }
      if (!editor.value.trim()) { show('ready', 'ابتدا چند خط کد بنویس؛ مثلاً print(X.shape).'); editor.focus(); return; }
      persist(); hasOutput = false; size = 0; output.textContent = 'در حال اجرا…';
      show('running', 'در حال اجرای کد… حداکثر زمان هر اجرا 15 ثانیه است.');
      timer = setTimeout(() => fail('اجرای کد پس از 15 ثانیه متوقف شد. حلقه‌ها و محاسبات را بررسی کن، سپس محیط را دوباره فعال کن؛ کدت حفظ شده است.'), 15000);
      worker.postMessage({type: 'run', bootstrap, code: editor.value});
    });
    stop.addEventListener('click', () => { terminate(); show('idle', 'محیط متوقف شد؛ کدت حفظ شده است. برای اجرای دوباره، محیط را فعال کن.'); });
    reset.addEventListener('click', () => {
      if (editor.value !== starter && !window.confirm('کد فعلی با کد اولیه جایگزین شود؟')) return;
      editor.value = starter; persist(); hasOutput = false; size = 0; output.textContent = 'کد اولیه بازگردانده شد؛ هنوز اجرا نشده است.';
      show(worker ? 'ready' : 'idle', 'کد اولیه بازگردانده شد.'); editor.focus();
    });
    download.addEventListener('click', () => {
      const blob = new Blob([bootstrap + '\n\n' + editor.value], {type:'text/x-python;charset=utf-8'});
      const href = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = href; a.download = lessonId.split('/')[1] + '-practice.py'; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    });
    editor.addEventListener('input', persist);
    editor.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); run.click(); } });
    function pause() { terminate(); show('idle', 'محیط اجرا بسته شد؛ کدت حفظ شده است. برای ادامه، محیط را دوباره فعال کن.'); }
    function dispose() { if (disposed) return; disposed = true; terminate(); window.removeEventListener('pagehide', pause); el.remove(); if (current?.element === el) current = null; }
    window.addEventListener('pagehide', pause);
    persist();
    current = {element: el, dispose, userId, lessonId};
    return current;
  }
  window.ClassNotesPython = {mount, dispose: () => current?.dispose()};
})();
