import { a as e, i as t, n, r, t as i } from "./jsx-runtime-CMv_BHj2.mjs";
import { r as a } from "./runtime-D2U6pln4.mjs";
// frontend/lab/mission/views.tsx
var o = r(), s = n(), c = i(), l = new Intl.NumberFormat("fa-IR"), u = (e) => l.format(e), d = "برای بازشدن مراحل بعد، پاسخ مرحلهٔ پیشین باید تأیید شود.";
function f({ view: e, onChoose: t }) {
	return /* @__PURE__ */ (0, c.jsx)(c.Fragment, { children: e.steps.map((n, r) => {
		let i = e.completed.has(n.id), a = r > e.limit, o = r === e.active, s = "مرحلهٔ " + u(r + 1) + ": " + n.title + (i ? "؛ تکمیل‌شده" : a ? "؛ قفل‌شده" : "");
		return /* @__PURE__ */ (0, c.jsx)("li", {
			title: a ? s + "؛ برای بازشدن مراحل بعد، پاسخ مرحلهٔ پیشین باید تأیید شود." : s,
			children: /* @__PURE__ */ (0, c.jsx)("button", {
				"data-stage": r,
				"data-done": i,
				"data-locked": a,
				type: "button",
				"aria-label": s,
				"aria-current": o ? "step" : void 0,
				"aria-describedby": a ? "lab-stage-lock-help" : void 0,
				disabled: a || e.busy,
				onClick: () => {
					o || a || e.busy || t(r);
				},
				children: /* @__PURE__ */ (0, c.jsx)("span", {
					className: "mission-step-number",
					"aria-hidden": "true",
					children: i ? "✓" : u(r + 1)
				})
			})
		}, n.id);
	}) });
}
function p({ view: e }) {
	let t = e.steps[e.active];
	return /* @__PURE__ */ (0, c.jsxs)(c.Fragment, { children: [
		/* @__PURE__ */ (0, c.jsxs)("div", {
			className: "mission-brief-meta",
			children: [/* @__PURE__ */ (0, c.jsxs)("p", {
				className: "lab-task-number",
				"data-task-number": "",
				children: [
					"مرحلهٔ ",
					u(e.active + 1),
					" از ",
					u(e.steps.length)
				]
			}), /* @__PURE__ */ (0, c.jsxs)("span", {
				className: "mission-brief-xp",
				"data-task-reward": "",
				lang: "en",
				dir: "ltr",
				children: [
					"+",
					t.xp,
					" XP"
				]
			})]
		}),
		/* @__PURE__ */ (0, c.jsx)("h2", {
			id: "lab-task-title",
			tabIndex: -1,
			children: t.title
		}),
		/* @__PURE__ */ (0, c.jsx)("p", {
			className: "mission-context",
			"data-concept": "",
			children: t.brief
		}),
		/* @__PURE__ */ (0, c.jsx)("p", {
			className: "mission-action",
			"data-action": "",
			dangerouslySetInnerHTML: { __html: t.action }
		}),
		/* @__PURE__ */ (0, c.jsxs)("dl", {
			className: "mission-io",
			children: [/* @__PURE__ */ (0, c.jsxs)("div", { children: [/* @__PURE__ */ (0, c.jsx)("dt", { children: t.inputTitle }), /* @__PURE__ */ (0, c.jsx)("dd", {
				"data-input": "",
				dangerouslySetInnerHTML: { __html: t.input }
			})] }), /* @__PURE__ */ (0, c.jsxs)("div", { children: [/* @__PURE__ */ (0, c.jsx)("dt", { children: t.resultTitle }), /* @__PURE__ */ (0, c.jsx)("dd", {
				"data-result": "",
				dangerouslySetInnerHTML: { __html: t.result }
			})] })]
		}),
		/* @__PURE__ */ (0, c.jsxs)("details", {
			className: "mission-contract",
			children: [
				/* @__PURE__ */ (0, c.jsx)("summary", { children: "یک مثال کوچک" }),
				/* @__PURE__ */ (0, c.jsx)("div", {
					className: "mission-task-text",
					"data-task": "",
					dangerouslySetInnerHTML: { __html: t.task }
				}),
				/* @__PURE__ */ (0, c.jsx)("pre", {
					"data-example": "",
					dir: "ltr",
					tabIndex: 0,
					children: t.example
				})
			]
		}, t.id),
		/* @__PURE__ */ (0, c.jsx)("p", {
			id: "lab-stage-lock-help",
			className: e.limit < e.steps.length - 1 ? "mission-lock-note" : "lab-sr-only",
			children: d
		})
	] });
}
function m({ view: e, onReveal: t }) {
	let n = e.steps[e.active].hints, r = n.slice(0, e.revealed);
	return /* @__PURE__ */ (0, c.jsxs)("div", {
		className: "mission-hints",
		children: [
			/* @__PURE__ */ (0, c.jsxs)("button", {
				type: "button",
				"data-hint": "",
				className: "lab-hint-button",
				disabled: e.busy || r.length >= n.length,
				onClick: t,
				children: [/* @__PURE__ */ (0, c.jsx)(a, { name: "hint" }), /* @__PURE__ */ (0, c.jsx)("span", {
					"data-hint-label": "",
					children: "راهنمای بعدی"
				})]
			}),
			/* @__PURE__ */ (0, c.jsxs)("span", {
				className: "mission-hint-count",
				"data-hint-count": "",
				children: [
					u(r.length),
					" از ",
					u(n.length)
				]
			}),
			/* @__PURE__ */ (0, c.jsx)("div", {
				"data-hints": "",
				"aria-live": "polite",
				children: r.map((e, t) => /* @__PURE__ */ (0, c.jsxs)("p", { children: [
					/* @__PURE__ */ (0, c.jsx)("b", { children: u(t + 1) }),
					" ",
					e
				] }, t))
			})
		]
	});
}
// frontend/lab/reference/authored-text.ts
var h = /* @__PURE__ */ e(t(), 1), g = /* @__PURE__ */ new Set([
	"p",
	"strong",
	"em",
	"b",
	"i",
	"code",
	"span",
	"br",
	"ul",
	"ol",
	"li"
]), _ = /* @__PURE__ */ new Set([
	"script",
	"style",
	"iframe",
	"object",
	"embed",
	"template",
	"svg",
	"math",
	"img",
	"video",
	"audio"
]);
function v(e, t) {
	if (e.nodeType === 3) return e.textContent;
	if (e.nodeType !== 1) return null;
	let n = e, r = n.localName;
	if (_.has(r)) return null;
	let i = Array.from(n.childNodes, (e, n) => v(e, t + "-" + n));
	if (!g.has(r)) return i;
	let a = n.getAttribute("dir"), o = n.getAttribute("lang"), s = {
		key: t,
		dir: a === "rtl" || a === "ltr" || a === "auto" ? a : void 0,
		lang: o && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(o) ? o : void 0
	};
	return r === "br" ? (0, h.createElement)(r, s) : (0, h.createElement)(r, s, ...i);
}
function y(e, t) {
	let n = e.createElement("template");
	return n.innerHTML = t, Array.from(n.content.childNodes, (e, t) => v(e, String(t)));
}
// frontend/lab/reference/views.tsx
function b({ dataset: e, meta: t, intro: n, variables: r, bootstrap: i, csvURL: a, finalStage: o, hasPreview: s }) {
	let [l, u, d] = e.query, f = a ? t.queryText || (e.query.length === 3 ? `test_size=${l} · seed=${u} · k=${d}` : JSON.stringify(e.query)) : JSON.stringify(e.query);
	return /* @__PURE__ */ (0, c.jsxs)(c.Fragment, { children: [
		/* @__PURE__ */ (0, c.jsx)("p", {
			className: "lab-panel-kicker",
			children: "داده‌های آمادهٔ این تمرین"
		}),
		/* @__PURE__ */ (0, c.jsx)("h2", { children: t.dataTitle }),
		s && /* @__PURE__ */ (0, c.jsx)("section", {
			className: "lab-evaluation-preview",
			"data-evaluation-preview": "",
			"aria-label": "خروجی تصویری ارزیابی",
			hidden: !0
		}),
		n,
		a && /* @__PURE__ */ (0, c.jsx)("a", {
			className: "button-outline",
			href: a,
			download: !0,
			lang: "en",
			children: "Download CSV ↓"
		}),
		/* @__PURE__ */ (0, c.jsxs)("div", {
			className: "mission-query",
			children: [
				/* @__PURE__ */ (0, c.jsxs)("span", { children: [t.queryLabel, !a && /* @__PURE__ */ (0, c.jsxs)(c.Fragment, { children: [" · ", /* @__PURE__ */ (0, c.jsx)("code", {
					dir: "ltr",
					children: "query"
				})] })] }),
				e.queryText && /* @__PURE__ */ (0, c.jsx)("blockquote", {
					className: "lab-message-text",
					dir: "auto",
					children: e.queryText
				}),
				/* @__PURE__ */ (0, c.jsx)("strong", {
					dir: "ltr",
					children: f
				}),
				/* @__PURE__ */ (0, c.jsx)("p", { children: t.queryHelp })
			]
		}),
		e.query_new && /* @__PURE__ */ (0, c.jsxs)("div", {
			className: "mission-query",
			"data-second-query": "",
			hidden: !o,
			children: [
				/* @__PURE__ */ (0, c.jsxs)("span", { children: ["وضعیت دوم · ", /* @__PURE__ */ (0, c.jsx)("code", {
					dir: "ltr",
					children: "query_new"
				})] }),
				/* @__PURE__ */ (0, c.jsx)("strong", {
					dir: "ltr",
					children: JSON.stringify(e.query_new)
				}),
				/* @__PURE__ */ (0, c.jsx)("p", { children: t.secondHelp })
			]
		}),
		/* @__PURE__ */ (0, c.jsx)(x, {
			dataset: e,
			title: t.tableTitle
		}),
		/* @__PURE__ */ (0, c.jsxs)("details", {
			className: "mission-contract",
			children: [
				/* @__PURE__ */ (0, c.jsx)("summary", { children: "آرایه‌های آماده در Python" }),
				/* @__PURE__ */ (0, c.jsx)("p", { children: r }),
				/* @__PURE__ */ (0, c.jsx)("pre", {
					dir: "ltr",
					lang: "en",
					tabIndex: 0,
					children: i
				})
			]
		})
	] });
}
function x({ dataset: e, title: t }) {
	let { columns: n, X: r, names: i, texts: a, y: o } = e;
	return /* @__PURE__ */ (0, c.jsx)("div", {
		className: "mission-table",
		role: "region",
		tabIndex: 0,
		"aria-label": t,
		children: /* @__PURE__ */ (0, c.jsxs)("table", { children: [
			/* @__PURE__ */ (0, c.jsxs)("caption", { children: [t, " · اندیس‌ها از صفر شروع می‌شوند"] }),
			/* @__PURE__ */ (0, c.jsx)("thead", { children: /* @__PURE__ */ (0, c.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, c.jsx)("th", {
					scope: "col",
					children: "اندیس"
				}),
				/* @__PURE__ */ (0, c.jsx)("th", {
					scope: "col",
					children: "شناسه"
				}),
				n.map((e) => /* @__PURE__ */ (0, c.jsxs)("th", {
					scope: "col",
					children: [e.label, /* @__PURE__ */ (0, c.jsx)("small", {
						lang: "en",
						dir: "ltr",
						children: e.name
					})]
				}, e.name)),
				a && /* @__PURE__ */ (0, c.jsx)("th", {
					scope: "col",
					children: "متن پیامک"
				}),
				o && /* @__PURE__ */ (0, c.jsxs)("th", {
					scope: "col",
					children: ["برچسب ", /* @__PURE__ */ (0, c.jsx)("small", {
						lang: "en",
						dir: "ltr",
						children: "y"
					})]
				})
			] }) }),
			/* @__PURE__ */ (0, c.jsx)("tbody", { children: r.map((e, t) => /* @__PURE__ */ (0, c.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, c.jsx)("th", {
					scope: "row",
					dir: "ltr",
					children: t
				}),
				/* @__PURE__ */ (0, c.jsx)("td", {
					dir: "ltr",
					children: i[t]
				}),
				e.map((e, t) => /* @__PURE__ */ (0, c.jsx)("td", {
					dir: "ltr",
					children: e
				}, t)),
				a && /* @__PURE__ */ (0, c.jsx)("td", {
					className: "lab-message-cell",
					dir: "auto",
					children: a[t]
				}),
				o && /* @__PURE__ */ (0, c.jsxs)("td", { children: [/* @__PURE__ */ (0, c.jsx)("bdi", { children: o[t] }), a && (o[t] ? " · تبلیغاتی" : " · عادی")] })
			] }, t)) })
		] })
	});
}
function S({ title: e, story: t, lessonURL: n }) {
	return /* @__PURE__ */ (0, c.jsxs)(c.Fragment, { children: [
		/* @__PURE__ */ (0, c.jsxs)("details", {
			className: "mission-story",
			children: [/* @__PURE__ */ (0, c.jsx)("summary", { children: e }), t]
		}),
		/* @__PURE__ */ (0, c.jsxs)("details", {
			className: "mission-contract",
			children: [/* @__PURE__ */ (0, c.jsx)("summary", { children: "چطور با این محیط کار کنم؟" }), /* @__PURE__ */ (0, c.jsxs)("ol", {
				className: "mission-guide-steps",
				children: [
					/* @__PURE__ */ (0, c.jsxs)("li", { children: [
						"در تابع خواسته‌شده، ",
						/* @__PURE__ */ (0, c.jsx)("code", {
							dir: "ltr",
							children: "pass"
						}),
						" را با راه‌حل خودت جایگزین کن."
					] }),
					/* @__PURE__ */ (0, c.jsxs)("li", { children: [
						"تابع باید جواب را با ",
						/* @__PURE__ */ (0, c.jsx)("code", {
							dir: "ltr",
							children: "return"
						}),
						" برگرداند. خط ",
						/* @__PURE__ */ (0, c.jsx)("code", {
							dir: "ltr",
							children: "print(...)"
						}),
						" زیر آن، جواب را در خروجی نشان می‌دهد."
					] }),
					/* @__PURE__ */ (0, c.jsx)("li", { children: "«اجرای کد» را بزن و خروجی یا خطا را ببین. می‌توانی چند بار کدت را تغییر بدهی و امتحان کنی." }),
					/* @__PURE__ */ (0, c.jsx)("li", { children: "وقتی آماده بودی، «بررسی پاسخ» را بزن تا مرحله ارزیابی شود و XP بگیری." })
				]
			})]
		}),
		/* @__PURE__ */ (0, c.jsx)("a", {
			className: "quiet-link",
			href: n,
			children: "مرور جزوه ←"
		})
	] });
}
// frontend/lab/reference/mount.tsx
function C(e, t) {
	let n = e.querySelector("[data-react-lab-dataset]"), r = e.querySelector("[data-react-lab-guide]");
	if (!n || !r) throw Error("LAB_REFERENCE_MOUNT_POINT_MISSING");
	let i = (0, s.createRoot)(n, { identifierPrefix: "lab-data-" }), a = (0, s.createRoot)(r, { identifierPrefix: "lab-guide-" }), { meta: l, dataset: u, bootstrap: d, csvURL: f, lessonURL: p, loadPreview: m } = t, h = e.ownerDocument, g = y(h, l.dataIntro), _ = y(h, l.variables), v = y(h, l.story), x = !1, C = !1, w = 0, T = null, E = () => i.render(/* @__PURE__ */ (0, c.jsx)(b, {
		dataset: u,
		meta: l,
		intro: g,
		variables: _,
		bootstrap: d,
		csvURL: f,
		finalStage: x,
		hasPreview: !!m
	}));
	(0, o.flushSync)(() => {
		E(), a.render(/* @__PURE__ */ (0, c.jsx)(S, {
			title: l.storyTitle,
			story: v,
			lessonURL: p
		}));
	});
	let D = n.querySelector("[data-evaluation-preview]");
	function O() {
		C || (w++, D && (D.hidden = !0, D.replaceChildren()));
	}
	return {
		selectStage(e) {
			C || (O(), x !== e && u.query_new && (x = e, (0, o.flushSync)(E)));
		},
		clearPreview: O,
		async showPreview(e, t) {
			if (C || !D || !m || !t()) return !1;
			let n = ++w, r = () => !C && n === w && t(), i = null;
			try {
				i = T ?? (T = m());
				let t = await i;
				return r() ? (t(D, e, u), r()) : !1;
			} catch {
				return T === i && (T = null), r() && (D.textContent = "نمایش نمودار آزمایشی ممکن نشد. خروجی کد را در کنسول ببین.", D.hidden = !1), !1;
			}
		},
		dispose() {
			C || (O(), C = !0, i.unmount(), a.unmount());
		}
	};
}
// frontend/lab/mission/mount.tsx
function w(e, t) {
	let n = (t) => {
		let n = e.querySelector(t);
		if (!n) throw Error("LAB_MISSION_MOUNT_POINT_MISSING");
		return n;
	}, r = n(".lab-mission-header"), i = () => {
		let t = Math.ceil(r.getBoundingClientRect().height);
		t > 0 && e.style.setProperty("--lab-measured-header", t + "px");
	}, a = e.ownerDocument.defaultView, l = a?.ResizeObserver ? new a.ResizeObserver(i) : null;
	l?.observe(r), i();
	let u = (0, s.createRoot)(n("[data-react-mission-path]"), { identifierPrefix: "lab-step-" }), d = (0, s.createRoot)(n("[data-react-mission-brief]"), { identifierPrefix: "lab-brief-" }), h = (0, s.createRoot)(n("[data-react-mission-hints]"), { identifierPrefix: "lab-hint-" }), g = null;
	return {
		render(e) {
			g && g.active === e.active && g.limit === e.limit && g.busy === e.busy && g.revealed === e.revealed && g.completed.size === e.completed.size && [...e.completed].every((e) => g.completed.has(e)) || (g = e, (0, o.flushSync)(() => {
				u.render(/* @__PURE__ */ (0, c.jsx)(f, {
					view: e,
					onChoose: t.choose
				})), d.render(/* @__PURE__ */ (0, c.jsx)(p, { view: e })), h.render(/* @__PURE__ */ (0, c.jsx)(m, {
					view: e,
					onReveal: t.reveal
				}));
			}));
		},
		dispose() {
			l?.disconnect(), e.style.removeProperty("--lab-measured-header"), u.unmount(), d.unmount(), h.unmount();
		}
	};
}
export { w as mountLabMission, C as mountLabReference };
