import { a as e, i as t, n, t as r } from "./jsx-runtime-CMv_BHj2.mjs";
import { r as i } from "./runtime-D2U6pln4.mjs";
import { n as a, o, r as s } from "./QuizResult-CdyqSXHC.mjs";
import { t as c } from "./QuestionFigure-wq52USe_.mjs";
// web/assets/instructor-model.mjs
var l = /* @__PURE__ */ e(t(), 1), u = n(), d = [
	["overview", "نمای کلی"],
	["students", "دانشجویان"],
	["attempts", "آزمون‌ها"],
	["labs", "لابراتورها"],
	["requests", "درخواست‌ها"]
], f = (e) => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(Number(e)), p = (e) => new Intl.NumberFormat("en-US", {
	useGrouping: !1,
	maximumFractionDigits: 2
}).format(Number(e));
function m(e, t = !1) {
	return !e || !Number.isFinite(Date.parse(e)) ? "ثبت نشده" : new Intl.DateTimeFormat("fa-IR", {
		dateStyle: "medium",
		...t ? { timeStyle: "short" } : {},
		timeZone: "Asia/Tehran"
	}).format(new Date(e));
}
function h(e, t = Date.now()) {
	if (!e || !Number.isFinite(Date.parse(e))) return "ثبت نشده";
	let n = Math.floor(Math.max(0, t - Date.parse(e)) / 864e5);
	return n === 0 ? "امروز" : n === 1 ? "دیروز" : n < 14 ? f(n) + " روز پیش" : m(e);
}
function g() {
	return {
		students: {
			query: "",
			status: "enrolled",
			cursors: [null],
			index: 0
		},
		attempts: {
			query: "",
			lesson: null,
			kind: "all",
			section: "attempts",
			cursors: [null],
			index: 0,
			asOf: null
		},
		labs: {
			query: "",
			mission: "all",
			cursors: [null],
			index: 0
		},
		requests: {
			query: "",
			cursors: [null],
			index: 0
		}
	};
}
function _(e) {
	e.cursors = [null], e.index = 0, "asOf" in e && (e.asOf = null);
}
function ee(e = () => !0) {
	let t = 0, n = !1, r = /* @__PURE__ */ new Map();
	return {
		current: () => !n && e(),
		ticket(i) {
			let a = t, o = (r.get(i) || 0) + 1;
			return r.set(i, o), () => !n && a === t && r.get(i) === o && e();
		},
		cancel(e) {
			r.set(e, (r.get(e) || 0) + 1);
		},
		invalidate() {
			t++, r.clear();
		},
		dispose() {
			n = !0, t++, r.clear();
		}
	};
}
function v(e) {
	return typeof e == "number" && Number.isFinite(e) && e >= 0;
}
function y(e) {
	if (!e || !Array.isArray(e.rows) || !v(e.total) || e.rows.length > 100 || !(e.next_cursor === null || typeof e.next_cursor == "object" && !Array.isArray(e.next_cursor)) || !v(e.page_size) || e.page_size < 1) throw Error("INVALID_INSTRUCTOR_RESPONSE");
	return e;
}
function te(e) {
	if (e?.schema_version !== 1 || !e.stats || ![
		"active_students",
		"pending_students",
		"total_attempts"
	].every((t) => v(e.stats[t])) || !Array.isArray(e.labs) || !Array.isArray(e.pending) || !Array.isArray(e.concepts)) throw Error("INVALID_INSTRUCTOR_RESPONSE");
	return e;
}
function b(e) {
	if (!e?.user_id || ![
		"active",
		"pending",
		"suspended"
	].includes(e.status) || !e.lab || ![
		"xp",
		"maximum",
		"completed",
		"task_count",
		"attempts"
	].every((t) => v(e.lab[t])) || !Array.isArray(e.lab.missions)) throw Error("INVALID_INSTRUCTOR_RESPONSE");
	return e;
}
function x(e, t = "all") {
	if (t === "all") return e.lab;
	let n = e.lab.missions.find((e) => e.mission === t);
	return n ? {
		...n,
		completed: Array.isArray(n.completed) ? n.completed.length : n.completed_count
	} : null;
}
function S(e, t, n, r = 20) {
	return e === "attempts" ? {
		p_course: t,
		p_query: n.query,
		p_lesson: n.lesson,
		p_kind: n.kind,
		p_after: n.cursors[n.index],
		p_limit: r,
		p_as_of: n.asOf
	} : {
		p_course: t,
		p_query: n.query,
		p_status: e === "requests" ? "pending" : e === "labs" ? "active" : n.status,
		p_after: n.cursors[n.index],
		p_limit: r
	};
}
function C(e) {
	return /TEACHER_REQUIRED|CLASS_ACCESS_REQUIRED/.test(e?.message || "") ? "دسترسی مدرس برای این کلاس تأیید نشد. وضعیت حساب را بررسی کنید." : ["PGRST202", "42883"].includes(e?.code) && /classroom_instructor_/.test(e?.message || "") ? "نسخهٔ سرور پنل مدرس نیاز به به‌روزرسانی دارد." : /STUDENT_UNAVAILABLE/.test(e?.message || "") ? "این دانشجو دیگر در فهرست اعضای کلاس نیست. گزارش را به‌روزرسانی کنید." : /INSTRUCTOR_REPORT_CHANGED/.test(e?.message || "") ? "اطلاعات هنگام دریافت تغییر کرد؛ گزارش را به‌روزرسانی و دوباره امتحان کنید." : "دریافت یا ثبت اطلاعات کامل نشد. اتصال را بررسی کنید و دوباره تلاش کنید.";
}
function ne(e) {
	let t = (e) => {
		let t = String(e ?? "");
		return /^[\s\uFEFF]*[=+@-]/.test(t) && (t = "'" + t), "\"" + t.replace(/"/g, "\"\"") + "\"";
	};
	return "﻿" + e.map((e) => e.map(t).join(",")).join("\r\n");
}
function w(e, t, n = "all") {
	return e === "attempts" ? [[
		"name",
		"email",
		"lesson",
		"version",
		"attempt",
		"score",
		"maximum",
		"registered_at"
	], ...t.map((e) => [
		e.name,
		e.email,
		e.title,
		e.version,
		e.attempt_no,
		e.score,
		e.maximum,
		e.created_at
	])] : e === "labs" ? [[
		"name",
		"email",
		"mission",
		"xp",
		"maximum",
		"completed_tasks",
		"task_count"
	], ...t.map((e) => {
		let t = x(e, n);
		return [
			e.name,
			e.email,
			n,
			t?.xp ?? "",
			t?.maximum ?? "",
			t?.completed ?? "",
			t?.task_count ?? ""
		];
	})] : [[
		"name",
		"email",
		"access_status",
		"lab_xp",
		"lab_xp_maximum",
		"completed_tasks",
		"task_count",
		"last_registered_at"
	], ...t.map((e) => [
		e.name,
		e.email,
		e.status,
		e.lab.xp,
		e.lab.maximum,
		e.lab.completed,
		e.lab.task_count,
		e.last_registered_at
	])];
}
async function T(e, t, { alive: n = () => !0, onProgress: r = () => {} } = {}) {
	let i = [], a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), s = {
		...t,
		p_after: null,
		p_limit: 100
	}, c = null;
	for (;;) {
		if (!n()) throw Error("INSTRUCTOR_EXPORT_CANCELLED");
		let t = y(await e(s));
		if (!n()) throw Error("INSTRUCTOR_EXPORT_CANCELLED");
		if (c === null) c = t.total;
		else if (c !== t.total) throw Error("INSTRUCTOR_REPORT_CHANGED");
		t.as_of && (s.p_as_of = t.as_of);
		for (let e of t.rows) {
			let t = e.id || e.user_id;
			if (!t || a.has(t)) throw Error("INSTRUCTOR_REPORT_CHANGED");
			a.add(t), i.push(e);
		}
		if (r(i.length, c), !t.next_cursor) break;
		let l = JSON.stringify(t.next_cursor);
		if (o.has(l) || !t.rows.length) throw Error("INSTRUCTOR_REPORT_CHANGED");
		o.add(l), s.p_after = t.next_cursor;
	}
	if (i.length !== c) throw Error("INSTRUCTOR_REPORT_CHANGED");
	return i;
}
// frontend/instructor/Presentation.tsx
var E = r();
function D({ person: e }) {
	return /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)("strong", { children: e.name || e.email || "دانشجو" }), e.email && /* @__PURE__ */ (0, E.jsx)("bdi", {
		className: "email",
		children: e.email
	})] });
}
function O({ status: e }) {
	return /* @__PURE__ */ (0, E.jsx)("span", {
		className: "pill " + (e === "pending" ? "pending" : e === "suspended" ? "off" : ""),
		children: {
			active: "دارای دسترسی",
			pending: "در انتظار",
			suspended: "بدون دسترسی"
		}[e] || "—"
	});
}
function k({ score: e }) {
	return e?.score != null && e.maximum != null && Number.isFinite(Number(e.score)) && Number.isFinite(Number(e.maximum)) ? /* @__PURE__ */ (0, E.jsxs)("bdi", {
		dir: "ltr",
		children: [
			f(e.score),
			" / ",
			f(e.maximum)
		]
	}) : /* @__PURE__ */ (0, E.jsx)(E.Fragment, { children: "—" });
}
function A({ lab: e }) {
	return e && e.maximum > 0 ? /* @__PURE__ */ (0, E.jsxs)("bdi", {
		className: "mono xp",
		dir: "ltr",
		children: [
			p(e.xp),
			" / ",
			p(e.maximum),
			" XP"
		]
	}) : /* @__PURE__ */ (0, E.jsx)(E.Fragment, { children: "—" });
}
function j({ value: e, max: t }) {
	let n = t > 0 ? Math.max(0, Math.min(100, e / t * 100)) : 0;
	return /* @__PURE__ */ (0, E.jsx)("div", {
		className: "bar",
		role: "img",
		"aria-label": f(e) + " از " + f(t),
		children: /* @__PURE__ */ (0, E.jsx)("i", { style: { width: n + "%" } })
	});
}
function M({ children: e = "در حال دریافت گزارش…" }) {
	return /* @__PURE__ */ (0, E.jsxs)("div", {
		className: "empty",
		role: "status",
		children: [/* @__PURE__ */ (0, E.jsx)("span", {
			className: "spinner",
			"aria-hidden": "true"
		}), e]
	});
}
function N({ title: e, children: t, action: n }) {
	return /* @__PURE__ */ (0, E.jsxs)("div", {
		className: "empty",
		children: [
			/* @__PURE__ */ (0, E.jsx)(i, { name: "note" }),
			/* @__PURE__ */ (0, E.jsx)("h2", { children: e }),
			/* @__PURE__ */ (0, E.jsx)("p", { children: t }),
			n
		]
	});
}
function P({ error: e, retry: t }) {
	return /* @__PURE__ */ (0, E.jsx)(N, {
		title: "گزارش دریافت نشد",
		action: /* @__PURE__ */ (0, E.jsx)("button", {
			className: "btn primary",
			type: "button",
			onClick: t,
			children: "دریافت دوباره"
		}),
		children: C(e)
	});
}
function F(e, t, n) {
	let r = n.find((t) => t.id === e.course), i = e.overview?.lessons || r?.lessons || [], a = (e) => i.find((t) => t.id === e) || r?.lessons.find((t) => t.id === e);
	return {
		course: r,
		lessons: i,
		lessonInfo: a,
		noteLabel: (e) => {
			let t = a(e);
			return t?.ordinal ? "یادداشت " + f(t.ordinal) : t?.number ? "یادداشت " + f(t.number) : t?.title || e;
		},
		courseTitle: t.find((t) => t.course_id === e.course)?.title || r?.display_title || r?.title || e.course,
		labTitle: (e, t) => r?.lessons.find((t) => t.lab?.mission === e)?.lab?.title || t || "لابراتور"
	};
}
// frontend/instructor/Overview.tsx
function I({ state: e, labels: t, actions: n }) {
	let r = e.overview;
	if (!r) return /* @__PURE__ */ (0, E.jsx)("section", {
		className: "card",
		children: e.overviewError ? /* @__PURE__ */ (0, E.jsx)(P, {
			error: e.overviewError,
			retry: n.loadOverview
		}) : /* @__PURE__ */ (0, E.jsx)(M, {})
	});
	let a = r.stats;
	return /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
		e.overviewError ? /* @__PURE__ */ (0, E.jsxs)("p", {
			className: "notice",
			role: "alert",
			children: [C(e.overviewError), " آخرین گزارش دریافت‌شده نمایش داده می‌شود."]
		}) : null,
		/* @__PURE__ */ (0, E.jsxs)("div", {
			className: "teacher-metrics",
			children: [
				/* @__PURE__ */ (0, E.jsxs)("button", {
					className: "teacher-metric",
					type: "button",
					onClick: () => n.navigate("students"),
					children: [
						/* @__PURE__ */ (0, E.jsxs)("span", {
							className: "teacher-metric-label",
							children: [/* @__PURE__ */ (0, E.jsx)(i, { name: "user" }), "دانشجوی دارای دسترسی"]
						}),
						/* @__PURE__ */ (0, E.jsx)("strong", { children: f(a.active_students) }),
						/* @__PURE__ */ (0, E.jsx)("small", { children: "مشاهدهٔ دانشجویان ←" })
					]
				}),
				/* @__PURE__ */ (0, E.jsxs)("button", {
					className: "teacher-metric",
					"data-tone": a.pending_students > 0 ? "attention" : void 0,
					type: "button",
					onClick: () => n.navigate("requests"),
					children: [
						/* @__PURE__ */ (0, E.jsxs)("span", {
							className: "teacher-metric-label",
							children: [/* @__PURE__ */ (0, E.jsx)(i, { name: "bell" }), "درخواست در انتظار"]
						}),
						/* @__PURE__ */ (0, E.jsx)("strong", { children: f(a.pending_students) }),
						/* @__PURE__ */ (0, E.jsx)("small", { children: "بررسی دسترسی‌ها ←" })
					]
				}),
				/* @__PURE__ */ (0, E.jsxs)("button", {
					className: "teacher-metric",
					type: "button",
					onClick: () => n.navigate("attempts"),
					children: [
						/* @__PURE__ */ (0, E.jsxs)("span", {
							className: "teacher-metric-label",
							children: [/* @__PURE__ */ (0, E.jsx)(i, { name: "quiz" }), "ثبت نهایی آزمون"]
						}),
						/* @__PURE__ */ (0, E.jsx)("strong", { children: f(a.total_attempts) }),
						/* @__PURE__ */ (0, E.jsx)("small", { children: "مشاهدهٔ ثبت‌ها ←" })
					]
				})
			]
		}),
		/* @__PURE__ */ (0, E.jsxs)("div", {
			className: "teacher-overview-grid",
			children: [/* @__PURE__ */ (0, E.jsxs)("section", {
				className: "card teacher-inbox",
				children: [/* @__PURE__ */ (0, E.jsx)("header", {
					className: "card-head",
					children: /* @__PURE__ */ (0, E.jsxs)("div", { children: [/* @__PURE__ */ (0, E.jsx)("h2", { children: "درخواست‌های تازه" }), /* @__PURE__ */ (0, E.jsx)("p", { children: "پیش از تأیید، مشخصات حساب را بررسی کنید." })] })
				}), /* @__PURE__ */ (0, E.jsxs)("div", {
					className: "card-content",
					children: [r.pending.length ? r.pending.map((e) => /* @__PURE__ */ (0, E.jsxs)("div", {
						className: "pending-person",
						children: [
							/* @__PURE__ */ (0, E.jsx)("div", {
								className: "avatar",
								"aria-hidden": "true",
								children: (e.name || "د")[0]
							}),
							/* @__PURE__ */ (0, E.jsxs)("div", { children: [/* @__PURE__ */ (0, E.jsx)("strong", { children: e.name || "دانشجو" }), /* @__PURE__ */ (0, E.jsx)("small", { children: m(e.created_at) })] }),
							/* @__PURE__ */ (0, E.jsx)("button", {
								className: "btn small-btn",
								type: "button",
								onClick: () => void n.student(e.user_id, "request"),
								children: "بررسی"
							})
						]
					}, e.user_id)) : /* @__PURE__ */ (0, E.jsx)("p", {
						className: "small muted",
						children: "درخواستی در انتظار نیست."
					}), a.pending_students > 0 && /* @__PURE__ */ (0, E.jsx)("button", {
						className: "quiet teacher-card-link",
						type: "button",
						onClick: () => n.navigate("requests"),
						children: "همهٔ درخواست‌ها ←"
					})]
				})]
			}), /* @__PURE__ */ (0, E.jsxs)("section", {
				className: "card",
				children: [/* @__PURE__ */ (0, E.jsxs)("header", {
					className: "card-head",
					children: [/* @__PURE__ */ (0, E.jsxs)("div", { children: [/* @__PURE__ */ (0, E.jsx)("h2", { children: "پیشرفت لابراتورها" }), /* @__PURE__ */ (0, E.jsx)("p", { children: "تعداد دانشجویانی که همهٔ مأموریت‌ها را کامل کرده‌اند." })] }), /* @__PURE__ */ (0, E.jsx)("button", {
						className: "quiet",
						type: "button",
						onClick: () => n.navigate("labs"),
						children: "گزارش کامل ←"
					})]
				}), /* @__PURE__ */ (0, E.jsx)("div", {
					className: "card-content",
					children: r.labs.length ? r.labs.map((e) => /* @__PURE__ */ (0, E.jsxs)("div", {
						className: "progress-item",
						children: [/* @__PURE__ */ (0, E.jsxs)("div", {
							className: "progress-line",
							children: [/* @__PURE__ */ (0, E.jsxs)("div", {
								className: "progress-title",
								children: [/* @__PURE__ */ (0, E.jsx)("span", {
									className: "number-tag",
									children: String(e.ordinal ?? "").padStart(2, "0")
								}), /* @__PURE__ */ (0, E.jsx)("span", { children: t.labTitle(e.mission, e.title) })]
							}), /* @__PURE__ */ (0, E.jsxs)("small", { children: [
								f(e.completed_students),
								" از ",
								f(e.students),
								" نفر"
							] })]
						}), /* @__PURE__ */ (0, E.jsx)(j, {
							value: e.completed_students,
							max: e.students
						})]
					}, e.mission)) : /* @__PURE__ */ (0, E.jsx)("p", {
						className: "small muted",
						children: "هنوز لابراتوری برای گزارش این کلاس ثبت نشده است."
					})
				})]
			})]
		}),
		/* @__PURE__ */ (0, E.jsxs)("section", {
			className: "card wide-card",
			children: [
				/* @__PURE__ */ (0, E.jsxs)("header", {
					className: "card-head",
					children: [/* @__PURE__ */ (0, E.jsxs)("div", { children: [/* @__PURE__ */ (0, E.jsx)("h2", { children: "برای جلسهٔ بعد چه چیزی را مرور کنیم؟" }), /* @__PURE__ */ (0, E.jsx)("p", { children: "نسبت خطا در اولین ثبت هر دانشجو، برای هر نسخهٔ آزمون." })] }), /* @__PURE__ */ (0, E.jsx)("button", {
						className: "quiet",
						type: "button",
						onClick: () => n.setSection("concepts"),
						children: "تحلیل سؤال‌ها ←"
					})]
				}),
				/* @__PURE__ */ (0, E.jsx)("div", {
					className: "card-content",
					children: r.concepts.length ? r.concepts.map((e) => /* @__PURE__ */ (0, E.jsxs)("div", {
						className: "question-line",
						children: [
							/* @__PURE__ */ (0, E.jsxs)("div", { children: [/* @__PURE__ */ (0, E.jsx)("strong", { children: e.skill || e.question_id }), /* @__PURE__ */ (0, E.jsxs)("p", { children: [
								t.noteLabel(e.lesson_id),
								" · نسخهٔ ",
								f(e.version)
							] })] }),
							/* @__PURE__ */ (0, E.jsx)(j, {
								value: e.responses - e.correct,
								max: e.responses
							}),
							/* @__PURE__ */ (0, E.jsxs)("span", {
								className: "small",
								children: [
									f(e.responses - e.correct),
									" خطا از ",
									f(e.responses),
									" پاسخ"
								]
							})
						]
					}, e.lesson_id + ":" + e.version + ":" + e.question_id)) : /* @__PURE__ */ (0, E.jsx)("p", {
						className: "small muted",
						children: "پس از ثبت آزمون‌ها، این گزارش نمایش داده می‌شود."
					})
				}),
				/* @__PURE__ */ (0, E.jsx)("p", {
					className: "legend-note",
					children: "نسبت خطا را در کنار تعداد پاسخ‌ها و ابهام احتمالی سؤال بخوانید."
				})
			]
		})
	] });
}
// frontend/instructor/Reports.tsx
function L({ state: e, labels: t, actions: n, view: r }) {
	let a = e.filters[r], o = (0, l.useRef)(!1);
	return /* @__PURE__ */ (0, E.jsxs)("div", {
		className: "toolbar",
		children: [
			/* @__PURE__ */ (0, E.jsxs)("label", {
				className: "search",
				htmlFor: "instructor-search",
				children: [/* @__PURE__ */ (0, E.jsx)(i, { name: "search" }), /* @__PURE__ */ (0, E.jsx)("input", {
					id: "instructor-search",
					type: "search",
					maxLength: 120,
					autoComplete: "off",
					value: a.query,
					onCompositionStart: () => {
						o.current = !0;
					},
					onCompositionEnd: (e) => {
						o.current = !1, n.query(e.currentTarget.value);
					},
					onChange: (e) => n.query(e.currentTarget.value, !o.current),
					placeholder: "جست‌وجوی نام یا ایمیل",
					"aria-label": "جست‌وجوی نام یا ایمیل"
				})]
			}),
			r === "students" && /* @__PURE__ */ (0, E.jsxs)("select", {
				className: "filter",
				"aria-label": "وضعیت دسترسی",
				value: a.status,
				onChange: (e) => n.changeFilter("status", e.target.value),
				children: [
					/* @__PURE__ */ (0, E.jsx)("option", {
						value: "enrolled",
						children: "همهٔ وضعیت‌ها"
					}),
					/* @__PURE__ */ (0, E.jsx)("option", {
						value: "active",
						children: "دارای دسترسی"
					}),
					/* @__PURE__ */ (0, E.jsx)("option", {
						value: "suspended",
						children: "بدون دسترسی"
					})
				]
			}),
			r === "attempts" && /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsxs)("select", {
				className: "filter",
				"aria-label": "یادداشت",
				value: a.lesson || "",
				onChange: (e) => n.changeFilter("lesson", e.target.value),
				children: [/* @__PURE__ */ (0, E.jsx)("option", {
					value: "",
					children: "همهٔ یادداشت‌ها"
				}), t.lessons.map((e) => /* @__PURE__ */ (0, E.jsx)("option", {
					value: e.id,
					children: t.noteLabel(e.id)
				}, e.id))]
			}), /* @__PURE__ */ (0, E.jsxs)("select", {
				className: "filter",
				"aria-label": "نوع تلاش",
				value: a.kind,
				onChange: (e) => n.changeFilter("kind", e.target.value),
				children: [
					/* @__PURE__ */ (0, E.jsx)("option", {
						value: "all",
						children: "همهٔ تلاش‌ها"
					}),
					/* @__PURE__ */ (0, E.jsx)("option", {
						value: "first",
						children: "فقط اولین ثبت"
					}),
					/* @__PURE__ */ (0, E.jsx)("option", {
						value: "later",
						children: "تلاش‌های بعدی"
					})
				]
			})] })
		]
	});
}
function R({ state: e, actions: t, page: n, view: r }) {
	return /* @__PURE__ */ (0, E.jsxs)("div", {
		className: "table-foot",
		children: [/* @__PURE__ */ (0, E.jsxs)("span", { children: [
			f(n.total),
			" ",
			r === "attempts" ? "ثبت" : r === "requests" ? "درخواست" : "دانشجو",
			" · صفحهٔ ",
			f(e.filters[r].index + 1)
		] }), /* @__PURE__ */ (0, E.jsxs)("div", {
			className: "pages",
			children: [/* @__PURE__ */ (0, E.jsx)("button", {
				className: "btn",
				type: "button",
				disabled: !e.filters[r].index,
				onClick: () => t.page(-1),
				children: "قبلی"
			}), /* @__PURE__ */ (0, E.jsx)("button", {
				className: "btn",
				type: "button",
				disabled: !n.next_cursor,
				onClick: () => t.page(1),
				children: "بعدی"
			})]
		})]
	});
}
function z({ state: e, labels: t, actions: n, view: r }) {
	let i = e.pages[r];
	if (!i || i.loading) return /* @__PURE__ */ (0, E.jsx)(M, {});
	if (i.error || !i.data) return /* @__PURE__ */ (0, E.jsx)(P, {
		error: i.error,
		retry: n.refresh
	});
	let a = i.data;
	if (!a.rows.length) return /* @__PURE__ */ (0, E.jsx)(N, {
		title: "اطلاعاتی برای نمایش نیست",
		action: e.filters[r].query ? /* @__PURE__ */ (0, E.jsx)("button", {
			className: "btn",
			type: "button",
			onClick: n.clearQuery,
			children: "پاک‌کردن جست‌وجو"
		}) : void 0,
		children: e.filters[r].query ? "نام، ایمیل یا فیلتر را تغییر دهید." : "هنوز داده‌ای با این شرایط ثبت نشده است."
	});
	let o, s;
	return r === "attempts" ? (o = [
		"دانشجو",
		"یادداشت",
		"نوع ثبت",
		"نمره",
		"زمان",
		"پاسخ‌ها"
	], s = a.rows.map((e) => ({
		key: e.id,
		cells: [
			/* @__PURE__ */ (0, E.jsx)(D, { person: e }),
			/* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [t.noteLabel(e.lesson_id), /* @__PURE__ */ (0, E.jsxs)("span", {
				className: "sub",
				children: ["نسخهٔ ", f(e.version)]
			})] }),
			e.attempt_no === 1 ? /* @__PURE__ */ (0, E.jsx)("span", {
				className: "tag-first",
				children: "اولین ثبت"
			}) : "تلاش " + f(e.attempt_no),
			/* @__PURE__ */ (0, E.jsx)(k, { score: e }),
			m(e.created_at),
			/* @__PURE__ */ (0, E.jsx)("button", {
				className: "btn small-btn",
				type: "button",
				onClick: () => void n.attempt(e.id),
				children: "بررسی پاسخ‌ها"
			})
		]
	}))) : r === "labs" ? (o = [
		"دانشجو",
		"مأموریت‌های انجام‌شده",
		"XP",
		"آخرین ثبت لابراتور",
		"جزئیات"
	], s = a.rows.map((t) => {
		let r = x(t, e.filters.labs.mission);
		return {
			key: t.user_id,
			cells: [
				/* @__PURE__ */ (0, E.jsx)(D, { person: t }),
				r ? /* @__PURE__ */ (0, E.jsxs)("div", {
					className: "lab-cell",
					children: [/* @__PURE__ */ (0, E.jsxs)("span", { children: [
						f(r.completed),
						" از ",
						f(r.task_count)
					] }), /* @__PURE__ */ (0, E.jsx)(j, {
						value: r.completed,
						max: r.task_count
					})]
				}) : "—",
				/* @__PURE__ */ (0, E.jsx)(A, { lab: r }),
				h(r?.last_at),
				/* @__PURE__ */ (0, E.jsx)("button", {
					className: "btn small-btn",
					type: "button",
					onClick: () => void n.student(t.user_id),
					children: "جزئیات"
				})
			]
		};
	})) : (o = [
		"دانشجو",
		"XP لابراتورها",
		"آخرین آزمون",
		"آخرین ثبت آموزشی",
		"دسترسی",
		"جزئیات"
	], s = a.rows.map((e) => ({
		key: e.user_id,
		cells: [
			/* @__PURE__ */ (0, E.jsx)(D, { person: e }),
			/* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)(A, { lab: e.lab }), /* @__PURE__ */ (0, E.jsxs)("span", {
				className: "sub",
				children: [
					f(e.lab.completed),
					" از ",
					f(e.lab.task_count),
					" مأموریت"
				]
			})] }),
			/* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)(k, { score: e.latest_quiz }), e.latest_quiz && /* @__PURE__ */ (0, E.jsxs)("span", {
				className: "sub",
				children: [
					t.noteLabel(e.latest_quiz.lesson_id),
					" · نسخهٔ ",
					f(e.latest_quiz.version)
				]
			})] }),
			h(e.last_registered_at),
			/* @__PURE__ */ (0, E.jsx)(O, { status: e.status }),
			/* @__PURE__ */ (0, E.jsx)("button", {
				className: "btn small-btn",
				type: "button",
				"aria-label": "پروندهٔ " + (e.name || e.email || "دانشجو"),
				onClick: () => void n.student(e.user_id),
				children: "پرونده ←"
			})
		]
	}))), /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)("div", {
		className: "table-scroll teacher-report-scroll",
		children: /* @__PURE__ */ (0, E.jsxs)("table", {
			role: "table",
			className: "teacher-report-table",
			children: [/* @__PURE__ */ (0, E.jsx)("thead", {
				role: "rowgroup",
				children: /* @__PURE__ */ (0, E.jsx)("tr", {
					role: "row",
					children: o.map((e) => /* @__PURE__ */ (0, E.jsx)("th", {
						scope: "col",
						role: "columnheader",
						children: e
					}, e))
				})
			}), /* @__PURE__ */ (0, E.jsx)("tbody", {
				role: "rowgroup",
				children: s.map((e) => /* @__PURE__ */ (0, E.jsx)("tr", {
					role: "row",
					children: e.cells.map((e, t) => /* @__PURE__ */ (0, E.jsxs)("td", {
						role: "cell",
						children: [t > 0 && t < o.length - 1 && /* @__PURE__ */ (0, E.jsx)("span", {
							className: "teacher-mobile-label",
							"aria-hidden": "true",
							children: o[t]
						}), /* @__PURE__ */ (0, E.jsx)("div", { children: e })]
					}, o[t]))
				}, e.key))
			})]
		})
	}), /* @__PURE__ */ (0, E.jsx)(R, {
		state: e,
		actions: n,
		page: a,
		view: r
	})] });
}
function B({ state: e, labels: t, actions: n }) {
	let r = e.pages.requests;
	if (!r || r.loading) return /* @__PURE__ */ (0, E.jsx)("section", {
		className: "card",
		children: /* @__PURE__ */ (0, E.jsx)(M, {})
	});
	if (r.error || !r.data) return /* @__PURE__ */ (0, E.jsx)("section", {
		className: "card",
		children: /* @__PURE__ */ (0, E.jsx)(P, {
			error: r.error,
			retry: n.refresh
		})
	});
	let i = r.data;
	return i.rows.length ? /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
		/* @__PURE__ */ (0, E.jsxs)("p", {
			className: "notice",
			children: [f(i.total), " درخواست در انتظار است. پیش از فعال‌کردن دسترسی، نام و ایمیل را بررسی کنید."]
		}),
		/* @__PURE__ */ (0, E.jsx)("div", {
			className: "request-list",
			children: i.rows.map((e) => /* @__PURE__ */ (0, E.jsxs)("article", {
				className: "request-card",
				children: [
					/* @__PURE__ */ (0, E.jsx)("div", {
						className: "avatar",
						"aria-hidden": "true",
						children: (e.name || "د")[0]
					}),
					/* @__PURE__ */ (0, E.jsxs)("div", {
						className: "request-info",
						children: [
							/* @__PURE__ */ (0, E.jsx)("h2", { children: e.name || "دانشجو" }),
							/* @__PURE__ */ (0, E.jsx)("bdi", { children: e.email }),
							/* @__PURE__ */ (0, E.jsxs)("p", { children: [
								"درخواست عضویت در ",
								t.courseTitle,
								" · ",
								m(e.requested_at)
							] })
						]
					}),
					/* @__PURE__ */ (0, E.jsxs)("div", {
						className: "request-actions",
						children: [/* @__PURE__ */ (0, E.jsx)("button", {
							className: "btn",
							type: "button",
							onClick: () => void n.student(e.user_id, "request"),
							children: "بررسی"
						}), /* @__PURE__ */ (0, E.jsx)("button", {
							className: "btn primary",
							type: "button",
							onClick: () => void n.askMembership(e.user_id),
							children: "تأیید دسترسی"
						})]
					})
				]
			}, e.user_id))
		}),
		/* @__PURE__ */ (0, E.jsx)(R, {
			state: e,
			actions: n,
			page: i,
			view: "requests"
		})
	] }) : /* @__PURE__ */ (0, E.jsx)("section", {
		className: "card",
		children: /* @__PURE__ */ (0, E.jsx)(N, {
			title: "درخواستی در انتظار نیست",
			children: "درخواست تازه‌ای که نیاز به بررسی داشته باشد، اینجا نمایش داده می‌شود."
		})
	});
}
function V({ state: e, labels: t, actions: n }) {
	return e.conceptLoading ? /* @__PURE__ */ (0, E.jsx)("section", {
		className: "card",
		children: /* @__PURE__ */ (0, E.jsx)(M, {})
	}) : e.conceptError ? /* @__PURE__ */ (0, E.jsx)("section", {
		className: "card",
		children: /* @__PURE__ */ (0, E.jsx)(P, {
			error: e.conceptError,
			retry: n.loadConcepts
		})
	}) : /* @__PURE__ */ (0, E.jsxs)("section", {
		className: "card",
		children: [
			/* @__PURE__ */ (0, E.jsx)("header", {
				className: "card-head",
				children: /* @__PURE__ */ (0, E.jsxs)("div", { children: [/* @__PURE__ */ (0, E.jsx)("h2", { children: "تحلیل اولین پاسخ‌ها" }), /* @__PURE__ */ (0, E.jsx)("p", { children: "هر دانشجو در هر نسخه، یک بار شمرده می‌شود." })] })
			}),
			/* @__PURE__ */ (0, E.jsx)("div", {
				className: "card-content",
				children: e.concepts.length ? e.concepts.map((e) => /* @__PURE__ */ (0, E.jsxs)("div", {
					className: "question-line",
					children: [
						/* @__PURE__ */ (0, E.jsxs)("div", { children: [/* @__PURE__ */ (0, E.jsx)("strong", { children: e.skill || e.question_id }), /* @__PURE__ */ (0, E.jsxs)("p", { children: [
							t.noteLabel(e.lesson_id),
							" · نسخهٔ ",
							f(e.version),
							" · ",
							f(e.correct),
							" پاسخ درست از ",
							f(e.responses)
						] })] }),
						/* @__PURE__ */ (0, E.jsx)(j, {
							value: e.responses - e.correct,
							max: e.responses
						}),
						/* @__PURE__ */ (0, E.jsx)("button", {
							className: "btn small-btn",
							type: "button",
							onClick: () => n.question(e),
							children: "دیدن سؤال"
						})
					]
				}, e.lesson_id + ":" + e.version + ":" + e.question_id)) : /* @__PURE__ */ (0, E.jsx)("p", {
					className: "small muted",
					children: "هنوز پاسخی برای تحلیل وجود ندارد."
				})
			}),
			/* @__PURE__ */ (0, E.jsx)("p", {
				className: "legend-note",
				children: "خطای بیشتر می‌تواند از ابهام سؤال یا نیاز به توضیح دوباره باشد. این گزارش رتبه‌بندی دانشجویان نیست."
			})
		]
	});
}
function H(e) {
	let { state: t, labels: n, actions: r } = e, a = t.view;
	if (a === "requests") return /* @__PURE__ */ (0, E.jsx)(B, { ...e });
	if (a === "overview") return null;
	let o = t.overview?.labs || (t.pages.labs?.data?.rows[0])?.lab.missions || [], s = t.filters.labs.mission, c = o.find((e) => e.mission === s);
	return /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
		a === "attempts" && /* @__PURE__ */ (0, E.jsx)("div", {
			className: "request-actions instructor-segments",
			role: "group",
			"aria-label": "نوع گزارش آزمون",
			children: [["attempts", "ثبت‌های آزمون"], ["concepts", "تحلیل سؤال‌ها"]].map(([e, n]) => /* @__PURE__ */ (0, E.jsx)("button", {
				className: "btn " + (t.filters.attempts.section === e ? "primary" : ""),
				type: "button",
				"aria-pressed": t.filters.attempts.section === e,
				onClick: () => r.setSection(e),
				children: n
			}, e))
		}),
		a === "labs" && o.length > 0 && /* @__PURE__ */ (0, E.jsx)("div", {
			className: "lab-summary",
			role: "group",
			"aria-label": "فیلتر لابراتور",
			children: o.map((e) => /* @__PURE__ */ (0, E.jsxs)("button", {
				type: "button",
				"aria-pressed": s === e.mission,
				onClick: () => r.mission(e.mission),
				children: [
					/* @__PURE__ */ (0, E.jsx)("span", {
						className: "number-tag",
						children: String(e.ordinal ?? "").padStart(2, "0")
					}),
					/* @__PURE__ */ (0, E.jsx)("strong", { children: n.labTitle(e.mission, e.title) }),
					/* @__PURE__ */ (0, E.jsxs)("small", { children: [
						f(e.task_count),
						" مأموریت · ",
						/* @__PURE__ */ (0, E.jsxs)("bdi", { children: [p(e.maximum), " XP"] })
					] })
				]
			}, e.mission))
		}),
		a === "attempts" && t.filters.attempts.section === "concepts" ? /* @__PURE__ */ (0, E.jsx)(V, { ...e }) : /* @__PURE__ */ (0, E.jsxs)("section", {
			className: "card",
			children: [
				a === "labs" && /* @__PURE__ */ (0, E.jsxs)("header", {
					className: "card-head",
					children: [/* @__PURE__ */ (0, E.jsxs)("div", { children: [/* @__PURE__ */ (0, E.jsx)("h2", { children: s === "all" || !s ? "رشد در همهٔ لابراتورها" : n.labTitle(s, c?.title) }), /* @__PURE__ */ (0, E.jsx)("p", { children: "XP ثبت‌شده و مأموریت‌های کامل‌شده" })] }), s !== "all" && /* @__PURE__ */ (0, E.jsx)("button", {
						className: "quiet",
						type: "button",
						onClick: () => r.mission("all"),
						children: "همهٔ لابراتورها ←"
					})]
				}),
				/* @__PURE__ */ (0, E.jsx)(L, {
					...e,
					view: a
				}),
				/* @__PURE__ */ (0, E.jsx)(z, {
					...e,
					view: a
				}),
				a === "attempts" && /* @__PURE__ */ (0, E.jsx)("p", {
					className: "table-note",
					children: "همهٔ ثبت‌ها با صفحه‌بندی در دسترس‌اند؛ نمرهٔ آخر هر دانشجو از کل سوابق محاسبه می‌شود."
				})
			]
		}),
		a === "students" && /* @__PURE__ */ (0, E.jsxs)("p", {
			className: "overview-footnote",
			children: [/* @__PURE__ */ (0, E.jsx)(i, { name: "info" }), "آخرین ثبت آموزشی از آزمون یا بررسی لابراتور به دست می‌آید؛ نشانهٔ آخرین ورود یا مطالعهٔ یادداشت نیست."]
		})
	] });
}
// frontend/instructor/Details.tsx
function U(e) {
	let t = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		let n = t.current;
		if (!e || !n) return;
		let r = n.ownerDocument, i = r.activeElement;
		return typeof n.showModal == "function" ? n.open || n.showModal() : n.setAttribute("open", ""), () => {
			n.open && (typeof n.close == "function" ? n.close() : n.removeAttribute("open")), i?.isConnected ? i.focus({ preventScroll: !0 }) : r.querySelector("[data-instructor-nav] [aria-current=\"page\"]")?.focus({ preventScroll: !0 });
		};
	}, [e]), t;
}
function W(e) {
	if (e.target !== e.currentTarget) return !1;
	let t = e.currentTarget.getBoundingClientRect();
	return e.clientX < t.left || e.clientX > t.right || e.clientY < t.top || e.clientY > t.bottom;
}
function G({ history: e, user: t, labels: n, actions: r }) {
	return e.loading ? /* @__PURE__ */ (0, E.jsx)(M, { children: "در حال دریافت ثبت‌های آزمون…" }) : e.error || !e.data ? /* @__PURE__ */ (0, E.jsx)(P, {
		error: e.error,
		retry: () => void r.loadHistory()
	}) : /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [e.data.rows.length ? e.data.rows.map((e) => /* @__PURE__ */ (0, E.jsxs)("button", {
		className: "attempt-link",
		type: "button",
		onClick: () => void r.attempt(e.id, t),
		children: [/* @__PURE__ */ (0, E.jsxs)("span", { children: [
			n.noteLabel(e.lesson_id),
			" · نسخهٔ ",
			f(e.version),
			/* @__PURE__ */ (0, E.jsxs)("small", { children: [
				m(e.created_at),
				" · ",
				e.attempt_no === 1 ? "اولین ثبت" : "تلاش " + f(e.attempt_no)
			] })
		] }), /* @__PURE__ */ (0, E.jsxs)("span", { children: [/* @__PURE__ */ (0, E.jsx)(k, { score: e }), " ←"] })]
	}, e.id)) : /* @__PURE__ */ (0, E.jsx)("p", {
		className: "small muted",
		children: "هنوز آزمونی ثبت نشده است."
	}), /* @__PURE__ */ (0, E.jsxs)("div", {
		className: "pages instructor-history-pages",
		children: [
			/* @__PURE__ */ (0, E.jsx)("button", {
				className: "btn small-btn",
				type: "button",
				disabled: !e.index,
				onClick: () => r.historyPage(-1),
				children: "قبلی"
			}),
			/* @__PURE__ */ (0, E.jsxs)("span", {
				className: "small muted",
				children: ["صفحهٔ ", f(e.index + 1)]
			}),
			/* @__PURE__ */ (0, E.jsx)("button", {
				className: "btn small-btn",
				type: "button",
				disabled: !e.data.next_cursor,
				onClick: () => r.historyPage(1),
				children: "بعدی"
			})
		]
	})] });
}
function K({ sheet: e, labels: t, actions: n }) {
	let r = e.person;
	return e.error || !r ? /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)("h2", {
		id: "instructor-detail-title",
		children: e.kind === "request" ? "بررسی درخواست" : "پروندهٔ آموزشی دانشجو"
	}), e.error ? /* @__PURE__ */ (0, E.jsx)(P, {
		error: e.error,
		retry: () => void n.student(e.user, e.kind)
	}) : /* @__PURE__ */ (0, E.jsx)(M, { children: "در حال دریافت پرونده…" })] }) : /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
		/* @__PURE__ */ (0, E.jsx)("h2", {
			id: "instructor-detail-title",
			children: r.name || r.email || "دانشجو"
		}),
		/* @__PURE__ */ (0, E.jsx)("bdi", {
			className: "email",
			children: r.email
		}),
		/* @__PURE__ */ (0, E.jsxs)("div", {
			className: "sheet-meta",
			children: [/* @__PURE__ */ (0, E.jsx)(O, { status: r.status }), /* @__PURE__ */ (0, E.jsx)("span", {
				className: "small muted",
				children: e.kind === "request" ? "درخواست: " + m(r.requested_at) : "آخرین ثبت آموزشی: " + h(r.last_registered_at)
			})]
		}),
		e.kind === "request" ? /* @__PURE__ */ (0, E.jsxs)("section", {
			className: "sheet-section",
			children: [
				/* @__PURE__ */ (0, E.jsxs)("h3", { children: ["عضویت در ", t.courseTitle] }),
				/* @__PURE__ */ (0, E.jsx)("p", {
					className: "small muted",
					children: "با تأیید، دسترسی این حساب به محتوای کلاس فعال می‌شود."
				}),
				/* @__PURE__ */ (0, E.jsxs)("div", {
					className: "confirm-actions",
					children: [/* @__PURE__ */ (0, E.jsx)("button", {
						className: "btn",
						type: "button",
						onClick: n.closeSheet,
						children: "بررسی در فرصت دیگر"
					}), /* @__PURE__ */ (0, E.jsx)("button", {
						className: "btn primary",
						type: "button",
						disabled: r.status === "active",
						onClick: () => void n.askMembership(r.user_id),
						children: "تأیید دسترسی"
					})]
				})
			]
		}) : /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "sheet-stats",
				children: [/* @__PURE__ */ (0, E.jsxs)("div", {
					className: "sheet-stat",
					children: [/* @__PURE__ */ (0, E.jsx)("span", { children: "XP لابراتورها" }), /* @__PURE__ */ (0, E.jsx)("strong", { children: /* @__PURE__ */ (0, E.jsx)(A, { lab: r.lab }) })]
				}), /* @__PURE__ */ (0, E.jsxs)("div", {
					className: "sheet-stat",
					children: [/* @__PURE__ */ (0, E.jsx)("span", { children: "آخرین نمرهٔ آزمون" }), /* @__PURE__ */ (0, E.jsx)("strong", { children: /* @__PURE__ */ (0, E.jsx)(k, { score: r.latest_quiz }) })]
				})]
			}),
			/* @__PURE__ */ (0, E.jsxs)("section", {
				className: "sheet-section",
				children: [/* @__PURE__ */ (0, E.jsx)("h3", { children: "مسیر لابراتورها" }), r.lab.missions.length ? r.lab.missions.map((e) => {
					let n = e.completed || [], r = t.course?.lessons.find((t) => t.lab?.mission === e.mission)?.lab_steps || [];
					return /* @__PURE__ */ (0, E.jsxs)("div", {
						className: "sheet-progress",
						children: [
							/* @__PURE__ */ (0, E.jsxs)("div", {
								className: "progress-line",
								children: [/* @__PURE__ */ (0, E.jsx)("strong", { children: t.labTitle(e.mission, e.title) }), /* @__PURE__ */ (0, E.jsxs)("small", { children: [
									f(n.length),
									" از ",
									f(e.task_count),
									" · ",
									/* @__PURE__ */ (0, E.jsxs)("bdi", {
										className: "mono",
										children: [p(e.xp), " XP"]
									})
								] })]
							}),
							/* @__PURE__ */ (0, E.jsx)(j, {
								value: n.length,
								max: e.task_count
							}),
							!!e.tasks?.length && /* @__PURE__ */ (0, E.jsxs)("details", {
								className: "instructor-task-details",
								children: [/* @__PURE__ */ (0, E.jsx)("summary", { children: "مأموریت‌ها" }), /* @__PURE__ */ (0, E.jsx)("ul", { children: e.tasks.map((e) => /* @__PURE__ */ (0, E.jsxs)("li", { children: [
									/* @__PURE__ */ (0, E.jsx)("span", {
										"aria-hidden": "true",
										children: n.includes(e.id) ? "✓" : "○"
									}),
									" ",
									r.find((t) => t.id === e.id)?.title || "مأموریت " + f(e.position),
									n.includes(e.id) && /* @__PURE__ */ (0, E.jsx)("span", {
										className: "small muted",
										children: " · انجام‌شده"
									})
								] }, e.id)) })]
							})
						]
					}, e.mission);
				}) : /* @__PURE__ */ (0, E.jsx)("p", {
					className: "small muted",
					children: "هنوز پیشرفت لابراتوری در این گزارش نیست."
				})]
			}),
			/* @__PURE__ */ (0, E.jsxs)("section", {
				className: "sheet-section",
				children: [/* @__PURE__ */ (0, E.jsxs)("h3", { children: ["ثبت‌های آزمون", r.quiz_attempts == null ? "" : " · " + f(r.quiz_attempts) + " ثبت"] }), /* @__PURE__ */ (0, E.jsx)(G, {
					history: e.history,
					user: e.user,
					labels: t,
					actions: n
				})]
			}),
			/* @__PURE__ */ (0, E.jsx)("section", {
				className: "sheet-section",
				children: /* @__PURE__ */ (0, E.jsx)("button", {
					className: "btn " + (r.status === "active" ? "danger" : ""),
					type: "button",
					onClick: () => void n.askMembership(r.user_id),
					children: r.status === "active" ? "غیرفعال‌کردن دسترسی" : "فعال‌کردن دسترسی"
				})
			})
		] })
	] });
}
function q({ figure: e }) {
	let t = (e) => Array.isArray(e) && e.length === 2 && e.every(Number.isFinite);
	return (e?.type === "distance2d" ? t(e.u) && t(e.v) : e?.type === "knn2d" && t(e.query) && Array.isArray(e.points) && e.points.every((e) => e && typeof e.id == "string" && t(e.x) && (e.y === 0 || e.y === 1))) && e ? /* @__PURE__ */ (0, E.jsx)("div", {
		className: "instructor-question-figure",
		children: /* @__PURE__ */ (0, E.jsx)(c, { figure: e })
	}) : null;
}
function J({ code: e, blanks: t }) {
	return e ? /* @__PURE__ */ (0, E.jsxs)("div", {
		className: "instructor-code",
		children: [/* @__PURE__ */ (0, E.jsx)("span", { children: "Python" }), /* @__PURE__ */ (0, E.jsx)(a, {
			code: e,
			blanks: t || []
		})]
	}) : null;
}
function Y({ receipt: e }) {
	let t = new Map(e.prompts?.map((e) => [e.id, e]));
	return e.result.items?.length ? /* @__PURE__ */ (0, E.jsx)(E.Fragment, { children: e.result.items.map((n, r) => {
		let i = t.get(n.id), a = e.answers?.[n.id], c = n.parts || [], l = typeof a == "string" ? i?.options?.find(([e]) => e === a)?.[1] || a : "پاسخی ثبت نشده بود.", u = i?.options?.find(([e]) => e === n.key)?.[1], d = n.correct ? "درست" : Number(n.score) > 0 ? "بخشی درست" : "نادرست";
		return /* @__PURE__ */ (0, E.jsxs)("article", {
			className: "answer",
			children: [
				/* @__PURE__ */ (0, E.jsxs)("header", { children: [/* @__PURE__ */ (0, E.jsxs)("span", { children: [
					"سؤال ",
					f(r + 1),
					" · ",
					n.skill || n.id
				] }), /* @__PURE__ */ (0, E.jsxs)("span", {
					className: "pill " + (n.correct ? "" : "pending"),
					children: [
						d,
						" · ",
						/* @__PURE__ */ (0, E.jsx)(k, { score: n })
					]
				})] }),
				i ? /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
					/* @__PURE__ */ (0, E.jsx)("p", { children: /* @__PURE__ */ (0, E.jsx)(s, { text: i.stem }) }),
					/* @__PURE__ */ (0, E.jsx)(q, { figure: i.figure }),
					/* @__PURE__ */ (0, E.jsx)(J, {
						code: i.code,
						blanks: i.blanks
					})
				] }) : /* @__PURE__ */ (0, E.jsx)("p", {
					className: "small muted",
					children: "متن این نسخهٔ سؤال در دسترس نیست؛ نتیجهٔ ثبت‌شده حفظ شده است."
				}),
				c.length ? /* @__PURE__ */ (0, E.jsx)("div", {
					className: "table-scroll",
					children: /* @__PURE__ */ (0, E.jsxs)("table", {
						className: "instructor-answer-table",
						children: [
							/* @__PURE__ */ (0, E.jsx)("caption", { children: "پاسخ هر جای خالی" }),
							/* @__PURE__ */ (0, E.jsx)("thead", { children: /* @__PURE__ */ (0, E.jsx)("tr", { children: [
								"جای خالی",
								"پاسخ دانشجو",
								"نتیجه",
								"پاسخ پذیرفته‌شده"
							].map((e) => /* @__PURE__ */ (0, E.jsx)("th", {
								scope: "col",
								children: e
							}, e)) }) }),
							/* @__PURE__ */ (0, E.jsx)("tbody", { children: c.map((e, t) => {
								let n = (e.accepted || []).map((t) => i?.blanks?.find((t) => t.id === e.id)?.input_kind === "stringLiteral" ? JSON.stringify(t) : t).join(" / ");
								return /* @__PURE__ */ (0, E.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, E.jsx)("th", {
										scope: "row",
										children: o(t)
									}),
									/* @__PURE__ */ (0, E.jsx)("td", { children: /* @__PURE__ */ (0, E.jsx)("bdi", {
										dir: "ltr",
										children: a && typeof a == "object" ? a[e.id] ?? "—" : "—"
									}) }),
									/* @__PURE__ */ (0, E.jsx)("td", { children: e.correct ? "درست" : "نادرست" }),
									/* @__PURE__ */ (0, E.jsx)("td", { children: /* @__PURE__ */ (0, E.jsx)("bdi", {
										dir: "ltr",
										children: n
									}) })
								] }, e.id);
							}) })
						]
					})
				}) : /* @__PURE__ */ (0, E.jsxs)("dl", { children: [
					/* @__PURE__ */ (0, E.jsx)("dt", { children: "پاسخ دانشجو" }),
					/* @__PURE__ */ (0, E.jsx)("dd", { children: /* @__PURE__ */ (0, E.jsx)(s, { text: l }) }),
					u && /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)("dt", { children: "پاسخ معیار" }), /* @__PURE__ */ (0, E.jsx)("dd", { children: /* @__PURE__ */ (0, E.jsx)(s, { text: u }) })] })
				] }),
				/* @__PURE__ */ (0, E.jsx)("p", {
					className: "small muted top-gap",
					children: /* @__PURE__ */ (0, E.jsx)(s, { text: n.explanation })
				}),
				n.selected_feedback && /* @__PURE__ */ (0, E.jsx)("p", {
					className: "small muted",
					children: /* @__PURE__ */ (0, E.jsx)(s, { text: n.selected_feedback })
				})
			]
		}, n.id);
	}) }) : /* @__PURE__ */ (0, E.jsx)("p", {
		className: "small muted",
		children: "جزئیات پاسخ‌های این ثبت در دسترس نیست."
	});
}
function X({ sheet: e, labels: t, actions: n }) {
	let r = e.record;
	return /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
		e.from && /* @__PURE__ */ (0, E.jsx)("button", {
			className: "quiet sheet-back",
			type: "button",
			onClick: () => void n.student(e.from),
			children: "→ بازگشت به دانشجو"
		}),
		/* @__PURE__ */ (0, E.jsx)("h2", {
			id: "instructor-detail-title",
			children: "بررسی پاسخ آزمون"
		}),
		e.error ? /* @__PURE__ */ (0, E.jsx)(P, {
			error: e.error,
			retry: () => void n.attempt(e.id, e.from)
		}) : r ? /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
			/* @__PURE__ */ (0, E.jsx)("p", {
				className: "small muted",
				children: t.lessonInfo(r.lesson_id)?.title || e.row?.title || r.lesson_id
			}),
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "sheet-meta",
				children: [
					e.row?.name && /* @__PURE__ */ (0, E.jsx)("span", { children: e.row.name }),
					/* @__PURE__ */ (0, E.jsxs)("span", {
						className: "pill",
						children: ["نسخهٔ ", f(r.version)]
					}),
					/* @__PURE__ */ (0, E.jsx)("span", {
						className: "pill off",
						children: Number(r.attempt_no) === 1 ? "اولین ثبت نهایی" : "تلاش " + f(r.attempt_no)
					})
				]
			}),
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "sheet-stats",
				children: [/* @__PURE__ */ (0, E.jsxs)("div", {
					className: "sheet-stat",
					children: [/* @__PURE__ */ (0, E.jsx)("span", { children: "نمرهٔ همین ثبت" }), /* @__PURE__ */ (0, E.jsx)("strong", { children: /* @__PURE__ */ (0, E.jsx)(k, { score: r.result }) })]
				}), /* @__PURE__ */ (0, E.jsxs)("div", {
					className: "sheet-stat",
					children: [/* @__PURE__ */ (0, E.jsx)("span", { children: "زمان ثبت" }), /* @__PURE__ */ (0, E.jsx)("strong", {
						className: "instructor-date",
						children: m(r.created_at, !0)
					})]
				})]
			}),
			/* @__PURE__ */ (0, E.jsxs)("section", {
				className: "sheet-section",
				children: [/* @__PURE__ */ (0, E.jsx)("h3", { children: "پاسخ‌های ثبت‌شده" }), /* @__PURE__ */ (0, E.jsx)(Y, { receipt: r })]
			})
		] }) : /* @__PURE__ */ (0, E.jsx)(M, { children: "در حال دریافت پاسخ‌ها…" })
	] });
}
function Z({ concept: e, labels: t }) {
	let n = Object.entries(e.choice_counts || {}).sort((e, t) => t[1] - e[1]);
	return /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
		/* @__PURE__ */ (0, E.jsx)("h2", {
			id: "instructor-detail-title",
			children: e.skill || e.question_id
		}),
		/* @__PURE__ */ (0, E.jsxs)("p", {
			className: "small muted top-gap",
			children: [
				t.noteLabel(e.lesson_id),
				" · نسخهٔ ",
				f(e.version),
				" · اولین ثبت نهایی"
			]
		}),
		/* @__PURE__ */ (0, E.jsxs)("section", {
			className: "sheet-section",
			children: [
				/* @__PURE__ */ (0, E.jsx)("p", { children: /* @__PURE__ */ (0, E.jsx)(s, { text: e.stem || "متن سؤال در دسترس نیست." }) }),
				/* @__PURE__ */ (0, E.jsx)(q, { figure: e.figure }),
				/* @__PURE__ */ (0, E.jsx)(J, {
					code: e.code,
					blanks: e.blanks
				}),
				/* @__PURE__ */ (0, E.jsxs)("div", {
					className: "sheet-stats top-gap",
					children: [/* @__PURE__ */ (0, E.jsxs)("div", {
						className: "sheet-stat",
						children: [/* @__PURE__ */ (0, E.jsx)("span", { children: "تعداد پاسخ‌ها" }), /* @__PURE__ */ (0, E.jsx)("strong", { children: f(e.responses) })]
					}), /* @__PURE__ */ (0, E.jsxs)("div", {
						className: "sheet-stat",
						children: [/* @__PURE__ */ (0, E.jsx)("span", { children: "پاسخ کاملِ درست" }), /* @__PURE__ */ (0, E.jsx)("strong", { children: f(e.correct) })]
					})]
				}),
				n.length ? /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)("h3", {
					className: "top-gap",
					children: "گزینه‌های انتخاب‌شده"
				}), n.map(([t, n]) => /* @__PURE__ */ (0, E.jsxs)("div", {
					className: "answer",
					children: [/* @__PURE__ */ (0, E.jsx)("p", { children: /* @__PURE__ */ (0, E.jsx)(s, { text: e.options?.find(([e]) => e === t)?.[1] || t }) }), /* @__PURE__ */ (0, E.jsxs)("small", { children: [f(n), " پاسخ"] })]
				}, t))] }) : /* @__PURE__ */ (0, E.jsx)("p", {
					className: "small muted top-gap",
					children: "برای سؤال‌های جای خالی، جزئیات هر پاسخ در ثبت آزمون قابل بررسی است."
				})
			]
		})
	] });
}
function Q({ sheet: e, confirmation: t, actions: n, labels: r }) {
	let a = U(!!e), o = U(!!t), s = e?.kind === "attempt" ? "attempt:" + e.id : e && "user" in e ? e.kind + ":" + e.user : e?.kind;
	(0, l.useEffect)(() => {
		a.current && (a.current.scrollTop = 0);
	}, [s, a]);
	let c = e?.kind === "attempt" ? "بررسی پاسخ آزمون" : e?.kind === "question" ? "تحلیل سؤال" : e?.kind === "request" ? "بررسی درخواست" : "پروندهٔ آموزشی دانشجو", u = t?.status === "active";
	return /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)("dialog", {
		ref: a,
		className: "instructor-detail",
		"data-detail": "",
		"aria-labelledby": "instructor-detail-title",
		onCancel: (e) => {
			e.preventDefault(), n.closeSheet();
		},
		onClose: (t) => {
			e && !t.currentTarget.open && n.closeSheet();
		},
		onClick: (e) => {
			W(e) && n.closeSheet();
		},
		children: e && /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsxs)("header", {
			className: "sheet-head",
			children: [/* @__PURE__ */ (0, E.jsx)("span", { children: c }), /* @__PURE__ */ (0, E.jsx)("button", {
				className: "icon-btn",
				type: "button",
				"aria-label": "بستن جزئیات",
				onClick: n.closeSheet,
				children: /* @__PURE__ */ (0, E.jsx)(i, { name: "close" })
			})]
		}), /* @__PURE__ */ (0, E.jsx)("div", {
			className: "sheet-body",
			children: e.kind === "attempt" ? /* @__PURE__ */ (0, E.jsx)(X, {
				sheet: e,
				labels: r,
				actions: n
			}) : e.kind === "question" ? /* @__PURE__ */ (0, E.jsx)(Z, {
				concept: e.question,
				labels: r
			}) : /* @__PURE__ */ (0, E.jsx)(K, {
				sheet: e,
				labels: r,
				actions: n
			})
		})] })
	}), /* @__PURE__ */ (0, E.jsx)("dialog", {
		ref: o,
		className: "confirm",
		"data-confirmation": "",
		"aria-labelledby": "instructor-confirm-title",
		onCancel: (e) => {
			e.preventDefault(), n.cancelConfirmation();
		},
		onClose: (e) => {
			t && !e.currentTarget.open && n.cancelConfirmation();
		},
		onClick: (e) => {
			W(e) && n.cancelConfirmation();
		},
		children: t && /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
			/* @__PURE__ */ (0, E.jsx)("h2", {
				id: "instructor-confirm-title",
				children: u ? "تأیید دسترسی به کلاس" : "غیرفعال‌کردن دسترسی"
			}),
			/* @__PURE__ */ (0, E.jsxs)("p", { children: [
				t.name,
				/* @__PURE__ */ (0, E.jsx)("br", {}),
				/* @__PURE__ */ (0, E.jsx)("bdi", { children: t.email })
			] }),
			/* @__PURE__ */ (0, E.jsx)("p", { children: u ? "این حساب به محتوای کلاس دسترسی خواهد داشت." : "دسترسی این حساب متوقف می‌شود؛ نمره‌ها، XP و کارهای قبلی حفظ می‌شوند." }),
			t.error ? /* @__PURE__ */ (0, E.jsx)("p", {
				role: "alert",
				children: C(t.error)
			}) : null,
			t.busy && /* @__PURE__ */ (0, E.jsx)("p", {
				role: "status",
				children: "در حال ثبت وضعیت…"
			}),
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "confirm-actions",
				children: [/* @__PURE__ */ (0, E.jsx)("button", {
					className: "btn",
					type: "button",
					disabled: t.busy,
					onClick: n.cancelConfirmation,
					children: "انصراف"
				}), /* @__PURE__ */ (0, E.jsx)("button", {
					className: "btn " + (u ? "primary" : "danger"),
					type: "button",
					disabled: t.busy,
					onClick: () => void n.commitMembership(),
					children: u ? "تأیید دسترسی" : "غیرفعال‌کردن"
				})]
			})
		] })
	})] });
}
// frontend/instructor/controller.ts
function re(e, t) {
	let { courses: n, catalog: r, rpc: i } = e, a = ee(e.isCurrent), o = /* @__PURE__ */ new Set(), s, c, l = {
		course: n[0].course_id,
		view: "overview",
		overviewLoading: !0,
		filters: g(),
		pages: {},
		concepts: [],
		conceptLoading: !1,
		mutating: !1,
		exporting: !1,
		exportProgress: "",
		toast: ""
	};
	function u(e) {
		a.current() && (l = {
			...l,
			...e
		}, o.forEach((e) => e()));
	}
	let p = () => l.overview?.lessons || r.find((e) => e.id === l.course)?.lessons || [], m = (e) => e === "attempts" ? "classroom_instructor_attempts" : "classroom_instructor_students", h = () => ({
		index: 0,
		cursors: [null],
		asOf: null,
		loading: !0
	}), v = (e, t) => u({ pages: {
		...l.pages,
		[e]: t
	} }), x = (e, t, n = !1) => {
		let r = {
			...l.filters[e],
			...t
		};
		n && _(r), u({ filters: {
			...l.filters,
			[e]: r
		} });
	}, E = (e) => u({ sheet: e });
	function D(e) {
		clearTimeout(c), u({ toast: e }), c = setTimeout(() => u({ toast: "" }), 6e3);
	}
	function O(e) {
		return /TEACHER_REQUIRED|CLASS_ACCESS_REQUIRED/.test(String(e?.message ?? "")) ? (a.invalidate(), clearTimeout(s), clearTimeout(c), u({
			overview: void 0,
			pages: {},
			concepts: [],
			sheet: void 0,
			confirmation: void 0,
			exporting: !1,
			exportProgress: "",
			mutating: !1,
			toast: "",
			accessError: e
		}), !0) : !1;
	}
	async function k() {
		if (!a.current() || l.accessError) return;
		let e = a.ticket("overview"), t = l.course;
		u({ overviewLoading: !0 });
		try {
			let n = te(await i("classroom_instructor_overview", { p_course: t }));
			e() && u({
				overview: n,
				overviewError: void 0,
				overviewLoading: !1
			});
		} catch (t) {
			e() && !O(t) && u({
				overviewError: t,
				overviewLoading: !1
			});
		}
	}
	async function A(e) {
		if (!a.current() || l.accessError) return;
		clearTimeout(s);
		let t = a.ticket("list-" + e), n = S(e, l.course, l.filters[e]);
		v(e, { loading: !0 });
		try {
			let r = y(await i(m(e), n));
			if (!t()) return;
			e !== "attempts" && r.rows.forEach(b), r.as_of && x(e, { asOf: r.as_of }), v(e, { data: r });
		} catch (n) {
			t() && !O(n) && v(e, { error: n });
		}
	}
	async function j() {
		if (!a.current() || l.accessError) return;
		let e = a.ticket("concepts");
		u({
			conceptLoading: !0,
			conceptError: void 0
		});
		try {
			let t = await i("classroom_instructor_questions", { p_course: l.course });
			if (!e()) return;
			if (!Array.isArray(t)) throw Error("INVALID_INSTRUCTOR_RESPONSE");
			u({
				concepts: t,
				conceptLoading: !1
			});
		} catch (t) {
			e() && !O(t) && u({
				conceptError: t,
				conceptLoading: !1
			});
		}
	}
	function M() {
		return clearTimeout(s), l.view === "overview" ? k() : l.view === "attempts" && l.filters.attempts.section === "concepts" ? j() : A(l.view);
	}
	function N() {
		a.cancel("export"), u({
			exporting: !1,
			exportProgress: ""
		});
	}
	function P(e) {
		!d.some(([t]) => t === e) || l.mutating || l.accessError || e === l.view || (clearTimeout(s), N(), u({ view: e }), M());
	}
	function F(e) {
		n.some((t) => t.course_id === e) && e !== l.course && !l.mutating && (clearTimeout(s), clearTimeout(c), a.invalidate(), u({
			course: e,
			overview: void 0,
			overviewError: void 0,
			overviewLoading: !0,
			filters: g(),
			pages: {},
			concepts: [],
			conceptError: void 0,
			conceptLoading: !1,
			sheet: void 0,
			confirmation: void 0,
			exporting: !1,
			exportProgress: "",
			mutating: !1,
			accessError: void 0,
			toast: ""
		}), k(), l.view !== "overview" && M());
	}
	function I(e, t = !0) {
		if (l.view === "overview" || l.view === "requests" || l.accessError) return;
		let n = l.view;
		a.cancel("list-" + n), N(), clearTimeout(s), x(n, { query: e.slice(0, 120) }, !0), t && (s = setTimeout(() => {
			a.current() && l.view === n && A(n);
		}, 250));
	}
	function L(e, t) {
		let n = l.view;
		n !== "overview" && (N(), x(n, { [e]: e === "lesson" ? t || null : t }, !0), M());
	}
	function R(e) {
		N(), x("attempts", { section: e }), l.view === "attempts" ? M() : P("attempts");
	}
	function z(e) {
		N(), x("labs", { mission: e });
	}
	function B(e) {
		let t = l.view;
		if (t === "overview") return;
		let n = l.filters[t], r = l.pages[t]?.data?.next_cursor;
		if (l.pages[t]?.loading || e > 0 && !r || e < 0 && !n.index) return;
		let i = n.cursors.slice(), a = n.index + e;
		e > 0 && (i[a] = r), x(t, {
			cursors: i,
			index: a
		}), A(t);
	}
	function V() {
		if (N(), l.view === "overview") return k();
		if (!l.accessError) return x(l.view, {}, !0), Promise.allSettled([k(), M()]);
	}
	function H() {
		l.mutating || (a.cancel("sheet"), a.cancel("history"), a.cancel("prepare-member"), E());
	}
	async function U(e) {
		let t = l.sheet;
		if (t?.kind !== "student") return;
		let n = a.ticket("history"), r = l.course, o = t.user, s = e || t.history;
		E({
			...t,
			history: {
				...s,
				loading: !0,
				error: void 0
			}
		});
		let c = () => n() && l.sheet?.kind === "student" && l.sheet.user === o;
		try {
			let e = y(await i("classroom_instructor_attempts", {
				p_course: r,
				p_user: o,
				p_limit: 5,
				p_after: s.cursors[s.index],
				p_as_of: s.asOf
			}));
			c() && E({
				...t,
				history: {
					...s,
					data: e,
					loading: !1,
					error: void 0,
					asOf: e.as_of
				}
			});
		} catch (e) {
			c() && !O(e) && E({
				...t,
				history: {
					...s,
					loading: !1,
					error: e
				}
			});
		}
	}
	function W(e) {
		let t = l.sheet;
		if (t?.kind !== "student" || t.history.loading) return;
		let n = t.history, r = n.data?.next_cursor;
		if (e > 0 && !r || e < 0 && !n.index) return;
		let i = n.cursors.slice(), a = n.index + e;
		e > 0 && (i[a] = r), U({
			...n,
			cursors: i,
			index: a
		});
	}
	async function G(e, t = "student") {
		if (!a.current() || l.accessError) return;
		a.cancel("history");
		let n = a.ticket("sheet"), r = {
			kind: t,
			user: e,
			history: h()
		};
		E(r);
		try {
			let a = b(await i("classroom_instructor_student", {
				p_course: l.course,
				p_user: e
			}));
			if (!n()) return;
			E({
				...r,
				person: a
			}), t === "student" && U();
		} catch (e) {
			n() && !O(e) && E({
				...r,
				error: e
			});
		}
	}
	async function K(e, t) {
		if (!a.current() || l.accessError) return;
		let n = l.pages.attempts?.data?.rows, r = l.sheet?.kind === "student" ? l.sheet.history.data?.rows : void 0, o = n?.find((t) => t.id === e) || r?.find((t) => t.id === e);
		a.cancel("history");
		let s = a.ticket("sheet"), c = {
			kind: "attempt",
			id: e,
			from: t,
			row: o
		};
		E(c);
		try {
			let t = await i("classroom_attempt", { p_id: e });
			if (!s()) return;
			if (!t?.result || !t.lesson_id || !p().some((e) => e.id === t.lesson_id)) throw Error("INVALID_INSTRUCTOR_RESPONSE");
			E({
				...c,
				record: t
			});
		} catch (e) {
			s() && !O(e) && E({
				...c,
				error: e
			});
		}
	}
	function q(e) {
		a.cancel("sheet"), a.cancel("history"), E({
			kind: "question",
			question: e
		});
	}
	function J(e) {
		let t = l.sheet;
		return (t?.kind === "student" || t?.kind === "request") && t.person?.user_id === e ? t.person : Object.values(l.pages).flatMap((e) => e?.data?.rows ?? []).find((t) => "user_id" in t && t.user_id === e && !!t.status);
	}
	async function Y(e) {
		if (!a.current() || l.mutating || l.accessError) return;
		let t = a.ticket("prepare-member"), n = l.course, r = J(e);
		r || (await G(e, "request"), r = J(e)), t() && n === l.course && r && u({ confirmation: {
			course: n,
			user: e,
			status: r.status === "active" ? "suspended" : "active",
			name: r.name,
			email: r.email,
			busy: !1
		} });
	}
	function X() {
		l.confirmation?.busy || u({ confirmation: void 0 });
	}
	async function Z() {
		let e = l.confirmation;
		if (!e || e.busy || e.course !== l.course || !a.current()) return;
		let t = a.ticket("membership");
		u({
			mutating: !0,
			confirmation: {
				...e,
				busy: !0,
				error: void 0
			}
		});
		try {
			if (await i("classroom_membership", {
				p_course: e.course,
				p_user: e.user,
				p_status: e.status
			}), !t()) return;
			let n = { ...l.filters };
			for (let e of Object.keys(n)) n[e] = { ...n[e] }, _(n[e]);
			u({
				mutating: !1,
				confirmation: void 0,
				filters: n,
				pages: {},
				overviewError: void 0
			}), H(), D("دسترسی " + (e.name || "دانشجو") + " " + (e.status === "active" ? "فعال" : "غیرفعال") + " شد."), l.view === "overview" ? await k() : await Promise.allSettled([k(), M()]);
		} catch (n) {
			t() && !O(n) && u({
				mutating: !1,
				confirmation: {
					...e,
					busy: !1,
					error: n
				}
			});
		}
	}
	async function Q() {
		let e = l.view;
		if (l.exporting || l.accessError || e === "overview" || e === "requests" || e === "attempts" && l.filters.attempts.section === "concepts") return;
		let n = a.ticket("export"), r = {
			...l.filters[e],
			index: 0,
			cursors: [null]
		};
		u({
			exporting: !0,
			exportProgress: "در حال دریافت همهٔ ردیف‌های فیلترشده…"
		});
		try {
			let a = await T((t) => i(m(e), t), S(e, l.course, r, 100), {
				alive: n,
				onProgress: (e, t) => {
					n() && u({ exportProgress: f(e) + " از " + f(t) + " ردیف دریافت شد." });
				}
			});
			if (!n()) return;
			t("classroom-" + e + "-" + (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) + ".csv", ne(w(e, a, r.mission))), D("CSV شامل " + f(a.length) + " ردیف فیلترشده آماده شد.");
		} catch (e) {
			n() && !O(e) && D(C(e));
		} finally {
			n() && u({
				exporting: !1,
				exportProgress: ""
			});
		}
	}
	return {
		getSnapshot: () => l,
		subscribe(e) {
			return o.add(e), () => o.delete(e);
		},
		loadOverview: k,
		navigate: P,
		changeCourse: F,
		query: I,
		changeFilter: L,
		setSection: R,
		mission: z,
		page: B,
		refresh: V,
		closeSheet: H,
		student: G,
		attempt: K,
		question: q,
		askMembership: Y,
		commitMembership: Z,
		cancelConfirmation: X,
		exportCSV: Q,
		historyPage: W,
		loadHistory: U,
		loadConcepts: j,
		clearQuery() {
			I("", !1), l.view !== "overview" && A(l.view);
		},
		dispose() {
			a.dispose(), clearTimeout(s), clearTimeout(c), o.clear();
		}
	};
}
// frontend/instructor/mount.tsx
var $ = [
	{
		id: "overview",
		icon: "dashboard",
		name: "نمای کلی",
		title: "نمای کلی کلاس",
		description: "درخواست‌های منتظر، پیشرفت کلاس و موضوعات نیازمند مرور را ببینید."
	},
	{
		id: "students",
		icon: "user",
		name: "دانشجویان",
		title: "دانشجویان",
		description: "دسترسی، آخرین نتیجه و پیشرفت لابراتور هر دانشجو را بررسی کنید."
	},
	{
		id: "attempts",
		icon: "quiz",
		name: "آزمون‌ها",
		title: "آزمون‌ها",
		description: "پاسخ‌های ثبت‌شده و سؤال‌های نیازمند توضیح دوباره را ببینید."
	},
	{
		id: "labs",
		icon: "lab",
		name: "لابراتورها",
		title: "لابراتورها",
		description: "پیشرفت مأموریت‌ها را با XP ثبت‌شده دنبال کنید."
	},
	{
		id: "requests",
		icon: "bell",
		name: "درخواست‌ها",
		title: "درخواست‌های عضویت",
		description: "مشخصات حساب‌های تازه را بررسی کنید و دربارهٔ دسترسی تصمیم بگیرید."
	}
];
function ie({ controller: e, options: t }) {
	let n = (0, l.useSyncExternalStore)(e.subscribe, e.getSnapshot), r = F(n, t.courses, t.catalog), a = $.find((e) => e.id === n.view), o = (0, l.useRef)(null), s = (0, l.useRef)(n.view);
	(0, l.useEffect)(() => {
		s.current !== n.view && o.current?.focus({ preventScroll: !0 }), s.current = n.view;
	}, [n.view]);
	let c = [
		"students",
		"attempts",
		"labs"
	].includes(n.view) && (n.view !== "attempts" || n.filters.attempts.section !== "concepts"), u = n.view === "overview" ? n.overviewLoading : n.pages[n.view]?.loading || n.conceptLoading;
	return /* @__PURE__ */ (0, E.jsxs)("div", {
		"data-react-instructor": "",
		className: "instructor-react",
		children: [
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "instructor-app",
				children: [/* @__PURE__ */ (0, E.jsxs)("aside", {
					className: "sidebar",
					children: [/* @__PURE__ */ (0, E.jsxs)("div", {
						className: "teacher-side-brand",
						children: [/* @__PURE__ */ (0, E.jsx)(i, { name: "dashboard" }), /* @__PURE__ */ (0, E.jsx)("span", { children: "پنل مدرس" })]
					}), /* @__PURE__ */ (0, E.jsx)("nav", {
						className: "side-nav",
						"aria-label": "بخش‌های پنل مدرس",
						"data-instructor-nav": "",
						children: $.map((t) => /* @__PURE__ */ (0, E.jsxs)("button", {
							type: "button",
							"data-view": t.id,
							"aria-current": t.id === n.view ? "page" : void 0,
							onClick: () => e.navigate(t.id),
							disabled: n.mutating || !!n.accessError,
							children: [
								/* @__PURE__ */ (0, E.jsx)(i, { name: t.icon }),
								/* @__PURE__ */ (0, E.jsx)("span", { children: t.name }),
								t.id === "requests" && !!n.overview?.stats.pending_students && /* @__PURE__ */ (0, E.jsx)("span", {
									className: "count",
									children: f(n.overview.stats.pending_students)
								})
							]
						}, t.id))
					})]
				}), /* @__PURE__ */ (0, E.jsxs)("section", {
					className: "content",
					"aria-label": "گزارش مدرس",
					children: [/* @__PURE__ */ (0, E.jsxs)("header", {
						className: "teacher-header",
						children: [
							/* @__PURE__ */ (0, E.jsxs)("div", {
								className: "teacher-context",
								children: [/* @__PURE__ */ (0, E.jsx)("div", {
									className: "teacher-course",
									children: t.courses.length > 1 ? /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)("label", {
										htmlFor: "instructor-course",
										children: "کلاس"
									}), /* @__PURE__ */ (0, E.jsx)("select", {
										id: "instructor-course",
										"data-course": "",
										value: n.course,
										disabled: n.mutating,
										onChange: (t) => e.changeCourse(t.target.value),
										children: t.courses.map((e) => /* @__PURE__ */ (0, E.jsx)("option", {
											value: e.course_id,
											children: e.title
										}, e.course_id))
									})] }) : /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)("span", {
										className: "teacher-course-label",
										children: "کلاس"
									}), /* @__PURE__ */ (0, E.jsx)("bdi", { children: r.courseTitle })] })
								}), n.overview?.server_now && /* @__PURE__ */ (0, E.jsxs)("span", {
									className: "teacher-refresh-time",
									children: ["آخرین دریافت: ", m(n.overview.server_now, !0)]
								})]
							}),
							/* @__PURE__ */ (0, E.jsxs)("div", {
								className: "page-heading",
								children: [/* @__PURE__ */ (0, E.jsxs)("div", { children: [/* @__PURE__ */ (0, E.jsx)("h1", {
									tabIndex: -1,
									ref: o,
									children: a.title
								}), /* @__PURE__ */ (0, E.jsx)("p", { children: a.description })] }), !n.accessError && /* @__PURE__ */ (0, E.jsxs)("div", {
									className: "heading-actions",
									children: [c && /* @__PURE__ */ (0, E.jsxs)("button", {
										className: "btn",
										type: "button",
										disabled: n.exporting || !!u,
										onClick: () => void e.exportCSV(),
										children: [/* @__PURE__ */ (0, E.jsx)(i, { name: "download" }), n.exporting ? "در حال آماده‌سازی…" : "دریافت CSV"]
									}), /* @__PURE__ */ (0, E.jsx)("button", {
										className: "btn",
										type: "button",
										disabled: n.mutating || !!u,
										onClick: () => void e.refresh(),
										children: u ? "در حال دریافت…" : "به‌روزرسانی"
									})]
								})]
							}),
							n.exporting && /* @__PURE__ */ (0, E.jsx)("p", {
								className: "small muted",
								role: "status",
								children: n.exportProgress
							})
						]
					}), n.accessError ? /* @__PURE__ */ (0, E.jsx)("section", {
						className: "card",
						children: /* @__PURE__ */ (0, E.jsx)(N, {
							title: "دسترسی مدرس تأیید نشد",
							action: /* @__PURE__ */ (0, E.jsx)("a", {
								className: "btn",
								href: t.url("dashboard/"),
								children: "داشبورد ←"
							}),
							children: C(n.accessError)
						})
					}) : n.view === "overview" ? /* @__PURE__ */ (0, E.jsx)(I, {
						state: n,
						labels: r,
						actions: e
					}) : /* @__PURE__ */ (0, E.jsx)(H, {
						state: n,
						labels: r,
						actions: e
					})]
				})]
			}),
			/* @__PURE__ */ (0, E.jsx)(Q, {
				sheet: n.sheet,
				confirmation: n.confirmation,
				labels: r,
				actions: e
			}),
			/* @__PURE__ */ (0, E.jsx)("div", {
				className: "toast",
				"data-instructor-toast": "",
				role: "status",
				hidden: !n.toast,
				children: n.toast
			})
		]
	});
}
function ae(e, t) {
	if (!t.courses.length) throw Error("TEACHER_REQUIRED");
	let n = e.ownerDocument, r = n.defaultView;
	if (!r) throw Error("INSTRUCTOR_WINDOW_UNAVAILABLE");
	let i = /* @__PURE__ */ new Map(), a = re({
		...t,
		isCurrent: () => e.isConnected && t.isCurrent()
	}, (e, t) => {
		let a = r.URL.createObjectURL(new r.Blob([t], { type: "text/csv;charset=utf-8" })), o = n.createElement("a");
		o.href = a, o.download = e, o.hidden = !0, n.body.append(o), o.click(), o.remove(), i.set(a, r.setTimeout(() => {
			r.URL.revokeObjectURL(a), i.delete(a);
		}, 3e3));
	}), o = (0, u.createRoot)(e, { identifierPrefix: "instructor-" });
	return o.render(/* @__PURE__ */ (0, E.jsx)(ie, {
		controller: a,
		options: t
	})), {
		ready: a.loadOverview(),
		dispose() {
			a.dispose();
			for (let [e, t] of i) r.clearTimeout(t), r.URL.revokeObjectURL(e);
			i.clear(), o.unmount();
		}
	};
}
export { ae as mountInstructor };
