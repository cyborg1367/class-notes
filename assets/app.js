"use strict";

// All calculations in this module use the independent worked example only.
// The teaching dataset is used solely to inspect rows and feature columns.
function exampleDistance(u, v) {
  const difference = u.map((value, i) => value - v[i]);
  const squared = difference.map((value) => value * value);
  const sum = squared.reduce((total, value) => total + value, 0);
  return { difference, squared, sum, distance: Math.sqrt(sum) };
}
function normalizeSearch(value) {
  return String(value).normalize("NFKC").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\u200c\u200e\u200f]/g, " ").toLocaleLowerCase("fa").replace(/\s+/g, " ").trim();
}
if (typeof module !== "undefined" && module.exports) module.exports = { exampleDistance, normalizeSearch };

if (typeof document !== "undefined") {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  let toastTimer;
  function toast(message) {
    const element = $("#toast");
    if (!element) return;
    element.textContent = message;
    element.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove("is-visible"), 2400);
  }

  const menu = $(".menu-toggle");
  const nav = $("#main-nav");
  menu?.addEventListener("click", () => {
    const expanded = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(expanded));
    menu.setAttribute("aria-label", expanded ? "بستن فهرست" : "باز کردن فهرست");
    nav?.classList.toggle("is-open", expanded);
  });
  $$("#main-nav a").forEach((link) => link.addEventListener("click", () => {
    nav?.classList.remove("is-open");
    menu?.setAttribute("aria-expanded", "false");
  }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      menu.setAttribute("aria-expanded", "false");
      menu.focus();
    }
  });

  const search = $("#course-search");
  function filterCourses() {
    const query = normalizeSearch(search.value);
    const cards = $$("[data-search]");
    let count = 0;
    cards.forEach((card) => {
      const match = query.split(" ").every((word) => normalizeSearch(card.dataset.search).includes(word));
      card.hidden = !match;
      if (match) count += 1;
    });
    $("#search-empty").hidden = count !== 0;
    $("#clear-search").hidden = query.length === 0;
    $("#search-status").textContent = `${count.toLocaleString("fa-IR")} کلاس پیدا شد`;
  }
  search?.addEventListener("input", filterCourses);
  $("#clear-search")?.addEventListener("click", () => { search.value = ""; filterCourses(); search.focus(); });

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(text); return true; } catch { /* Try selection fallback. */ }
    }
    const previousFocus = document.activeElement;
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch { copied = false; }
    field.remove();
    previousFocus?.focus();
    return copied;
  }
  $$(".copy-code").forEach((button) => button.addEventListener("click", async () => {
    const text = $("pre", button.closest(".code-block")).textContent;
    const copied = await copyText(text);
    if (copied) {
      button.textContent = "کپی شد ✓";
      toast("کد کپی شد.");
      setTimeout(() => { button.textContent = "کپی کد"; }, 1800);
    } else toast("کپی خودکار در دسترس نیست؛ متن کد را انتخاب و کپی کنید.");
  }));

  const datasetElement = $("#teaching-dataset");
  if (datasetElement) {
    try {
      const data = JSON.parse(datasetElement.textContent);
      const readout = $("#sample-readout");
      const clearRows = () => {
        $$("#teaching-table tr").forEach((row) => row.classList.remove("is-selected"));
        $$("[data-sample]").forEach((button) => button.setAttribute("aria-pressed", "false"));
      };
      function showVector(label, values, shape) {
        readout.replaceChildren();
        const text = document.createElement("strong");
        text.textContent = label;
        const vector = document.createElement("code");
        vector.textContent = `[${values.join(", ")}]   shape: ${shape}`;
        readout.append(text, vector);
      }
      $$("[data-sample]").forEach((button) => button.addEventListener("click", () => {
        clearRows();
        button.closest("tr").classList.add("is-selected");
        button.setAttribute("aria-pressed", "true");
        const index = data.names.indexOf(button.dataset.sample);
        showVector(`بردار نمونهٔ ${data.names[index]}؛ سه ویژگیِ یک دستگاه`, data.X[index], "(3,)");
      }));
      $$("[data-column]").forEach((button) => button.addEventListener("click", () => {
        clearRows();
        const column = Number(button.dataset.column);
        const names = ["قیمت", "RAM", "دوام باتری"];
        showVector(`بردارِ ${names[column]}؛ یک ویژگی در میان هشت نمونه`, data.X.map((row) => row[column]), "(8,)");
      }));
    } catch { /* The lesson itself remains readable if an optional readout cannot load. */ }
  }

  const ranges = [$("#v1"), $("#v2"), $("#v3")];
  function updateExample() {
    if (ranges.some((range) => !range)) return;
    const v = ranges.map((range) => Number(range.value));
    const result = exampleDistance([1, 2, 3], v);
    ranges.forEach((range, index) => {
      $(`#v${index + 1}-out`).textContent = range.value;
      range.setAttribute("aria-valuetext", range.value);
    });
    $("#demo-difference").textContent = `[${result.difference.join(", ")}]`;
    $("#demo-squared").textContent = `[${result.squared.join(", ")}]`;
    $("#demo-sum").textContent = String(result.sum);
    $("#demo-distance").textContent = result.distance.toFixed(2);
  }
  ranges.forEach((range) => range?.addEventListener("input", updateExample));
  $("#reset-example")?.addEventListener("click", () => { [4, 6, 3].forEach((value, i) => { ranges[i].value = String(value); }); updateExample(); });

  const answerFields = $$("[data-answer]");
  const answerPrefix = `class-notes:${location.pathname}:answer:`;
  answerFields.forEach((field) => {
    try { field.value = localStorage.getItem(answerPrefix + field.dataset.answer) || ""; }
    catch { $("#answer-note").textContent = "ذخیرهٔ محلی در این مرورگر در دسترس نیست؛ پاسخ‌ها را پیش از بستن صفحه کپی کنید."; }
    field.addEventListener("input", () => {
      try { localStorage.setItem(answerPrefix + field.dataset.answer, field.value); }
      catch { $("#answer-note").textContent = "پاسخ در این مرورگر ذخیره نشد؛ پیش از بستن صفحه آن را کپی کنید."; }
    });
  });

  const sections = $$(".lesson-section[id]");
  if (sections.length) {
    const railLinks = $$("[data-rail], .mobile-toc a");
    let scheduled = false;
    let active = "";
    function updateReading() {
      scheduled = false;
      const available = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      const progress = Math.max(0, Math.min(1, scrollY / available));
      const bar = $("#reading-progress");
      if (bar) bar.style.transform = `scaleX(${progress})`;
      if ($("#sidebar-progress")) $("#sidebar-progress").style.width = `${progress * 100}%`;
      if ($("#reading-label")) $("#reading-label").textContent = `${Math.round(progress * 100).toLocaleString("fa-IR")}٪ مطالعه شده`;
      let current = sections[0].id;
      sections.forEach((section) => { if (section.getBoundingClientRect().top < 190) current = section.id; });
      if (current !== active) {
        active = current;
        railLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${active}`;
          link.classList.toggle("is-current", isCurrent);
          if (isCurrent) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    }
    const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    addEventListener("load", schedule);
    updateReading();
  }
  $$("[data-tex]").forEach((element) => {
    if (element.querySelector(".katex") || !window.katex) return;
    try { window.katex.render(element.dataset.tex.replaceAll("\\symbf", "\\mathbf"), element, { displayMode: true, throwOnError: true }); }
    catch { element.textContent = element.dataset.tex; }
  });
}
