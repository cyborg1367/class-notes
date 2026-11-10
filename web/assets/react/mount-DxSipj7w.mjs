import { a as e, i as t, n, t as r } from "./jsx-runtime-CMv_BHj2.mjs";
import { a as i, i as a, n as o, o as s, r as c, s as l, t as u } from "./QuizResult-CdyqSXHC.mjs";
import { t as d } from "./QuestionFigure-wq52USe_.mjs";
// frontend/quiz/model.ts
var f = /* @__PURE__ */ e(t(), 1), p = n(), m = { text: "" }, h = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function g(e, t) {
	return typeof e == "object" && typeof e[t] == "string" ? e[t] : "";
}
function _(e, t, n) {
	if (e.type === "choice") return {
		complete: e.options.some(([e]) => e === t),
		partial: !1,
		errors: {}
	};
	let r = e.blanks.filter((e) => n.normalizeBlank(g(t, e.id))).length, i = Object.fromEntries(e.blanks.flatMap((e) => {
		let r = n.blankError(g(t, e.id), e.input_kind);
		return r ? [[e.id, r]] : [];
	}));
	return {
		complete: r === e.blanks.length,
		partial: r > 0 && r < e.blanks.length,
		errors: i
	};
}
function v(e, t) {
	if (!h(e)) return {};
	let n = [];
	for (let r of t) {
		let t = e[r.id];
		r.type === "choice" ? typeof t == "string" && r.options.some(([e]) => e === t) && n.push([r.id, t]) : h(t) && n.push([r.id, Object.fromEntries(r.blanks.flatMap((e) => typeof t[e.id] == "string" ? [[e.id, t[e.id]]] : []))]);
	}
	return Object.fromEntries(n);
}
function y(e, t) {
	return !h(e) || e.version !== t || typeof e.id != "string" || !e.id || !h(e.answers) ? null : Object.values(e.answers).every((e) => typeof e == "string" || h(e) && Object.values(e).every((e) => typeof e == "string")) ? {
		id: e.id,
		version: t,
		answers: e.answers
	} : null;
}
function b(e, t, n, r = !1) {
	return e.type === "choice" ? typeof t == "string" ? t : null : Object.fromEntries(e.blanks.flatMap((e) => r || typeof t == "object" && typeof t[e.id] == "string" ? [[e.id, n(g(t, e.id))]] : []));
}
// frontend/quiz/QuestionCard.tsx
var x = r();
function S({ question: e, index: t, answer: n, errors: r, feedback: i, practice: a, checking: u, locked: f, lessonURL: p, blankHelp: m, onChange: h, onPractice: _ }) {
	let v = i?.kind === "check" ? i.item : void 0, y = new Map(v?.parts?.map((e) => [e.id, e.correct]));
	return /* @__PURE__ */ (0, x.jsxs)("section", {
		className: "question-card",
		id: "question-" + e.id,
		"data-question-card": e.id,
		tabIndex: -1,
		children: [
			/* @__PURE__ */ (0, x.jsxs)("div", {
				className: "question-meta",
				children: [/* @__PURE__ */ (0, x.jsxs)("span", { children: [
					"سؤال ",
					l(t + 1),
					" · ",
					e.skill
				] }), /* @__PURE__ */ (0, x.jsxs)("span", { children: [l(e.points), " امتیاز"] })]
			}),
			/* @__PURE__ */ (0, x.jsx)("h2", { children: /* @__PURE__ */ (0, x.jsx)(c, { text: e.stem }) }),
			e.figure && /* @__PURE__ */ (0, x.jsx)(d, { figure: e.figure }),
			e.code && /* @__PURE__ */ (0, x.jsx)(o, {
				code: e.code,
				blanks: e.type === "fill" ? e.blanks : []
			}),
			e.type === "choice" ? /* @__PURE__ */ (0, x.jsxs)("fieldset", {
				className: "quiz-choice",
				children: [/* @__PURE__ */ (0, x.jsxs)("legend", {
					className: "sr-only",
					children: ["گزینه‌های سؤال ", l(t + 1)]
				}), /* @__PURE__ */ (0, x.jsx)("div", {
					className: "quiz-options",
					children: e.options.map(([t, r]) => /* @__PURE__ */ (0, x.jsxs)("label", {
						className: "quiz-option",
						children: [/* @__PURE__ */ (0, x.jsx)("input", {
							type: "radio",
							name: e.id,
							value: t,
							"data-question": e.id,
							checked: n === t,
							disabled: f,
							onChange: (e) => {
								e.currentTarget.checked && h(t);
							}
						}), /* @__PURE__ */ (0, x.jsx)("bdi", {
							dir: "auto",
							children: /* @__PURE__ */ (0, x.jsx)(c, { text: r })
						})]
					}, t))
				})]
			}) : /* @__PURE__ */ (0, x.jsx)("div", {
				className: "blank-fields",
				children: e.blanks.map((t, i) => {
					let a = e.id + "-" + t.id, o = r[t.id];
					return /* @__PURE__ */ (0, x.jsxs)("label", {
						htmlFor: a,
						children: [
							/* @__PURE__ */ (0, x.jsx)("bdi", {
								dir: "ltr",
								children: s(i)
							}),
							" — ",
							t.label,
							/* @__PURE__ */ (0, x.jsx)("input", {
								id: a,
								"data-question": e.id,
								"data-blank": t.id,
								type: "text",
								dir: "ltr",
								maxLength: 200,
								autoComplete: "off",
								autoCapitalize: "off",
								spellCheck: !1,
								"aria-invalid": !!o || y.get(t.id) === !1 || void 0,
								"aria-describedby": a + "-help " + a + "-error",
								"aria-label": `جای خالی ${s(i)}: ${t.label}`,
								value: g(n, t.id),
								disabled: f,
								onChange: (e) => h(e.currentTarget.value, t.id)
							}),
							/* @__PURE__ */ (0, x.jsx)("span", {
								className: "blank-help",
								id: a + "-help",
								children: m(t.input_kind)
							}),
							/* @__PURE__ */ (0, x.jsx)("span", {
								className: "blank-error",
								id: a + "-error",
								"data-blank-error": e.id + ":" + t.id,
								hidden: !o,
								children: o
							})
						]
					}, t.id);
				})
			}),
			/* @__PURE__ */ (0, x.jsxs)("div", {
				className: "question-tools",
				"data-practice-tools": "",
				hidden: !a,
				children: [/* @__PURE__ */ (0, x.jsx)("button", {
					type: "button",
					"data-hint": e.id,
					disabled: f || u,
					onClick: () => _(!0),
					children: "راهنمای مفهومی"
				}), /* @__PURE__ */ (0, x.jsx)("button", {
					type: "button",
					"data-check": e.id,
					disabled: f || u,
					onClick: () => _(!1),
					children: "بررسی پاسخ"
				})]
			}),
			/* @__PURE__ */ (0, x.jsxs)("div", {
				className: "question-feedback" + (v?.correct ? " is-correct" : ""),
				"data-feedback": e.id,
				role: "status",
				"aria-live": "polite",
				hidden: !i,
				children: [
					i?.kind === "notice" && i.text,
					i?.kind === "hint" && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [
						/* @__PURE__ */ (0, x.jsx)("strong", { children: "راهنمای مفهومی" }),
						/* @__PURE__ */ (0, x.jsx)("p", { children: /* @__PURE__ */ (0, x.jsx)(c, { text: i.text }) }),
						/* @__PURE__ */ (0, x.jsx)("p", {
							className: "small-note",
							children: "اکنون دوباره پاسخ بده؛ بررسی پاسخ، مرحلهٔ بعد است."
						})
					] }),
					v && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [
						/* @__PURE__ */ (0, x.jsx)("strong", { children: v.correct ? "پاسخ درست است." : "پاسخ بررسی شد؛ بخش‌های مشخص‌شده را بازبینی کن." }),
						e.type === "fill" && !!v.parts?.length && /* @__PURE__ */ (0, x.jsx)("ul", {
							className: "practice-parts",
							children: e.blanks.filter((e) => y.has(e.id)).map((t) => /* @__PURE__ */ (0, x.jsxs)("li", { children: [
								"جای خالی ",
								/* @__PURE__ */ (0, x.jsx)("bdi", {
									dir: "ltr",
									children: s(e.blanks.indexOf(t))
								}),
								": ",
								y.get(t.id) ? "درست" : "نیازمند بازبینی"
							] }, t.id))
						}),
						v.selected_feedback && /* @__PURE__ */ (0, x.jsx)("p", { children: /* @__PURE__ */ (0, x.jsx)(c, { text: v.selected_feedback }) }),
						v.correct ? /* @__PURE__ */ (0, x.jsx)("p", { children: /* @__PURE__ */ (0, x.jsx)(c, { text: v.explanation }) }) : /* @__PURE__ */ (0, x.jsxs)("details", {
							className: "feedback-detail",
							children: [/* @__PURE__ */ (0, x.jsx)("summary", { children: "نمایش توضیح کامل؛ ممکن است پاسخ را نشان دهد" }), /* @__PURE__ */ (0, x.jsx)("p", { children: /* @__PURE__ */ (0, x.jsx)(c, { text: v.explanation }) })]
						}),
						v.review && /* @__PURE__ */ (0, x.jsx)("a", {
							href: p + "#" + encodeURIComponent(v.review),
							children: "مرور بخش مرتبط در یادداشت ←"
						})
					] })
				]
			})
		]
	});
}
// frontend/quiz/QuizForm.tsx
var C = {
	practice: "تمرین: ابتدا خودت پاسخ بده؛ در صورت نیاز راهنمای مفهومی بگیر و سپس پاسخ را بررسی کن. نتیجهٔ آزمون با تمرین ثبت نمی‌شود.",
	assessment: "آزمون: پاسخ‌ها را کامل کن و پیش از ثبت نهایی مرور کن. راهنما و بررسی پاسخ در این حالت نمایش داده نمی‌شوند."
}, w = class extends f.Component {
	constructor(...e) {
		super(...e), this.state = { failed: !1 };
	}
	static getDerivedStateFromError() {
		return { failed: !0 };
	}
	render() {
		return !this.state.failed && Array.isArray(this.props.view.record.result?.items) ? /* @__PURE__ */ (0, x.jsx)(i, { ...this.props.view }) : /* @__PURE__ */ (0, x.jsxs)("section", {
			className: "panel-card",
			children: [/* @__PURE__ */ (0, x.jsx)("p", {
				role: "status",
				children: "نتیجه ثبت شد، اما نمایش آن کامل نشد."
			}), this.props.receiptURL && /* @__PURE__ */ (0, x.jsx)("a", {
				className: "quiet-link",
				href: this.props.receiptURL,
				children: "باز کردن رسید ثبت‌شده ←"
			})]
		});
	}
};
function T({ options: e, controller: t, view: n }) {
	let r = e.quiz.questions.length, i = e.quiz.questions.filter((e) => e.type === "choice").length, a = e.quiz.questions.reduce((e, t) => e + Number(t.points), 0);
	return /* @__PURE__ */ (0, x.jsxs)("section", {
		className: "panel-card quiz-intro",
		"data-quiz-intro": "",
		hidden: n.started,
		children: [
			/* @__PURE__ */ (0, x.jsx)("h2", { children: "پیش از شروع" }),
			/* @__PURE__ */ (0, x.jsxs)("div", {
				className: "quiz-facts",
				children: [
					/* @__PURE__ */ (0, x.jsxs)("span", { children: [l(r), " سؤال"] }),
					/* @__PURE__ */ (0, x.jsxs)("span", { children: [l(a), " امتیاز"] }),
					/* @__PURE__ */ (0, x.jsx)("span", { children: "زمان پیشنهادی: 10 تا 15 دقیقه" })
				]
			}),
			/* @__PURE__ */ (0, x.jsxs)("p", { children: [
				l(i),
				" سؤال چهارگزینه‌ای و ",
				l(r - i),
				" سؤال تکمیل کد داری. هر جای خالی مستقل امتیاز می‌گیرد؛ کدها در این صفحه اجرا نمی‌شوند."
			] }),
			/* @__PURE__ */ (0, x.jsxs)("ul", {
				className: "quiz-rules",
				children: [
					/* @__PURE__ */ (0, x.jsx)("li", { children: "محدودیت زمانی و تایمر اجباری وجود ندارد." }),
					/* @__PURE__ */ (0, x.jsx)("li", { children: "در تمرین، راهنما و بررسی پاسخ در دسترس است؛ تمرین نتیجهٔ آزمون ثبت نمی‌کند." }),
					/* @__PURE__ */ (0, x.jsx)("li", { children: "در آزمون، نمره و توضیح پاسخ‌ها پس از ثبت نهایی نمایش داده می‌شوند." }),
					/* @__PURE__ */ (0, x.jsx)("li", { children: "ثبت نهایی قابل ویرایش نیست؛ شرکت دوباره مجاز است و اولین و بهترین نتیجه جدا نگه داشته می‌شوند." }),
					/* @__PURE__ */ (0, x.jsx)("li", { children: "دفعات استفاده از راهنما و بررسی تمرینی همراه نتیجه گزارش می‌شوند. تغییر حالت این سابقه را پاک نمی‌کند." })
				]
			}),
			/* @__PURE__ */ (0, x.jsx)(u, {
				summary: e.previousSummary,
				maximum: a
			}),
			n.recovered && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "small-note",
				"data-resume-note": "",
				children: "پیش‌نویس پاسخ‌ها بازیابی شده است؛ با شروع، همان پاسخ‌ها را می‌بینی."
			}),
			n.draft.error && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "status-line",
				"data-error": "true",
				role: "status",
				children: n.draft.text
			}),
			/* @__PURE__ */ (0, x.jsx)("button", {
				className: "button-forest",
				type: "button",
				"data-start": "",
				onClick: t.start,
				children: n.mode === "practice" ? "شروع تمرین" : "شروع آزمون"
			})
		]
	});
}
function E({ options: e, controller: t }) {
	let n = (0, f.useSyncExternalStore)(t.subscribe, t.getSnapshot), r = (0, f.useRef)(null);
	(0, f.useEffect)(() => {
		if (!n.focus || !r.current || n.receipt) return;
		let e = n.focus, t = e.kind === "review" ? r.current.querySelector("[data-review]") : Array.from(r.current.querySelectorAll("[data-question-card]")).find((t) => t.dataset.questionCard === e.id);
		if (!t) return;
		t.focus({ preventScroll: !0 });
		let i = t.ownerDocument.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
		t.scrollIntoView?.({
			behavior: i ? "auto" : "smooth",
			block: "start"
		});
	}, [n.focus, n.receipt]);
	let i = e.quiz.questions, o = i.map((t) => _(t, n.answers[t.id], e)), s = i.flatMap((e, t) => o[t].complete ? [] : [{
		question: e,
		index: t
	}]), c = i.length - s.length, u = n.mode === "practice", d = !!(n.pending || n.submitting || n.receipt), p = n.receipt?.record.id;
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "react-quiz-form",
		"data-react-quiz-form": "",
		ref: r,
		children: [/* @__PURE__ */ (0, x.jsx)(a, { links: e.links }), n.loading ? /* @__PURE__ */ (0, x.jsx)("p", {
			className: "status-line",
			role: "status",
			children: "در حال آماده‌سازی آزمون…"
		}) : /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [
			!n.receipt && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [
				/* @__PURE__ */ (0, x.jsxs)("div", {
					className: "mode-tabs",
					role: "group",
					"aria-label": "انتخاب حالت پاسخ‌گویی",
					children: [/* @__PURE__ */ (0, x.jsx)("button", {
						type: "button",
						"data-mode": "practice",
						"aria-pressed": u,
						disabled: d,
						onClick: () => t.setMode("practice"),
						children: "تمرین با راهنما"
					}), /* @__PURE__ */ (0, x.jsx)("button", {
						type: "button",
						"data-mode": "assessment",
						"aria-pressed": !u,
						disabled: d,
						onClick: () => t.setMode("assessment"),
						children: "آزمون"
					})]
				}),
				/* @__PURE__ */ (0, x.jsx)(T, {
					options: e,
					controller: t,
					view: n
				}),
				/* @__PURE__ */ (0, x.jsx)("p", {
					className: "small-note",
					"data-mode-note": "",
					role: "status",
					children: C[n.mode]
				})
			] }),
			/* @__PURE__ */ (0, x.jsx)("div", {
				"data-result": "",
				children: n.receipt && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [/* @__PURE__ */ (0, x.jsx)("p", {
					className: "status-line",
					role: "status",
					children: n.submission.text
				}), /* @__PURE__ */ (0, x.jsx)(w, {
					receiptURL: p ? e.links.quiz + "?attempt=" + encodeURIComponent(p) : void 0,
					view: {
						...n.receipt,
						prompts: i,
						links: e.links,
						focus: !0
					}
				})] })
			}),
			/* @__PURE__ */ (0, x.jsx)("div", {
				className: "quiz-layout",
				"data-quiz-experience": "",
				hidden: !n.started || !!n.receipt,
				children: !n.receipt && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [/* @__PURE__ */ (0, x.jsxs)("aside", {
					className: "quiz-rail",
					children: [
						/* @__PURE__ */ (0, x.jsx)("h2", { children: "سؤال‌ها" }),
						/* @__PURE__ */ (0, x.jsx)("nav", {
							className: "question-map",
							"aria-label": "شمارهٔ سؤال‌ها",
							children: i.map((e, n) => {
								let r = o[n], i = Object.keys(r.errors).length > 0, a = i ? "قالب پاسخ نیازمند اصلاح" : r.complete ? "تکمیل‌شده" : r.partial ? "نیمه‌کامل" : "بدون پاسخ", s = [
									r.complete && "is-answered",
									r.partial && "is-partial",
									i && "is-invalid"
								].filter(Boolean).join(" ");
								return /* @__PURE__ */ (0, x.jsx)("a", {
									className: s,
									href: "#question-" + encodeURIComponent(e.id),
									"data-map": e.id,
									"aria-label": `سؤال ${l(n + 1)}: ${a}`,
									onClick: (n) => {
										n.preventDefault(), t.focusQuestion(e.id);
									},
									children: l(n + 1)
								}, e.id);
							})
						}),
						/* @__PURE__ */ (0, x.jsxs)("p", {
							"data-answer-count": "",
							children: [
								l(c),
								" از ",
								l(i.length),
								" سؤال کامل شده"
							]
						}),
						/* @__PURE__ */ (0, x.jsx)("span", {
							className: "progress-track",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, x.jsx)("i", {
								"data-answer-progress": "",
								style: { width: c / i.length * 100 + "%" }
							})
						}),
						/* @__PURE__ */ (0, x.jsx)("button", {
							type: "button",
							className: "quiet-button",
							"data-find-missing": "",
							hidden: !s.length,
							onClick: t.findMissing,
							children: "رفتن به سؤال ناقص"
						}),
						/* @__PURE__ */ (0, x.jsx)("p", {
							className: "save-note",
							"data-save-note": "",
							"data-error": !!n.draft.error,
							role: "status",
							children: n.draft.text
						})
					]
				}), /* @__PURE__ */ (0, x.jsx)("div", {
					className: "react-quiz-work",
					children: /* @__PURE__ */ (0, x.jsxs)("form", {
						"data-quiz-form": "",
						noValidate: !0,
						onSubmit: (e) => {
							e.preventDefault(), t.reviewSubmission();
						},
						children: [i.map((r, i) => /* @__PURE__ */ (0, x.jsx)(S, {
							question: r,
							index: i,
							answer: n.answers[r.id],
							errors: o[i].errors,
							feedback: n.feedback[r.id],
							practice: u,
							checking: !!n.checking[r.id],
							locked: d,
							lessonURL: e.links.lesson,
							blankHelp: e.blankHelp,
							onChange: (e, n) => t.setAnswer(r.id, e, n),
							onPractice: (e) => void t.practice(r.id, e)
						}, r.id)), /* @__PURE__ */ (0, x.jsxs)("section", {
							className: "quiz-submit",
							children: [
								/* @__PURE__ */ (0, x.jsx)("p", {
									"data-submit-note": "",
									children: u ? "برای ثبت نتیجه، حالت «آزمون» را انتخاب کن. پاسخ‌های فعلی حفظ می‌شوند." : "پس از مرور، می‌توانی ثبت نهایی را تأیید کنی. سؤال‌های بی‌پاسخ امتیازی نمی‌گیرند."
								}),
								/* @__PURE__ */ (0, x.jsx)("button", {
									className: "button-forest",
									type: "submit",
									"data-submit": "",
									hidden: u,
									disabled: n.submitting,
									children: n.pending ? "بررسی وضعیت همین ارسال ←" : "مرور و ثبت نهایی ←"
								}),
								/* @__PURE__ */ (0, x.jsxs)("section", {
									className: "submission-review",
									"data-review": "",
									hidden: !n.review,
									tabIndex: -1,
									"aria-labelledby": "review-title",
									children: [
										/* @__PURE__ */ (0, x.jsx)("h2", {
											id: "review-title",
											children: "مرور پیش از ثبت"
										}),
										/* @__PURE__ */ (0, x.jsxs)("div", {
											"data-review-body": "",
											children: [
												/* @__PURE__ */ (0, x.jsxs)("p", { children: [
													l(c),
													" از ",
													l(i.length),
													" سؤال کامل شده است."
												] }),
												s.length ? /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [/* @__PURE__ */ (0, x.jsx)("p", { children: "این سؤال‌ها کامل نشده‌اند و ممکن است بخشی از امتیازشان را از دست بدهی:" }), /* @__PURE__ */ (0, x.jsx)("ul", { children: s.map(({ question: e, index: n }) => /* @__PURE__ */ (0, x.jsx)("li", { children: /* @__PURE__ */ (0, x.jsxs)("a", {
													"data-review-question": e.id,
													href: "#question-" + encodeURIComponent(e.id),
													onClick: (n) => {
														n.preventDefault(), t.focusQuestion(e.id);
													},
													children: [
														"سؤال ",
														l(n + 1),
														" · ",
														e.skill
													]
												}) }, e.id)) })] }) : /* @__PURE__ */ (0, x.jsx)("p", { children: "همهٔ سؤال‌ها پاسخ دارند؛ این وضعیت به معنی درست‌بودن پاسخ‌ها نیست." }),
												/* @__PURE__ */ (0, x.jsx)("p", { children: "با تأیید، یک تلاش ثبت می‌شود. پاسخ‌های این تلاش قابل ویرایش نیستند؛ می‌توانی بعداً دوباره شرکت کنی." })
											]
										}),
										/* @__PURE__ */ (0, x.jsxs)("div", {
											className: "portal-actions",
											children: [/* @__PURE__ */ (0, x.jsx)("button", {
												className: "button-forest",
												type: "button",
												"data-confirm-submit": "",
												onClick: () => void t.submit(),
												children: s.length ? `ثبت با ${l(s.length)} سؤال ناقص` : "تأیید و ثبت نهایی"
											}), /* @__PURE__ */ (0, x.jsx)("button", {
												className: "button-outline",
												type: "button",
												"data-edit": "",
												onClick: t.edit,
												children: "بازگشت به پاسخ‌ها"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, x.jsx)("p", {
									className: "status-line",
									"data-submit-status": "",
									"data-error": !!n.submission.error,
									role: "status",
									children: n.submission.text
								})
							]
						})]
					})
				})] })
			})
		] })]
	});
}
// frontend/quiz/controller.ts
var D = "وضعیت ارسال قبلی هنوز مشخص نشده است. همین پاسخ‌ها را دوباره بررسی کن؛ تلاش تکراری ثبت نمی‌شود.";
function O(e) {
	let { quiz: t, lesson: n, userId: r, storage: i } = e, a = `classroom-quiz:${r}:${n}:v${t.version}`, o = a + ":pending", s = new Map(t.questions.map((e) => [e.id, e])), c = /* @__PURE__ */ new Set(), l = y(i.read(o), t.version), u = v(i.read(a), t.questions), d = {
		loading: !0,
		mode: "assessment",
		started: !!l,
		answers: l ? v(l.answers, t.questions) : u,
		pending: l,
		submitting: !1,
		review: !1,
		recovered: !1,
		feedback: {},
		checking: {},
		draft: m,
		submission: l ? { text: D } : m
	}, f = !1, p = 0, g = 0, x = 0, S = !1, C, w = Promise.resolve(), T = () => !f && e.isCurrent();
	function E(e) {
		T() && (d = {
			...d,
			...e
		}, c.forEach((e) => e()));
	}
	let O = (e) => ({
		kind: "question",
		id: e,
		ticket: ++g
	}), k = (t) => _(s.get(t), d.answers[t], e), A = () => t.questions.find((e) => !k(e.id).complete);
	async function j() {
		let n = d.answers;
		if (!l && !Object.keys(u).length) try {
			n = v(await e.loadDraft(), t.questions);
		} catch {
			E({ draft: {
				error: !0,
				text: "پیش‌نویس حساب دریافت نشد؛ پاسخ‌های همین مرورگر، در صورت وجود، حفظ شده‌اند."
			} });
		}
		let r = t.questions.some((e) => {
			let t = n[e.id];
			return typeof t == "string" ? !!t : !!(t && Object.values(t).some(Boolean));
		});
		E({
			loading: !1,
			answers: n,
			recovered: r,
			...l ? { focus: O(t.questions[0].id) } : {}
		});
	}
	function M(t) {
		let n = ++p, r = i.write(a, t);
		E({ draft: {
			error: !r,
			text: r ? "پیش‌نویس در این مرورگر ذخیره شد." : "ذخیره در مرورگر ممکن نشد؛ در حال تلاش برای ذخیره در حساب…"
		} }), clearTimeout(C), C = setTimeout(() => {
			w = w.then(async () => {
				if (!(!T() || S || d.pending || n !== p)) try {
					await e.saveDraft(t), n === p && !d.pending && E({ draft: { text: "پیش‌نویس در حساب ذخیره شد." } });
				} catch {
					n === p && !d.pending && E({ draft: {
						error: !0,
						text: r ? "ذخیره در حساب کامل نشد؛ پیش‌نویس مرورگر باقی است." : "پیش‌نویس ذخیره نشد؛ پیش از بستن صفحه، پاسخ‌ها را نزد خودت نگه دار."
					} });
				}
			});
		}, 800);
	}
	async function N() {
		if (clearTimeout(C), await w, !T() || S || !p) return { saved: !0 };
		let t = i.write(a, d.answers);
		if (d.pending) return {
			saved: !0,
			localSaved: t
		};
		try {
			return await e.saveDraft(d.answers), {
				saved: !0,
				localSaved: t
			};
		} catch {
			return {
				saved: !1,
				localSaved: t
			};
		}
	}
	function P(e) {
		!T() || d.pending || S || e === d.mode || (x++, E({
			mode: e,
			feedback: {},
			review: !1,
			submission: m
		}));
	}
	function F() {
		!d.loading && !d.started && E({
			started: !0,
			focus: O(t.questions[0].id)
		});
	}
	function I(e, t, n) {
		if (!T() || !d.started || d.pending || S) return;
		let r = s.get(e);
		if (!r) return;
		let i = d.answers[e], a;
		if (r.type === "choice") {
			if (!r.options.some(([e]) => e === t)) return;
			a = t;
		} else {
			if (n === void 0 || !r.blanks.some((e) => e.id === n)) return;
			a = {
				...typeof i == "object" ? i : {},
				[n]: t
			};
		}
		let o = {
			...d.answers,
			[e]: a
		}, c = { ...d.feedback };
		delete c[e], E({
			answers: o,
			feedback: c,
			review: !1,
			submission: m
		}), M(o);
	}
	function L(e) {
		s.has(e) && E({
			review: !1,
			focus: O(e)
		});
	}
	async function R(t, n) {
		let r = s.get(t);
		if (!r || !T() || !d.started || d.mode !== "practice" || d.pending || S || d.checking[t]) return;
		let i = (e) => E({ feedback: {
			...d.feedback,
			[t]: {
				kind: "notice",
				text: e
			}
		} });
		if (!n) {
			let e = k(t);
			if (Object.keys(e.errors).length) {
				i("قالب پاسخ را اصلاح کن؛ هنوز درستی مفهوم بررسی نشده است."), L(t);
				return;
			}
			if (!e.complete) {
				i("پاسخ این سؤال را کامل کن، سپس بررسی را بزن.");
				return;
			}
		}
		let a = x, o = d.answers[t];
		E({ checking: {
			...d.checking,
			[t]: !0
		} });
		try {
			let s = await e.practice(t, b(r, o, e.normalizeBlank, !0), n);
			if (!T() || x !== a || d.mode !== "practice" || d.pending || S) return;
			if (!n && o !== d.answers[t]) {
				i("پاسخ هنگام بررسی تغییر کرد؛ پاسخ جدید را دوباره بررسی کن.");
				return;
			}
			let c = s.items?.[0];
			n ? E({ feedback: {
				...d.feedback,
				[t]: {
					kind: "hint",
					text: s.hint ?? ""
				}
			} }) : c ? E({ feedback: {
				...d.feedback,
				[t]: {
					kind: "check",
					item: c
				}
			} }) : i(e.errorText(Error("QUIZ_FEEDBACK_UNAVAILABLE")));
		} catch (t) {
			T() && x === a && d.mode === "practice" && !d.pending && !S && i(e.errorText(t));
		} finally {
			let e = { ...d.checking };
			delete e[t], E({ checking: e });
		}
	}
	function z() {
		let e = t.questions.find((e) => Object.keys(k(e.id).errors).length);
		return !e || (E({
			review: !1,
			focus: O(e.id),
			submission: {
				error: !0,
				text: "قالب بعضی پاسخ‌ها معتبر نیست. آن‌ها را اصلاح کن؛ این پیام دربارهٔ درست یا غلط بودن مفهوم نیست."
			}
		}), !1);
	}
	function B(t) {
		let n = t.result?.score ?? 0;
		return {
			first_score: e.previousSummary?.first_score ?? (Number(t.attempt_no) === 1 ? n : null),
			best_score: Math.max(Number(e.previousSummary?.best_score ?? n), Number(n)),
			last_score: n,
			attempts: t.attempt_no
		};
	}
	async function V() {
		if (!T() || !d.started || d.mode !== "assessment" || d.submitting || S || !d.pending && (!d.review || !z())) return;
		let n = d.pending;
		if (!n) {
			let r = Object.fromEntries(t.questions.flatMap((t) => {
				let n = d.answers[t.id];
				if (n == null) return [];
				let r = b(t, n, e.normalizeBlank);
				return r == null ? [] : [[t.id, r]];
			}));
			try {
				n = {
					id: e.requestId(),
					version: t.version,
					answers: r
				};
			} catch (t) {
				E({ submission: {
					error: !0,
					text: e.errorText(t)
				} });
				return;
			}
			i.write(o, n);
		}
		let r = n;
		clearTimeout(C), x++, E({
			pending: r,
			submitting: !0,
			review: !1,
			feedback: {},
			submission: { text: "در حال ثبت و بررسی پاسخ‌ها…" }
		});
		let s;
		try {
			if (await w, !T()) return;
			if (s = await e.submit(r), !h(s)) throw Error("QUIZ_RECEIPT_UNAVAILABLE");
		} catch (t) {
			E({
				submitting: !1,
				submission: {
					error: !0,
					text: e.errorText(t) + " پاسخ‌های همین ارسال نگه داشته شده‌اند؛ برای مشخص‌شدن وضعیت، دوباره بررسی کن."
				}
			});
			return;
		}
		if (!T()) return;
		S = !0, i.write(o, null), i.write(a, {});
		let c = {
			record: {
				...s,
				answers: r.answers
			},
			summary: B(s)
		};
		E({ submission: { text: "نتیجه ثبت شد؛ در حال آماده‌سازی نمایش…" } }), e.onCommitted();
		try {
			await e.saveDraft({});
		} catch {}
		if (T()) {
			E({
				pending: null,
				submitting: !1,
				receipt: c,
				submission: { text: "نتیجه در حساب ثبت شد." }
			});
			try {
				let t = await e.refreshSummary();
				t && E({ receipt: {
					...c,
					summary: t
				} });
			} catch {}
		}
	}
	function H() {
		T() && d.started && d.mode === "assessment" && !d.submitting && !S && (d.pending ? V() : z() && E({
			review: !0,
			submission: m,
			focus: {
				kind: "review",
				ticket: ++g
			}
		}));
	}
	return {
		load: j,
		start: F,
		setMode: P,
		setAnswer: I,
		practice: R,
		focusQuestion: L,
		prepareSignOut: N,
		reviewSubmission: H,
		submit: V,
		findMissing() {
			let e = A();
			e && L(e.id);
		},
		edit() {
			L((A() || t.questions[0]).id);
		},
		getSnapshot: () => d,
		subscribe(e) {
			return c.add(e), () => c.delete(e);
		},
		dispose() {
			f = !0, clearTimeout(C), c.clear();
		}
	};
}
// frontend/quiz/mount.tsx
function k(e, t) {
	if (!Array.isArray(t.quiz?.questions) || !t.quiz.questions.length) throw Error("QUIZ_UNAVAILABLE");
	let n = O(t), r = (0, p.createRoot)(e, { identifierPrefix: "quiz-form-" });
	return r.render(/* @__PURE__ */ (0, x.jsx)(E, {
		options: t,
		controller: n
	})), {
		load: n.load,
		prepareSignOut: n.prepareSignOut,
		dispose() {
			n.dispose(), r.unmount();
		}
	};
}
export { k as mountQuizForm };
