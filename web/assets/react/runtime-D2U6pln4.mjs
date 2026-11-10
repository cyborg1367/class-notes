import { a as e, i as t, n, r, t as i } from "./jsx-runtime-CMv_BHj2.mjs";
import { t as a } from "./view-channel-DUJgVbi8.mjs";
import { t as o } from "./GoogleMark-D8HqNhMv.mjs";
import { n as s } from "./paper-icons-DhTBlJcb.mjs";
// frontend/account/account-links.ts
function c(e) {
	return {
		account: e + "account/",
		dashboard: e + "dashboard/",
		review: e + "review/",
		teacher: e + "instructor/"
	};
}
// web/assets/account-model.mjs
var l = /* @__PURE__ */ e(t(), 1), u = n();
function d(e) {
	let t = e?.user_metadata || {}, n = String(e?.email || "").slice(0, 254), r = String(t.full_name || t.name || n.split("@")[0] || "کاربر").trim().slice(0, 120) || "کاربر", i = "";
	try {
		let e = new URL(t.avatar_url || t.picture);
		e.protocol === "https:" && !e.username && !e.password && (i = e.href);
	} catch {}
	return {
		name: r,
		email: n,
		initial: Array.from(r)[0],
		avatar: i
	};
}
function f(e) {
	return {
		phase: "loading",
		identity: null,
		busy: null,
		teacher: !1,
		links: e,
		continueURL: e.dashboard,
		notice: {
			text: "در حال بررسی ورود…",
			error: !1
		},
		openMenuId: null,
		focusEdge: "first",
		dialog: null,
		focusTarget: null,
		focusRevision: 0
	};
}
function p(e) {
	let t = e.ready ? e.user ? "authenticated" : e.error ? "error" : "guest" : "loading";
	return {
		phase: t,
		identity: t === "authenticated" ? d(e.user) : null,
		teacher: t === "authenticated" && !!e.teacher,
		busy: e.busy === "in" || e.busy === "out" ? e.busy : null
	};
}
function m(e, t, n) {
	let r = new URL(t.dashboard, n).href;
	try {
		if (!e) return r;
		let i = new URL("../", new URL(t.account, n)), a = new URL(e, i), o = decodeURIComponent(a.pathname), s = i.pathname + "account";
		return a.origin !== i.origin || a.username || a.password || !o.startsWith(i.pathname) || /(?:^|\/)\.{1,2}(?:\/|$)|\\/.test(o) || o === s || o.startsWith(s + "/") ? r : a.href;
	} catch {
		return r;
	}
}
function h(e, t, n = 360) {
	let r = Math.min(272, Math.max(0, t.width - 24)), i = Math.max(12, Math.min(e.right - r, t.width - r - 12)), a = Math.max(0, t.height - e.bottom - 10 - 12), o = Math.max(0, e.top - 10 - 12), s = a < Math.min(140, n) && o > a;
	return {
		width: r,
		left: i,
		maxHeight: s ? o : a,
		top: s ? Math.max(12, e.top - 10 - Math.min(n, o)) : e.bottom + 10
	};
}
// web/assets/account-controller.mjs
function g({ links: e, documentURL: t = "https://static.invalid/" }) {
	let n = a(f(e)), r = n.getSnapshot(), i = !1, o = null, s = 0, c = null, l = null, u = {
		phase: "loading",
		identity: null,
		teacher: !1,
		busy: null
	}, d = {
		onSignIn: async () => {},
		onSignOut: async () => {},
		onHostsChange: () => {},
		onRetry: () => {}
	}, h = 0;
	function g(e) {
		if (i) return;
		let t = {
			...n.getSnapshot(),
			...e
		};
		JSON.stringify(t) !== JSON.stringify(n.getSnapshot()) && n.publish(t);
	}
	function _(e) {
		let t = l;
		l = null, g({ dialog: null }), t?.resolve(!!e && t.epoch === s);
	}
	function v(e) {
		if (i) return;
		let t = e.user?.id || null, n = t !== o;
		n && (s++, o = t, c = null, _(!1));
		let r = p(e), a = JSON.stringify(u) !== JSON.stringify(r);
		u = r, g({
			...u,
			busy: u.busy || c,
			...a || n ? { openMenuId: null } : {}
		});
	}
	async function y(e, t) {
		if (i || c || u.busy || e === "in" && u.phase !== "guest" || e === "out" && u.phase !== "authenticated") return !1;
		let n = s;
		c = e, g({
			busy: e,
			openMenuId: null
		});
		try {
			return i || s !== n ? !1 : (await (e === "in" ? d.onSignIn(t) : d.onSignOut()), !i && s === n);
		} catch {
			return !i && s === n && g({ notice: {
				text: e === "in" ? "ورود انجام نشد؛ دوباره تلاش کن." : "خروج انجام نشد؛ دوباره تلاش کن.",
				error: !0
			} }), !1;
		} finally {
			!i && s === n && (c = null, g({ busy: u.busy }));
		}
	}
	return {
		getSnapshot: n.getSnapshot,
		getServerSnapshot: () => r,
		subscribe: n.subscribe,
		update: v,
		configure(t, n = e) {
			i || (d = {
				...d,
				...t
			}, e = n, g({ links: e }));
		},
		setNotice(e, t = !1) {
			g({ notice: {
				text: String(e || ""),
				error: !!t
			} });
		},
		setContinue(n) {
			g({ continueURL: m(n, e, t) });
		},
		signIn: (e) => y("in", e),
		signOut: () => y("out"),
		retry() {
			!i && u.phase === "error" && d.onRetry();
		},
		openMenu(e, t = "first") {
			i || u.phase !== "authenticated" || u.busy || c || g({
				openMenuId: e,
				focusEdge: t
			});
		},
		closeMenu() {
			g({ openMenuId: null });
		},
		hostReady() {
			i || d.onHostsChange();
		},
		requestFocus(e) {
			g({
				focusTarget: e,
				focusRevision: n.getSnapshot().focusRevision + 1
			});
		},
		confirmUnsaved(e) {
			return i || l || u.phase !== "authenticated" ? Promise.resolve(!1) : new Promise((t) => {
				l = {
					resolve: t,
					epoch: s
				}, g({
					openMenuId: null,
					dialog: {
						id: ++h,
						localSaved: !!e?.localSaved
					}
				});
			});
		},
		resolveConfirmation: _,
		dispose() {
			i || (_(!1), i = !0, s++, n.reset(), o = null, u = {
				phase: "loading",
				identity: null,
				teacher: !1,
				busy: null
			}, d = {
				onSignIn: async () => {},
				onSignOut: async () => {},
				onHostsChange: () => {},
				onRetry: () => {}
			});
		}
	};
}
// frontend/components/PaperIcon.tsx
var _ = r(), v = i();
function y({ name: e }) {
	return /* @__PURE__ */ (0, v.jsx)("span", {
		className: "shell-icon",
		"aria-hidden": "true",
		dangerouslySetInnerHTML: { __html: s(e) }
	});
}
// frontend/account/useAccountMenu.ts
function b(e) {
	let t = e?.ownerDocument.defaultView;
	return [...e?.querySelectorAll("[role=\"menuitem\"]:not(:disabled)") || []].filter((e) => {
		let n = t?.getComputedStyle(e);
		return n?.display !== "none" && n?.visibility !== "hidden";
	});
}
function x(e, t, n) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(null), a = (0, l.useRef)(null), o = t.openMenuId === n && t.phase === "authenticated", [s, c] = (0, l.useState)({});
	(0, l.useLayoutEffect)(() => {
		let s = r.current?.ownerDocument, l = s?.defaultView;
		if (!o || !s || !l) return;
		function u() {
			i.current && a.current && l && c(h(i.current.getBoundingClientRect(), {
				width: l.innerWidth,
				height: l.innerHeight
			}, a.current.scrollHeight || 360));
		}
		function d(t) {
			if (e.getSnapshot().openMenuId !== n) return;
			let i = t.target;
			!r.current?.contains(i) && !a.current?.contains(i) && e.closeMenu();
		}
		function f(t) {
			t.detail?.kind !== "account" && e.closeMenu();
		}
		u();
		let p = b(a.current);
		return (t.focusEdge === "last" ? p[p.length - 1] : p[0])?.focus(), s.addEventListener("pointerdown", d), s.addEventListener("click", d), s.addEventListener("focusin", d), s.addEventListener("classroom-panel-open", f), l.addEventListener("resize", u), l.addEventListener("scroll", u, !0), () => {
			s.removeEventListener("pointerdown", d), s.removeEventListener("click", d), s.removeEventListener("focusin", d), s.removeEventListener("classroom-panel-open", f), l.removeEventListener("resize", u), l.removeEventListener("scroll", u, !0);
		};
	}, [
		o,
		e,
		n,
		t.focusEdge
	]), (0, l.useLayoutEffect)(() => {
		t.focusTarget !== n || t.busy || (i.current || r.current?.querySelector("button,a"))?.focus();
	}, [
		t.focusRevision,
		t.focusTarget,
		t.busy,
		n
	]);
	function u(t = "first") {
		let i = r.current?.ownerDocument, a = i?.defaultView;
		i && a && i.dispatchEvent(new a.CustomEvent("classroom-panel-open", { detail: { kind: "account" } })), e.openMenu(n, t);
	}
	function d(t = !1) {
		e.closeMenu(), t && i.current?.focus();
	}
	function f(e) {
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), d(!0);
			return;
		}
		if (e.key === "Tab") {
			d(!0);
			return;
		}
		let t = b(a.current);
		if (!t.length) return;
		let n = t.indexOf(e.currentTarget.ownerDocument.activeElement), r = e.key === "ArrowDown" ? (n + 1) % t.length : e.key === "ArrowUp" ? (n - 1 + t.length) % t.length : e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : null;
		r !== null && (e.preventDefault(), t[r].focus());
	}
	return {
		root: r,
		trigger: i,
		menu: a,
		open: o,
		position: s,
		show: u,
		close: d,
		keydown: f
	};
}
// frontend/account/AccountControls.tsx
function S({ person: e }) {
	let [t, n] = (0, l.useState)("");
	return /* @__PURE__ */ (0, v.jsxs)("span", {
		className: "account-avatar",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, v.jsx)("span", { children: e.initial }), e.avatar && t !== e.avatar && /* @__PURE__ */ (0, v.jsx)("img", {
			src: e.avatar,
			referrerPolicy: "no-referrer",
			alt: "",
			decoding: "async",
			onError: () => n(e.avatar)
		})]
	});
}
function C({ port: e, scope: t, compact: n = !1, container: r }) {
	let i = (0, l.useSyncExternalStore)(e.subscribe, e.getSnapshot, e.getServerSnapshot), a = x(e, i, t), s = i.identity, c = "cn-account-menu-" + t;
	(0, l.useLayoutEffect)(() => {
		e.hostReady();
	}, [e, i.phase]);
	let u = s && /* @__PURE__ */ (0, v.jsxs)("section", {
		ref: a.menu,
		className: "account-popover",
		id: c,
		"aria-label": "حساب کاربری",
		hidden: !a.open,
		style: a.open ? a.position : void 0,
		onKeyDown: a.keydown,
		children: [/* @__PURE__ */ (0, v.jsxs)("div", {
			className: "account-person",
			children: [/* @__PURE__ */ (0, v.jsx)("strong", {
				dir: "auto",
				children: s.name
			}), /* @__PURE__ */ (0, v.jsx)("bdi", {
				dir: "ltr",
				children: s.email
			})]
		}), /* @__PURE__ */ (0, v.jsxs)("div", {
			className: "account-menu-items",
			role: "menu",
			"aria-label": "عملیات حساب",
			onClick: (e) => {
				e.target.closest("a") && a.close();
			},
			children: [
				/* @__PURE__ */ (0, v.jsxs)("a", {
					className: "account-menu-dashboard",
					role: "menuitem",
					tabIndex: -1,
					href: i.links.dashboard,
					children: [/* @__PURE__ */ (0, v.jsx)(y, { name: "dashboard" }), "داشبورد من"]
				}),
				/* @__PURE__ */ (0, v.jsxs)("a", {
					role: "menuitem",
					tabIndex: -1,
					href: i.links.account,
					children: [/* @__PURE__ */ (0, v.jsx)(y, { name: "user" }), "حساب کاربری"]
				}),
				i.links.review && /* @__PURE__ */ (0, v.jsxs)("a", {
					role: "menuitem",
					tabIndex: -1,
					href: i.links.review,
					children: [/* @__PURE__ */ (0, v.jsx)(y, { name: "review" }), "دفتر مرور شخصی"]
				}),
				i.teacher && /* @__PURE__ */ (0, v.jsxs)("a", {
					role: "menuitem",
					tabIndex: -1,
					href: i.links.teacher,
					children: [/* @__PURE__ */ (0, v.jsx)(y, { name: "dashboard" }), "پنل مدرس"]
				}),
				/* @__PURE__ */ (0, v.jsxs)("button", {
					className: "account-exit",
					type: "button",
					role: "menuitem",
					tabIndex: -1,
					"data-account-signout": "",
					"data-react-account-action": "",
					disabled: !!i.busy,
					onClick: () => {
						e.signOut();
					},
					children: [/* @__PURE__ */ (0, v.jsx)(y, { name: "exit" }), /* @__PURE__ */ (0, v.jsx)("span", { children: i.busy === "out" ? "در حال خروج…" : "خروج از حساب" })]
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, v.jsxs)("div", {
		ref: a.root,
		className: "account-controls" + (n ? " account-controls-compact" : ""),
		dir: "rtl",
		"data-account-scope": t,
		"data-auth-state": i.phase === "authenticated" ? "member" : i.phase,
		"aria-busy": i.phase === "loading" || !!i.busy,
		children: [
			i.phase === "loading" && /* @__PURE__ */ (0, v.jsx)("a", {
				className: "account-fallback",
				"data-account-link": "",
				href: i.links.account,
				children: "حساب کاربری"
			}),
			i.phase === "error" && /* @__PURE__ */ (0, v.jsx)("a", {
				className: "account-fallback",
				href: i.links.account,
				children: "حساب کاربری"
			}),
			i.phase === "guest" && /* @__PURE__ */ (0, v.jsxs)("button", {
				className: "account-signin",
				type: "button",
				"data-account-signin": "",
				"data-react-account-action": "",
				disabled: !!i.busy,
				"aria-label": "ورود با Google",
				onClick: () => {
					e.signIn();
				},
				children: [
					/* @__PURE__ */ (0, v.jsx)(o, {}),
					/* @__PURE__ */ (0, v.jsxs)("span", {
						className: "account-signin-full",
						children: ["ورود با ", /* @__PURE__ */ (0, v.jsx)("bdi", {
							lang: "en",
							children: "Google"
						})]
					}),
					/* @__PURE__ */ (0, v.jsx)("span", {
						className: "account-signin-short",
						"aria-hidden": "true",
						children: "ورود"
					})
				]
			}),
			i.phase === "authenticated" && s && /* @__PURE__ */ (0, v.jsxs)(v.Fragment, { children: [
				!n && /* @__PURE__ */ (0, v.jsx)("a", {
					className: "account-dashboard",
					href: i.links.dashboard,
					children: "داشبورد من"
				}),
				/* @__PURE__ */ (0, v.jsx)("span", { "data-notification-anchor": "" }),
				/* @__PURE__ */ (0, v.jsxs)("button", {
					ref: a.trigger,
					className: "account-trigger",
					type: "button",
					"data-account-trigger": "",
					"aria-label": "منوی حساب " + s.name,
					"aria-haspopup": "menu",
					"aria-expanded": a.open,
					"aria-controls": c,
					disabled: !!i.busy,
					onClick: () => a.open ? a.close() : a.show(),
					onKeyDown: (e) => {
						(e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), a.show(e.key === "ArrowUp" ? "last" : "first"));
					},
					children: [
						/* @__PURE__ */ (0, v.jsx)(S, { person: s }),
						/* @__PURE__ */ (0, v.jsx)("span", {
							className: "account-trigger-name",
							children: s.name.split(/\s+/)[0]
						}),
						/* @__PURE__ */ (0, v.jsx)(y, { name: "chevron" })
					]
				}),
				a.open && r ? (0, _.createPortal)(/* @__PURE__ */ (0, v.jsx)("div", {
					className: "account-controls account-menu-portal" + (n ? " account-controls-compact" : ""),
					dir: "rtl",
					children: u
				}), r) : u
			] })
		]
	});
}
// frontend/account/runtime.tsx
var w = /* @__PURE__ */ new WeakMap();
function T(e, t) {
	let n = g({
		links: t,
		documentURL: e.baseURI
	}), r = /* @__PURE__ */ new Map(), i = 0, a = !1;
	function o() {
		for (let [e, t] of r) e.isConnected && t.host.isConnected || (n.getSnapshot().openMenuId === t.scope && n.closeMenu(), t.root.unmount(), t.host.remove(), r.delete(e));
	}
	function s(e) {
		if (e.defaultPrevented) return;
		let t = e.target.closest?.("[data-signin],[data-signout],[data-login-link]");
		if (!t || t.closest("[data-react-account-action]") || t.tagName === "A" && (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
		let r = n.getSnapshot();
		(r.phase !== "error" || t.tagName !== "A") && (e.preventDefault(), r.phase === "loading" || r.busy || (t.matches("[data-signout]") ? n.signOut() : n.signIn(t)));
	}
	function c() {
		o();
		let t = e.body.classList.contains("lab-notebook-ready") ? [...r.values()].find((e) => e.host.isConnected)?.scope : void 0;
		n.requestFocus(t || "header");
	}
	let l = {
		update(e) {
			o(), n.update(e);
		},
		setNotice: n.setNotice,
		setContinue: n.setContinue,
		attach(t, { compact: a = !1 } = {}) {
			o();
			let s = r.get(t);
			if (s) return s.host;
			let c = e.createElement("div");
			c.className = "account-react-host", t.append(c);
			let l = (0, u.createRoot)(c), d = "compact-" + ++i;
			return r.set(t, {
				host: c,
				root: l,
				scope: d
			}), l.render(/* @__PURE__ */ (0, v.jsx)(C, {
				port: n,
				scope: d,
				compact: a,
				container: e.body
			})), c;
		},
		detach(e) {
			let t = r.get(e);
			t && (n.getSnapshot().openMenuId === t.scope && n.closeMenu(), t.root.unmount(), t.host.remove(), r.delete(e));
		},
		close(e = !1) {
			let t = n.getSnapshot().openMenuId;
			n.closeMenu(), e && t && n.requestFocus(t);
		},
		confirmUnsaved: n.confirmUnsaved,
		focusAccount: c,
		dispose() {
			e.removeEventListener("click", s);
			for (let e of r.values()) e.root.unmount(), e.host.remove();
			r.clear(), n.dispose(), w.delete(e);
		}
	};
	return {
		port: n,
		mount(t) {
			return n.configure({
				...t,
				onRetry: t.onRetry || (() => e.defaultView?.location.reload())
			}, t.urls), a || (a = !0, e.addEventListener("click", s)), l;
		},
		dispose: l.dispose
	};
}
function E(e, t) {
	let n = w.get(e);
	return n || (n = T(e, t), w.set(e, n)), n;
}
export { c as i, C as n, y as r, E as t };
