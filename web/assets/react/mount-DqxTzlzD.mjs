import { a as e, i as t, n, r, t as i } from "./jsx-runtime-CMv_BHj2.mjs";
import { r as a } from "./runtime-D2U6pln4.mjs";
import { i as o, n as s, r as c, t as l } from "./useSplitter-DltN7h7Z.mjs";
// frontend/lab/frame/LabFrame.tsx
var u = r(), d = n(), f = /* @__PURE__ */ e(t(), 1), p = i();
function m({ options: e, storyOpen: t }) {
	let { title: n, links: r } = e;
	return /* @__PURE__ */ (0, p.jsxs)("header", {
		className: "lab-top mission-top lab-mission-header",
		dir: "rtl",
		children: [/* @__PURE__ */ (0, p.jsxs)("div", {
			className: "lab-mission-heading",
			children: [/* @__PURE__ */ (0, p.jsxs)("div", {
				className: "lab-heading-copy",
				children: [/* @__PURE__ */ (0, p.jsx)("h1", { children: n }), /* @__PURE__ */ (0, p.jsx)("button", {
					className: "lab-story-review",
					"data-story-review": "",
					type: "button",
					hidden: t,
					children: "مرور داستان"
				})]
			}), /* @__PURE__ */ (0, p.jsxs)("nav", {
				className: "mission-navigation",
				"aria-label": "مراحل مأموریت",
				children: [/* @__PURE__ */ (0, p.jsx)("span", {
					className: "mission-navigation-label",
					children: "مسیر مأموریت"
				}), /* @__PURE__ */ (0, p.jsx)("ol", {
					"data-react-mission-path": "",
					className: "mission-path",
					"aria-label": "مراحل مأموریت"
				})]
			})]
		}), /* @__PURE__ */ (0, p.jsxs)("div", {
			className: "lab-header-utilities",
			children: [
				/* @__PURE__ */ (0, p.jsx)("div", {
					"data-react-lab-xp": "",
					style: { display: "contents" }
				}),
				/* @__PURE__ */ (0, p.jsxs)("div", {
					className: "lab-identity",
					children: [/* @__PURE__ */ (0, p.jsxs)("a", {
						className: "lab-wordmark",
						href: r.home,
						children: [/* @__PURE__ */ (0, p.jsx)("strong", { children: "دفتر کلاس" }), /* @__PURE__ */ (0, p.jsx)("small", {
							lang: "en",
							dir: "ltr",
							children: "CLASS NOTES"
						})]
					}), /* @__PURE__ */ (0, p.jsx)("div", { "data-lab-account": "" })]
				}),
				/* @__PURE__ */ (0, p.jsxs)("nav", {
					className: "lab-site-links",
					"aria-label": "پیمایش لابراتور",
					children: [
						/* @__PURE__ */ (0, p.jsx)("a", {
							href: r.lesson,
							children: "یادگیری"
						}),
						/* @__PURE__ */ (0, p.jsx)("a", {
							href: r.quiz,
							children: "تمرین‌ها"
						}),
						/* @__PURE__ */ (0, p.jsx)("a", {
							href: r.course,
							children: "مسیرها"
						}),
						/* @__PURE__ */ (0, p.jsx)("span", {
							"data-lab-presence-slot": "",
							style: { display: "contents" }
						})
					]
				})
			]
		})]
	});
}
var h = new Intl.NumberFormat("fa-IR");
function g({ options: e, status: t, actions: n }) {
	return /* @__PURE__ */ (0, p.jsxs)(p.Fragment, { children: [
		/* @__PURE__ */ (0, p.jsx)("div", { "data-react-mission-brief": "" }),
		/* @__PURE__ */ (0, p.jsxs)("div", {
			className: "mission-task-actions",
			children: [/* @__PURE__ */ (0, p.jsxs)("button", {
				type: "button",
				className: "lab-hint-button",
				"data-show-hints": "",
				onClick: n.showHints,
				children: [/* @__PURE__ */ (0, p.jsx)(a, { name: "hint" }), "راهنمایی"]
			}), e.assistant && /* @__PURE__ */ (0, p.jsx)("button", {
				type: "button",
				className: "lab-help-button",
				"data-tutor-open": "",
				onClick: () => n.selectTab("assistant", !0),
				children: "کمک آموزشی"
			})]
		}),
		/* @__PURE__ */ (0, p.jsxs)("div", {
			"data-reflection": "",
			hidden: !t.reflection,
			children: [/* @__PURE__ */ (0, p.jsx)("label", {
				htmlFor: "lab-explanation",
				children: "پیش‌بینی و نتیجهٔ آزمایش تو"
			}), /* @__PURE__ */ (0, p.jsx)("textarea", {
				id: "lab-explanation",
				maxLength: 3e3,
				rows: 3,
				disabled: t.busy,
				onInput: (e) => n.editReflection(e.currentTarget.value),
				placeholder: "پیش از اجرا چه حدسی داشتی؟ پس از اجرا چه چیزی فهمیدی؟"
			})]
		}),
		/* @__PURE__ */ (0, p.jsx)("div", {
			className: "lab-feedback",
			"data-feedback": "",
			role: "status",
			"aria-live": "polite",
			hidden: !t.message,
			"data-error": t.error,
			children: t.message
		}),
		/* @__PURE__ */ (0, p.jsx)("button", {
			type: "button",
			className: "button-forest lab-next",
			"data-next": "",
			hidden: !t.nextVisible,
			disabled: t.nextDisabled,
			onClick: n.next,
			children: "مرحلهٔ بعد ←"
		}),
		/* @__PURE__ */ (0, p.jsxs)("div", {
			className: "lab-finish",
			"data-finish": "",
			hidden: !t.finished,
			children: [
				/* @__PURE__ */ (0, p.jsx)("span", {
					className: "mission-seal",
					"aria-hidden": "true",
					children: "✓"
				}),
				/* @__PURE__ */ (0, p.jsx)("h3", {
					tabIndex: -1,
					children: e.finish
				}),
				/* @__PURE__ */ (0, p.jsxs)("p", { children: [
					"هر ",
					e.stageCount === 6 ? "شش" : h.format(e.stageCount),
					" مرحله را انجام دادی."
				] }),
				/* @__PURE__ */ (0, p.jsx)("a", {
					href: e.links.dashboard,
					children: "دیدن مسیر رشد در داشبورد ←"
				})
			]
		})
	] });
}
function _({ visible: e, active: t, select: n }) {
	function r(t, r) {
		if (t.altKey || t.ctrlKey || t.metaKey || t.nativeEvent.isComposing) return;
		let i = t.currentTarget.parentElement, a = !!i && i.ownerDocument.defaultView?.getComputedStyle(i).direction === "rtl", o = c(r, t.key, e.map((e) => e.id), a);
		o && (t.preventDefault(), n(o, !0));
	}
	return /* @__PURE__ */ (0, p.jsx)("div", {
		className: "lab-tabs",
		role: "tablist",
		dir: "ltr",
		"aria-label": "راهنمای لابراتور",
		"aria-orientation": "horizontal",
		children: e.map(({ id: e, label: i }) => /* @__PURE__ */ (0, p.jsx)("button", {
			id: "lab-tab-" + e,
			"data-lab-tab": e,
			role: "tab",
			type: "button",
			"aria-controls": "lab-panel-" + e,
			"aria-selected": t === e,
			tabIndex: t === e ? 0 : -1,
			onClick: () => n(e, !1),
			onKeyDown: (t) => r(t, e),
			children: i
		}, e))
	});
}
function v({ options: e, layout: t, channel: n, actions: r }) {
	let i = (0, f.useSyncExternalStore)(t.subscribe, t.get), a = (0, f.useSyncExternalStore)(n.subscribe, n.get), s = l({
		axis: "column",
		share: i.panelShare,
		disabled: i.sidebarHidden || a.storyOpen,
		change: r.changePanel,
		save: () => t.save("column")
	}), c = o.filter((t) => e.assistant || t.id !== "assistant"), u = {
		mission: /* @__PURE__ */ (0, p.jsx)(g, {
			options: e,
			status: a,
			actions: r
		}),
		data: /* @__PURE__ */ (0, p.jsx)("div", {
			"data-react-lab-dataset": "",
			style: { display: "contents" }
		}),
		guide: /* @__PURE__ */ (0, p.jsxs)(p.Fragment, { children: [
			/* @__PURE__ */ (0, p.jsx)("p", {
				className: "lab-panel-kicker",
				children: "وقتی به کمک نیاز داری"
			}),
			/* @__PURE__ */ (0, p.jsx)("h2", { children: "قدم بعدی را پیدا کن" }),
			/* @__PURE__ */ (0, p.jsx)("div", { "data-react-mission-hints": "" }),
			/* @__PURE__ */ (0, p.jsx)("div", {
				"data-react-lab-guide": "",
				style: { display: "contents" }
			})
		] }),
		assistant: /* @__PURE__ */ (0, p.jsx)("div", {
			"data-lab-tutor-host": "",
			style: { display: "contents" }
		})
	}, d = {
		"--lab-panel-share": s.ratio + "fr",
		"--lab-code-share": 100 - s.ratio + "fr"
	};
	return /* @__PURE__ */ (0, p.jsxs)(p.Fragment, { children: [
		/* @__PURE__ */ (0, p.jsx)(m, {
			options: e,
			storyOpen: a.storyOpen
		}),
		/* @__PURE__ */ (0, p.jsx)("div", {
			"data-lab-intro-slot": "",
			style: { display: "contents" }
		}),
		/* @__PURE__ */ (0, p.jsxs)("div", {
			ref: s.container,
			"data-react-lab-frame": "",
			onKeyDown: r.escape,
			className: "lab-workspace" + (i.sidebarHidden ? " is-focused" : "") + (s.dragging ? " is-panel-resizing" : ""),
			hidden: a.storyOpen,
			inert: a.storyOpen,
			style: d,
			children: [
				/* @__PURE__ */ (0, p.jsxs)("aside", {
					id: "lab-instructions",
					className: "lab-instructions" + (i.tab === "assistant" ? " is-tutor-active" : ""),
					"aria-label": "پنل مأموریت",
					hidden: i.sidebarHidden,
					children: [/* @__PURE__ */ (0, p.jsx)(_, {
						visible: c,
						active: i.tab,
						select: r.selectTab
					}), /* @__PURE__ */ (0, p.jsx)("div", {
						className: "lab-instruction-scroll",
						children: c.map(({ id: e, className: t }) => /* @__PURE__ */ (0, p.jsx)("section", {
							className: t || void 0,
							id: "lab-panel-" + e,
							role: "tabpanel",
							"aria-labelledby": "lab-tab-" + e,
							tabIndex: i.tab === e ? 0 : -1,
							hidden: i.tab !== e,
							children: u[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, p.jsx)("div", {
					className: "lab-panel-resizer",
					"data-panel-resizer": "",
					role: "separator",
					"aria-label": "تغییر عرض پنل راهنما و دستیار",
					"aria-orientation": "vertical",
					"aria-controls": "lab-instructions lab-editor-panel",
					...s.handle
				}),
				/* @__PURE__ */ (0, p.jsx)("section", {
					className: "lab-editor-panel",
					id: "lab-editor-panel",
					"data-react-lab-workspace": "",
					"aria-label": "ویرایشگر و خروجی"
				})
			]
		}),
		/* @__PURE__ */ (0, p.jsx)("div", {
			"data-lab-feedback-slot": "",
			style: { display: "contents" }
		}),
		/* @__PURE__ */ (0, p.jsx)("div", {
			"data-lab-reward-slot": "",
			style: { display: "contents" }
		})
	] });
}
// frontend/lab/frame/mount.tsx
function y(e, t, n) {
	let r = null;
	try {
		r = e.ownerDocument.defaultView?.localStorage || null;
	} catch {}
	let i = s(r), a = {
		storyOpen: !1,
		reflection: !1,
		busy: !1,
		finished: !1,
		nextVisible: !1,
		nextDisabled: !0,
		message: "",
		error: !1
	}, c = !1, l = /* @__PURE__ */ new Set(), f = {
		get: () => a,
		subscribe(e) {
			return l.add(e), () => {
				l.delete(e);
			};
		}
	};
	function m(e) {
		!c && Object.entries(e).some(([e, t]) => a[e] !== t) && (0, u.flushSync)(() => {
			a = {
				...a,
				...e
			}, l.forEach((e) => e());
		});
	}
	let h = () => a.storyOpen || i.get().sidebarHidden ? null : i.get().tab;
	function g(e, t = !1) {
		let r = h();
		(t || e !== r) && n.onTabChange(r);
	}
	function _(e, t = !1) {
		if (c) return;
		let n = h();
		(0, u.flushSync)(() => i.set(e)), t && g(n);
	}
	function y(n, r = !1) {
		if (c || !o.some((e) => e.id === n) || n === "assistant" && !t.assistant) return;
		let i = h();
		_({ tab: n }), r && h() === n && e.querySelector("#lab-tab-" + n)?.focus({ preventScroll: !0 }), g(i, !0);
	}
	let b = {
		layout: i,
		toggleSidebar() {
			_({ sidebarHidden: !i.get().sidebarHidden }, !0);
		},
		toggleConsole() {
			_({ consoleMode: i.get().consoleMode === "collapsed" ? "normal" : "collapsed" }), i.save("row");
		},
		toggleConsoleFocus() {
			_({ consoleMode: i.get().consoleMode === "focus" ? "normal" : "focus" });
		}
	};
	function x(t) {
		t.key !== "Escape" || t.nativeEvent.isComposing || t.nativeEvent.defaultPrevented || e.querySelector("dialog[open]") || t.target.closest?.("details[open]") || (i.get().consoleMode === "focus" ? _({ consoleMode: "normal" }) : i.get().sidebarHidden && _({ sidebarHidden: !1 }, !0));
	}
	let S = (0, d.createRoot)(e, { identifierPrefix: "lab-frame-" });
	return (0, u.flushSync)(() => S.render(/* @__PURE__ */ (0, p.jsx)(v, {
		options: t,
		layout: i,
		channel: f,
		actions: {
			...n,
			selectTab: y,
			escape: x,
			changePanel: (e, t) => (0, u.flushSync)(() => i.changeShare("column", e, t))
		}
	}))), {
		layoutControls: b,
		activeTab: h,
		selectTab: y,
		setStatus: m,
		openConsole() {
			_({ consoleMode: "normal" }), i.save("row");
		},
		showMission() {
			_({
				tab: "mission",
				sidebarHidden: !1,
				consoleMode: i.get().consoleMode === "focus" ? "normal" : i.get().consoleMode
			}, !0);
		},
		setStoryVisible(e) {
			let t = h();
			m({ storyOpen: e }), g(t);
		},
		dispose() {
			c || (c = !0, S.unmount(), l.clear());
		}
	};
}
export { y as mountLabFrame };
