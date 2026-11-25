import { a as e, i as t, n, t as r } from "./jsx-runtime-CMv_BHj2.mjs";
import { r as i } from "./runtime-D2U6pln4.mjs";
import { n as a, t as o } from "./MathText-BqcZI-To.mjs";
import { n as s, o as c, r as l } from "./QuizResult-CdyqSXHC.mjs";
import { t as u } from "./QuestionFigure-wq52USe_.mjs";
// web/assets/instructor-model.mjs
var d = /* @__PURE__ */ e(t(), 1), f = n(), p = [
	["overview", "نمای کلی"],
	["students", "دانشجویان"],
	["attempts", "آزمون‌ها"],
	["labs", "لابراتورها"],
	["requests", "درخواست‌ها"]
], m = (e) => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(Number(e)), h = (e) => new Intl.NumberFormat("en-US", {
	useGrouping: !1,
	maximumFractionDigits: 2
}).format(Number(e));
function g(e, t = !1) {
	return !e || !Number.isFinite(Date.parse(e)) ? "ثبت نشده" : new Intl.DateTimeFormat("fa-IR", {
		dateStyle: "medium",
		...t ? { timeStyle: "short" } : {},
		timeZone: "Asia/Tehran"
	}).format(new Date(e));
}
function _(e, t = Date.now()) {
	if (!e || !Number.isFinite(Date.parse(e))) return "ثبت نشده";
	let n = Math.floor(Math.max(0, t - Date.parse(e)) / 864e5);
	return n === 0 ? "امروز" : n === 1 ? "دیروز" : n < 14 ? m(n) + " روز پیش" : g(e);
}
function v() {
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
function y(e) {
	e.cursors = [null], e.index = 0, "asOf" in e && (e.asOf = null);
}
function b(e = () => !0) {
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
function x(e) {
	return typeof e == "number" && Number.isFinite(e) && e >= 0;
}
function S(e) {
	if (!e || !Array.isArray(e.rows) || !x(e.total) || e.rows.length > 100 || !(e.next_cursor === null || typeof e.next_cursor == "object" && !Array.isArray(e.next_cursor)) || !x(e.page_size) || e.page_size < 1) throw Error("INVALID_INSTRUCTOR_RESPONSE");
	return e;
}
function C(e) {
	if (e?.schema_version !== 1 || !e.stats || ![
		"active_students",
		"pending_students",
		"total_attempts"
	].every((t) => x(e.stats[t])) || !Array.isArray(e.labs) || !Array.isArray(e.pending) || !Array.isArray(e.concepts)) throw Error("INVALID_INSTRUCTOR_RESPONSE");
	return e;
}
function w(e) {
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
	].every((t) => x(e.lab[t])) || !Array.isArray(e.lab.missions)) throw Error("INVALID_INSTRUCTOR_RESPONSE");
	return e;
}
function T(e, t = "all") {
	if (t === "all") return e.lab;
	let n = e.lab.missions.find((e) => e.mission === t);
	return n ? {
		...n,
		completed: Array.isArray(n.completed) ? n.completed.length : n.completed_count
	} : null;
}
function E(e, t, n, r = 20) {
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
function D(e) {
	return /TEACHER_REQUIRED|CLASS_ACCESS_REQUIRED/.test(e?.message || "") ? "دسترسی مدرس برای این کلاس تأیید نشد. وضعیت حساب را بررسی کنید." : ["PGRST202", "42883"].includes(e?.code) && /classroom_instructor_/.test(e?.message || "") ? "نسخهٔ سرور پنل مدرس نیاز به به‌روزرسانی دارد." : /STUDENT_UNAVAILABLE/.test(e?.message || "") ? "این دانشجو دیگر در فهرست اعضای کلاس نیست. گزارش را به‌روزرسانی کنید." : /INSTRUCTOR_REPORT_CHANGED/.test(e?.message || "") ? "اطلاعات هنگام دریافت تغییر کرد؛ گزارش را به‌روزرسانی و دوباره امتحان کنید." : "دریافت یا ثبت اطلاعات کامل نشد. اتصال را بررسی کنید و دوباره تلاش کنید.";
}
function ee(e) {
	let t = (e) => {
		let t = String(e ?? "");
		return /^[\s\uFEFF]*[=+@-]/.test(t) && (t = "'" + t), "\"" + t.replace(/"/g, "\"\"") + "\"";
	};
	return "﻿" + e.map((e) => e.map(t).join(",")).join("\r\n");
}
function te(e, t, n = "all") {
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
		let t = T(e, n);
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
async function ne(e, t, { alive: n = () => !0, onProgress: r = () => {} } = {}) {
	let i = [], a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), s = {
		...t,
		p_after: null,
		p_limit: 100
	}, c = null;
	for (;;) {
		if (!n()) throw Error("INSTRUCTOR_EXPORT_CANCELLED");
		let t = S(await e(s));
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
var O = r();
function k({ person: e }) {
	return /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)("strong", { children: e.name || e.email || "دانشجو" }), e.email && /* @__PURE__ */ (0, O.jsx)("bdi", {
		className: "email",
		children: e.email
	})] });
}
function A({ status: e }) {
	return /* @__PURE__ */ (0, O.jsx)("span", {
		className: "pill " + (e === "pending" ? "pending" : e === "suspended" ? "off" : ""),
		children: {
			active: "دارای دسترسی",
			pending: "در انتظار",
			suspended: "بدون دسترسی"
		}[e] || "—"
	});
}
function j({ score: e }) {
	return e?.score != null && e.maximum != null && Number.isFinite(Number(e.score)) && Number.isFinite(Number(e.maximum)) ? /* @__PURE__ */ (0, O.jsxs)("bdi", {
		dir: "ltr",
		children: [
			m(e.score),
			" / ",
			m(e.maximum)
		]
	}) : /* @__PURE__ */ (0, O.jsx)(O.Fragment, { children: "—" });
}
function M({ lab: e }) {
	return e && e.maximum > 0 ? /* @__PURE__ */ (0, O.jsxs)("bdi", {
		className: "mono xp",
		dir: "ltr",
		children: [
			h(e.xp),
			" / ",
			h(e.maximum),
			" XP"
		]
	}) : /* @__PURE__ */ (0, O.jsx)(O.Fragment, { children: "—" });
}
function N({ value: e, max: t }) {
	let n = t > 0 ? Math.max(0, Math.min(100, e / t * 100)) : 0;
	return /* @__PURE__ */ (0, O.jsx)("div", {
		className: "bar",
		role: "img",
		"aria-label": m(e) + " از " + m(t),
		children: /* @__PURE__ */ (0, O.jsx)("i", { style: { width: n + "%" } })
	});
}
function P({ children: e = "در حال دریافت گزارش…" }) {
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "empty",
		role: "status",
		children: [/* @__PURE__ */ (0, O.jsx)("span", {
			className: "spinner",
			"aria-hidden": "true"
		}), e]
	});
}
function F({ title: e, children: t, action: n }) {
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "empty",
		children: [
			/* @__PURE__ */ (0, O.jsx)(i, { name: "note" }),
			/* @__PURE__ */ (0, O.jsx)("h2", { children: e }),
			/* @__PURE__ */ (0, O.jsx)("p", { children: t }),
			n
		]
	});
}
function I({ error: e, retry: t }) {
	return /* @__PURE__ */ (0, O.jsx)(F, {
		title: "گزارش دریافت نشد",
		action: /* @__PURE__ */ (0, O.jsx)("button", {
			className: "btn primary",
			type: "button",
			onClick: t,
			children: "دریافت دوباره"
		}),
		children: D(e)
	});
}
function L(e, t, n) {
	let r = n.find((t) => t.id === e.course), i = e.overview?.lessons || r?.lessons || [], a = (e) => i.find((t) => t.id === e) || r?.lessons.find((t) => t.id === e);
	return {
		course: r,
		lessons: i,
		lessonInfo: a,
		noteLabel: (e) => {
			let t = a(e);
			return t?.ordinal ? "یادداشت " + m(t.ordinal) : t?.number ? "یادداشت " + m(t.number) : t?.title || e;
		},
		courseTitle: t.find((t) => t.course_id === e.course)?.title || r?.display_title || r?.title || e.course,
		labTitle: (e, t) => r?.lessons.find((t) => t.lab?.mission === e)?.lab?.title || t || "لابراتور"
	};
}
// frontend/instructor/Overview.tsx
function R({ state: e, labels: t, actions: n }) {
	let r = e.overview;
	if (!r) return /* @__PURE__ */ (0, O.jsx)("section", {
		className: "card",
		children: e.overviewError ? /* @__PURE__ */ (0, O.jsx)(I, {
			error: e.overviewError,
			retry: n.loadOverview
		}) : /* @__PURE__ */ (0, O.jsx)(P, {})
	});
	let a = r.stats;
	return /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
		e.overviewError ? /* @__PURE__ */ (0, O.jsxs)("p", {
			className: "notice",
			role: "alert",
			children: [D(e.overviewError), " آخرین گزارش دریافت‌شده نمایش داده می‌شود."]
		}) : null,
		/* @__PURE__ */ (0, O.jsxs)("div", {
			className: "teacher-metrics",
			children: [
				/* @__PURE__ */ (0, O.jsxs)("button", {
					className: "teacher-metric",
					type: "button",
					onClick: () => n.navigate("students"),
					children: [
						/* @__PURE__ */ (0, O.jsxs)("span", {
							className: "teacher-metric-label",
							children: [/* @__PURE__ */ (0, O.jsx)(i, { name: "user" }), "دانشجوی دارای دسترسی"]
						}),
						/* @__PURE__ */ (0, O.jsx)("strong", { children: m(a.active_students) }),
						/* @__PURE__ */ (0, O.jsx)("small", { children: "مشاهدهٔ دانشجویان ←" })
					]
				}),
				/* @__PURE__ */ (0, O.jsxs)("button", {
					className: "teacher-metric",
					"data-tone": a.pending_students > 0 ? "attention" : void 0,
					type: "button",
					onClick: () => n.navigate("requests"),
					children: [
						/* @__PURE__ */ (0, O.jsxs)("span", {
							className: "teacher-metric-label",
							children: [/* @__PURE__ */ (0, O.jsx)(i, { name: "bell" }), "درخواست در انتظار"]
						}),
						/* @__PURE__ */ (0, O.jsx)("strong", { children: m(a.pending_students) }),
						/* @__PURE__ */ (0, O.jsx)("small", { children: "بررسی دسترسی‌ها ←" })
					]
				}),
				/* @__PURE__ */ (0, O.jsxs)("button", {
					className: "teacher-metric",
					type: "button",
					onClick: () => n.navigate("attempts"),
					children: [
						/* @__PURE__ */ (0, O.jsxs)("span", {
							className: "teacher-metric-label",
							children: [/* @__PURE__ */ (0, O.jsx)(i, { name: "quiz" }), "ثبت نهایی آزمون"]
						}),
						/* @__PURE__ */ (0, O.jsx)("strong", { children: m(a.total_attempts) }),
						/* @__PURE__ */ (0, O.jsx)("small", { children: "مشاهدهٔ ثبت‌ها ←" })
					]
				})
			]
		}),
		/* @__PURE__ */ (0, O.jsxs)("div", {
			className: "teacher-overview-grid",
			children: [/* @__PURE__ */ (0, O.jsxs)("section", {
				className: "card teacher-inbox",
				children: [/* @__PURE__ */ (0, O.jsx)("header", {
					className: "card-head",
					children: /* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("h2", { children: "درخواست‌های تازه" }), /* @__PURE__ */ (0, O.jsx)("p", { children: "پیش از تأیید، مشخصات حساب را بررسی کنید." })] })
				}), /* @__PURE__ */ (0, O.jsxs)("div", {
					className: "card-content",
					children: [r.pending.length ? r.pending.map((e) => /* @__PURE__ */ (0, O.jsxs)("div", {
						className: "pending-person",
						children: [
							/* @__PURE__ */ (0, O.jsx)("div", {
								className: "avatar",
								"aria-hidden": "true",
								children: (e.name || "د")[0]
							}),
							/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("strong", { children: e.name || "دانشجو" }), /* @__PURE__ */ (0, O.jsx)("small", { children: g(e.created_at) })] }),
							/* @__PURE__ */ (0, O.jsx)("button", {
								className: "btn small-btn",
								type: "button",
								onClick: () => void n.student(e.user_id, "request"),
								children: "بررسی"
							})
						]
					}, e.user_id)) : /* @__PURE__ */ (0, O.jsx)("p", {
						className: "small muted",
						children: "درخواستی در انتظار نیست."
					}), a.pending_students > 0 && /* @__PURE__ */ (0, O.jsx)("button", {
						className: "quiet teacher-card-link",
						type: "button",
						onClick: () => n.navigate("requests"),
						children: "همهٔ درخواست‌ها ←"
					})]
				})]
			}), /* @__PURE__ */ (0, O.jsxs)("section", {
				className: "card",
				children: [/* @__PURE__ */ (0, O.jsxs)("header", {
					className: "card-head",
					children: [/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("h2", { children: "پیشرفت لابراتورها" }), /* @__PURE__ */ (0, O.jsx)("p", { children: "تعداد دانشجویانی که همهٔ مأموریت‌ها را کامل کرده‌اند." })] }), /* @__PURE__ */ (0, O.jsx)("button", {
						className: "quiet",
						type: "button",
						onClick: () => n.navigate("labs"),
						children: "گزارش کامل ←"
					})]
				}), /* @__PURE__ */ (0, O.jsx)("div", {
					className: "card-content",
					children: r.labs.length ? r.labs.map((e) => /* @__PURE__ */ (0, O.jsxs)("div", {
						className: "progress-item",
						children: [/* @__PURE__ */ (0, O.jsxs)("div", {
							className: "progress-line",
							children: [/* @__PURE__ */ (0, O.jsxs)("div", {
								className: "progress-title",
								children: [/* @__PURE__ */ (0, O.jsx)("span", {
									className: "number-tag",
									children: String(e.ordinal ?? "").padStart(2, "0")
								}), /* @__PURE__ */ (0, O.jsx)("span", { children: t.labTitle(e.mission, e.title) })]
							}), /* @__PURE__ */ (0, O.jsxs)("small", { children: [
								m(e.completed_students),
								" از ",
								m(e.students),
								" نفر"
							] })]
						}), /* @__PURE__ */ (0, O.jsx)(N, {
							value: e.completed_students,
							max: e.students
						})]
					}, e.mission)) : /* @__PURE__ */ (0, O.jsx)("p", {
						className: "small muted",
						children: "هنوز لابراتوری برای گزارش این کلاس ثبت نشده است."
					})
				})]
			})]
		}),
		/* @__PURE__ */ (0, O.jsxs)("section", {
			className: "card wide-card",
			children: [
				/* @__PURE__ */ (0, O.jsxs)("header", {
					className: "card-head",
					children: [/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("h2", { children: "برای جلسهٔ بعد چه چیزی را مرور کنیم؟" }), /* @__PURE__ */ (0, O.jsx)("p", { children: "نسبت خطا در اولین ثبت هر دانشجو، برای هر نسخهٔ آزمون." })] }), /* @__PURE__ */ (0, O.jsx)("button", {
						className: "quiet",
						type: "button",
						onClick: () => n.setSection("concepts"),
						children: "تحلیل سؤال‌ها ←"
					})]
				}),
				/* @__PURE__ */ (0, O.jsx)("div", {
					className: "card-content",
					children: r.concepts.length ? r.concepts.map((e) => /* @__PURE__ */ (0, O.jsxs)("div", {
						className: "question-line",
						children: [
							/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("strong", { children: e.skill || e.question_id }), /* @__PURE__ */ (0, O.jsxs)("p", { children: [
								t.noteLabel(e.lesson_id),
								" · نسخهٔ ",
								m(e.version)
							] })] }),
							/* @__PURE__ */ (0, O.jsx)(N, {
								value: e.responses - e.correct,
								max: e.responses
							}),
							/* @__PURE__ */ (0, O.jsxs)("span", {
								className: "small",
								children: [
									m(e.responses - e.correct),
									" خطا از ",
									m(e.responses),
									" پاسخ"
								]
							})
						]
					}, e.lesson_id + ":" + e.version + ":" + e.question_id)) : /* @__PURE__ */ (0, O.jsx)("p", {
						className: "small muted",
						children: "پس از ثبت آزمون‌ها، این گزارش نمایش داده می‌شود."
					})
				}),
				/* @__PURE__ */ (0, O.jsx)("p", {
					className: "legend-note",
					children: "نسبت خطا را در کنار تعداد پاسخ‌ها و ابهام احتمالی سؤال بخوانید."
				})
			]
		})
	] });
}
// frontend/instructor/Reports.tsx
function z({ state: e, labels: t, actions: n, view: r }) {
	let a = e.filters[r], o = (0, d.useRef)(!1);
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "toolbar",
		children: [
			/* @__PURE__ */ (0, O.jsxs)("label", {
				className: "search",
				htmlFor: "instructor-search",
				children: [/* @__PURE__ */ (0, O.jsx)(i, { name: "search" }), /* @__PURE__ */ (0, O.jsx)("input", {
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
			r === "students" && /* @__PURE__ */ (0, O.jsxs)("select", {
				className: "filter",
				"aria-label": "وضعیت دسترسی",
				value: a.status,
				onChange: (e) => n.changeFilter("status", e.target.value),
				children: [
					/* @__PURE__ */ (0, O.jsx)("option", {
						value: "enrolled",
						children: "همهٔ وضعیت‌ها"
					}),
					/* @__PURE__ */ (0, O.jsx)("option", {
						value: "active",
						children: "دارای دسترسی"
					}),
					/* @__PURE__ */ (0, O.jsx)("option", {
						value: "suspended",
						children: "بدون دسترسی"
					})
				]
			}),
			r === "attempts" && /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsxs)("select", {
				className: "filter",
				"aria-label": "یادداشت",
				value: a.lesson || "",
				onChange: (e) => n.changeFilter("lesson", e.target.value),
				children: [/* @__PURE__ */ (0, O.jsx)("option", {
					value: "",
					children: "همهٔ یادداشت‌ها"
				}), t.lessons.map((e) => /* @__PURE__ */ (0, O.jsx)("option", {
					value: e.id,
					children: t.noteLabel(e.id)
				}, e.id))]
			}), /* @__PURE__ */ (0, O.jsxs)("select", {
				className: "filter",
				"aria-label": "نوع تلاش",
				value: a.kind,
				onChange: (e) => n.changeFilter("kind", e.target.value),
				children: [
					/* @__PURE__ */ (0, O.jsx)("option", {
						value: "all",
						children: "همهٔ تلاش‌ها"
					}),
					/* @__PURE__ */ (0, O.jsx)("option", {
						value: "first",
						children: "فقط اولین ثبت"
					}),
					/* @__PURE__ */ (0, O.jsx)("option", {
						value: "later",
						children: "تلاش‌های بعدی"
					})
				]
			})] })
		]
	});
}
function B({ state: e, actions: t, page: n, view: r }) {
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "table-foot",
		children: [/* @__PURE__ */ (0, O.jsxs)("span", { children: [
			m(n.total),
			" ",
			r === "attempts" ? "ثبت" : r === "requests" ? "درخواست" : "دانشجو",
			" · صفحهٔ ",
			m(e.filters[r].index + 1)
		] }), /* @__PURE__ */ (0, O.jsxs)("div", {
			className: "pages",
			children: [/* @__PURE__ */ (0, O.jsx)("button", {
				className: "btn",
				type: "button",
				disabled: !e.filters[r].index,
				onClick: () => t.page(-1),
				children: "قبلی"
			}), /* @__PURE__ */ (0, O.jsx)("button", {
				className: "btn",
				type: "button",
				disabled: !n.next_cursor,
				onClick: () => t.page(1),
				children: "بعدی"
			})]
		})]
	});
}
function V({ state: e, labels: t, actions: n, view: r }) {
	let i = e.pages[r];
	if (!i || i.loading) return /* @__PURE__ */ (0, O.jsx)(P, {});
	if (i.error || !i.data) return /* @__PURE__ */ (0, O.jsx)(I, {
		error: i.error,
		retry: n.refresh
	});
	let a = i.data;
	if (!a.rows.length) return /* @__PURE__ */ (0, O.jsx)(F, {
		title: "اطلاعاتی برای نمایش نیست",
		action: e.filters[r].query ? /* @__PURE__ */ (0, O.jsx)("button", {
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
			/* @__PURE__ */ (0, O.jsx)(k, { person: e }),
			/* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [t.noteLabel(e.lesson_id), /* @__PURE__ */ (0, O.jsxs)("span", {
				className: "sub",
				children: ["نسخهٔ ", m(e.version)]
			})] }),
			e.attempt_no === 1 ? /* @__PURE__ */ (0, O.jsx)("span", {
				className: "tag-first",
				children: "اولین ثبت"
			}) : "تلاش " + m(e.attempt_no),
			/* @__PURE__ */ (0, O.jsx)(j, { score: e }),
			g(e.created_at),
			/* @__PURE__ */ (0, O.jsx)("button", {
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
		let r = T(t, e.filters.labs.mission);
		return {
			key: t.user_id,
			cells: [
				/* @__PURE__ */ (0, O.jsx)(k, { person: t }),
				r ? /* @__PURE__ */ (0, O.jsxs)("div", {
					className: "lab-cell",
					children: [/* @__PURE__ */ (0, O.jsxs)("span", { children: [
						m(r.completed),
						" از ",
						m(r.task_count)
					] }), /* @__PURE__ */ (0, O.jsx)(N, {
						value: r.completed,
						max: r.task_count
					})]
				}) : "—",
				/* @__PURE__ */ (0, O.jsx)(M, { lab: r }),
				_(r?.last_at),
				/* @__PURE__ */ (0, O.jsx)("button", {
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
			/* @__PURE__ */ (0, O.jsx)(k, { person: e }),
			/* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)(M, { lab: e.lab }), /* @__PURE__ */ (0, O.jsxs)("span", {
				className: "sub",
				children: [
					m(e.lab.completed),
					" از ",
					m(e.lab.task_count),
					" مأموریت"
				]
			})] }),
			/* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)(j, { score: e.latest_quiz }), e.latest_quiz && /* @__PURE__ */ (0, O.jsxs)("span", {
				className: "sub",
				children: [
					t.noteLabel(e.latest_quiz.lesson_id),
					" · نسخهٔ ",
					m(e.latest_quiz.version)
				]
			})] }),
			_(e.last_registered_at),
			/* @__PURE__ */ (0, O.jsx)(A, { status: e.status }),
			/* @__PURE__ */ (0, O.jsx)("button", {
				className: "btn small-btn",
				type: "button",
				"aria-label": "پروندهٔ " + (e.name || e.email || "دانشجو"),
				onClick: () => void n.student(e.user_id),
				children: "پرونده ←"
			})
		]
	}))), /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)("div", {
		className: "table-scroll teacher-report-scroll",
		children: /* @__PURE__ */ (0, O.jsxs)("table", {
			role: "table",
			className: "teacher-report-table",
			children: [/* @__PURE__ */ (0, O.jsx)("thead", {
				role: "rowgroup",
				children: /* @__PURE__ */ (0, O.jsx)("tr", {
					role: "row",
					children: o.map((e) => /* @__PURE__ */ (0, O.jsx)("th", {
						scope: "col",
						role: "columnheader",
						children: e
					}, e))
				})
			}), /* @__PURE__ */ (0, O.jsx)("tbody", {
				role: "rowgroup",
				children: s.map((e) => /* @__PURE__ */ (0, O.jsx)("tr", {
					role: "row",
					children: e.cells.map((e, t) => /* @__PURE__ */ (0, O.jsxs)("td", {
						role: "cell",
						children: [t > 0 && t < o.length - 1 && /* @__PURE__ */ (0, O.jsx)("span", {
							className: "teacher-mobile-label",
							"aria-hidden": "true",
							children: o[t]
						}), /* @__PURE__ */ (0, O.jsx)("div", { children: e })]
					}, o[t]))
				}, e.key))
			})]
		})
	}), /* @__PURE__ */ (0, O.jsx)(B, {
		state: e,
		actions: n,
		page: a,
		view: r
	})] });
}
function H({ state: e, labels: t, actions: n }) {
	let r = e.pages.requests;
	if (!r || r.loading) return /* @__PURE__ */ (0, O.jsx)("section", {
		className: "card",
		children: /* @__PURE__ */ (0, O.jsx)(P, {})
	});
	if (r.error || !r.data) return /* @__PURE__ */ (0, O.jsx)("section", {
		className: "card",
		children: /* @__PURE__ */ (0, O.jsx)(I, {
			error: r.error,
			retry: n.refresh
		})
	});
	let i = r.data;
	return i.rows.length ? /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
		/* @__PURE__ */ (0, O.jsxs)("p", {
			className: "notice",
			children: [m(i.total), " درخواست در انتظار است. پیش از فعال‌کردن دسترسی، نام و ایمیل را بررسی کنید."]
		}),
		/* @__PURE__ */ (0, O.jsx)("div", {
			className: "request-list",
			children: i.rows.map((e) => /* @__PURE__ */ (0, O.jsxs)("article", {
				className: "request-card",
				children: [
					/* @__PURE__ */ (0, O.jsx)("div", {
						className: "avatar",
						"aria-hidden": "true",
						children: (e.name || "د")[0]
					}),
					/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "request-info",
						children: [
							/* @__PURE__ */ (0, O.jsx)("h2", { children: e.name || "دانشجو" }),
							/* @__PURE__ */ (0, O.jsx)("bdi", { children: e.email }),
							/* @__PURE__ */ (0, O.jsxs)("p", { children: [
								"درخواست عضویت در ",
								t.courseTitle,
								" · ",
								g(e.requested_at)
							] })
						]
					}),
					/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "request-actions",
						children: [/* @__PURE__ */ (0, O.jsx)("button", {
							className: "btn",
							type: "button",
							onClick: () => void n.student(e.user_id, "request"),
							children: "بررسی"
						}), /* @__PURE__ */ (0, O.jsx)("button", {
							className: "btn primary",
							type: "button",
							onClick: () => void n.askMembership(e.user_id),
							children: "تأیید دسترسی"
						})]
					})
				]
			}, e.user_id))
		}),
		/* @__PURE__ */ (0, O.jsx)(B, {
			state: e,
			actions: n,
			page: i,
			view: "requests"
		})
	] }) : /* @__PURE__ */ (0, O.jsx)("section", {
		className: "card",
		children: /* @__PURE__ */ (0, O.jsx)(F, {
			title: "درخواستی در انتظار نیست",
			children: "درخواست تازه‌ای که نیاز به بررسی داشته باشد، اینجا نمایش داده می‌شود."
		})
	});
}
function U({ state: e, labels: t, actions: n }) {
	return e.conceptLoading ? /* @__PURE__ */ (0, O.jsx)("section", {
		className: "card",
		children: /* @__PURE__ */ (0, O.jsx)(P, {})
	}) : e.conceptError ? /* @__PURE__ */ (0, O.jsx)("section", {
		className: "card",
		children: /* @__PURE__ */ (0, O.jsx)(I, {
			error: e.conceptError,
			retry: n.loadConcepts
		})
	}) : /* @__PURE__ */ (0, O.jsxs)("section", {
		className: "card",
		children: [
			/* @__PURE__ */ (0, O.jsx)("header", {
				className: "card-head",
				children: /* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("h2", { children: "تحلیل اولین پاسخ‌ها" }), /* @__PURE__ */ (0, O.jsx)("p", { children: "هر دانشجو در هر نسخه، یک بار شمرده می‌شود." })] })
			}),
			/* @__PURE__ */ (0, O.jsx)("div", {
				className: "card-content",
				children: e.concepts.length ? e.concepts.map((e) => /* @__PURE__ */ (0, O.jsxs)("div", {
					className: "question-line",
					children: [
						/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("strong", { children: e.skill || e.question_id }), /* @__PURE__ */ (0, O.jsxs)("p", { children: [
							t.noteLabel(e.lesson_id),
							" · نسخهٔ ",
							m(e.version),
							" · ",
							m(e.correct),
							" پاسخ درست از ",
							m(e.responses)
						] })] }),
						/* @__PURE__ */ (0, O.jsx)(N, {
							value: e.responses - e.correct,
							max: e.responses
						}),
						/* @__PURE__ */ (0, O.jsx)("button", {
							className: "btn small-btn",
							type: "button",
							onClick: () => n.question(e),
							children: "دیدن سؤال"
						})
					]
				}, e.lesson_id + ":" + e.version + ":" + e.question_id)) : /* @__PURE__ */ (0, O.jsx)("p", {
					className: "small muted",
					children: "هنوز پاسخی برای تحلیل وجود ندارد."
				})
			}),
			/* @__PURE__ */ (0, O.jsx)("p", {
				className: "legend-note",
				children: "خطای بیشتر می‌تواند از ابهام سؤال یا نیاز به توضیح دوباره باشد. این گزارش رتبه‌بندی دانشجویان نیست."
			})
		]
	});
}
function W(e) {
	let { state: t, labels: n, actions: r } = e, a = t.view;
	if (a === "requests") return /* @__PURE__ */ (0, O.jsx)(H, { ...e });
	if (a === "overview" || a === "exam-results") return null;
	let o = t.overview?.labs || (t.pages.labs?.data?.rows[0])?.lab.missions || [], s = t.filters.labs.mission, c = o.find((e) => e.mission === s);
	return /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
		a === "attempts" && /* @__PURE__ */ (0, O.jsx)("div", {
			className: "request-actions instructor-segments",
			role: "group",
			"aria-label": "نوع گزارش آزمون",
			children: [["attempts", "ثبت‌های آزمون"], ["concepts", "تحلیل سؤال‌ها"]].map(([e, n]) => /* @__PURE__ */ (0, O.jsx)("button", {
				className: "btn " + (t.filters.attempts.section === e ? "primary" : ""),
				type: "button",
				"aria-pressed": t.filters.attempts.section === e,
				onClick: () => r.setSection(e),
				children: n
			}, e))
		}),
		a === "labs" && o.length > 0 && /* @__PURE__ */ (0, O.jsx)("div", {
			className: "lab-summary",
			role: "group",
			"aria-label": "فیلتر لابراتور",
			children: o.map((e) => /* @__PURE__ */ (0, O.jsxs)("button", {
				type: "button",
				"aria-pressed": s === e.mission,
				onClick: () => r.mission(e.mission),
				children: [
					/* @__PURE__ */ (0, O.jsx)("span", {
						className: "number-tag",
						children: String(e.ordinal ?? "").padStart(2, "0")
					}),
					/* @__PURE__ */ (0, O.jsx)("strong", { children: n.labTitle(e.mission, e.title) }),
					/* @__PURE__ */ (0, O.jsxs)("small", { children: [
						m(e.task_count),
						" مأموریت · ",
						/* @__PURE__ */ (0, O.jsxs)("bdi", { children: [h(e.maximum), " XP"] })
					] })
				]
			}, e.mission))
		}),
		a === "attempts" && t.filters.attempts.section === "concepts" ? /* @__PURE__ */ (0, O.jsx)(U, { ...e }) : /* @__PURE__ */ (0, O.jsxs)("section", {
			className: "card",
			children: [
				a === "labs" && /* @__PURE__ */ (0, O.jsxs)("header", {
					className: "card-head",
					children: [/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("h2", { children: s === "all" || !s ? "رشد در همهٔ لابراتورها" : n.labTitle(s, c?.title) }), /* @__PURE__ */ (0, O.jsx)("p", { children: "XP ثبت‌شده و مأموریت‌های کامل‌شده" })] }), s !== "all" && /* @__PURE__ */ (0, O.jsx)("button", {
						className: "quiet",
						type: "button",
						onClick: () => r.mission("all"),
						children: "همهٔ لابراتورها ←"
					})]
				}),
				/* @__PURE__ */ (0, O.jsx)(z, {
					...e,
					view: a
				}),
				/* @__PURE__ */ (0, O.jsx)(V, {
					...e,
					view: a
				}),
				a === "attempts" && /* @__PURE__ */ (0, O.jsx)("p", {
					className: "table-note",
					children: "همهٔ ثبت‌ها با صفحه‌بندی در دسترس‌اند؛ نمرهٔ آخر هر دانشجو از کل سوابق محاسبه می‌شود."
				})
			]
		}),
		a === "students" && /* @__PURE__ */ (0, O.jsxs)("p", {
			className: "overview-footnote",
			children: [/* @__PURE__ */ (0, O.jsx)(i, { name: "info" }), "آخرین ثبت آموزشی از آزمون یا بررسی لابراتور به دست می‌آید؛ نشانهٔ آخرین ورود یا مطالعهٔ یادداشت نیست."]
		})
	] });
}
// frontend/instructor/InstructorExamResults.tsx
var G = (e) => e == null ? "—" : Number(e).toLocaleString("fa-IR", { maximumFractionDigits: 2 }), K = (e) => e ? new Date(e).toLocaleString("fa-IR", {
	dateStyle: "medium",
	timeStyle: "short"
}) : "—";
function q({ course: e, rpc: t }) {
	let [n, r] = (0, d.useState)(0), [i, s] = (0, d.useState)(null), [c, l] = (0, d.useState)(!0), [u, f] = (0, d.useState)(""), [p, m] = (0, d.useState)(null), [h, g] = (0, d.useState)(null), [_, v] = (0, d.useState)(!1), [y, b] = (0, d.useState)(""), [x, S] = (0, d.useState)(""), [C, w] = (0, d.useState)(0), T = (0, d.useCallback)(() => w((e) => e + 1), []);
	(0, d.useEffect)(() => {
		let r = !0;
		return l(!0), f(""), t("classroom_instructor_exam_results", {
			p_course: e,
			p_offset: n,
			p_limit: 20
		}).then((e) => {
			if (!r) return;
			let t = e;
			if (!t || !Array.isArray(t.rows) || !Number.isInteger(t.total) || !t.stats) throw Error("INVALID_EXAM_REPORT");
			s(t);
		}).catch(() => {
			r && f("دریافت گزارش امتحان ممکن نشد. توابع Supabase و دسترسی مدرس را بررسی کن.");
		}).finally(() => {
			r && l(!1);
		}), () => {
			r = !1;
		};
	}, [
		e,
		n,
		t,
		C
	]), (0, d.useEffect)(() => {
		if (!p) {
			g(null);
			return;
		}
		let e = !0;
		return g(null), b(""), v(!0), t("classroom_instructor_exam_result", { p_id: p.id }).then((t) => {
			if (!e) return;
			let n = t;
			if (!n || n.id !== p.id) throw Error("INVALID_EXAM_DETAIL");
			g(n);
		}).catch(() => {
			e && b("جزئیات این تلاش دریافت نشد.");
		}).finally(() => {
			e && v(!1);
		}), () => {
			e = !1;
		};
	}, [p, t]);
	let E = (i?.rows || []).filter((e) => {
		let t = x.trim().toLowerCase();
		return !t || [
			e.name,
			e.email,
			e.exam_title
		].some((e) => e?.toLowerCase().includes(t));
	});
	return /* @__PURE__ */ (0, O.jsxs)("section", {
		className: "instructor-exam-results",
		dir: "rtl",
		children: [
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "instructor-exam-summary",
				children: [
					/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "شرکت‌کنندگان و تلاش‌ها" }), /* @__PURE__ */ (0, O.jsx)("strong", { children: G(i?.stats.total) })] }),
					/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "تلاش‌های پایان‌یافته" }), /* @__PURE__ */ (0, O.jsx)("strong", { children: G(i?.stats.finished) })] }),
					/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "میانگین نمره" }), /* @__PURE__ */ (0, O.jsxs)("strong", { children: [
						G(i?.stats.average_score),
						" ",
						/* @__PURE__ */ (0, O.jsx)("small", { children: "از ۱۵" })
					] })] }),
					/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "میانگین رضایت" }), /* @__PURE__ */ (0, O.jsxs)("strong", { children: [
						G(i?.stats.average_rating),
						" ",
						/* @__PURE__ */ (0, O.jsx)("small", { children: "از ۵" })
					] })] })
				]
			}),
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "instructor-exam-toolbar",
				children: [/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("h2", { children: "کارنامهٔ دانشجویان" }), /* @__PURE__ */ (0, O.jsx)("p", { children: "تلاش‌های آزمایشی مدرس در این گزارش محاسبه نمی‌شوند." })] }), /* @__PURE__ */ (0, O.jsxs)("div", {
					className: "instructor-exam-tools",
					children: [/* @__PURE__ */ (0, O.jsx)("input", {
						type: "search",
						value: x,
						onChange: (e) => S(e.target.value),
						placeholder: "جست‌وجوی نام یا ایمیل در همین صفحه",
						"aria-label": "جست‌وجوی نام یا ایمیل"
					}), /* @__PURE__ */ (0, O.jsx)("button", {
						className: "btn",
						type: "button",
						disabled: c,
						onClick: T,
						children: "به‌روزرسانی"
					})]
				})]
			}),
			c && /* @__PURE__ */ (0, O.jsx)("p", {
				className: "instructor-exam-message",
				role: "status",
				children: "در حال دریافت گزارش…"
			}),
			u && /* @__PURE__ */ (0, O.jsx)("p", {
				className: "instructor-exam-message is-error",
				role: "alert",
				children: u
			}),
			!c && !u && /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
				E.length ? /* @__PURE__ */ (0, O.jsx)("div", {
					className: "instructor-exam-table-scroll",
					children: /* @__PURE__ */ (0, O.jsxs)("table", {
						className: "instructor-exam-table",
						children: [/* @__PURE__ */ (0, O.jsx)("thead", { children: /* @__PURE__ */ (0, O.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, O.jsx)("th", { children: "دانشجو" }),
							/* @__PURE__ */ (0, O.jsx)("th", { children: "امتحان" }),
							/* @__PURE__ */ (0, O.jsx)("th", { children: "نمره" }),
							/* @__PURE__ */ (0, O.jsx)("th", { children: "وضعیت" }),
							/* @__PURE__ */ (0, O.jsx)("th", { children: "ثبت نهایی" }),
							/* @__PURE__ */ (0, O.jsx)("th", { children: "بازخورد" }),
							/* @__PURE__ */ (0, O.jsx)("th", { children: "کارنامه" })
						] }) }), /* @__PURE__ */ (0, O.jsx)("tbody", { children: E.map((e) => /* @__PURE__ */ (0, O.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, O.jsxs)("td", { children: [/* @__PURE__ */ (0, O.jsx)("strong", { children: e.name || "دانشجو" }), /* @__PURE__ */ (0, O.jsx)("small", { children: /* @__PURE__ */ (0, O.jsx)("bdi", {
								dir: "ltr",
								children: e.email || "—"
							}) })] }),
							/* @__PURE__ */ (0, O.jsx)("td", { children: e.exam_title }),
							/* @__PURE__ */ (0, O.jsx)("td", { children: /* @__PURE__ */ (0, O.jsx)("strong", { children: e.score == null ? "—" : `${G(e.score)} / ${G(e.maximum_score)}` }) }),
							/* @__PURE__ */ (0, O.jsx)("td", { children: e.status === "in_progress" ? "در حال انجام" : e.status === "expired" ? "پایان زمان" : "ثبت نهایی" }),
							/* @__PURE__ */ (0, O.jsx)("td", { children: K(e.submitted_at) }),
							/* @__PURE__ */ (0, O.jsx)("td", { children: e.feedback_rating ? `${G(e.feedback_rating)} از ۵` : "—" }),
							/* @__PURE__ */ (0, O.jsx)("td", { children: /* @__PURE__ */ (0, O.jsx)("button", {
								className: "btn small-btn",
								type: "button",
								onClick: () => m(e),
								children: "مشاهدهٔ جزئیات"
							}) })
						] }, e.id)) })]
					})
				}) : /* @__PURE__ */ (0, O.jsx)("p", {
					className: "instructor-exam-message",
					children: "در این صفحه نتیجه‌ای برای نمایش وجود ندارد."
				}),
				/* @__PURE__ */ (0, O.jsxs)("div", {
					className: "instructor-exam-pagination",
					children: [/* @__PURE__ */ (0, O.jsxs)("span", { children: [
						G(i?.total),
						" تلاش · صفحهٔ ",
						G(Math.floor(n / 20) + 1)
					] }), /* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("button", {
						className: "btn",
						type: "button",
						disabled: n === 0 || c,
						onClick: () => r((e) => Math.max(0, e - 20)),
						children: "قبلی"
					}), /* @__PURE__ */ (0, O.jsx)("button", {
						className: "btn",
						type: "button",
						disabled: c || n + 20 >= (i?.total || 0),
						onClick: () => r((e) => e + 20),
						children: "بعدی"
					})] })]
				}),
				x && /* @__PURE__ */ (0, O.jsx)("p", {
					className: "small muted",
					children: "جست‌وجو روی ردیف‌های صفحهٔ جاری انجام می‌شود؛ برای دیدن سایر دانشجویان از صفحه‌بندی استفاده کن."
				})
			] }),
			p && /* @__PURE__ */ (0, O.jsx)("div", {
				className: "instructor-exam-detail-overlay",
				role: "presentation",
				onMouseDown: (e) => {
					e.target === e.currentTarget && m(null);
				},
				children: /* @__PURE__ */ (0, O.jsxs)("section", {
					className: "instructor-exam-detail",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "instructor-exam-detail-title",
					children: [
						/* @__PURE__ */ (0, O.jsxs)("header", { children: [/* @__PURE__ */ (0, O.jsxs)("div", { children: [
							/* @__PURE__ */ (0, O.jsx)("p", {
								className: "exam-eyebrow",
								children: "نتیجهٔ امتحان"
							}),
							/* @__PURE__ */ (0, O.jsx)("h2", {
								id: "instructor-exam-detail-title",
								children: p.name || "دانشجو"
							}),
							/* @__PURE__ */ (0, O.jsx)("bdi", {
								dir: "ltr",
								children: p.email || ""
							})
						] }), /* @__PURE__ */ (0, O.jsx)("button", {
							type: "button",
							className: "btn",
							onClick: () => m(null),
							children: "بستن ×"
						})] }),
						_ && /* @__PURE__ */ (0, O.jsx)("p", {
							role: "status",
							children: "در حال دریافت پاسخ‌ها…"
						}),
						y && /* @__PURE__ */ (0, O.jsx)("p", {
							role: "alert",
							children: y
						}),
						h && !h.receipt && /* @__PURE__ */ (0, O.jsx)("p", { children: "امتحان این دانشجو هنوز در حال انجام است. پاسخ‌ها و کلیدها فقط بعد از ثبت نهایی نمایش داده می‌شوند." }),
						h?.receipt && /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
							/* @__PURE__ */ (0, O.jsxs)("div", {
								className: "instructor-exam-detail-facts",
								children: [
									/* @__PURE__ */ (0, O.jsxs)("span", { children: ["نمره: ", /* @__PURE__ */ (0, O.jsxs)("b", { children: [
										G(h.receipt.score),
										" / ",
										G(h.receipt.maximum_score)
									] })] }),
									/* @__PURE__ */ (0, O.jsxs)("span", { children: ["پاسخ درست: ", /* @__PURE__ */ (0, O.jsx)("b", { children: G(h.receipt.correct_count) })] }),
									/* @__PURE__ */ (0, O.jsxs)("span", { children: ["وضعیت: ", /* @__PURE__ */ (0, O.jsx)("b", { children: h.receipt.status === "expired" ? "پایان زمان" : "ثبت نهایی" })] })
								]
							}),
							p.feedback_comment && /* @__PURE__ */ (0, O.jsxs)("div", {
								className: "instructor-exam-comment",
								children: [/* @__PURE__ */ (0, O.jsx)("b", { children: "نظر دانشجو:" }), /* @__PURE__ */ (0, O.jsx)("p", { children: p.feedback_comment })]
							}),
							/* @__PURE__ */ (0, O.jsx)("div", {
								className: "instructor-exam-detail-questions",
								children: h.receipt.feedback?.map((e, t) => {
									let n = e.options.find((t) => t.id === e.selected_option), r = e.options.find((t) => t.id === e.correct_option);
									return /* @__PURE__ */ (0, O.jsxs)("article", {
										className: e.is_correct ? "is-correct" : "is-incorrect",
										children: [
											/* @__PURE__ */ (0, O.jsxs)("div", {
												className: "instructor-exam-question-header",
												children: [/* @__PURE__ */ (0, O.jsxs)("strong", { children: [
													"سؤال ",
													G(t + 1),
													" · ",
													e.skill
												] }), /* @__PURE__ */ (0, O.jsx)("span", { children: e.is_correct ? "درست" : n ? "نادرست" : "بدون پاسخ" })]
											}),
											/* @__PURE__ */ (0, O.jsx)("div", {
												className: "instructor-exam-question-stem",
												children: /* @__PURE__ */ (0, O.jsx)(o, { text: e.stem })
											}),
											/* @__PURE__ */ (0, O.jsx)(a, { visual: e.visual }),
											/* @__PURE__ */ (0, O.jsxs)("p", { children: [
												/* @__PURE__ */ (0, O.jsx)("strong", { children: "پاسخ دانشجو:" }),
												" ",
												/* @__PURE__ */ (0, O.jsx)(o, { text: n?.text || "بدون پاسخ" })
											] }),
											/* @__PURE__ */ (0, O.jsxs)("p", { children: [
												/* @__PURE__ */ (0, O.jsx)("strong", { children: "پاسخ صحیح:" }),
												" ",
												/* @__PURE__ */ (0, O.jsx)(o, { text: r?.text || "—" })
											] }),
											/* @__PURE__ */ (0, O.jsx)("div", {
												className: "instructor-exam-reason",
												children: /* @__PURE__ */ (0, O.jsx)(o, { text: e.rationale })
											})
										]
									}, e.id);
								})
							})
						] })
					]
				})
			})
		]
	});
}
// frontend/instructor/Details.tsx
function J(e) {
	let t = (0, d.useRef)(null);
	return (0, d.useEffect)(() => {
		let n = t.current;
		if (!e || !n) return;
		let r = n.ownerDocument, i = r.activeElement;
		return typeof n.showModal == "function" ? n.open || n.showModal() : n.setAttribute("open", ""), () => {
			n.open && (typeof n.close == "function" ? n.close() : n.removeAttribute("open")), i?.isConnected ? i.focus({ preventScroll: !0 }) : r.querySelector("[data-instructor-nav] [aria-current=\"page\"]")?.focus({ preventScroll: !0 });
		};
	}, [e]), t;
}
function Y(e) {
	if (e.target !== e.currentTarget) return !1;
	let t = e.currentTarget.getBoundingClientRect();
	return e.clientX < t.left || e.clientX > t.right || e.clientY < t.top || e.clientY > t.bottom;
}
function X({ history: e, user: t, labels: n, actions: r }) {
	return e.loading ? /* @__PURE__ */ (0, O.jsx)(P, { children: "در حال دریافت ثبت‌های آزمون…" }) : e.error || !e.data ? /* @__PURE__ */ (0, O.jsx)(I, {
		error: e.error,
		retry: () => void r.loadHistory()
	}) : /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [e.data.rows.length ? e.data.rows.map((e) => /* @__PURE__ */ (0, O.jsxs)("button", {
		className: "attempt-link",
		type: "button",
		onClick: () => void r.attempt(e.id, t),
		children: [/* @__PURE__ */ (0, O.jsxs)("span", { children: [
			n.noteLabel(e.lesson_id),
			" · نسخهٔ ",
			m(e.version),
			/* @__PURE__ */ (0, O.jsxs)("small", { children: [
				g(e.created_at),
				" · ",
				e.attempt_no === 1 ? "اولین ثبت" : "تلاش " + m(e.attempt_no)
			] })
		] }), /* @__PURE__ */ (0, O.jsxs)("span", { children: [/* @__PURE__ */ (0, O.jsx)(j, { score: e }), " ←"] })]
	}, e.id)) : /* @__PURE__ */ (0, O.jsx)("p", {
		className: "small muted",
		children: "هنوز آزمونی ثبت نشده است."
	}), /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "pages instructor-history-pages",
		children: [
			/* @__PURE__ */ (0, O.jsx)("button", {
				className: "btn small-btn",
				type: "button",
				disabled: !e.index,
				onClick: () => r.historyPage(-1),
				children: "قبلی"
			}),
			/* @__PURE__ */ (0, O.jsxs)("span", {
				className: "small muted",
				children: ["صفحهٔ ", m(e.index + 1)]
			}),
			/* @__PURE__ */ (0, O.jsx)("button", {
				className: "btn small-btn",
				type: "button",
				disabled: !e.data.next_cursor,
				onClick: () => r.historyPage(1),
				children: "بعدی"
			})
		]
	})] });
}
function Z({ sheet: e, labels: t, actions: n }) {
	let r = e.person;
	return e.error || !r ? /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)("h2", {
		id: "instructor-detail-title",
		children: e.kind === "request" ? "بررسی درخواست" : "پروندهٔ آموزشی دانشجو"
	}), e.error ? /* @__PURE__ */ (0, O.jsx)(I, {
		error: e.error,
		retry: () => void n.student(e.user, e.kind)
	}) : /* @__PURE__ */ (0, O.jsx)(P, { children: "در حال دریافت پرونده…" })] }) : /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
		/* @__PURE__ */ (0, O.jsx)("h2", {
			id: "instructor-detail-title",
			children: r.name || r.email || "دانشجو"
		}),
		/* @__PURE__ */ (0, O.jsx)("bdi", {
			className: "email",
			children: r.email
		}),
		/* @__PURE__ */ (0, O.jsxs)("div", {
			className: "sheet-meta",
			children: [/* @__PURE__ */ (0, O.jsx)(A, { status: r.status }), /* @__PURE__ */ (0, O.jsx)("span", {
				className: "small muted",
				children: e.kind === "request" ? "درخواست: " + g(r.requested_at) : "آخرین ثبت آموزشی: " + _(r.last_registered_at)
			})]
		}),
		e.kind === "request" ? /* @__PURE__ */ (0, O.jsxs)("section", {
			className: "sheet-section",
			children: [
				/* @__PURE__ */ (0, O.jsxs)("h3", { children: ["عضویت در ", t.courseTitle] }),
				/* @__PURE__ */ (0, O.jsx)("p", {
					className: "small muted",
					children: "با تأیید، دسترسی این حساب به محتوای کلاس فعال می‌شود."
				}),
				/* @__PURE__ */ (0, O.jsxs)("div", {
					className: "confirm-actions",
					children: [/* @__PURE__ */ (0, O.jsx)("button", {
						className: "btn",
						type: "button",
						onClick: n.closeSheet,
						children: "بررسی در فرصت دیگر"
					}), /* @__PURE__ */ (0, O.jsx)("button", {
						className: "btn primary",
						type: "button",
						disabled: r.status === "active",
						onClick: () => void n.askMembership(r.user_id),
						children: "تأیید دسترسی"
					})]
				})
			]
		}) : /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "sheet-stats",
				children: [/* @__PURE__ */ (0, O.jsxs)("div", {
					className: "sheet-stat",
					children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "XP لابراتورها" }), /* @__PURE__ */ (0, O.jsx)("strong", { children: /* @__PURE__ */ (0, O.jsx)(M, { lab: r.lab }) })]
				}), /* @__PURE__ */ (0, O.jsxs)("div", {
					className: "sheet-stat",
					children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "آخرین نمرهٔ آزمون" }), /* @__PURE__ */ (0, O.jsx)("strong", { children: /* @__PURE__ */ (0, O.jsx)(j, { score: r.latest_quiz }) })]
				})]
			}),
			/* @__PURE__ */ (0, O.jsxs)("section", {
				className: "sheet-section",
				children: [/* @__PURE__ */ (0, O.jsx)("h3", { children: "مسیر لابراتورها" }), r.lab.missions.length ? r.lab.missions.map((e) => {
					let n = e.completed || [], r = t.course?.lessons.find((t) => t.lab?.mission === e.mission)?.lab_steps || [];
					return /* @__PURE__ */ (0, O.jsxs)("div", {
						className: "sheet-progress",
						children: [
							/* @__PURE__ */ (0, O.jsxs)("div", {
								className: "progress-line",
								children: [/* @__PURE__ */ (0, O.jsx)("strong", { children: t.labTitle(e.mission, e.title) }), /* @__PURE__ */ (0, O.jsxs)("small", { children: [
									m(n.length),
									" از ",
									m(e.task_count),
									" · ",
									/* @__PURE__ */ (0, O.jsxs)("bdi", {
										className: "mono",
										children: [h(e.xp), " XP"]
									})
								] })]
							}),
							/* @__PURE__ */ (0, O.jsx)(N, {
								value: n.length,
								max: e.task_count
							}),
							!!e.tasks?.length && /* @__PURE__ */ (0, O.jsxs)("details", {
								className: "instructor-task-details",
								children: [/* @__PURE__ */ (0, O.jsx)("summary", { children: "مأموریت‌ها" }), /* @__PURE__ */ (0, O.jsx)("ul", { children: e.tasks.map((e) => /* @__PURE__ */ (0, O.jsxs)("li", { children: [
									/* @__PURE__ */ (0, O.jsx)("span", {
										"aria-hidden": "true",
										children: n.includes(e.id) ? "✓" : "○"
									}),
									" ",
									r.find((t) => t.id === e.id)?.title || "مأموریت " + m(e.position),
									n.includes(e.id) && /* @__PURE__ */ (0, O.jsx)("span", {
										className: "small muted",
										children: " · انجام‌شده"
									})
								] }, e.id)) })]
							})
						]
					}, e.mission);
				}) : /* @__PURE__ */ (0, O.jsx)("p", {
					className: "small muted",
					children: "هنوز پیشرفت لابراتوری در این گزارش نیست."
				})]
			}),
			/* @__PURE__ */ (0, O.jsxs)("section", {
				className: "sheet-section",
				children: [/* @__PURE__ */ (0, O.jsxs)("h3", { children: ["ثبت‌های آزمون", r.quiz_attempts == null ? "" : " · " + m(r.quiz_attempts) + " ثبت"] }), /* @__PURE__ */ (0, O.jsx)(X, {
					history: e.history,
					user: e.user,
					labels: t,
					actions: n
				})]
			}),
			/* @__PURE__ */ (0, O.jsx)("section", {
				className: "sheet-section",
				children: /* @__PURE__ */ (0, O.jsx)("button", {
					className: "btn " + (r.status === "active" ? "danger" : ""),
					type: "button",
					onClick: () => void n.askMembership(r.user_id),
					children: r.status === "active" ? "غیرفعال‌کردن دسترسی" : "فعال‌کردن دسترسی"
				})
			})
		] })
	] });
}
function Q({ figure: e }) {
	let t = (e) => Array.isArray(e) && e.length === 2 && e.every(Number.isFinite);
	return (e?.type === "distance2d" ? t(e.u) && t(e.v) : e?.type === "knn2d" && t(e.query) && Array.isArray(e.points) && e.points.every((e) => e && typeof e.id == "string" && t(e.x) && (e.y === 0 || e.y === 1))) && e ? /* @__PURE__ */ (0, O.jsx)("div", {
		className: "instructor-question-figure",
		children: /* @__PURE__ */ (0, O.jsx)(u, { figure: e })
	}) : null;
}
function $({ code: e, blanks: t }) {
	return e ? /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "instructor-code",
		children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "Python" }), /* @__PURE__ */ (0, O.jsx)(s, {
			code: e,
			blanks: t || []
		})]
	}) : null;
}
function re({ receipt: e }) {
	let t = new Map(e.prompts?.map((e) => [e.id, e]));
	return e.result.items?.length ? /* @__PURE__ */ (0, O.jsx)(O.Fragment, { children: e.result.items.map((n, r) => {
		let i = t.get(n.id), a = e.answers?.[n.id], o = n.parts || [], s = typeof a == "string" ? i?.options?.find(([e]) => e === a)?.[1] || a : "پاسخی ثبت نشده بود.", u = i?.options?.find(([e]) => e === n.key)?.[1], d = n.correct ? "درست" : Number(n.score) > 0 ? "بخشی درست" : "نادرست";
		return /* @__PURE__ */ (0, O.jsxs)("article", {
			className: "answer",
			children: [
				/* @__PURE__ */ (0, O.jsxs)("header", { children: [/* @__PURE__ */ (0, O.jsxs)("span", { children: [
					"سؤال ",
					m(r + 1),
					" · ",
					n.skill || n.id
				] }), /* @__PURE__ */ (0, O.jsxs)("span", {
					className: "pill " + (n.correct ? "" : "pending"),
					children: [
						d,
						" · ",
						/* @__PURE__ */ (0, O.jsx)(j, { score: n })
					]
				})] }),
				i ? /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
					/* @__PURE__ */ (0, O.jsx)("p", { children: /* @__PURE__ */ (0, O.jsx)(l, { text: i.stem }) }),
					/* @__PURE__ */ (0, O.jsx)(Q, { figure: i.figure }),
					/* @__PURE__ */ (0, O.jsx)($, {
						code: i.code,
						blanks: i.blanks
					})
				] }) : /* @__PURE__ */ (0, O.jsx)("p", {
					className: "small muted",
					children: "متن این نسخهٔ سؤال در دسترس نیست؛ نتیجهٔ ثبت‌شده حفظ شده است."
				}),
				o.length ? /* @__PURE__ */ (0, O.jsx)("div", {
					className: "table-scroll",
					children: /* @__PURE__ */ (0, O.jsxs)("table", {
						className: "instructor-answer-table",
						children: [
							/* @__PURE__ */ (0, O.jsx)("caption", { children: "پاسخ هر جای خالی" }),
							/* @__PURE__ */ (0, O.jsx)("thead", { children: /* @__PURE__ */ (0, O.jsx)("tr", { children: [
								"جای خالی",
								"پاسخ دانشجو",
								"نتیجه",
								"پاسخ پذیرفته‌شده"
							].map((e) => /* @__PURE__ */ (0, O.jsx)("th", {
								scope: "col",
								children: e
							}, e)) }) }),
							/* @__PURE__ */ (0, O.jsx)("tbody", { children: o.map((e, t) => {
								let n = (e.accepted || []).map((t) => i?.blanks?.find((t) => t.id === e.id)?.input_kind === "stringLiteral" ? JSON.stringify(t) : t).join(" / ");
								return /* @__PURE__ */ (0, O.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, O.jsx)("th", {
										scope: "row",
										children: c(t)
									}),
									/* @__PURE__ */ (0, O.jsx)("td", { children: /* @__PURE__ */ (0, O.jsx)("bdi", {
										dir: "ltr",
										children: a && typeof a == "object" ? a[e.id] ?? "—" : "—"
									}) }),
									/* @__PURE__ */ (0, O.jsx)("td", { children: e.correct ? "درست" : "نادرست" }),
									/* @__PURE__ */ (0, O.jsx)("td", { children: /* @__PURE__ */ (0, O.jsx)("bdi", {
										dir: "ltr",
										children: n
									}) })
								] }, e.id);
							}) })
						]
					})
				}) : /* @__PURE__ */ (0, O.jsxs)("dl", { children: [
					/* @__PURE__ */ (0, O.jsx)("dt", { children: "پاسخ دانشجو" }),
					/* @__PURE__ */ (0, O.jsx)("dd", { children: /* @__PURE__ */ (0, O.jsx)(l, { text: s }) }),
					u && /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)("dt", { children: "پاسخ معیار" }), /* @__PURE__ */ (0, O.jsx)("dd", { children: /* @__PURE__ */ (0, O.jsx)(l, { text: u }) })] })
				] }),
				/* @__PURE__ */ (0, O.jsx)("p", {
					className: "small muted top-gap",
					children: /* @__PURE__ */ (0, O.jsx)(l, { text: n.explanation })
				}),
				n.selected_feedback && /* @__PURE__ */ (0, O.jsx)("p", {
					className: "small muted",
					children: /* @__PURE__ */ (0, O.jsx)(l, { text: n.selected_feedback })
				})
			]
		}, n.id);
	}) }) : /* @__PURE__ */ (0, O.jsx)("p", {
		className: "small muted",
		children: "جزئیات پاسخ‌های این ثبت در دسترس نیست."
	});
}
function ie({ sheet: e, labels: t, actions: n }) {
	let r = e.record;
	return /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
		e.from && /* @__PURE__ */ (0, O.jsx)("button", {
			className: "quiet sheet-back",
			type: "button",
			onClick: () => void n.student(e.from),
			children: "→ بازگشت به دانشجو"
		}),
		/* @__PURE__ */ (0, O.jsx)("h2", {
			id: "instructor-detail-title",
			children: "بررسی پاسخ آزمون"
		}),
		e.error ? /* @__PURE__ */ (0, O.jsx)(I, {
			error: e.error,
			retry: () => void n.attempt(e.id, e.from)
		}) : r ? /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
			/* @__PURE__ */ (0, O.jsx)("p", {
				className: "small muted",
				children: t.lessonInfo(r.lesson_id)?.title || e.row?.title || r.lesson_id
			}),
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "sheet-meta",
				children: [
					e.row?.name && /* @__PURE__ */ (0, O.jsx)("span", { children: e.row.name }),
					/* @__PURE__ */ (0, O.jsxs)("span", {
						className: "pill",
						children: ["نسخهٔ ", m(r.version)]
					}),
					/* @__PURE__ */ (0, O.jsx)("span", {
						className: "pill off",
						children: Number(r.attempt_no) === 1 ? "اولین ثبت نهایی" : "تلاش " + m(r.attempt_no)
					})
				]
			}),
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "sheet-stats",
				children: [/* @__PURE__ */ (0, O.jsxs)("div", {
					className: "sheet-stat",
					children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "نمرهٔ همین ثبت" }), /* @__PURE__ */ (0, O.jsx)("strong", { children: /* @__PURE__ */ (0, O.jsx)(j, { score: r.result }) })]
				}), /* @__PURE__ */ (0, O.jsxs)("div", {
					className: "sheet-stat",
					children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "زمان ثبت" }), /* @__PURE__ */ (0, O.jsx)("strong", {
						className: "instructor-date",
						children: g(r.created_at, !0)
					})]
				})]
			}),
			/* @__PURE__ */ (0, O.jsxs)("section", {
				className: "sheet-section",
				children: [/* @__PURE__ */ (0, O.jsx)("h3", { children: "پاسخ‌های ثبت‌شده" }), /* @__PURE__ */ (0, O.jsx)(re, { receipt: r })]
			})
		] }) : /* @__PURE__ */ (0, O.jsx)(P, { children: "در حال دریافت پاسخ‌ها…" })
	] });
}
function ae({ concept: e, labels: t }) {
	let n = Object.entries(e.choice_counts || {}).sort((e, t) => t[1] - e[1]);
	return /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
		/* @__PURE__ */ (0, O.jsx)("h2", {
			id: "instructor-detail-title",
			children: e.skill || e.question_id
		}),
		/* @__PURE__ */ (0, O.jsxs)("p", {
			className: "small muted top-gap",
			children: [
				t.noteLabel(e.lesson_id),
				" · نسخهٔ ",
				m(e.version),
				" · اولین ثبت نهایی"
			]
		}),
		/* @__PURE__ */ (0, O.jsxs)("section", {
			className: "sheet-section",
			children: [
				/* @__PURE__ */ (0, O.jsx)("p", { children: /* @__PURE__ */ (0, O.jsx)(l, { text: e.stem || "متن سؤال در دسترس نیست." }) }),
				/* @__PURE__ */ (0, O.jsx)(Q, { figure: e.figure }),
				/* @__PURE__ */ (0, O.jsx)($, {
					code: e.code,
					blanks: e.blanks
				}),
				/* @__PURE__ */ (0, O.jsxs)("div", {
					className: "sheet-stats top-gap",
					children: [/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "sheet-stat",
						children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "تعداد پاسخ‌ها" }), /* @__PURE__ */ (0, O.jsx)("strong", { children: m(e.responses) })]
					}), /* @__PURE__ */ (0, O.jsxs)("div", {
						className: "sheet-stat",
						children: [/* @__PURE__ */ (0, O.jsx)("span", { children: "پاسخ کاملِ درست" }), /* @__PURE__ */ (0, O.jsx)("strong", { children: m(e.correct) })]
					})]
				}),
				n.length ? /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)("h3", {
					className: "top-gap",
					children: "گزینه‌های انتخاب‌شده"
				}), n.map(([t, n]) => /* @__PURE__ */ (0, O.jsxs)("div", {
					className: "answer",
					children: [/* @__PURE__ */ (0, O.jsx)("p", { children: /* @__PURE__ */ (0, O.jsx)(l, { text: e.options?.find(([e]) => e === t)?.[1] || t }) }), /* @__PURE__ */ (0, O.jsxs)("small", { children: [m(n), " پاسخ"] })]
				}, t))] }) : /* @__PURE__ */ (0, O.jsx)("p", {
					className: "small muted top-gap",
					children: "برای سؤال‌های جای خالی، جزئیات هر پاسخ در ثبت آزمون قابل بررسی است."
				})
			]
		})
	] });
}
function oe({ sheet: e, confirmation: t, actions: n, labels: r }) {
	let a = J(!!e), o = J(!!t), s = e?.kind === "attempt" ? "attempt:" + e.id : e && "user" in e ? e.kind + ":" + e.user : e?.kind;
	(0, d.useEffect)(() => {
		a.current && (a.current.scrollTop = 0);
	}, [s, a]);
	let c = e?.kind === "attempt" ? "بررسی پاسخ آزمون" : e?.kind === "question" ? "تحلیل سؤال" : e?.kind === "request" ? "بررسی درخواست" : "پروندهٔ آموزشی دانشجو", l = t?.status === "active";
	return /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)("dialog", {
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
			Y(e) && n.closeSheet();
		},
		children: e && /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsxs)("header", {
			className: "sheet-head",
			children: [/* @__PURE__ */ (0, O.jsx)("span", { children: c }), /* @__PURE__ */ (0, O.jsx)("button", {
				className: "icon-btn",
				type: "button",
				"aria-label": "بستن جزئیات",
				onClick: n.closeSheet,
				children: /* @__PURE__ */ (0, O.jsx)(i, { name: "close" })
			})]
		}), /* @__PURE__ */ (0, O.jsx)("div", {
			className: "sheet-body",
			children: e.kind === "attempt" ? /* @__PURE__ */ (0, O.jsx)(ie, {
				sheet: e,
				labels: r,
				actions: n
			}) : e.kind === "question" ? /* @__PURE__ */ (0, O.jsx)(ae, {
				concept: e.question,
				labels: r
			}) : /* @__PURE__ */ (0, O.jsx)(Z, {
				sheet: e,
				labels: r,
				actions: n
			})
		})] })
	}), /* @__PURE__ */ (0, O.jsx)("dialog", {
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
			Y(e) && n.cancelConfirmation();
		},
		children: t && /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
			/* @__PURE__ */ (0, O.jsx)("h2", {
				id: "instructor-confirm-title",
				children: l ? "تأیید دسترسی به کلاس" : "غیرفعال‌کردن دسترسی"
			}),
			/* @__PURE__ */ (0, O.jsxs)("p", { children: [
				t.name,
				/* @__PURE__ */ (0, O.jsx)("br", {}),
				/* @__PURE__ */ (0, O.jsx)("bdi", { children: t.email })
			] }),
			/* @__PURE__ */ (0, O.jsx)("p", { children: l ? "این حساب به محتوای کلاس دسترسی خواهد داشت." : "دسترسی این حساب متوقف می‌شود؛ نمره‌ها، XP و کارهای قبلی حفظ می‌شوند." }),
			t.error ? /* @__PURE__ */ (0, O.jsx)("p", {
				role: "alert",
				children: D(t.error)
			}) : null,
			t.busy && /* @__PURE__ */ (0, O.jsx)("p", {
				role: "status",
				children: "در حال ثبت وضعیت…"
			}),
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "confirm-actions",
				children: [/* @__PURE__ */ (0, O.jsx)("button", {
					className: "btn",
					type: "button",
					disabled: t.busy,
					onClick: n.cancelConfirmation,
					children: "انصراف"
				}), /* @__PURE__ */ (0, O.jsx)("button", {
					className: "btn " + (l ? "primary" : "danger"),
					type: "button",
					disabled: t.busy,
					onClick: () => void n.commitMembership(),
					children: l ? "تأیید دسترسی" : "غیرفعال‌کردن"
				})]
			})
		] })
	})] });
}
// frontend/instructor/controller.ts
function se(e, t) {
	let { courses: n, catalog: r, rpc: i } = e, a = b(e.isCurrent), o = /* @__PURE__ */ new Set(), s, c, l = {
		course: n[0].course_id,
		view: "overview",
		overviewLoading: !0,
		filters: v(),
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
	let d = () => l.overview?.lessons || r.find((e) => e.id === l.course)?.lessons || [], f = (e) => e === "attempts" ? "classroom_instructor_attempts" : "classroom_instructor_students", h = () => ({
		index: 0,
		cursors: [null],
		asOf: null,
		loading: !0
	}), g = (e, t) => u({ pages: {
		...l.pages,
		[e]: t
	} }), _ = (e, t, n = !1) => {
		let r = {
			...l.filters[e],
			...t
		};
		n && y(r), u({ filters: {
			...l.filters,
			[e]: r
		} });
	}, x = (e) => u({ sheet: e });
	function T(e) {
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
			let n = C(await i("classroom_instructor_overview", { p_course: t }));
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
		let t = a.ticket("list-" + e), n = E(e, l.course, l.filters[e]);
		g(e, { loading: !0 });
		try {
			let r = S(await i(f(e), n));
			if (!t()) return;
			e !== "attempts" && r.rows.forEach(w), r.as_of && _(e, { asOf: r.as_of }), g(e, { data: r });
		} catch (n) {
			t() && !O(n) && g(e, { error: n });
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
		return clearTimeout(s), l.view === "overview" ? k() : l.view === "exam-results" ? Promise.resolve() : l.view === "attempts" && l.filters.attempts.section === "concepts" ? j() : A(l.view);
	}
	function N() {
		a.cancel("export"), u({
			exporting: !1,
			exportProgress: ""
		});
	}
	function P(e) {
		!(e === "exam-results" || p.some(([t]) => t === e)) || l.mutating || l.accessError || e === l.view || (clearTimeout(s), N(), u({ view: e }), M());
	}
	function F(e) {
		n.some((t) => t.course_id === e) && e !== l.course && !l.mutating && (clearTimeout(s), clearTimeout(c), a.invalidate(), u({
			course: e,
			overview: void 0,
			overviewError: void 0,
			overviewLoading: !0,
			filters: v(),
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
		if (l.view === "overview" || l.view === "exam-results" || l.view === "requests" || l.accessError) return;
		let n = l.view;
		a.cancel("list-" + n), N(), clearTimeout(s), _(n, { query: e.slice(0, 120) }, !0), t && (s = setTimeout(() => {
			a.current() && l.view === n && A(n);
		}, 250));
	}
	function L(e, t) {
		let n = l.view;
		n !== "overview" && n !== "exam-results" && (N(), _(n, { [e]: e === "lesson" ? t || null : t }, !0), M());
	}
	function R(e) {
		N(), _("attempts", { section: e }), l.view === "attempts" ? M() : P("attempts");
	}
	function z(e) {
		N(), _("labs", { mission: e });
	}
	function B(e) {
		let t = l.view;
		if (t === "overview" || t === "exam-results") return;
		let n = l.filters[t], r = l.pages[t]?.data?.next_cursor;
		if (l.pages[t]?.loading || e > 0 && !r || e < 0 && !n.index) return;
		let i = n.cursors.slice(), a = n.index + e;
		e > 0 && (i[a] = r), _(t, {
			cursors: i,
			index: a
		}), A(t);
	}
	function V() {
		if (N(), l.view === "overview") return k();
		if (l.view === "exam-results") return Promise.resolve();
		if (!l.accessError) return _(l.view, {}, !0), Promise.allSettled([k(), M()]);
	}
	function H() {
		l.mutating || (a.cancel("sheet"), a.cancel("history"), a.cancel("prepare-member"), x());
	}
	async function U(e) {
		let t = l.sheet;
		if (t?.kind !== "student") return;
		let n = a.ticket("history"), r = l.course, o = t.user, s = e || t.history;
		x({
			...t,
			history: {
				...s,
				loading: !0,
				error: void 0
			}
		});
		let c = () => n() && l.sheet?.kind === "student" && l.sheet.user === o;
		try {
			let e = S(await i("classroom_instructor_attempts", {
				p_course: r,
				p_user: o,
				p_limit: 5,
				p_after: s.cursors[s.index],
				p_as_of: s.asOf
			}));
			c() && x({
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
			c() && !O(e) && x({
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
		x(r);
		try {
			let a = w(await i("classroom_instructor_student", {
				p_course: l.course,
				p_user: e
			}));
			if (!n()) return;
			x({
				...r,
				person: a
			}), t === "student" && U();
		} catch (e) {
			n() && !O(e) && x({
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
		x(c);
		try {
			let t = await i("classroom_attempt", { p_id: e });
			if (!s()) return;
			if (!t?.result || !t.lesson_id || !d().some((e) => e.id === t.lesson_id)) throw Error("INVALID_INSTRUCTOR_RESPONSE");
			x({
				...c,
				record: t
			});
		} catch (e) {
			s() && !O(e) && x({
				...c,
				error: e
			});
		}
	}
	function q(e) {
		a.cancel("sheet"), a.cancel("history"), x({
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
			for (let e of Object.keys(n)) n[e] = { ...n[e] }, y(n[e]);
			u({
				mutating: !1,
				confirmation: void 0,
				filters: n,
				pages: {},
				overviewError: void 0
			}), H(), T("دسترسی " + (e.name || "دانشجو") + " " + (e.status === "active" ? "فعال" : "غیرفعال") + " شد."), l.view === "overview" ? await k() : await Promise.allSettled([k(), M()]);
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
		if (l.exporting || l.accessError || e === "overview" || e === "exam-results" || e === "requests" || e === "attempts" && l.filters.attempts.section === "concepts") return;
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
			let a = await ne((t) => i(f(e), t), E(e, l.course, r, 100), {
				alive: n,
				onProgress: (e, t) => {
					n() && u({ exportProgress: m(e) + " از " + m(t) + " ردیف دریافت شد." });
				}
			});
			if (!n()) return;
			t("classroom-" + e + "-" + (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) + ".csv", ee(te(e, a, r.mission))), T("CSV شامل " + m(a.length) + " ردیف فیلترشده آماده شد.");
		} catch (e) {
			n() && !O(e) && T(D(e));
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
			I("", !1), l.view !== "overview" && l.view !== "exam-results" && A(l.view);
		},
		dispose() {
			a.dispose(), clearTimeout(s), clearTimeout(c), o.clear();
		}
	};
}
// frontend/instructor/mount.tsx
var ce = [
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
		name: "تمرین‌های یادداشت‌ها",
		title: "تمرین‌های یادداشت‌ها",
		description: "پاسخ‌های ثبت‌شده و سؤال‌های نیازمند توضیح دوباره را ببینید."
	},
	{
		id: "exam-results",
		icon: "quiz",
		name: "میان‌ترم و امتحانات",
		title: "نتایج امتحانات مستقل",
		description: "نمرهٔ دانشجویان، پاسخ‌های هر سؤال و بازخوردهای ثبت‌شده را بررسی کنید."
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
function le({ controller: e, options: t }) {
	let n = (0, d.useSyncExternalStore)(e.subscribe, e.getSnapshot), r = L(n, t.courses, t.catalog), a = ce.find((e) => e.id === n.view), o = (0, d.useRef)(null), s = (0, d.useRef)(n.view);
	(0, d.useEffect)(() => {
		s.current !== n.view && o.current?.focus({ preventScroll: !0 }), s.current = n.view;
	}, [n.view]);
	let c = [
		"students",
		"attempts",
		"labs"
	].includes(n.view) && (n.view !== "attempts" || n.filters.attempts.section !== "concepts"), l = n.view === "overview" ? n.overviewLoading : n.view !== "exam-results" && !!(n.pages[n.view]?.loading || n.conceptLoading);
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		"data-react-instructor": "",
		className: "instructor-react",
		children: [
			/* @__PURE__ */ (0, O.jsxs)("div", {
				className: "instructor-app",
				children: [/* @__PURE__ */ (0, O.jsxs)("aside", {
					className: "sidebar",
					children: [/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "teacher-side-brand",
						children: [/* @__PURE__ */ (0, O.jsx)(i, { name: "dashboard" }), /* @__PURE__ */ (0, O.jsx)("span", { children: "پنل مدرس" })]
					}), /* @__PURE__ */ (0, O.jsx)("nav", {
						className: "side-nav",
						"aria-label": "بخش‌های پنل مدرس",
						"data-instructor-nav": "",
						children: ce.map((t) => /* @__PURE__ */ (0, O.jsxs)("button", {
							type: "button",
							"data-view": t.id,
							"aria-current": t.id === n.view ? "page" : void 0,
							onClick: () => e.navigate(t.id),
							disabled: n.mutating || !!n.accessError,
							children: [
								/* @__PURE__ */ (0, O.jsx)(i, { name: t.icon }),
								/* @__PURE__ */ (0, O.jsx)("span", { children: t.name }),
								t.id === "requests" && !!n.overview?.stats.pending_students && /* @__PURE__ */ (0, O.jsx)("span", {
									className: "count",
									children: m(n.overview.stats.pending_students)
								})
							]
						}, t.id))
					})]
				}), /* @__PURE__ */ (0, O.jsxs)("section", {
					className: "content",
					"aria-label": "گزارش مدرس",
					children: [/* @__PURE__ */ (0, O.jsxs)("header", {
						className: "teacher-header",
						children: [
							/* @__PURE__ */ (0, O.jsxs)("div", {
								className: "teacher-context",
								children: [/* @__PURE__ */ (0, O.jsx)("div", {
									className: "teacher-course",
									children: t.courses.length > 1 ? /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)("label", {
										htmlFor: "instructor-course",
										children: "کلاس"
									}), /* @__PURE__ */ (0, O.jsx)("select", {
										id: "instructor-course",
										"data-course": "",
										value: n.course,
										disabled: n.mutating,
										onChange: (t) => e.changeCourse(t.target.value),
										children: t.courses.map((e) => /* @__PURE__ */ (0, O.jsx)("option", {
											value: e.course_id,
											children: e.title
										}, e.course_id))
									})] }) : /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [/* @__PURE__ */ (0, O.jsx)("span", {
										className: "teacher-course-label",
										children: "کلاس"
									}), /* @__PURE__ */ (0, O.jsx)("bdi", { children: r.courseTitle })] })
								}), n.overview?.server_now && /* @__PURE__ */ (0, O.jsxs)("span", {
									className: "teacher-refresh-time",
									children: ["آخرین دریافت: ", g(n.overview.server_now, !0)]
								})]
							}),
							/* @__PURE__ */ (0, O.jsxs)("div", {
								className: "page-heading",
								children: [/* @__PURE__ */ (0, O.jsxs)("div", { children: [/* @__PURE__ */ (0, O.jsx)("h1", {
									tabIndex: -1,
									ref: o,
									children: a.title
								}), /* @__PURE__ */ (0, O.jsx)("p", { children: a.description })] }), !n.accessError && /* @__PURE__ */ (0, O.jsxs)("div", {
									className: "heading-actions",
									children: [c && /* @__PURE__ */ (0, O.jsxs)("button", {
										className: "btn",
										type: "button",
										disabled: n.exporting || !!l,
										onClick: () => void e.exportCSV(),
										children: [/* @__PURE__ */ (0, O.jsx)(i, { name: "download" }), n.exporting ? "در حال آماده‌سازی…" : "دریافت CSV"]
									}), n.view !== "exam-results" && /* @__PURE__ */ (0, O.jsx)("button", {
										className: "btn",
										type: "button",
										disabled: n.mutating || !!l,
										onClick: () => void e.refresh(),
										children: l ? "در حال دریافت…" : "به‌روزرسانی"
									})]
								})]
							}),
							n.exporting && /* @__PURE__ */ (0, O.jsx)("p", {
								className: "small muted",
								role: "status",
								children: n.exportProgress
							})
						]
					}), n.accessError ? /* @__PURE__ */ (0, O.jsx)("section", {
						className: "card",
						children: /* @__PURE__ */ (0, O.jsx)(F, {
							title: "دسترسی مدرس تأیید نشد",
							action: /* @__PURE__ */ (0, O.jsx)("a", {
								className: "btn",
								href: t.url("dashboard/"),
								children: "داشبورد ←"
							}),
							children: D(n.accessError)
						})
					}) : n.view === "overview" ? /* @__PURE__ */ (0, O.jsx)(R, {
						state: n,
						labels: r,
						actions: e
					}) : n.view === "exam-results" ? /* @__PURE__ */ (0, O.jsx)(q, {
						course: n.course,
						rpc: t.rpc
					}, n.course) : /* @__PURE__ */ (0, O.jsx)(W, {
						state: n,
						labels: r,
						actions: e
					})]
				})]
			}),
			/* @__PURE__ */ (0, O.jsx)(oe, {
				sheet: n.sheet,
				confirmation: n.confirmation,
				labels: r,
				actions: e
			}),
			/* @__PURE__ */ (0, O.jsx)("div", {
				className: "toast",
				"data-instructor-toast": "",
				role: "status",
				hidden: !n.toast,
				children: n.toast
			})
		]
	});
}
function ue(e, t) {
	if (!t.courses.length) throw Error("TEACHER_REQUIRED");
	let n = e.ownerDocument, r = n.defaultView;
	if (!r) throw Error("INSTRUCTOR_WINDOW_UNAVAILABLE");
	let i = /* @__PURE__ */ new Map(), a = se({
		...t,
		isCurrent: () => e.isConnected && t.isCurrent()
	}, (e, t) => {
		let a = r.URL.createObjectURL(new r.Blob([t], { type: "text/csv;charset=utf-8" })), o = n.createElement("a");
		o.href = a, o.download = e, o.hidden = !0, n.body.append(o), o.click(), o.remove(), i.set(a, r.setTimeout(() => {
			r.URL.revokeObjectURL(a), i.delete(a);
		}, 3e3));
	}), o = (0, f.createRoot)(e, { identifierPrefix: "instructor-" });
	return o.render(/* @__PURE__ */ (0, O.jsx)(le, {
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
export { ue as mountInstructor };
