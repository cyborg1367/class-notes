import { a as e, i as t } from "./jsx-runtime-CMv_BHj2.mjs";
// frontend/lab/layout/model.ts
var n = /* @__PURE__ */ e(t(), 1), r = [
	{
		id: "mission",
		label: "مأموریت",
		className: "lab-task"
	},
	{
		id: "data",
		label: "داده‌ها",
		className: "mission-dataset"
	},
	{
		id: "guide",
		label: "راهنما",
		className: "mission-guide"
	},
	{
		id: "assistant",
		label: "دستیار",
		className: ""
	}
], i = "classroom-lab-layout:v2", a = "classroom-lab-panel-width:v1", o = {
	row: 67,
	column: 41.85
}, s = (e, t) => typeof e == "number" && Number.isFinite(e) ? e : t;
function c(e, t) {
	if (e === "row") {
		let e = Math.max(1, t - 12);
		return {
			min: Math.max(20, Math.min(55, 160 / e * 100)),
			max: Math.min(85, Math.max(60, 100 - 110 / e * 100))
		};
	}
	let n = Math.max(1, t - 8), r = Math.min(320, n * .45), i = Math.max(r, Math.min(900, n - 420));
	return {
		min: r / n * 100,
		max: i / n * 100
	};
}
function l(e, t, n) {
	let { min: r, max: i } = c(e, n);
	return Math.min(i, Math.max(r, s(t, o[e])));
}
function u(e, t, n, r) {
	let i = n.indexOf(e);
	return i < 0 ? null : t === "Home" ? n[0] : t === "End" ? n[n.length - 1] || null : t !== "ArrowLeft" && t !== "ArrowRight" ? null : n[(i + (t === "ArrowRight" === r ? -1 : 1) + n.length) % n.length];
}
function d(e) {
	function t(t) {
		try {
			return JSON.parse(e?.getItem(t) || "null");
		} catch {
			return null;
		}
	}
	let n = t(i), r = n && typeof n == "object" ? n : {}, c = {
		tab: "mission",
		sidebarHidden: !1,
		consoleMode: r.collapsed === !0 ? "collapsed" : "normal",
		editorShare: s(r.ratio, o.row),
		panelShare: s(t(a), o.column)
	}, l = /* @__PURE__ */ new Set();
	function u(e) {
		Object.entries(e).some(([e, t]) => c[e] !== t) && (c = {
			...c,
			...e
		}, l.forEach((e) => e()));
	}
	function d(t) {
		try {
			t === "row" ? e?.setItem(i, JSON.stringify({
				ratio: c.editorShare,
				collapsed: c.consoleMode === "collapsed"
			})) : e?.setItem(a, JSON.stringify(c.panelShare));
		} catch {}
	}
	return {
		get: () => c,
		subscribe(e) {
			return l.add(e), () => {
				l.delete(e);
			};
		},
		set: u,
		save: d,
		changeShare(e, t, n) {
			u(e === "row" ? { editorShare: t } : { panelShare: t }), n && d(e);
		}
	};
}
// frontend/lab/layout/useSplitter.ts
function f({ axis: e, share: t, disabled: r = !1, change: i, save: a }) {
	let s = (0, n.useRef)(null), u = (0, n.useRef)(null), [d, f] = (0, n.useState)(e === "row" ? 560 : 1200), [p, m] = (0, n.useState)(!1), [h, g] = (0, n.useState)(!1), _ = r || e === "column" && p, v = l(e, t, d), { min: y, max: b } = c(e, d), x = (0, n.useRef)(i), S = (0, n.useRef)(a);
	(0, n.useLayoutEffect)(() => {
		x.current = i, S.current = a;
	}, [i, a]), (0, n.useLayoutEffect)(() => {
		let t = s.current, n = t?.ownerDocument.defaultView;
		if (!t || !n) return;
		let r = e === "column" ? n.matchMedia?.("(max-width:860px)") : null, i = () => {
			let i = t.getBoundingClientRect();
			e === "row" ? f(i.height || 560) : (f(i.width || n.innerWidth || 1200), m(r?.matches ?? n.innerWidth <= 860));
		}, a = n.ResizeObserver ? new n.ResizeObserver(i) : null;
		return a?.observe(t), n.addEventListener("resize", i), r?.addEventListener?.("change", i), i(), () => {
			u.current?.(!1), a?.disconnect(), n.removeEventListener("resize", i), r?.removeEventListener?.("change", i);
		};
	}, [e]), (0, n.useLayoutEffect)(() => {
		_ && u.current?.(!1);
	}, [_]);
	function C(t) {
		if (_ || u.current || t.button !== 0) return;
		let n = t.currentTarget, r = n.ownerDocument.defaultView;
		if (!r) return;
		t.preventDefault(), n.focus({ preventScroll: !0 });
		let i = t.pointerId, a = e === "row" ? t.clientY : t.clientX, o = v, s = Math.max(1, d - (e === "row" ? 12 : 8));
		function c(t) {
			if (t.pointerId !== i) return;
			let n = (e === "row" ? t.clientY - a : a - t.clientX) / s * 100;
			x.current(l(e, o + n, d), !1);
		}
		function f(e) {
			e.pointerId === i && p(!0);
		}
		function p(e) {
			if (u.current) {
				u.current = null, r.removeEventListener("pointermove", c), r.removeEventListener("pointerup", f), r.removeEventListener("pointercancel", f), n.removeEventListener("lostpointercapture", f);
				try {
					n.hasPointerCapture?.(i) && n.releasePointerCapture(i);
				} catch {}
				e && S.current(), g(!1);
			}
		}
		u.current = p, g(!0), r.addEventListener("pointermove", c), r.addEventListener("pointerup", f), r.addEventListener("pointercancel", f), n.addEventListener("lostpointercapture", f);
		try {
			n.setPointerCapture?.(i);
		} catch {}
	}
	function w(t) {
		if (_ || t.altKey || t.ctrlKey || t.metaKey) return;
		let n = t.shiftKey ? 10 : e === "row" ? 5 : 2, r = e === "row" ? "ArrowUp" : "ArrowRight", a = e === "row" ? "ArrowDown" : "ArrowLeft", o;
		if (t.key === r) o = v - n;
		else if (t.key === a) o = v + n;
		else if (t.key === "Home") o = y;
		else if (t.key === "End") o = b;
		else return;
		t.preventDefault(), i(l(e, o, d), !0);
	}
	return {
		container: s,
		ratio: v,
		dragging: h,
		unavailable: _,
		handle: {
			hidden: _,
			tabIndex: _ ? -1 : 0,
			"aria-valuemin": Math.round(y),
			"aria-valuemax": Math.round(b),
			"aria-valuenow": Math.round(v),
			"aria-valuetext": Math.round(v) + (e === "row" ? "٪ برای ویرایشگر" : "٪ برای پنل مأموریت"),
			onPointerDown: C,
			onKeyDown: w,
			onDoubleClick: () => {
				_ || i(l(e, o[e], d), !0);
			}
		}
	};
}
export { r as i, d as n, u as r, f as t };
