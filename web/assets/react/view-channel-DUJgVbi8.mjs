// web/assets/view-channel.mjs
function e(e) {
	let t = (e) => e && typeof e == "object" ? Object.freeze(Array.isArray(e) ? e.map(t) : Object.fromEntries(Object.entries(e).map(([e, n]) => [e, t(n)]))) : e, n = t(e), r = {}, i = 0, a = /* @__PURE__ */ new Set(), o = () => {
		for (let e of [...a]) e();
	};
	return {
		getSnapshot: () => n,
		subscribe(e) {
			return a.add(e), () => a.delete(e);
		},
		publish(e) {
			n = t(e), o();
		},
		reset() {
			i++, r = {}, n = t(e), o();
		},
		bindActions(e) {
			let t = ++i;
			return r = e, () => t === i && (i++, r = {}, !0);
		},
		perform(e) {
			let t = Object.hasOwn(r, e) ? r[e] : null;
			return t ? Promise.resolve().then(t) : Promise.resolve(!1);
		}
	};
}
var t = Symbol.for("class-notes.view-channel.v1");
function n(n, r) {
	return n[t] || Object.defineProperty(n, t, {
		value: e(r),
		configurable: !0
	}), n[t];
}
export { n, e as t };
