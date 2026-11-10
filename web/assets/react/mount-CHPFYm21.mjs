import { a as e, i as t, n, r, t as i } from "./jsx-runtime-CMv_BHj2.mjs";
// web/assets/classroom-presence.mjs
var a = /* @__PURE__ */ e(t(), 1), o = r(), s = n();
function c(e, t) {
	let n = /* @__PURE__ */ new Set(), r = [];
	for (let i of Array.isArray(e) ? e : []) {
		if (!i || typeof i.id != "string" || i.id === t || n.has(i.id)) continue;
		n.add(i.id);
		let e = typeof i.name == "string" && !i.name.includes("@") ? i.name.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 60).trim() : "هم‌کلاسی";
		r.push({
			id: i.id,
			name: e || "هم‌کلاسی"
		});
	}
	return r;
}
// frontend/presence/store.ts
function l(e) {
	return e && typeof e == "object" ? e : {};
}
function u(e, t) {
	let { client: n, rpc: r, userId: i, courses: a } = t, o = e.crypto.randomUUID(), s = `classroom-presence-setting:${i}`, u = a.find((e) => e.id === t.courseId) || a[0], d = {
		open: !1,
		connected: !1,
		heading: u?.title || "",
		people: [],
		status: "",
		courseId: u?.id || "",
		courses: a,
		visible: !0,
		settingBusy: !1,
		settingStatus: "",
		settingReady: !1
	}, f = !1, p = !1, m = !1, h = !1, g = 0, _ = 0, v, y, b, x = /* @__PURE__ */ new Set(), S = () => !f && (t.isCurrent?.() ?? !0);
	function C(e) {
		S() && (d = {
			...d,
			...e
		}, x.forEach((e) => e()));
	}
	function w() {
		C({
			connected: !1,
			people: [],
			status: "فهرست به‌روز دریافت نشد؛ اتصال دوباره خودکار انجام می‌شود."
		});
	}
	function T(e) {
		_ = Date.now();
		let t = l(e), n = c(t.members, i);
		C({
			connected: !0,
			people: n,
			visible: t.visible !== !1,
			settingReady: !0,
			status: n.length ? "" : "در حال حاضر هم‌کلاسی دیگری آنلاین نیست."
		});
	}
	async function E() {
		if (!S() || !u) return;
		if (p) {
			m = !0;
			return;
		}
		p = !0;
		let e = g, t = u.id;
		try {
			let n = await r("classroom_presence", {
				p_course: t,
				p_session: o,
				p_action: "sync"
			});
			S() && e === g && T(n);
		} catch {
			S() && e === g && w();
		} finally {
			p = !1, m && S() && (m = !1, D());
		}
	}
	function D() {
		S() && !y && (y = e.setTimeout(() => {
			y = void 0, E();
		}, 1e3));
	}
	async function O(e) {
		try {
			await r("classroom_presence", {
				p_course: e,
				p_session: o,
				p_action: "leave"
			});
		} catch {}
	}
	function k() {
		if (!v) return;
		let e = v;
		v = null, Promise.resolve(n.removeChannel(e)).catch(() => {});
	}
	async function A() {
		if (g++, k(), !u || !S()) return;
		C({
			heading: u.title,
			courseId: u.id
		});
		let e = g;
		E();
		try {
			if (await n.realtime?.setAuth(), !S() || e !== g) return;
			v = n.channel("classroom-presence:" + u.id, { config: { private: !0 } }).on("broadcast", { event: "changed" }, D).subscribe((t) => {
				S() && e === g && t === "SUBSCRIBED" && Date.now() - _ > 1e3 && D();
			});
		} catch {}
	}
	function j() {
		e.clearInterval(b), b = e.setInterval(() => {
			E();
		}, t.pollInterval ?? 3e4);
	}
	return (async () => {
		try {
			if (u) {
				A(), j();
				return;
			}
			let e = l(await r("classroom_presence_visibility"));
			if (!S()) return;
			C({
				visible: e.visible !== !1,
				settingReady: !0
			});
		} catch {
			S() && C({ settingStatus: "تنظیم حضور دریافت نشد." });
		}
		S() && (A(), j());
	})(), {
		get: () => d,
		subscribe(e) {
			return x.add(e), () => {
				x.delete(e);
			};
		},
		setOpen(e) {
			S() && C({ open: e });
		},
		selectCourse(e) {
			if (!S()) return;
			let t = u?.id;
			u = a.find((t) => t.id === e) || a[0], t && O(t), w(), A();
		},
		async setVisible(e) {
			if (!h && S()) {
				h = !0, C({ settingBusy: !0 });
				try {
					let n = l(await r("classroom_presence_visibility", { p_visible: e }));
					if (!S()) return;
					let i = n.visible !== !1;
					C({
						visible: i,
						settingStatus: i ? "نمایش حضور فعال شد." : "حضور تو پنهان شد."
					});
					try {
						t.storage?.setItem(s, String(Date.now()));
					} catch {}
					D();
				} catch {
					S() && C({ settingStatus: "تنظیم ثبت نشد؛ دوباره تلاش کن." });
				} finally {
					h = !1, S() && C({ settingBusy: !1 });
				}
			}
		},
		online() {
			E();
		},
		offline() {
			w();
		},
		visible() {
			e.document.hidden || E();
		},
		storage(e) {
			e.key === s && D();
		},
		pagehide() {
			u && O(u.id), k();
		},
		pageshow() {
			A();
		},
		dispose() {
			f || (f = !0, g++, e.clearTimeout(y), e.clearInterval(b), k(), u && O(u.id), x.clear());
		}
	};
}
// frontend/presence/views.tsx
var d = i(), f = new Intl.NumberFormat("fa-IR");
function p({ store: e }) {
	let t = (0, a.useSyncExternalStore)(e.subscribe, e.get);
	return /* @__PURE__ */ (0, d.jsxs)("details", {
		className: "classroom-presence",
		"data-react-presence": "",
		open: t.open,
		"data-connected": t.connected ? "true" : "false",
		onToggle: (t) => e.setOpen(t.target.open),
		children: [/* @__PURE__ */ (0, d.jsxs)("summary", { children: [/* @__PURE__ */ (0, d.jsx)("span", {
			className: "presence-dot",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, d.jsx)("span", {
			"data-presence-label": "",
			children: t.connected ? /* @__PURE__ */ (0, d.jsxs)(d.Fragment, { children: [
				f.format(t.people.length),
				" ",
				/* @__PURE__ */ (0, d.jsx)("span", {
					className: "presence-class-word",
					children: "هم‌کلاسی"
				}),
				" آنلاین"
			] }) : t.status ? "حضور نامشخص" : "اتصال…"
		})] }), /* @__PURE__ */ (0, d.jsxs)("section", {
			className: "presence-popover",
			"aria-label": "هم‌کلاسی‌های آنلاین",
			children: [
				/* @__PURE__ */ (0, d.jsx)("p", {
					className: "presence-heading",
					children: t.heading
				}),
				/* @__PURE__ */ (0, d.jsx)("select", {
					"aria-label": "انتخاب کلاس",
					hidden: t.courses.length < 2,
					value: t.courseId,
					onChange: (t) => e.selectCourse(t.currentTarget.value),
					children: t.courses.map((e) => /* @__PURE__ */ (0, d.jsx)("option", {
						value: e.id,
						children: e.title
					}, e.id))
				}),
				/* @__PURE__ */ (0, d.jsx)("p", {
					"data-presence-status": "",
					role: "status",
					"aria-live": "polite",
					children: t.connected ? t.status : t.status || ""
				}),
				/* @__PURE__ */ (0, d.jsx)("ul", {
					"aria-label": "فهرست هم‌کلاسی‌های آنلاین",
					children: t.people.map((e) => /* @__PURE__ */ (0, d.jsxs)("li", { children: [/* @__PURE__ */ (0, d.jsx)("span", {
						className: "presence-dot",
						"aria-hidden": "true"
					}), e.name] }, e.id))
				}),
				/* @__PURE__ */ (0, d.jsx)("p", {
					className: "presence-note",
					children: "این فهرست خودت را نمی‌شمارد. آنلاین‌بودن به معنی بازبودن سایت است، نه لزوماً مطالعه."
				})
			]
		})]
	});
}
function m({ store: e }) {
	let t = (0, a.useSyncExternalStore)(e.subscribe, e.get);
	function n(t) {
		e.setVisible(t.currentTarget.checked);
	}
	return /* @__PURE__ */ (0, d.jsxs)("section", {
		className: "presence-setting",
		"data-presence-settings": "",
		children: [
			/* @__PURE__ */ (0, d.jsxs)("label", { children: [/* @__PURE__ */ (0, d.jsx)("input", {
				type: "checkbox",
				checked: t.visible,
				disabled: !t.settingReady || t.settingBusy,
				onChange: n
			}), /* @__PURE__ */ (0, d.jsx)("span", { children: "نمایش حضور من به هم‌کلاسی‌ها" })] }),
			/* @__PURE__ */ (0, d.jsx)("p", { children: "با خاموش‌کردن این گزینه، نامت در فهرست آنلاین نمایش داده نمی‌شود." }),
			/* @__PURE__ */ (0, d.jsx)("p", {
				"data-setting-status": "",
				role: "status",
				"aria-live": "polite",
				children: t.settingStatus
			})
		]
	});
}
// frontend/presence/mount.tsx
function h(e) {
	let t = (e.anchor || e.account)?.ownerDocument || document, n = t.defaultView || window, r = e.storage;
	if (r === void 0) try {
		r = n.localStorage;
	} catch {
		r = null;
	}
	let i = t.createElement("div");
	i.dataset.reactPresenceRoot = "", i.style.display = "contents", t.body.append(i);
	let c = (0, s.createRoot)(i, { identifierPrefix: "presence-" }), l = u(n, {
		...e,
		storage: r
	}), f = !!(e.anchor && e.courses.length), h = !!e.account;
	function g() {
		return (0, a.useSyncExternalStore)(l.subscribe, l.get), /* @__PURE__ */ (0, d.jsxs)(d.Fragment, { children: [f && e.anchor && (0, o.createPortal)(/* @__PURE__ */ (0, d.jsx)(p, { store: l }), e.anchor), h && e.account && (0, o.createPortal)(/* @__PURE__ */ (0, d.jsx)(m, { store: l }), e.account)] });
	}
	function _(t) {
		let n = t.target, r = e.anchor?.querySelector(".classroom-presence");
		r && !r.contains(n) && l.setOpen(!1);
	}
	function v(t) {
		t.key === "Escape" && l.get().open && (l.setOpen(!1), e.anchor?.querySelector("summary")?.focus());
	}
	return t.addEventListener("click", _), t.addEventListener("keydown", v), n.addEventListener("storage", l.storage), n.addEventListener("online", l.online), n.addEventListener("offline", l.offline), t.addEventListener("visibilitychange", l.visible), n.addEventListener("pagehide", l.pagehide), n.addEventListener("pageshow", l.pageshow), c.render(/* @__PURE__ */ (0, d.jsx)(g, {})), { dispose() {
		t.removeEventListener("click", _), t.removeEventListener("keydown", v), n.removeEventListener("storage", l.storage), n.removeEventListener("online", l.online), n.removeEventListener("offline", l.offline), t.removeEventListener("visibilitychange", l.visible), n.removeEventListener("pagehide", l.pagehide), n.removeEventListener("pageshow", l.pageshow), l.dispose(), c.unmount(), i.remove();
	} };
}
export { h as mountPresence };
