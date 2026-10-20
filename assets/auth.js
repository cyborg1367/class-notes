"use strict";

// Only public project configuration belongs in the browser. RLS enforces ownership.
function validPublicConfig(config) {
  try {
    const url = new URL(config.supabaseUrl);
    return url.protocol === "https:" && !url.username && !url.password &&
      !url.search && !url.hash && url.pathname === "/" &&
      /^sb_publishable_[A-Za-z0-9_-]+$/.test(config.publishableKey);
  } catch { return false; }
}
function safeCourseReturn(value, base) {
  const fallback = new URL("machine-learning/", base).href;
  if (!value) return fallback;
  try {
    const target = new URL(value, base);
    // Decode before checking the path: reject encoded traversal and backslashes.
    const decoded = decodeURIComponent(target.pathname);
    if (target.origin !== base.origin || target.username || target.password ||
        !decoded.startsWith(base.pathname + "machine-learning/") ||
        /(?:^|\/)\.{1,2}(?:\/|$)|\\/.test(decoded)) return fallback;
    return target.href;
  } catch { return fallback; }
}
function checkedAnswers(value, ids) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid answers");
  const out = Object.create(null);
  for (const id of ids) {
    const answer = value[id] ?? "";
    if (typeof answer !== "string" || answer.length > 10000) throw new Error("Invalid answer");
    out[id] = answer;
  }
  return out;
}
if (typeof module !== "undefined" && module.exports) module.exports = { validPublicConfig, safeCourseReturn, checkedAnswers };

if (typeof document !== "undefined") (async function mountAccount() {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const script = $("script[data-class-auth]");
  const assets = new URL(".", script.src);
  const base = new URL("../", assets);
  const accountURL = new URL("account/", base);
  const status = $("[data-auth-status]");
  const cloudStatus = $("[data-cloud-status]");
  const callbackURL = new URL(location.href);
  const returnedFromGoogle = callbackURL.searchParams.has("code");
  const oauthError = callbackURL.searchParams.has("error") || callbackURL.searchParams.has("error_description");
  let client, user = null, generation = 0, busy = false;

  function message(element, text, error = false) {
    if (!element) return;
    element.textContent = text;
    element.dataset.error = String(error);
  }
  function setBusy(value) {
    busy = value;
    $$("[data-google-signin], [data-signout], [data-cloud-save], [data-cloud-load]").forEach((b) => { b.disabled = value; });
  }
  function publishUser(nextUser) {
    const changed = (user?.id || null) !== (nextUser?.id || null);
    user = nextUser;
    if (changed) generation++;
    $$("[data-account-link]").forEach((link) => { link.textContent = user ? "حساب من" : "ورود دانشجو"; });
    if ($("[data-auth-guest]")) $("[data-auth-guest]").hidden = !!user;
    if ($("[data-auth-member]")) $("[data-auth-member]").hidden = !user;
    if ($("[data-user-name]")) $("[data-user-name]").textContent = user?.user_metadata?.full_name || "دوست من";
    if ($("[data-user-email]")) $("[data-user-email]").textContent = user?.email || "";
    if ($("[data-cloud-buttons]")) $("[data-cloud-buttons]").hidden = !user;
    if ($("[data-cloud-login]")) $("[data-cloud-login]").hidden = !!user;
    if ($("[data-cloud-description]")) $("[data-cloud-description]").textContent = user
      ? "این پاسخ‌ها در حساب خودت ذخیره می‌شوند. برای ادامه روی دستگاه دیگر، نسخهٔ حساب را دریافت کن."
      : "برای نگه‌داشتن پاسخ‌ها در حساب شخصی، وارد شو. مطالعه و پیش‌نویس محلی به ورود نیاز ندارند.";
    document.dispatchEvent(new CustomEvent("class-notes-user", { detail: { userId: user?.id || null } }));
    if ($("[data-draft-import]")) $("[data-draft-import]").hidden = !user ||
      !Object.values(window.ClassNotesDrafts?.guestSnapshot() || {}).some(Boolean);
    if (changed) message(cloudStatus, "");
  }
  const returnKey = `class-notes-oauth-return:${base.pathname}`;
  let previousReturn = null;
  if (returnedFromGoogle || oauthError) {
    try { previousReturn = sessionStorage.getItem(returnKey); sessionStorage.removeItem(returnKey); } catch {}
  }
  const returnTo = safeCourseReturn(previousReturn || callbackURL.searchParams.get("next"), base);
  if ($("[data-continue]")) $("[data-continue]").href = returnTo;
  if ($("[data-cloud-login]")) {
    const link = new URL(accountURL);
    link.searchParams.set("next", location.href);
    $("[data-cloud-login]").href = link.href;
  }

  // No SDK or network authentication requests are made when setup is incomplete.
  try {
    const configURL = new URL("auth-config.json", assets);
    configURL.searchParams.set("v", script.dataset.configVersion);
    const response = await fetch(configURL, { cache: "no-cache", credentials: "same-origin" });
    if (!response.ok) throw new Error("Configuration unavailable");
    const config = await response.json();
    if (!validPublicConfig(config)) {
      message(status, "ورود دانشجو هنوز فعال نشده است. فعلاً می‌توانی جزوه‌ها را بدون ورود بخوانی.");
      message(cloudStatus, "ذخیره در حساب هنوز فعال نشده است؛ پیش‌نویس‌ها در همین مرورگر می‌مانند.");
      if ($("[data-cloud-login]")) $("[data-cloud-login]").hidden = true;
      return;
    }
    await new Promise((resolve, reject) => {
      const sdk = document.createElement("script");
      sdk.src = new URL("vendor/supabase/supabase.js", assets).href;
      sdk.onload = resolve;
      sdk.onerror = reject;
      document.head.append(sdk);
    });
    client = window.supabase.createClient(config.supabaseUrl, config.publishableKey, {
      auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true,
        autoRefreshToken: true, storageKey: `class-notes-auth:${base.pathname}` }
    });
    // Keep the callback synchronous: awaiting Auth APIs here can deadlock the SDK.
    client.auth.onAuthStateChange((_event, session) => { publishUser(session?.user || null); });
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    publishUser(data.session?.user || null);
    // Do not leave the one-use authorization code or raw provider error in the URL.
    if (returnedFromGoogle || oauthError) {
      const clean = new URL(location.href);
      ["code", "error", "error_code", "error_description"].forEach((key) => clean.searchParams.delete(key));
      history.replaceState(null, "", clean.href);
    }
    if (returnedFromGoogle && user && !oauthError) { location.replace(returnTo); return; }
    message(status, oauthError ? "ورود کامل نشد. دوباره تلاش کن؛ اگر خطا تکرار شد با مدرس در میان بگذار."
      : user ? "به حساب خودت وارد شده‌ای." : "", oauthError);
  } catch {
    message(status, "اتصال ورود برقرار نشد. اینترنت را بررسی کن و صفحه را دوباره بارگذاری کن.", true);
    message(cloudStatus, "اتصال حساب برقرار نشد؛ پیش‌نویس محلی در دسترس است.", true);
    return;
  }

  $("[data-google-signin]")?.addEventListener("click", async () => {
    if (busy) return;
    setBusy(true);
    message(status, "در حال رفتن به صفحهٔ Google…");
    try {
      try { sessionStorage.setItem(returnKey, returnTo); } catch {}
      const { error } = await client.auth.signInWithOAuth({ provider: "google", options: {
        redirectTo: accountURL.href, queryParams: { prompt: "select_account" }
      } });
      if (error) throw error;
    } catch {
      message(status, "ورود آغاز نشد. دوباره تلاش کن یا با مدرس در میان بگذار.", true);
      setBusy(false);
    }
  });
  $("[data-signout]")?.addEventListener("click", async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      publishUser(null);
      message(status, "از حساب در این مرورگر خارج شدی.");
    } catch { message(status, "خروج کامل نشد. دوباره تلاش کن.", true); }
    finally { setBusy(false); }
  });

  async function withCurrentAccount(action) {
    if (busy || !user) return;
    const stamp = generation;
    const id = user.id;
    setBusy(true);
    try { await action(id, () => generation === stamp && user?.id === id); }
    catch { if (stamp === generation) message(cloudStatus, "ارتباط با حساب کامل نشد. پاسخ‌های صفحه حفظ شده‌اند؛ دوباره تلاش کن.", true); }
    finally { setBusy(false); }
  }
  const lessonId = $("[data-cloud-tools]")?.dataset.lessonId;
  $("[data-draft-import]")?.addEventListener("click", () => {
    const drafts = window.ClassNotesDrafts;
    if (busy || !user || !drafts || drafts.owner() !== user.id) return;
    if (!window.confirm("پیش‌نویس بدون ورودِ همین مرورگر را خودت نوشته‌ای؟ آن را جایگزین پاسخ‌های فعلی کنیم؟")) return;
    try {
      drafts.apply(checkedAnswers(drafts.guestSnapshot(), drafts.ids()));
      message(cloudStatus, "پیش‌نویس در جدول قرار گرفت. برای فرستادن آن به حساب، دکمهٔ ذخیره را بزن.");
    } catch { message(cloudStatus, "پیش‌نویس قابل دریافت نیست؛ پاسخ‌های فعلی حفظ شدند.", true); }
  });
  $("[data-cloud-save]")?.addEventListener("click", () => withCurrentAccount(async (id, stillCurrent) => {
    const drafts = window.ClassNotesDrafts;
    if (!drafts || drafts.owner() !== id) return;
    const answers = checkedAnswers(drafts.snapshot(), drafts.ids());
    message(cloudStatus, "در حال ذخیرهٔ پاسخ‌ها…");
    const { error } = await client.from("class_notes_answers").upsert({ user_id: id, lesson_id: lessonId, answers },
      { onConflict: "user_id,lesson_id" });
    if (error) throw error;
    if (stillCurrent()) message(cloudStatus, "پاسخ‌ها در حسابت ذخیره شدند؛ نسخهٔ قبلیِ این درس به‌روزرسانی شد.");
  }));
  $("[data-cloud-load]")?.addEventListener("click", () => withCurrentAccount(async (id, stillCurrent) => {
    const drafts = window.ClassNotesDrafts;
    if (!drafts || drafts.owner() !== id) return;
    message(cloudStatus, "در حال دریافت پاسخ‌ها…");
    const { data, error } = await client.from("class_notes_answers").select("answers")
      .eq("user_id", id).eq("lesson_id", lessonId).maybeSingle();
    if (error) throw error;
    if (!stillCurrent()) return;
    if (!data) { message(cloudStatus, "هنوز پاسخی برای این درس در حسابت ذخیره نشده است."); return; }
    const answers = checkedAnswers(data.answers, drafts.ids());
    const current = drafts.snapshot();
    const differs = drafts.ids().some((key) => current[key] !== answers[key]);
    if (differs && Object.values(current).some(Boolean) && !window.confirm("پاسخ‌های فعلی صفحه با نسخهٔ ذخیره‌شده در حساب جایگزین شوند؟")) {
      message(cloudStatus, "پاسخ‌های فعلی حفظ شدند."); return;
    }
    if (!stillCurrent()) return;
    drafts.apply(answers);
    message(cloudStatus, "نسخهٔ ذخیره‌شدهٔ حساب در جدول قرار گرفت.");
  }));
})();
