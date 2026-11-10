import { t as e } from "./jsx-runtime-CMv_BHj2.mjs";
// frontend/quiz/QuestionFigure.tsx
var t = e();
function n({ figure: e }) {
	let n = e.type === "distance2d", a = n ? 0 : 3.8, o = n ? 7 : 7.4, s = 270 / (o - a), c = (e) => [65 + (e[0] - a) * s, 305 - (e[1] - a) * s], l = Array.from({ length: Math.floor(o) - Math.ceil(a) + 1 }, (e, t) => Math.ceil(a) + t), u = n ? `محورها هم‌مقیاس‌اند؛ U در (${e.u.join(", ")}) و V در (${e.v.join(", ")}) است.` : `محورها هم‌مقیاس‌اند؛ q در (${e.query.join(", ")}) است. ` + e.points.map((e) => `${e.id}: (${e.x.join(", ")}), کلاس ${e.y}`).join("؛ ") + ". دایره کلاس صفر و مربع کلاس یک است.";
	return /* @__PURE__ */ (0, t.jsxs)("figure", {
		className: "quiz-figure",
		children: [/* @__PURE__ */ (0, t.jsxs)("svg", {
			viewBox: "0 0 420 360",
			role: "img",
			"aria-label": u,
			children: [
				l.map((e) => {
					let [n, r] = c([e, e]);
					return /* @__PURE__ */ (0, t.jsxs)("g", { children: [
						/* @__PURE__ */ (0, t.jsx)("path", {
							d: `M${n},35V305 M65,${r}H335`,
							stroke: "#dce6d4"
						}),
						/* @__PURE__ */ (0, t.jsx)("text", {
							x: n,
							y: 325,
							textAnchor: "middle",
							fontSize: 11,
							fill: "#708368",
							children: e
						}),
						/* @__PURE__ */ (0, t.jsx)("text", {
							x: 48,
							y: r + 4,
							textAnchor: "middle",
							fontSize: 11,
							fill: "#708368",
							children: e
						})
					] }, e);
				}),
				/* @__PURE__ */ (0, t.jsx)("path", {
					d: "M65,35V305H335",
					fill: "none",
					stroke: "#7f9873"
				}),
				/* @__PURE__ */ (0, t.jsx)("text", {
					x: 355,
					y: 310,
					fontSize: 12,
					fill: "#506c43",
					children: "x₁"
				}),
				/* @__PURE__ */ (0, t.jsx)("text", {
					x: 55,
					y: 23,
					fontSize: 12,
					fill: "#506c43",
					children: "x₂"
				}),
				n ? /* @__PURE__ */ (0, t.jsx)(r, {
					u: e.u,
					v: e.v,
					xy: c
				}) : /* @__PURE__ */ (0, t.jsxs)(t.Fragment, { children: [e.points.map((e) => {
					let [n, r] = c(e.x), [i, a] = e.id === "A" ? [-18, -14] : [12, 5];
					return /* @__PURE__ */ (0, t.jsxs)("g", { children: [e.y === 0 ? /* @__PURE__ */ (0, t.jsx)("circle", {
						cx: n,
						cy: r,
						r: 6,
						fill: "#2d7560"
					}) : /* @__PURE__ */ (0, t.jsx)("rect", {
						x: n - 6,
						y: r - 6,
						width: 12,
						height: 12,
						rx: 1,
						fill: "#b76844"
					}), /* @__PURE__ */ (0, t.jsxs)("text", {
						x: n + i,
						y: r + a,
						fill: "#516d46",
						fontSize: 12,
						children: [
							e.id,
							" · ",
							e.y
						]
					})] }, e.id);
				}), /* @__PURE__ */ (0, t.jsx)(i, { point: c(e.query) })] })
			]
		}), /* @__PURE__ */ (0, t.jsx)("figcaption", {
			className: "small-note",
			children: "محورها هم‌مقیاس‌اند؛ شکل، دادهٔ مستقلِ همین سؤال است."
		})]
	});
}
function r({ u: e, v: n, xy: r }) {
	let i = r(e), a = r(n);
	return /* @__PURE__ */ (0, t.jsxs)(t.Fragment, { children: [
		/* @__PURE__ */ (0, t.jsx)("path", {
			d: `M${i}L${a[0]},${i[1]}L${a}`,
			fill: "none",
			stroke: "#a8b99a",
			strokeDasharray: "5 4"
		}),
		/* @__PURE__ */ (0, t.jsx)("path", {
			d: `M${i}L${a}`,
			stroke: "#326940",
			strokeWidth: 3
		}),
		[{
			name: "U",
			value: e,
			point: i
		}, {
			name: "V",
			value: n,
			point: a
		}].map(({ name: e, value: n, point: [r, i] }) => /* @__PURE__ */ (0, t.jsxs)("g", { children: [/* @__PURE__ */ (0, t.jsx)("circle", {
			cx: r,
			cy: i,
			r: 6,
			fill: "#326940"
		}), /* @__PURE__ */ (0, t.jsxs)("text", {
			x: r + 12,
			y: i + 4,
			fontSize: 12,
			fill: "#375332",
			children: [
				e,
				" (",
				n.join(", "),
				")"
			]
		})] }, e))
	] });
}
function i({ point: [e, n] }) {
	return /* @__PURE__ */ (0, t.jsxs)(t.Fragment, { children: [/* @__PURE__ */ (0, t.jsx)("path", {
		d: `M${e},${n - 7}L${e + 7},${n}L${e},${n + 7}L${e - 7},${n}Z`,
		fill: "#193f30"
	}), /* @__PURE__ */ (0, t.jsx)("text", {
		x: e - 18,
		y: n + 21,
		fill: "#193f30",
		fontSize: 13,
		children: "q"
	})] });
}
export { n as t };
