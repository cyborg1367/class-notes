import { a as e, i as t, t as n } from "./jsx-runtime-CMv_BHj2.mjs";
// frontend/exam/ExamQuestionVisual.tsx
var r = /* @__PURE__ */ e(t(), 1), i = n(), a = [
	{
		k: 1,
		train: .99,
		valid: .67
	},
	{
		k: 3,
		train: .96,
		valid: .77
	},
	{
		k: 5,
		train: .92,
		valid: .84
	},
	{
		k: 11,
		train: .88,
		valid: .89
	},
	{
		k: 21,
		train: .82,
		valid: .85
	},
	{
		k: 41,
		train: .74,
		valid: .76
	},
	{
		k: 61,
		train: .68,
		valid: .69
	}
];
function o() {
	let e = (e) => 84 + e * 66, t = (e) => 230 - (e - .6) / .4 * 150, n = (n) => a.map((r, i) => `${i ? "L" : "M"}${e(i)},${t(r[n])}`).join(" ");
	return /* @__PURE__ */ (0, i.jsxs)("figure", {
		className: "exam-figure exam-validation-figure",
		children: [
			/* @__PURE__ */ (0, i.jsxs)("svg", {
				viewBox: "0 0 600 340",
				role: "img",
				"aria-label": "منحنی اعتبارسنجی KNN؛ دقت آموزش از مقدار بالا در k برابر یک به‌تدریج کاهش می‌یابد و دقت اعتبارسنجی در k برابر یازده به بیشترین مقدار می‌رسد.",
				children: [
					/* @__PURE__ */ (0, i.jsx)("rect", {
						x: "36",
						y: "18",
						width: "528",
						height: "286",
						rx: "18",
						fill: "#fffef9",
						stroke: "#d8ded3"
					}),
					/* @__PURE__ */ (0, i.jsx)("text", {
						x: "300",
						y: "48",
						textAnchor: "middle",
						fontSize: "15",
						fontWeight: "700",
						fill: "#385242",
						children: "Validation Curve"
					}),
					[
						.6,
						.7,
						.8,
						.9,
						1
					].map((e) => /* @__PURE__ */ (0, i.jsxs)("g", { children: [/* @__PURE__ */ (0, i.jsx)("path", {
						d: `M84 ${t(e)} H510`,
						stroke: "#d8ded3",
						strokeWidth: "1"
					}), /* @__PURE__ */ (0, i.jsxs)("text", {
						x: "70",
						y: t(e) + 4,
						textAnchor: "end",
						fontSize: "11",
						fill: "#66745f",
						children: [Math.round(e * 100), "%"]
					})] }, e)),
					/* @__PURE__ */ (0, i.jsx)("path", {
						d: "M84 80V230H510",
						fill: "none",
						stroke: "#87957f",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ (0, i.jsx)("path", {
						d: n("train"),
						fill: "none",
						stroke: "#b76844",
						strokeWidth: "4",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					}),
					/* @__PURE__ */ (0, i.jsx)("path", {
						d: n("valid"),
						fill: "none",
						stroke: "#286c5b",
						strokeWidth: "4",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					}),
					a.map((n, r) => /* @__PURE__ */ (0, i.jsxs)("g", { children: [
						/* @__PURE__ */ (0, i.jsx)("circle", {
							cx: e(r),
							cy: t(n.train),
							r: "5",
							fill: "#b76844"
						}),
						/* @__PURE__ */ (0, i.jsx)("circle", {
							cx: e(r),
							cy: t(n.valid),
							r: "5",
							fill: "#286c5b"
						}),
						/* @__PURE__ */ (0, i.jsx)("text", {
							x: e(r),
							y: "256",
							textAnchor: "middle",
							fontSize: "12",
							fill: "#66745f",
							children: n.k
						})
					] }, n.k)),
					/* @__PURE__ */ (0, i.jsx)("text", {
						x: "297",
						y: "295",
						textAnchor: "middle",
						fontSize: "13",
						fill: "#485a45",
						children: "تعداد همسایه‌ها (k)"
					}),
					/* @__PURE__ */ (0, i.jsx)("text", {
						x: "34",
						y: "154",
						transform: "rotate(-90 34 154)",
						textAnchor: "middle",
						fontSize: "13",
						fill: "#485a45",
						children: "دقت"
					})
				]
			}),
			/* @__PURE__ */ (0, i.jsxs)("div", {
				className: "exam-curve-legend",
				"aria-label": "راهنمای خطوط نمودار",
				dir: "rtl",
				children: [/* @__PURE__ */ (0, i.jsxs)("span", { children: [/* @__PURE__ */ (0, i.jsx)("i", {
					className: "is-train",
					"aria-hidden": "true"
				}), " دقت آموزش"] }), /* @__PURE__ */ (0, i.jsxs)("span", { children: [/* @__PURE__ */ (0, i.jsx)("i", {
					className: "is-valid",
					"aria-hidden": "true"
				}), " دقت اعتبارسنجی"] })]
			}),
			/* @__PURE__ */ (0, i.jsx)("figcaption", { children: "نمودار فرضی برای تفسیر رفتار مدل؛ محور عمودی دقت و محور افقی تعداد همسایه‌ها را نشان می‌دهد." })
		]
	});
}
function s() {
	return /* @__PURE__ */ (0, i.jsxs)("figure", {
		className: "exam-figure exam-boundary-figure",
		children: [/* @__PURE__ */ (0, i.jsxs)("svg", {
			viewBox: "0 0 520 285",
			role: "img",
			"aria-label": "مرز تصمیم KNN؛ ناحیهٔ سمت چپ پیش‌بینی کلاس صفر و ناحیهٔ سمت راست پیش‌بینی کلاس یک است. مثلث P برچسب واقعی صفر در ناحیهٔ پیش‌بینی یک و مثلث Q برچسب واقعی یک در ناحیهٔ پیش‌بینی صفر قرار دارد.",
			children: [
				/* @__PURE__ */ (0, i.jsx)("rect", {
					x: "35",
					y: "22",
					width: "450",
					height: "220",
					rx: "5",
					fill: "#e7eff7"
				}),
				/* @__PURE__ */ (0, i.jsx)("path", {
					d: "M270 22 C246 73 296 117 263 162 C247 188 270 215 253 242 H485 V22 Z",
					fill: "#f7e8df"
				}),
				/* @__PURE__ */ (0, i.jsx)("path", {
					d: "M270 22 C246 73 296 117 263 162 C247 188 270 215 253 242",
					fill: "none",
					stroke: "#59665c",
					strokeWidth: "2.4",
					strokeDasharray: "6 5"
				}),
				/* @__PURE__ */ (0, i.jsx)("path", {
					d: "M35 242H485",
					stroke: "#87957f"
				}),
				/* @__PURE__ */ (0, i.jsx)("path", {
					d: "M35 22V242",
					stroke: "#87957f"
				}),
				/* @__PURE__ */ (0, i.jsx)("polygon", {
					points: "346,96 332,122 360,122",
					fill: "#315f88",
					stroke: "#fff",
					strokeWidth: "2.5"
				}),
				/* @__PURE__ */ (0, i.jsx)("text", {
					x: "366",
					y: "112",
					fontSize: "14",
					fontWeight: "700",
					fill: "#315f88",
					children: "P"
				}),
				/* @__PURE__ */ (0, i.jsx)("polygon", {
					points: "150,151 136,177 164,177",
					fill: "#bb603a",
					stroke: "#fff",
					strokeWidth: "2.5"
				}),
				/* @__PURE__ */ (0, i.jsx)("text", {
					x: "170",
					y: "169",
					fontSize: "14",
					fontWeight: "700",
					fill: "#bb603a",
					children: "Q"
				}),
				/* @__PURE__ */ (0, i.jsx)("text", {
					x: "120",
					y: "48",
					fontSize: "12",
					fill: "#315f88",
					children: "پیش‌بینی کلاس ۰"
				}),
				/* @__PURE__ */ (0, i.jsx)("text", {
					x: "365",
					y: "48",
					fontSize: "12",
					fill: "#9d512f",
					children: "پیش‌بینی کلاس ۱"
				}),
				/* @__PURE__ */ (0, i.jsx)("text", {
					x: "258",
					y: "273",
					textAnchor: "middle",
					fontSize: "11",
					fill: "#59665c",
					children: "فضای ویژگی‌ها · نمایش شماتیک"
				})
			]
		}), /* @__PURE__ */ (0, i.jsx)("figcaption", { children: "رنگ پس‌زمینه پیش‌بینی مدل و رنگ مثلث برچسب واقعی نمونه را نشان می‌دهد." })]
	});
}
function c() {
	return /* @__PURE__ */ (0, i.jsxs)("figure", {
		className: "exam-figure exam-matrix-figure",
		role: "group",
		"aria-label": "ماتریس درهم‌ریختگی با کلاس واقعی در سطرها و کلاس پیش‌بینی‌شده در ستون‌ها",
		children: [
			/* @__PURE__ */ (0, i.jsx)("div", {
				className: "exam-matrix-title",
				children: "Confusion Matrix"
			}),
			/* @__PURE__ */ (0, i.jsx)("p", {
				className: "exam-matrix-caption",
				children: "سطرها: کلاس واقعی · ستون‌ها: کلاس پیش‌بینی‌شده"
			}),
			/* @__PURE__ */ (0, i.jsxs)("div", {
				className: "exam-matrix-layout",
				dir: "ltr",
				children: [/* @__PURE__ */ (0, i.jsx)("div", {
					className: "exam-matrix-y-label",
					lang: "fa",
					dir: "rtl",
					children: "کلاس واقعی"
				}), /* @__PURE__ */ (0, i.jsxs)("table", {
					className: "exam-matrix-table",
					"aria-label": "ماتریس درهم‌ریختگی",
					children: [/* @__PURE__ */ (0, i.jsx)("thead", { children: /* @__PURE__ */ (0, i.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, i.jsx)("th", {
							scope: "col",
							"aria-label": "کلاس واقعی و پیش‌بینی‌شده"
						}),
						/* @__PURE__ */ (0, i.jsx)("th", {
							scope: "col",
							children: "پیش‌بینی ۰"
						}),
						/* @__PURE__ */ (0, i.jsx)("th", {
							scope: "col",
							children: "پیش‌بینی ۱"
						})
					] }) }), /* @__PURE__ */ (0, i.jsxs)("tbody", { children: [/* @__PURE__ */ (0, i.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, i.jsx)("th", {
							scope: "row",
							children: "واقعی ۰"
						}),
						/* @__PURE__ */ (0, i.jsx)("td", {
							className: "is-correct",
							"aria-label": "۳۶ مورد درست",
							children: "36"
						}),
						/* @__PURE__ */ (0, i.jsx)("td", {
							className: "is-error",
							"aria-label": "۴ مورد اشتباه",
							children: "4"
						})
					] }), /* @__PURE__ */ (0, i.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, i.jsx)("th", {
							scope: "row",
							children: "واقعی ۱"
						}),
						/* @__PURE__ */ (0, i.jsx)("td", {
							className: "is-error",
							"aria-label": "۶ مورد اشتباه",
							children: "6"
						}),
						/* @__PURE__ */ (0, i.jsx)("td", {
							className: "is-correct",
							"aria-label": "۱۴ مورد درست",
							children: "14"
						})
					] })] })]
				})]
			}),
			/* @__PURE__ */ (0, i.jsx)("figcaption", { children: "خانه‌های سبز: پیش‌بینی درست · خانه‌های نارنجی: پیش‌بینی نادرست" })
		]
	});
}
function l({ visual: e }) {
	return e === "validation_curve" ? /* @__PURE__ */ (0, i.jsx)(o, {}) : e === "decision_boundary" ? /* @__PURE__ */ (0, i.jsx)(s, {}) : e === "confusion_matrix" ? /* @__PURE__ */ (0, i.jsx)(c, {}) : null;
}
// frontend/exam/MathText.tsx
var u;
function d() {
	return window.katex?.render ? Promise.resolve() : u || (u = new Promise((e) => {
		let t = document.querySelector("script[data-portal]"), n = t?.src ? new URL("katex/katex.min.js", new URL(".", t.src)).href : "/assets/katex/katex.min.js", r = document.createElement("script");
		r.src = n, r.async = !0, r.dataset.examKatexLoader = "", r.addEventListener("load", () => e(), { once: !0 }), r.addEventListener("error", () => e(), { once: !0 }), document.head.append(r);
	}), u);
}
function f(e) {
	return e.replace(/\\\\/g, "\\");
}
function p(e) {
	let t = f(e), n = [], r = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+\$)/g, i = 0;
	for (let e of t.matchAll(r)) {
		let r = e.index ?? 0, a = e[0];
		r > i && n.push({
			kind: "text",
			value: t.slice(i, r)
		}), a.startsWith("$$") || a.startsWith("\\[") ? n.push({
			kind: "math",
			value: a.slice(2, -2).trim(),
			display: !0
		}) : a.startsWith("\\(") ? n.push({
			kind: "math",
			value: a.slice(2, -2).trim()
		}) : n.push({
			kind: "math",
			value: a.slice(1, -1).trim()
		}), i = r + a.length;
	}
	return i < t.length && n.push({
		kind: "text",
		value: t.slice(i)
	}), n.length || n.push({
		kind: "text",
		value: t
	}), n;
}
function m(e) {
	return e.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1) / ($2)").replace(/\\times/g, "×").replace(/\\approx/g, "≈").replace(/\\mu/g, "μ").replace(/\\sigma/g, "σ").replace(/\\,/g, " ").replace(/[{}]/g, "");
}
function h({ value: e, display: t }) {
	let n = (0, r.useRef)(null);
	return (0, r.useEffect)(() => {
		let r = !0;
		return d().then(() => {
			if (r && n.current && window.katex?.render) try {
				window.katex.render(e, n.current, {
					throwOnError: !1,
					displayMode: t,
					output: "html",
					strict: "ignore"
				});
			} catch {
				n.current.textContent = m(e);
			}
		}), () => {
			r = !1;
		};
	}, [e, t]), /* @__PURE__ */ (0, i.jsx)("span", {
		className: t ? "exam-math-block" : "exam-math-inline",
		dir: "ltr",
		ref: n,
		children: m(e)
	});
}
function g({ value: e }) {
	return /* @__PURE__ */ (0, i.jsx)(i.Fragment, { children: e.split(/([A-Za-z][A-Za-z0-9._-]*(?:[ \t]+[A-Za-z][A-Za-z0-9._-]*)*)/g).map((e, t) => /^[A-Za-z]/.test(e) ? /* @__PURE__ */ (0, i.jsx)("bdi", {
		dir: "ltr",
		children: e
	}, t) : /* @__PURE__ */ (0, i.jsx)(r.Fragment, { children: e }, t)) });
}
function _({ text: e, className: t = "" }) {
	let n = (0, r.useMemo)(() => p(e || ""), [e]);
	return /* @__PURE__ */ (0, i.jsx)("span", {
		className: `exam-math-text ${t}`.trim(),
		dir: "rtl",
		children: n.map((e, t) => e.kind === "math" ? /* @__PURE__ */ (0, i.jsx)(h, {
			value: e.value,
			display: e.display
		}, t) : /* @__PURE__ */ (0, i.jsx)(g, { value: e.value }, t))
	});
}
export { l as n, _ as t };
