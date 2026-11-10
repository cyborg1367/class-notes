import { a as e, i as t, n, r, t as i } from "./react/jsx-runtime-CMv_BHj2.mjs";
import { i as a, n as o, r as s, t as c } from "./react/runtime-D2U6pln4.mjs";
// frontend/shell/shell-model.ts
var l = /* @__PURE__ */ e(t(), 1), u = n(), d = [
	"home",
	"course",
	"lesson",
	"quiz",
	"lab",
	"review",
	"notifications",
	"account",
	"dashboard",
	"instructor",
	"about"
];
function f(e) {
	if (!e || typeof e != "object") throw Error("INVALID_SHELL_PAGE");
	let t = e;
	if (typeof t.route != "string" || !/^(?:[a-z0-9-]+\/)*index\.html$/.test(t.route) || typeof t.page != "string" || !d.some((e) => e === t.page)) throw Error("INVALID_SHELL_PAGE");
	return {
		route: t.route,
		page: t.page
	};
}
function p({ route: e, page: t }, n = "build") {
	if (!/^(?:[a-z0-9-]+\/)*index\.html$/.test(e)) throw Error("INVALID_SHELL_ROUTE");
	let r = "../".repeat(e.split("/").length - 1), i = r + "index.html", o = [
		"course",
		"lesson",
		"quiz",
		"lab"
	].includes(t) ? "classes" : t, s = [
		{
			id: "home",
			label: "صفحهٔ اصلی",
			href: i,
			icon: "home"
		},
		{
			id: "classes",
			label: "کلاس‌ها",
			href: i + "#classes",
			icon: "courses"
		},
		{
			id: "review",
			label: "دفتر مرور",
			href: r + "review/",
			icon: "review"
		},
		{
			id: "about",
			label: "دربارهٔ مدرس",
			href: r + "about/",
			icon: "user"
		}
	];
	return {
		home: i,
		logo: r + "assets/logo.svg?v=" + encodeURIComponent(n),
		account: r + "account/",
		accountLinks: a(r),
		links: s.map((e) => ({
			...e,
			...e.id === o ? { current: o === "classes" ? "location" : "page" } : {}
		}))
	};
}
// frontend/shell/LegacyServiceSlot.tsx
var m = i(), h = (0, l.memo)(function() {
	return /* @__PURE__ */ (0, m.jsx)("div", {
		className: "shell-service-slot shell-presence-slot",
		"data-shell-presence-slot": ""
	});
}), g = r();
function _({ port: e, container: t, localSaved: n }) {
	let r = (0, l.useRef)(null), i = typeof t.ownerDocument.defaultView?.HTMLDialogElement?.prototype.showModal == "function";
	return (0, l.useLayoutEffect)(() => {
		let e = r.current, n = t.ownerDocument;
		if (!e) return;
		let a = n.activeElement, o = n.defaultView;
		return o && n.dispatchEvent(new o.CustomEvent("classroom-panel-open", { detail: { kind: "account-dialog" } })), i && e.showModal(), e.querySelector("[data-stay]")?.focus(), () => {
			i && e.open && e.close(), a?.isConnected && a.focus();
		};
	}, [t, i]), /* @__PURE__ */ (0, m.jsx)("div", {
		className: i ? "account-dialog-portal" : "account-dialog-backdrop",
		children: /* @__PURE__ */ (0, m.jsxs)("dialog", {
			ref: r,
			open: !i || void 0,
			className: "account-exit-dialog",
			dir: "rtl",
			role: "alertdialog",
			"aria-modal": "true",
			"aria-labelledby": "cn-account-exit-title",
			"aria-describedby": "cn-account-exit-description",
			onCancel: (t) => {
				t.preventDefault(), e.resolveConfirmation(!1);
			},
			onKeyDown: (n) => {
				if (n.key === "Escape" && (n.preventDefault(), e.resolveConfirmation(!1)), n.key === "Tab") {
					let e = [...r.current?.querySelectorAll("button") || []], i = e[0], a = e[e.length - 1];
					n.shiftKey && t.ownerDocument.activeElement === i ? (n.preventDefault(), a?.focus()) : !n.shiftKey && t.ownerDocument.activeElement === a && (n.preventDefault(), i?.focus());
				}
			},
			children: [
				/* @__PURE__ */ (0, m.jsx)("h2", {
					id: "cn-account-exit-title",
					children: "پیش‌نویس هنوز در حساب ذخیره نشده"
				}),
				/* @__PURE__ */ (0, m.jsx)("p", {
					id: "cn-account-exit-description",
					children: n ? "نسخهٔ این مرورگر حفظ شده است. برای دسترسی از دستگاه دیگر، ابتدا ذخیره در حساب را کامل کن." : "پیش از خروج، کد یا پاسخ‌های فعلی را نزد خودت نگه دار."
				}),
				/* @__PURE__ */ (0, m.jsxs)("div", { children: [/* @__PURE__ */ (0, m.jsx)("button", {
					className: "button-forest",
					type: "button",
					"data-stay": "",
					onClick: () => e.resolveConfirmation(!1),
					children: "بازگشت و بررسی ذخیره"
				}), /* @__PURE__ */ (0, m.jsx)("button", {
					className: "button-outline",
					type: "button",
					"data-leave": "",
					onClick: () => e.resolveConfirmation(!0),
					children: "خروج از حساب"
				})] })
			]
		})
	});
}
function v({ port: e, container: t }) {
	let n = (0, l.useSyncExternalStore)(e.subscribe, e.getSnapshot, e.getServerSnapshot);
	return !n.dialog || !t ? null : (0, g.createPortal)(/* @__PURE__ */ (0, m.jsx)(_, {
		port: e,
		container: t,
		localSaved: n.dialog.localSaved
	}, n.dialog.id), t);
}
// frontend/shell/useNavigation.ts
function y() {
	let [e, t] = (0, l.useState)(!1), n = (0, l.useRef)(null), r = (0, l.useRef)(null);
	(0, l.useEffect)(() => {
		let i = n.current?.ownerDocument, a = i?.defaultView;
		if (!i || !a) return;
		function o() {
			t(!1);
		}
		function s(t) {
			t.key === "Escape" && e && (o(), n.current?.focus());
		}
		function c(e) {
			let t = e.target;
			!r.current?.contains(t) && !n.current?.contains(t) && o();
		}
		function l(e) {
			e.detail?.kind !== "navigation" && o();
		}
		let u = a.matchMedia?.("(max-width:1100px)");
		function d() {
			u && !u.matches && o();
		}
		return i.addEventListener("keydown", s), i.addEventListener("pointerdown", c), i.addEventListener("focusin", c), i.addEventListener("classroom-panel-open", l), u?.addEventListener("change", d), () => {
			i.removeEventListener("keydown", s), i.removeEventListener("pointerdown", c), i.removeEventListener("focusin", c), i.removeEventListener("classroom-panel-open", l), u?.removeEventListener("change", d);
		};
	}, [e]);
	function i() {
		let r = n.current?.ownerDocument, i = r?.defaultView;
		!e && r && i && r.dispatchEvent(new i.CustomEvent("classroom-panel-open", { detail: { kind: "navigation" } })), t((e) => !e);
	}
	return {
		open: e,
		button: n,
		nav: r,
		toggle: i,
		close: () => t(!1)
	};
}
// frontend/shell/SiteHeader.tsx
function b({ model: e, onReady: t, account: n, container: r }) {
	let i = y();
	return (0, l.useEffect)(() => {
		t?.();
	}, [t]), /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [/* @__PURE__ */ (0, m.jsxs)("div", {
		className: "shell portal-nav",
		children: [
			/* @__PURE__ */ (0, m.jsxs)("a", {
				className: "brand",
				href: e.home,
				children: [/* @__PURE__ */ (0, m.jsx)("img", {
					src: e.logo,
					width: "37",
					height: "37",
					alt: ""
				}), /* @__PURE__ */ (0, m.jsxs)("span", {
					className: "brand-name",
					children: ["دفتر کلاس", /* @__PURE__ */ (0, m.jsx)("small", {
						lang: "en",
						children: "CLASS NOTES"
					})]
				})]
			}),
			/* @__PURE__ */ (0, m.jsxs)("button", {
				ref: i.button,
				className: "nav-menu",
				type: "button",
				"aria-controls": "portal-nav",
				"aria-expanded": i.open,
				"aria-label": i.open ? "بستن فهرست" : "بازکردن فهرست",
				onClick: i.toggle,
				children: ["فهرست ", /* @__PURE__ */ (0, m.jsx)(s, { name: "menu" })]
			}),
			/* @__PURE__ */ (0, m.jsx)("nav", {
				ref: i.nav,
				className: "portal-links" + (i.open ? " is-open" : ""),
				id: "portal-nav",
				"aria-label": "پیمایش اصلی",
				onClick: (e) => {
					e.target.closest("a") && i.close();
				},
				children: e.links.map((e) => /* @__PURE__ */ (0, m.jsxs)("a", {
					href: e.href,
					"aria-current": e.current,
					"data-review-nav": e.id === "review" ? "" : void 0,
					children: [/* @__PURE__ */ (0, m.jsx)(s, { name: e.icon }), /* @__PURE__ */ (0, m.jsx)("span", { children: e.label })]
				}, e.id))
			}),
			/* @__PURE__ */ (0, m.jsx)(h, {}),
			/* @__PURE__ */ (0, m.jsx)("div", {
				className: "shell-service-slot shell-account-slot",
				"data-shell-account-slot": "",
				children: /* @__PURE__ */ (0, m.jsx)(o, {
					port: n,
					scope: "header",
					container: r
				})
			})
		]
	}), /* @__PURE__ */ (0, m.jsx)(v, {
		port: n,
		container: r
	})] });
}
// frontend/shell/SiteFooter.tsx
function x({ model: e }) {
	return /* @__PURE__ */ (0, m.jsxs)("div", {
		className: "shell",
		children: [
			/* @__PURE__ */ (0, m.jsx)("a", {
				className: "brand",
				href: e.home,
				children: "دفتر کلاس"
			}),
			/* @__PURE__ */ (0, m.jsx)("p", { children: "یادداشت‌ها، تمرین‌ها و آزمون‌های کلاس‌های مسعود آهنگری" }),
			/* @__PURE__ */ (0, m.jsx)("p", {
				lang: "en",
				dir: "ltr",
				children: "Masoud Ahangary · Class Notes"
			})
		]
	});
}
// frontend/site-shell.tsx
var S = [], C = !1, w, T = new Promise((e) => {
	w = e;
});
function E() {
	if (C) return;
	C = !0;
	let e = document.querySelector("#site-shell-data"), t = document.querySelector("script[data-site-ui]");
	if (!e || !t) {
		w();
		return;
	}
	let n = p(f(JSON.parse(e.textContent || "null")), new URL(t.src).searchParams.get("v") || "build"), r = c(document, n.accountLinks), i = document.querySelector("[data-site-header-root]"), a = document.querySelector("[data-site-footer-root]");
	function o(e, t) {
		e.dataset.reactRecovery = "true", console.warn("Site shell hydration:", t);
	}
	a && S.push((0, u.hydrateRoot)(a, /* @__PURE__ */ (0, m.jsx)(x, { model: n }), {
		identifierPrefix: "site-footer-",
		onRecoverableError: (e) => o(a, e)
	})), i ? S.push((0, u.hydrateRoot)(i, /* @__PURE__ */ (0, m.jsx)(b, {
		model: n,
		account: r.port,
		container: document.body,
		onReady: () => {
			i.dataset.shellMounted = "true", w();
		}
	}), {
		identifierPrefix: "site-header-",
		onRecoverableError: (e) => o(i, e)
	})) : w();
}
function D() {
	let e = document.querySelector("#site-shell-data");
	e && c(document, p(f(JSON.parse(e.textContent || "null"))).accountLinks).dispose();
	for (let e of S) e.unmount();
	S.length = 0;
}
function O(e) {
	return c(e.doc || document, e.urls).mount(e);
}
window.ClassNotesSiteUI = {
	ready: T,
	mountShell: E,
	dispose: D,
	mountAccountUI: O
}, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", E, { once: !0 }) : E();
function k() {
	return import("./react/mount-dwmjY4NK.mjs");
}
function A() {
	return import("./react/mount-BuY-A8GA.mjs");
}
function j() {
	return import("./react/mount-C0YH1InO.mjs");
}
function M() {
	return import("./react/mount-DEHj4az-.mjs");
}
function N() {
	return import("./react/mount-DnbhajIK.mjs");
}
function P() {
	return import("./react/mount-eZv4x-V_.mjs");
}
function F() {
	return import("./react/mount-BAg8hL8X.mjs");
}
function I() {
	return import("./react/mount-CUciKT-0.mjs");
}
function L() {
	return import("./react/mount-D_v_9toj.mjs");
}
function R() {
	return import("./react/mount-G8Dg4BHU.mjs");
}
function z() {
	return import("./react/mount-DqxTzlzD.mjs");
}
function B() {
	return import("./react/mount-CoTK0AHh.mjs");
}
export { D as dispose, N as loadInstructor, z as loadLabFrame, F as loadLabMission, P as loadLabPresentation, L as loadLabTutor, I as loadLabWorkspace, R as loadLabXp, A as loadLessonReader, B as loadNotifications, M as loadQuizForm, j as loadQuizResult, k as loadReviewNotebook, O as mountAccountUI, E as mountShell, T as ready };
