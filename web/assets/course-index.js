import { a as e, i as t, n, t as r } from "./react/jsx-runtime-CMv_BHj2.mjs";
import { n as i, t as a } from "./react/order-CDcu1aqs.mjs";
import { t as o } from "./react/PaperButton-BMap45ZB.mjs";
import { n as s } from "./react/view-channel-DUJgVbi8.mjs";
// frontend/course-filter-model.mjs
var c = /* @__PURE__ */ e(t(), 1), l = n();
function u(e) {
	return String(e ?? "").normalize("NFKC").toLowerCase().replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[\u064b-\u065f\u0670\u0640]/g, "").replace(/[۰-۹]/g, (e) => String(e.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, (e) => String(e.charCodeAt(0) - 1632)).replace(/[\u200c\u200d\s]+/g, " ").trim();
}
function d(e, t = "", n = "") {
	let r = u(t).split(" ").filter(Boolean), i = u(n);
	return e.filter((e) => {
		let t = u(e.search);
		return r.every((e) => t.includes(e)) && (!i || e.tags.some((e) => u(e) === i));
	});
}
function f(e) {
	let t = /* @__PURE__ */ new Set();
	return e.flatMap((e) => e.tags).filter((e) => {
		let n = u(e);
		return !n || t.has(n) ? !1 : (t.add(n), !0);
	});
}
// frontend/assets/course-figure.svg?raw
var p = "<svg viewBox=\"0 0 530 400\" role=\"img\" aria-label=\"نمای مفهومی نمونه‌ها در فضای دو ویژگی و یک پرس‌وجوی جدید\">\r\n<defs><marker id=\"tip\" markerWidth=\"8\" markerHeight=\"8\" refX=\"6\" refY=\"4\" orient=\"auto\"><path d=\"M1 1 7 4 1 7\" fill=\"none\" stroke=\"#21665d\" stroke-width=\"1.4\"/></marker></defs>\r\n<g stroke=\"#4f6559\" stroke-width=\".7\" opacity=\".20\"><path d=\"M80 80H458M80 150H458M80 220H458M80 290H458M150 40V329M220 40V329M290 40V329M360 40V329M430 40V329\"/></g>\r\n<g stroke=\"#292c25\" stroke-width=\"2\" fill=\"none\"><path d=\"M76 35V332H474\"/><path d=\"m70 46 6-11 6 11M462 326l12 6-12 6\"/></g>\r\n<g font-family=\"Vazirmatn\" font-size=\"19\" fill=\"#24241f\"><text x=\"482\" y=\"339\">x₁</text><text x=\"65\" y=\"24\">x₂</text></g>\r\n<circle cx=\"280\" cy=\"200\" r=\"83\" fill=\"#f4d835\" fill-opacity=\".13\" stroke=\"#21665d\" stroke-width=\"1.7\" stroke-dasharray=\"6 6\"/>\r\n<g stroke=\"#21665d\" stroke-width=\"1.6\" stroke-dasharray=\"4 5\"><path d=\"M280 200 231 174M280 200 304 141M280 200 335 229\"/></g>\r\n<g fill=\"#f4d835\" stroke=\"#30352b\" stroke-width=\"2\"><circle cx=\"127\" cy=\"275\" r=\"8\"/><circle cx=\"166\" cy=\"228\" r=\"8\"/><circle cx=\"178\" cy=\"293\" r=\"8\"/><circle cx=\"231\" cy=\"174\" r=\"8\"/><circle cx=\"216\" cy=\"260\" r=\"8\"/><circle cx=\"304\" cy=\"141\" r=\"8\"/></g>\r\n<g fill=\"#21665d\" stroke=\"#30352b\" stroke-width=\"2\"><circle cx=\"358\" cy=\"92\" r=\"8\"/><circle cx=\"412\" cy=\"125\" r=\"8\"/><circle cx=\"388\" cy=\"185\" r=\"8\"/><circle cx=\"335\" cy=\"229\" r=\"8\"/><circle cx=\"420\" cy=\"264\" r=\"8\"/></g>\r\n<path d=\"m280 188 4 8 9 1-7 7 2 10-8-5-9 5 2-10-7-7 10-1z\" fill=\"#25271f\" stroke=\"#25271f\" stroke-width=\"1.3\"/>\r\n<text x=\"290\" y=\"190\" font-family=\"Vazirmatn\" font-weight=\"bold\" font-size=\"21\" fill=\"#25271f\">q</text>\r\n<g stroke=\"#21665d\" stroke-width=\"1.7\" fill=\"none\" marker-end=\"url(#tip)\"><path d=\"M186 87Q176 114 218 161\"/><path d=\"M444 359Q372 348 302 218\"/></g>\r\n</svg>", m = r(), h = p.replace(/\r\n?/g, "\n"), g = (e) => new Intl.NumberFormat("fa-IR").format(e), _ = (e) => String(e);
function v(e, t) {
	if (!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(t)) throw Error("INVALID_COURSE_ROUTE");
	return t.startsWith(e.id + "/") ? t.slice(e.id.length + 1) + "/" : "../".repeat(e.id.split("/").length) + t + "/";
}
function y({ view: e, channel: t }) {
	let n = !!e.busy, r = e.dashboardURL || "../dashboard/", i = {
		loading: "در حال بررسی دسترسی کلاس…",
		guest: "برای مطالعه وارد شو",
		error: "اطلاعات کلاس دریافت نشد",
		active: "عضویت این کلاس فعال است",
		pending: "درخواست عضویت ثبت شده است",
		suspended: "دسترسی این کلاس غیرفعال است",
		restricted: "عضویت این کلاس نیاز به پیگیری دارد",
		unregistered: "به کلاس بپیوند"
	}, a = {
		loading: "فهرست یادداشت‌ها در دسترس است؛ وضعیت حساب در حال بررسی است.",
		guest: "یادداشت‌ها و تمرین‌ها برای اعضای تأییدشدهٔ کلاس در دسترس‌اند.",
		error: "وضعیت دسترسی مشخص نشد. دریافت اطلاعات را دوباره امتحان کن.",
		active: "یادداشت‌ها و تمرین‌های این مسیر برای حساب تو در دسترس‌اند.",
		pending: "پس از تأیید مدرس، دسترسی به محتوای کلاس فعال می‌شود.",
		suspended: "برای پیگیری وضعیت دسترسی با مدرس در ارتباط باش.",
		restricted: "وضعیت این عضویت را با مدرس بررسی کن.",
		unregistered: "درخواست عضویت بفرست؛ دسترسی پس از تأیید مدرس فعال می‌شود."
	}, s = (e) => {
		t.perform(e);
	};
	return /* @__PURE__ */ (0, m.jsx)("div", {
		className: "course-membership",
		"data-course-membership": "",
		"aria-busy": n || e.phase === "loading",
		children: /* @__PURE__ */ (0, m.jsxs)("section", {
			className: `gate-card course-access-notice course-access-${e.phase}`,
			"aria-labelledby": "course-access-title",
			children: [/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "course-access-copy",
				children: [
					/* @__PURE__ */ (0, m.jsx)("h2", {
						id: "course-access-title",
						children: i[e.phase] || i.error
					}),
					/* @__PURE__ */ (0, m.jsx)("p", { children: a[e.phase] || a.error }),
					e.error && /* @__PURE__ */ (0, m.jsx)("p", {
						className: "course-access-error",
						role: "alert",
						children: e.error
					})
				]
			}), /* @__PURE__ */ (0, m.jsxs)("div", {
				className: "portal-actions course-access-actions",
				hidden: e.phase === "loading",
				children: [
					e.phase === "guest" && /* @__PURE__ */ (0, m.jsxs)(o, {
						href: e.loginURL || "../account/",
						login: !0,
						children: [
							"ورود با ",
							/* @__PURE__ */ (0, m.jsx)("bdi", {
								lang: "en",
								children: "Google"
							}),
							/* @__PURE__ */ (0, m.jsx)("span", {
								"aria-hidden": "true",
								children: "←"
							})
						]
					}),
					e.phase === "active" && /* @__PURE__ */ (0, m.jsx)(o, {
						secondary: !0,
						href: r,
						children: "داشبورد من ←"
					}),
					e.phase === "unregistered" && /* @__PURE__ */ (0, m.jsx)(o, {
						disabled: n,
						onClick: () => s("request-access"),
						children: n ? "در حال ثبت درخواست…" : "درخواست عضویت"
					}),
					[
						"pending",
						"suspended",
						"restricted"
					].includes(e.phase) && /* @__PURE__ */ (0, m.jsx)(o, {
						secondary: !0,
						href: r,
						children: "داشبورد من ←"
					}),
					[
						"error",
						"pending",
						"suspended",
						"restricted"
					].includes(e.phase) && /* @__PURE__ */ (0, m.jsx)(o, {
						secondary: !0,
						disabled: n,
						onClick: () => s("refresh"),
						children: n ? "در حال دریافت…" : "بررسی دوباره"
					})
				]
			})]
		})
	});
}
function b({ lesson: e, index: t, course: n, view: r }) {
	let i = e.ordinal ?? a(e.number, t), s = r.phase === "active" ? r.results[e.id] : null;
	return /* @__PURE__ */ (0, m.jsx)("li", { children: /* @__PURE__ */ (0, m.jsxs)("article", {
		className: "dashboard-lesson course-lesson",
		"data-course-lesson": e.id,
		children: [
			/* @__PURE__ */ (0, m.jsx)("span", {
				className: "lesson-order",
				dir: "ltr",
				lang: "en",
				"aria-label": `یادداشت ${i}`,
				children: String(i).padStart(2, "0")
			}),
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "lesson-details",
				children: [
					/* @__PURE__ */ (0, m.jsx)("h2", { children: e.title }),
					/* @__PURE__ */ (0, m.jsx)("p", {
						className: "lesson-subtitle",
						children: e.subtitle
					}),
					/* @__PURE__ */ (0, m.jsx)("p", { children: e.description }),
					/* @__PURE__ */ (0, m.jsx)("div", {
						className: "expertise",
						"aria-label": "موضوع‌های یادداشت",
						children: e.tags?.map((e) => /* @__PURE__ */ (0, m.jsx)("span", {
							className: "pill",
							dir: "auto",
							children: e
						}, e))
					}),
					r.phase === "active" && /* @__PURE__ */ (0, m.jsx)("p", {
						className: "small-note",
						"data-study-status": "",
						children: r.opened.includes(e.id) ? "در این مرورگر باز شده است." : "هنوز در این مرورگر باز نشده است."
					}),
					r.phase === "active" && !!e.quiz_version && /* @__PURE__ */ (0, m.jsx)("p", {
						className: "small-note",
						"data-course-result": "",
						children: s ? /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [
							"آخرین نتیجهٔ نسخهٔ ",
							/* @__PURE__ */ (0, m.jsx)("bdi", { children: _(s.version) }),
							": ",
							s.score !== null && s.maximum !== null ? /* @__PURE__ */ (0, m.jsxs)("bdi", {
								dir: "ltr",
								children: [
									_(s.score),
									" / ",
									_(s.maximum)
								]
							}) : "برای مشاهده باز کن",
							s.href && /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [" · ", /* @__PURE__ */ (0, m.jsx)("a", {
								href: s.href,
								children: "مشاهدهٔ نتیجه"
							})] })
						] }) : "برای این نسخه از آزمون هنوز نتیجه‌ای ثبت نشده است."
					})
				]
			}),
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "portal-actions",
				children: [
					/* @__PURE__ */ (0, m.jsxs)(o, {
						href: v(n, e.id),
						label: `مطالعهٔ ${e.title}`,
						children: ["مطالعهٔ یادداشت ", /* @__PURE__ */ (0, m.jsx)("span", {
							"aria-hidden": "true",
							children: "←"
						})]
					}),
					e.lab && /* @__PURE__ */ (0, m.jsx)(o, {
						secondary: !0,
						href: v(n, e.lab.path.replace(/\/$/, "")),
						label: `لابراتورِ ${e.title}`,
						children: "لابراتور کدنویسی"
					}),
					!!e.quiz_version && /* @__PURE__ */ (0, m.jsx)(o, {
						secondary: !0,
						href: v(n, "quiz/" + e.id),
						label: `تمرین و آزمونِ ${e.title}`,
						children: "تمرین و آزمون"
					})
				]
			})
		]
	}) });
}
function x({ course: e, view: t, channel: n }) {
	let [r, a] = (0, c.useState)(""), [o, s] = (0, c.useState)(""), l = (0, c.useId)(), u = (0, c.useId)(), p = (0, c.useMemo)(() => i(e.lessons).map(({ lesson: e, number: t }) => ({
		...e,
		ordinal: t
	})), [e]), _ = (0, c.useMemo)(() => p.map((e) => ({
		id: e.id,
		tags: e.tags || [],
		search: [
			e.ordinal,
			String(e.ordinal).padStart(2, "0"),
			e.title,
			e.subtitle || "",
			e.description || "",
			...e.tags || []
		].join(" ")
	})), [p]), x = (0, c.useMemo)(() => f(_), [_]), S = (0, c.useMemo)(() => new Set(d(_, r, o).map((e) => e.id)), [
		_,
		r,
		o
	]), C = !!(r.trim() || o), w = t.phase === "active" ? p.find((e) => e.id === t.last) : null, T = w || p[0], E = () => {
		a(""), s("");
	};
	return /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [
		/* @__PURE__ */ (0, m.jsxs)("header", {
			className: "paper-course-hero",
			children: [/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "paper-course-copy",
				children: [
					/* @__PURE__ */ (0, m.jsx)("h1", {
						className: "course-title",
						dir: "auto",
						children: e.display_title || e.title
					}),
					/* @__PURE__ */ (0, m.jsxs)("p", {
						className: "paper-course-lead",
						children: [
							"از ",
							/* @__PURE__ */ (0, m.jsx)("span", {
								className: "paper-mark",
								children: "فهم داده"
							}),
							" تا ساختن مدل"
						]
					}),
					/* @__PURE__ */ (0, m.jsx)("p", {
						className: "paper-course-description",
						children: e.description
					}),
					/* @__PURE__ */ (0, m.jsxs)("div", {
						className: "paper-instructor",
						children: [/* @__PURE__ */ (0, m.jsx)("span", {
							className: "initials",
							dir: "ltr",
							"aria-hidden": "true",
							children: "MA"
						}), /* @__PURE__ */ (0, m.jsxs)("div", { children: ["مدرس دوره", /* @__PURE__ */ (0, m.jsx)("strong", {
							lang: "en",
							dir: "ltr",
							children: "Masoud Ahangary"
						})] })]
					}),
					T && /* @__PURE__ */ (0, m.jsxs)("section", {
						className: "course-start",
						"aria-labelledby": "course-start-title",
						children: [/* @__PURE__ */ (0, m.jsxs)("div", {
							className: "course-start-copy",
							hidden: !w,
							children: [/* @__PURE__ */ (0, m.jsx)("h2", {
								id: "course-start-title",
								children: "آخرین یادداشت بازشده در این مرورگر"
							}), /* @__PURE__ */ (0, m.jsx)("p", {
								"data-course-start-description": "",
								children: w?.title || T.title
							})]
						}), /* @__PURE__ */ (0, m.jsxs)("a", {
							className: "button-forest",
							"data-course-continue": "",
							href: v(e, T.id),
							children: [w ? "ادامهٔ مطالعه" : /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: ["شروع از یادداشت ", /* @__PURE__ */ (0, m.jsx)("bdi", { children: String(T.ordinal).padStart(2, "0") })] }), /* @__PURE__ */ (0, m.jsx)("span", {
								"aria-hidden": "true",
								children: "←"
							})]
						})]
					})
				]
			}), /* @__PURE__ */ (0, m.jsxs)("figure", {
				className: "paper-course-figure",
				children: [
					/* @__PURE__ */ (0, m.jsx)("div", { dangerouslySetInnerHTML: { __html: h } }),
					/* @__PURE__ */ (0, m.jsx)("span", {
						className: "graph-note graph-note-sample",
						children: "هر نقطه، یک نمونه"
					}),
					/* @__PURE__ */ (0, m.jsx)("span", {
						className: "graph-note graph-note-query",
						children: "پرس‌وجوی جدید"
					}),
					/* @__PURE__ */ (0, m.jsx)("figcaption", { children: "نمای مفهومیِ فضای ویژگی‌ها" })
				]
			})]
		}),
		/* @__PURE__ */ (0, m.jsxs)("section", {
			className: "paper-outline",
			"aria-labelledby": "course-outline-title",
			children: [
				/* @__PURE__ */ (0, m.jsxs)("div", {
					className: "section-heading",
					children: [/* @__PURE__ */ (0, m.jsxs)("div", { children: [/* @__PURE__ */ (0, m.jsx)("h2", {
						id: "course-outline-title",
						children: "یادداشت‌های کلاس"
					}), /* @__PURE__ */ (0, m.jsx)("p", {
						className: "outline-note",
						children: "پیشنهاد مطالعه: به ترتیب شماره‌ها"
					})] }), t.phase === "active" && /* @__PURE__ */ (0, m.jsx)("a", {
						className: "quiet-link",
						"data-course-results-link": "",
						href: (t.dashboardURL || "../dashboard/") + "#results",
						children: "نتایج من ←"
					})]
				}),
				/* @__PURE__ */ (0, m.jsxs)("div", {
					className: "course-filter",
					children: [
						/* @__PURE__ */ (0, m.jsxs)("div", {
							className: "course-toolbar",
							children: [/* @__PURE__ */ (0, m.jsxs)("div", {
								className: "course-filter-fields",
								role: "search",
								"aria-label": "جست‌وجو در یادداشت‌های دوره",
								children: [/* @__PURE__ */ (0, m.jsxs)("div", {
									className: "course-search-field",
									children: [
										/* @__PURE__ */ (0, m.jsx)("label", {
											className: "course-visually-hidden",
											htmlFor: l,
											children: "جست‌وجوی عنوان یا موضوع یادداشت"
										}),
										/* @__PURE__ */ (0, m.jsxs)("svg", {
											viewBox: "0 0 24 24",
											width: "20",
											height: "20",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "1.6",
											"aria-hidden": "true",
											children: [/* @__PURE__ */ (0, m.jsx)("circle", {
												cx: "10.5",
												cy: "10.5",
												r: "6.5"
											}), /* @__PURE__ */ (0, m.jsx)("path", { d: "m16 16 5 5" })]
										}),
										/* @__PURE__ */ (0, m.jsx)("input", {
											id: l,
											type: "search",
											value: r,
											onInput: (e) => a(e.currentTarget.value),
											placeholder: "جست‌وجوی یادداشت…",
											autoComplete: "off",
											spellCheck: !1,
											"aria-controls": "course-lessons-list"
										})
									]
								}), /* @__PURE__ */ (0, m.jsxs)("div", {
									className: "course-topic-field",
									children: [/* @__PURE__ */ (0, m.jsx)("label", {
										className: "course-visually-hidden",
										htmlFor: u,
										children: "انتخاب موضوع"
									}), /* @__PURE__ */ (0, m.jsxs)("select", {
										id: u,
										value: o,
										onChange: (e) => s(e.currentTarget.value),
										"aria-controls": "course-lessons-list",
										children: [/* @__PURE__ */ (0, m.jsx)("option", {
											value: "",
											children: "همهٔ موضوع‌ها"
										}), x.map((e) => /* @__PURE__ */ (0, m.jsx)("option", {
											value: e,
											children: e
										}, e))]
									})]
								})]
							}), /* @__PURE__ */ (0, m.jsx)("p", {
								className: "course-count",
								role: "status",
								"aria-live": "polite",
								"aria-atomic": "true",
								children: C ? `${g(S.size)} از ${g(_.length)} یادداشت` : `${g(_.length)} یادداشت`
							})]
						}),
						C && /* @__PURE__ */ (0, m.jsx)("div", {
							className: "course-filter-meta",
							children: /* @__PURE__ */ (0, m.jsxs)("button", {
								type: "button",
								onClick: E,
								children: ["پاک‌کردن فیلترها ", /* @__PURE__ */ (0, m.jsx)("span", {
									"aria-hidden": "true",
									children: "×"
								})]
							})
						}),
						S.size === 0 && /* @__PURE__ */ (0, m.jsxs)("div", {
							className: "course-search-empty",
							children: [/* @__PURE__ */ (0, m.jsx)("p", { children: "یادداشتی با این جست‌وجو پیدا نشد." }), /* @__PURE__ */ (0, m.jsx)("button", {
								type: "button",
								onClick: E,
								children: "نمایش همهٔ یادداشت‌ها ←"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, m.jsx)("ol", {
					className: "lesson-path",
					id: "course-lessons-list",
					children: p.filter((e) => S.has(e.id)).map((n, r) => /* @__PURE__ */ (0, m.jsx)(b, {
						lesson: n,
						index: r,
						course: e,
						view: t
					}, n.id))
				})
			]
		}),
		/* @__PURE__ */ (0, m.jsx)(y, {
			view: t,
			channel: n
		})
	] });
}
// web/assets/course-view-model.mjs
var S = Object.freeze({
	phase: "loading",
	ownerId: null,
	opened: [],
	last: null,
	results: {},
	busy: null,
	error: ""
});
// frontend/course/CourseApplication.tsx
function C({ course: e, channel: t, onReady: n }) {
	let r = (0, c.useSyncExternalStore)(t.subscribe, t.getSnapshot, () => S);
	return (0, c.useEffect)(() => {
		n?.();
	}, [n]), /* @__PURE__ */ (0, m.jsx)(x, {
		course: e,
		view: r,
		channel: t
	});
}
// frontend/course-index.tsx
var w = /* @__PURE__ */ new Map(), T, E = new Promise((e) => {
	T = e;
});
function D(e) {
	if (w.has(e)) return;
	let t;
	try {
		let e = JSON.parse(document.querySelector("#catalog-data")?.textContent || "[]");
		t = Array.isArray(e) ? e.find((e) => e.id === document.body.dataset.lessonId) : void 0;
	} catch (e) {
		console.warn("Course page:", e), T();
		return;
	}
	if (!t) {
		T();
		return;
	}
	let n = s(e, S), r = (0, l.hydrateRoot)(e, /* @__PURE__ */ (0, m.jsx)(C, {
		course: t,
		channel: n,
		onReady: () => {
			e.dataset.courseMounted = "true", T();
		}
	}), {
		identifierPrefix: "course-",
		onRecoverableError(t) {
			e.dataset.reactRecovery = "true", console.warn("Course render recovery:", t);
		}
	});
	w.set(e, r);
}
function O() {
	for (let [e, t] of w) t.unmount(), delete e.dataset.courseMounted;
	w.clear();
}
function k() {
	document.querySelectorAll("[data-course-react-root]").forEach(D);
}
window.ClassNotesCourseApp = {
	ready: E,
	mountCoursePage: D,
	disposeAll: O
}, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", k, { once: !0 }) : k();
export { O as disposeAll, D as mountCoursePage, E as ready };
