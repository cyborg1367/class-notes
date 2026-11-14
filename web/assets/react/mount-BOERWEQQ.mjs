import { a as e, i as t, n, r, t as i } from "./jsx-runtime-CMv_BHj2.mjs";
import { n as a } from "./order-CDcu1aqs.mjs";
// frontend/reader/lesson-presentation.ts
var o = /* @__PURE__ */ e(t(), 1), s = n(), c = {
	"machine-learning/vector-distance": [
		"هر سطر، بردار یک نمونه است.",
		"هر ویژگی، یک مؤلفهٔ معنادار است.",
		"فاصله، شباهت را عددی می‌کند."
	],
	"machine-learning/prediction-problem": [
		"نمونهٔ تازه را با داده‌های آموزش مقایسه می‌کنیم.",
		"نزدیک‌ترین همسایه‌ها در تصمیم رأی می‌دهند.",
		"تعداد همسایه‌ها روی پیش‌بینی اثر می‌گذارد."
	],
	"machine-learning/evaluating-knn": [
		"دادهٔ آزمون را از آموزش جدا می‌کنیم.",
		"پیش‌بینی را با برچسب واقعی می‌سنجیم.",
		"نوع خطاها را کنار تعدادشان می‌بینیم."
	],
	"machine-learning/thresholds-and-roc": [
		"همهٔ خطاها معنای یکسانی ندارند.",
		"تغییر آستانه، تصمیم‌های مدل را عوض می‌کند.",
		"دقت و بازیابی را کنار هم بررسی می‌کنیم."
	],
	"machine-learning/cross-validation": [
		"تنظیم‌ها را با چند تقسیم داده مقایسه می‌کنیم.",
		"آماده‌سازی داده همراه مدل ارزیابی می‌شود.",
		"آزمون نهایی تا پایان انتخاب کنار می‌ماند."
	]
};
function l(e, t) {
	let n = t.length === 3 ? [
		t[0],
		t[1],
		t[2]
	] : null, r = c[e] || n;
	if (!r) throw Error("LESSON_PRESENTATION_REQUIRES_THREE_HIGHLIGHTS: " + e);
	return r.map((e, t) => ({
		number: String(t + 1).padStart(2, "0"),
		label: e
	}));
}
// frontend/reader/content-model.ts
var u = (e) => Object.fromEntries(Array.from(e.attributes).filter((e) => e.name !== "style").map((e) => [e.name, e.value]));
function d(e) {
	return !!e && e.querySelectorAll("pre").length === 1 && Array.from(e.children).every((e) => e.matches(".code-head,pre"));
}
function f(e) {
	return Array.from(e).flatMap((e) => {
		if (e.nodeType === 3) return [{
			kind: "text",
			text: e.textContent || ""
		}];
		if (e.nodeType !== 1) return [];
		let t = e, n = t.localName;
		if (t.matches(".mini-lab,.knn-explorer,.space-view,.problem-role-lab,.katex,.lesson-formula,.interactive-distance,.consult-votes,[data-medical-knn],.table-card") || [
			"svg",
			"math",
			"script",
			"canvas",
			"input",
			"button",
			"select",
			"textarea"
		].includes(n)) {
			let e = u(t);
			return t.hasAttribute("style") && (e.style = t.getAttribute("style")), [{
				kind: "island",
				tag: n,
				attrs: e,
				html: t.innerHTML
			}];
		}
		if (t.matches(".code-block")) {
			let e = t.querySelectorAll("pre")[0];
			if (d(t)) {
				let n = e.querySelector("code") || e, r = n.className.match(/(?:language|lang)-([\w-]+)/)?.[1] || "";
				return [{
					kind: "code",
					attrs: u(t),
					pre: u(e),
					source: e.textContent || "",
					html: n.innerHTML,
					language: r,
					label: t.querySelector(".code-head > span")?.textContent || (r === "python" ? "Python" : "کد")
				}];
			}
		}
		if (t.matches(".code-block")) return [{
			kind: "island",
			tag: n,
			attrs: u(t),
			html: t.innerHTML
		}];
		if (t.matches(".reader-table-scroll")) {
			let e = t.querySelector(":scope > table");
			if (e && t.childElementCount === 1) return [{
				kind: "table",
				attrs: u(e),
				wrapper: u(t),
				children: f(e.childNodes)
			}];
		}
		return t.matches(".reader-table-scroll") ? [{
			kind: "island",
			tag: n,
			attrs: u(t),
			html: t.innerHTML
		}] : [{
			kind: "element",
			tag: n,
			attrs: u(t),
			children: f(t.childNodes)
		}];
	});
}
var p = { credit: "_credit_hr3l8_1" }, m = i(), h = "Masoud Ahangary";
function g() {
	return /* @__PURE__ */ (0, m.jsxs)("p", {
		className: "instructor-credit " + p.credit,
		lang: "en",
		dir: "ltr",
		"data-instructor-credit": "",
		children: [/* @__PURE__ */ (0, m.jsx)("span", { children: "Instructor" }), /* @__PURE__ */ (0, m.jsx)("strong", { children: h })]
	});
}
// web/assets/python-highlight.mjs
var _ = new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case".split(" ")), v = new Set("print len range int float bool str set dict list tuple sum min max abs all any enumerate zip sorted isinstance round".split(" "));
function y(e) {
	let t = (e) => e.replace(/[&<>"']/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	})[e]), n = [], r = 0;
	function i(i, a) {
		let o = t(e.slice(r, i));
		n.push(a ? `<span class="syn-${a}">${o}</span>` : o), r = i;
	}
	for (; r < e.length;) {
		let t = e.slice(r);
		if (e[r] === "#") {
			let t = e.indexOf("\n", r);
			i(t < 0 ? e.length : t, "comment");
			continue;
		}
		let n = /^(?:[rubf]{1,2})?("""|'''|"|')/i.exec(t);
		if (n) {
			let t = n[1], a = r + n[0].length;
			for (; a < e.length;) if (e[a] === "\\") a = Math.min(e.length, a + 2);
			else {
				if (e.startsWith(t, a)) {
					a += t.length;
					break;
				}
				if (t.length === 1 && (e[a] === "\n" || e[a] === "\r")) break;
				a++;
			}
			i(a, "string");
			continue;
		}
		let a = /^[A-Za-z_]\w*/.exec(t);
		if (a) {
			let t = a[0];
			i(r + t.length, _.has(t) ? t === "return" ? "return" : "keyword" : v.has(t) && e[r - 1] !== "." ? "builtin" : null);
			continue;
		}
		let o = /^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?[\d_]+)?)[jJ]?/.exec(t);
		o ? i(r + o[0].length, "number") : i(r + 1, null);
	}
	return n.join("");
}
// frontend/reader/reading-blocks.ts
function ee(e, t) {
	for (let n of e.querySelectorAll("pre")) {
		if (n.closest(".mini-lab,.knn-explorer,.space-view,.problem-role-lab,.katex,.lesson-formula,.interactive-distance,.consult-votes,[data-medical-knn],.table-card")) continue;
		let e = n.closest(".code-block");
		if (!e && !n.querySelector(":scope > code")) continue;
		e || (e = t.createElement("div"), e.className = "code-block", n.replaceWith(e), e.append(n));
		let r = e.querySelector(".code-head");
		if (!r) {
			r = t.createElement("div"), r.className = "code-head";
			let i = t.createElement("span"), a = n.querySelector("code")?.className.match(/(?:language|lang)-([\w-]+)/)?.[1];
			i.textContent = /^(?:python|py)$/i.test(a || "") ? "Python" : a || "کد", r.append(i), e.prepend(r);
		}
		if (!e.querySelector(".copy-code")) {
			let e = t.createElement("button");
			e.type = "button", e.className = "copy-code", e.textContent = "کپی کد", r.append(e);
		}
		n.classList.add("reader-code"), n.dir = "ltr", n.tabIndex = 0;
		let i = n.querySelector("code") || n, a = i.className.match(/(?:language|lang)-([\w-]+)/)?.[1]?.toLowerCase(), o = n.closest(".code-block")?.querySelector(".code-head")?.textContent || "", s = i.textContent || "";
		(a ? /^(?:python|py)$/.test(a) : /\bpython\b/i.test(o) || /^\s*(?:from \w|import \w|def \w|class \w|print\()/m.test(s)) && !i.children.length && (i.innerHTML = y(s));
	}
	for (let n of e.querySelectorAll("table")) {
		if (n.closest(".mini-lab,.knn-explorer,.space-view,.problem-role-lab,.katex,.lesson-formula,.interactive-distance,.consult-votes,[data-medical-knn],.table-card")) continue;
		n.classList.add("reader-table");
		let e = n.parentElement;
		e?.matches(".table-scroll,.threshold-table-scroll,.portal-table-scroll,.reader-table-scroll") || (e = t.createElement("div"), n.replaceWith(e), e.append(n)), e.classList.add("reader-table-scroll"), e.tabIndex = 0, e.setAttribute("role", "region"), !e.hasAttribute("aria-label") && !e.hasAttribute("aria-labelledby") && e.setAttribute("aria-label", n.caption?.textContent?.trim() || "جدول آموزشی؛ برای دیدن ستون‌ها به طرفین پیمایش کن");
		for (let e of n.querySelectorAll("thead th")) e.hasAttribute("scope") || e.setAttribute("scope", "col");
	}
}
// frontend/reader/lesson-model.ts
function b({ id: e, course: t }) {
	let n = a(t.lessons), r = n.findIndex(({ lesson: t }) => t.id === e);
	return {
		previous: r > 0 ? n[r - 1] : void 0,
		next: r >= 0 ? n[r + 1] : void 0
	};
}
var x = (e) => Array.isArray(e) && e.length === 2 && e.every((e) => typeof e == "number" && Number.isFinite(e) && e >= 0 && e <= 10);
function S(e) {
	if (!e) return null;
	try {
		let { X: t, y: n, names: r, query: i } = JSON.parse(e);
		return !Array.isArray(t) || t.length < 1 || t.length > 200 || !t.every(x) || !Array.isArray(n) || n.length !== t.length || !n.every((e) => e === 0 || e === 1) || !Array.isArray(r) || r.length !== t.length || !r.every((e) => typeof e == "string") || !x(i) ? null : {
			query: i,
			points: t.map(([e, t], i) => ({
				x: e,
				y: t,
				positive: n[i] === 1,
				label: r[i].slice(0, 40)
			}))
		};
	} catch {
		return null;
	}
}
// frontend/reader/paths.ts
var C = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
function w(e, t, n) {
	return typeof e != "string" || !e.startsWith(t + "/") ? !1 : e.split("/").every((e) => C.test(e) && e !== "." && e !== "..") && n.some((t) => e.toLowerCase().endsWith(t));
}
var T = [
	".svg",
	".png",
	".webp",
	".jpg",
	".jpeg",
	".gif",
	".avif"
], E = [
	".pdf",
	".ipynb",
	".csv",
	".tsv",
	".zip",
	".txt",
	".py",
	".json"
];
function D(e) {
	return /^machine-learning\/prediction\/medical-(space|k1-detail|k3(?:-detail)?)\.svg$/.test(e) ? e.replace("/prediction/", "/predictions/") : null;
}
function O(e, t, n, r = !1) {
	if (e.startsWith("#")) return r ? null : e;
	try {
		let i = new URL(e, t);
		if (i.username || i.password || !["http:", "https:"].includes(i.protocol)) return null;
		let a = decodeURIComponent(i.pathname);
		return /[\\\u0000-\u001f]/.test(a) || a.split("/").includes("..") ? null : i.origin === n.origin ? a.startsWith(n.pathname) && (!r || a.startsWith(new URL("assets/", n).pathname)) ? i.href : null : !r && i.protocol === "https:" ? i.href : null;
	} catch {
		return null;
	}
}
function k(e, t) {
	let n = new URL(t.location.href), r = new URL(t.baseURI);
	return n.origin === r.origin && n.pathname === r.pathname && n.search === r.search ? e : n.pathname + n.search + e;
}
// frontend/reader/prepare.ts
var te = "base,link,meta,style,iframe,frame,object,embed,foreignObject,animate,animateMotion,animateTransform,set,applet,template", A = /* @__PURE__ */ new Set([
	"srcdoc",
	"srcset",
	"ping",
	"action",
	"formaction",
	"background",
	"poster",
	"usemap",
	"codebase",
	"manifest"
]), ne = /^(?:style|fill|stroke|clip-path|mask|filter|cursor|marker(?:-start|-mid|-end)?)$/, j = (e) => (e.textContent || "").trim().replace(/\s+/g, " ");
function re(e, t, n, r) {
	e.content.querySelectorAll(te).forEach((e) => e.remove());
	for (let t of e.content.querySelectorAll("script")) (t.getAttribute("type") !== "application/json" || t.hasAttribute("src") || !/^[\w-]+$/.test(t.id)) && t.remove();
	for (let t of e.content.querySelectorAll("form")) t.replaceWith(...t.childNodes);
	for (let i of e.content.querySelectorAll("*")) if (i.localName.includes("-")) i.remove();
	else {
		for (let e of Array.from(i.attributes)) {
			let a = e.name.toLowerCase(), o = e.value.trim();
			if (a.startsWith("on") || a.startsWith("data-reader-") || a === "is" || A.has(a)) i.removeAttribute(e.name);
			else if (a === "data-private-path" && (!i.matches("img") || !w(o, t, T))) i.removeAttribute(e.name);
			else if (a === "data-private-download" && (!i.matches("a") || !w(o, t, E))) i.removeAttribute(e.name);
			else if (a === "src" || a === "href" || a === "xlink:href") {
				let t = a === "src" ? i.matches("img") && !i.hasAttribute("data-private-path") && O(o, n, r, !0) : i.matches("a") ? O(o, n, r) : o.startsWith("#") && o;
				t ? i.setAttribute(e.name, t) : i.removeAttribute(e.name);
			} else ne.test(a) && /url\s*\(|@import|expression\s*\(|\\|\/\*/i.test(o) && /url\s*\(|@import|expression\s*\(|\\|\/\*/i.test(o.replace(/url\(\s*#[\w.-]+\s*\)/gi, "")) && i.removeAttribute(e.name);
		}
		i.matches("a[target]") && i.setAttribute("rel", "noopener noreferrer");
	}
}
function M(e, t) {
	let n = /* @__PURE__ */ new Set();
	return Array.from(e.querySelectorAll("a[href^=\"#\"]")).flatMap((e) => {
		let r;
		try {
			r = decodeURIComponent(e.getAttribute("href").slice(1));
		} catch {
			return [];
		}
		if (!t.has(r) || n.has(r)) return [];
		n.add(r);
		let i = e.querySelector(".rail-num")?.textContent?.trim(), a = i ? j(e).slice(i.length).trim() : j(e);
		return a ? [{
			id: r,
			label: a,
			number: i
		}] : [];
	});
}
function N(e, t, n) {
	let r = Array.from(e.querySelectorAll(".portal-quiz-link [data-private-download], .lesson-resources [data-private-download], .notebook-download [data-private-download]"), (e) => ({
		path: e.dataset.privateDownload,
		label: j(e)
	})), i = (e) => r.find((t) => t.path.toLowerCase().endsWith(e))?.path, a = i(".pdf") || (w(t.pdf_path, n.course.id, [".pdf"]) ? t.pdf_path : null) || e.querySelector(".lesson-rail [data-private-download$=\".pdf\"]")?.dataset.privateDownload || null, o = n.notebook ? n.course.id + "/" + n.notebook : null, s = i(".ipynb") || (w(o, n.course.id, [".ipynb"]) ? o : null), c = e.querySelector(".portal-quiz-link .small-note,.lesson-resources .small-note"), l = e.querySelector(".portal-quiz-link[id],.lesson-resources[id]")?.id || "resources", u = new Set(Array.from(e.querySelectorAll("[id]")).filter((e) => !e.closest(".portal-quiz-link,.lesson-resources")).map((e) => e.id));
	for (let e = 1; u.has(l); e++) l = "reader-resources-" + e;
	return {
		id: l,
		pdf: a,
		notebook: s,
		note: c ? j(c) : "",
		extras: r.filter((e, t) => !/\.(pdf|ipynb)$/i.test(e.path) && r.findIndex((t) => t.path === e.path) === t)
	};
}
function P(e, t) {
	let n = j(e).replace(/[\u200c-\u200f\u2066-\u2069]/g, " ").replace(/\s+/g, " ");
	if (/^(?:(?:شروع|آغاز) (?:مطالعه|خواندن)|(?:مطالعه|خواندن)[ٔ\s]+(?:یادداشت|درس))/.test(n)) return !0;
	if (!e.matches("a[href]") || !e.closest(".hero-actions") && !e.matches(".button-primary,.button-forest")) return !1;
	let r = (e) => e.origin + e.pathname.replace(/\/index\.html$/, "/").replace(/\/+$/, "");
	try {
		let n = new URL(e.getAttribute("href") || "", t.location.href);
		return !!n.hash && [r(new URL(t.location.href)), r(new URL(t.baseURI))].includes(r(n));
	} catch {
		return !1;
	}
}
function ie(e, t, n, r) {
	let i = e?.querySelector(".hero-copy"), a = i || e?.cloneNode(!0);
	i || a?.querySelectorAll(".hero-figure,.hero-strip").forEach((e) => e.remove());
	let o = a?.querySelector(":scope > .eyebrow"), s = o?.innerHTML || "";
	o?.remove();
	let c = a?.querySelector("h1");
	c?.querySelectorAll("br").forEach((e) => e.replaceWith(r.createTextNode(" ")));
	let u = c?.innerHTML.trim() || "";
	c?.remove(), a?.querySelectorAll(".instructor-credit").forEach((e) => e.remove());
	let d = a?.querySelector(".hero-meta"), f = (d ? j(d).replace(/[\u200e\u200f\u2066-\u2069]/g, "").replace(/^Instructor[\s|:·—–-]*/i, "").trim() : "") === "Masoud Ahangary" ? "" : d?.innerHTML || "";
	d?.remove();
	for (let e of a?.querySelectorAll("a,button") ?? []) {
		if (!P(e, r)) continue;
		let t = e.parentElement;
		e.remove(), t && t !== a && t.matches("p") && !t.children.length && !j(t) && t.remove();
	}
	let p = a?.querySelector(".hero-actions");
	p && !p.children.length && !j(p) && p.remove();
	let m = e?.querySelector(".hero-figure"), h = Array.from(e?.querySelectorAll(".hero-strip .strip-text") ?? [], (e) => j(e)), g = l(n.id, h), _ = !m && n.hero_kind === "binary2d" ? S(t.querySelector("#medical-knn-data")?.textContent) : null, v = n.hero_kind === "threshold-scores" ? { kind: "threshold-scores" } : m ? {
		kind: "authored",
		html: m.innerHTML,
		className: m.className
	} : _ ? {
		kind: "binary",
		plot: _
	} : null;
	return {
		eyebrow: s,
		titleHTML: u,
		copy: a?.innerHTML || "",
		meta: f,
		highlights: g,
		visual: v
	};
}
function ae(e, t, n, r) {
	if (typeof t.body != "string" || !t.body.trim()) throw Error("LESSON_BODY_UNAVAILABLE");
	let i = e.createElement("template");
	i.innerHTML = t.body;
	let a = i.content;
	re(i, n.course.id, new URL(e.baseURI), new URL(r(""))), a.querySelectorAll(".breadcrumb, #exercise, [data-python-lab], .python-lab, [data-cloud-tools]").forEach((e) => e.remove()), a.querySelectorAll("a[href=\"#exercise\"]").forEach((e) => (e.closest("li") || e).remove());
	let o = a.querySelector(".lesson-hero"), s = a.querySelector(".lesson-rail"), c = a.querySelector(".lesson-body"), l = new Map(Array.from(a.querySelectorAll("[id]"), (e) => [e.id, e])), u = new Set(l.keys()), p = s?.querySelector(".rail-list"), m = a.querySelector(".mobile-toc"), h = N(a, t, n), g = s?.querySelector(".rail-fact")?.innerHTML || "", _ = ".adjacent-lessons,.portal-quiz-link,.lesson-resources,.lesson-footer,.notebook-download", v = p ? M(p, u) : [];
	!v.length && m && (v = M(m, u)), v = v.filter(({ id: e }) => !l.get(e)?.closest(_));
	let y = [], b = (e, t) => {
		let n = String(y.length);
		return e.setAttribute("data-reader-slot", n), y.push({
			...t,
			key: n
		}), e;
	};
	ee(c || a, e);
	for (let t of a.querySelectorAll(".copy-code")) {
		if (d(t.closest(".code-block"))) continue;
		let n = l.get(t.dataset.copyCode || "") || t.closest(".code-block")?.querySelector("pre");
		n?.textContent && t.replaceWith(b(e.createElement("span"), {
			kind: "copy",
			label: t.getAttribute("aria-label") || "کپی کد",
			text: n.textContent
		}));
	}
	for (let t of a.querySelectorAll("[data-private-download]")) t.closest(".lesson-rail," + _) || t.replaceWith(b(e.createElement("span"), {
		kind: "download",
		label: j(t),
		path: t.dataset.privateDownload,
		className: t.className
	}));
	for (let t of a.querySelectorAll("a[href^=\"#\"]")) t.setAttribute("href", k(t.getAttribute("href"), e));
	let x = ie(o, a, n, e);
	a.querySelectorAll(_ + ",.mobile-toc,#reading-progress").forEach((e) => e.remove()), s?.remove(), o?.remove();
	let S = c || a;
	if (c) for (let e of a.querySelectorAll("script[type=\"application/json\"]")) c.contains(e) || c.append(e);
	let C = new Set(Array.from(S.querySelectorAll("[id]"), (e) => e.id));
	v = v.filter(({ id: e }) => C.has(e)), v.length || (v = Array.from(S.querySelectorAll(".lesson-section[id]")).flatMap((e) => {
		let t = e.querySelector("h2,h3");
		return t && j(t) ? [{
			id: e.id,
			label: j(t)
		}] : [];
	})), (h.pdf || h.notebook || h.extras.length || n.quiz_version) && v.push({
		id: h.id,
		label: "منابع و تمرین"
	});
	let w = v.map((e, t) => ({
		...e,
		number: String(t + 1).padStart(2, "0")
	}));
	return {
		hero: x,
		document: f(S.childNodes),
		fact: g,
		slots: y,
		headings: w,
		resources: h
	};
}
// frontend/reader/ReaderControls.module.css
var oe = r(), F = { copy: "_copy_uvwox_1" };
// frontend/reader/ReaderControls.tsx
function I({ headings: e, active: t, rail: n, doc: r }) {
	return /* @__PURE__ */ (0, m.jsx)(m.Fragment, { children: e.map(({ id: e, label: i, number: a }) => {
		let s = /* @__PURE__ */ (0, m.jsxs)("a", {
			href: k("#" + encodeURIComponent(e), r),
			"aria-current": t === e ? "location" : void 0,
			className: t === e ? "is-current" : void 0,
			children: [n && a && /* @__PURE__ */ (0, m.jsx)("span", {
				className: "rail-num",
				"aria-hidden": "true",
				children: a
			}), /* @__PURE__ */ (0, m.jsx)("span", { children: i })]
		});
		return n ? /* @__PURE__ */ (0, m.jsx)("li", { children: s }, e) : /* @__PURE__ */ (0, m.jsx)(o.Fragment, { children: s }, e);
	}) });
}
function L({ label: e, text: t }) {
	let [n, r] = (0, o.useState)("idle"), i = (0, o.useRef)(0);
	return (0, o.useEffect)(() => () => {
		i.current++;
	}, []), (0, o.useEffect)(() => {
		if (n !== "copied") return;
		let e = setTimeout(() => r("idle"), 1500);
		return () => clearTimeout(e);
	}, [n]), /* @__PURE__ */ (0, m.jsx)("button", {
		type: "button",
		className: "reader-copy " + F.copy,
		"aria-label": n === "idle" ? e : void 0,
		disabled: n === "copying",
		onClick: async (e) => {
			let n = e.currentTarget.ownerDocument.defaultView?.navigator.clipboard, a = ++i.current;
			r("copying");
			try {
				if (!n) throw Error("CLIPBOARD_UNAVAILABLE");
				await n.writeText(t), a === i.current && r("copied");
			} catch {
				a === i.current && r("failed");
			}
		},
		children: n === "copied" ? "کپی شد" : n === "failed" ? "کد را انتخاب و کپی کن" : n === "copying" ? "در حال کپی…" : "کپی کد"
	});
}
function R({ path: e, label: t, className: n, files: r, preview: i }) {
	let [a, s] = (0, o.useState)("idle"), c = (0, o.useRef)(!1);
	return /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [/* @__PURE__ */ (0, m.jsx)("button", {
		className: n,
		type: "button",
		"data-reader-download": "",
		disabled: a === "busy" || i,
		onClick: async (t) => {
			if (c.current) return;
			let n = t.currentTarget.ownerDocument;
			c.current = !0, s("busy");
			try {
				let t = await r.load(e);
				if (!r.alive()) return;
				let i = n.createElement("a");
				i.href = t, i.download = e.split("/").pop() || "lesson", n.body.append(i), i.click(), i.remove(), s("idle");
			} catch {
				r.alive() && s("error");
			} finally {
				c.current = !1;
			}
		},
		children: a === "busy" ? "در حال دریافت…" : t
	}), a === "error" && /* @__PURE__ */ (0, m.jsx)("small", {
		className: "reader-resource-error",
		role: "status",
		children: "فایل دریافت نشد. دوباره تلاش کن."
	})] });
}
var z = {
	strip: "_strip_ml6ud_1",
	number: "_number_ml6ud_12"
};
// frontend/reader/LessonHighlights.tsx
function se({ items: e }) {
	return /* @__PURE__ */ (0, m.jsx)("div", {
		className: "shell",
		children: /* @__PURE__ */ (0, m.jsx)("ol", {
			className: "hero-strip " + z.strip,
			"aria-label": "سه نکتهٔ اصلی یادداشت",
			"data-lesson-highlights": "",
			children: e.map(({ number: e, label: t }) => /* @__PURE__ */ (0, m.jsxs)("li", { children: [/* @__PURE__ */ (0, m.jsx)("span", {
				className: "strip-number " + z.number,
				dir: "ltr",
				"aria-hidden": "true",
				children: e
			}), /* @__PURE__ */ (0, m.jsx)("span", {
				className: "strip-text",
				children: t
			})] }, e))
		})
	});
}
var B = {
	hero: "_hero_h1ws5_1",
	grid: "_grid_h1ws5_2",
	single: "_single_h1ws5_7",
	copy: "_copy_h1ws5_8",
	title: "_title_h1ws5_9",
	text: "_text_h1ws5_13",
	figure: "_figure_h1ws5_17"
}, V = [
	{
		value: .1,
		positive: !1
	},
	{
		value: .28,
		positive: !0
	},
	{
		value: .36,
		positive: !1
	},
	{
		value: .52,
		positive: !1
	},
	{
		value: .62,
		positive: !0
	},
	{
		value: .76,
		positive: !1
	},
	{
		value: .86,
		positive: !0
	},
	{
		value: .92,
		positive: !0
	}
], H = [{
	value: .4,
	tone: "lower",
	dash: "5 4"
}, {
	value: .7,
	tone: "higher",
	dash: "2 4"
}], U = (e) => 60 + 350 * e, W = [
	0,
	.25,
	.5,
	.75,
	1
], G = V.filter((e) => e.positive).length, K = (e) => {
	let t = V.filter((t) => t.value >= e), n = t.filter((e) => e.positive).length;
	return {
		precision: n / t.length,
		recall: n / G
	};
};
function ce() {
	return /* @__PURE__ */ (0, m.jsxs)("figure", {
		className: "hero-figure reader-threshold-figure",
		"data-threshold-hero": "",
		children: [
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "reader-threshold-heading",
				children: [/* @__PURE__ */ (0, m.jsx)("strong", { children: "یک مدل، دو آستانه" }), /* @__PURE__ */ (0, m.jsx)("span", { children: "دادهٔ ساختگی" })]
			}),
			/* @__PURE__ */ (0, m.jsxs)("svg", {
				className: "reader-threshold-chart",
				viewBox: "0 0 432 173",
				role: "img",
				"aria-label": "امتیاز هشت نمونه با دو آستانهٔ ۰٫۴۰ و ۰٫۷۰؛ لوزی‌ها نمونه‌های مثبت و مربع‌ها نمونه‌های منفی‌اند.",
				children: [
					/* @__PURE__ */ (0, m.jsxs)("g", {
						className: "reader-threshold-grid",
						children: [W.map((e) => /* @__PURE__ */ (0, m.jsx)("line", {
							x1: U(e),
							x2: U(e),
							y1: "31",
							y2: "131"
						}, e)), /* @__PURE__ */ (0, m.jsx)("path", { d: "M60 59H410M60 103H410" })]
					}),
					/* @__PURE__ */ (0, m.jsxs)("g", {
						className: "reader-threshold-axis",
						textAnchor: "middle",
						children: [
							/* @__PURE__ */ (0, m.jsx)("path", { d: "M60 131H410" }),
							W.map((e) => /* @__PURE__ */ (0, m.jsx)("text", {
								x: U(e),
								y: "148",
								children: e
							}, e)),
							/* @__PURE__ */ (0, m.jsx)("text", {
								x: "235",
								y: "164",
								children: "Model score"
							})
						]
					}),
					/* @__PURE__ */ (0, m.jsxs)("g", {
						className: "reader-threshold-axis",
						textAnchor: "end",
						children: [/* @__PURE__ */ (0, m.jsx)("text", {
							x: "54",
							y: "63",
							children: "Positive"
						}), /* @__PURE__ */ (0, m.jsx)("text", {
							x: "54",
							y: "107",
							children: "Negative"
						})]
					}),
					H.map(({ value: e, tone: t, dash: n }) => /* @__PURE__ */ (0, m.jsxs)("g", {
						className: "reader-threshold-" + t,
						"data-threshold": e,
						children: [/* @__PURE__ */ (0, m.jsx)("line", {
							x1: U(e),
							x2: U(e),
							y1: "30",
							y2: "131",
							strokeDasharray: n
						}), /* @__PURE__ */ (0, m.jsx)("text", {
							x: U(e),
							y: "20",
							textAnchor: "middle",
							children: e.toFixed(2)
						})]
					}, e)),
					V.map(({ value: e, positive: t }) => t ? /* @__PURE__ */ (0, m.jsx)("path", {
						className: "reader-threshold-positive",
						"data-score": e,
						d: `M${U(e)} 52l7 7-7 7-7-7z`
					}, e) : /* @__PURE__ */ (0, m.jsx)("rect", {
						className: "reader-threshold-negative",
						"data-score": e,
						x: U(e) - 5.5,
						y: "97.5",
						width: "11",
						height: "11",
						rx: "1"
					}, e))
				]
			}),
			/* @__PURE__ */ (0, m.jsx)("div", {
				className: "reader-threshold-results",
				dir: "ltr",
				children: H.map(({ value: e, tone: t }) => {
					let { precision: n, recall: r } = K(e);
					return /* @__PURE__ */ (0, m.jsxs)("div", {
						className: "reader-threshold-result reader-threshold-" + t,
						"data-threshold-result": e,
						children: [/* @__PURE__ */ (0, m.jsxs)("span", {
							className: "reader-threshold-cut",
							lang: "en",
							children: ["Threshold ", e.toFixed(2)]
						}), /* @__PURE__ */ (0, m.jsxs)("dl", {
							lang: "en",
							children: [/* @__PURE__ */ (0, m.jsxs)("div", { children: [/* @__PURE__ */ (0, m.jsx)("dt", { children: "Precision" }), /* @__PURE__ */ (0, m.jsx)("dd", { children: n.toFixed(2) })] }), /* @__PURE__ */ (0, m.jsxs)("div", { children: [/* @__PURE__ */ (0, m.jsx)("dt", { children: "Recall" }), /* @__PURE__ */ (0, m.jsx)("dd", { children: r.toFixed(2) })] })]
						})]
					}, e);
				})
			}),
			/* @__PURE__ */ (0, m.jsxs)("figcaption", { children: [
				"لوزی و مربع، کلاس واقعی نمونه را نشان می‌دهند. امتیازها ثابت‌اند. با آستانهٔ بالاتر، در این مثال ",
				/* @__PURE__ */ (0, m.jsx)("bdi", {
					lang: "en",
					children: "Precision"
				}),
				" بیشتر و ",
				/* @__PURE__ */ (0, m.jsx)("bdi", {
					lang: "en",
					children: "Recall"
				}),
				" کمتر می‌شود."
			] })
		]
	});
}
// frontend/reader/LessonHero.tsx
function le({ plot: e }) {
	let [t, n] = [64 + 37.6 * e.query[0], 426 - 37.6 * e.query[1]];
	return /* @__PURE__ */ (0, m.jsxs)("figure", {
		className: "hero-figure binary-hero " + B.figure,
		children: [
			/* @__PURE__ */ (0, m.jsxs)("svg", {
				viewBox: "0 0 540 510",
				role: "img",
				"aria-label": "نمونه‌های ساختگی در فضای دو ویژگی؛ دایره کلاس صفر، مربع کلاس یک و لوزی پرس‌وجو است.",
				children: [
					[
						0,
						2,
						4,
						6,
						8,
						10
					].map((e) => {
						let t = 64 + 37.6 * e, n = 426 - 37.6 * e;
						return /* @__PURE__ */ (0, m.jsxs)("g", { children: [/* @__PURE__ */ (0, m.jsx)("path", {
							d: `M${t} 50V426M64 ${n}H440`,
							stroke: "#b9b7a1",
							strokeOpacity: ".45"
						}), /* @__PURE__ */ (0, m.jsxs)("g", {
							fill: "#585e4e",
							fontSize: "16",
							children: [/* @__PURE__ */ (0, m.jsx)("text", {
								x: t,
								y: "453",
								textAnchor: "middle",
								children: e
							}), /* @__PURE__ */ (0, m.jsx)("text", {
								x: "48",
								y: n + 5,
								textAnchor: "end",
								children: e
							})]
						})] }, e);
					}),
					/* @__PURE__ */ (0, m.jsx)("path", {
						d: "M64 40V426H452m-394-375 6-11 6 11m371 369 11 6-11 6",
						fill: "none",
						stroke: "#24241f",
						strokeWidth: "1.8"
					}),
					/* @__PURE__ */ (0, m.jsxs)("g", {
						fill: "#24241f",
						fontSize: "19",
						children: [/* @__PURE__ */ (0, m.jsx)("text", {
							x: "252",
							y: "489",
							textAnchor: "middle",
							children: "M1"
						}), /* @__PURE__ */ (0, m.jsx)("text", {
							x: "20",
							y: "238",
							transform: "rotate(-90 20 238)",
							textAnchor: "middle",
							children: "M2"
						})]
					}),
					e.points.map(({ x: e, y: t, positive: n, label: r }, i) => {
						let a = 64 + 37.6 * e, o = 426 - 37.6 * t, [s, c] = i === 4 ? [-33, -12] : i === 5 ? [13, 27] : [12, -11], l = /* @__PURE__ */ (0, m.jsxs)("title", { children: [
							r,
							": M1 = ",
							e,
							", M2 = ",
							t,
							", class ",
							+!!n
						] });
						return /* @__PURE__ */ (0, m.jsxs)("g", { children: [n ? /* @__PURE__ */ (0, m.jsx)("rect", {
							"data-hero-class": "1",
							x: a - 7,
							y: o - 7,
							width: "14",
							height: "14",
							fill: "#a35236",
							stroke: "#24241f",
							children: l
						}) : /* @__PURE__ */ (0, m.jsx)("circle", {
							"data-hero-class": "0",
							cx: a,
							cy: o,
							r: "7",
							fill: "#21665d",
							stroke: "#24241f",
							children: l
						}), /* @__PURE__ */ (0, m.jsx)("text", {
							x: a + s,
							y: o + c,
							fill: "#3e4438",
							fontSize: "16",
							children: r
						})] }, i);
					}),
					/* @__PURE__ */ (0, m.jsx)("path", {
						"data-hero-query": "",
						d: `m${t} ${n - 10} 10 10-10 10-10-10z`,
						fill: "#f4d835",
						stroke: "#24241f",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ (0, m.jsx)("text", {
						x: t + 18,
						y: n + 3,
						fill: "#24241f",
						fontSize: "19",
						fontWeight: "700",
						children: "q"
					})
				]
			}),
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "binary-hero-legend",
				children: [
					/* @__PURE__ */ (0, m.jsxs)("span", { children: [
						/* @__PURE__ */ (0, m.jsx)("svg", {
							viewBox: "0 0 20 20",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, m.jsx)("circle", {
								cx: "10",
								cy: "10",
								r: "6",
								fill: "#21665d",
								stroke: "#24241f"
							})
						}),
						"کلاس ",
						/* @__PURE__ */ (0, m.jsx)("bdi", { children: "0" })
					] }),
					/* @__PURE__ */ (0, m.jsxs)("span", { children: [
						/* @__PURE__ */ (0, m.jsx)("svg", {
							viewBox: "0 0 20 20",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, m.jsx)("rect", {
								x: "4",
								y: "4",
								width: "12",
								height: "12",
								fill: "#a35236",
								stroke: "#24241f"
							})
						}),
						"کلاس ",
						/* @__PURE__ */ (0, m.jsx)("bdi", { children: "1" })
					] }),
					/* @__PURE__ */ (0, m.jsxs)("span", { children: [
						/* @__PURE__ */ (0, m.jsx)("svg", {
							viewBox: "0 0 20 20",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, m.jsx)("path", {
								d: "m10 2 8 8-8 8-8-8z",
								fill: "#f4d835",
								stroke: "#24241f"
							})
						}),
						"پرس‌وجوی ",
						/* @__PURE__ */ (0, m.jsx)("bdi", { children: "q" })
					] })
				]
			}),
			/* @__PURE__ */ (0, m.jsxs)("p", {
				className: "binary-hero-axes",
				children: [
					/* @__PURE__ */ (0, m.jsx)("bdi", { children: "M1" }),
					": امتیاز تنفسی · ",
					/* @__PURE__ */ (0, m.jsx)("bdi", { children: "M2" }),
					": امتیاز خستگی"
				]
			}),
			/* @__PURE__ */ (0, m.jsxs)("figcaption", { children: [
				"پرونده‌ها و امتیازها کاملاً ساختگی‌اند؛ کلاسِ ",
				/* @__PURE__ */ (0, m.jsx)("bdi", { children: "q" }),
				" هنوز مشخص نیست."
			] })
		]
	});
}
var ue = (0, o.memo)(function({ hero: e, title: t, start: n }) {
	let { visual: r } = e;
	return /* @__PURE__ */ (0, m.jsxs)("section", {
		className: "hero lesson-hero " + B.hero,
		id: "top",
		"data-lesson-hero": "",
		children: [/* @__PURE__ */ (0, m.jsxs)("div", {
			className: "shell hero-grid " + B.grid + (r ? "" : " hero-grid--single " + B.single),
			children: [
				/* @__PURE__ */ (0, m.jsxs)("div", {
					className: "hero-copy " + B.copy,
					children: [
						e.eyebrow && /* @__PURE__ */ (0, m.jsx)("p", {
							className: "eyebrow",
							dangerouslySetInnerHTML: { __html: e.eyebrow }
						}),
						e.titleHTML ? /* @__PURE__ */ (0, m.jsx)("h1", {
							className: "reader-hero-title " + B.title,
							dangerouslySetInnerHTML: { __html: e.titleHTML }
						}) : /* @__PURE__ */ (0, m.jsx)("h1", {
							className: "reader-hero-title " + B.title,
							children: t
						}),
						e.copy && /* @__PURE__ */ (0, m.jsx)("div", {
							className: "reader-hero-text " + B.text,
							dangerouslySetInnerHTML: { __html: e.copy }
						}),
						/* @__PURE__ */ (0, m.jsx)(g, {}),
						(n || e.meta) && /* @__PURE__ */ (0, m.jsxs)("div", {
							className: "hero-actions",
							children: [n && /* @__PURE__ */ (0, m.jsxs)("a", {
								className: "button-primary",
								"data-lesson-start": "",
								href: n,
								children: ["شروع مطالعه ", /* @__PURE__ */ (0, m.jsx)("span", {
									"aria-hidden": "true",
									children: "←"
								})]
							}), e.meta && /* @__PURE__ */ (0, m.jsx)("p", {
								className: "hero-meta",
								dangerouslySetInnerHTML: { __html: e.meta }
							})]
						})
					]
				}),
				r?.kind === "binary" && /* @__PURE__ */ (0, m.jsx)(le, { plot: r.plot }),
				r?.kind === "authored" && /* @__PURE__ */ (0, m.jsx)("figure", {
					className: r.className + " " + B.figure,
					dangerouslySetInnerHTML: { __html: r.html }
				}),
				r?.kind === "threshold-scores" && /* @__PURE__ */ (0, m.jsx)(ce, {})
			]
		}), /* @__PURE__ */ (0, m.jsx)(se, { items: e.highlights })]
	});
}), q = {
	frame: "_frame_1m96f_11",
	body: "_body_1m96f_17"
};
// frontend/reader/LessonLayout.tsx
function de({ sidebar: e, children: t }) {
	return /* @__PURE__ */ (0, m.jsxs)("div", {
		className: "shell lesson-shell " + q.frame,
		"data-lesson-layout": "",
		children: [e, /* @__PURE__ */ (0, m.jsx)("article", {
			className: "lesson-body " + q.body,
			children: t
		})]
	});
}
var J = {
	document: "_document_q6r5b_1",
	prose: "_prose_q6r5b_2",
	paragraph: "_paragraph_q6r5b_3",
	section: "_section_q6r5b_4",
	heading: "_heading_q6r5b_5",
	code: "_code_q6r5b_10",
	codeHead: "_codeHead_q6r5b_11",
	codeViewport: "_codeViewport_q6r5b_12",
	tableViewport: "_tableViewport_q6r5b_23",
	table: "_table_q6r5b_23",
	figure: "_figure_q6r5b_31",
	callout: "_callout_q6r5b_34",
	list: "_list_q6r5b_43"
};
// frontend/reader/LessonContent.tsx
function Y(e) {
	let t = {}, n = {
		class: "className",
		for: "htmlFor",
		tabindex: "tabIndex",
		colspan: "colSpan",
		rowspan: "rowSpan",
		readonly: "readOnly",
		maxlength: "maxLength",
		datetime: "dateTime"
	};
	for (let [r, i] of Object.entries(e)) if (!/^on/i.test(r)) {
		if (r === "style") {
			let e = {};
			for (let t of i.split(";")) {
				let n = t.indexOf(":");
				if (n < 0) continue;
				let r = t.slice(0, n).trim(), i = r.startsWith("--") ? r : r.replace(/-([a-z])/g, (e, t) => t.toUpperCase());
				i && (e[i] = t.slice(n + 1).trim());
			}
			t.style = e;
		} else [
			"hidden",
			"disabled",
			"required",
			"multiple",
			"open",
			"controls",
			"loop",
			"muted"
		].includes(r) ? t[r] = !0 : r === "checked" ? t.defaultChecked = !0 : t[n[r] || r] = i;
	}
	return t;
}
var X = (e, t) => [e, t].filter(Boolean).join(" ");
function fe({ block: e }) {
	return /* @__PURE__ */ (0, m.jsxs)("div", {
		...Y(e.attrs),
		className: X(e.attrs.class, J.code),
		"data-lesson-block": "code",
		children: [/* @__PURE__ */ (0, m.jsxs)("div", {
			className: "code-head " + J.codeHead,
			children: [/* @__PURE__ */ (0, m.jsx)("span", {
				dir: "ltr",
				children: e.label
			}), /* @__PURE__ */ (0, m.jsx)(L, {
				label: "کپی کد",
				text: e.source
			})]
		}), /* @__PURE__ */ (0, m.jsx)("pre", {
			...Y(e.pre),
			className: X(e.pre.class, J.codeViewport),
			dir: "ltr",
			tabIndex: 0,
			children: /* @__PURE__ */ (0, m.jsx)("code", {
				className: e.language ? "language-" + e.language : void 0,
				dangerouslySetInnerHTML: { __html: e.html }
			})
		})]
	});
}
function pe({ block: e }) {
	return /* @__PURE__ */ (0, m.jsx)("div", {
		...Y(e.wrapper),
		className: X(e.wrapper.class, J.tableViewport),
		"data-lesson-block": "table",
		children: /* @__PURE__ */ (0, m.jsx)("table", {
			...Y(e.attrs),
			className: X(e.attrs.class, J.table),
			children: /* @__PURE__ */ (0, m.jsx)(Z, { nodes: e.children })
		})
	});
}
function me({ block: e }) {
	return /* @__PURE__ */ (0, m.jsx)("section", {
		...Y(e.attrs),
		className: X(e.attrs.class, J.section),
		"data-lesson-block": "section",
		children: /* @__PURE__ */ (0, m.jsx)(Z, { nodes: e.children })
	});
}
function he({ block: e }) {
	return /* @__PURE__ */ (0, m.jsx)("p", {
		...Y(e.attrs),
		className: X(e.attrs.class, J.paragraph),
		children: /* @__PURE__ */ (0, m.jsx)(Z, { nodes: e.children })
	});
}
function ge({ block: e }) {
	return /* @__PURE__ */ (0, m.jsx)("figure", {
		...Y(e.attrs),
		className: X(e.attrs.class, J.figure),
		"data-lesson-block": "figure",
		children: /* @__PURE__ */ (0, m.jsx)(Z, { nodes: e.children })
	});
}
function _e({ block: e }) {
	return (0, o.createElement)(e.tag, {
		...Y(e.attrs),
		className: X(e.attrs.class, J.heading)
	}, /* @__PURE__ */ (0, m.jsx)(Z, { nodes: e.children }));
}
function ve({ block: e }) {
	return (0, o.createElement)(e.tag, {
		...Y(e.attrs),
		className: X(e.attrs.class, J.list)
	}, /* @__PURE__ */ (0, m.jsx)(Z, { nodes: e.children }));
}
function ye({ block: e }) {
	return (0, o.createElement)(e.tag, {
		...Y(e.attrs),
		className: X(e.attrs.class, J.callout),
		"data-lesson-block": "callout"
	}, /* @__PURE__ */ (0, m.jsx)(Z, { nodes: e.children }));
}
function be({ block: e }) {
	return (0, o.createElement)(e.tag, {
		...Y(e.attrs),
		"data-lesson-island": "",
		...["input"].includes(e.tag) ? {} : { dangerouslySetInnerHTML: { __html: e.html } }
	});
}
function xe({ node: e }) {
	if (e.kind === "text") return e.text;
	if (e.kind === "code") return /* @__PURE__ */ (0, m.jsx)(fe, { block: e });
	if (e.kind === "table") return /* @__PURE__ */ (0, m.jsx)(pe, { block: e });
	if (e.kind === "island") return /* @__PURE__ */ (0, m.jsx)(be, { block: e });
	if (e.tag === "blockquote" || e.attrs.class?.split(/\s+/).includes("note")) return /* @__PURE__ */ (0, m.jsx)(ye, { block: e });
	if (/^h[2-4]$/.test(e.tag)) return /* @__PURE__ */ (0, m.jsx)(_e, { block: e });
	if (e.tag === "ul" || e.tag === "ol") return /* @__PURE__ */ (0, m.jsx)(ve, { block: e });
	if (e.tag === "p") return /* @__PURE__ */ (0, m.jsx)(he, { block: e });
	if (e.tag === "section" && e.attrs.class?.split(/\s+/).includes("lesson-section")) return /* @__PURE__ */ (0, m.jsx)(me, { block: e });
	if (e.tag === "figure") return /* @__PURE__ */ (0, m.jsx)(ge, { block: e });
	let t = e.attrs.class?.split(/\s+/).includes("lesson-prose") ? J.prose : "";
	return (0, o.createElement)(e.tag, {
		...Y(e.attrs),
		...t ? { className: X(e.attrs.class, t) } : {}
	}, [
		"img",
		"br",
		"hr",
		"wbr",
		"source",
		"area",
		"col"
	].includes(e.tag) ? void 0 : /* @__PURE__ */ (0, m.jsx)(Z, { nodes: e.children }));
}
function Z({ nodes: e }) {
	return /* @__PURE__ */ (0, m.jsx)(m.Fragment, { children: e.map((e, t) => /* @__PURE__ */ (0, m.jsx)(xe, { node: e }, t)) });
}
var Se = (0, o.memo)(function({ nodes: e }) {
	return /* @__PURE__ */ (0, m.jsx)("div", {
		"data-reader-prose": "",
		className: J.document,
		children: /* @__PURE__ */ (0, m.jsx)(Z, { nodes: e })
	});
});
// frontend/reader/LessonOutline.tsx
function Q({ percent: e }) {
	return /* @__PURE__ */ (0, m.jsxs)("div", {
		className: "reader-progress",
		children: [/* @__PURE__ */ (0, m.jsxs)("div", {
			className: "reader-progress-label",
			children: [/* @__PURE__ */ (0, m.jsx)("span", { children: "پیشرفت مطالعه" }), /* @__PURE__ */ (0, m.jsxs)("bdi", { children: [e.toLocaleString("fa-IR"), "٪"] })]
		}), /* @__PURE__ */ (0, m.jsx)("progress", {
			value: e,
			max: 100,
			"aria-label": "پیشرفت مطالعه"
		})]
	});
}
function Ce({ fact: e, ...t }) {
	let n = (0, o.useRef)(null), { active: r, doc: i } = t;
	return (0, o.useEffect)(() => {
		let e = n.current;
		if (!e || e.clientHeight >= e.scrollHeight) return;
		let t = e.querySelector("[aria-current=\"location\"]");
		if (!t || e.contains(i.activeElement) && t !== i.activeElement) return;
		let r = t.getBoundingClientRect(), a = e.getBoundingClientRect();
		r.top < a.top + 4 ? e.scrollTop += r.top - a.top - 4 : r.bottom > a.bottom - 4 && (e.scrollTop += r.bottom - a.bottom + 4);
	}, [r, i]), /* @__PURE__ */ (0, m.jsxs)("aside", {
		className: "lesson-rail reader-sidebar",
		"aria-label": "مسیر این یادداشت",
		"data-lesson-sidebar": "",
		children: [
			/* @__PURE__ */ (0, m.jsx)(Q, { percent: t.percent }),
			t.headings.length > 0 && /* @__PURE__ */ (0, m.jsxs)("nav", {
				ref: n,
				"aria-label": "فهرست بخش‌های درس",
				children: [/* @__PURE__ */ (0, m.jsx)("p", {
					className: "rail-title",
					children: "در این یادداشت"
				}), /* @__PURE__ */ (0, m.jsx)("ol", {
					className: "reader-rail-list",
					children: /* @__PURE__ */ (0, m.jsx)(I, {
						...t,
						rail: !0
					})
				})]
			}),
			e && /* @__PURE__ */ (0, m.jsx)("div", {
				className: "rail-fact",
				dangerouslySetInnerHTML: { __html: e }
			})
		]
	});
}
function we(e) {
	return /* @__PURE__ */ (0, m.jsxs)("div", {
		className: "reader-mobile-outline",
		children: [/* @__PURE__ */ (0, m.jsx)(Q, { percent: e.percent }), e.headings.length > 0 && /* @__PURE__ */ (0, m.jsxs)("details", { children: [/* @__PURE__ */ (0, m.jsx)("summary", { children: "فهرست بخش‌های درس" }), /* @__PURE__ */ (0, m.jsx)("nav", {
			className: "reader-mobile-toc",
			"aria-label": "فهرست بخش‌های درس",
			children: /* @__PURE__ */ (0, m.jsx)(I, {
				...e,
				rail: !1
			})
		})] })]
	});
}
function Te() {
	return /* @__PURE__ */ (0, m.jsxs)("div", {
		hidden: !0,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, m.jsx)("div", { id: "reading-progress" }),
			/* @__PURE__ */ (0, m.jsx)("ol", { className: "rail-list" }),
			/* @__PURE__ */ (0, m.jsx)("nav", { className: "mobile-toc" }),
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "reading-state",
				children: [/* @__PURE__ */ (0, m.jsx)("span", { id: "reading-label" }), /* @__PURE__ */ (0, m.jsx)("div", { children: /* @__PURE__ */ (0, m.jsx)("i", { id: "sidebar-progress" }) })]
			})
		]
	});
}
// frontend/reader/LessonEnd.tsx
function $({ relation: e, number: t, title: n, href: r }) {
	let i = e === "prev";
	return /* @__PURE__ */ (0, m.jsxs)("a", {
		className: "reader-pager-link reader-pager-" + (i ? "previous" : "next"),
		rel: e,
		href: r,
		dir: "rtl",
		children: [/* @__PURE__ */ (0, m.jsxs)("span", {
			className: "reader-pager-label",
			children: [
				/* @__PURE__ */ (0, m.jsx)("bdi", {
					className: "reader-pager-number",
					dir: "ltr",
					children: t.toLocaleString("fa-IR")
				}),
				/* @__PURE__ */ (0, m.jsx)("span", {
					className: "reader-pager-direction",
					children: i ? "یادداشت قبلی" : "یادداشت بعدی"
				}),
				/* @__PURE__ */ (0, m.jsx)("span", {
					className: "reader-pager-arrow",
					"aria-hidden": "true",
					children: i ? "→" : "←"
				})
			]
		}), /* @__PURE__ */ (0, m.jsx)("strong", { children: /* @__PURE__ */ (0, m.jsx)("bdi", { children: n }) })]
	});
}
var Ee = (0, o.memo)(function({ info: e, href: t }) {
	let { previous: n, next: r } = b(e);
	return !n && !r ? null : /* @__PURE__ */ (0, m.jsxs)("nav", {
		className: "reader-pager",
		dir: "rtl",
		"aria-label": "یادداشت قبلی و بعدی",
		"data-lesson-pager": "",
		children: [n && /* @__PURE__ */ (0, m.jsx)($, {
			relation: "prev",
			number: n.number,
			title: n.lesson.title,
			href: t(n.lesson.id + "/")
		}), r && /* @__PURE__ */ (0, m.jsx)($, {
			relation: "next",
			number: r.number,
			title: r.lesson.title,
			href: t(r.lesson.id + "/")
		})]
	});
}), De = (0, o.memo)(function({ info: e, href: t, data: n, files: r, preview: i }) {
	if (!e.quiz_version && !n.pdf && !n.notebook && !n.extras.length) return null;
	let a = (e, t) => /* @__PURE__ */ (0, m.jsx)(R, {
		path: e,
		label: t,
		className: "button-outline",
		files: r,
		preview: i
	});
	return /* @__PURE__ */ (0, m.jsxs)("section", {
		className: "portal-quiz-link reader-resources",
		id: n.id,
		"aria-label": "منابع و تمرین این یادداشت",
		"data-lesson-resources": "",
		children: [
			/* @__PURE__ */ (0, m.jsx)("h2", { children: "منابع و تمرین این یادداشت" }),
			/* @__PURE__ */ (0, m.jsx)("p", { children: "برای مرور یا شرکت در آزمون، از این بخش شروع کن. فایل‌ها برای مطالعه و اجرای مثال‌ها در دسترس‌اند." }),
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "reader-resource-actions",
				children: [
					e.quiz_version && /* @__PURE__ */ (0, m.jsx)("a", {
						className: "button-forest",
						href: t("quiz/" + e.id + "/"),
						children: "تمرین و آزمون این یادداشت ←"
					}),
					n.pdf && a(n.pdf, "دریافت PDF ↓"),
					n.notebook && a(n.notebook, "دانلود نوت‌بوک انگلیسی ↓")
				]
			}),
			n.extras.length > 0 && /* @__PURE__ */ (0, m.jsx)("div", {
				className: "reader-resource-extras",
				children: n.extras.map((e) => /* @__PURE__ */ (0, m.jsx)("div", { children: a(e.path, e.label) }, e.path))
			}),
			n.note && /* @__PURE__ */ (0, m.jsx)("p", {
				className: "small-note",
				children: n.note
			})
		]
	});
});
function Oe({ info: e, href: t }) {
	return /* @__PURE__ */ (0, m.jsxs)("footer", {
		className: "lesson-footer",
		children: [/* @__PURE__ */ (0, m.jsxs)("p", { children: [
			"این یادداشت بخشی از کلاس ",
			/* @__PURE__ */ (0, m.jsx)("bdi", { children: e.course.display_title || e.course.title }),
			" است."
		] }), /* @__PURE__ */ (0, m.jsx)("a", {
			href: t(e.course.id + "/"),
			children: "بازگشت به فهرست کلاس ←"
		})]
	});
}
// frontend/reader/LessonTemplate.tsx
function ke({ lesson: e, info: t, href: n, outline: r, files: i, preview: a }) {
	let o = e.headings.find(({ id: t }) => t !== e.resources.id), s = o ? k("#" + encodeURIComponent(o.id), r.doc) : void 0;
	return /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [/* @__PURE__ */ (0, m.jsx)(ue, {
		hero: e.hero,
		title: t.title,
		start: s
	}), /* @__PURE__ */ (0, m.jsxs)(de, {
		sidebar: /* @__PURE__ */ (0, m.jsx)(Ce, {
			...r,
			fact: e.fact
		}),
		children: [
			/* @__PURE__ */ (0, m.jsx)(we, { ...r }),
			/* @__PURE__ */ (0, m.jsx)(Se, { nodes: e.document }),
			/* @__PURE__ */ (0, m.jsx)(Ee, {
				info: t,
				href: n
			}),
			/* @__PURE__ */ (0, m.jsx)(De, {
				info: t,
				href: n,
				data: e.resources,
				files: i,
				preview: a
			}),
			/* @__PURE__ */ (0, m.jsx)(Oe, {
				info: t,
				href: n
			})
		]
	})] });
}
// frontend/reader/navigation.ts
var Ae = {
	active: "",
	percent: 0
};
function je(e, t) {
	let [n, r] = (0, o.useState)(Ae);
	return (0, o.useEffect)(() => {
		if (!e) return;
		let n = e.ownerDocument.defaultView;
		if (!n) return;
		let i = new Map(Array.from(e.querySelectorAll("[id]"), (e) => [e.id, e])), a = t.flatMap(({ id: e }) => {
			let t = i.get(e);
			return t ? [t] : [];
		}), o = e.querySelector("[data-reader-prose]") || e, s = e.ownerDocument.querySelector(".portal-header"), c = null, l = 0, u = () => {
			c = null;
			let t = Math.max(100, Math.ceil(s?.getBoundingClientRect().height || 0) + 16);
			t !== l && (l = t, e.style.setProperty("--reader-anchor-offset", l + "px"));
			let i = a[0]?.id || "";
			for (let e of a) {
				let t = e.getBoundingClientRect();
				t.height > 0 && t.top <= l && (i = e.id);
			}
			let u = o.getBoundingClientRect(), d = Math.max(1, u.height - n.innerHeight + l), f = u.height > 0 ? Math.round(Math.max(0, Math.min(1, (l - u.top) / d)) * 100) : 0;
			r((e) => e.active === i && e.percent === f ? e : {
				active: i,
				percent: f
			});
		}, d = () => {
			c === null && (c = n.requestAnimationFrame(u));
		}, f = n.requestAnimationFrame(() => {
			try {
				let e = decodeURIComponent(n.location.hash.slice(1));
				e && i.get(e)?.scrollIntoView?.({ block: "start" });
			} catch {}
			d();
		});
		n.addEventListener("scroll", d, { passive: !0 }), n.addEventListener("resize", d, { passive: !0 }), n.addEventListener("hashchange", d), e.addEventListener("load", d, !0);
		let p = typeof n.ResizeObserver == "function" ? new n.ResizeObserver(d) : null, m = e.querySelector(".lesson-body");
		return m && m !== o && p?.observe(m), p?.observe(o), s && p?.observe(s), u(), () => {
			n.cancelAnimationFrame(f), c !== null && n.cancelAnimationFrame(c), n.removeEventListener("scroll", d), n.removeEventListener("resize", d), n.removeEventListener("hashchange", d), e.removeEventListener("load", d, !0), p?.disconnect(), e.style.removeProperty("--reader-anchor-offset");
		};
	}, [e, t]), n;
}
// frontend/reader/ReaderDocument.tsx
function Me({ scope: e, lesson: t, files: n, preview: r }) {
	let i = (0, o.useMemo)(() => new Map(Array.from(e.querySelectorAll("[data-reader-slot]"), (e) => [e.getAttribute("data-reader-slot"), e])), [e]);
	return /* @__PURE__ */ (0, m.jsx)(m.Fragment, { children: t.slots.map((e) => {
		let t = i.get(e.key);
		if (!t) return null;
		let a = e.kind === "copy" ? /* @__PURE__ */ (0, m.jsx)(L, {
			label: e.label,
			text: e.text
		}) : /* @__PURE__ */ (0, m.jsx)(R, {
			...e,
			files: n,
			preview: r
		});
		return (0, oe.createPortal)(a, t, e.key);
	}) });
}
var Ne = (0, o.memo)(function({ lesson: e, payload: t, options: n, files: r, doc: i }) {
	let [a, s] = (0, o.useState)(null), [c, l] = (0, o.useState)(!1), { active: u, percent: d } = je(a, e.headings), f = {
		headings: e.headings,
		active: u,
		percent: d,
		doc: i
	};
	return (0, o.useEffect)(() => {
		if (!a || !r.alive()) return;
		let e = !0, i = () => e && r.alive();
		for (let e of a.querySelectorAll("img[data-private-path]")) {
			let t = e.dataset.privatePath;
			n.preview || r.load(t).then((t) => {
				i() && e.isConnected && (e.src = t);
			}).catch(() => {
				i() && e.isConnected && (e.alt += " — تصویر دریافت نشد؛ صفحه را دوباره باز کن.");
			});
		}
		return n.onRead(a), n.refreshMotion?.(a), (async () => {
			try {
				await n.enhance(a);
			} catch {
				i() && l(!0);
			}
			let e = Array.isArray(t.scripts) ? t.scripts : [];
			for (let t of e) {
				if (!i()) return;
				if (w(t, n.info.course.id, [".js"])) try {
					let e = await r.load(t);
					i() && await n.loadScript(e);
				} catch {
					i() && l(!0);
				}
			}
			i() && (n.onWidgetsReady?.(), n.refreshMotion?.(a));
		})(), () => {
			e = !1, n.clearMotion?.();
		};
	}, [
		r,
		n,
		t,
		a
	]), /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [
		c && /* @__PURE__ */ (0, m.jsx)("p", {
			className: "shell reader-widget-note",
			role: "status",
			children: "بعضی ابزارهای تعاملی بارگذاری نشدند. متن یادداشت در دسترس است."
		}),
		/* @__PURE__ */ (0, m.jsxs)("div", {
			ref: s,
			"data-reader-document": "",
			"data-reader-template": "",
			"data-lesson-template-version": "1",
			"data-lesson-document-id": n.info.id,
			children: [
				/* @__PURE__ */ (0, m.jsx)(Te, {}),
				/* @__PURE__ */ (0, m.jsx)("div", {
					id: "reader-reading-progress",
					"aria-hidden": "true",
					style: { transform: "scaleX(" + d / 100 + ")" }
				}),
				/* @__PURE__ */ (0, m.jsx)(ke, {
					lesson: e,
					info: n.info,
					href: n.href,
					outline: f,
					files: r,
					preview: n.preview
				})
			]
		}),
		a && /* @__PURE__ */ (0, m.jsx)(Me, {
			scope: a,
			lesson: e,
			files: r,
			preview: n.preview
		})
	] });
}), Pe = {
	svg: "image/svg+xml",
	png: "image/png",
	webp: "image/webp",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	gif: "image/gif",
	avif: "image/avif",
	js: "text/javascript",
	pdf: "application/pdf",
	ipynb: "application/x-ipynb+json",
	csv: "text/csv"
};
function Fe(e) {
	return !e || typeof e != "object" ? !1 : ["status", "statusCode"].some((t) => t in e && String(e[t]) === "404") || "code" in e && [
		"404",
		"not_found",
		"NoSuchKey"
	].includes(String(e.code)) || "message" in e && /\bobject not found\b/i.test(String(e.message));
}
function Ie(e, t) {
	let n = new e.AbortController(), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set(), a = () => !n.signal.aborted && t.current();
	function o(o) {
		if (!a()) return Promise.reject(Error("READER_CLOSED"));
		if (!w(o, t.info.course.id, [
			...T,
			...E,
			".js"
		])) return Promise.reject(Error("INVALID_LESSON_RESOURCE"));
		let s = r.get(o);
		if (s) return s;
		let c = (async () => {
			let r;
			try {
				r = await t.getFile(o, n.signal);
			} catch (e) {
				let i = D(o);
				if (!a() || !i || !Fe(e)) throw e;
				r = await t.getFile(i, n.signal);
			}
			if (!a()) throw Error("READER_CLOSED");
			let s = Pe[o.split(".").pop()?.toLowerCase() || ""] || r.type, c = e.URL.createObjectURL(s ? new e.Blob([r], { type: s }) : r);
			return i.add(c), c;
		})();
		return r.set(o, c), c.catch(() => {
			r.get(o) === c && r.delete(o);
		}), c;
	}
	function s() {
		n.abort();
		for (let t of i) e.URL.revokeObjectURL(t);
		i.clear(), r.clear();
	}
	return {
		load: o,
		dispose: s,
		alive: a
	};
}
// frontend/reader/mount.tsx
function Le({ info: e, href: t }) {
	return /* @__PURE__ */ (0, m.jsx)("nav", {
		className: "shell route-trail",
		"aria-label": "مسیر صفحه",
		children: /* @__PURE__ */ (0, m.jsxs)("ol", { children: [
			/* @__PURE__ */ (0, m.jsx)("li", { children: /* @__PURE__ */ (0, m.jsx)("a", {
				href: t("index.html"),
				children: "صفحهٔ اصلی"
			}) }),
			/* @__PURE__ */ (0, m.jsx)("li", { children: /* @__PURE__ */ (0, m.jsx)("a", {
				href: t("index.html#classes"),
				children: "کلاس‌ها"
			}) }),
			/* @__PURE__ */ (0, m.jsx)("li", { children: /* @__PURE__ */ (0, m.jsx)("a", {
				href: t(e.course.id + "/"),
				dir: "auto",
				children: e.course.display_title || e.course.title
			}) }),
			/* @__PURE__ */ (0, m.jsx)("li", { children: /* @__PURE__ */ (0, m.jsxs)("span", {
				"aria-current": "page",
				children: [
					"یادداشت ",
					/* @__PURE__ */ (0, m.jsx)("bdi", {
						dir: "ltr",
						children: e.number
					}),
					" · ",
					e.title
				]
			}) })
		] })
	});
}
function Re({ info: e, href: t }) {
	return /* @__PURE__ */ (0, m.jsxs)("nav", {
		className: "shell lesson-shortcuts",
		"aria-label": "دسترسی‌های یادداشت",
		children: [
			/* @__PURE__ */ (0, m.jsx)("a", {
				className: "quiet-link",
				href: t(e.course.id + "/"),
				children: "فهرست یادداشت‌های کلاس ←"
			}),
			e.lab && /* @__PURE__ */ (0, m.jsx)("a", {
				className: "button-forest",
				href: t(e.lab.path),
				children: "ورود به لابراتور کدنویسی ←"
			}),
			e.quiz_version && /* @__PURE__ */ (0, m.jsx)("a", {
				className: "button-outline",
				href: t("quiz/" + e.id + "/"),
				children: "تمرین و آزمون این یادداشت"
			})
		]
	});
}
function ze({ access: e, options: t }) {
	let [n, r] = (0, o.useState)(!1), [i, a] = (0, o.useState)(!1), s = async (e) => {
		if (!n && t.current()) {
			r(!0), a(!1);
			try {
				await t.refreshAccess(e);
			} catch {
				t.current() && a(!0);
			} finally {
				t.current() && r(!1);
			}
		}
	};
	if (e.kind === "guest") return /* @__PURE__ */ (0, m.jsxs)("div", {
		className: "gate-card",
		children: [
			/* @__PURE__ */ (0, m.jsx)("h2", { children: "برای ادامه وارد شو." }),
			/* @__PURE__ */ (0, m.jsx)("p", { children: "متن یادداشت‌ها و آزمون‌ها فقط برای اعضای تأییدشدهٔ کلاس در دسترس است." }),
			/* @__PURE__ */ (0, m.jsx)("div", {
				className: "portal-actions",
				children: /* @__PURE__ */ (0, m.jsx)("a", {
					className: "button-forest",
					href: e.login,
					"data-login-link": "",
					children: "ورود با Google ←"
				})
			})
		]
	});
	let c = {
		error: "ورود انجام شده، اما اطلاعات کلاس دریافت نشد. کمی بعد دوباره امتحان کن.",
		pending: "درخواستت ثبت شده است؛ پس از تأیید مدرس، دسترسی فعال می‌شود.",
		suspended: "دسترسی این کلاس فعلاً غیرفعال است. برای پیگیری با مدرس در ارتباط باش.",
		restricted: "برای پیگیری وضعیت عضویت با مدرس در ارتباط باش.",
		unregistered: "برای این کلاس درخواست عضویت بده؛ دسترسی پس از تأیید مدرس فعال می‌شود."
	}[e.kind];
	return /* @__PURE__ */ (0, m.jsxs)("div", {
		className: "gate-card",
		"aria-busy": n,
		children: [
			/* @__PURE__ */ (0, m.jsx)("h2", { children: e.kind === "error" ? "اطلاعات کلاس دریافت نشد." : "عضویت در کلاس" }),
			/* @__PURE__ */ (0, m.jsx)("p", { children: c }),
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "portal-actions",
				children: [
					e.kind === "unregistered" && /* @__PURE__ */ (0, m.jsx)("button", {
						className: "button-forest",
						type: "button",
						disabled: n,
						onClick: () => void s(!0),
						children: "درخواست دسترسی به کلاس"
					}),
					/* @__PURE__ */ (0, m.jsx)("a", {
						className: "button-outline",
						href: t.href("dashboard/"),
						children: "داشبورد ←"
					}),
					/* @__PURE__ */ (0, m.jsx)("button", {
						className: "button-outline",
						type: "button",
						disabled: n,
						onClick: () => void s(!1),
						children: e.kind === "error" ? "تلاش دوباره" : "به‌روزرسانی وضعیت عضویت"
					})
				]
			}),
			i && /* @__PURE__ */ (0, m.jsx)("p", {
				className: "status-line",
				"data-error": "true",
				role: "status",
				children: "عملیات کامل نشد. دوباره تلاش کن."
			})
		]
	});
}
function Be({ state: e, options: t, files: n, doc: r }) {
	let { info: i, href: a } = t;
	return /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [/* @__PURE__ */ (0, m.jsx)(Le, {
		info: i,
		href: a
	}), e.phase === "ready" && e.prepared ? /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [/* @__PURE__ */ (0, m.jsx)(Re, {
		info: i,
		href: a
	}), /* @__PURE__ */ (0, m.jsx)(Ne, {
		lesson: e.prepared,
		payload: e.payload,
		files: n,
		options: t,
		doc: r
	})] }) : /* @__PURE__ */ (0, m.jsxs)("section", {
		className: "shell portal-main",
		id: "top",
		children: [/* @__PURE__ */ (0, m.jsx)("header", {
			className: "page-head",
			children: /* @__PURE__ */ (0, m.jsx)("h1", { children: i.title })
		}), e.phase === "gate" ? /* @__PURE__ */ (0, m.jsx)(ze, {
			access: e.access,
			options: t
		}) : e.phase === "loading" ? /* @__PURE__ */ (0, m.jsxs)("div", {
			className: "page-loading",
			role: "status",
			"aria-busy": "true",
			children: [
				/* @__PURE__ */ (0, m.jsx)("span", { className: "page-loading-line" }),
				/* @__PURE__ */ (0, m.jsx)("span", { className: "page-loading-line" }),
				/* @__PURE__ */ (0, m.jsx)("span", { className: "page-loading-line" }),
				/* @__PURE__ */ (0, m.jsx)("p", {
					className: "status-line",
					children: "در حال دریافت یادداشت…"
				})
			]
		}) : /* @__PURE__ */ (0, m.jsxs)("div", {
			className: "gate-card",
			children: [
				/* @__PURE__ */ (0, m.jsx)("h2", { children: "دریافت یادداشت کامل نشد." }),
				/* @__PURE__ */ (0, m.jsx)("p", { children: "اتصال را بررسی کن و دوباره تلاش کن." }),
				/* @__PURE__ */ (0, m.jsxs)("div", {
					className: "portal-actions",
					children: [/* @__PURE__ */ (0, m.jsx)("button", {
						type: "button",
						className: "button-forest",
						onClick: t.retry,
						children: "تلاش دوباره"
					}), /* @__PURE__ */ (0, m.jsx)("a", {
						className: "button-outline",
						href: a("dashboard/"),
						children: "داشبورد ←"
					})]
				})
			]
		})]
	})] });
}
function Ve(e, t) {
	let n = e.ownerDocument, r = n.defaultView;
	if (!r) throw Error("READER_WINDOW_UNAVAILABLE");
	let i = Ie(r, t), a = (0, s.createRoot)(e, { identifierPrefix: "reader-" });
	e.dataset.readerReact = "";
	function o(e) {
		if (!i.alive()) return;
		let r = e.phase === "ready" ? ae(n, e.payload, t.info, t.href) : void 0;
		n.body.classList.toggle("classroom-loaded", !!r), a.render(/* @__PURE__ */ (0, m.jsx)(Be, {
			state: {
				...e,
				prepared: r
			},
			options: t,
			files: i,
			doc: n
		}));
	}
	return {
		render: o,
		dispose() {
			i.dispose(), a.unmount(), delete e.dataset.readerReact, n.body.classList.remove("classroom-loaded");
		}
	};
}
export { Ve as mountLessonReader };
