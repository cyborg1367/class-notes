import { a as e, i as t, n, t as r } from "./react/jsx-runtime-CMv_BHj2.mjs";
import { n as i, r as a, t as o } from "./react/paper-icons-DhTBlJcb.mjs";
// web/assets/dashboard-model.mjs
var s = /* @__PURE__ */ e(t(), 1), c = n();
function l(e, t) {
	if (!e.lab) return null;
	let n = t?.status === "fulfilled" ? t.value : null;
	if (!n || n.mission !== e.lab.mission || !Array.isArray(n.tasks) || !n.tasks.length || !Number.isFinite(n.xp) || !Number.isFinite(n.maximum) || n.maximum <= 0) return { status: "unavailable" };
	let r = [...n.tasks].sort((e, t) => e.position - t.position), i = new Set(r.map((e) => e.id)), a = new Set((Array.isArray(n.completed) ? n.completed : []).filter((e) => i.has(e))), o = r.find((e) => !a.has(e.id));
	return {
		status: "ready",
		xp: Math.max(0, Math.min(n.maximum, n.xp)),
		maximum: n.maximum,
		tasks: r,
		completed: a,
		done: a.size,
		count: r.length,
		finished: n.badge === !0 && a.size === r.length,
		nextTitle: (e.lab_steps || []).find((e) => e.id === o?.id)?.title || "مأموریت بعدی",
		attempts: Number(n.attempts) || 0
	};
}
function u({ courses: e, results: t = [], study: n = {}, states: r = {} }) {
	let i = e.flatMap((e) => e.lessons.map((i) => {
		let a = n[e.id] || {}, o = Array.isArray(a.opened) && a.opened.includes(i.id), s = a.last === i.id, c = t.filter((e) => e.lesson_id === i.id && Number(e.version) === Number(i.quiz_version) && Number(e.attempts) > 0).sort((e, t) => (Date.parse(t.last_at) || 0) - (Date.parse(e.last_at) || 0))[0] || null;
		return {
			...i,
			course: e,
			opened: o,
			last: s,
			quiz: c,
			progress: l(i, r[i.id])
		};
	})), a = i.filter((e) => e.lab), o = a.filter((e) => e.progress.status === "ready"), s = o.filter((e) => !e.progress.finished), c = s.filter((e) => e.progress.done > 0 || e.progress.attempts > 0), u = c.find((e) => e.last) || c[0] || null, d = u ? "lab" : null, f = a.some((e) => e.progress.status !== "ready");
	if (!u && f && (d = "unavailable", u = a.find((e) => e.progress.status !== "ready")), u || (u = s.find((e) => e.last && e.opened) || s.find((e) => e.opened) || null, u && (d = "lab")), !u && a.length && o.length === a.length && o.every((e) => e.progress.finished)) {
		let e = i.find((e) => !e.lab && !e.opened);
		e && (u = e, d = "study");
	}
	!u && a.length && o.length === a.length && o.every((e) => e.progress.finished) && (u = a.at(-1), d = "complete"), u || (u = i.find((e) => !e.opened && (!e.progress || !e.progress.finished)) || null, u && (d = "study")), !u && s.length && (u = s[0], d = "lab"), !u && a.length && o.every((e) => e.progress.finished) && (u = a.at(-1), d = "complete"), !u && i.length && (u = i.find((e) => e.last) || i[0], d = "study");
	let p = [...new Set(o.flatMap((e) => (e.practice_skills || []).filter((t) => e.progress.completed.has(t.task)).map((e) => e.label)))], m = a.length > 0 && !f;
	return {
		courses: e,
		lessons: i,
		labs: a,
		target: u,
		mode: d,
		skills: p,
		known: m,
		hasLabs: a.length > 0,
		xp: m ? o.reduce((e, t) => e + t.progress.xp, 0) : null,
		maximum: m ? o.reduce((e, t) => e + t.progress.maximum, 0) : null
	};
}
// frontend/dashboard/DashboardGlyph.tsx
var d = r(), f = {
	icon: i,
	mark: a,
	badge: o
};
function p({ name: e, kind: t = "icon", className: n = "" }) {
	return /* @__PURE__ */ (0, d.jsx)("span", {
		className: "dash-glyph",
		"aria-hidden": "true",
		dangerouslySetInnerHTML: { __html: f[t](e, n) }
	});
}
// frontend/dashboard/DashboardAccess.tsx
var m = {
	pending: "درخواستت ثبت شده است؛ پس از تأیید مدرس، دسترسی فعال می‌شود.",
	suspended: "دسترسی این کلاس فعلاً غیرفعال است. برای پیگیری با مدرس در ارتباط باش.",
	unavailable: "وضعیت عضویتت دریافت نشد؛ دوباره تلاش کن.",
	unregistered: "برای این کلاس درخواست عضویت بده؛ دسترسی پس از تأیید مدرس فعال می‌شود."
};
function h({ item: e, actions: t }) {
	let n = (0, s.useRef)(!1), [r, i] = (0, s.useState)(!1), [a, o] = (0, s.useState)("");
	async function c(e) {
		if (!n.current) {
			n.current = !0, i(!0), o("");
			try {
				await e();
			} catch {
				o("عملیات کامل نشد. اتصال را بررسی کن و دوباره تلاش کن.");
			} finally {
				n.current = !1, i(!1);
			}
		}
	}
	return /* @__PURE__ */ (0, d.jsxs)("article", { children: [/* @__PURE__ */ (0, d.jsx)("h3", {
		dir: "auto",
		children: e.title
	}), /* @__PURE__ */ (0, d.jsxs)("div", {
		className: "gate-card",
		children: [
			/* @__PURE__ */ (0, d.jsx)("h4", { children: "عضویت در کلاس" }),
			/* @__PURE__ */ (0, d.jsx)("p", { children: m[e.status] }),
			/* @__PURE__ */ (0, d.jsxs)("div", {
				className: "portal-actions",
				children: [e.status === "unregistered" && /* @__PURE__ */ (0, d.jsx)("button", {
					type: "button",
					className: "button-forest",
					disabled: r,
					onClick: () => void c(() => t.requestAccess(e.id)),
					children: "درخواست دسترسی به کلاس"
				}), /* @__PURE__ */ (0, d.jsx)("button", {
					type: "button",
					className: "button-outline",
					disabled: r,
					onClick: () => void c(t.refreshMembership),
					children: "به‌روزرسانی وضعیت عضویت"
				})]
			}),
			/* @__PURE__ */ (0, d.jsx)("p", {
				className: "status-line",
				"data-error": !!a,
				role: "status",
				children: a || (r ? "در حال به‌روزرسانی…" : "")
			})
		]
	})] });
}
function g({ items: e, actions: t }) {
	return e.length ? /* @__PURE__ */ (0, d.jsxs)("section", {
		className: "membership-section",
		"aria-labelledby": "dash-membership-title",
		children: [/* @__PURE__ */ (0, d.jsx)("div", {
			className: "section-heading",
			children: /* @__PURE__ */ (0, d.jsx)("h2", {
				id: "dash-membership-title",
				children: "عضویت و درخواست دسترسی"
			})
		}), e.map((e) => /* @__PURE__ */ (0, d.jsx)(h, {
			item: e,
			actions: t
		}, e.id))]
	}) : null;
}
function _({ login: e }) {
	return /* @__PURE__ */ (0, d.jsxs)("div", {
		className: "gate-card",
		children: [
			/* @__PURE__ */ (0, d.jsx)("h1", { children: "برای ادامه وارد شو." }),
			/* @__PURE__ */ (0, d.jsx)("p", { children: "متن یادداشت‌ها و آزمون‌ها فقط برای اعضای تأییدشدهٔ کلاس در دسترس است." }),
			/* @__PURE__ */ (0, d.jsx)("div", {
				className: "portal-actions",
				children: /* @__PURE__ */ (0, d.jsx)("a", {
					className: "button-forest",
					"data-login-link": "",
					href: e,
					children: "ورود با Google ←"
				})
			})
		]
	});
}
function v({ run: e, className: t, arrow: n = !1 }) {
	let [r, i] = (0, s.useState)(!1);
	return /* @__PURE__ */ (0, d.jsxs)("button", {
		className: t,
		type: "button",
		"data-dashboard-retry": "",
		disabled: r,
		onClick: async () => {
			i(!0);
			try {
				await e();
			} finally {
				i(!1);
			}
		},
		children: [r ? "در حال دریافت…" : "تلاش دوباره", n && /* @__PURE__ */ (0, d.jsx)("span", {
			"aria-hidden": "true",
			children: " ←"
		})]
	});
}
function y({ kind: e, retry: t }) {
	return /* @__PURE__ */ (0, d.jsxs)("section", {
		className: "gate-card",
		children: [
			/* @__PURE__ */ (0, d.jsx)("h1", { children: e === "membership" ? "اطلاعات کلاس دریافت نشد." : "داشبورد دریافت نشد." }),
			/* @__PURE__ */ (0, d.jsx)("p", { children: e === "membership" ? "ورود انجام شده، اما اطلاعات کلاس دریافت نشد." : "برای دریافت مسیر یادگیری دوباره تلاش کن." }),
			/* @__PURE__ */ (0, d.jsx)(v, {
				className: "button-outline",
				run: t
			})
		]
	});
}
// frontend/dashboard/format.ts
var b = (e) => e.toLocaleString("fa-IR"), x = (e) => e.toLocaleString("en-US", { useGrouping: !1 }), S = (e) => e && Number.isFinite(Date.parse(e)) ? new Date(e).toLocaleString("fa-IR", {
	dateStyle: "medium",
	timeStyle: "short"
}) : "";
function C(e, t) {
	return "quiz/" + e + "/" + (t ? "?attempt=" + encodeURIComponent(t) : "");
}
// frontend/dashboard/DashboardOverview.tsx
function w({ name: e, model: t, retry: n }) {
	let { xp: r, maximum: i } = t, a = r !== null && i !== null;
	return /* @__PURE__ */ (0, d.jsxs)("header", {
		className: "dash-greeting",
		children: [/* @__PURE__ */ (0, d.jsxs)("div", { children: [/* @__PURE__ */ (0, d.jsxs)("h1", { children: ["سلام، ", e] }), /* @__PURE__ */ (0, d.jsx)("p", { children: "قدم بعدی یادگیری‌ات اینجاست." })] }), t.hasLabs && /* @__PURE__ */ (0, d.jsxs)("div", {
			className: "dash-xp",
			"aria-label": "تجربهٔ ثبت‌شدهٔ لابراتورها",
			children: [
				/* @__PURE__ */ (0, d.jsx)("p", {
					className: "dash-xp-caption",
					children: "تجربهٔ ثبت‌شدهٔ لابراتورها"
				}),
				/* @__PURE__ */ (0, d.jsx)("strong", {
					dir: "ltr",
					children: a ? /* @__PURE__ */ (0, d.jsxs)(d.Fragment, { children: [
						x(r),
						" ",
						/* @__PURE__ */ (0, d.jsxs)("span", { children: [
							"/ ",
							x(i),
							" XP"
						] })
					] }) : "— / — XP"
				}),
				a ? /* @__PURE__ */ (0, d.jsx)("progress", {
					value: r,
					max: i,
					"aria-label": "پیشرفت XP"
				}) : /* @__PURE__ */ (0, d.jsxs)("p", { children: ["پیشرفت کامل دریافت نشد.", t.mode !== "unavailable" && /* @__PURE__ */ (0, d.jsxs)(d.Fragment, { children: [" ", /* @__PURE__ */ (0, d.jsx)(v, {
					className: "dash-retry-link",
					run: n
				})] })] })
			]
		})]
	});
}
function T({ model: e, link: t, retry: n }) {
	let { target: r, mode: i } = e, a = i === "lab" && r?.progress?.status === "ready" ? r.progress : null, o = i === "lab" || i === "complete" ? r?.lab : null, s = i === "unavailable", c = s ? "پیشرفت لابراتور دریافت نشد" : o?.title ?? r?.title ?? "مسیر یادگیری‌ات را شروع کن", l = "برای دسترسی به یادداشت‌ها، درخواست عضویت کلاس بده.", u = "دیدن کلاس‌ها";
	return a ? (l = `${b(a.done)} مأموریت از ${b(a.count)} مأموریت انجام شده`, u = a.done ? "ادامهٔ لابراتور" : "شروع لابراتور") : i === "complete" ? (l = "همهٔ مأموریت‌های لابراتورها را انجام داده‌ای.", u = "مرور لابراتور") : s ? l = "کد و پیشرفت ثبت‌شده‌ات حفظ شده‌اند؛ برای دریافت وضعیت دوباره تلاش کن." : r && (l = "از یادداشت شروع کن و بعد، آموخته‌هایت را در تمرین به کار ببر.", u = r.opened ? "ادامهٔ مطالعه" : "شروع مطالعه"), /* @__PURE__ */ (0, d.jsxs)("section", {
		className: "dash-continuation",
		"aria-labelledby": "dash-next-title",
		children: [/* @__PURE__ */ (0, d.jsxs)("div", {
			className: "dash-next-copy",
			children: [
				/* @__PURE__ */ (0, d.jsx)(p, {
					name: i === "study" ? "book" : "lab",
					kind: i === "study" ? "icon" : "mark",
					className: "dash-section-icon"
				}),
				/* @__PURE__ */ (0, d.jsx)("p", {
					className: "dash-eyebrow",
					children: i === "complete" ? "مسیر طی‌شدهٔ تو" : "ادامهٔ مسیر یادگیری"
				}),
				/* @__PURE__ */ (0, d.jsx)("h2", {
					id: "dash-next-title",
					children: c
				}),
				/* @__PURE__ */ (0, d.jsx)("p", {
					className: "dash-next-description",
					children: l
				}),
				a && /* @__PURE__ */ (0, d.jsxs)(d.Fragment, { children: [/* @__PURE__ */ (0, d.jsxs)("p", {
					className: "dash-next-step",
					children: ["مرحلهٔ بعد: ", a.nextTitle]
				}), /* @__PURE__ */ (0, d.jsx)("ol", {
					className: "dash-milestones",
					"aria-label": "مأموریت‌های انجام‌شده",
					children: a.tasks.map((e, t) => {
						let n = a.completed.has(e.id);
						return /* @__PURE__ */ (0, d.jsx)("li", {
							"data-done": n,
							"aria-label": `مأموریت ${b(t + 1)}؛ ${n ? "انجام‌شده" : "هنوز انجام نشده"}`
						}, e.id);
					})
				})] })
			]
		}), /* @__PURE__ */ (0, d.jsxs)("div", {
			className: "dash-next-actions",
			children: [s ? /* @__PURE__ */ (0, d.jsx)(v, {
				className: "dash-primary",
				run: n,
				arrow: !0
			}) : /* @__PURE__ */ (0, d.jsxs)("a", {
				className: "dash-primary",
				href: t(o?.path ?? (r ? r.id + "/" : "index.html#classes")),
				children: [
					u,
					" ",
					/* @__PURE__ */ (0, d.jsx)("span", {
						"aria-hidden": "true",
						children: "←"
					})
				]
			}), r && !s && /* @__PURE__ */ (0, d.jsx)("a", {
				className: "dash-text-link",
				href: t((i === "study" ? r.course.id : r.id) + "/"),
				children: i === "study" ? "فهرست کلاس" : "مرور یادداشت"
			})]
		})]
	});
}
function E({ due: e, href: t }) {
	let n = e === null ? "موضوعات و یادداشت‌هایت را در یک جای مستقل مرور کن." : e > 0 ? `${b(e)} موضوع برای مرور آماده است.` : "موضوع تازه‌ای اضافه کن یا یادداشت‌های خودت را ببین.";
	return /* @__PURE__ */ (0, d.jsxs)("section", {
		className: "dash-personal-review",
		children: [/* @__PURE__ */ (0, d.jsxs)("div", { children: [/* @__PURE__ */ (0, d.jsx)("h2", { children: "دفتر مرور شخصی" }), /* @__PURE__ */ (0, d.jsx)("p", {
			"data-review-count": !0,
			role: "status",
			children: n
		})] }), /* @__PURE__ */ (0, d.jsx)("a", {
			href: t,
			children: "رفتن به دفتر مرور ←"
		})]
	});
}
// frontend/dashboard/LearningPath.tsx
function D({ progress: e }) {
	let t = e?.status === "ready" ? e.done / e.count * 100 : 0;
	return t === 100 ? /* @__PURE__ */ (0, d.jsx)("span", {
		className: "dash-complete",
		"aria-hidden": "true",
		children: "✓"
	}) : /* @__PURE__ */ (0, d.jsxs)("svg", {
		className: "dash-lab-progress",
		viewBox: "0 0 32 32",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, d.jsx)("circle", {
			cx: "16",
			cy: "16",
			r: "13",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.2"
		}), /* @__PURE__ */ (0, d.jsx)("circle", {
			cx: "16",
			cy: "16",
			r: "10",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "5",
			pathLength: "100",
			strokeDasharray: `${t} 100`,
			transform: "rotate(-90 16 16)"
		})]
	});
}
function O({ lesson: e, bookmarked: t, hidden: n, link: r, toggle: i }) {
	let { id: a, quiz: o, lab: s, progress: c } = e, l = o?.last_score ?? o?.best_score, u = r(a + "/");
	return /* @__PURE__ */ (0, d.jsxs)("tr", {
		role: "row",
		"data-dashboard-lesson": a,
		"data-current": e.last,
		hidden: n,
		children: [
			/* @__PURE__ */ (0, d.jsx)("td", {
				role: "cell",
				className: "dash-chapter",
				dir: "ltr",
				children: e.number
			}),
			/* @__PURE__ */ (0, d.jsxs)("th", {
				role: "rowheader",
				scope: "row",
				className: "dash-lesson-title",
				children: [/* @__PURE__ */ (0, d.jsx)("a", {
					href: u,
					children: e.title
				}), /* @__PURE__ */ (0, d.jsx)("button", {
					className: "dash-bookmark",
					type: "button",
					"data-review-lesson": a,
					"aria-label": `نشان‌گذاری ${e.title} برای مرور`,
					"aria-pressed": t,
					title: "برای مرور در این مرورگر نشان کن",
					onClick: i,
					children: /* @__PURE__ */ (0, d.jsx)(p, {
						name: "bookmark",
						className: "dash-icon"
					})
				})]
			}),
			/* @__PURE__ */ (0, d.jsx)("td", {
				role: "cell",
				className: "dash-lesson-note",
				children: /* @__PURE__ */ (0, d.jsxs)("a", {
					className: "dash-cell-link",
					href: u,
					children: [/* @__PURE__ */ (0, d.jsx)(p, {
						name: "note",
						className: "dash-icon"
					}), /* @__PURE__ */ (0, d.jsxs)("span", { children: ["یادداشت ", b(Number(e.number))] })]
				})
			}),
			/* @__PURE__ */ (0, d.jsxs)("td", {
				role: "cell",
				className: "dash-lesson-fact",
				children: [/* @__PURE__ */ (0, d.jsx)("span", {
					className: "dash-mobile-label",
					"aria-hidden": "true",
					children: "مطالعه"
				}), /* @__PURE__ */ (0, d.jsxs)("span", {
					className: "dash-cell-link",
					children: [/* @__PURE__ */ (0, d.jsx)(p, {
						name: "book",
						className: "dash-icon"
					}), /* @__PURE__ */ (0, d.jsx)("span", { children: e.last ? "آخرین یادداشت" : e.opened ? "بازشده" : "هنوز باز نشده" })]
				})]
			}),
			/* @__PURE__ */ (0, d.jsxs)("td", {
				role: "cell",
				className: "dash-lesson-fact",
				children: [/* @__PURE__ */ (0, d.jsx)("span", {
					className: "dash-mobile-label",
					"aria-hidden": "true",
					children: "آزمون"
				}), e.quiz_version ? /* @__PURE__ */ (0, d.jsxs)("a", {
					className: "dash-cell-link",
					href: r(C(a, o?.last_id)),
					children: [o ? /* @__PURE__ */ (0, d.jsx)(p, {
						name: "note",
						className: "dash-icon"
					}) : /* @__PURE__ */ (0, d.jsx)("span", {
						className: "dash-not-started",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, d.jsx)(p, {
							name: "minus",
							className: "dash-icon"
						})
					}), /* @__PURE__ */ (0, d.jsxs)("span", { children: [o ? "نتیجهٔ ثبت‌شده" : "هنوز شرکت نکرده", l != null && Number.isFinite(Number(l)) && o?.maximum && Number(o.maximum) > 0 ? /* @__PURE__ */ (0, d.jsxs)("small", {
						dir: "ltr",
						children: [
							x(Number(l)),
							" / ",
							x(Number(o.maximum))
						]
					}) : null] })]
				}) : "—"]
			}),
			/* @__PURE__ */ (0, d.jsxs)("td", {
				role: "cell",
				className: "dash-lesson-fact",
				children: [/* @__PURE__ */ (0, d.jsx)("span", {
					className: "dash-mobile-label",
					"aria-hidden": "true",
					children: "لابراتور"
				}), s ? /* @__PURE__ */ (0, d.jsxs)("a", {
					className: "dash-cell-link dash-lab-status",
					href: r(s.path),
					children: [/* @__PURE__ */ (0, d.jsx)(D, { progress: c }), /* @__PURE__ */ (0, d.jsx)("span", { children: c?.status === "ready" ? /* @__PURE__ */ (0, d.jsxs)("span", {
						className: "dash-lab-metric",
						dir: "ltr",
						children: [
							/* @__PURE__ */ (0, d.jsxs)("bdi", { children: [
								x(c.done),
								" / ",
								x(c.count)
							] }),
							/* @__PURE__ */ (0, d.jsx)("span", {
								"aria-hidden": "true",
								children: "·"
							}),
							/* @__PURE__ */ (0, d.jsxs)("bdi", { children: [x(c.xp), " XP"] })
						]
					}) : "دریافت نشد" })]
				}) : "—"]
			})
		]
	});
}
function k({ course: e, lessons: t, single: n, onlyBookmarked: r, bookmarks: i, link: a, toggle: o }) {
	let s = "dash-course-" + e.id;
	return /* @__PURE__ */ (0, d.jsxs)("section", {
		className: "dash-course",
		"aria-labelledby": s,
		hidden: r && !t.some((e) => i.has(e.id)),
		children: [/* @__PURE__ */ (0, d.jsxs)("header", {
			className: "dash-section-heading",
			children: [/* @__PURE__ */ (0, d.jsx)("p", {
				lang: "en",
				dir: "ltr",
				children: e.display_title || e.title
			}), /* @__PURE__ */ (0, d.jsxs)("h2", {
				id: s,
				children: [/* @__PURE__ */ (0, d.jsx)(p, { name: "map" }), n ? "مسیر یادگیری من" : e.title]
			})]
		}), /* @__PURE__ */ (0, d.jsx)("div", {
			className: "dash-table-wrap",
			children: /* @__PURE__ */ (0, d.jsxs)("table", {
				className: "dash-lesson-table",
				role: "table",
				children: [
					/* @__PURE__ */ (0, d.jsx)("caption", {
						className: "sr-only",
						children: "وضعیت یادداشت‌ها، مطالعه، آزمون و لابراتور"
					}),
					/* @__PURE__ */ (0, d.jsx)("thead", {
						role: "rowgroup",
						children: /* @__PURE__ */ (0, d.jsx)("tr", {
							role: "row",
							children: [
								"#",
								"عنوان فصل",
								"یادداشت",
								"مطالعه",
								"آزمون",
								"لابراتور"
							].map((e) => /* @__PURE__ */ (0, d.jsx)("th", {
								role: "columnheader",
								scope: "col",
								children: e
							}, e))
						})
					}),
					/* @__PURE__ */ (0, d.jsx)("tbody", {
						role: "rowgroup",
						children: t.map((e) => /* @__PURE__ */ (0, d.jsx)(O, {
							lesson: e,
							bookmarked: i.has(e.id),
							hidden: r && !i.has(e.id),
							link: a,
							toggle: () => o(e.id)
						}, e.id))
					})
				]
			})
		})]
	});
}
// frontend/dashboard/ProgressDetails.tsx
function A({ model: e, link: t }) {
	return /* @__PURE__ */ (0, d.jsxs)("section", {
		className: "dash-growth",
		children: [/* @__PURE__ */ (0, d.jsxs)("div", {
			className: "dash-skills",
			children: [/* @__PURE__ */ (0, d.jsxs)("h2", { children: [/* @__PURE__ */ (0, d.jsx)(p, { name: "gear" }), "مهارت‌های تمرین‌شده"] }), e.skills.length ? /* @__PURE__ */ (0, d.jsx)("ul", { children: e.skills.map((e) => /* @__PURE__ */ (0, d.jsxs)("li", { children: [/* @__PURE__ */ (0, d.jsx)(p, { name: "check" }), /* @__PURE__ */ (0, d.jsx)("span", { children: e })] }, e)) }) : /* @__PURE__ */ (0, d.jsx)("p", {
				className: "dash-empty-note",
				children: "پس از قبول‌شدن مأموریت‌ها، مهارت‌های تمرین‌شده‌ات اینجا نمایش داده می‌شوند."
			})]
		}), /* @__PURE__ */ (0, d.jsxs)("div", {
			className: "dash-badges",
			children: [/* @__PURE__ */ (0, d.jsxs)("h2", { children: [/* @__PURE__ */ (0, d.jsx)(p, { name: "medal" }), "نشان‌های من"] }), e.labs.length ? /* @__PURE__ */ (0, d.jsx)("div", {
				className: "dash-stamp-list",
				children: e.labs.map((e) => {
					if (!e.lab) return null;
					let { title: n, path: r } = e.lab, i = e.progress?.status === "ready" && e.progress.finished, a = i ? "دریافت شد" : e.progress?.status === "ready" ? "در مسیر دریافت" : "وضعیت دریافت نشد";
					return /* @__PURE__ */ (0, d.jsxs)("a", {
						className: "dash-stamp",
						"data-earned": i,
						href: t(r),
						"aria-label": n + "؛ " + a,
						children: [
							/* @__PURE__ */ (0, d.jsx)(p, {
								name: e.dashboard_art ?? "sms",
								kind: "badge",
								className: "dash-stamp-icon"
							}),
							/* @__PURE__ */ (0, d.jsx)("span", { children: n }),
							/* @__PURE__ */ (0, d.jsx)("small", { children: a })
						]
					}, e.id);
				})
			}) : /* @__PURE__ */ (0, d.jsx)("p", {
				className: "dash-empty-note",
				children: "نشان‌های لابراتورها اینجا نمایش داده می‌شوند."
			})]
		})]
	});
}
function j({ label: e, points: t, maximum: n }) {
	return /* @__PURE__ */ (0, d.jsxs)("div", { children: [/* @__PURE__ */ (0, d.jsx)("span", { children: e }), /* @__PURE__ */ (0, d.jsx)("strong", { children: /* @__PURE__ */ (0, d.jsx)("bdi", {
		dir: "ltr",
		children: t != null && n != null ? x(Number(t)) + " / " + x(Number(n)) : "—"
	}) })] });
}
function M({ receipts: e, link: t }) {
	let n = (0, s.useRef)(null), r = (0, s.useRef)(null), i = e.length > 0;
	return (0, s.useEffect)(() => {
		let e = n.current, t = r.current, a = e?.ownerDocument.defaultView;
		if (!i || !e || !t || !a) return;
		let o = () => {
			a.location.hash === "#results" && (t.open = !0, e.focus({ preventScroll: !0 }), e.scrollIntoView?.({ block: "start" }));
		};
		return o(), a.addEventListener("hashchange", o), () => a.removeEventListener("hashchange", o);
	}, [i]), i ? /* @__PURE__ */ (0, d.jsx)("section", {
		id: "results",
		"data-dashboard-results": "",
		tabIndex: -1,
		ref: n,
		"aria-label": "نتایج آزمون‌ها",
		children: /* @__PURE__ */ (0, d.jsxs)("details", {
			className: "dash-results-details",
			ref: r,
			children: [/* @__PURE__ */ (0, d.jsxs)("summary", { children: [
				"جزئیات نتایج آزمون‌ها · ",
				b(e.length),
				" نتیجه"
			] }), /* @__PURE__ */ (0, d.jsx)("div", {
				className: "dash-results-body",
				children: /* @__PURE__ */ (0, d.jsx)("div", {
					className: "dashboard-results",
					children: e.map(({ lesson: e, receipt: n }) => {
						let r = S(n.last_at);
						return /* @__PURE__ */ (0, d.jsxs)("article", {
							className: "dashboard-result",
							"data-result-lesson": e.id,
							children: [
								/* @__PURE__ */ (0, d.jsxs)("div", {
									className: "result-heading",
									children: [/* @__PURE__ */ (0, d.jsxs)("div", { children: [/* @__PURE__ */ (0, d.jsxs)("p", {
										className: "eyebrow",
										dir: "auto",
										children: [
											e.course.display_title || e.course.title,
											" · نسخهٔ ",
											x(Number(n.version))
										]
									}), /* @__PURE__ */ (0, d.jsx)("h3", { children: e.title })] }), r && /* @__PURE__ */ (0, d.jsxs)("p", {
										className: "small-note",
										children: ["آخرین ثبت: ", r]
									})]
								}),
								Number(n.attempts) > 0 ? /* @__PURE__ */ (0, d.jsxs)("div", {
									className: "quiz-history",
									"aria-label": "سابقهٔ همین نسخه از آزمون",
									children: [
										/* @__PURE__ */ (0, d.jsx)(j, {
											label: "اولین نتیجه",
											points: n.first_score,
											maximum: n.maximum
										}),
										/* @__PURE__ */ (0, d.jsx)(j, {
											label: "بهترین نتیجه",
											points: n.best_score,
											maximum: n.maximum
										}),
										n.last_score != null && /* @__PURE__ */ (0, d.jsx)(j, {
											label: "آخرین نتیجه",
											points: n.last_score,
											maximum: n.maximum
										}),
										/* @__PURE__ */ (0, d.jsxs)("div", { children: [/* @__PURE__ */ (0, d.jsx)("span", { children: "تعداد تلاش‌ها" }), /* @__PURE__ */ (0, d.jsx)("strong", { children: x(Number(n.attempts)) })] })
									]
								}) : /* @__PURE__ */ (0, d.jsx)("p", {
									className: "small-note",
									children: "هنوز نتیجه‌ای برای این نسخه از آزمون ثبت نشده است."
								}),
								/* @__PURE__ */ (0, d.jsxs)("div", {
									className: "portal-actions",
									children: [n.last_id && /* @__PURE__ */ (0, d.jsx)("a", {
										className: "button-outline",
										href: t(C(e.id, n.last_id)),
										children: "مشاهدهٔ آخرین نتیجه ←"
									}), /* @__PURE__ */ (0, d.jsx)("a", {
										className: "quiet-link",
										href: t(C(e.id)),
										children: "تمرین و آزمون"
									})]
								})
							]
						}, e.id + ":" + n.version);
					})
				})
			})]
		})
	}) : null;
}
// frontend/dashboard/DashboardPage.tsx
function N({ view: e, actions: t }) {
	let { input: n, name: r, memberships: i, reviewDue: a } = e, { link: o, retry: c, saveBookmarks: l } = t, f = (0, s.useMemo)(() => u(n), [n]), [m, h] = (0, s.useState)(() => new Set(e.bookmarks)), [_, v] = (0, s.useState)(!1), y = (0, s.useRef)(null), b = (0, s.useMemo)(() => new Map(f.lessons.map((e) => [e.id, e])), [f]), x = n.results.flatMap((e) => {
		let t = b.get(e.lesson_id);
		return t ? [{
			receipt: e,
			lesson: t
		}] : [];
	});
	function S(e) {
		let t = new Set(m);
		t.has(e) ? (_ && y.current?.focus(), t.delete(e)) : t.add(e), h(t), l([...t]);
	}
	return /* @__PURE__ */ (0, d.jsxs)(d.Fragment, { children: [
		/* @__PURE__ */ (0, d.jsx)(w, {
			name: r,
			model: f,
			retry: c
		}),
		/* @__PURE__ */ (0, d.jsx)(T, {
			model: f,
			link: o,
			retry: c
		}),
		/* @__PURE__ */ (0, d.jsx)(E, {
			due: a,
			href: o("review/")
		}),
		f.lessons.length > 0 && /* @__PURE__ */ (0, d.jsx)("div", {
			className: "dash-path-tools",
			children: /* @__PURE__ */ (0, d.jsxs)("button", {
				ref: y,
				className: "dash-review-toggle",
				"data-review-filter": "",
				"aria-pressed": _,
				type: "button",
				onClick: () => v((e) => !e),
				children: [/* @__PURE__ */ (0, d.jsx)(p, {
					name: "bookmark",
					className: "dash-icon"
				}), " فقط یادداشت‌های نشان‌شده"]
			})
		}),
		f.courses.map((e) => /* @__PURE__ */ (0, d.jsx)(k, {
			course: e,
			lessons: e.lessons.flatMap(({ id: e }) => {
				let t = b.get(e);
				return t ? [t] : [];
			}),
			single: f.courses.length === 1,
			onlyBookmarked: _,
			bookmarks: m,
			link: o,
			toggle: S
		}, e.id)),
		/* @__PURE__ */ (0, d.jsx)("p", {
			className: "dash-empty-review",
			role: "status",
			hidden: !_ || f.lessons.some((e) => m.has(e.id)),
			children: "هنوز یادداشتی برای مرور نشان نکرده‌ای."
		}),
		/* @__PURE__ */ (0, d.jsx)(A, {
			model: f,
			link: o
		}),
		/* @__PURE__ */ (0, d.jsx)(g, {
			items: i,
			actions: t
		}),
		/* @__PURE__ */ (0, d.jsx)(M, {
			receipts: x,
			link: o
		})
	] });
}
function P({ view: e, actions: t }) {
	switch (e.phase) {
		case "loading": return /* @__PURE__ */ (0, d.jsx)("p", {
			className: "dash-empty-note",
			role: "status",
			children: "در حال دریافت مسیر یادگیری…"
		});
		case "guest": return /* @__PURE__ */ (0, d.jsx)(_, { login: e.login });
		case "error": return /* @__PURE__ */ (0, d.jsx)(y, {
			kind: e.kind,
			retry: t.retry
		});
		case "ready": return /* @__PURE__ */ (0, d.jsx)(N, {
			view: e,
			actions: t
		});
	}
}
// frontend/dashboard/dashboard-controller.mjs
function F({ renderer: e, catalog: t, context: n, isCurrent: r, rpc: i, refreshAccess: a, studyFor: o, login: s, link: c, storage: l }) {
	let u = 0, d = !1, f = !1;
	async function p() {
		if (d || !r()) return;
		let m = ++u, h = () => !d && r() && m === u, { user: g, state: _, serviceError: v, labSnapshots: y } = n(), b = Array.isArray(_?.memberships) ? _.memberships : [], x = g && "classroom-review:" + g.id, S = new Map(b.map((e) => [e.course_id, e])), C = t.filter((e) => S.get(e.id)?.status === "active"), w = {
			link: c,
			retry: () => T(),
			refreshMembership: () => T(),
			requestAccess: (e) => T(e),
			saveBookmarks: (e) => {
				h() && x && l.write(x, e);
			}
		};
		async function T(e) {
			if (h() && g && !f && (!e || t.some((t) => t.id === e) && !S.has(e))) {
				f = !0;
				try {
					if (e && await i("classroom_request_access", { p_course: e }), !h()) return;
					await a(), h() && await p();
				} finally {
					f = !1;
				}
			}
		}
		if (!g) e.render({
			phase: "guest",
			login: s()
		}, w);
		else if (v) e.render({
			phase: "error",
			kind: "membership"
		}, w);
		else {
			e.render({ phase: "loading" }, w);
			try {
				let n = C.flatMap((e) => e.lessons), r = n.filter((e) => e.lab), a = y ? r.map((e) => y[e.lab.mission] ?? { status: "rejected" }) : await Promise.allSettled(r.map((e) => i("classroom_lab_state", { p_mission: e.lab.mission })));
				if (!h()) return;
				let s = new Set(n.map((e) => e.id)), c = (_?.results ?? []).filter((e) => s.has(e.lesson_id)).sort((e, t) => (Date.parse(t.last_at) || 0) - (Date.parse(e.last_at) || 0)), u = t.filter((e) => S.get(e.id)?.status !== "active").map((e) => {
					let t = S.get(e.id), n = t?.status;
					return {
						id: e.id,
						title: e.display_title || e.title,
						status: n === "pending" || n === "suspended" ? n : t ? "unavailable" : "unregistered"
					};
				}), d = l.read(x), f = String(g.user_metadata?.full_name || g.user_metadata?.name || "").trim(), p = {
					phase: "ready",
					name: f && !f.includes("@") ? f.split(/\s+/)[0].slice(0, 40) : "دوست من",
					memberships: u,
					bookmarks: Array.isArray(d) ? d.filter((e) => s.has(e)) : [],
					reviewDue: null,
					input: {
						courses: C,
						results: c,
						study: Object.fromEntries(C.map((e) => [e.id, o(e)])),
						states: Object.fromEntries(r.map((e, t) => [e.id, a[t]]))
					}
				};
				e.render(p, w), i("classroom_review_summary").then((t) => {
					if (!h() || t?.due_count == null) return;
					let n = Number(t.due_count);
					Number.isSafeInteger(n) && n >= 0 && e.render({
						...p,
						reviewDue: n
					}, w);
				}).catch(() => {});
			} catch {
				h() && e.render({
					phase: "error",
					kind: "dashboard"
				}, w);
			}
		}
	}
	return {
		load: p,
		dispose() {
			d = !0, e.dispose();
		}
	};
}
// frontend/dashboard-page.tsx
function I(e) {
	let t = (0, c.createRoot)(e, { identifierPrefix: "dashboard-" });
	return {
		render(e, n) {
			t.render(/* @__PURE__ */ (0, d.jsx)(P, {
				view: e,
				actions: n
			}));
		},
		dispose() {
			t.unmount();
		}
	};
}
export { F as createDashboardController, I as mountDashboard };
