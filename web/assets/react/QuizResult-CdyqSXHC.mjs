import { a as e, i as t, t as n } from "./jsx-runtime-CMv_BHj2.mjs";
// frontend/quiz-result/QuizResult.tsx
var r = /* @__PURE__ */ e(t(), 1), i = n();
function a(e) {
	return e != null && Number.isFinite(Number(e)) ? Number(e).toLocaleString("en-US", { useGrouping: !1 }) : "—";
}
var o = (e) => String.fromCharCode(65 + e);
function s({ value: e, maximum: t }) {
	return /* @__PURE__ */ (0, i.jsxs)("bdi", {
		dir: "ltr",
		children: [
			a(e),
			" / ",
			a(t)
		]
	});
}
function c({ text: e }) {
	return /* @__PURE__ */ (0, i.jsx)(i.Fragment, { children: String(e ?? "").split(/(`[^`]+`)/g).map((e, t) => e.startsWith("`") && e.endsWith("`") ? /* @__PURE__ */ (0, i.jsx)("code", {
		dir: "ltr",
		className: "portal-inline-code",
		children: e.slice(1, -1)
	}, t) : /* @__PURE__ */ (0, i.jsx)(r.Fragment, { children: e }, t)) });
}
function l({ code: e, blanks: t }) {
	return /* @__PURE__ */ (0, i.jsx)("pre", {
		className: "quiz-code",
		dir: "ltr",
		tabIndex: 0,
		children: e.split(/(\{\{\w+\}\})/g).map((e, n) => {
			let a = e.match(/^\{\{(\w+)\}\}$/), s = a ? t.findIndex((e) => e.id === a[1]) : -1;
			return s >= 0 ? /* @__PURE__ */ (0, i.jsxs)("mark", { children: [
				"[",
				o(s),
				"]"
			] }, n) : /* @__PURE__ */ (0, i.jsx)(r.Fragment, { children: e }, n);
		})
	});
}
function u({ summary: e, maximum: t }) {
	return !e || !Number(e.attempts) ? /* @__PURE__ */ (0, i.jsx)("p", {
		className: "small-note",
		children: "هنوز نتیجه‌ای برای این نسخه از آزمون ثبت نشده است."
	}) : /* @__PURE__ */ (0, i.jsxs)("div", {
		className: "quiz-history",
		"aria-label": "سابقهٔ همین نسخه از آزمون",
		children: [
			/* @__PURE__ */ (0, i.jsxs)("div", { children: [/* @__PURE__ */ (0, i.jsx)("span", { children: "اولین نتیجه" }), /* @__PURE__ */ (0, i.jsx)("strong", { children: /* @__PURE__ */ (0, i.jsx)(s, {
				value: e.first_score,
				maximum: t
			}) })] }),
			/* @__PURE__ */ (0, i.jsxs)("div", { children: [/* @__PURE__ */ (0, i.jsx)("span", { children: "بهترین نتیجه" }), /* @__PURE__ */ (0, i.jsx)("strong", { children: /* @__PURE__ */ (0, i.jsx)(s, {
				value: e.best_score,
				maximum: t
			}) })] }),
			e.last_score != null && /* @__PURE__ */ (0, i.jsxs)("div", { children: [/* @__PURE__ */ (0, i.jsx)("span", { children: "آخرین نتیجه" }), /* @__PURE__ */ (0, i.jsx)("strong", { children: /* @__PURE__ */ (0, i.jsx)(s, {
				value: e.last_score,
				maximum: t
			}) })] }),
			/* @__PURE__ */ (0, i.jsxs)("div", { children: [/* @__PURE__ */ (0, i.jsx)("span", { children: "تعداد تلاش‌ها" }), /* @__PURE__ */ (0, i.jsx)("strong", { children: a(e.attempts) })] })
		]
	});
}
function d({ parts: e, answer: t, prompt: n, maximum: r }) {
	let a = e.length ? Number(r) / e.length : 0;
	return /* @__PURE__ */ (0, i.jsx)("div", {
		className: "portal-table-scroll",
		children: /* @__PURE__ */ (0, i.jsxs)("table", {
			className: "portal-table blank-results",
			children: [
				/* @__PURE__ */ (0, i.jsx)("caption", { children: "نتیجهٔ هر جای خالی" }),
				/* @__PURE__ */ (0, i.jsx)("thead", { children: /* @__PURE__ */ (0, i.jsx)("tr", { children: [
					"جای خالی",
					"پاسخ تو",
					"نتیجه",
					"امتیاز",
					"پاسخ پذیرفته‌شده"
				].map((e) => /* @__PURE__ */ (0, i.jsx)("th", {
					scope: "col",
					children: e
				}, e)) }) }),
				/* @__PURE__ */ (0, i.jsx)("tbody", { children: e.map((e, r) => {
					let c = typeof t == "object" ? t?.[e.id] : void 0, l = n?.blanks?.find((t) => t.id === e.id)?.input_kind, u = e.accepted.map((e) => l === "stringLiteral" ? JSON.stringify(e) : e).join(" / ");
					return /* @__PURE__ */ (0, i.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, i.jsx)("th", {
							scope: "row",
							children: /* @__PURE__ */ (0, i.jsx)("bdi", {
								dir: "ltr",
								children: o(r)
							})
						}),
						/* @__PURE__ */ (0, i.jsx)("td", { children: /* @__PURE__ */ (0, i.jsx)("bdi", {
							dir: "ltr",
							children: c || "—"
						}) }),
						/* @__PURE__ */ (0, i.jsx)("td", { children: e.correct ? "درست" : c ? "نیازمند مرور" : "بدون پاسخ" }),
						/* @__PURE__ */ (0, i.jsx)("td", { children: /* @__PURE__ */ (0, i.jsx)(s, {
							value: e.correct ? a : 0,
							maximum: a
						}) }),
						/* @__PURE__ */ (0, i.jsx)("td", { children: /* @__PURE__ */ (0, i.jsx)("bdi", {
							dir: "ltr",
							children: u
						}) })
					] }, e.id);
				}) })
			]
		})
	});
}
function f({ item: e, prompt: t, answer: n, index: r, lesson: o }) {
	let u = e.parts ?? [], f = t?.type === "fill" || u.length > 0, p = e.correct ? "درست" : Number(e.score) > 0 ? "بخشی درست" : n == null ? "بدون پاسخ" : "نیازمند مرور", m = typeof n == "string" ? t?.options?.find((e) => e[0] === n)?.[1] ?? n : "", h = t?.options?.find((t) => t[0] === e.key)?.[1];
	return /* @__PURE__ */ (0, i.jsxs)("article", {
		className: "result-item",
		"data-outcome": e.correct ? "correct" : "review",
		children: [
			/* @__PURE__ */ (0, i.jsxs)("div", {
				className: "question-meta",
				children: [/* @__PURE__ */ (0, i.jsxs)("span", { children: [
					"سؤال ",
					a(r + 1),
					" · ",
					p
				] }), /* @__PURE__ */ (0, i.jsx)("span", { children: /* @__PURE__ */ (0, i.jsx)(s, {
					value: e.score,
					maximum: e.maximum
				}) })]
			}),
			/* @__PURE__ */ (0, i.jsx)("h3", { children: e.skill }),
			t && /* @__PURE__ */ (0, i.jsx)("p", { children: /* @__PURE__ */ (0, i.jsx)(c, { text: t.stem }) }),
			t?.code && /* @__PURE__ */ (0, i.jsx)(l, {
				code: t.code,
				blanks: t.blanks ?? u
			}),
			f ? /* @__PURE__ */ (0, i.jsx)(d, {
				parts: u,
				answer: n,
				prompt: t,
				maximum: e.maximum
			}) : /* @__PURE__ */ (0, i.jsxs)(i.Fragment, { children: [m ? /* @__PURE__ */ (0, i.jsxs)("p", { children: ["پاسخ ثبت‌شده: ", /* @__PURE__ */ (0, i.jsx)("bdi", {
				dir: "auto",
				children: /* @__PURE__ */ (0, i.jsx)(c, { text: m })
			})] }) : /* @__PURE__ */ (0, i.jsx)("p", { children: "پاسخی ثبت نشده بود." }), h && /* @__PURE__ */ (0, i.jsxs)("p", { children: ["پاسخ درست: ", /* @__PURE__ */ (0, i.jsx)(c, { text: h })] })] }),
			/* @__PURE__ */ (0, i.jsx)("p", { children: /* @__PURE__ */ (0, i.jsx)(c, { text: e.explanation }) }),
			e.selected_feedback && /* @__PURE__ */ (0, i.jsx)("p", { children: /* @__PURE__ */ (0, i.jsx)(c, { text: e.selected_feedback }) }),
			e.review && /* @__PURE__ */ (0, i.jsx)("a", {
				href: o + "#" + encodeURIComponent(e.review),
				children: "مرور بخش مرتبط در یادداشت ←"
			})
		]
	});
}
function p(e) {
	let t = e ? new Date(e) : null;
	return t && !Number.isNaN(t.getTime()) ? t.toLocaleString("fa-IR", {
		dateStyle: "medium",
		timeStyle: "short"
	}) : "";
}
function m({ links: e }) {
	return /* @__PURE__ */ (0, i.jsxs)("nav", {
		className: "quiz-context",
		"aria-label": "دسترسی‌های آزمون",
		children: [
			/* @__PURE__ */ (0, i.jsx)("a", {
				className: "quiet-link",
				href: e.lesson,
				children: "بازگشت به یادداشت ←"
			}),
			e.course && /* @__PURE__ */ (0, i.jsx)("a", {
				className: "quiet-link",
				href: e.course,
				children: "فهرست یادداشت‌های کلاس"
			}),
			e.results && /* @__PURE__ */ (0, i.jsx)("a", {
				className: "quiet-link",
				href: e.results,
				children: "همهٔ نتایج من"
			})
		]
	});
}
function h({ record: e, prompts: t, summary: n, links: o, focus: c }) {
	let l = (0, r.useRef)(null);
	(0, r.useEffect)(() => {
		let e = l.current;
		if (!c || !e) return;
		e.focus({ preventScroll: !0 });
		let t = e.ownerDocument.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
		e.scrollIntoView?.({
			behavior: t ? "instant" : "smooth",
			block: "start"
		});
	}, [c]);
	let d = e.result, h = new Map(t.map((e) => [e.id, e])), g = p(e.created_at), _ = Number(d.practice_checks) || 0, v = Number(d.hints_used) || 0;
	return /* @__PURE__ */ (0, i.jsxs)(i.Fragment, { children: [
		!c && o.course && /* @__PURE__ */ (0, i.jsx)(m, { links: o }),
		/* @__PURE__ */ (0, i.jsxs)("section", {
			className: "quiz-result",
			"data-react-quiz-result": "",
			ref: l,
			tabIndex: -1,
			children: [
				/* @__PURE__ */ (0, i.jsxs)("p", {
					className: "eyebrow",
					children: ["نتیجهٔ ثبت‌شده · تلاش ", a(e.attempt_no)]
				}),
				/* @__PURE__ */ (0, i.jsx)("h2", { children: /* @__PURE__ */ (0, i.jsx)(s, {
					value: d.score,
					maximum: d.maximum
				}) }),
				g && /* @__PURE__ */ (0, i.jsx)("p", { children: /* @__PURE__ */ (0, i.jsx)("time", {
					dateTime: e.created_at,
					children: g
				}) }),
				/* @__PURE__ */ (0, i.jsx)("p", { children: "این نتیجه مربوط به همین تلاش است. برای مرور، پاسخ هر سؤال و توضیح آن را ببین." }),
				/* @__PURE__ */ (0, i.jsx)(u, {
					summary: n,
					maximum: d.maximum
				}),
				/* @__PURE__ */ (0, i.jsxs)("p", {
					className: "small-note",
					children: [_ || v ? `تا زمان این ثبت: ${a(_)} بررسی تمرینی و ${a(v)} دریافت راهنما برای این نسخه انجام شده است.` : "برای این نسخه، استفاده‌ای از بررسی تمرینی یا راهنما تا زمان این ثبت گزارش نشده است.", " این شمارش تجمعی است؛ نمره به‌تنهایی نشان‌دهندهٔ تسلط مستقل نیست."]
				}),
				/* @__PURE__ */ (0, i.jsx)("div", {
					className: "result-items",
					children: d.items.map((t, n) => /* @__PURE__ */ (0, i.jsx)(f, {
						item: t,
						prompt: h.get(t.id),
						answer: e.answers?.[t.id],
						index: n,
						lesson: o.lesson
					}, t.id))
				}),
				/* @__PURE__ */ (0, i.jsx)("a", {
					className: "button-outline",
					href: o.review,
					children: "مرور موضوعات این یادداشت ←"
				})
			]
		}),
		o.dashboard ? /* @__PURE__ */ (0, i.jsxs)("div", {
			className: "portal-actions",
			children: [/* @__PURE__ */ (0, i.jsx)("a", {
				className: "button-outline",
				href: o.quiz,
				children: "شرکت دوباره در آزمون ←"
			}), /* @__PURE__ */ (0, i.jsx)("a", {
				className: "quiet-link",
				href: o.dashboard,
				children: "بازگشت به داشبورد"
			})]
		}) : /* @__PURE__ */ (0, i.jsx)("a", {
			className: "button-outline",
			href: o.quiz,
			children: "بازگشت به تمرین و آزمون ←"
		})
	] });
}
export { h as a, m as i, l as n, o, c as r, a as s, u as t };
