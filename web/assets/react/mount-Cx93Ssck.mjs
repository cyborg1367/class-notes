import { a as e, i as t, n, r, t as i } from "./jsx-runtime-CMv_BHj2.mjs";
import { t as a } from "./PaperButton-BMap45ZB.mjs";
// frontend/components/GateCard.tsx
var o = r(), s = n(), c = /* @__PURE__ */ e(t(), 1), l = i();
function u({ items: e }) {
	return /* @__PURE__ */ (0, l.jsx)("nav", {
		className: "shell route-trail",
		"aria-label": "مسیر صفحه",
		children: /* @__PURE__ */ (0, l.jsx)("ol", { children: e.map((e, t) => /* @__PURE__ */ (0, l.jsx)("li", { children: e.href ? /* @__PURE__ */ (0, l.jsx)("a", {
			href: e.href,
			dir: "auto",
			children: e.label
		}) : /* @__PURE__ */ (0, l.jsx)("span", {
			"aria-current": e.current ? "page" : void 0,
			dir: "auto",
			children: e.label
		}) }, t)) })
	});
}
function d({ view: e }) {
	let [t, n] = (0, c.useState)(!1), [r, i] = (0, c.useState)(e.status || ""), o = e.heading === "h1" ? "h1" : "h2";
	async function s(e) {
		if (e.onClick && !t) {
			n(!0);
			try {
				await e.onClick();
			} catch (e) {
				let t = e && typeof e == "object" && "message" in e ? String(e.message) : "";
				i(t || "عملیات کامل نشد. دوباره تلاش کن.");
			} finally {
				n(!1);
			}
		}
	}
	return /* @__PURE__ */ (0, l.jsxs)("div", {
		className: "gate-card",
		"data-react-gate": "",
		"aria-busy": t,
		children: [
			/* @__PURE__ */ (0, l.jsx)(o, { children: e.title }),
			e.body && /* @__PURE__ */ (0, l.jsx)("p", { children: e.body }),
			!!e.actions?.length && /* @__PURE__ */ (0, l.jsx)("div", {
				className: "portal-actions",
				children: e.actions.map((e, n) => /* @__PURE__ */ (0, l.jsx)(a, {
					href: e.href,
					login: e.login,
					secondary: !e.primary,
					disabled: t,
					onClick: e.onClick ? () => void s(e) : void 0,
					children: e.label
				}, n))
			}),
			/* @__PURE__ */ (0, l.jsx)("p", {
				className: "status-line",
				"data-gate-status": "",
				role: "status",
				"aria-live": "polite",
				"data-error": r ? "true" : void 0,
				children: r
			})
		]
	});
}
// frontend/gate/mount.tsx
function f(e) {
	let t = (0, s.createRoot)(e, { identifierPrefix: "gate-" });
	return {
		render(e) {
			(0, o.flushSync)(() => t.render(/* @__PURE__ */ (0, l.jsx)(d, { view: e })));
		},
		dispose() {
			t.unmount();
		}
	};
}
function p(e, t) {
	let n = (0, s.createRoot)(e, { identifierPrefix: "route-frame-" });
	return (0, o.flushSync)(() => n.render(/* @__PURE__ */ (0, l.jsxs)(l.Fragment, { children: [/* @__PURE__ */ (0, l.jsx)(u, { items: t }), /* @__PURE__ */ (0, l.jsx)("section", {
		className: "shell portal-main",
		children: /* @__PURE__ */ (0, l.jsx)("div", { "data-lab-host": "" })
	})] }))), {
		slot: e.querySelector("[data-lab-host]"),
		dispose() {
			n.unmount();
		}
	};
}
function m(e, t, n) {
	let r = (0, s.createRoot)(e, { identifierPrefix: "gate-status-" });
	return (0, o.flushSync)(() => r.render(/* @__PURE__ */ (0, l.jsxs)("section", {
		className: "shell portal-main",
		children: [/* @__PURE__ */ (0, l.jsx)("p", {
			className: "status-line",
			role: "status",
			children: t
		}), n && /* @__PURE__ */ (0, l.jsx)("button", {
			type: "button",
			className: "button-outline",
			onClick: n,
			children: "تلاش دوباره"
		})]
	}))), { dispose() {
		r.unmount();
	} };
}
export { f as mountGate, p as mountRouteFrame, m as mountStatus };
