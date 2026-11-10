import { n as e, r as t, t as n } from "./jsx-runtime-CMv_BHj2.mjs";
// frontend/lab/xp/model.ts
var r = t(), i = e(), a = (e) => Number.isSafeInteger(e) && e >= 0 ? e : 0;
function o({ xp: e, maximum: t, completed: n, total: r }) {
	let i = a(t) || 300, o = a(r);
	return {
		xp: Math.min(i, a(e)),
		maximum: i,
		completed: Math.min(o, a(n)),
		total: o
	};
}
function s(e) {
	let { stage: t, earned: n, from: r, to: i, maximum: a } = e;
	return ![
		t,
		n,
		r,
		i,
		a
	].every(Number.isSafeInteger) || t < 0 || r < 0 || n <= 0 || i <= r || i > a || n > i ? null : e;
}
var c = (e, t) => 100 - e / t * 100, l = n();
function u({ reward: e = !1 }) {
	let t = e ? 108 : 100;
	return /* @__PURE__ */ (0, l.jsxs)("svg", {
		className: "xp-ring",
		viewBox: "0 0 240 240",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, l.jsx)("circle", {
				className: "xp-ring-disc",
				cx: "120",
				cy: "120",
				r: "99"
			}),
			/* @__PURE__ */ (0, l.jsx)("circle", {
				className: "xp-ring-track",
				cx: "120",
				cy: "120",
				r: t,
				pathLength: "100"
			}),
			/* @__PURE__ */ (0, l.jsx)("circle", {
				className: "xp-ring-fill",
				"data-celebration-ring": e ? "" : void 0,
				cx: "120",
				cy: "120",
				r: t,
				pathLength: "100"
			})
		]
	});
}
function d({ progress: { xp: e, maximum: t, completed: n, total: r } }) {
	let i = { "--xp-to": c(e, t) };
	return /* @__PURE__ */ (0, l.jsxs)("div", {
		className: "mission-xp" + (e === t ? " is-complete" : ""),
		lang: "en",
		dir: "ltr",
		style: i,
		children: [/* @__PURE__ */ (0, l.jsxs)("div", {
			className: "mission-xp-orbit",
			"data-header-progress": "",
			role: "progressbar",
			"aria-label": "Lab XP",
			"aria-valuemin": 0,
			"aria-valuemax": t,
			"aria-valuenow": e,
			"aria-valuetext": e + " of " + t + " XP; " + n + " of " + r + " missions completed",
			children: [/* @__PURE__ */ (0, l.jsx)(u, {}), /* @__PURE__ */ (0, l.jsx)("div", {
				className: "mission-xp-core",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, l.jsx)("strong", {
					className: "mission-xp-value",
					"data-xp": "",
					children: e
				})
			})]
		}), /* @__PURE__ */ (0, l.jsxs)("div", {
			className: "mission-xp-copy",
			children: [
				/* @__PURE__ */ (0, l.jsxs)("span", {
					className: "mission-xp-limit",
					children: [
						"of ",
						/* @__PURE__ */ (0, l.jsx)("span", {
							"data-xp-maximum": "",
							children: t
						}),
						" XP"
					]
				}),
				/* @__PURE__ */ (0, l.jsxs)("p", {
					className: "mission-xp-count",
					"data-count": "",
					children: [
						n,
						" of ",
						r,
						" completed"
					]
				}),
				/* @__PURE__ */ (0, l.jsxs)("span", {
					className: "mission-xp-percent",
					"data-xp-percent": "",
					children: [Math.round(e / t * 100), "% complete"]
				})
			]
		})]
	});
}
function f({ reward: e, onDismiss: t }) {
	let { earned: n, from: r, to: i, maximum: a, finished: o } = e, s = {
		"--xp-from": c(r, a),
		"--xp-to": c(i, a),
		"--xp-turn-from": r / a * 360 + "deg",
		"--xp-turn-to": i / a * 360 + "deg"
	};
	return /* @__PURE__ */ (0, l.jsxs)("dialog", {
		className: "xp-celebration is-celebrating" + (o ? " is-complete" : ""),
		"data-celebration": "",
		lang: "en",
		dir: "ltr",
		style: s,
		"aria-labelledby": "xp-celebration-title",
		"aria-describedby": "xp-celebration-message xp-celebration-detail",
		onCancel: (e) => {
			e.preventDefault(), t(!1);
		},
		onClose: (e) => {
			e.currentTarget.open || t(!1);
		},
		onClick: (e) => {
			if (e.target !== e.currentTarget) return;
			let n = e.currentTarget.getBoundingClientRect();
			(e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom) && t(!1);
		},
		children: [
			/* @__PURE__ */ (0, l.jsx)("button", {
				className: "xp-celebration-close",
				"data-celebration-close": "",
				type: "button",
				"aria-label": "Close celebration",
				onClick: () => t(!1),
				children: /* @__PURE__ */ (0, l.jsx)("svg", {
					viewBox: "0 0 20 20",
					width: "18",
					height: "18",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, l.jsx)("path", {
						d: "m5 5 10 10M15 5 5 15",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.5",
						strokeLinecap: "round"
					})
				})
			}),
			/* @__PURE__ */ (0, l.jsxs)("div", {
				className: "xp-orbit",
				children: [
					/* @__PURE__ */ (0, l.jsx)(u, { reward: !0 }),
					/* @__PURE__ */ (0, l.jsx)("span", {
						className: "xp-ring-tip",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, l.jsx)("i", {})
					}),
					/* @__PURE__ */ (0, l.jsxs)("div", {
						className: "xp-celebration-core",
						children: [
							/* @__PURE__ */ (0, l.jsx)("span", {
								className: "xp-celebration-check",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, l.jsx)("svg", {
									viewBox: "0 0 24 24",
									width: "18",
									height: "18",
									children: /* @__PURE__ */ (0, l.jsx)("path", {
										d: "m5.5 12 4 4L18.5 7",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "1.8",
										strokeLinecap: "round",
										strokeLinejoin: "round"
									})
								})
							}),
							/* @__PURE__ */ (0, l.jsxs)("h2", {
								id: "xp-celebration-title",
								children: [
									/* @__PURE__ */ (0, l.jsxs)("span", {
										"data-celebration-earned": "",
										children: ["+", n]
									}),
									" ",
									/* @__PURE__ */ (0, l.jsx)("span", {
										className: "xp-celebration-unit",
										children: "XP"
									})
								]
							}),
							/* @__PURE__ */ (0, l.jsx)("span", {
								className: "xp-celebration-label",
								children: "XP earned"
							})
						]
					}),
					[
						"one",
						"two",
						"three",
						"four"
					].map((e) => /* @__PURE__ */ (0, l.jsx)("span", {
						className: "xp-spark xp-spark-" + e,
						"aria-hidden": "true"
					}, e))
				]
			}),
			/* @__PURE__ */ (0, l.jsx)("p", {
				className: "xp-celebration-message",
				id: "xp-celebration-message",
				children: o ? "Lab completed!" : "Nicely done!"
			}),
			/* @__PURE__ */ (0, l.jsxs)("p", {
				className: "xp-celebration-total",
				id: "xp-celebration-detail",
				"data-celebration-progress": "",
				role: "progressbar",
				"aria-label": "Total lab XP",
				"aria-valuemin": 0,
				"aria-valuemax": a,
				"aria-valuenow": i,
				"aria-valuetext": i + " of " + a + " XP",
				children: [
					/* @__PURE__ */ (0, l.jsx)("span", {
						"data-celebration-total": "",
						children: i
					}),
					/* @__PURE__ */ (0, l.jsx)("span", {
						className: "xp-celebration-divider",
						children: " / "
					}),
					/* @__PURE__ */ (0, l.jsx)("span", {
						"data-celebration-maximum": "",
						children: a
					}),
					" XP"
				]
			}),
			/* @__PURE__ */ (0, l.jsxs)("button", {
				className: "xp-celebration-continue",
				"data-celebration-continue": "",
				type: "button",
				onClick: () => t(!0),
				children: ["Continue", /* @__PURE__ */ (0, l.jsx)("svg", {
					viewBox: "0 0 20 20",
					width: "17",
					height: "17",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, l.jsx)("path", {
						d: "M4 10h12m-5-5 5 5-5 5",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.5",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					})
				})]
			})
		]
	});
}
function p({ reward: e }) {
	return /* @__PURE__ */ (0, l.jsx)("div", {
		className: e ? "mission-award" : "lab-sr-only",
		"data-award": "",
		role: "status",
		lang: "en",
		dir: "ltr",
		children: e ? "+" + e.earned + " XP · " + e.to + " of " + e.maximum + " XP" : ""
	});
}
// frontend/lab/xp/mount.tsx
function m(e, t) {
	let n = e.querySelector("[data-react-lab-xp]"), a = e.querySelector("[data-react-lab-award]");
	if (!n || !a) throw Error("LAB_XP_MOUNT_POINT_MISSING");
	let c = (0, i.createRoot)(n, { identifierPrefix: "lab-xp-" }), u = null, m = null, h = !1, g = !1, _ = e.querySelector("[data-lab-reward-slot]") || e, v = () => _.querySelector("[data-celebration]"), y = () => (0, r.flushSync)(() => c.render(/* @__PURE__ */ (0, l.jsxs)(l.Fragment, { children: [
		u && /* @__PURE__ */ (0, l.jsx)(d, { progress: u }),
		(0, r.createPortal)(/* @__PURE__ */ (0, l.jsx)(p, { reward: h ? m : null }), a),
		m && !h && (0, r.createPortal)(/* @__PURE__ */ (0, l.jsx)(f, {
			reward: m,
			onDismiss: x
		}), _)
	] })));
	function b() {
		if (g || !m) return;
		let e = v();
		m = null, h = !1, e?.open && typeof e.close == "function" && e.close(), y();
	}
	function x(e) {
		if (!m || g) return;
		let { stage: n } = m;
		b(), t.onDismiss(n, e);
	}
	return {
		update(e) {
			if (g) return;
			let t = o(e);
			u && u.xp === t.xp && u.maximum === t.maximum && u.completed === t.completed && u.total === t.total || (u = t, y());
		},
		show(e) {
			if (g) return !1;
			let t = s(e);
			if (!t) return !1;
			b(), m = t, y();
			let n = v();
			try {
				if (typeof n?.showModal != "function" || typeof n.close != "function") throw Error("DIALOG_UNAVAILABLE");
				n.showModal(), n.querySelector("[data-celebration-continue]")?.focus({ preventScroll: !0 });
			} catch {
				n?.open && typeof n.close == "function" && n.close(), h = !0, y();
			}
			return !0;
		},
		clear: b,
		dispose() {
			if (g) return;
			let e = v();
			g = !0, m = null, e?.open && typeof e.close == "function" && e.close(), c.unmount();
		}
	};
}
export { m as mountLabXp };
