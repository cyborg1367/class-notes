import { a as e, i as t, n, t as r } from "./jsx-runtime-CMv_BHj2.mjs";
import { t as i } from "./PaperButton-BMap45ZB.mjs";
import { r as a } from "./runtime-D2U6pln4.mjs";
import { n as o, t as s } from "./MathText-BqcZI-To.mjs";
// frontend/exam/ExamCatalog.tsx
var c = n(), l = /* @__PURE__ */ e(t(), 1), u = r(), d = (e) => Number(e).toLocaleString("fa-IR"), f = (e) => {
	if (!e) return "";
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? "" : t.toLocaleString("fa-IR", {
		dateStyle: "medium",
		timeStyle: "short"
	});
};
function p(e) {
	return e.status === "in_progress" ? "در حال برگزاری" : e.status === "completed" ? "شرکت‌شده" : e.status === "scheduled" ? "هنوز فعال نشده" : e.status === "closed" ? "مهلت شرکت پایان یافته" : e.status === "unavailable" ? "فعلاً در دسترس نیست" : "آمادهٔ شرکت";
}
function m({ exam: e, href: t }) {
	let n = e.status === "available" || e.status === "in_progress", r = e.status === "completed" && e.last_attempt_id ? t + "?attempt=" + encodeURIComponent(e.last_attempt_id) : t, o = e.attempts_allowed == null ? `${d(e.attempts_used ?? 0)} تلاش ثبت‌شده` : `${d(e.attempts_used ?? 0)} از ${d(e.attempts_allowed)} تلاش`, s = e.best_score != null && e.maximum_score != null ? `${d(e.best_score)} از ${d(e.maximum_score)}` : null;
	return /* @__PURE__ */ (0, u.jsxs)("article", {
		className: "exam-card",
		"data-exam-card": e.id,
		children: [/* @__PURE__ */ (0, u.jsx)("div", {
			className: "exam-card-mark",
			children: /* @__PURE__ */ (0, u.jsx)(a, { name: "quiz" })
		}), /* @__PURE__ */ (0, u.jsxs)("div", {
			className: "exam-card-body",
			children: [
				/* @__PURE__ */ (0, u.jsxs)("div", {
					className: "exam-card-heading",
					children: [/* @__PURE__ */ (0, u.jsxs)("div", { children: [/* @__PURE__ */ (0, u.jsx)("p", {
						className: "exam-eyebrow",
						children: "ارزیابی مستقل"
					}), /* @__PURE__ */ (0, u.jsx)("h2", { children: e.title })] }), /* @__PURE__ */ (0, u.jsx)("span", {
						className: "exam-status exam-status-" + e.status,
						children: p(e)
					})]
				}),
				e.subtitle && /* @__PURE__ */ (0, u.jsx)("p", {
					className: "exam-subtitle",
					children: e.subtitle
				}),
				/* @__PURE__ */ (0, u.jsx)("p", {
					className: "exam-description",
					children: e.description
				}),
				/* @__PURE__ */ (0, u.jsxs)("div", {
					className: "exam-facts",
					"aria-label": "مشخصات امتحان",
					children: [
						/* @__PURE__ */ (0, u.jsxs)("span", { children: [
							/* @__PURE__ */ (0, u.jsx)(a, { name: "note" }),
							d(e.question_count),
							" سؤال"
						] }),
						/* @__PURE__ */ (0, u.jsxs)("span", { children: [
							/* @__PURE__ */ (0, u.jsx)(a, { name: "clock" }),
							d(e.duration_minutes),
							" دقیقه"
						] }),
						/* @__PURE__ */ (0, u.jsxs)("span", { children: [/* @__PURE__ */ (0, u.jsx)(a, { name: "check" }), o] }),
						s && /* @__PURE__ */ (0, u.jsxs)("span", { children: [
							/* @__PURE__ */ (0, u.jsx)(a, { name: "medal" }),
							"بهترین نتیجه: ",
							s
						] })
					]
				}),
				(e.available_from || e.available_until) && /* @__PURE__ */ (0, u.jsxs)("p", {
					className: "exam-window",
					children: [
						e.available_from && /* @__PURE__ */ (0, u.jsxs)(u.Fragment, { children: ["شروع: ", f(e.available_from)] }),
						e.available_from && e.available_until && " · ",
						e.available_until && /* @__PURE__ */ (0, u.jsxs)(u.Fragment, { children: ["پایان: ", f(e.available_until)] })
					]
				}),
				/* @__PURE__ */ (0, u.jsx)("div", {
					className: "exam-card-actions",
					children: n ? /* @__PURE__ */ (0, u.jsx)(i, {
						href: r,
						children: e.status === "in_progress" ? "ادامهٔ امتحان ←" : "مشاهده و شروع امتحان ←"
					}) : /* @__PURE__ */ (0, u.jsx)(i, {
						href: r,
						secondary: !0,
						children: "مشاهدهٔ نتیجه / جزئیات"
					})
				})
			]
		})]
	});
}
function h({ exams: e, examURL: t }) {
	return /* @__PURE__ */ (0, u.jsxs)("div", {
		className: "exam-catalog",
		"data-exam-catalog": "",
		children: [
			/* @__PURE__ */ (0, u.jsxs)("header", {
				className: "exam-page-intro",
				children: [
					/* @__PURE__ */ (0, u.jsx)("p", {
						className: "exam-eyebrow",
						children: "CLASS ASSESSMENTS"
					}),
					/* @__PURE__ */ (0, u.jsx)("h1", { children: "امتحانات مستقل" }),
					/* @__PURE__ */ (0, u.jsx)("p", { children: "این بخش برای ارزیابی‌های رسمی کلاس در نظر گرفته شده است. امتحانات اینجا مستقل از تمرین‌های کوتاه هر یادداشت و لابراتورها برگزار می‌شوند." })
				]
			}),
			/* @__PURE__ */ (0, u.jsxs)("section", {
				className: "exam-list-section",
				"aria-labelledby": "exam-list-title",
				children: [/* @__PURE__ */ (0, u.jsxs)("div", {
					className: "exam-section-heading",
					children: [/* @__PURE__ */ (0, u.jsxs)("div", { children: [/* @__PURE__ */ (0, u.jsx)("h2", {
						id: "exam-list-title",
						children: "امتحانات کلاس"
					}), /* @__PURE__ */ (0, u.jsx)("p", { children: "امتحان‌های فعال و سوابق قابل مشاهدهٔ حساب تو" })] }), /* @__PURE__ */ (0, u.jsxs)("span", {
						className: "exam-count",
						children: [d(e.length), " امتحان"]
					})]
				}), e.length ? /* @__PURE__ */ (0, u.jsx)("div", {
					className: "exam-list",
					children: e.map((e) => /* @__PURE__ */ (0, u.jsx)(m, {
						exam: e,
						href: t(e.id)
					}, e.id))
				}) : /* @__PURE__ */ (0, u.jsxs)("div", {
					className: "exam-empty",
					children: [
						/* @__PURE__ */ (0, u.jsx)(a, { name: "note" }),
						/* @__PURE__ */ (0, u.jsx)("h3", { children: "هنوز امتحانی برای این کلاس منتشر نشده است." }),
						/* @__PURE__ */ (0, u.jsx)("p", { children: "وقتی مدرس امتحانی را فعال کند، از همین بخش در دسترس قرار می‌گیرد." })
					]
				})]
			}),
			/* @__PURE__ */ (0, u.jsx)("p", {
				className: "exam-separation-note",
				children: "تمرین‌های هر یادداشت همچنان در صفحهٔ همان یادداشت باقی می‌مانند؛ نتیجهٔ آن‌ها با نتیجهٔ امتحانات مستقل ادغام نمی‌شود."
			})
		]
	});
}
// frontend/exam/ExamRunner.tsx
var g = (e) => Number(e).toLocaleString("fa-IR"), _ = (e) => Object.values(e).filter(Boolean).length, v = (e, t) => {
	let n = Date.parse(e);
	return Number.isFinite(n) ? Math.max(0, Math.ceil((n - t) / 1e3)) : 0;
}, y = (e) => String(Math.max(0, e)).padStart(2, "0"), b = (e) => `${y(Math.floor(e / 60))}:${y(e % 60)}`;
function x({ receipt: e, examListURL: t, onFeedback: n, errorText: r, isTeacher: a, onRetake: c, retakeBusy: d }) {
	let [f, p] = (0, l.useState)(e.feedback_rating ?? 0), [m, h] = (0, l.useState)(e.feedback_comment ?? ""), [_, v] = (0, l.useState)(""), [y, b] = (0, l.useState)(!1), x = Array.isArray(e.feedback) ? e.feedback : [], S = x.filter((e) => !e.is_correct);
	async function C(t) {
		if (t.preventDefault(), !(y || f < 1 || f > 5)) {
			b(!0), v("");
			try {
				await n(e.id, f, m.trim()), v("نظر شما ثبت شد. ممنون از بازخوردتان.");
			} catch (e) {
				v("ثبت نظر انجام نشد: " + r(e));
			} finally {
				b(!1);
			}
		}
	}
	return /* @__PURE__ */ (0, u.jsxs)("section", {
		className: "exam-receipt",
		"data-exam-receipt": "",
		tabIndex: -1,
		children: [/* @__PURE__ */ (0, u.jsxs)("div", {
			className: "exam-receipt-hero",
			children: [/* @__PURE__ */ (0, u.jsxs)("div", {
				className: "exam-receipt-intro",
				children: [
					/* @__PURE__ */ (0, u.jsx)("p", {
						className: "exam-eyebrow",
						children: "کارنامه و بازخورد امتحان"
					}),
					/* @__PURE__ */ (0, u.jsx)("h1", { children: "نتیجهٔ میان‌ترم" }),
					/* @__PURE__ */ (0, u.jsx)("p", {
						className: "exam-result-message",
						children: "این امتحان یک‌بار برگزار می‌شود؛ پاسخ‌ها نهایی شده‌اند و امکان شرکت مجدد وجود ندارد. در این صفحه می‌توانی نمره، پاسخ درست و دلیل هر سؤال را مرور کنی."
					}),
					e.submitted_at && /* @__PURE__ */ (0, u.jsxs)("p", {
						className: "small-note",
						children: ["زمان ثبت: ", new Date(e.submitted_at).toLocaleString("fa-IR", {
							dateStyle: "medium",
							timeStyle: "short"
						})]
					})
				]
			}), /* @__PURE__ */ (0, u.jsxs)("div", {
				className: "exam-receipt-score-card",
				children: [/* @__PURE__ */ (0, u.jsxs)("div", {
					className: "exam-receipt-score",
					children: [/* @__PURE__ */ (0, u.jsx)("strong", { children: g(e.score) }), /* @__PURE__ */ (0, u.jsxs)("span", { children: [
						"از ",
						g(e.maximum_score),
						" امتیاز"
					] })]
				}), /* @__PURE__ */ (0, u.jsxs)("div", {
					className: "exam-receipt-facts",
					children: [
						/* @__PURE__ */ (0, u.jsxs)("div", { children: [/* @__PURE__ */ (0, u.jsx)("span", { children: "پاسخ درست" }), /* @__PURE__ */ (0, u.jsxs)("strong", { children: [
							g(e.correct_count),
							" از ",
							g(e.question_count)
						] })] }),
						/* @__PURE__ */ (0, u.jsxs)("div", { children: [/* @__PURE__ */ (0, u.jsx)("span", { children: "پاسخ نادرست یا بی‌پاسخ" }), /* @__PURE__ */ (0, u.jsx)("strong", { children: g(e.question_count - e.correct_count) })] }),
						/* @__PURE__ */ (0, u.jsxs)("div", { children: [/* @__PURE__ */ (0, u.jsx)("span", { children: "وضعیت" }), /* @__PURE__ */ (0, u.jsx)("strong", { children: e.status === "expired" ? "پایان زمان" : "ثبت نهایی" })] })
					]
				})]
			})]
		}), /* @__PURE__ */ (0, u.jsxs)("div", {
			className: "exam-receipt-layout",
			children: [/* @__PURE__ */ (0, u.jsxs)("section", {
				className: "exam-review-section",
				"aria-labelledby": "exam-review-title",
				children: [/* @__PURE__ */ (0, u.jsxs)("div", {
					className: "exam-section-intro",
					children: [/* @__PURE__ */ (0, u.jsx)("h2", {
						id: "exam-review-title",
						children: "مرور تشریحی پاسخ‌ها"
					}), /* @__PURE__ */ (0, u.jsxs)("p", { children: [g(S.length), " سؤال اشتباه یا بدون پاسخ بوده است. توضیح علمی هر سؤال صرفاً پس از ثبت نهایی نمایش داده می‌شود."] })]
				}), /* @__PURE__ */ (0, u.jsx)("div", {
					className: "exam-review-list",
					children: x.map((e, t) => {
						let n = e.options.find((t) => t.id === e.selected_option), r = e.options.find((t) => t.id === e.correct_option);
						return /* @__PURE__ */ (0, u.jsxs)("article", {
							className: "exam-review-item" + (e.is_correct ? " is-correct" : " is-incorrect"),
							children: [
								/* @__PURE__ */ (0, u.jsxs)("div", {
									className: "exam-review-heading",
									children: [/* @__PURE__ */ (0, u.jsxs)("h3", { children: [
										"سؤال ",
										g(t + 1),
										" · ",
										e.skill
									] }), /* @__PURE__ */ (0, u.jsx)("span", {
										className: "exam-review-state",
										children: e.is_correct ? "درست" : n ? "نادرست" : "بدون پاسخ"
									})]
								}),
								/* @__PURE__ */ (0, u.jsx)("div", {
									className: "exam-review-stem",
									children: /* @__PURE__ */ (0, u.jsx)(s, { text: e.stem })
								}),
								/* @__PURE__ */ (0, u.jsx)(o, { visual: e.visual }),
								/* @__PURE__ */ (0, u.jsxs)("div", {
									className: "exam-review-answers-grid",
									children: [/* @__PURE__ */ (0, u.jsxs)("div", {
										className: "exam-review-answer",
										children: [/* @__PURE__ */ (0, u.jsx)("strong", { children: "پاسخ شما" }), /* @__PURE__ */ (0, u.jsx)("span", { children: /* @__PURE__ */ (0, u.jsx)(s, { text: n ? n.text : "بدون پاسخ" }) })]
									}), /* @__PURE__ */ (0, u.jsxs)("div", {
										className: "exam-review-answer",
										children: [/* @__PURE__ */ (0, u.jsx)("strong", { children: "پاسخ صحیح" }), /* @__PURE__ */ (0, u.jsx)("span", { children: /* @__PURE__ */ (0, u.jsx)(s, { text: r?.text ?? "نامشخص" }) })]
									})]
								}),
								/* @__PURE__ */ (0, u.jsxs)("div", {
									className: "exam-review-rationale",
									children: [
										/* @__PURE__ */ (0, u.jsx)("strong", { children: "چرا؟" }),
										/* @__PURE__ */ (0, u.jsx)("div", { children: /* @__PURE__ */ (0, u.jsx)(s, { text: e.rationale }) }),
										!e.is_correct && e.selected_explanation && /* @__PURE__ */ (0, u.jsxs)("p", {
											className: "exam-review-misconception",
											children: [
												/* @__PURE__ */ (0, u.jsx)("strong", { children: "نکته دربارهٔ انتخاب شما:" }),
												" ",
												/* @__PURE__ */ (0, u.jsx)(s, { text: e.selected_explanation })
											]
										})
									]
								})
							]
						}, e.id);
					})
				})]
			}), /* @__PURE__ */ (0, u.jsxs)("aside", {
				className: "exam-receipt-aside",
				children: [/* @__PURE__ */ (0, u.jsxs)("section", {
					className: "exam-feedback-section",
					"aria-labelledby": "exam-feedback-title",
					children: [
						/* @__PURE__ */ (0, u.jsx)("h2", {
							id: "exam-feedback-title",
							children: "نظرت دربارهٔ امتحان چیست؟"
						}),
						/* @__PURE__ */ (0, u.jsx)("p", { children: "این بازخورد برای مدرس است و هیچ تأثیری بر نمرهٔ شما ندارد." }),
						/* @__PURE__ */ (0, u.jsxs)("form", {
							onSubmit: (e) => void C(e),
							children: [
								/* @__PURE__ */ (0, u.jsxs)("fieldset", { children: [
									/* @__PURE__ */ (0, u.jsx)("legend", { children: "ارزیابی کلی امتحان" }),
									/* @__PURE__ */ (0, u.jsx)("div", {
										className: "exam-feedback-rating",
										children: [
											1,
											2,
											3,
											4,
											5
										].map((e) => /* @__PURE__ */ (0, u.jsxs)("label", { children: [/* @__PURE__ */ (0, u.jsx)("input", {
											name: "exam-feedback-rating",
											type: "radio",
											value: e,
											checked: f === e,
											onChange: () => p(e)
										}), /* @__PURE__ */ (0, u.jsx)("span", { children: g(e) })] }, e))
									}),
									/* @__PURE__ */ (0, u.jsx)("p", {
										className: "small-note",
										children: "۱ = نیازمند بهبود، ۵ = بسیار مناسب"
									})
								] }),
								/* @__PURE__ */ (0, u.jsxs)("label", {
									className: "exam-feedback-comment",
									children: ["نظر یا پیشنهاد (اختیاری)", /* @__PURE__ */ (0, u.jsx)("textarea", {
										value: m,
										maxLength: 1500,
										rows: 5,
										onChange: (e) => h(e.target.value),
										placeholder: "مثلاً دربارهٔ شفافیت سؤال‌ها، زمان و میزان دشواری…"
									})]
								}),
								/* @__PURE__ */ (0, u.jsx)("button", {
									type: "submit",
									className: "button-forest",
									disabled: y || f === 0,
									children: y ? "در حال ثبت…" : "ثبت بازخورد"
								}),
								_ && /* @__PURE__ */ (0, u.jsx)("p", {
									className: "exam-save-state",
									role: "status",
									children: _
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, u.jsxs)("section", {
					className: "exam-receipt-nav",
					children: [
						a && /* @__PURE__ */ (0, u.jsxs)("div", {
							className: "exam-instructor-retake",
							children: [
								/* @__PURE__ */ (0, u.jsx)("h2", { children: "حالت آزمایشی مدرس" }),
								/* @__PURE__ */ (0, u.jsx)("p", { children: "تلاش‌های آزمایشی مدرس محدودیتی ندارند و در آمار دانشجویان شمرده نمی‌شوند." }),
								/* @__PURE__ */ (0, u.jsx)("button", {
									type: "button",
									className: "button-forest",
									disabled: d,
									onClick: c,
									children: d ? "در حال آماده‌سازی…" : "شروع تلاش آزمایشی جدید"
								})
							]
						}),
						/* @__PURE__ */ (0, u.jsx)("h2", { children: "گام بعدی" }),
						/* @__PURE__ */ (0, u.jsx)("p", { children: "اگر لازم است دوباره فهرست امتحانات یا صفحهٔ کلاس را ببینی، از این بخش برگرد." }),
						/* @__PURE__ */ (0, u.jsx)(i, {
							href: t,
							children: "بازگشت به فهرست امتحانات ←"
						})
					]
				})]
			})]
		})]
	});
}
function S({ question: e, index: t, answer: n, disabled: r, onChange: i }) {
	return /* @__PURE__ */ (0, u.jsxs)("article", {
		className: "exam-question",
		id: "exam-question-" + e.id,
		"data-exam-question": e.id,
		tabIndex: -1,
		children: [
			/* @__PURE__ */ (0, u.jsx)("div", {
				className: "exam-question-meta",
				children: /* @__PURE__ */ (0, u.jsxs)("span", { children: [
					"سؤال ",
					g(t + 1),
					" ",
					/* @__PURE__ */ (0, u.jsx)("i", {
						"aria-hidden": "true",
						children: "·"
					}),
					" ",
					e.skill
				] })
			}),
			/* @__PURE__ */ (0, u.jsx)("div", {
				className: "exam-question-stem",
				role: "heading",
				"aria-level": 2,
				children: /* @__PURE__ */ (0, u.jsx)(s, { text: e.stem })
			}),
			/* @__PURE__ */ (0, u.jsx)(o, { visual: e.visual }),
			/* @__PURE__ */ (0, u.jsxs)("fieldset", {
				className: "exam-options",
				disabled: r,
				children: [/* @__PURE__ */ (0, u.jsxs)("legend", {
					className: "sr-only",
					children: ["گزینه‌های سؤال ", g(t + 1)]
				}), e.options.map((t, r) => /* @__PURE__ */ (0, u.jsxs)("label", {
					className: "exam-option" + (n === t.id ? " is-selected" : ""),
					children: [
						/* @__PURE__ */ (0, u.jsx)("input", {
							type: "radio",
							name: e.id,
							value: t.id,
							checked: n === t.id,
							onChange: () => i(t.id)
						}),
						/* @__PURE__ */ (0, u.jsx)("span", {
							className: "exam-option-key",
							children: String.fromCharCode(65 + r)
						}),
						/* @__PURE__ */ (0, u.jsx)("span", {
							className: "exam-option-text",
							children: /* @__PURE__ */ (0, u.jsx)(s, { text: t.text })
						})
					]
				}, t.id))]
			})
		]
	});
}
var C = (0, l.forwardRef)(function(e, t) {
	let { exam: n, activeAttempt: r, receipt: i, examListURL: a, storage: o, onStart: s, onSave: c, onSubmit: d, onFeedback: f, onCommitted: p, isCurrent: m, errorText: h, isTeacher: y = !1 } = e, C = r ? o.read(`classroom-exam:${n.id}:${r.id}`) : null, w = {};
	if (C && typeof C == "object" && !Array.isArray(C)) for (let e of r?.questions ?? []) {
		let t = C[e.id];
		typeof t == "string" && e.options.some((e) => e.id === t) && (w[e.id] = t);
	}
	let [T, ee] = (0, l.useState)(r ?? null), [E, D] = (0, l.useState)(() => ({
		...r?.answers ?? {},
		...w
	})), [O, k] = (0, l.useState)(i ?? null), [A, j] = (0, l.useState)(!1), [M, N] = (0, l.useState)(""), [P, F] = (0, l.useState)(!1), [I, L] = (0, l.useState)(!1), [R, z] = (0, l.useState)(""), [te, B] = (0, l.useState)(""), [ne, V] = (0, l.useState)(Date.now()), [re, ie] = (0, l.useState)(() => r?.server_now ? Date.parse(r.server_now) - Date.now() : 0), H = (0, l.useRef)(void 0), U = (0, l.useRef)(Promise.resolve()), W = (0, l.useRef)({
		attempt: T,
		answers: E,
		receipt: O
	}), G = (0, l.useRef)(!1), K = (0, l.useRef)(!0);
	W.current = {
		attempt: T,
		answers: E,
		receipt: O
	}, (0, l.useEffect)(() => (K.current = !0, () => {
		K.current = !1, clearTimeout(H.current);
	}), []);
	let q = (0, l.useMemo)(() => _(E), [E]), J = T ? v(T.expires_at, ne + re) : n.duration_minutes * 60;
	async function Y(e, t) {
		try {
			return await c(e, t), K.current && m() && B("پاسخ‌ها ذخیره شده‌اند."), !0;
		} catch (e) {
			return K.current && m() && B("ذخیرهٔ آنلاین انجام نشد؛ پاسخ‌ها در این مرورگر نگه داشته شده‌اند. " + h(e)), !1;
		}
	}
	(0, l.useImperativeHandle)(t, () => ({ async prepareSignOut() {
		clearTimeout(H.current);
		let e = W.current;
		return !e.attempt || e.receipt || e.attempt.status !== "in_progress" ? { saved: !0 } : (o.write(`classroom-exam:${n.id}:${e.attempt.id}`, e.answers), await U.current, { saved: await Y(e.attempt.id, e.answers) });
	} }), [
		n.id,
		m,
		c,
		o
	]), (0, l.useEffect)(() => {
		if (!T || O || T.status !== "in_progress") return;
		let e = `classroom-exam:${n.id}:${T.id}`;
		return o.write(e, E), clearTimeout(H.current), H.current = setTimeout(() => {
			if (!m() || G.current) return;
			let e = U.current.then(() => Y(T.id, E));
			U.current = e;
		}, 850), () => clearTimeout(H.current);
	}, [
		E,
		T,
		n.id,
		m,
		O,
		o
	]), (0, l.useEffect)(() => {
		if (!T || O || T.status !== "in_progress") return;
		let e = window.setInterval(() => V(Date.now()), 1e3);
		return () => window.clearInterval(e);
	}, [T, O]);
	async function X(e = !1) {
		if (!(A || !e && (T || O) || !m())) {
			if (!y && !e && !M.trim()) z("کد ورود امتحان را وارد کن.");
			else {
				j(!0), z("");
				try {
					let e = await s(y ? "" : M.trim());
					if (!m() || !K.current) return;
					if (!e || !Array.isArray(e.questions) || !e.questions.length || !e.expires_at) throw Error("EXAM_START_RESPONSE_INVALID");
					ee(e), k(null), L(!1), N(""), D(e.answers ?? {}), ie(e.server_now ? Date.parse(e.server_now) - Date.now() : 0), V(Date.now());
				} catch (e) {
					K.current && m() && z(h(e));
				} finally {
					K.current && j(!1);
				}
			}
		}
	}
	async function Z(e = !1) {
		let t = W.current;
		if (t.attempt && !t.receipt && !G.current && m()) {
			G.current = !0, F(!0), L(!1), z(e ? "زمان امتحان به پایان رسیده است؛ در حال ثبت پاسخ‌های ذخیره‌شده…" : "در حال ثبت نهایی پاسخ‌ها…"), clearTimeout(H.current), o.write(`classroom-exam:${n.id}:${t.attempt.id}`, t.answers), await U.current;
			try {
				let e = await d(t.attempt.id, t.answers);
				if (!m() || !K.current) return;
				k(e), o.write(`classroom-exam:${n.id}:${t.attempt.id}`, null), z("نتیجهٔ امتحان ثبت شد."), p();
			} catch (e) {
				G.current = !1, K.current && m() && (F(!1), z(h(e) + " پاسخ‌های ثبت‌شده در این مرورگر حفظ شده‌اند؛ دوباره تلاش کن."));
			}
		}
	}
	(0, l.useEffect)(() => {
		T && !O && J === 0 && !G.current && Z(!0);
	}, [
		J,
		T,
		O
	]);
	function ae(e, t) {
		P || O || !T || J <= 0 || T.questions.find((t) => t.id === e)?.options.some((e) => e.id === t) && (D((n) => ({
			...n,
			[e]: t
		})), z(""));
	}
	if (O) return /* @__PURE__ */ (0, u.jsx)("div", {
		className: "exam-runner",
		"data-exam-runner": "",
		children: /* @__PURE__ */ (0, u.jsx)(x, {
			receipt: O,
			examListURL: a,
			onFeedback: f,
			errorText: h,
			isTeacher: y,
			retakeBusy: A,
			onRetake: () => void X(!0)
		})
	});
	if (!T) return /* @__PURE__ */ (0, u.jsxs)("div", {
		className: "exam-runner",
		"data-exam-runner": "",
		children: [
			/* @__PURE__ */ (0, u.jsx)("nav", {
				className: "exam-context",
				children: /* @__PURE__ */ (0, u.jsx)("a", {
					href: a,
					children: "فهرست امتحانات ←"
				})
			}),
			/* @__PURE__ */ (0, u.jsxs)("header", {
				className: "exam-runner-heading",
				children: [
					/* @__PURE__ */ (0, u.jsx)("p", {
						className: "exam-eyebrow",
						children: "EXAM SESSION"
					}),
					/* @__PURE__ */ (0, u.jsx)("h1", { children: n.title }),
					/* @__PURE__ */ (0, u.jsx)("p", { children: n.description })
				]
			}),
			/* @__PURE__ */ (0, u.jsxs)("section", {
				className: "exam-start-panel",
				children: [
					/* @__PURE__ */ (0, u.jsx)("h2", { children: "پیش از شروع" }),
					/* @__PURE__ */ (0, u.jsxs)("div", {
						className: "exam-start-facts",
						children: [
							/* @__PURE__ */ (0, u.jsxs)("span", { children: [g(n.question_count), " سؤال چهارگزینه‌ای"] }),
							/* @__PURE__ */ (0, u.jsxs)("span", { children: [g(n.duration_minutes), " دقیقه"] }),
							/* @__PURE__ */ (0, u.jsx)("span", { children: "ثبت نهایی آنلاین" })
						]
					}),
					/* @__PURE__ */ (0, u.jsxs)("ul", { children: [
						/* @__PURE__ */ (0, u.jsx)("li", { children: "زمان از لحظهٔ شروع محاسبه می‌شود و با بستن صفحه متوقف نخواهد شد." }),
						/* @__PURE__ */ (0, u.jsx)("li", { children: "می‌توانی بین سؤال‌ها جابه‌جا شوی و پاسخ‌ها را تا پایان زمان تغییر بدهی." }),
						/* @__PURE__ */ (0, u.jsx)("li", { children: "پاسخ‌ها هنگام امتحان به‌صورت خودکار ذخیره می‌شوند." }),
						/* @__PURE__ */ (0, u.jsx)("li", { children: "پس از پایان زمان، پاسخ‌های ذخیره‌شده برای ثبت نهایی ارسال می‌شوند." }),
						/* @__PURE__ */ (0, u.jsx)("li", { children: "هر دانشجو فقط یک فرصت شرکت دارد؛ بستن صفحه یا Refresh کردن فرصت تازه‌ای ایجاد نمی‌کند." }),
						/* @__PURE__ */ (0, u.jsx)("li", { children: "بلافاصله بعد از ثبت نهایی، نمره، پاسخ‌های صحیح و توضیح هر سؤال نمایش داده می‌شود." })
					] }),
					!y && /* @__PURE__ */ (0, u.jsxs)("label", {
						className: "exam-access-label",
						htmlFor: "exam-access-code",
						children: [
							"کد ورود امتحان",
							/* @__PURE__ */ (0, u.jsx)("input", {
								id: "exam-access-code",
								className: "exam-access-input",
								type: "text",
								dir: "ltr",
								autoComplete: "off",
								spellCheck: !1,
								maxLength: 100,
								value: M,
								onChange: (e) => N(e.target.value),
								placeholder: "Enter access code"
							}),
							/* @__PURE__ */ (0, u.jsx)("small", { children: "کد اعلام‌شده توسط مدرس را وارد کن. کد هنگام بررسی در سرور اعتبارسنجی می‌شود." })
						]
					}),
					y && /* @__PURE__ */ (0, u.jsx)("p", {
						className: "exam-teacher-notice",
						children: "حالت مدرس: می‌توانی بدون کد ورود و بدون محدودیت دفعات شرکت کنی."
					}),
					R && /* @__PURE__ */ (0, u.jsx)("p", {
						className: "exam-alert",
						role: "alert",
						children: R
					}),
					/* @__PURE__ */ (0, u.jsx)("button", {
						type: "button",
						className: "button-forest",
						disabled: A || !y && !M.trim() || !["available", "in_progress"].includes(n.status),
						onClick: () => void X(),
						children: A ? "در حال آماده‌سازی…" : n.status === "scheduled" ? "امتحان هنوز فعال نشده" : n.status === "closed" ? "مهلت شرکت پایان یافته" : "شروع امتحان"
					})
				]
			})
		]
	});
	let Q = T.questions, $ = Q.filter((e) => !E[e.id]), oe = P || J <= 0;
	return /* @__PURE__ */ (0, u.jsxs)("div", {
		className: "exam-runner",
		"data-exam-runner": "",
		children: [
			/* @__PURE__ */ (0, u.jsx)("nav", {
				className: "exam-context",
				children: /* @__PURE__ */ (0, u.jsx)("a", {
					href: a,
					children: "فهرست امتحانات ←"
				})
			}),
			/* @__PURE__ */ (0, u.jsxs)("header", {
				className: "exam-live-header",
				children: [/* @__PURE__ */ (0, u.jsxs)("div", { children: [
					/* @__PURE__ */ (0, u.jsx)("p", {
						className: "exam-eyebrow",
						children: "MIDTERM EXAM"
					}),
					/* @__PURE__ */ (0, u.jsx)("h1", { children: n.title }),
					/* @__PURE__ */ (0, u.jsxs)("p", { children: [
						g(Q.length),
						" سؤال · ",
						g(n.duration_minutes),
						" دقیقه"
					] })
				] }), /* @__PURE__ */ (0, u.jsxs)("div", {
					className: "exam-clock" + (J <= 300 ? " is-warning" : ""),
					role: "timer",
					"aria-live": "off",
					"aria-label": "زمان باقی‌مانده " + b(J),
					children: [/* @__PURE__ */ (0, u.jsx)("span", { children: "زمان باقی‌مانده" }), /* @__PURE__ */ (0, u.jsx)("strong", {
						dir: "ltr",
						children: b(J)
					})]
				})]
			}),
			/* @__PURE__ */ (0, u.jsxs)("div", {
				className: "exam-progress-row",
				children: [/* @__PURE__ */ (0, u.jsxs)("span", { children: [
					g(q),
					" از ",
					g(Q.length),
					" سؤال پاسخ داده شده"
				] }), /* @__PURE__ */ (0, u.jsxs)("span", { children: [g($.length), " سؤال بی‌پاسخ"] })]
			}),
			/* @__PURE__ */ (0, u.jsx)("div", {
				className: "exam-progress-track",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, u.jsx)("i", { style: { width: `${q / Math.max(Q.length, 1) * 100}%` } })
			}),
			/* @__PURE__ */ (0, u.jsxs)("div", {
				className: "exam-live-layout",
				children: [/* @__PURE__ */ (0, u.jsxs)("aside", {
					className: "exam-question-rail",
					children: [
						/* @__PURE__ */ (0, u.jsx)("h2", { children: "سؤال‌ها" }),
						/* @__PURE__ */ (0, u.jsx)("nav", {
							"aria-label": "رفتن به سؤال",
							children: Q.map((e, t) => /* @__PURE__ */ (0, u.jsx)("a", {
								href: "#exam-question-" + encodeURIComponent(e.id),
								className: E[e.id] ? "is-answered" : "",
								"aria-label": `سؤال ${g(t + 1)}${E[e.id] ? "، پاسخ داده شده" : "، بی‌پاسخ"}`,
								children: g(t + 1)
							}, e.id))
						}),
						/* @__PURE__ */ (0, u.jsx)("p", {
							className: "exam-save-state",
							role: "status",
							children: te || "ذخیرهٔ خودکار پاسخ‌ها فعال است."
						})
					]
				}), /* @__PURE__ */ (0, u.jsxs)("form", {
					className: "exam-question-list",
					onSubmit: (e) => {
						e.preventDefault(), L(!0);
					},
					children: [Q.map((e, t) => /* @__PURE__ */ (0, u.jsx)(S, {
						question: e,
						index: t,
						answer: E[e.id],
						disabled: oe,
						onChange: (t) => ae(e.id, t)
					}, e.id)), /* @__PURE__ */ (0, u.jsxs)("section", {
						className: "exam-submit-panel",
						children: [
							/* @__PURE__ */ (0, u.jsx)("p", { children: $.length ? `${g($.length)} سؤال هنوز پاسخ ندارد. سؤال‌های بی‌پاسخ امتیازی دریافت نمی‌کنند.` : "همهٔ سؤال‌ها پاسخ داده شده‌اند. پیش از ثبت نهایی می‌توانی پاسخ‌ها را مرور کنی." }),
							R && /* @__PURE__ */ (0, u.jsx)("p", {
								className: "exam-alert",
								role: "status",
								children: R
							}),
							J <= 0 && !O ? /* @__PURE__ */ (0, u.jsx)("button", {
								className: "button-forest",
								type: "button",
								disabled: P,
								onClick: () => void Z(!0),
								children: P ? "در حال ثبت…" : "ارسال پاسخ‌های ذخیره‌شده"
							}) : I ? /* @__PURE__ */ (0, u.jsxs)("div", {
								className: "exam-submit-confirm",
								"data-exam-confirm": "",
								children: [
									/* @__PURE__ */ (0, u.jsx)("h2", { children: "تأیید ثبت نهایی" }),
									/* @__PURE__ */ (0, u.jsxs)("p", { children: ["پس از ثبت، امکان تغییر پاسخ‌ها وجود ندارد. ", $.length ? `تعداد ${g($.length)} سؤال بدون پاسخ باقی می‌ماند.` : "تمام سؤال‌ها پاسخ دارند."] }),
									/* @__PURE__ */ (0, u.jsxs)("div", {
										className: "exam-actions",
										children: [/* @__PURE__ */ (0, u.jsx)("button", {
											className: "button-forest",
											type: "button",
											disabled: P,
											onClick: () => void Z(!1),
											children: P ? "در حال ثبت…" : "تأیید و ثبت نهایی"
										}), /* @__PURE__ */ (0, u.jsx)("button", {
											className: "button-outline",
											type: "button",
											disabled: P,
											onClick: () => L(!1),
											children: "بازگشت به سؤال‌ها"
										})]
									})
								]
							}) : /* @__PURE__ */ (0, u.jsx)("button", {
								className: "button-forest",
								type: "submit",
								disabled: P,
								children: "مرور و ثبت نهایی پاسخ‌ها"
							})
						]
					})]
				})]
			})
		]
	});
});
// frontend/exam/mount.tsx
function w(e, t) {
	if (!Array.isArray(t.exams)) throw Error("EXAM_CATALOG_INVALID");
	let n = (0, c.createRoot)(e, { identifierPrefix: "exam-catalog-" });
	return n.render(/* @__PURE__ */ (0, u.jsx)(h, {
		exams: t.exams,
		examURL: t.examURL
	})), { dispose() {
		n.unmount();
	} };
}
function T(e, t) {
	let n = { current: null }, r = (0, c.createRoot)(e, { identifierPrefix: "exam-runner-" });
	return r.render(/* @__PURE__ */ (0, u.jsx)(C, {
		ref: (e) => {
			n.current = e;
		},
		...t
	})), {
		prepareSignOut: () => n.current?.prepareSignOut() ?? Promise.resolve({ saved: !0 }),
		dispose() {
			n.current = null, r.unmount();
		}
	};
}
export { w as mountExamCatalog, T as mountExamRunner };
