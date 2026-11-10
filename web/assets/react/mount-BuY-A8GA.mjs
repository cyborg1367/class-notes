import { a as e, i as t, n, r, t as i } from "./jsx-runtime-CMv_BHj2.mjs";
import { n as a } from "./order-CDcu1aqs.mjs";
// frontend/reader/lesson-model.ts
var o = /* @__PURE__ */ e(t(), 1), s = n();
function c({ id: e, course: t }) {
	let n = a(t.lessons), r = n.findIndex(({ lesson: t }) => t.id === e);
	return {
		previous: r > 0 ? n[r - 1] : void 0,
		next: r >= 0 ? n[r + 1] : void 0
	};
}
var l = (e) => Array.isArray(e) && e.length === 2 && e.every((e) => typeof e == "number" && Number.isFinite(e) && e >= 0 && e <= 10);
function u(e) {
	if (!e) return null;
	try {
		let { X: t, y: n, names: r, query: i } = JSON.parse(e);
		return !Array.isArray(t) || t.length < 1 || t.length > 200 || !t.every(l) || !Array.isArray(n) || n.length !== t.length || !n.every((e) => e === 0 || e === 1) || !Array.isArray(r) || r.length !== t.length || !r.every((e) => typeof e == "string") || !l(i) ? null : {
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
var d = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
function f(e, t, n) {
	return typeof e != "string" || !e.startsWith(t + "/") ? !1 : e.split("/").every((e) => d.test(e) && e !== "." && e !== "..") && n.some((t) => e.toLowerCase().endsWith(t));
}
var p = [
	".svg",
	".png",
	".webp",
	".jpg",
	".jpeg",
	".gif",
	".avif"
], m = [
	".pdf",
	".ipynb",
	".csv",
	".tsv",
	".zip",
	".txt",
	".py",
	".json"
];
function h(e) {
	return /^machine-learning\/prediction\/medical-(space|k1-detail|k3(?:-detail)?)\.svg$/.test(e) ? e.replace("/prediction/", "/predictions/") : null;
}
function g(e, t, n, r = !1) {
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
function _(e, t) {
	let n = new URL(t.location.href), r = new URL(t.baseURI);
	return n.origin === r.origin && n.pathname === r.pathname && n.search === r.search ? e : n.pathname + n.search + e;
}
// frontend/reader/prepare.ts
var v = "base,link,meta,style,iframe,frame,object,embed,foreignObject,animate,animateMotion,animateTransform,set,applet,template", y = /* @__PURE__ */ new Set([
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
]), b = /^(?:style|fill|stroke|clip-path|mask|filter|cursor|marker(?:-start|-mid|-end)?)$/, x = (e) => (e.textContent || "").trim().replace(/\s+/g, " ");
function S(e, t, n, r) {
	e.content.querySelectorAll(v).forEach((e) => e.remove());
	for (let t of e.content.querySelectorAll("script")) (t.getAttribute("type") !== "application/json" || t.hasAttribute("src") || !/^[\w-]+$/.test(t.id)) && t.remove();
	for (let t of e.content.querySelectorAll("form")) t.replaceWith(...t.childNodes);
	for (let i of e.content.querySelectorAll("*")) if (i.localName.includes("-")) i.remove();
	else {
		for (let e of Array.from(i.attributes)) {
			let a = e.name.toLowerCase(), o = e.value.trim();
			if (a.startsWith("on") || a.startsWith("data-reader-") || a === "is" || y.has(a)) i.removeAttribute(e.name);
			else if (a === "data-private-path" && (!i.matches("img") || !f(o, t, p))) i.removeAttribute(e.name);
			else if (a === "data-private-download" && (!i.matches("a") || !f(o, t, m))) i.removeAttribute(e.name);
			else if (a === "src" || a === "href" || a === "xlink:href") {
				let t = a === "src" ? i.matches("img") && !i.hasAttribute("data-private-path") && g(o, n, r, !0) : i.matches("a") ? g(o, n, r) : o.startsWith("#") && o;
				t ? i.setAttribute(e.name, t) : i.removeAttribute(e.name);
			} else b.test(a) && /url\s*\(|@import|expression\s*\(|\\|\/\*/i.test(o) && /url\s*\(|@import|expression\s*\(|\\|\/\*/i.test(o.replace(/url\(\s*#[\w.-]+\s*\)/gi, "")) && i.removeAttribute(e.name);
		}
		i.matches("a[target]") && i.setAttribute("rel", "noopener noreferrer");
	}
}
function C(e, t) {
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
		let i = e.querySelector(".rail-num")?.textContent?.trim(), a = i ? x(e).slice(i.length).trim() : x(e);
		return a ? [{
			id: r,
			label: a,
			number: i
		}] : [];
	});
}
function w(e, t, n) {
	let r = Array.from(e.querySelectorAll(".portal-quiz-link [data-private-download], .lesson-resources [data-private-download], .notebook-download [data-private-download]"), (e) => ({
		path: e.dataset.privateDownload,
		label: x(e)
	})), i = (e) => r.find((t) => t.path.toLowerCase().endsWith(e))?.path, a = i(".pdf") || (f(t.pdf_path, n.course.id, [".pdf"]) ? t.pdf_path : null) || e.querySelector(".lesson-rail [data-private-download$=\".pdf\"]")?.dataset.privateDownload || null, o = n.notebook ? n.course.id + "/" + n.notebook : null, s = i(".ipynb") || (f(o, n.course.id, [".ipynb"]) ? o : null), c = e.querySelector(".portal-quiz-link .small-note,.lesson-resources .small-note"), l = e.querySelector(".portal-quiz-link[id],.lesson-resources[id]")?.id || "resources", u = new Set(Array.from(e.querySelectorAll("[id]")).filter((e) => !e.closest(".portal-quiz-link,.lesson-resources")).map((e) => e.id));
	for (let e = 1; u.has(l); e++) l = "reader-resources-" + e;
	return {
		id: l,
		pdf: a,
		notebook: s,
		note: c ? x(c) : "",
		extras: r.filter((e, t) => !/\.(pdf|ipynb)$/i.test(e.path) && r.findIndex((t) => t.path === e.path) === t)
	};
}
function T(e, t) {
	let n = x(e).replace(/[\u200c-\u200f\u2066-\u2069]/g, " ").replace(/\s+/g, " ");
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
function ee(e, t, n, r) {
	let i = e?.querySelector(".hero-copy"), a = i || e?.cloneNode(!0);
	i || a?.querySelectorAll(".hero-figure,.hero-strip").forEach((e) => e.remove());
	let o = a?.querySelector(":scope > .eyebrow"), s = o?.innerHTML || "";
	o?.remove();
	let c = a?.querySelector("h1");
	c?.querySelectorAll("br").forEach((e) => e.replaceWith(r.createTextNode(" ")));
	let l = c?.innerHTML.trim() || "";
	c?.remove();
	let d = a?.querySelector(".hero-meta"), f = d?.innerHTML || "";
	d?.remove();
	for (let e of a?.querySelectorAll("a,button") ?? []) {
		if (!T(e, r)) continue;
		let t = e.parentElement;
		e.remove(), t && t !== a && t.matches("p") && !t.children.length && !x(t) && t.remove();
	}
	let p = a?.querySelector(".hero-actions");
	p && !p.children.length && !x(p) && p.remove();
	let m = e?.querySelector(".hero-figure"), h = Array.from(e?.querySelectorAll(".hero-strip li") ?? [], (e, t) => {
		let n = e.querySelector(".strip-number"), r = e.querySelector(".strip-text"), i = n?.textContent?.trim() || String(t + 1).padStart(2, "0");
		return n?.remove(), {
			number: i,
			html: r?.innerHTML || e.innerHTML
		};
	}).filter((e) => e.html.trim()), g = !m && n.hero_kind === "binary2d" ? u(t.querySelector("#medical-knn-data")?.textContent) : null, _ = n.hero_kind === "threshold-scores" ? { kind: "threshold-scores" } : m ? {
		kind: "authored",
		html: m.innerHTML,
		className: m.className
	} : g ? {
		kind: "binary",
		plot: g
	} : null;
	return {
		eyebrow: s,
		titleHTML: l,
		copy: a?.innerHTML || "",
		meta: f,
		highlights: h,
		visual: _
	};
}
function E(e, t, n, r) {
	if (typeof t.body != "string" || !t.body.trim()) throw Error("LESSON_BODY_UNAVAILABLE");
	let i = e.createElement("template");
	i.innerHTML = t.body;
	let a = i.content;
	S(i, n.course.id, new URL(e.baseURI), new URL(r(""))), a.querySelectorAll(".breadcrumb, #exercise, [data-python-lab], .python-lab, [data-cloud-tools]").forEach((e) => e.remove()), a.querySelectorAll("a[href=\"#exercise\"]").forEach((e) => (e.closest("li") || e).remove());
	let o = a.querySelector(".lesson-hero"), s = a.querySelector(".lesson-rail"), c = a.querySelector(".lesson-body"), l = new Map(Array.from(a.querySelectorAll("[id]"), (e) => [e.id, e])), u = new Set(l.keys()), d = s?.querySelector(".rail-list"), f = a.querySelector(".mobile-toc"), p = w(a, t, n), m = s?.querySelector(".rail-fact")?.innerHTML || "", h = ".adjacent-lessons,.portal-quiz-link,.lesson-resources,.lesson-footer,.notebook-download", g = d ? C(d, u) : [];
	!g.length && f && (g = C(f, u)), g = g.filter(({ id: e }) => !l.get(e)?.closest(h));
	let v = [], y = (e, t) => {
		let n = String(v.length);
		return e.setAttribute("data-reader-slot", n), v.push({
			...t,
			key: n
		}), e;
	};
	for (let t of a.querySelectorAll(".copy-code")) {
		let n = l.get(t.dataset.copyCode || "") || t.closest(".code-block")?.querySelector("pre");
		n?.textContent && t.replaceWith(y(e.createElement("span"), {
			kind: "copy",
			label: t.getAttribute("aria-label") || "کپی کد",
			text: n.textContent
		}));
	}
	for (let t of a.querySelectorAll("[data-private-download]")) t.closest(".lesson-rail," + h) || t.replaceWith(y(e.createElement("span"), {
		kind: "download",
		label: x(t),
		path: t.dataset.privateDownload,
		className: t.className
	}));
	for (let t of a.querySelectorAll("a[href^=\"#\"]")) t.setAttribute("href", _(t.getAttribute("href"), e));
	let b = ee(o, a, n, e);
	a.querySelectorAll(h + ",.mobile-toc,#reading-progress").forEach((e) => e.remove()), s?.remove(), o?.remove();
	let T = c || a;
	if (c) for (let e of a.querySelectorAll("script[type=\"application/json\"]")) c.contains(e) || c.append(e);
	let E = new Set(Array.from(T.querySelectorAll("[id]"), (e) => e.id));
	g = g.filter(({ id: e }) => E.has(e)), g.length || (g = Array.from(T.querySelectorAll(".lesson-section[id]")).flatMap((e) => {
		let t = e.querySelector("h2,h3");
		return t && x(t) ? [{
			id: e.id,
			label: x(t)
		}] : [];
	})), (p.pdf || p.notebook || p.extras.length || n.quiz_version) && g.push({
		id: p.id,
		label: "منابع و تمرین"
	});
	let D = g.map((e, t) => ({
		...e,
		number: String(t + 1).padStart(2, "0")
	}));
	return {
		hero: b,
		html: c?.innerHTML ?? i.innerHTML,
		fact: m,
		slots: v,
		headings: D,
		resources: p
	};
}
// frontend/reader/ReaderControls.tsx
var D = r(), O = i();
function k({ headings: e, active: t, rail: n, doc: r }) {
	return /* @__PURE__ */ (0, O.jsx)(O.Fragment, { children: e.map(({ id: e, label: i, number: a }) => {
		let s = /* @__PURE__ */ (0, O.jsxs)("a", {
			href: _("#" + encodeURIComponent(e), r),
			"aria-current": t === e ? "location" : void 0,
			className: t === e ? "is-current" : void 0,
			children: [n && a && /* @__PURE__ */ (0, O.jsx)("span", {
				className: "rail-num",
				"aria-hidden": "true",
				children: a
			}), /* @__PURE__ */ (0, O.jsx)("span", { children: i })]
		});
		return n ? /* @__PURE__ */ (0, O.jsx)("li", { children: s }, e) : /* @__PURE__ */ (0, O.jsx)(o.Fragment, { children: s }, e);
	}) });
}
function A({ label: e, text: t }) {
	let [n, r] = (0, o.useState)("idle"), i = (0, o.useRef)(0);
	return (0, o.useEffect)(() => () => {
		i.current++;
	}, []), (0, o.useEffect)(() => {
		if (n !== "copied") return;
		let e = setTimeout(() => r("idle"), 1500);
		return () => clearTimeout(e);
	}, [n]), /* @__PURE__ */ (0, O.jsx)("button", {
		type: "button",
		className: "reader-copy",
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
function j({ path: e, label: t, className: n, files: r, preview: i }) {
	let [a, s] = (0, o.useState)("idle"), c = (0, o.useRef)(!1);
	return /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)("button", {
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
	}), a === "error" && /* @__PURE__ */ (0, O.jsx)("small", {
		className: "reader-resource-error",
		role: "status",
		children: "فایل دریافت نشد. دوباره تلاش کن."
	})] });
}
// frontend/reader/ThresholdScoreFigure.tsx
var M = [
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
], N = [{
	value: .4,
	tone: "lower",
	dash: "5 4"
}, {
	value: .7,
	tone: "higher",
	dash: "2 4"
}], P = (e) => 60 + 350 * e, F = [
	0,
	.25,
	.5,
	.75,
	1
], I = M.filter((e) => e.positive).length, L = (e) => {
	let t = M.filter((t) => t.value >= e), n = t.filter((e) => e.positive).length;
	return {
		precision: n / t.length,
		recall: n / I
	};
};
function R() {
	return /* @__PURE__ */ (0, O.jsxs)("figure", {
		className: "hero-figure reader-threshold-figure",
		"data-threshold-hero": "",
		children: [
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "reader-threshold-heading",
				children: [/* @__PURE__ */ (0, O.jsx)("strong", { children: "یک مدل، دو آستانه" }), /* @__PURE__ */ (0, O.jsx)("span", { children: "دادهٔ ساختگی" })]
			}),
			/* @__PURE__ */ (0, O.jsxs)("svg", {
				className: "reader-threshold-chart",
				viewBox: "0 0 432 173",
				role: "img",
				"aria-label": "امتیاز هشت نمونه با دو آستانهٔ ۰٫۴۰ و ۰٫۷۰؛ لوزی‌ها نمونه‌های مثبت و مربع‌ها نمونه‌های منفی‌اند.",
				children: [
					/* @__PURE__ */ (0, O.jsxs)("g", {
						className: "reader-threshold-grid",
						children: [F.map((e) => /* @__PURE__ */ (0, O.jsx)("line", {
							x1: P(e),
							x2: P(e),
							y1: "31",
							y2: "131"
						}, e)), /* @__PURE__ */ (0, O.jsx)("path", { d: "M60 59H410M60 103H410" })]
					}),
					/* @__PURE__ */ (0, O.jsxs)("g", {
						className: "reader-threshold-axis",
						textAnchor: "middle",
						children: [
							/* @__PURE__ */ (0, O.jsx)("path", { d: "M60 131H410" }),
							F.map((e) => /* @__PURE__ */ (0, O.jsx)("text", {
								x: P(e),
								y: "148",
								children: e
							}, e)),
							/* @__PURE__ */ (0, O.jsx)("text", {
								x: "235",
								y: "164",
								children: "Model score"
							})
						]
					}),
					/* @__PURE__ */ (0, O.jsxs)("g", {
						className: "reader-threshold-axis",
						textAnchor: "end",
						children: [/* @__PURE__ */ (0, O.jsx)("text", {
							x: "54",
							y: "63",
							children: "Positive"
						}), /* @__PURE__ */ (0, O.jsx)("text", {
							x: "54",
							y: "107",
							children: "Negative"
						})]
					}),
					N.map(({ value: e, tone: t, dash: n }) => /* @__PURE__ */ (0, O.jsxs)("g", {
						className: "reader-threshold-" + t,
						"data-threshold": e,
						children: [/* @__PURE__ */ (0, O.jsx)("line", {
							x1: P(e),
							x2: P(e),
							y1: "30",
							y2: "131",
							strokeDasharray: n
						}), /* @__PURE__ */ (0, O.jsx)("text", {
							x: P(e),
							y: "20",
							textAnchor: "middle",
							children: e.toFixed(2)
						})]
					}, e)),
					M.map(({ value: e, positive: t }) => t ? /* @__PURE__ */ (0, O.jsx)("path", {
						className: "reader-threshold-positive",
						"data-score": e,
						d: `M${P(e)} 52l7 7-7 7-7-7z`
					}, e) : /* @__PURE__ */ (0, O.jsx)("rect", {
						className: "reader-threshold-negative",
						"data-score": e,
						x: P(e) - 5.5,
						y: "97.5",
						width: "11",
						height: "11",
						rx: "1"
					}, e))
				]
			}),
			/* @__PURE__ */ (0, O.jsx)("div", {
				className: "reader-threshold-results",
				dir: "ltr",
				children: N.map(({ value: e, tone: t }) => {
					let { precision: n, recall: r } = L(e);
					return /* @__PURE__ */ (0, O.jsxs)("div", {
						className: "reader-threshold-result reader-threshold-" + t,
						"data-threshold-result": e,
						children: [/* @__PURE__ */ (0, O.jsxs)("span", {
							className: "reader-threshold-cut",
							lang: "en",
							children: ["Threshold ", e.toFixed(2)]
						}), /* @__PURE__ */ (0, O.jsxs)("dl", {
							lang: "en",
							children: [/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("dt", { children: "Precision" }), /* @__PURE__ */ (0, O.jsx)("dd", { children: n.toFixed(2) })] }), /* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("dt", { children: "Recall" }), /* @__PURE__ */ (0, O.jsx)("dd", { children: r.toFixed(2) })] })]
						})]
					}, e);
				})
			}),
			/* @__PURE__ */ (0, O.jsxs)("figcaption", { children: [
				"لوزی و مربع، کلاس واقعی نمونه را نشان می‌دهند. امتیازها ثابت‌اند. با آستانهٔ بالاتر، در این مثال ",
				/* @__PURE__ */ (0, O.jsx)("bdi", {
					lang: "en",
					children: "Precision"
				}),
				" بیشتر و ",
				/* @__PURE__ */ (0, O.jsx)("bdi", {
					lang: "en",
					children: "Recall"
				}),
				" کمتر می‌شود."
			] })
		]
	});
}
// frontend/reader/LessonHero.tsx
function z({ plot: e }) {
	let [t, n] = [64 + 37.6 * e.query[0], 426 - 37.6 * e.query[1]];
	return /* @__PURE__ */ (0, O.jsxs)("figure", {
		className: "hero-figure binary-hero",
		children: [
			/* @__PURE__ */ (0, O.jsxs)("svg", {
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
						return /* @__PURE__ */ (0, O.jsxs)("g", { children: [/* @__PURE__ */ (0, O.jsx)("path", {
							d: `M${t} 50V426M64 ${n}H440`,
							stroke: "#b9b7a1",
							strokeOpacity: ".45"
						}), /* @__PURE__ */ (0, O.jsxs)("g", {
							fill: "#585e4e",
							fontSize: "16",
							children: [/* @__PURE__ */ (0, O.jsx)("text", {
								x: t,
								y: "453",
								textAnchor: "middle",
								children: e
							}), /* @__PURE__ */ (0, O.jsx)("text", {
								x: "48",
								y: n + 5,
								textAnchor: "end",
								children: e
							})]
						})] }, e);
					}),
					/* @__PURE__ */ (0, O.jsx)("path", {
						d: "M64 40V426H452m-394-375 6-11 6 11m371 369 11 6-11 6",
						fill: "none",
						stroke: "#24241f",
						strokeWidth: "1.8"
					}),
					/* @__PURE__ */ (0, O.jsxs)("g", {
						fill: "#24241f",
						fontSize: "19",
						children: [/* @__PURE__ */ (0, O.jsx)("text", {
							x: "252",
							y: "489",
							textAnchor: "middle",
							children: "M1"
						}), /* @__PURE__ */ (0, O.jsx)("text", {
							x: "20",
							y: "238",
							transform: "rotate(-90 20 238)",
							textAnchor: "middle",
							children: "M2"
						})]
					}),
					e.points.map(({ x: e, y: t, positive: n, label: r }, i) => {
						let a = 64 + 37.6 * e, o = 426 - 37.6 * t, [s, c] = i === 4 ? [-33, -12] : i === 5 ? [13, 27] : [12, -11], l = /* @__PURE__ */ (0, O.jsxs)("title", { children: [
							r,
							": M1 = ",
							e,
							", M2 = ",
							t,
							", class ",
							+!!n
						] });
						return /* @__PURE__ */ (0, O.jsxs)("g", { children: [n ? /* @__PURE__ */ (0, O.jsx)("rect", {
							"data-hero-class": "1",
							x: a - 7,
							y: o - 7,
							width: "14",
							height: "14",
							fill: "#a35236",
							stroke: "#24241f",
							children: l
						}) : /* @__PURE__ */ (0, O.jsx)("circle", {
							"data-hero-class": "0",
							cx: a,
							cy: o,
							r: "7",
							fill: "#21665d",
							stroke: "#24241f",
							children: l
						}), /* @__PURE__ */ (0, O.jsx)("text", {
							x: a + s,
							y: o + c,
							fill: "#3e4438",
							fontSize: "16",
							children: r
						})] }, i);
					}),
					/* @__PURE__ */ (0, O.jsx)("path", {
						"data-hero-query": "",
						d: `m${t} ${n - 10} 10 10-10 10-10-10z`,
						fill: "#f4d835",
						stroke: "#24241f",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ (0, O.jsx)("text", {
						x: t + 18,
						y: n + 3,
						fill: "#24241f",
						fontSize: "19",
						fontWeight: "700",
						children: "q"
					})
				]
			}),
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "binary-hero-legend",
				children: [
					/* @__PURE__ */ (0, O.jsxs)("span", { children: [
						/* @__PURE__ */ (0, O.jsx)("svg", {
							viewBox: "0 0 20 20",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, O.jsx)("circle", {
								cx: "10",
								cy: "10",
								r: "6",
								fill: "#21665d",
								stroke: "#24241f"
							})
						}),
						"کلاس ",
						/* @__PURE__ */ (0, O.jsx)("bdi", { children: "0" })
					] }),
					/* @__PURE__ */ (0, O.jsxs)("span", { children: [
						/* @__PURE__ */ (0, O.jsx)("svg", {
							viewBox: "0 0 20 20",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, O.jsx)("rect", {
								x: "4",
								y: "4",
								width: "12",
								height: "12",
								fill: "#a35236",
								stroke: "#24241f"
							})
						}),
						"کلاس ",
						/* @__PURE__ */ (0, O.jsx)("bdi", { children: "1" })
					] }),
					/* @__PURE__ */ (0, O.jsxs)("span", { children: [
						/* @__PURE__ */ (0, O.jsx)("svg", {
							viewBox: "0 0 20 20",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, O.jsx)("path", {
								d: "m10 2 8 8-8 8-8-8z",
								fill: "#f4d835",
								stroke: "#24241f"
							})
						}),
						"پرس‌وجوی ",
						/* @__PURE__ */ (0, O.jsx)("bdi", { children: "q" })
					] })
				]
			}),
			/* @__PURE__ */ (0, O.jsxs)("p", {
				className: "binary-hero-axes",
				children: [
					/* @__PURE__ */ (0, O.jsx)("bdi", { children: "M1" }),
					": امتیاز تنفسی · ",
					/* @__PURE__ */ (0, O.jsx)("bdi", { children: "M2" }),
					": امتیاز خستگی"
				]
			}),
			/* @__PURE__ */ (0, O.jsxs)("figcaption", { children: [
				"پرونده‌ها و امتیازها کاملاً ساختگی‌اند؛ کلاسِ ",
				/* @__PURE__ */ (0, O.jsx)("bdi", { children: "q" }),
				" هنوز مشخص نیست."
			] })
		]
	});
}
var B = (0, o.memo)(function({ hero: e, title: t, start: n }) {
	let { visual: r } = e;
	return /* @__PURE__ */ (0, O.jsxs)("section", {
		className: "hero lesson-hero",
		id: "top",
		"data-lesson-hero": "",
		children: [/* @__PURE__ */ (0, O.jsxs)("div", {
			className: "shell hero-grid" + (r ? "" : " hero-grid--single"),
			children: [
				/* @__PURE__ */ (0, O.jsxs)("div", {
					className: "hero-copy",
					children: [
						e.eyebrow && /* @__PURE__ */ (0, O.jsx)("p", {
							className: "eyebrow",
							dangerouslySetInnerHTML: { __html: e.eyebrow }
						}),
						e.titleHTML ? /* @__PURE__ */ (0, O.jsx)("h1", {
							className: "reader-hero-title",
							dangerouslySetInnerHTML: { __html: e.titleHTML }
						}) : /* @__PURE__ */ (0, O.jsx)("h1", {
							className: "reader-hero-title",
							children: t
						}),
						e.copy && /* @__PURE__ */ (0, O.jsx)("div", {
							className: "reader-hero-text",
							dangerouslySetInnerHTML: { __html: e.copy }
						}),
						(n || e.meta) && /* @__PURE__ */ (0, O.jsxs)("div", {
							className: "hero-actions",
							children: [n && /* @__PURE__ */ (0, O.jsxs)("a", {
								className: "button-primary",
								"data-lesson-start": "",
								href: n,
								children: ["شروع مطالعه ", /* @__PURE__ */ (0, O.jsx)("span", {
									"aria-hidden": "true",
									children: "←"
								})]
							}), e.meta && /* @__PURE__ */ (0, O.jsx)("p", {
								className: "hero-meta",
								dangerouslySetInnerHTML: { __html: e.meta }
							})]
						})
					]
				}),
				r?.kind === "binary" && /* @__PURE__ */ (0, O.jsx)(z, { plot: r.plot }),
				r?.kind === "authored" && /* @__PURE__ */ (0, O.jsx)("figure", {
					className: r.className,
					dangerouslySetInnerHTML: { __html: r.html }
				}),
				r?.kind === "threshold-scores" && /* @__PURE__ */ (0, O.jsx)(R, {})
			]
		}), e.highlights.length > 0 && /* @__PURE__ */ (0, O.jsx)("div", {
			className: "shell",
			children: /* @__PURE__ */ (0, O.jsx)("ul", {
				className: "hero-strip",
				"aria-label": "نکات کلیدی یادداشت",
				children: e.highlights.map(({ number: e, html: t }, n) => /* @__PURE__ */ (0, O.jsxs)("li", { children: [/* @__PURE__ */ (0, O.jsx)("span", {
					className: "strip-number",
					dir: "ltr",
					"aria-hidden": "true",
					children: e
				}), /* @__PURE__ */ (0, O.jsx)("span", {
					className: "strip-text",
					dangerouslySetInnerHTML: { __html: t }
				})] }, n))
			})
		})]
	});
});
// frontend/reader/LessonOutline.tsx
function V({ percent: e }) {
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "reader-progress",
		children: [/* @__PURE__ */ (0, O.jsxs)("div", {
			className: "reader-progress-label",
			children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "پیشرفت مطالعه" }), /* @__PURE__ */ (0, O.jsxs)("bdi", { children: [e.toLocaleString("fa-IR"), "٪"] })]
		}), /* @__PURE__ */ (0, O.jsx)("progress", {
			value: e,
			max: 100,
			"aria-label": "پیشرفت مطالعه"
		})]
	});
}
function H({ fact: e, ...t }) {
	let n = (0, o.useRef)(null), { active: r, doc: i } = t;
	return (0, o.useEffect)(() => {
		let e = n.current;
		if (!e || e.clientHeight >= e.scrollHeight) return;
		let t = e.querySelector("[aria-current=\"location\"]");
		if (!t || e.contains(i.activeElement) && t !== i.activeElement) return;
		let r = t.getBoundingClientRect(), a = e.getBoundingClientRect();
		r.top < a.top + 4 ? e.scrollTop += r.top - a.top - 4 : r.bottom > a.bottom - 4 && (e.scrollTop += r.bottom - a.bottom + 4);
	}, [r, i]), /* @__PURE__ */ (0, O.jsxs)("aside", {
		className: "lesson-rail reader-sidebar",
		"aria-label": "مسیر این یادداشت",
		"data-lesson-sidebar": "",
		children: [
			/* @__PURE__ */ (0, O.jsx)(V, { percent: t.percent }),
			t.headings.length > 0 && /* @__PURE__ */ (0, O.jsxs)("nav", {
				ref: n,
				"aria-label": "فهرست بخش‌های درس",
				children: [/* @__PURE__ */ (0, O.jsx)("p", {
					className: "rail-title",
					children: "در این یادداشت"
				}), /* @__PURE__ */ (0, O.jsx)("ol", {
					className: "reader-rail-list",
					children: /* @__PURE__ */ (0, O.jsx)(k, {
						...t,
						rail: !0
					})
				})]
			}),
			e && /* @__PURE__ */ (0, O.jsx)("div", {
				className: "rail-fact",
				dangerouslySetInnerHTML: { __html: e }
			})
		]
	});
}
function U(e) {
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "reader-mobile-outline",
		children: [/* @__PURE__ */ (0, O.jsx)(V, { percent: e.percent }), e.headings.length > 0 && /* @__PURE__ */ (0, O.jsxs)("details", { children: [/* @__PURE__ */ (0, O.jsx)("summary", { children: "فهرست بخش‌های درس" }), /* @__PURE__ */ (0, O.jsx)("nav", {
			className: "reader-mobile-toc",
			"aria-label": "فهرست بخش‌های درس",
			children: /* @__PURE__ */ (0, O.jsx)(k, {
				...e,
				rail: !1
			})
		})] })]
	});
}
function W() {
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		hidden: !0,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, O.jsx)("div", { id: "reading-progress" }),
			/* @__PURE__ */ (0, O.jsx)("ol", { className: "rail-list" }),
			/* @__PURE__ */ (0, O.jsx)("nav", { className: "mobile-toc" }),
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "reading-state",
				children: [/* @__PURE__ */ (0, O.jsx)("span", { id: "reading-label" }), /* @__PURE__ */ (0, O.jsx)("div", { children: /* @__PURE__ */ (0, O.jsx)("i", { id: "sidebar-progress" }) })]
			})
		]
	});
}
// frontend/reader/LessonEnd.tsx
function G({ relation: e, number: t, title: n, href: r }) {
	let i = e === "prev";
	return /* @__PURE__ */ (0, O.jsxs)("a", {
		className: "reader-pager-link reader-pager-" + (i ? "previous" : "next"),
		rel: e,
		href: r,
		dir: "rtl",
		children: [/* @__PURE__ */ (0, O.jsxs)("span", {
			className: "reader-pager-label",
			children: [
				/* @__PURE__ */ (0, O.jsx)("bdi", {
					className: "reader-pager-number",
					dir: "ltr",
					children: t.toLocaleString("fa-IR")
				}),
				/* @__PURE__ */ (0, O.jsx)("span", {
					className: "reader-pager-direction",
					children: i ? "یادداشت قبلی" : "یادداشت بعدی"
				}),
				/* @__PURE__ */ (0, O.jsx)("span", {
					className: "reader-pager-arrow",
					"aria-hidden": "true",
					children: i ? "→" : "←"
				})
			]
		}), /* @__PURE__ */ (0, O.jsx)("strong", { children: /* @__PURE__ */ (0, O.jsx)("bdi", { children: n }) })]
	});
}
var K = (0, o.memo)(function({ info: e, href: t }) {
	let { previous: n, next: r } = c(e);
	return !n && !r ? null : /* @__PURE__ */ (0, O.jsxs)("nav", {
		className: "reader-pager",
		dir: "rtl",
		"aria-label": "یادداشت قبلی و بعدی",
		"data-lesson-pager": "",
		children: [n && /* @__PURE__ */ (0, O.jsx)(G, {
			relation: "prev",
			number: n.number,
			title: n.lesson.title,
			href: t(n.lesson.id + "/")
		}), r && /* @__PURE__ */ (0, O.jsx)(G, {
			relation: "next",
			number: r.number,
			title: r.lesson.title,
			href: t(r.lesson.id + "/")
		})]
	});
}), q = (0, o.memo)(function({ info: e, href: t, data: n, files: r, preview: i }) {
	if (!e.quiz_version && !n.pdf && !n.notebook && !n.extras.length) return null;
	let a = (e, t) => /* @__PURE__ */ (0, O.jsx)(j, {
		path: e,
		label: t,
		className: "button-outline",
		files: r,
		preview: i
	});
	return /* @__PURE__ */ (0, O.jsxs)("section", {
		className: "portal-quiz-link reader-resources",
		id: n.id,
		"aria-label": "منابع و تمرین این یادداشت",
		"data-lesson-resources": "",
		children: [
			/* @__PURE__ */ (0, O.jsx)("h2", { children: "منابع و تمرین این یادداشت" }),
			/* @__PURE__ */ (0, O.jsx)("p", { children: "برای مرور یا شرکت در آزمون، از این بخش شروع کن. فایل‌ها برای مطالعه و اجرای مثال‌ها در دسترس‌اند." }),
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "reader-resource-actions",
				children: [
					e.quiz_version && /* @__PURE__ */ (0, O.jsx)("a", {
						className: "button-forest",
						href: t("quiz/" + e.id + "/"),
						children: "تمرین و آزمون این یادداشت ←"
					}),
					n.pdf && a(n.pdf, "دریافت PDF ↓"),
					n.notebook && a(n.notebook, "دانلود نوت‌بوک انگلیسی ↓")
				]
			}),
			n.extras.length > 0 && /* @__PURE__ */ (0, O.jsx)("div", {
				className: "reader-resource-extras",
				children: n.extras.map((e) => /* @__PURE__ */ (0, O.jsx)("div", { children: a(e.path, e.label) }, e.path))
			}),
			n.note && /* @__PURE__ */ (0, O.jsx)("p", {
				className: "small-note",
				children: n.note
			})
		]
	});
});
function J({ info: e, href: t }) {
	return /* @__PURE__ */ (0, O.jsxs)("footer", {
		className: "lesson-footer",
		children: [/* @__PURE__ */ (0, O.jsxs)("p", { children: [
			"این یادداشت بخشی از کلاس ",
			/* @__PURE__ */ (0, O.jsx)("bdi", { children: e.course.display_title || e.course.title }),
			" است."
		] }), /* @__PURE__ */ (0, O.jsx)("a", {
			href: t(e.course.id + "/"),
			children: "بازگشت به فهرست کلاس ←"
		})]
	});
}
// frontend/reader/navigation.ts
var Y = {
	active: "",
	percent: 0
};
function X(e, t) {
	let [n, r] = (0, o.useState)(Y);
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
var Z = (0, o.memo)(function({ html: e }) {
	return /* @__PURE__ */ (0, O.jsx)("div", {
		"data-reader-prose": "",
		dangerouslySetInnerHTML: { __html: e }
	});
});
function Q({ scope: e, lesson: t, files: n, preview: r }) {
	let i = (0, o.useMemo)(() => new Map(Array.from(e.querySelectorAll("[data-reader-slot]"), (e) => [e.getAttribute("data-reader-slot"), e])), [e]);
	return /* @__PURE__ */ (0, O.jsx)(O.Fragment, { children: t.slots.map((e) => {
		let t = i.get(e.key);
		if (!t) return null;
		let a = e.kind === "copy" ? /* @__PURE__ */ (0, O.jsx)(A, {
			label: e.label,
			text: e.text
		}) : /* @__PURE__ */ (0, O.jsx)(j, {
			...e,
			files: n,
			preview: r
		});
		return (0, D.createPortal)(a, t, e.key);
	}) });
}
var $ = (0, o.memo)(function({ lesson: e, payload: t, options: n, files: r, doc: i }) {
	let [a, s] = (0, o.useState)(null), [c, l] = (0, o.useState)(!1), { active: u, percent: d } = X(a, e.headings), p = {
		headings: e.headings,
		active: u,
		percent: d,
		doc: i
	}, m = {
		info: n.info,
		href: n.href
	}, h = e.headings.find(({ id: t }) => t !== e.resources.id), g = h ? _("#" + encodeURIComponent(h.id), i) : void 0;
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
				if (f(t, n.info.course.id, [".js"])) try {
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
	]), /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
		c && /* @__PURE__ */ (0, O.jsx)("p", {
			className: "shell reader-widget-note",
			role: "status",
			children: "بعضی ابزارهای تعاملی بارگذاری نشدند. متن یادداشت در دسترس است."
		}),
		/* @__PURE__ */ (0, O.jsxs)("div", {
			ref: s,
			"data-reader-document": "",
			"data-reader-template": "",
			children: [
				/* @__PURE__ */ (0, O.jsx)(W, {}),
				/* @__PURE__ */ (0, O.jsx)("div", {
					id: "reader-reading-progress",
					"aria-hidden": "true",
					style: { transform: "scaleX(" + d / 100 + ")" }
				}),
				/* @__PURE__ */ (0, O.jsx)(B, {
					hero: e.hero,
					title: n.info.title,
					start: g
				}),
				/* @__PURE__ */ (0, O.jsxs)("div", {
					className: "shell lesson-shell",
					children: [/* @__PURE__ */ (0, O.jsx)(H, {
						...p,
						fact: e.fact
					}), /* @__PURE__ */ (0, O.jsxs)("article", {
						className: "lesson-body",
						children: [
							/* @__PURE__ */ (0, O.jsx)(U, { ...p }),
							/* @__PURE__ */ (0, O.jsx)(Z, { html: e.html }),
							/* @__PURE__ */ (0, O.jsx)(K, { ...m }),
							/* @__PURE__ */ (0, O.jsx)(q, {
								...m,
								data: e.resources,
								files: r,
								preview: n.preview
							}),
							/* @__PURE__ */ (0, O.jsx)(J, { ...m })
						]
					})]
				})
			]
		}),
		a && /* @__PURE__ */ (0, O.jsx)(Q, {
			scope: a,
			lesson: e,
			files: r,
			preview: n.preview
		})
	] });
}), te = {
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
function ne(e) {
	return !e || typeof e != "object" ? !1 : ["status", "statusCode"].some((t) => t in e && String(e[t]) === "404") || "code" in e && [
		"404",
		"not_found",
		"NoSuchKey"
	].includes(String(e.code)) || "message" in e && /\bobject not found\b/i.test(String(e.message));
}
function re(e, t) {
	let n = new e.AbortController(), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set(), a = () => !n.signal.aborted && t.current();
	function o(o) {
		if (!a()) return Promise.reject(Error("READER_CLOSED"));
		if (!f(o, t.info.course.id, [
			...p,
			...m,
			".js"
		])) return Promise.reject(Error("INVALID_LESSON_RESOURCE"));
		let s = r.get(o);
		if (s) return s;
		let c = (async () => {
			let r;
			try {
				r = await t.getFile(o, n.signal);
			} catch (e) {
				let i = h(o);
				if (!a() || !i || !ne(e)) throw e;
				r = await t.getFile(i, n.signal);
			}
			if (!a()) throw Error("READER_CLOSED");
			let s = te[o.split(".").pop()?.toLowerCase() || ""] || r.type, c = e.URL.createObjectURL(s ? new e.Blob([r], { type: s }) : r);
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
function ie({ info: e, href: t }) {
	return /* @__PURE__ */ (0, O.jsx)("nav", {
		className: "shell route-trail",
		"aria-label": "مسیر صفحه",
		children: /* @__PURE__ */ (0, O.jsxs)("ol", { children: [
			/* @__PURE__ */ (0, O.jsx)("li", { children: /* @__PURE__ */ (0, O.jsx)("a", {
				href: t("index.html"),
				children: "صفحهٔ اصلی"
			}) }),
			/* @__PURE__ */ (0, O.jsx)("li", { children: /* @__PURE__ */ (0, O.jsx)("a", {
				href: t("index.html#classes"),
				children: "کلاس‌ها"
			}) }),
			/* @__PURE__ */ (0, O.jsx)("li", { children: /* @__PURE__ */ (0, O.jsx)("a", {
				href: t(e.course.id + "/"),
				dir: "auto",
				children: e.course.display_title || e.course.title
			}) }),
			/* @__PURE__ */ (0, O.jsx)("li", { children: /* @__PURE__ */ (0, O.jsxs)("span", {
				"aria-current": "page",
				children: [
					"یادداشت ",
					/* @__PURE__ */ (0, O.jsx)("bdi", {
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
function ae({ info: e, href: t }) {
	return /* @__PURE__ */ (0, O.jsxs)("nav", {
		className: "shell lesson-shortcuts",
		"aria-label": "دسترسی‌های یادداشت",
		children: [
			/* @__PURE__ */ (0, O.jsx)("a", {
				className: "quiet-link",
				href: t(e.course.id + "/"),
				children: "فهرست یادداشت‌های کلاس ←"
			}),
			e.lab && /* @__PURE__ */ (0, O.jsx)("a", {
				className: "button-forest",
				href: t(e.lab.path),
				children: "ورود به لابراتور کدنویسی ←"
			}),
			e.quiz_version && /* @__PURE__ */ (0, O.jsx)("a", {
				className: "button-outline",
				href: t("quiz/" + e.id + "/"),
				children: "تمرین و آزمون این یادداشت"
			})
		]
	});
}
function oe({ access: e, options: t }) {
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
	if (e.kind === "guest") return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "gate-card",
		children: [
			/* @__PURE__ */ (0, O.jsx)("h2", { children: "برای ادامه وارد شو." }),
			/* @__PURE__ */ (0, O.jsx)("p", { children: "متن یادداشت‌ها و آزمون‌ها فقط برای اعضای تأییدشدهٔ کلاس در دسترس است." }),
			/* @__PURE__ */ (0, O.jsx)("div", {
				className: "portal-actions",
				children: /* @__PURE__ */ (0, O.jsx)("a", {
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
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "gate-card",
		"aria-busy": n,
		children: [
			/* @__PURE__ */ (0, O.jsx)("h2", { children: e.kind === "error" ? "اطلاعات کلاس دریافت نشد." : "عضویت در کلاس" }),
			/* @__PURE__ */ (0, O.jsx)("p", { children: c }),
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "portal-actions",
				children: [
					e.kind === "unregistered" && /* @__PURE__ */ (0, O.jsx)("button", {
						className: "button-forest",
						type: "button",
						disabled: n,
						onClick: () => void s(!0),
						children: "درخواست دسترسی به کلاس"
					}),
					/* @__PURE__ */ (0, O.jsx)("a", {
						className: "button-outline",
						href: t.href("dashboard/"),
						children: "داشبورد ←"
					}),
					/* @__PURE__ */ (0, O.jsx)("button", {
						className: "button-outline",
						type: "button",
						disabled: n,
						onClick: () => void s(!1),
						children: e.kind === "error" ? "تلاش دوباره" : "به‌روزرسانی وضعیت عضویت"
					})
				]
			}),
			i && /* @__PURE__ */ (0, O.jsx)("p", {
				className: "status-line",
				"data-error": "true",
				role: "status",
				children: "عملیات کامل نشد. دوباره تلاش کن."
			})
		]
	});
}
function se({ state: e, options: t, files: n, doc: r }) {
	let { info: i, href: a } = t;
	return /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)(ie, {
		info: i,
		href: a
	}), e.phase === "ready" && e.prepared ? /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)(ae, {
		info: i,
		href: a
	}), /* @__PURE__ */ (0, O.jsx)($, {
		lesson: e.prepared,
		payload: e.payload,
		files: n,
		options: t,
		doc: r
	})] }) : /* @__PURE__ */ (0, O.jsxs)("section", {
		className: "shell portal-main",
		id: "top",
		children: [/* @__PURE__ */ (0, O.jsx)("header", {
			className: "page-head",
			children: /* @__PURE__ */ (0, O.jsx)("h1", { children: i.title })
		}), e.phase === "gate" ? /* @__PURE__ */ (0, O.jsx)(oe, {
			access: e.access,
			options: t
		}) : e.phase === "loading" ? /* @__PURE__ */ (0, O.jsxs)("div", {
			className: "page-loading",
			role: "status",
			"aria-busy": "true",
			children: [
				/* @__PURE__ */ (0, O.jsx)("span", { className: "page-loading-line" }),
				/* @__PURE__ */ (0, O.jsx)("span", { className: "page-loading-line" }),
				/* @__PURE__ */ (0, O.jsx)("span", { className: "page-loading-line" }),
				/* @__PURE__ */ (0, O.jsx)("p", {
					className: "status-line",
					children: "در حال دریافت یادداشت…"
				})
			]
		}) : /* @__PURE__ */ (0, O.jsxs)("div", {
			className: "gate-card",
			children: [
				/* @__PURE__ */ (0, O.jsx)("h2", { children: "دریافت یادداشت کامل نشد." }),
				/* @__PURE__ */ (0, O.jsx)("p", { children: "اتصال را بررسی کن و دوباره تلاش کن." }),
				/* @__PURE__ */ (0, O.jsxs)("div", {
					className: "portal-actions",
					children: [/* @__PURE__ */ (0, O.jsx)("button", {
						type: "button",
						className: "button-forest",
						onClick: t.retry,
						children: "تلاش دوباره"
					}), /* @__PURE__ */ (0, O.jsx)("a", {
						className: "button-outline",
						href: a("dashboard/"),
						children: "داشبورد ←"
					})]
				})
			]
		})]
	})] });
}
function ce(e, t) {
	let n = e.ownerDocument, r = n.defaultView;
	if (!r) throw Error("READER_WINDOW_UNAVAILABLE");
	let i = re(r, t), a = (0, s.createRoot)(e, { identifierPrefix: "reader-" });
	e.dataset.readerReact = "";
	function o(e) {
		if (!i.alive()) return;
		let r = e.phase === "ready" ? E(n, e.payload, t.info, t.href) : void 0;
		n.body.classList.toggle("classroom-loaded", !!r), a.render(/* @__PURE__ */ (0, O.jsx)(se, {
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
export { ce as mountLessonReader };
