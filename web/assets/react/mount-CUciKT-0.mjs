import { a as e, i as t, n, r, t as i } from "./jsx-runtime-CMv_BHj2.mjs";
import { r as a } from "./runtime-D2U6pln4.mjs";
import { t as o } from "./useSplitter-DltN7h7Z.mjs";
// frontend/lab/workspace/views.tsx
var s = n(), c = /* @__PURE__ */ e(t(), 1), l = r(), u = i();
function d({ vertical: e = !1 }) {
	return /* @__PURE__ */ (0, u.jsx)("svg", {
		viewBox: "0 0 20 20",
		"aria-hidden": "true",
		children: [
			4,
			10,
			16
		].map((t) => /* @__PURE__ */ (0, u.jsx)("circle", {
			cx: e ? 10 : t,
			cy: e ? t : 10,
			r: "1"
		}, t))
	});
}
function f() {
	return /* @__PURE__ */ (0, u.jsx)("svg", {
		viewBox: "0 0 20 20",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, u.jsx)("path", { d: "M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4" })
	});
}
function p({ options: e, actions: t, controls: n, save: r, sidebarHidden: i, toggleSidebar: o }) {
	let s = (0, c.useSyncExternalStore)(n.subscribe, n.get), l = (0, c.useSyncExternalStore)(r.subscribe, r.get), p = e.mode !== "readonly-preview", m = e.mode === "normal";
	return /* @__PURE__ */ (0, u.jsxs)("div", {
		className: "lab-editor-toolbar",
		dir: "rtl",
		children: [/* @__PURE__ */ (0, u.jsxs)("span", {
			className: "lab-file",
			children: [
				/* @__PURE__ */ (0, u.jsx)(a, { name: "note" }),
				/* @__PURE__ */ (0, u.jsx)("bdi", {
					className: "lab-filename",
					lang: "en",
					dir: "ltr",
					title: e.filename,
					children: e.filename
				}),
				/* @__PURE__ */ (0, u.jsx)("span", {
					className: "lab-file-dot",
					"aria-hidden": "true"
				})
			]
		}), /* @__PURE__ */ (0, u.jsxs)("div", {
			className: "lab-toolbar-controls",
			children: [
				/* @__PURE__ */ (0, u.jsxs)("div", {
					className: "lab-actions",
					dir: "rtl",
					hidden: !p && !m,
					children: [
						/* @__PURE__ */ (0, u.jsxs)("button", {
							className: "lab-run-button",
							"data-run": "",
							type: "button",
							onClick: t.run,
							hidden: !p || s.running,
							disabled: !p || s.busy,
							title: "اجرای کد (Ctrl+Enter)",
							"aria-keyshortcuts": "Control+Enter Meta+Enter",
							children: [/* @__PURE__ */ (0, u.jsx)(a, { name: "play" }), "اجرای کد"]
						}),
						/* @__PURE__ */ (0, u.jsx)("button", {
							className: "lab-run-button",
							"data-stop": "",
							type: "button",
							onClick: t.stop,
							hidden: !p || !s.running,
							disabled: !p || !s.running,
							children: "توقف"
						}),
						/* @__PURE__ */ (0, u.jsxs)("button", {
							className: "button-forest",
							"data-check": "",
							type: "button",
							onClick: t.check,
							hidden: !m,
							disabled: !m || s.busy,
							children: [/* @__PURE__ */ (0, u.jsx)(a, { name: "check" }), "بررسی پاسخ"]
						})
					]
				}),
				/* @__PURE__ */ (0, u.jsx)("button", {
					className: "lab-last-feedback",
					"data-last-feedback": "",
					type: "button",
					hidden: !0,
					children: "آخرین بازخورد"
				}),
				/* @__PURE__ */ (0, u.jsxs)("details", {
					className: "lab-tools",
					"data-tools": "",
					children: [/* @__PURE__ */ (0, u.jsxs)("summary", {
						"aria-label": "ابزارها و وضعیت ذخیره",
						title: l.attention ? "ابزارها؛ ذخیره نیاز به بررسی دارد" : "ابزارها و وضعیت ذخیره",
						children: [/* @__PURE__ */ (0, u.jsx)(d, {}), /* @__PURE__ */ (0, u.jsx)("span", {
							className: "lab-save-alert",
							"data-save-alert": "",
							hidden: !l.attention,
							"aria-label": "ذخیره نیاز به بررسی دارد",
							children: "!"
						})]
					}), /* @__PURE__ */ (0, u.jsxs)("div", {
						className: "lab-tools-menu",
						children: [
							/* @__PURE__ */ (0, u.jsx)("p", {
								"data-save": "",
								role: "status",
								"aria-live": "polite",
								children: l.message
							}),
							/* @__PURE__ */ (0, u.jsx)("button", {
								"data-download": "",
								type: "button",
								onClick: t.download,
								children: "دانلود کد"
							}),
							/* @__PURE__ */ (0, u.jsxs)("button", {
								"data-imports": "",
								type: "button",
								onClick: t.imports,
								disabled: !s.canImport,
								children: ["افزودن دستورهای ", /* @__PURE__ */ (0, u.jsx)("bdi", {
									dir: "ltr",
									lang: "en",
									children: "import"
								})]
							}),
							/* @__PURE__ */ (0, u.jsx)("button", {
								"data-reset": "",
								type: "button",
								onClick: t.reset,
								disabled: s.busy,
								children: "بازنشانی این مرحله"
							}),
							/* @__PURE__ */ (0, u.jsx)("button", {
								"data-cloud-load": "",
								type: "button",
								onClick: t.load,
								disabled: !m || !s.canLoad,
								hidden: !m,
								children: "دریافت نسخهٔ حساب"
							}),
							/* @__PURE__ */ (0, u.jsx)("button", {
								"data-refresh": "",
								type: "button",
								onClick: t.refresh,
								disabled: !m,
								hidden: !m,
								children: "همگام‌سازی پیشرفت"
							}),
							/* @__PURE__ */ (0, u.jsx)("button", {
								"data-activate": "",
								type: "button",
								onClick: t.activate,
								disabled: !p || s.busy,
								hidden: !p || s.hasWorker,
								children: "راه‌اندازی Python"
							}),
							/* @__PURE__ */ (0, u.jsx)("a", {
								href: e.links.account,
								children: "حساب کاربری"
							}),
							/* @__PURE__ */ (0, u.jsx)("a", {
								href: e.links.dashboard,
								children: "داشبورد"
							}),
							/* @__PURE__ */ (0, u.jsx)("a", {
								"data-lab-teacher-link": "",
								hidden: !0,
								href: e.links.teacher,
								children: "پنل مدرس"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, u.jsxs)("button", {
					className: "lab-tool-button lab-focus-button",
					"data-focus": "",
					type: "button",
					"aria-pressed": i,
					"aria-controls": "lab-instructions",
					title: i ? "نمایش پنل مأموریت" : "فضای بیشتر برای کدنویسی",
					onClick: o,
					children: [/* @__PURE__ */ (0, u.jsx)(f, {}), /* @__PURE__ */ (0, u.jsx)("span", {
						"data-focus-label": "",
						children: i ? "نمایش مأموریت" : "تمرکز"
					})]
				})
			]
		})]
	});
}
function m({ actions: e, controls: t, hidden: n }) {
	let r = (0, c.useSyncExternalStore)(t.subscribe, t.get);
	return /* @__PURE__ */ (0, u.jsxs)("div", {
		className: "lab-code-wrap",
		id: "lab-editor-region",
		dir: "ltr",
		lang: "en",
		hidden: n,
		children: [/* @__PURE__ */ (0, u.jsx)("pre", {
			className: "lab-lines",
			dir: "ltr",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, u.jsxs)("div", {
			className: "lab-code",
			children: [/* @__PURE__ */ (0, u.jsx)("pre", {
				"data-highlight": "",
				dir: "ltr",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, u.jsx)("textarea", {
				id: "lab-code",
				"aria-label": "کد Python",
				dir: "ltr",
				lang: "en",
				wrap: "off",
				spellCheck: !1,
				autoCapitalize: "off",
				autoComplete: "off",
				maxLength: 2e4,
				readOnly: r.busy,
				onInput: e.input,
				onScroll: e.scroll,
				onKeyDown: (t) => {
					t.isDefaultPrevented() || e.keydown(t.nativeEvent);
				}
			})]
		})]
	});
}
function h({ output: e }) {
	let t = (0, c.useSyncExternalStore)(e.subscribe, e.get), n = (0, c.useRef)(null), r = (0, c.useRef)(!0);
	return (0, c.useLayoutEffect)(() => {
		let e = n.current;
		e && (t || (r.current = !0), r.current && (e.scrollTop = e.scrollHeight));
	}, [t]), /* @__PURE__ */ (0, u.jsx)("pre", {
		ref: n,
		className: "lab-output",
		"data-output": "",
		dir: "ltr",
		tabIndex: 0,
		"aria-label": "خروجی Python",
		onScroll: (e) => {
			let t = e.currentTarget;
			r.current = t.scrollHeight - t.clientHeight - t.scrollTop < 12;
		},
		children: t
	});
}
function g({ actions: e, controls: t, output: n, allowCommand: r, mode: i, toggleConsole: a, toggleConsoleFocus: o }) {
	let s = i === "collapsed", l = i === "focus", p = s ? "نمایش خروجی" : "جمع کردن خروجی", m = l ? "بازگرداندن اندازهٔ خروجی" : "بزرگ‌کردن خروجی", g = (0, c.useSyncExternalStore)(t.subscribe, t.get), [_, v] = (0, c.useState)(!1), y = (0, c.useRef)(null), b = (0, c.useRef)(null), x = (0, c.useRef)(!1);
	(0, c.useLayoutEffect)(() => {
		_ && x.current && (g.canConsole && b.current?.focus({ preventScroll: !0 }), x.current = !1);
	}, [_, g.canConsole]);
	function S() {
		v(!1), y.current?.focus({ preventScroll: !0 });
	}
	return /* @__PURE__ */ (0, u.jsxs)("section", {
		className: "lab-console",
		"aria-label": "کنسول Python",
		dir: "rtl",
		children: [/* @__PURE__ */ (0, u.jsxs)("div", {
			className: "lab-console-head",
			dir: "rtl",
			children: [/* @__PURE__ */ (0, u.jsx)("span", {
				className: "lab-console-title",
				lang: "fa",
				children: "خروجی"
			}), /* @__PURE__ */ (0, u.jsxs)("div", {
				className: "lab-console-actions",
				children: [
					/* @__PURE__ */ (0, u.jsx)("button", {
						ref: y,
						"data-repl-toggle": "",
						className: "lab-repl-toggle",
						type: "button",
						"aria-label": "دستور تک‌خطی Python",
						title: "دستور تک‌خطی Python",
						"aria-expanded": _,
						"aria-controls": "lab-repl-form",
						hidden: !r,
						onClick: () => {
							_ || (x.current = !0), v(!_);
						},
						children: /* @__PURE__ */ (0, u.jsx)("svg", {
							viewBox: "0 0 20 20",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, u.jsx)("path", { d: "m4 6 4 4-4 4m6 0h6" })
						})
					}),
					/* @__PURE__ */ (0, u.jsxs)("details", {
						className: "lab-console-tools",
						children: [/* @__PURE__ */ (0, u.jsx)("summary", {
							"aria-label": "ابزارهای خروجی",
							title: "ابزارهای خروجی",
							children: /* @__PURE__ */ (0, u.jsx)(d, { vertical: !0 })
						}), /* @__PURE__ */ (0, u.jsx)("div", {
							className: "lab-console-menu",
							children: /* @__PURE__ */ (0, u.jsx)("button", {
								"data-clear": "",
								type: "button",
								onClick: e.clear,
								children: "پاک‌کردن خروجی"
							})
						})]
					}),
					/* @__PURE__ */ (0, u.jsx)("button", {
						"data-console-toggle": "",
						className: "lab-console-toggle",
						type: "button",
						"aria-expanded": !s,
						"aria-controls": "lab-console-body",
						"aria-label": p,
						title: p,
						onClick: a,
						children: /* @__PURE__ */ (0, u.jsx)("svg", {
							viewBox: "0 0 20 20",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, u.jsx)("path", { d: "m5 12 5-5 5 5" })
						})
					}),
					/* @__PURE__ */ (0, u.jsx)("button", {
						"data-output-focus": "",
						className: "lab-output-focus",
						type: "button",
						"aria-pressed": l,
						"aria-label": m,
						title: m,
						onClick: o,
						children: /* @__PURE__ */ (0, u.jsx)(f, {})
					})
				]
			})]
		}), /* @__PURE__ */ (0, u.jsxs)("div", {
			className: "lab-console-body",
			"data-console-body": "",
			id: "lab-console-body",
			hidden: s,
			children: [/* @__PURE__ */ (0, u.jsx)(h, { output: n }), /* @__PURE__ */ (0, u.jsxs)("form", {
				className: "lab-console-form",
				id: "lab-repl-form",
				dir: "ltr",
				hidden: !_,
				onSubmit: (t) => {
					t.preventDefault(), e.command();
				},
				onKeyDown: (e) => {
					e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), S());
				},
				children: [
					/* @__PURE__ */ (0, u.jsx)("label", {
						htmlFor: "lab-command",
						"aria-hidden": "true",
						children: ">>>"
					}),
					/* @__PURE__ */ (0, u.jsx)("input", {
						ref: b,
						id: "lab-command",
						"aria-label": "دستور تک‌خطی Python",
						placeholder: "X.shape",
						dir: "ltr",
						lang: "en",
						autoComplete: "off",
						spellCheck: !1,
						maxLength: 2e3,
						disabled: !g.canConsole
					}),
					/* @__PURE__ */ (0, u.jsx)("button", {
						type: "submit",
						dir: "rtl",
						disabled: !g.canConsole,
						children: "اجرا"
					})
				]
			})]
		})]
	});
}
function _({ controls: e }) {
	let t = (0, c.useSyncExternalStore)(e.subscribe, e.get);
	return /* @__PURE__ */ (0, u.jsx)("p", {
		className: "lab-runtime",
		"data-runtime": "",
		role: "status",
		"aria-live": "polite",
		hidden: !t.message || !t.busy && !t.error,
		children: t.message
	});
}
function v({ options: e, actions: t, channels: n, layout: r }) {
	let i = (0, c.useSyncExternalStore)(r.layout.subscribe, r.layout.get), a = o({
		axis: "row",
		share: i.editorShare,
		disabled: i.consoleMode !== "normal",
		change: (e, t) => (0, l.flushSync)(() => r.layout.changeShare("row", e, t)),
		save: () => r.layout.save("row")
	}), s = {
		"--editor-share": a.ratio + "fr",
		"--console-share": 100 - a.ratio + "fr"
	};
	return /* @__PURE__ */ (0, u.jsxs)(u.Fragment, { children: [
		/* @__PURE__ */ (0, u.jsx)(p, {
			options: e,
			actions: t,
			controls: n.controls,
			save: n.save,
			sidebarHidden: i.sidebarHidden,
			toggleSidebar: r.toggleSidebar
		}),
		/* @__PURE__ */ (0, u.jsxs)("div", {
			ref: a.container,
			"data-split": "",
			style: s,
			className: "lab-split-area" + (i.consoleMode === "collapsed" ? " is-console-collapsed" : i.consoleMode === "focus" ? " is-console-focused" : "") + (a.dragging ? " is-resizing" : ""),
			children: [
				/* @__PURE__ */ (0, u.jsx)(m, {
					actions: t,
					controls: n.controls,
					hidden: i.consoleMode === "focus"
				}),
				/* @__PURE__ */ (0, u.jsx)("div", {
					className: "lab-resizer",
					"data-resizer": "",
					role: "separator",
					"aria-label": "تغییر اندازهٔ ویرایشگر و خروجی",
					"aria-orientation": "horizontal",
					"aria-controls": "lab-editor-region lab-console-body",
					title: "برای تغییر اندازه بکش؛ یا از کلیدهای بالا و پایین استفاده کن",
					...a.handle,
					children: /* @__PURE__ */ (0, u.jsx)("span", { "aria-hidden": "true" })
				}),
				/* @__PURE__ */ (0, u.jsx)(g, {
					actions: t,
					controls: n.controls,
					output: n.output,
					allowCommand: e.mode !== "readonly-preview",
					mode: i.consoleMode,
					toggleConsole: r.toggleConsole,
					toggleConsoleFocus: r.toggleConsoleFocus
				})
			]
		}),
		/* @__PURE__ */ (0, u.jsx)(_, { controls: n.controls }),
		/* @__PURE__ */ (0, u.jsx)("div", {
			"data-react-lab-award": "",
			style: { display: "contents" }
		})
	] });
}
// frontend/lab/workspace/mount.tsx
function y(e) {
	let t = /* @__PURE__ */ new Set();
	return {
		get: () => e,
		subscribe(e) {
			return t.add(e), () => {
				t.delete(e);
			};
		},
		set(n) {
			Object.is(e, n) || (e = n, t.forEach((e) => e()));
		}
	};
}
function b(e, t, n, r) {
	let i = y({
		busy: !1,
		running: !1,
		hasWorker: !1,
		canConsole: !1,
		canImport: !1,
		canLoad: !0,
		message: "",
		error: !1
	}), a = y(""), o = y({
		message: "",
		attention: !1
	}), c = {
		controls: i,
		output: a,
		save: o
	}, d = (0, s.createRoot)(e, { identifierPrefix: "lab-workspace-" });
	return (0, l.flushSync)(() => d.render(/* @__PURE__ */ (0, u.jsx)(v, {
		options: t,
		actions: n,
		channels: c,
		layout: r
	}))), {
		setControls(e) {
			let t = i.get();
			Object.keys(e).some((n) => e[n] !== t[n]) && i.set(e);
		},
		setSave(e, t) {
			let n = o.get();
			(n.message !== e || n.attention !== t) && o.set({
				message: e,
				attention: t
			});
		},
		getOutput: a.get,
		clearOutput() {
			a.set("");
		},
		appendOutput(e) {
			let t = a.get();
			t.length < 16e3 && a.set(t + String(e ?? "").slice(0, 16e3 - t.length));
		},
		dispose() {
			d.unmount();
		}
	};
}
export { b as mountLabWorkspace };
