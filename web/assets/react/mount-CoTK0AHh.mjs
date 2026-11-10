import { a as e, i as t, n, r, t as i } from "./jsx-runtime-CMv_BHj2.mjs";
import { r as a } from "./runtime-D2U6pln4.mjs";
// web/assets/notifications.mjs
var o = /* @__PURE__ */ e(t(), 1), s = r(), c = n();
function l(e, t) {
	if (typeof e != "string" || !/^(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)+$/.test(e)) return null;
	try {
		let n = new URL(t), r = new URL(e, n);
		return r.origin === n.origin && r.pathname.startsWith(n.pathname) ? r.href : null;
	} catch {
		return null;
	}
}
function u(e, t) {
	return !!e && [
		"lab",
		"review",
		"content",
		"access"
	].includes(e.kind) && typeof e.id == "string" && typeof e.episode == "string" && !!l(e.path, t);
}
function d(e) {
	return e.id + ":" + e.episode;
}
function f(e, t) {
	let n = new Map(e.map((e) => [d(e), e]));
	for (let e of t) n.set(d(e), e);
	return [...n.values()];
}
// frontend/notifications/model.ts
var p = {
	lab: [
		"لابراتورها",
		"پیشنهاد قدم بعدی و یادآوری ادامهٔ لابراتور",
		"lab"
	],
	review: [
		"دفتر مرور",
		"یادآوری موضوعات آمادهٔ مرور",
		"review"
	],
	content: [
		"محتوای تازه",
		"انتشار یادداشت، تمرین یا لابراتور",
		"book"
	],
	access: [
		"دسترسی کلاس",
		"خبر فعال‌شدن دسترسی کلاس",
		"check"
	]
}, m = Object.keys(p);
function h(e) {
	return e && typeof e == "object" ? e : {};
}
function g(e) {
	return typeof e == "string" && Number.isFinite(Date.parse(e));
}
function _(e, t) {
	let n = h(e), r = h(n.preferences), i = h(n.next_cursor);
	if (!Array.isArray(n.items) || typeof n.unread_count != "number" || !Number.isInteger(n.unread_count) || n.unread_count < 0 || !g(n.server_now) || !Number.isInteger(r.revision) || !m.every((e) => typeof r[e] == "boolean")) throw Error("INVALID_NOTICE_FEED");
	let a = /* @__PURE__ */ new Map();
	for (let e of n.items) {
		let n = h(e), { id: r, episode: i, title: o, description: s, action: c, active: f, occurred_at: p, read_at: m, snoozed_until: _ } = n;
		if (!u(n, t) || typeof r != "string" || typeof i != "string" || typeof o != "string" || typeof s != "string" || typeof c != "string" || typeof f != "boolean" || !g(p)) continue;
		let v = l(n.path, t);
		if (!v) continue;
		let y = {
			id: r,
			episode: i,
			title: o,
			description: s,
			action: c,
			active: f,
			occurred_at: p,
			href: v,
			kind: n.kind,
			read_at: g(m) ? m : null,
			snoozed_until: g(_) ? _ : null
		};
		a.set(d(y), y);
	}
	let o = {
		lab: r.lab,
		review: r.review,
		content: r.content,
		access: r.access,
		revision: r.revision
	};
	return {
		items: [...a.values()],
		unread_count: n.unread_count,
		preferences: o,
		server_now: n.server_now,
		next_cursor: g(i.at) && typeof i.id == "string" ? {
			at: i.at,
			id: i.id
		} : null
	};
}
function v(e, t = Date.now()) {
	return e.snoozed_until !== null && Date.parse(e.snoozed_until) > t;
}
function y(e, t = Date.now()) {
	return !e.read_at && e.active && !v(e, t);
}
function b(e) {
	if (typeof e == "string") return e;
	let { code: t, message: n } = h(e);
	return [t, n].filter((e) => typeof e == "string").join(" ");
}
function x(e) {
	let t = b(e);
	return /NOTICE_CHANGED/.test(t) ? "این اعلان تغییر کرده است؛ فهرست را به‌روز کن." : /NOTICE_SETTINGS_CONFLICT/.test(t) ? "تنظیمات در پنجرهٔ دیگری تغییر کرده است؛ انتخاب‌های تو حفظ شده‌اند." : /PGRST202|does not exist/.test(t) ? "مرکز اعلان‌ها هنوز روی سرور فعال نشده است." : "دریافت یا ثبت اعلان‌ها کامل نشد. دوباره تلاش کن.";
}
// frontend/notifications/store.ts
var S = () => ({
	items: [],
	cursor: null,
	snapshot: null,
	unreadOnly: !1,
	loaded: !1,
	loading: !1,
	error: ""
});
function C(e, t, n) {
	let { userId: r, baseURL: i, rpc: a, requestTimeout: o = 12e3 } = t, s = {
		feed: null,
		error: "",
		unreadCount: null,
		preferences: null,
		history: S(),
		settings: null,
		busy: !1,
		authBusy: !1,
		message: "",
		actionError: ""
	}, c = !1, l = !1, u = 0, d = 0, p = 0, m = 0, h = null, g = !1, v = /* @__PURE__ */ new Set(), y = /* @__PURE__ */ new Set(), C = () => !c && (t.isCurrent?.() ?? !0);
	function w(e) {
		C() && (s = {
			...s,
			...e
		}, y.forEach((e) => e()));
	}
	let T = (e) => w({ history: {
		...s.history,
		...e
	} });
	function E(t, n) {
		return new Promise((r, i) => {
			if (!C()) {
				i(Error("ACCOUNT_CHANGED"));
				return;
			}
			let s = !1, c = e.setTimeout(() => u(!1, Error("NOTICE_TIMEOUT")), o), l = () => u(!1, Error("ACCOUNT_CHANGED"));
			function u(t, n) {
				s || (s = !0, e.clearTimeout(c), v.delete(l), t ? r(n) : i(n));
			}
			v.add(l), Promise.resolve().then(() => {
				if (!C() || s) throw Error("ACCOUNT_CHANGED");
				return a(t, n ?? {});
			}).then((e) => u(!0, e), (e) => u(!1, e));
		});
	}
	let D = () => u === 0 || Date.now() - u >= 6e4;
	function O(e) {
		let t = s.preferences && s.preferences.revision > e.preferences.revision ? s.preferences : e.preferences, n = Date.parse(e.server_now), r = n >= d ? e.unread_count : s.unreadCount;
		return d = Math.max(d, n), {
			unreadCount: r,
			preferences: t
		};
	}
	function k(e = !1) {
		if (!C() || s.authBusy) return Promise.resolve();
		if (h) return h;
		if (!e && !D()) return Promise.resolve();
		let t = ++p, n = E("classroom_notifications").then((e) => {
			if (!C() || t !== p) return;
			let n = _(e, i);
			u = Date.now(), w({
				feed: n,
				error: "",
				...O(n)
			});
		}).catch((e) => {
			t === p && w({ error: x(e) });
		}).finally(() => {
			h === n && (h = null, M());
		});
		return h = n, n;
	}
	async function A(e, t = s.history.unreadOnly) {
		if (!C() || s.authBusy || !l || !e && (!s.history.cursor || s.history.loading)) return;
		let n = ++m, r = e ? null : s.history.cursor;
		t === s.history.unreadOnly ? T({
			loading: !0,
			error: ""
		}) : T({
			...S(),
			unreadOnly: t,
			loading: !0
		});
		try {
			let a = await E("classroom_notifications", {
				p_history: !0,
				p_before: r?.at ?? null,
				p_before_id: r?.id ?? null,
				p_unread: t
			});
			if (!C() || n !== m) return;
			let o = _(a, i);
			w({
				...O(o),
				history: {
					items: e ? o.items : f(s.history.items, o.items),
					snapshot: e ? o.server_now : s.history.snapshot,
					cursor: o.next_cursor,
					unreadOnly: t,
					loaded: !0,
					loading: !1,
					error: ""
				}
			});
		} catch (e) {
			n === m && T({
				loading: !1,
				error: x(e)
			});
		} finally {
			M();
		}
	}
	function j(e) {
		l = e, ++m, w({ history: S() }), e ? A(!0) : M();
	}
	function M() {
		!g || !C() || s.authBusy || s.busy || h || s.history.loading || (g = !1, k(!0), A(!0));
	}
	function N(e = !1) {
		C() && (e ? (g = !0, M()) : s.authBusy || s.busy || !D() || (k(), s.history.loading || A(!0)));
	}
	async function P(e, t) {
		if (!C() || s.busy || s.authBusy) return !1;
		w({
			busy: !0,
			message: "",
			actionError: ""
		});
		try {
			return await e(), C() ? (t && (n(), h && (++p, h = null), ++m, g = !1, T({ loading: !1 }), await Promise.all([k(!0), A(!0)]), C() && w({ message: t })), C()) : !1;
		} catch (e) {
			return C() && !s.settings && w({ actionError: x(e) }), !1;
		} finally {
			C() && (w({ busy: !1 }), M());
		}
	}
	let F = (e) => ({
		p_owner: r,
		p_id: e.id,
		p_episode: e.episode
	}), I = async (e, t) => {
		await E(e, t);
	};
	function L(e) {
		return P(async () => {
			if (await I("classroom_notice_read", F(e)), !C()) return;
			let t = (/* @__PURE__ */ new Date()).toISOString(), n = (n) => n.id === e.id && n.episode === e.episode ? {
				...n,
				read_at: n.read_at ?? t
			} : n;
			w({
				feed: s.feed && {
					...s.feed,
					items: s.feed.items.map(n)
				},
				history: {
					...s.history,
					items: s.history.items.map(n).filter((e) => !s.history.unreadOnly || !e.read_at)
				}
			});
		}, "اعلان خوانده شد.");
	}
	function R(e) {
		let t = e === "popup" ? s.feed?.server_now : s.history.snapshot;
		t && s.unreadCount && P(() => I("classroom_notice_read_all", {
			p_owner: r,
			p_cutoff: t
		}), "اعلان‌های موجود خوانده شدند.");
	}
	function z(e, t) {
		[
			1,
			3,
			7
		].includes(t) && e.active && (e.kind === "lab" || e.kind === "review") && P(() => I("classroom_notice_snooze", {
			...F(e),
			p_days: t
		}), "یادآوری برای زمان دیگری تنظیم شد.");
	}
	function B() {
		let e = s.preferences;
		if (!C() || s.busy || s.authBusy || !e || s.settings) return !1;
		let { revision: t, ...n } = e;
		return w({ settings: {
			draft: n,
			revision: t,
			status: "",
			conflict: !1,
			remote: null
		} }), !0;
	}
	function V(e, t) {
		let n = s.settings;
		n && !s.busy && !s.authBusy && w({ settings: {
			...n,
			draft: {
				...n.draft,
				[e]: t
			}
		} });
	}
	function H() {
		s.settings && !s.busy && w({ settings: null });
	}
	async function U() {
		let e = s.settings;
		if (!e || e.conflict) return !1;
		let t = !1;
		return await P(async () => {
			try {
				await E("classroom_notice_preferences", {
					p_owner: r,
					p_revision: e.revision,
					p_settings: e.draft
				});
			} catch (t) {
				throw w({ settings: {
					...e,
					conflict: /NOTICE_SETTINGS_CONFLICT/.test(b(t)),
					status: x(t)
				} }), t;
			}
			t = C(), t && w({ settings: null });
		}, "تنظیمات اعلان‌ها ذخیره شد."), t && C();
	}
	function W() {
		let e = s.settings;
		e?.conflict && P(async () => {
			try {
				let { preferences: t } = _(await E("classroom_notifications"), i);
				w({ settings: {
					...e,
					revision: t.revision,
					remote: t,
					conflict: !1,
					status: "انتخاب‌های تو حفظ شدند؛ با ذخیره، همین انتخاب‌ها جایگزین تنظیمات حساب می‌شوند."
				} });
			} catch (t) {
				throw w({ settings: {
					...e,
					status: x(t)
				} }), t;
			}
		});
	}
	return {
		get: () => s,
		subscribe(e) {
			return y.add(e), () => {
				y.delete(e);
			};
		},
		alive: C,
		refresh: k,
		refreshSurfaces: N,
		setHistoryAttached: j,
		loadHistory: A,
		read: L,
		readAll: R,
		snooze: z,
		openSettings: B,
		changeSetting: V,
		closeSettings: H,
		saveSettings: U,
		compareSettings: W,
		clearActionError() {
			s.actionError && w({ actionError: "" });
		},
		setBusy(e) {
			s.authBusy !== e && (w({ authBusy: e }), e || M());
		},
		dispose() {
			if (!c) {
				c = !0;
				for (let e of [...v]) e();
				y.clear(), s = {
					feed: null,
					error: "",
					unreadCount: null,
					preferences: null,
					history: S(),
					settings: null,
					busy: !1,
					authBusy: !1,
					message: "",
					actionError: ""
				};
			}
		}
	};
}
// frontend/notifications/views.tsx
var w = i(), T = new Intl.NumberFormat("fa-IR"), E = new Intl.DateTimeFormat("fa-IR", {
	month: "short",
	day: "numeric"
}), D = (e) => e.replace(/[0-9]/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[Number(e)]);
function O(e) {
	let t = new Date(e), n = /* @__PURE__ */ new Date();
	return t.toDateString() === n.toDateString() ? "امروز" : (n.setDate(n.getDate() - 1), t.toDateString() === n.toDateString() ? "دیروز" : E.format(t));
}
var k = (e) => e.busy || e.authBusy;
function A({ state: e, expanded: t, panelId: n, toggle: r }) {
	let { unreadCount: i, error: o, authBusy: s } = e, c = i === null ? "اعلان‌ها" + (o ? "؛ دریافت کامل نشد" : "") : "اعلان‌ها؛ " + T.format(i) + " خوانده‌نشده" + (o ? "؛ وضعیت ممکن است قدیمی باشد" : "");
	return /* @__PURE__ */ (0, w.jsx)("span", {
		className: "notice-host",
		"data-react-notice-bell": "",
		children: /* @__PURE__ */ (0, w.jsxs)("button", {
			type: "button",
			className: "notice-trigger",
			"aria-label": c,
			"aria-expanded": t,
			"aria-controls": n,
			"aria-busy": i === null && !o,
			disabled: s,
			onClick: r,
			children: [/* @__PURE__ */ (0, w.jsx)(a, { name: "bell" }), i !== null && i > 0 && /* @__PURE__ */ (0, w.jsx)("span", {
				className: "notice-badge",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, w.jsx)("bdi", {
					dir: "ltr",
					children: i > 99 ? T.format(99) + "+" : T.format(i)
				})
			})]
		})
	});
}
function j({ item: e, state: t, store: n, actions: r }) {
	let i = y(e), o = v(e), s = k(t);
	async function c(t) {
		let r = t.closest("[data-react-notices-popup],[data-react-notices-history]"), i = t.ownerDocument;
		await n.read(e) && r?.isConnected && !r.closest("[hidden]") && !t.isConnected && i.activeElement === i.body && (Array.from(r.querySelectorAll("[data-notice-open]")).find((t) => t.dataset.noticeOpen === e.id) ?? r.querySelector("h1,h2"))?.focus({ preventScroll: !0 });
	}
	return /* @__PURE__ */ (0, w.jsxs)("article", {
		className: "notice-item",
		"data-kind": e.kind,
		"data-read": !i,
		"data-active": e.active,
		children: [/* @__PURE__ */ (0, w.jsx)("span", {
			className: "notice-type-icon",
			children: /* @__PURE__ */ (0, w.jsx)(a, { name: p[e.kind][2] })
		}), /* @__PURE__ */ (0, w.jsxs)("div", {
			className: "notice-copy",
			children: [
				/* @__PURE__ */ (0, w.jsxs)("div", {
					className: "notice-item-heading",
					children: [/* @__PURE__ */ (0, w.jsxs)("h3", { children: [D(e.title), i && /* @__PURE__ */ (0, w.jsx)("span", {
						className: "notice-unread",
						"aria-label": "خوانده‌نشده"
					})] }), /* @__PURE__ */ (0, w.jsx)("time", {
						dateTime: e.occurred_at,
						children: O(e.occurred_at)
					})]
				}),
				/* @__PURE__ */ (0, w.jsx)("p", { children: D(e.description) }),
				e.active ? o && /* @__PURE__ */ (0, w.jsxs)("p", {
					className: "notice-resolved",
					children: ["یادآوری دوباره: ", E.format(new Date(e.snoozed_until))]
				}) : /* @__PURE__ */ (0, w.jsx)("p", {
					className: "notice-resolved",
					children: "این یادآوری اکنون فعال نیست."
				}),
				/* @__PURE__ */ (0, w.jsxs)("div", {
					className: "notice-item-actions",
					children: [
						/* @__PURE__ */ (0, w.jsxs)("a", {
							"data-notice-open": e.id,
							href: r.href(e),
							"aria-disabled": s || void 0,
							onClick: (t) => r.open(e, t),
							onAuxClick: (t) => {
								t.button === 1 && r.open(e, t);
							},
							children: [
								e.active ? e.action : "مشاهده",
								" ",
								/* @__PURE__ */ (0, w.jsx)("span", {
									"aria-hidden": "true",
									children: "←"
								})
							]
						}),
						i && /* @__PURE__ */ (0, w.jsx)("button", {
							type: "button",
							className: "notice-read-one",
							"data-read-one": e.id,
							"aria-label": "خواندم: " + e.title,
							"aria-disabled": s || void 0,
							title: "خواندم",
							onClick: (e) => void c(e.currentTarget),
							children: /* @__PURE__ */ (0, w.jsx)(a, { name: "check" })
						}),
						e.active && !o && (e.kind === "lab" || e.kind === "review") && /* @__PURE__ */ (0, w.jsxs)("details", {
							className: "notice-later",
							children: [/* @__PURE__ */ (0, w.jsxs)("summary", {
								"aria-label": "یادآوری مجدد برای " + e.title,
								children: [/* @__PURE__ */ (0, w.jsx)(a, { name: "clock" }), /* @__PURE__ */ (0, w.jsx)("span", { children: "بعداً" })]
							}), /* @__PURE__ */ (0, w.jsx)("div", { children: [
								1,
								3,
								7
							].map((t) => /* @__PURE__ */ (0, w.jsxs)("button", {
								type: "button",
								"data-snooze": e.id,
								"data-days": t,
								disabled: s,
								onClick: () => n.snooze(e, t),
								children: [T.format(t), " روز دیگر"]
							}, t)) })]
						})
					]
				})
			]
		})]
	});
}
function M({ items: e, ...t }) {
	return /* @__PURE__ */ (0, w.jsx)(w.Fragment, { children: e.map((e) => /* @__PURE__ */ (0, w.jsx)(j, {
		item: e,
		...t
	}, e.id + ":" + e.episode)) });
}
function N(e) {
	return Array.from(e.querySelectorAll("button:not(:disabled),input:not(:disabled),a[href],summary")).filter((e) => !e.closest("[hidden]") && e.getAttribute("aria-disabled") !== "true" && (e.tagName === "SUMMARY" || !e.closest("details:not([open])")));
}
function P(e, t) {
	let n = e.getBoundingClientRect(), r = t.document.documentElement.clientWidth || t.innerWidth, i = t.innerHeight, a = Math.max(1, Math.min(430, r - 24)), o = Math.max(12, Math.min(n.left - a * .25, r - a - 12)), s = Math.max(18, Math.min(a - 18, n.left + n.width / 2 - o)) + "px", c = Math.max(0, i - n.bottom - 11 - 12), l = Math.max(0, n.top - 11 - 12);
	return c < 240 && l > c ? {
		left: o,
		bottom: i - n.top + 11,
		width: a,
		maxHeight: l,
		"--notice-pointer": s
	} : {
		left: o,
		top: n.bottom + 11,
		width: a,
		maxHeight: c,
		"--notice-pointer": s
	};
}
function F({ state: e, store: t, actions: n, panelId: r, anchor: i, historyURL: s, close: c }) {
	let l = (0, o.useRef)(null), u = (0, o.useRef)(null), [d, f] = (0, o.useState)();
	(0, o.useLayoutEffect)(() => {
		if (!i) return;
		let e = i.ownerDocument.defaultView;
		if (!e) return;
		let t = () => {
			let t = i.querySelector(".notice-trigger");
			t && f(P(t, e));
		};
		return t(), l.current?.focus({ preventScroll: !0 }), e.addEventListener("resize", t), e.addEventListener("scroll", t, !0), e.visualViewport?.addEventListener("resize", t), () => {
			e.removeEventListener("resize", t), e.removeEventListener("scroll", t, !0), e.visualViewport?.removeEventListener("resize", t);
		};
	}, [i]);
	function p(e) {
		if (e.key !== "Tab" || !u.current) return;
		let t = N(u.current);
		(e.shiftKey && (e.target === l.current || e.target === t[0]) || !e.shiftKey && e.target === t[t.length - 1]) && (e.preventDefault(), c(!0));
	}
	return /* @__PURE__ */ (0, w.jsx)("section", {
		ref: u,
		id: r,
		"data-react-notices-popup": "",
		className: "notice-panel",
		dir: "rtl",
		role: "region",
		"aria-labelledby": r + "-title",
		hidden: !i,
		"data-notice-placement": d?.bottom === void 0 ? "below" : "above",
		style: d,
		onKeyDown: p,
		children: i && /* @__PURE__ */ (0, w.jsxs)(w.Fragment, { children: [
			/* @__PURE__ */ (0, w.jsxs)("header", {
				className: "notice-panel-head",
				children: [/* @__PURE__ */ (0, w.jsx)("h2", {
					ref: l,
					id: r + "-title",
					tabIndex: -1,
					children: "اعلان‌ها"
				}), /* @__PURE__ */ (0, w.jsx)("button", {
					type: "button",
					"data-read-all": "",
					disabled: k(e) || !e.feed || !e.unreadCount,
					onClick: () => t.readAll("popup"),
					children: "همه را خواندم"
				})]
			}),
			/* @__PURE__ */ (0, w.jsxs)("div", {
				className: "notice-panel-body",
				children: [
					e.actionError && /* @__PURE__ */ (0, w.jsx)("p", {
						className: "notice-error",
						children: e.actionError
					}),
					e.error && /* @__PURE__ */ (0, w.jsxs)("div", {
						className: "notice-error",
						role: "status",
						children: [/* @__PURE__ */ (0, w.jsx)("p", { children: e.error }), /* @__PURE__ */ (0, w.jsx)("button", {
							type: "button",
							"data-notice-retry": "",
							disabled: k(e),
							onClick: () => {
								t.clearActionError(), t.refresh(!0);
							},
							children: "تلاش دوباره"
						})]
					}),
					!e.feed && !e.error ? /* @__PURE__ */ (0, w.jsx)("p", {
						className: "notice-empty",
						role: "status",
						children: "در حال دریافت اعلان‌ها…"
					}) : e.feed?.items.length ? /* @__PURE__ */ (0, w.jsx)(M, {
						items: e.feed.items,
						state: e,
						store: t,
						actions: n
					}) : e.feed ? /* @__PURE__ */ (0, w.jsxs)("div", {
						className: "notice-empty",
						children: [/* @__PURE__ */ (0, w.jsx)("strong", { children: "اعلان تازه‌ای نداری." }), /* @__PURE__ */ (0, w.jsx)("p", { children: "خبرهای کلاس و یادآوری‌های مناسب اینجا نمایش داده می‌شوند." })]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, w.jsxs)("footer", {
				className: "notice-panel-footer",
				children: [/* @__PURE__ */ (0, w.jsx)("a", {
					href: s,
					children: "مشاهدهٔ همهٔ اعلان‌ها ←"
				}), /* @__PURE__ */ (0, w.jsxs)("button", {
					type: "button",
					"data-notice-settings": "",
					disabled: k(e) || !e.preferences,
					onClick: (e) => n.settings(e.currentTarget),
					children: [/* @__PURE__ */ (0, w.jsx)(a, { name: "gear" }), " تنظیمات"]
				})]
			})
		] })
	});
}
function I({ state: e, store: t, actions: n }) {
	let { history: r, unreadCount: i } = e, o = k(e);
	return /* @__PURE__ */ (0, w.jsxs)("section", {
		dir: "rtl",
		"data-react-notices-history": "",
		"aria-busy": r.loading,
		children: [
			/* @__PURE__ */ (0, w.jsxs)("header", {
				className: "notice-page-heading",
				children: [/* @__PURE__ */ (0, w.jsxs)("div", { children: [
					/* @__PURE__ */ (0, w.jsx)("p", { children: "حساب کاربری / اعلان‌ها" }),
					/* @__PURE__ */ (0, w.jsx)("h1", {
						tabIndex: -1,
						children: "اعلان‌های من"
					}),
					/* @__PURE__ */ (0, w.jsx)("p", { children: i === null ? "خبرهای کلاس و یادآوری‌های مسیر یادگیری" : T.format(i) + " اعلان خوانده‌نشده" })
				] }), /* @__PURE__ */ (0, w.jsxs)("button", {
					type: "button",
					className: "button-outline",
					"data-notice-settings": "",
					disabled: o || !e.preferences,
					onClick: (e) => n.settings(e.currentTarget),
					children: [/* @__PURE__ */ (0, w.jsx)(a, { name: "gear" }), " تنظیمات"]
				})]
			}),
			/* @__PURE__ */ (0, w.jsxs)("div", {
				className: "notice-page-tools",
				children: [
					/* @__PURE__ */ (0, w.jsxs)("div", {
						role: "group",
						"aria-label": "فیلتر اعلان‌ها",
						children: [/* @__PURE__ */ (0, w.jsx)("button", {
							type: "button",
							"data-notice-filter": "all",
							"aria-pressed": !r.unreadOnly,
							disabled: o,
							onClick: () => {
								r.unreadOnly && t.loadHistory(!0, !1);
							},
							children: "همه"
						}), /* @__PURE__ */ (0, w.jsx)("button", {
							type: "button",
							"data-notice-filter": "unread",
							"aria-pressed": r.unreadOnly,
							disabled: o,
							onClick: () => {
								r.unreadOnly || t.loadHistory(!0, !0);
							},
							children: "خوانده‌نشده"
						})]
					}),
					/* @__PURE__ */ (0, w.jsx)("button", {
						type: "button",
						"data-read-all": "",
						disabled: o || !i || !r.snapshot,
						onClick: () => t.readAll("history"),
						children: "همه را خواندم"
					}),
					/* @__PURE__ */ (0, w.jsx)("button", {
						type: "button",
						"data-page-refresh": "",
						disabled: o || r.loading,
						onClick: () => {
							t.clearActionError(), t.refreshSurfaces(!0);
						},
						children: "به‌روزرسانی"
					})
				]
			}),
			e.actionError && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "notice-error",
				children: e.actionError
			}),
			r.error && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "notice-error",
				role: "status",
				children: r.error
			}),
			/* @__PURE__ */ (0, w.jsx)("div", {
				className: "notice-page-list",
				children: r.items.length ? /* @__PURE__ */ (0, w.jsx)(M, {
					items: r.items,
					state: e,
					store: t,
					actions: n
				}) : r.loading ? /* @__PURE__ */ (0, w.jsx)("p", {
					className: "notice-empty",
					role: "status",
					children: "در حال دریافت اعلان‌ها…"
				}) : r.loaded ? /* @__PURE__ */ (0, w.jsx)("p", {
					className: "notice-empty",
					children: "اعلانی در این فهرست نیست."
				}) : null
			}),
			r.cursor && /* @__PURE__ */ (0, w.jsx)("button", {
				type: "button",
				className: "button-outline notice-more",
				"data-notice-more": "",
				disabled: o || r.loading,
				onClick: () => void t.loadHistory(!1),
				children: "نمایش موارد بیشتر"
			})
		]
	});
}
// frontend/notifications/NoticeSettings.tsx
function L({ state: e, store: t, panelId: n, restore: r }) {
	let i = (0, o.useRef)(null), s = (0, o.useRef)(null), c = (0, o.useRef)(r);
	(0, o.useLayoutEffect)(() => {
		let e = i.current;
		if (!e) return;
		let n = e.ownerDocument, r = !1, a = [];
		try {
			typeof e.showModal == "function" && (e.showModal(), r = !0);
		} catch {}
		if (!r) {
			e.setAttribute("open", ""), e.dataset.fallback = "";
			for (let t of Array.from(n.body.children)) t.contains(e) || t.hasAttribute("inert") || [
				"SCRIPT",
				"STYLE",
				"LINK"
			].includes(t.tagName) || (t.setAttribute("inert", ""), a.push(t));
		}
		s.current?.focus({ preventScroll: !0 });
		function o(t) {
			e?.contains(t.target) || s.current?.focus({ preventScroll: !0 });
		}
		return r || n.addEventListener("focusin", o), () => {
			n.removeEventListener("focusin", o), r && e.open && e.close();
			for (let e of a) e.removeAttribute("inert");
			t.alive() && c.current();
		};
	}, [t]);
	function l(e) {
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), t.closeSettings();
			return;
		}
		if (e.key !== "Tab") return;
		let n = N(e.currentTarget), r = n[0], i = n[n.length - 1];
		r ? (e.shiftKey && (e.target === r || e.target === s.current) && (e.preventDefault(), i.focus()), !e.shiftKey && e.target === i && (e.preventDefault(), r.focus())) : e.preventDefault();
	}
	let u = e.settings;
	if (!u) return null;
	let d = e.busy || e.authBusy;
	return /* @__PURE__ */ (0, w.jsxs)("dialog", {
		ref: i,
		dir: "rtl",
		className: "notice-settings",
		"data-react-notices-settings": "",
		"aria-modal": "true",
		"aria-labelledby": n + "-settings-title",
		onKeyDown: l,
		onCancel: (e) => {
			e.preventDefault(), t.closeSettings();
		},
		children: [
			/* @__PURE__ */ (0, w.jsxs)("header", { children: [/* @__PURE__ */ (0, w.jsx)("h2", {
				ref: s,
				id: n + "-settings-title",
				tabIndex: -1,
				children: "تنظیمات اعلان‌ها"
			}), /* @__PURE__ */ (0, w.jsx)("button", {
				type: "button",
				"data-close-settings": "",
				"aria-label": "بستن",
				disabled: d,
				onClick: t.closeSettings,
				children: /* @__PURE__ */ (0, w.jsx)(a, { name: "close" })
			})] }),
			/* @__PURE__ */ (0, w.jsx)("p", { children: "انتخاب کن چه اعلان‌هایی در سایت ببینی." }),
			/* @__PURE__ */ (0, w.jsxs)("form", {
				"data-settings-form": "",
				onSubmit: (e) => {
					e.preventDefault(), t.saveSettings();
				},
				children: [
					m.map((e) => /* @__PURE__ */ (0, w.jsxs)("label", { children: [/* @__PURE__ */ (0, w.jsxs)("span", { children: [/* @__PURE__ */ (0, w.jsx)("strong", { children: p[e][0] }), /* @__PURE__ */ (0, w.jsx)("small", { children: p[e][1] })] }), /* @__PURE__ */ (0, w.jsx)("input", {
						type: "checkbox",
						name: e,
						checked: u.draft[e],
						disabled: d,
						onChange: (n) => t.changeSetting(e, n.currentTarget.checked)
					})] }, e)),
					/* @__PURE__ */ (0, w.jsx)("p", {
						className: "notice-settings-status",
						role: "status",
						children: u.status
					}),
					/* @__PURE__ */ (0, w.jsx)("button", {
						type: "button",
						className: "button-outline",
						"data-settings-conflict": "",
						hidden: !u.conflict,
						disabled: d,
						onClick: t.compareSettings,
						children: "دریافت تنظیمات جدید برای مقایسه"
					}),
					u.remote && /* @__PURE__ */ (0, w.jsx)("p", {
						"data-settings-remote": "",
						children: m.map((e) => p[e][0] + ": " + (u.remote[e] ? "فعال" : "خاموش")).join(" · ")
					}),
					/* @__PURE__ */ (0, w.jsx)("button", {
						className: "button-forest",
						type: "submit",
						disabled: d || u.conflict,
						children: "ذخیرهٔ تنظیمات"
					})
				]
			})
		]
	});
}
// frontend/notifications/mount.tsx
var R = 0;
function z(e) {
	let t = e.doc ?? document, n = e.win ?? window, r = "class-notice-panel-" + ++R, i = t.createElement("div");
	i.dataset.reactNotificationsRoot = "", i.style.display = "contents", t.body.append(i);
	let a = (0, c.createRoot)(i, { identifierPrefix: r + "-" }), l = /* @__PURE__ */ new Set(), u = e.userId, d, f, p = 0, m = !1, h = null, g = null, _ = {
		anchors: [],
		active: null,
		page: null
	}, v = C(n, e, () => {
		try {
			d?.postMessage({
				type: "changed",
				owner: u
			});
		} catch {}
	}), y = () => _, b = (e) => (l.add(e), () => {
		l.delete(e);
	});
	function x(e) {
		_ = {
			..._,
			...e
		}, l.forEach((e) => e());
	}
	let S = (e) => e?.querySelector(".notice-trigger") ?? null;
	function T(e = !1) {
		let t = _.active;
		t && (x({ active: null }), e && t.isConnected && S(t)?.focus({ preventScroll: !0 }));
	}
	function E(e) {
		!v.alive() || v.get().authBusy || v.get().settings || (_.active === e ? T() : (x({ active: e }), t.dispatchEvent(new n.CustomEvent("classroom-panel-open", { detail: { kind: "notifications" } })), v.refresh(!0)));
	}
	let D = {
		href: (t) => e.previewHref ?? t.href,
		async open(t, r) {
			let { busy: i, authBusy: a } = v.get();
			!v.alive() || i || a ? r.preventDefault() : r.metaKey || r.ctrlKey || r.shiftKey || r.altKey || r.button ? v.read(t) : (r.preventDefault(), T(), await v.read(t) && v.alive() && !v.get().authBusy && (e.onNavigate ?? ((e) => n.location.assign(e)))(t.href));
		},
		settings(e) {
			v.openSettings() && (g = null, h = (e.closest("[data-react-notices-popup]") ? S(_.active) : null) ?? e, T());
		}
	};
	function O() {
		let e = g;
		e && !m && (!e.isConnected || v.get().authBusy ? g = null : e.matches(":disabled") || (g = null, (t.activeElement === t.body || i.contains(t.activeElement)) && e.focus({ preventScroll: !0 })));
	}
	function k() {
		g = h, h = null, n.queueMicrotask(O);
	}
	function j() {
		let t = (0, o.useSyncExternalStore)(v.subscribe, v.get), { anchors: n, active: i, page: a } = (0, o.useSyncExternalStore)(b, y);
		return (0, o.useLayoutEffect)(O, [t.busy, t.settings]), /* @__PURE__ */ (0, w.jsxs)(w.Fragment, { children: [
			n.map(({ element: e, key: n }) => (0, s.createPortal)(/* @__PURE__ */ (0, w.jsx)(A, {
				state: t,
				expanded: i === e,
				panelId: r,
				toggle: () => E(e)
			}), e, String(n))),
			/* @__PURE__ */ (0, w.jsx)(F, {
				state: t,
				store: v,
				actions: D,
				anchor: i,
				panelId: r,
				historyURL: e.previewHref ?? new URL("notifications/", e.baseURL).href,
				close: T
			}),
			a && (0, s.createPortal)(/* @__PURE__ */ (0, w.jsx)(I, {
				state: t,
				store: v,
				actions: D
			}), a),
			t.settings && /* @__PURE__ */ (0, w.jsx)(L, {
				state: t,
				store: v,
				panelId: r,
				restore: k
			}),
			/* @__PURE__ */ (0, w.jsx)("p", {
				className: "sr-only",
				role: "status",
				"aria-live": "polite",
				children: t.actionError || t.message
			})
		] });
	}
	function M(e) {
		let t = e;
		return !!t && (i.contains(t) || _.anchors.some(({ element: e }) => e.contains(t)));
	}
	function N(e) {
		_.active && !M(e.target) && T();
	}
	function P(e) {
		_.active && e.key === "Escape" && !e.defaultPrevented && !e.isComposing && (e.preventDefault(), T(!0));
	}
	function z(e) {
		e.detail?.kind !== "notifications" && T();
	}
	function B() {
		v.alive() && (n.clearTimeout(f), f = n.setTimeout(() => {
			f = void 0, v.refreshSurfaces(!0);
		}, 250));
	}
	function V() {
		t.visibilityState !== "hidden" && n.navigator.onLine !== !1 && v.refreshSurfaces();
	}
	function H() {
		v.refreshSurfaces(!0);
	}
	function U() {
		let e = _.anchors.filter(({ element: e }) => e.isConnected), t = _.active?.isConnected ? _.active : null;
		(e.length !== _.anchors.length || t !== _.active) && x({
			anchors: e,
			active: t
		}), _.page && !_.page.isConnected && (x({ page: null }), v.setHistoryAttached(!1));
	}
	let W = typeof n.MutationObserver == "function" ? new n.MutationObserver((e) => {
		e.some((e) => e.removedNodes.length) && U();
	}) : null;
	W?.observe(t.body, {
		childList: !0,
		subtree: !0
	}), t.addEventListener("click", N), t.addEventListener("focusin", N), t.addEventListener("keydown", P), t.addEventListener("classroom-panel-open", z), t.addEventListener("classroom-progress-changed", B), t.addEventListener("visibilitychange", V), n.addEventListener("focus", V), n.addEventListener("online", H);
	let G = n.setInterval(V, e.refreshInterval ?? 3e5);
	try {
		n.BroadcastChannel && (d = new n.BroadcastChannel("class-notes-notices:" + new URL(e.baseURL).pathname + ":" + u), d.onmessage = (e) => {
			e.data?.type === "changed" && e.data?.owner === u && v.refreshSurfaces(!0);
		});
	} catch {}
	return a.render(/* @__PURE__ */ (0, w.jsx)(j, {})), {
		attach(e) {
			e?.isConnected && v.alive() && (U(), _.anchors.some((t) => t.element === e) || x({ anchors: [..._.anchors, {
				element: e,
				key: ++p
			}] }));
		},
		attachPage(e) {
			v.alive() && e !== _.page && (e && e.replaceChildren(), x({ page: e }), v.setHistoryAttached(!!e));
		},
		refresh: v.refresh,
		setBusy(e) {
			v.setBusy(e), e && T();
		},
		dispose() {
			m || (m = !0, W?.disconnect(), n.clearInterval(G), n.clearTimeout(f), d?.close(), t.removeEventListener("click", N), t.removeEventListener("focusin", N), t.removeEventListener("keydown", P), t.removeEventListener("classroom-panel-open", z), t.removeEventListener("classroom-progress-changed", B), t.removeEventListener("visibilitychange", V), n.removeEventListener("focus", V), n.removeEventListener("online", H), v.dispose(), a.unmount(), i.remove(), l.clear(), _ = {
				anchors: [],
				page: null,
				active: null
			}, h = null, g = null);
		}
	};
}
export { z as mountNotifications };
