import { n as e, r as t, t as n } from "./jsx-runtime-CMv_BHj2.mjs";
import { r } from "./runtime-D2U6pln4.mjs";
// frontend/lab/LabStory.tsx
var i = t(), a = e(), o = n(), s = {
	start: "شروع مأموریت",
	resume: "ادامهٔ مأموریت",
	return: "برگشت به مأموریت"
}, c = new Intl.NumberFormat("fa-IR");
function l({ dataset: e }) {
	let t = e.X.slice(0, 3);
	return /* @__PURE__ */ (0, o.jsxs)(o.Fragment, { children: [/* @__PURE__ */ (0, o.jsxs)("p", {
		className: "lab-intro-kicker",
		id: "lab-sample-label",
		children: [
			"نمونه‌ای از داده‌ها · ",
			c.format(t.length),
			" سطر از ",
			c.format(e.X.length),
			" سطر"
		]
	}), /* @__PURE__ */ (0, o.jsx)("div", {
		className: "lab-intro-table",
		role: "region",
		"aria-labelledby": "lab-sample-label",
		tabIndex: 0,
		children: /* @__PURE__ */ (0, o.jsxs)("table", {
			"aria-labelledby": "lab-sample-label",
			children: [/* @__PURE__ */ (0, o.jsx)("thead", { children: /* @__PURE__ */ (0, o.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, o.jsx)("th", {
					scope: "col",
					children: "شناسه"
				}),
				e.columns.map((e, t) => /* @__PURE__ */ (0, o.jsx)("th", {
					scope: "col",
					children: e.label
				}, t)),
				e.texts && /* @__PURE__ */ (0, o.jsx)("th", {
					scope: "col",
					children: "متن پیامک"
				}),
				e.y && /* @__PURE__ */ (0, o.jsx)("th", {
					scope: "col",
					children: "برچسب"
				})
			] }) }), /* @__PURE__ */ (0, o.jsx)("tbody", { children: t.map((t, n) => /* @__PURE__ */ (0, o.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, o.jsx)("th", {
					scope: "row",
					dir: "ltr",
					children: e.names[n]
				}),
				t.map((e, t) => /* @__PURE__ */ (0, o.jsx)("td", {
					dir: "ltr",
					children: e
				}, t)),
				e.texts && /* @__PURE__ */ (0, o.jsx)("td", {
					className: "lab-message-cell",
					dir: "auto",
					children: e.texts[n]
				}),
				e.y && /* @__PURE__ */ (0, o.jsxs)("td", { children: [e.y[n], e.texts && (e.y[n] ? " · تبلیغاتی" : " · عادی")] })
			] }, n)) })]
		})
	})] });
}
function u({ model: e, onEnter: t }) {
	let { meta: n, dataset: i, stages: a, example: u, action: d, showQueryCode: f } = e;
	return /* @__PURE__ */ (0, o.jsxs)(o.Fragment, { children: [
		/* @__PURE__ */ (0, o.jsxs)("div", {
			className: "lab-intro-copy",
			children: [
				/* @__PURE__ */ (0, o.jsxs)("p", {
					className: "lab-intro-kicker",
					children: [
						/* @__PURE__ */ (0, o.jsx)(r, { name: "lab" }),
						" پیش از شروع · ",
						n.title
					]
				}),
				/* @__PURE__ */ (0, o.jsx)("h2", {
					id: "lab-intro-title",
					tabIndex: -1,
					children: n.introTitle
				}),
				/* @__PURE__ */ (0, o.jsxs)("div", {
					className: "lab-intro-story-copy",
					children: [n.lessonBridge && /* @__PURE__ */ (0, o.jsx)("p", { children: n.lessonBridge }), /* @__PURE__ */ (0, o.jsx)("div", { dangerouslySetInnerHTML: { __html: n.story } })]
				}),
				/* @__PURE__ */ (0, o.jsxs)("div", {
					className: "lab-intro-dataset",
					children: [/* @__PURE__ */ (0, o.jsx)("h3", { children: "داده‌ها چه معنایی دارند؟" }), /* @__PURE__ */ (0, o.jsx)("div", { dangerouslySetInnerHTML: { __html: n.dataIntro } })]
				})
			]
		}),
		/* @__PURE__ */ (0, o.jsxs)("div", {
			className: "lab-intro-sample",
			children: [/* @__PURE__ */ (0, o.jsx)(l, { dataset: i }), /* @__PURE__ */ (0, o.jsxs)("div", {
				className: "lab-intro-query",
				children: [
					/* @__PURE__ */ (0, o.jsxs)("span", { children: [n.queryLabel, f && /* @__PURE__ */ (0, o.jsxs)(o.Fragment, { children: [" · ", /* @__PURE__ */ (0, o.jsx)("code", { children: "query" })] })] }),
					i.queryText && /* @__PURE__ */ (0, o.jsx)("blockquote", {
						className: "lab-message-text",
						dir: "auto",
						children: i.queryText
					}),
					u && /* @__PURE__ */ (0, o.jsx)("strong", {
						dir: "ltr",
						children: u
					}),
					n.queryHelp && /* @__PURE__ */ (0, o.jsx)("p", { children: n.queryHelp })
				]
			})]
		}),
		/* @__PURE__ */ (0, o.jsxs)("div", {
			className: "lab-intro-path",
			children: [
				/* @__PURE__ */ (0, o.jsx)("h3", { children: "چه چیزی خواهی ساخت؟" }),
				/* @__PURE__ */ (0, o.jsx)("p", { children: n.introGoal }),
				/* @__PURE__ */ (0, o.jsx)("ol", { children: a.map((e, t) => /* @__PURE__ */ (0, o.jsx)("li", { children: e.title }, t)) })
			]
		}),
		/* @__PURE__ */ (0, o.jsxs)("footer", {
			className: "lab-intro-footer",
			children: [/* @__PURE__ */ (0, o.jsxs)("span", { children: [
				c.format(a.length),
				" مأموریت · ",
				/* @__PURE__ */ (0, o.jsxs)("bdi", {
					dir: "ltr",
					children: [a.reduce((e, t) => e + t.xp, 0), " XP"]
				})
			] }), /* @__PURE__ */ (0, o.jsxs)("button", {
				className: "button-forest",
				"data-intro-start": "",
				type: "button",
				onClick: t,
				children: [
					s[d],
					" ",
					/* @__PURE__ */ (0, o.jsx)("span", {
						"aria-hidden": "true",
						children: "←"
					})
				]
			})]
		})
	] });
}
// frontend/lab/LabFeedback.tsx
function d({ model: e, onClose: t }) {
	return /* @__PURE__ */ (0, o.jsxs)(o.Fragment, { children: [
		/* @__PURE__ */ (0, o.jsx)("button", {
			className: "lab-feedback-close",
			"data-feedback-close": "",
			type: "button",
			"aria-label": "بستن بازخورد",
			onClick: t,
			children: "×"
		}),
		/* @__PURE__ */ (0, o.jsx)("p", {
			className: "lab-feedback-step",
			"data-feedback-step": "",
			children: e.step
		}),
		/* @__PURE__ */ (0, o.jsx)("span", {
			className: "lab-feedback-symbol",
			"aria-hidden": "true",
			children: e.kind === "service" ? "…" : e.kind === "success" ? "✓" : "!"
		}),
		/* @__PURE__ */ (0, o.jsx)("h2", {
			id: "lab-feedback-title",
			tabIndex: -1,
			children: e.title
		}),
		/* @__PURE__ */ (0, o.jsx)("p", {
			id: "lab-feedback-message",
			children: e.text
		}),
		e.field && /* @__PURE__ */ (0, o.jsxs)("p", {
			className: "lab-feedback-field",
			children: ["نام یا کلید مورد بررسی: ", /* @__PURE__ */ (0, o.jsx)("code", {
				"data-feedback-field": "",
				dir: "ltr",
				children: e.field
			})]
		}),
		/* @__PURE__ */ (0, o.jsxs)("details", {
			className: "lab-feedback-hint",
			children: [/* @__PURE__ */ (0, o.jsx)("summary", { children: "راهنمایی" }), /* @__PURE__ */ (0, o.jsx)("p", {
				"data-feedback-hint": "",
				children: e.hint
			})]
		}),
		e.kind === "correction" && /* @__PURE__ */ (0, o.jsxs)("details", {
			className: "lab-feedback-example",
			children: [
				/* @__PURE__ */ (0, o.jsx)("summary", { children: "دیدن مثال" }),
				/* @__PURE__ */ (0, o.jsx)("p", { children: "مثال آموزشی این مرحله؛ مستقل از ورودی‌های بررسی نهایی." }),
				/* @__PURE__ */ (0, o.jsx)("pre", {
					"data-feedback-example": "",
					dir: "ltr",
					tabIndex: 0,
					children: e.example
				})
			]
		}),
		/* @__PURE__ */ (0, o.jsx)("button", {
			className: "button-forest",
			"data-feedback-return": "",
			type: "button",
			onClick: t,
			children: "برگشت به کد"
		})
	] });
}
// frontend/lab/mount.tsx
function f(e, t) {
	let n = (0, a.createRoot)(e, { identifierPrefix: "lab-intro-" }), r = (0, a.createRoot)(t, { identifierPrefix: "lab-feedback-" }), s = 0;
	return {
		showIntro(e, t) {
			(0, i.flushSync)(() => n.render(/* @__PURE__ */ (0, o.jsx)(u, {
				model: e,
				onEnter: t
			})));
		},
		showFeedback(e, t) {
			(0, i.flushSync)(() => r.render(/* @__PURE__ */ (0, o.jsx)(d, {
				model: e,
				onClose: t
			}, ++s)));
		},
		dispose() {
			r.unmount(), n.unmount();
		}
	};
}
export { f as mountLabPresentation };
