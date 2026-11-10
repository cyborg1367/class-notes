import { i as e, t } from "./jsx-runtime-CMv_BHj2.mjs";
e();
var n = t();
function r({ children: e, href: t, secondary: r = !1, disabled: i = !1, onClick: a, label: o, login: s = !1 }) {
	let c = r ? "button-outline" : "button-forest";
	return t ? /* @__PURE__ */ (0, n.jsx)("a", {
		className: c,
		href: t,
		"aria-label": o,
		"data-login-link": s ? "" : void 0,
		children: e
	}) : /* @__PURE__ */ (0, n.jsx)("button", {
		className: c,
		type: "button",
		disabled: i,
		onClick: a,
		"aria-label": o,
		children: e
	});
}
export { r as t };
