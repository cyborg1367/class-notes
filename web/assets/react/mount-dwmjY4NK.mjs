import { a as e, i as t, n, t as r } from "./jsx-runtime-CMv_BHj2.mjs";
import { n as i, r as a } from "./paper-icons-DhTBlJcb.mjs";
// web/assets/review.mjs
var o = /* @__PURE__ */ e(t(), 1), s = n(), c = (e) => String(e ?? "").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\u064b-\u065f\u200c]/g, "").toLocaleLowerCase().trim();
function l(e, { tab: t = "due", search: n = "", lesson: r = "" } = {}) {
	let i = new Map((e.concepts || []).map((e) => [e.id, e])), a = c(n);
	return (e.entries || []).filter((e) => (t !== "due" || e.due) && (t !== "bookmarked" || e.bookmarked) && (!r || i.get(e.concept_id)?.lesson_id === r) && (!a || c(e.title + " " + e.note + " " + (i.get(e.concept_id)?.description || "")).includes(a)));
}
var u = (e) => l(e).slice(0, 3);
function d(e, t) {
	return !e || !/^machine-learning\/[a-z0-9-]+$/.test(e.lesson_id) ? null : t(e.lesson_id + "/" + (/^[A-Za-z0-9_-]+$/.test(e.review_anchor || "") ? "#" + e.review_anchor : ""));
}
function f(e) {
	return e?.correct ? e.hint_used ? {
		status: "with-hint",
		title: "پاسخ درست بود؛ با کمک راهنما."
	} : e.preparation_used === !0 ? {
		status: "after-reading",
		title: "پس از بازخوانی، درست پاسخ دادی."
	} : e.preparation_used === !1 ? {
		status: "retrieval",
		title: "در این مثال، بدون بازخوانی درست پاسخ دادی."
	} : {
		status: "unclassified",
		title: "در این مثال، درست پاسخ دادی."
	} : {
		status: "needs-review",
		title: "به نکته برگردیم و دوباره امتحان کنیم."
	};
}
function p(e) {
	return e.flatMap((e) => [...e.note ? [{
		...e,
		isReflection: !1
	}] : [], ...e.last_reflection?.text ? [{
		...e,
		note: e.last_reflection.text,
		updated_at: e.last_reflection.at,
		isReflection: !0
	}] : []]).sort((e, t) => (Date.parse(t.updated_at) || 0) - (Date.parse(e.updated_at) || 0))[0];
}
// frontend/review/drafts.ts
var m = (e) => "note:" + (e || "new"), h = (e) => "reflection:" + e, g = (e) => "pending:" + e;
function _({ storage: e, userId: t }) {
	let n = "classroom-review-notebook:" + t + ":";
	function r(t) {
		try {
			return JSON.parse(e?.getItem(n + t) || "null");
		} catch {
			return null;
		}
	}
	function i(t, r) {
		try {
			return e ? (r === null ? e.removeItem(n + t) : e.setItem(n + t, JSON.stringify(r)), !0) : !1;
		} catch {
			return !1;
		}
	}
	function a(e) {
		let t = r(e);
		return t && typeof t == "object" ? t : {};
	}
	function o(e) {
		let { request: t, title: n, note: r, concept: i, revision: o } = a(m(e));
		return typeof t == "string" && typeof n == "string" && typeof r == "string" && typeof i == "string" && typeof o == "number" ? {
			request: t,
			title: n,
			note: r,
			concept: i,
			revision: o
		} : {};
	}
	function s(e) {
		let { entry: t, request: n, title: r, note: a, concept: o, revision: s } = e, c = t ? r === t.title && a === t.note : !r && !a && !o;
		return i(m(t?.id), c ? null : {
			request: n,
			title: r,
			note: a,
			concept: o,
			revision: s
		});
	}
	function c(e) {
		let { text: t, revision: n } = a(h(e));
		return typeof t == "string" && typeof n == "number" ? {
			text: t,
			revision: n
		} : null;
	}
	function l(e, t) {
		return i(h(e), t.text === t.saved ? null : {
			text: t.text,
			revision: t.revision
		});
	}
	function u(e) {
		let { run: t, answer: n } = a(g(e));
		if (!t || typeof t != "object") return null;
		let r = t;
		return r.entry_id !== e || typeof r.id != "string" || typeof r.question?.stem != "string" || !Array.isArray(r.question.options) || !r.question.options.every((e) => typeof e == "string") || n !== null && (typeof n != "string" || !/^\d+$/.test(n) || Number(n) >= r.question.options.length) ? null : {
			run: r,
			answer: n
		};
	}
	return {
		note: o,
		reflection: c,
		saveNote: s,
		saveReflection: l,
		pending: u,
		write: i
	};
}
// frontend/review/messages.ts
var v = (e, t) => typeof e == "object" && !!e && ("message" in e && String(e.message).includes(t) || "code" in e && e.code === t);
function y(e) {
	return v(e, "REVIEW_NOTE_CONFLICT") ? "نسخهٔ حساب در پنجرهٔ دیگری تغییر کرده است؛ متن تو حفظ شده است." : v(e, "REVIEW_CREATE_CONFLICT") ? "نسخهٔ قبلی این یادداشت ثبت شده است؛ نوشتهٔ فعلی در این مرورگر حفظ شده. مورد ثبت‌شده را از دفتر باز کن." : v(e, "REVIEW_ENTRY_EXISTS") ? "این موضوع از قبل در دفترت هست؛ همان مورد را باز کن." : v(e, "REVIEW_NOTE_LIMIT") ? "دفتر به سقف ۲۰۰ یادداشت آزاد رسیده است." : v(e, "CLASS_ACCESS_REQUIRED") ? "دسترسی این یادداشت فعال نیست؛ وضعیت عضویت را بررسی کن." : v(e, "PGRST202") || v(e, "does not exist") ? "به‌روزرسانی دفتر مرور هنوز روی سرور فعال نشده است. با مدرس در میان بگذار." : "ثبت یا دریافت کامل نشد. دوباره تلاش کن.";
}
// frontend/review/controller.ts
var b = {
	entries: [],
	concepts: []
};
function x(e) {
	let { rpc: t, isCurrent: n, requestId: r, updateURL: i } = e, a = _(e), o = new URL(e.initialURL), s = o.searchParams.get("lesson"), c = {
		phase: "loading",
		notebook: b,
		busy: !1,
		notice: "",
		error: !1,
		filters: {
			tab: "due",
			search: "",
			lesson: e.lessons.some((e) => e.id === s) ? s : ""
		},
		editor: null,
		practice: null
	}, l = /* @__PURE__ */ new Set(), d = !1, f = null, p = () => !d && n(), x = (e) => {
		p() && (c = {
			...c,
			...e
		}, l.forEach((e) => e()));
	}, S = (e, t = !1) => x({
		notice: e,
		error: t
	}), C = (e) => c.notebook.entries.find((t) => t.id === e), w = (e) => {
		let t = c.notebook, n = !!C(e.id);
		x({ notebook: {
			...t,
			entries: n ? t.entries.map((t) => t.id === e.id ? e : t) : [e, ...t.entries]
		} });
	};
	function T(e) {
		return f || !p() ? f ?? Promise.resolve() : (f = Promise.resolve().then(async () => {
			if (p()) try {
				await e();
			} catch (e) {
				S(y(e), !0);
			}
		}).finally(() => {
			f = null, x({ busy: !1 });
		}), x({ busy: !0 }), f);
	}
	async function E() {
		let e = await t("classroom_review_state");
		if (!p()) return !1;
		if (!Array.isArray(e?.entries) || !Array.isArray(e?.concepts)) throw Error("REVIEW_INVALID_RESPONSE");
		return x({ notebook: e }), !0;
	}
	function D(e = "") {
		i(null), x({
			practice: null,
			notice: e,
			error: !1
		});
	}
	function O(e) {
		x({ filters: {
			...c.filters,
			...e
		} });
	}
	function k(e) {
		p() && (i(e.entry.id, e.stage === "feedback" ? "question" : e.stage), x({
			practice: e,
			notice: "",
			error: !1
		}));
	}
	async function A() {
		return T(async () => {
			x({
				phase: "loading",
				notice: "",
				error: !1
			});
			try {
				if (!await E()) return;
				x({ phase: "ready" });
				let e = o.searchParams.get("practice"), t = o.searchParams.get("step");
				e && C(e)?.concept_id && await L(e, [], t === "question" || t === "concept" ? t : "reason");
			} catch (e) {
				c.phase === "loading" && x({ phase: "error" }), S(y(e), !0);
			}
		});
	}
	function j(e) {
		if (!p()) return;
		let t = a.note(e?.id);
		x({ editor: {
			entry: e,
			request: t.request ?? r(),
			title: t.title ?? e?.title ?? "",
			note: t.note ?? e?.note ?? "",
			concept: t.concept ?? e?.concept_id ?? "",
			revision: t.revision ?? e?.revision ?? 0,
			recovered: !!t.request,
			message: "",
			conflict: !1
		} });
	}
	function M(e) {
		if (!c.editor || c.busy || !p()) return;
		let t = {
			...c.editor,
			...e
		};
		if (e.concept !== void 0) {
			let n = c.notebook.concepts.find((t) => t.id === e.concept);
			n && (t.title = n.title), t.message = "";
		}
		a.saveNote(t), x({ editor: t });
	}
	function N() {
		!c.busy && p() && (c.editor && a.saveNote(c.editor), x({ editor: null }));
	}
	async function P(n) {
		let r = c.editor;
		if (!r) return !0;
		if (r.entry && r.note === r.entry.note && r.title === r.entry.title) return n && x({ editor: null }), !0;
		if (!r.title.trim() && !r.concept) return !r.note.trim() && !r.title.trim() || (x({ editor: {
			...r,
			message: "برای یادداشتت یک عنوان بنویس."
		} }), !1);
		let i = a.saveNote(r), o;
		try {
			if (r.entry) {
				let { id: e, bookmarked: n } = r.entry, i = await t("classroom_review_save", {
					p_entry: e,
					p_revision: r.revision,
					p_note: r.note,
					p_bookmarked: n,
					p_title: r.title
				});
				o = {
					...r.entry,
					revision: i,
					note: r.note,
					title: r.title,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				};
			} else o = {
				id: await t("classroom_review_add", {
					p_owner: e.userId,
					p_request: r.request,
					p_concept: r.concept || null,
					p_title: r.title,
					p_note: r.note
				}),
				revision: 0,
				concept_id: r.concept || null,
				title: r.title.trim(),
				note: r.note,
				bookmarked: !1,
				due: !!r.concept,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			};
		} catch (e) {
			let t = y(e) + (i ? " پیش‌نویس در همین مرورگر حفظ شده است." : "");
			return x({ editor: {
				...r,
				message: t,
				conflict: v(e, "REVIEW_NOTE_CONFLICT")
			} }), !1;
		}
		if (!p()) return !1;
		a.write(m(r.entry?.id), null), w(o), x({ editor: n ? null : {
			...r,
			entry: o,
			title: o.title,
			revision: o.revision
		} });
		try {
			await E();
		} catch {
			return n && S("یادداشت ذخیره شد. فهرست دفتر کامل تازه نشد؛ می‌توانی صفحه را دوباره باز کنی."), p();
		}
		return p() ? (n && S("یادداشت در حساب تو ذخیره شد."), !0) : !1;
	}
	async function F() {
		let e = c.editor;
		if (!e?.entry || !await E()) return;
		let t = C(e.entry.id);
		if (!t) return;
		let n = {
			...e,
			entry: t,
			revision: t.revision,
			remote: t.note,
			conflict: !1,
			message: "دو نسخه را مقایسه کن. ذخیرهٔ بعدی متن فعلی تو را در حساب ثبت می‌کند."
		};
		a.saveNote(n), x({ editor: n });
	}
	async function I(e) {
		let n = C(e);
		if (n) try {
			let r = await t("classroom_review_save", {
				p_entry: e,
				p_revision: n.revision,
				p_title: n.title,
				p_note: n.note,
				p_bookmarked: !n.bookmarked
			});
			p() && w({
				...n,
				bookmarked: !n.bookmarked,
				revision: r
			});
		} catch (e) {
			throw v(e, "REVIEW_NOTE_CONFLICT") && p() && await E(), e;
		}
	}
	async function L(e, n, r = "reason") {
		let i = C(e);
		if (!i?.concept_id) return;
		let o = await t("classroom_review_context", { p_entry: e });
		if (!p()) return;
		if (o?.entry_id !== e || !o.concept) throw Error("REVIEW_INVALID_CONTEXT");
		let s = {
			entry: i,
			context: o,
			queue: n,
			prepared: r === "concept"
		}, c = a.pending(e);
		if (c) {
			let e = {
				...s,
				stage: "question",
				run: c.run,
				selected: c.answer
			};
			k(e), await H(e, c.answer);
		} else r === "question" && !i.paused ? await R(s) : k({
			...s,
			stage: i.paused ? "reason" : r === "concept" ? "concept" : "reason"
		});
	}
	async function R(e) {
		let n = await t("classroom_review_open", {
			p_entry: e.entry.id,
			p_read_before: e.prepared
		});
		if (p()) {
			if (n?.entry_id !== e.entry.id || !Array.isArray(n.question?.options) || !n.question.options.length) throw Error("REVIEW_INVALID_QUESTION");
			k({
				...e,
				stage: "question",
				run: n,
				selected: null
			});
		}
	}
	function z(e) {
		k({
			...e,
			stage: "concept",
			prepared: !0
		});
	}
	async function B(e) {
		let n = c.practice;
		if (!n || n.stage !== "reason") return;
		let { entry: r } = n;
		if (r.paused) {
			if (await t("classroom_review_pause", {
				p_entry: r.id,
				p_revision: r.revision,
				p_paused: !1
			}), !p() || !await E()) return;
			let e = C(r.id);
			e && z({
				...n,
				entry: e
			});
		} else (e ? !r.last_review : r.last_review || n.prepared) ? await R(n) : z(n);
	}
	async function V() {
		let e = c.practice?.entry;
		e && (await t("classroom_review_pause", {
			p_entry: e.id,
			p_revision: e.revision,
			p_paused: !0
		}), p() && await E() && D("مرور این موضوع متوقف شد؛ از «همه» می‌توانی دوباره فعالش کنی."));
	}
	async function H(n, r) {
		let { run: i, entry: o } = n;
		a.write(g(o.id), {
			run: i,
			answer: r
		});
		let s = await t("classroom_review_finish", {
			p_run: i.id,
			p_answer: r
		});
		if (!p()) return;
		if (!s || typeof s.correct != "boolean") throw Error("REVIEW_INVALID_RECEIPT");
		e.onProgress();
		let c = s.reflection ?? "", l = a.reflection(i.id);
		k({
			...n,
			stage: "feedback",
			answer: r,
			receipt: s,
			reflection: {
				text: l?.text ?? c,
				revision: l?.revision ?? s.reflection_revision ?? 0,
				saved: c,
				message: "",
				conflict: !1
			}
		});
	}
	async function U() {
		let e = c.practice;
		if (e?.stage !== "question" || e.run.hint_used) return;
		let n = await t("classroom_review_hint", { p_run: e.run.id });
		x({ practice: {
			...e,
			run: {
				...e.run,
				hint: n,
				hint_used: !0
			}
		} });
	}
	async function W() {
		let e = c.practice;
		e?.stage === "question" && (await t("classroom_review_open", {
			p_entry: e.entry.id,
			p_read_before: !0
		}), p() && z(e));
	}
	async function G() {
		let e = c.practice;
		if (e?.stage !== "feedback") return !0;
		let { reflection: n, run: r } = e;
		if (n.text === n.saved) return !0;
		let i = a.saveReflection(r.id, n);
		try {
			let i = await t("classroom_review_reflect", {
				p_run: r.id,
				p_revision: n.revision,
				p_text: n.text
			});
			return p() ? (a.write(h(r.id), null), x({ practice: {
				...e,
				reflection: {
					...i,
					saved: i.text,
					conflict: !1,
					message: "برداشت تو در حساب ذخیره شد."
				}
			} }), !0) : !1;
		} catch (t) {
			let r = v(t, "REVIEW_REFLECTION_CONFLICT"), a = (r ? "برداشت این مرور در پنجرهٔ دیگری تغییر کرده است." : y(t)) + (i ? " پیش‌نویس در همین مرورگر حفظ شده است." : "");
			return x({ practice: {
				...e,
				reflection: {
					...n,
					conflict: r,
					message: a
				}
			} }), !1;
		}
	}
	async function K() {
		let e = c.practice;
		if (e?.stage !== "feedback") return;
		let n = await t("classroom_review_reflect", { p_run: e.run.id });
		if (!p()) return;
		let r = {
			...e.reflection,
			revision: n.revision,
			saved: n.text,
			remote: n.text,
			conflict: !1,
			message: "نسخهٔ حساب برای مقایسه نشان داده شد. ذخیرهٔ بعدی نوشتهٔ فعلی تو را ثبت می‌کند."
		};
		a.saveReflection(e.run.id, r), x({ practice: {
			...e,
			reflection: r
		} });
	}
	async function q(e) {
		let t = c.practice;
		if (!t || t.stage === "feedback" && !await G() || !p() || !await E()) return;
		t.stage === "feedback" && a.write(g(t.entry.id), null);
		let [n, ...r] = t.queue;
		if (e === "next" && n) await L(n, r);
		else if (e === "retry" && t.stage === "feedback") {
			let e = C(t.entry.id);
			if (!e) {
				D();
				return;
			}
			t.receipt.correct ? await R({
				...t,
				entry: e,
				prepared: !1
			}) : z({
				...t,
				entry: e
			});
		} else D(e === "next" ? "نتیجهٔ مرور در حساب تو ثبت شد." : "");
	}
	function J() {
		let { editor: e, practice: t } = c, n = !e || a.saveNote(e), r = t?.stage !== "feedback" || a.saveReflection(t.run.id, t.reflection);
		return n && r;
	}
	return {
		getSnapshot: () => c,
		subscribe(e) {
			return l.add(e), () => {
				l.delete(e);
			};
		},
		load: A,
		setFilters: O,
		openNote(e) {
			if (c.busy || !p()) return;
			let t = e ? C(e) : void 0;
			(!e || t) && j(t);
		},
		edit: M,
		closeEditor: N,
		saveNote: () => T(async () => {
			await P(!0) && c.editor && x({ editor: null });
		}),
		compareNote: () => T(F),
		openEntry(e) {
			if (c.busy || !p()) return;
			let t = C(e);
			t?.concept_id ? T(() => L(e, [])) : t && j(t);
		},
		reviewFromEditor: () => T(async () => {
			let e = c.editor?.entry?.id;
			e && await P(!1) && p() && (x({ editor: null }), await L(e, []));
		}),
		startSession() {
			if (c.busy || !p()) return;
			let [e, ...t] = u(c.notebook);
			e ? T(() => L(e.id, t.map((e) => e.id))) : c.notebook.entries.length ? O({ tab: "all" }) : j();
		},
		bookmark: (e) => T(() => I(e)),
		chooseReading: (e) => T(() => B(e)),
		pause: () => T(V),
		reason() {
			!c.busy && c.practice && k({
				...c.practice,
				stage: "reason"
			});
		},
		openQuestion: () => T(async () => {
			c.practice && await R(c.practice);
		}),
		select(e) {
			!c.busy && c.practice?.stage === "question" && x({ practice: {
				...c.practice,
				selected: e
			} });
		},
		hint: () => T(U),
		reread: () => T(W),
		answer(e = !1) {
			return T(async () => {
				let t = c.practice;
				t?.stage === "question" && (e || t.selected !== null) && await H(t, e ? null : t.selected);
			});
		},
		leave: (e) => T(() => q(e)),
		editReflection(e) {
			let t = c.practice;
			if (!p() || c.busy || t?.stage !== "feedback") return;
			let n = {
				...t.reflection,
				text: e
			};
			a.saveReflection(t.run.id, n), x({ practice: {
				...t,
				reflection: n
			} });
		},
		saveReflection: () => T(async () => {
			await G();
		}),
		compareReflection: () => T(K),
		persist: J,
		async prepareSignOut() {
			if (await f, !p()) return { saved: !0 };
			let e = J(), t = !1;
			return await T(async () => {
				let e = await P(!1), n = await G();
				t = e && n;
			}), {
				saved: t,
				localSaved: e
			};
		},
		dispose() {
			d || J(), d = !0, l.clear();
		}
	};
}
// frontend/review/Presentation.tsx
var S = r(), C = (e) => e.toLocaleString("fa-IR"), w = (e) => e && Number.isFinite(Date.parse(e)) ? new Date(e).toLocaleDateString("fa-IR", {
	month: "short",
	day: "numeric"
}) : "";
function T({ name: e }) {
	return /* @__PURE__ */ (0, S.jsx)("span", {
		className: "rv-glyph",
		"aria-hidden": "true",
		dangerouslySetInnerHTML: { __html: i(e) }
	});
}
function E() {
	return /* @__PURE__ */ (0, S.jsx)("span", {
		className: "rv-glyph",
		"aria-hidden": "true",
		dangerouslySetInnerHTML: { __html: a("review", "rv-cards") }
	});
}
function D({ value: e }) {
	let t = (e ?? "").split(/(\[\s*(?:\[[\d\s,.]+\]\s*,?\s*)+\]|\[[\d\s,.]+\]|\([\d\s,.]+\)|[A-Za-z][A-Za-z0-9_]*(?:\s*=\s*[\d.]+)?)/g);
	return /* @__PURE__ */ (0, S.jsx)(S.Fragment, { children: t.map((e, t) => t % 2 ? /* @__PURE__ */ (0, S.jsx)("bdi", {
		dir: "ltr",
		children: e
	}, t) : /* @__PURE__ */ (0, S.jsx)(o.Fragment, { children: e }, t)) });
}
function O({ tone: e = "outline", icon: t, children: n, ...r }) {
	return /* @__PURE__ */ (0, S.jsxs)("button", {
		type: "button",
		className: "rv-" + e,
		...r,
		children: [n, t && /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [" ", /* @__PURE__ */ (0, S.jsx)(T, { name: t })] })]
	});
}
function k({ id: e, children: t, level: n = 1 }) {
	let r = (0, o.useRef)(null);
	return (0, o.useEffect)(() => {
		r.current?.focus();
	}, []), /* @__PURE__ */ (0, S.jsx)(n === 1 ? "h1" : "h2", {
		id: e,
		ref: r,
		tabIndex: -1,
		children: t
	});
}
// frontend/review/NotebookLibrary.tsx
var A = {
	quiz: "از آزمون",
	lab: "از لابراتور",
	manual: "انتخاب خودت"
};
function j({ entry: e, index: t, lessonTitle: n, description: r, busy: i, controller: a }) {
	return /* @__PURE__ */ (0, S.jsxs)("article", {
		className: "rv-entry",
		children: [
			/* @__PURE__ */ (0, S.jsxs)("button", {
				type: "button",
				className: "rv-entry-open",
				"data-open": e.id,
				disabled: i,
				onClick: () => a.openEntry(e.id),
				children: [
					/* @__PURE__ */ (0, S.jsx)("span", {
						className: "rv-entry-number",
						dir: "ltr",
						children: String(t + 1).padStart(2, "0")
					}),
					/* @__PURE__ */ (0, S.jsxs)("span", { children: [
						/* @__PURE__ */ (0, S.jsx)("strong", { children: e.title }),
						/* @__PURE__ */ (0, S.jsxs)("small", { children: [
							n || "یادداشت شخصی",
							" · ",
							A[e.source?.kind ?? "manual"] ?? A.manual
						] }),
						/* @__PURE__ */ (0, S.jsx)("span", {
							className: "rv-entry-description",
							children: r || e.note.slice(0, 100) || "یادداشتی با زبان خودت."
						}),
						e.paused && /* @__PURE__ */ (0, S.jsx)("small", { children: "مرور این موضوع متوقف است؛ نوشته‌ها حفظ شده‌اند." }),
						e.concept_id && !e.due && !e.paused && e.next_due && /* @__PURE__ */ (0, S.jsxs)("small", { children: ["مرور بعدی: ", w(e.next_due)] })
					] }),
					/* @__PURE__ */ (0, S.jsx)("span", {
						className: "rv-open-arrow",
						children: /* @__PURE__ */ (0, S.jsx)(T, { name: "arrow" })
					})
				]
			}),
			/* @__PURE__ */ (0, S.jsx)("button", {
				type: "button",
				className: "rv-note-shortcut",
				"aria-label": "یادداشت شخصی دربارهٔ " + e.title,
				"data-edit-note": e.id,
				disabled: i,
				onClick: () => a.openNote(e.id),
				children: /* @__PURE__ */ (0, S.jsx)(T, { name: "pencil" })
			}),
			/* @__PURE__ */ (0, S.jsx)("button", {
				type: "button",
				className: "rv-bookmark",
				"aria-label": "نشان‌گذاری " + e.title,
				"aria-pressed": e.bookmarked,
				"data-bookmark": e.id,
				disabled: i,
				onClick: () => void a.bookmark(e.id),
				children: /* @__PURE__ */ (0, S.jsx)(T, { name: "bookmark" })
			})
		]
	});
}
var M = (0, o.memo)(function({ notebook: e, filters: t, busy: n, controller: r, lessons: i, dashboard: a }) {
	let { entries: s, concepts: c } = e, d = s.filter((e) => e.due).length, f = u(e).length, m = p(s), h = l(e, t), g = new Map(c.map((e) => [e.id, e])), _ = new Map(i.map((e) => [e.id, e.title])), v = [
		{
			id: "due",
			label: "برای امروز " + C(d)
		},
		{
			id: "all",
			label: "همه"
		},
		{
			id: "bookmarked",
			label: "نشان‌شده‌ها " + C(s.filter((e) => e.bookmarked).length)
		}
	], y = (0, o.useRef)(null);
	return /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [
		/* @__PURE__ */ (0, S.jsxs)("header", {
			className: "rv-heading",
			children: [/* @__PURE__ */ (0, S.jsxs)("div", { children: [
				/* @__PURE__ */ (0, S.jsxs)("nav", {
					"aria-label": "مسیر صفحه",
					children: [
						/* @__PURE__ */ (0, S.jsx)("a", {
							href: a,
							children: "داشبورد"
						}),
						/* @__PURE__ */ (0, S.jsx)("span", {
							"aria-hidden": "true",
							children: "/"
						}),
						/* @__PURE__ */ (0, S.jsx)("span", { children: "دفتر مرور" })
					]
				}),
				/* @__PURE__ */ (0, S.jsx)("h1", { children: "دفتر مرور شخصی" }),
				/* @__PURE__ */ (0, S.jsx)("p", { children: "هر بار مرور، فرصتی برای فهمیدنِ بهتر." })
			] }), /* @__PURE__ */ (0, S.jsxs)(O, {
				"data-new": "",
				disabled: n,
				onClick: () => r.openNote(),
				children: [/* @__PURE__ */ (0, S.jsx)(T, { name: "plus" }), " یادداشت تازه"]
			})]
		}),
		/* @__PURE__ */ (0, S.jsxs)("section", {
			className: "rv-hero",
			"aria-labelledby": "rv-today-title",
			children: [/* @__PURE__ */ (0, S.jsxs)("div", {
				className: "rv-hero-copy",
				children: [
					/* @__PURE__ */ (0, S.jsxs)("p", {
						className: "rv-eyebrow",
						children: [/* @__PURE__ */ (0, S.jsx)("span", {}), "پیشنهاد امروز"]
					}),
					/* @__PURE__ */ (0, S.jsx)("h2", {
						id: "rv-today-title",
						children: "کمی مرور، یک قدم جلوتر."
					}),
					/* @__PURE__ */ (0, S.jsx)("p", { children: d ? "به تجربهٔ قبلی برگرد، نکته را مرور کن و دوباره امتحان کن." : s.length ? "در حال حاضر موضوعی برای مرور زمان‌بندی‌شده آماده نیست." : "اولین موضوع را انتخاب کن و دفتر خودت را بساز." }),
					/* @__PURE__ */ (0, S.jsx)(E, {})
				]
			}), /* @__PURE__ */ (0, S.jsxs)("div", {
				className: "rv-hero-action",
				children: [
					/* @__PURE__ */ (0, S.jsx)("h3", { children: d ? C(f) + " موضوع در این مرور" : s.length ? "مرور آماده‌ای نداری" : "از یک موضوع شروع کن" }),
					/* @__PURE__ */ (0, S.jsxs)("p", { children: [/* @__PURE__ */ (0, S.jsx)(T, { name: "clock" }), d ? "حدود " + C(f * 3) + " دقیقه" : "با ریتم خودت پیش برو"] }),
					/* @__PURE__ */ (0, S.jsx)(O, {
						tone: "primary",
						icon: "arrow",
						"data-start": "",
						disabled: n,
						onClick: () => {
							r.startSession(), !d && s.length && y.current?.focus();
						},
						children: d ? "شروع مرور" : s.length ? "دیدن موضوعات" : "افزودن اولین موضوع"
					}),
					/* @__PURE__ */ (0, S.jsx)("small", { children: d > f ? C(d) + " موضوع آماده است؛ در این نوبت فقط " + C(f) + " موضوع را مرور می‌کنیم." : d ? "هر بار، روی یک موضوع تمرکز می‌کنیم." : "موضوعات و یادداشت‌ها در حساب تو ذخیره می‌شوند." })
				]
			})]
		}),
		/* @__PURE__ */ (0, S.jsxs)("div", {
			className: "rv-columns",
			children: [/* @__PURE__ */ (0, S.jsxs)("section", {
				className: "rv-library",
				"aria-labelledby": "rv-topics-title",
				children: [
					/* @__PURE__ */ (0, S.jsxs)("div", {
						className: "rv-library-head",
						children: [/* @__PURE__ */ (0, S.jsxs)("div", { children: [/* @__PURE__ */ (0, S.jsx)("h2", {
							id: "rv-topics-title",
							ref: y,
							tabIndex: -1,
							children: "موضوعات دفتر"
						}), /* @__PURE__ */ (0, S.jsxs)("span", { children: [C(s.length), " موضوع"] })] }), /* @__PURE__ */ (0, S.jsxs)("label", {
							className: "rv-search",
							children: [/* @__PURE__ */ (0, S.jsx)(T, { name: "search" }), /* @__PURE__ */ (0, S.jsx)("input", {
								type: "search",
								"data-search": "",
								placeholder: "جست‌وجوی موضوع…",
								"aria-label": "جست‌وجو در موضوع و یادداشت",
								value: t.search,
								onChange: (e) => r.setFilters({ search: e.target.value })
							})]
						})]
					}),
					/* @__PURE__ */ (0, S.jsxs)("div", {
						className: "rv-filters",
						children: [/* @__PURE__ */ (0, S.jsx)("div", {
							role: "group",
							"aria-label": "وضعیت مرور",
							children: v.map((e) => /* @__PURE__ */ (0, S.jsx)("button", {
								type: "button",
								"data-tab": e.id,
								"aria-pressed": t.tab === e.id,
								onClick: () => r.setFilters({ tab: e.id }),
								children: e.label
							}, e.id))
						}), /* @__PURE__ */ (0, S.jsxs)("label", {
							className: "rv-lesson-filter",
							children: [/* @__PURE__ */ (0, S.jsx)("span", {
								className: "sr-only",
								children: "فیلتر یادداشت"
							}), /* @__PURE__ */ (0, S.jsxs)("select", {
								"data-lesson": "",
								value: t.lesson,
								onChange: (e) => r.setFilters({ lesson: e.target.value }),
								children: [/* @__PURE__ */ (0, S.jsx)("option", {
									value: "",
									children: "همهٔ یادداشت‌ها"
								}), i.map((e) => /* @__PURE__ */ (0, S.jsx)("option", {
									value: e.id,
									children: e.title
								}, e.id))]
							})]
						})]
					}),
					/* @__PURE__ */ (0, S.jsx)("div", {
						"data-review-list": "",
						children: h.length ? h.map((e, t) => {
							let i = e.concept_id ? g.get(e.concept_id) : void 0;
							return /* @__PURE__ */ (0, S.jsx)(j, {
								entry: e,
								index: t,
								busy: n,
								controller: r,
								lessonTitle: i ? _.get(i.lesson_id) || "یادداشت مرتبط" : void 0,
								description: i?.description
							}, e.id);
						}) : /* @__PURE__ */ (0, S.jsxs)("div", {
							className: "rv-empty",
							children: [
								/* @__PURE__ */ (0, S.jsx)("h3", { children: t.search || t.lesson ? "موضوعی با این فیلتر پیدا نشد." : t.tab === "due" ? "مرور آماده‌ای باقی نمانده است." : t.tab === "bookmarked" ? "هنوز موضوعی نشان نکرده‌ای." : "دفترت هنوز خالی است." }),
								/* @__PURE__ */ (0, S.jsx)("p", { children: t.tab === "due" ? "می‌توانی از «همه» موضوعات قبلی را ببینی یا موضوع تازه‌ای اضافه کنی." : "یک موضوع انتخاب کن یا یادداشت شخصی خودت را بنویس." }),
								/* @__PURE__ */ (0, S.jsx)(O, {
									tone: "text-link",
									icon: "plus",
									disabled: n,
									onClick: () => r.openNote(),
									children: "افزودن موضوع"
								})
							]
						})
					})
				]
			}), /* @__PURE__ */ (0, S.jsxs)("aside", {
				className: "rv-side",
				children: [/* @__PURE__ */ (0, S.jsxs)("section", {
					className: "rv-note-paper",
					children: [
						/* @__PURE__ */ (0, S.jsxs)("p", {
							className: "rv-note-kicker",
							children: ["با زبان خودم ", /* @__PURE__ */ (0, S.jsx)(T, { name: "pencil" })]
						}),
						/* @__PURE__ */ (0, S.jsx)("h2", { children: m ? m.isReflection ? "آخرین برداشت من" : "آخرین یادداشت من" : "یادداشتی برای خودت" }),
						m && /* @__PURE__ */ (0, S.jsx)("h3", { children: m.title }),
						/* @__PURE__ */ (0, S.jsx)("p", {
							className: "rv-note-preview",
							children: m ? m.note.slice(0, 240) + (m.note.length > 240 ? "…" : "") : "چیزی را که تازه فهمیده‌ای، با زبان خودت بنویس؛ حتی در یک جمله."
						}),
						/* @__PURE__ */ (0, S.jsx)("div", {
							className: "rv-writing-lines",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, S.jsx)(O, {
							tone: "text-link",
							icon: "arrow",
							disabled: n,
							onClick: () => m?.isReflection ? r.openEntry(m.id) : r.openNote(m?.id),
							children: m ? m.isReflection ? "مشاهدهٔ موضوع" : "ویرایش یادداشت" : "نوشتن اولین یادداشت"
						})
					]
				}), /* @__PURE__ */ (0, S.jsxs)("p", {
					className: "rv-private",
					children: [/* @__PURE__ */ (0, S.jsx)(T, { name: "lock" }), "یادداشت‌ها فقط برای خودت هستند."]
				})]
			})]
		})
	] });
});
// frontend/review/NoteDialog.tsx
function N({ editor: e, notebook: t, busy: n, controller: r, url: i }) {
	let a = (0, o.useRef)(null);
	(0, o.useEffect)(() => {
		let e = a.current;
		if (!e) return;
		let t = e.ownerDocument.activeElement;
		return typeof e.showModal == "function" ? e.showModal() : e.setAttribute("open", ""), e.querySelector("[data-note-title]:not([readonly]),textarea")?.focus(), () => {
			e.open && typeof e.close == "function" && e.close();
			let n = e.ownerDocument;
			n.defaultView?.requestAnimationFrame(() => {
				t instanceof HTMLElement && t.isConnected && n.activeElement === n.body && t.focus();
			});
		};
	}, []);
	let { entry: s } = e, c = t.concepts.find((e) => e.id === s?.concept_id), l = d(c, i), u = !s && e.concept ? t.entries.find((t) => t.concept_id === e.concept) : void 0;
	return /* @__PURE__ */ (0, S.jsxs)("dialog", {
		ref: a,
		className: "rv-dialog",
		"aria-labelledby": "rv-dialog-title",
		onCancel: (e) => {
			e.preventDefault(), r.closeEditor();
		},
		children: [
			/* @__PURE__ */ (0, S.jsxs)("header", {
				className: "rv-dialog-head",
				children: [/* @__PURE__ */ (0, S.jsx)("h2", {
					id: "rv-dialog-title",
					children: s ? "موضوع و یادداشت من" : "یادداشت تازه"
				}), /* @__PURE__ */ (0, S.jsx)("button", {
					className: "rv-icon",
					type: "button",
					"aria-label": "بستن",
					"data-close": "",
					disabled: n,
					onClick: r.closeEditor,
					children: /* @__PURE__ */ (0, S.jsx)(T, { name: "close" })
				})]
			}),
			/* @__PURE__ */ (0, S.jsxs)("form", {
				"data-note-form": "",
				onSubmit: (e) => {
					e.preventDefault(), r.saveNote();
				},
				children: [
					/* @__PURE__ */ (0, S.jsxs)("fieldset", {
						className: "rv-editor-fields",
						disabled: n,
						children: [
							!s && /* @__PURE__ */ (0, S.jsxs)("label", { children: ["موضوع مرتبط", /* @__PURE__ */ (0, S.jsxs)("select", {
								"data-note-concept": "",
								value: e.concept,
								onChange: (e) => r.edit({ concept: e.target.value }),
								children: [/* @__PURE__ */ (0, S.jsx)("option", {
									value: "",
									children: "یادداشت آزاد"
								}), t.concepts.map((e) => /* @__PURE__ */ (0, S.jsx)("option", {
									value: e.id,
									children: e.title
								}, e.id))]
							})] }),
							/* @__PURE__ */ (0, S.jsxs)("label", { children: ["عنوان", /* @__PURE__ */ (0, S.jsx)("input", {
								"data-note-title": "",
								maxLength: 160,
								required: !0,
								readOnly: !!(s?.concept_id || e.concept),
								value: e.title,
								onChange: (e) => r.edit({ title: e.target.value })
							})] }),
							s?.source?.description && /* @__PURE__ */ (0, S.jsx)("p", {
								className: "rv-context",
								children: s.source.description
							}),
							e.recovered && /* @__PURE__ */ (0, S.jsx)("p", {
								className: "rv-draft-notice",
								children: "پیش‌نویس ذخیره‌نشدهٔ همین مرورگر بازیابی شد."
							}),
							/* @__PURE__ */ (0, S.jsxs)("label", { children: ["با زبان خودم", /* @__PURE__ */ (0, S.jsx)("textarea", {
								"data-note-body": "",
								maxLength: 4e3,
								rows: 5,
								value: e.note,
								placeholder: "چه چیزی را بهتر فهمیدم؟ دفعهٔ بعد به چه نکته‌ای دقت کنم؟",
								onChange: (e) => r.edit({ note: e.target.value })
							})] })
						]
					}),
					u && /* @__PURE__ */ (0, S.jsxs)("p", {
						className: "rv-dialog-status",
						children: ["این موضوع از قبل در دفترت هست. ", /* @__PURE__ */ (0, S.jsx)(O, {
							tone: "text-link",
							disabled: n,
							onClick: () => r.openNote(u.id),
							children: "بازکردن موضوع موجود ←"
						})]
					}),
					/* @__PURE__ */ (0, S.jsx)("p", {
						className: "rv-dialog-status",
						role: "status",
						"data-note-status": "",
						children: e.message
					}),
					e.conflict && /* @__PURE__ */ (0, S.jsx)(O, {
						"data-compare": "",
						disabled: n,
						onClick: () => void r.compareNote(),
						children: "دریافت نسخهٔ حساب برای مقایسه"
					}),
					e.remote !== void 0 && /* @__PURE__ */ (0, S.jsxs)("details", {
						open: !0,
						children: [/* @__PURE__ */ (0, S.jsx)("summary", { children: "متن ذخیره‌شدهٔ حساب" }), /* @__PURE__ */ (0, S.jsx)("p", {
							className: "rv-preserve",
							children: e.remote || "خالی"
						})]
					}),
					/* @__PURE__ */ (0, S.jsxs)("div", {
						className: "rv-dialog-actions",
						children: [
							/* @__PURE__ */ (0, S.jsx)(O, {
								tone: "primary",
								type: "submit",
								disabled: n || !!u,
								children: "ذخیرهٔ یادداشت"
							}),
							s?.concept_id && /* @__PURE__ */ (0, S.jsx)(O, {
								"data-practice": "",
								disabled: n,
								onClick: () => void r.reviewFromEditor(),
								children: "مرور این موضوع"
							}),
							l && /* @__PURE__ */ (0, S.jsxs)("a", {
								className: "rv-text-link",
								href: l,
								children: [
									c?.review_anchor ? "مرور بخش مرتبط" : "بازکردن یادداشت مرتبط",
									" ",
									/* @__PURE__ */ (0, S.jsx)(T, { name: "arrow" })
								]
							})
						]
					})
				]
			}),
			!!s?.history?.length && /* @__PURE__ */ (0, S.jsxs)("details", {
				className: "rv-history",
				children: [/* @__PURE__ */ (0, S.jsxs)("summary", { children: [
					"سابقهٔ مرور · ",
					C(s?.history?.length ?? 0),
					" مرور اخیر"
				] }), /* @__PURE__ */ (0, S.jsx)("ul", { children: s?.history?.map((e, t) => /* @__PURE__ */ (0, S.jsxs)("li", { children: [
					/* @__PURE__ */ (0, S.jsx)("time", {
						dateTime: e.at,
						children: w(e.at)
					}),
					/* @__PURE__ */ (0, S.jsx)("span", { children: e.correct ? e.hint_used ? "پاسخ درست با راهنما" : e.preparation_used ? "پاسخ درست پس از بازخوانی" : e.preparation_used === !1 ? "پاسخ درست بدون بازخوانی" : "پاسخ درست" : "نیازمند مرور دوباره" }),
					e.reflection && /* @__PURE__ */ (0, S.jsx)("p", {
						className: "rv-history-reflection",
						children: e.reflection
					})
				] }, e.at ?? t)) })]
			})
		]
	});
}
// frontend/review/ReviewPractice.tsx
var P = [
	"چرایی مرور",
	"بازخوانی",
	"آزمودن",
	"برداشت من"
], F = {
	CONFUSION_LAYOUT: "گزارش ماتریس خطا در این بررسی، با نتیجهٔ مورد انتظار هم‌خوان نبود.",
	SPLIT_ALIGNMENT: "تقسیم داده در این بررسی، با قرارداد آموزش و آزمون هم‌خوان نبود.",
	ACCURACY_VALUES: "شمارش پاسخ‌های درست یا نسبت گزارش‌شده در این بررسی هم‌خوان نبود.",
	NEIGHBOR_ORDER: "ترتیب همسایه‌های خروجی در این بررسی به بازبینی نیاز داشت.",
	INVALID_INDICES: "اندیس‌های برگردانده‌شده در این بررسی معتبر نبودند.",
	LABEL_ALIGNMENT: "برچسب‌های خروجی با سطرهای همسایه‌ها هم‌ردیف نبودند.",
	VOTE_COUNTS: "تعداد رأی‌های گزارش‌شده در این بررسی هم‌خوان نبود.",
	MAJORITY: "کلاس برنده در این بررسی با رأی اکثریت هم‌خوان نبود.",
	MAJORITY_TIE: "قاعدهٔ رفع تساوی در این بررسی به بازبینی نیاز داشت.",
	VOTE_SHARE: "سهم رأی گزارش‌شده در این بررسی هم‌خوان نبود."
};
function I({ item: e, lessons: t, url: n }) {
	let r = e?.at && Number.isFinite(Date.parse(e.at)) ? new Date(e.at).toLocaleString("fa-IR", {
		dateStyle: "medium",
		timeStyle: "short"
	}) : "";
	if (e?.kind === "quiz") {
		let i = t.find((t) => t.id === e.lesson_id), a = i && /^[0-9a-f-]{36}$/i.test(e.attempt_id ?? "") ? n("quiz/" + i.id + "/?attempt=" + encodeURIComponent(e.attempt_id)) : null;
		return /* @__PURE__ */ (0, S.jsxs)("article", {
			className: "rv-evidence",
			children: [
				/* @__PURE__ */ (0, S.jsxs)("p", {
					className: "rv-evidence-meta",
					children: ["از آزمون", r && " · " + r]
				}),
				e.prompt ? /* @__PURE__ */ (0, S.jsx)("p", {
					className: "rv-evidence-prompt",
					children: /* @__PURE__ */ (0, S.jsx)(D, { value: e.prompt })
				}) : /* @__PURE__ */ (0, S.jsx)("p", { children: "پاسخ یک سؤال ثبت‌شده، به این موضوع مرتبط بوده است." }),
				e.code && /* @__PURE__ */ (0, S.jsx)("pre", {
					className: "rv-source-code",
					dir: "ltr",
					children: e.code
				}),
				e.answer && /* @__PURE__ */ (0, S.jsxs)("p", { children: ["پاسخ ثبت‌شدهٔ تو: ", /* @__PURE__ */ (0, S.jsx)("strong", { children: /* @__PURE__ */ (0, S.jsx)(D, { value: e.answer }) })] }),
				/* @__PURE__ */ (0, S.jsx)("p", {
					className: "rv-evidence-outcome",
					children: "این پاسخ در آن تلاش، کامل درست نبود؛ با یک مثال دیگر به مفهوم برمی‌گردیم."
				}),
				a && /* @__PURE__ */ (0, S.jsx)("a", {
					className: "rv-text-link",
					target: "_blank",
					rel: "noopener",
					href: a,
					children: "دیدن نتیجهٔ همان تلاش ←"
				})
			]
		});
	}
	if (e?.kind === "lab") {
		let i = e.mission ? t.find((t) => t.lab?.mission === e.mission) : void 0, a = i?.lab_steps?.find((t) => t.id === e.task)?.title;
		return /* @__PURE__ */ (0, S.jsxs)("article", {
			className: "rv-evidence",
			children: [
				/* @__PURE__ */ (0, S.jsxs)("p", {
					className: "rv-evidence-meta",
					children: ["از لابراتور", r && " · " + r]
				}),
				a && /* @__PURE__ */ (0, S.jsx)("h3", { children: a }),
				/* @__PURE__ */ (0, S.jsx)("p", { children: F[e.feedback_code ?? ""] || "خروجی این تلاش با نتیجهٔ بررسی هم‌خوان نبود؛ این مفهوم برای بازبینی پیشنهاد شده است." }),
				e.completed && /* @__PURE__ */ (0, S.jsxs)("p", {
					className: "rv-resolved",
					children: [e.passed_later ? "پس از آن، این مأموریت را با موفقیت گذرانده‌ای." : "این مأموریت در حساب تو انجام‌شده است.", " این مرور برای یادآوری مفهوم است."]
				}),
				i?.lab && /* @__PURE__ */ (0, S.jsx)("a", {
					className: "rv-text-link",
					target: "_blank",
					rel: "noopener",
					href: n(i.lab.path),
					children: "بازگشت به لابراتور ←"
				})
			]
		});
	}
	return /* @__PURE__ */ (0, S.jsx)("article", {
		className: "rv-evidence",
		children: /* @__PURE__ */ (0, S.jsx)("p", { children: "این موضوع را خودت برای مرور انتخاب کرده‌ای. می‌توانی نکته را بازخوانی کنی و با یک سؤال کوتاه خودت را بیازمایی." })
	});
}
function L({ practice: e, busy: t, lessons: n, url: r, controller: i }) {
	let { stage: a, entry: o, context: s } = e, { concept: c, evidence: l = [] } = s, u = c.learning ?? {}, f = d(c, r);
	return /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [
		/* @__PURE__ */ (0, S.jsx)("p", {
			className: "rv-eyebrow",
			children: "مرور شخصی"
		}),
		/* @__PURE__ */ (0, S.jsx)(k, {
			id: "rv-stage-title",
			children: o.title
		}),
		a === "reason" ? /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [
			/* @__PURE__ */ (0, S.jsx)("h2", {
				className: "rv-context-heading",
				children: "چرا این موضوع اینجاست؟"
			}),
			/* @__PURE__ */ (0, S.jsx)(I, {
				item: l[0],
				lessons: n,
				url: r
			}),
			l.length > 1 && /* @__PURE__ */ (0, S.jsxs)("details", {
				className: "rv-other-evidence",
				children: [/* @__PURE__ */ (0, S.jsx)("summary", { children: "تجربه‌های مرتبط دیگر" }), l.slice(1).map((e, t) => /* @__PURE__ */ (0, S.jsx)(I, {
					item: e,
					lessons: n,
					url: r
				}, t))]
			}),
			/* @__PURE__ */ (0, S.jsxs)("p", {
				className: "rv-learning-goal",
				children: [/* @__PURE__ */ (0, S.jsx)("strong", { children: "هدف این مرور: " }), /* @__PURE__ */ (0, S.jsx)(D, { value: u.goal || c.description || "مفهوم را در یک مثال دیگر بررسی کن." })]
			}),
			/* @__PURE__ */ (0, S.jsxs)("div", {
				className: "rv-practice-tools",
				children: [/* @__PURE__ */ (0, S.jsx)(O, {
					tone: "primary",
					icon: "arrow",
					"data-read": "",
					disabled: t,
					onClick: () => void i.chooseReading(!1),
					children: o.paused ? "فعال‌کردن مرور" : e.prepared ? "ادامهٔ تمرین" : o.last_review ? "اول بدون بازخوانی امتحان کن" : "بازخوانی نکته"
				}), !o.paused && /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [/* @__PURE__ */ (0, S.jsx)(O, {
					"data-direct": "",
					disabled: t,
					onClick: () => void i.chooseReading(!0),
					children: o.last_review ? "ابتدا نکته را بازخوانی می‌کنم" : "مستقیم تمرین می‌کنم"
				}), /* @__PURE__ */ (0, S.jsx)(O, {
					tone: "text-link",
					"data-pause": "",
					disabled: t,
					onClick: () => void i.pause(),
					children: "فعلاً از مرور خارج کن"
				})] })]
			})
		] }) : /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [
			u.goal && /* @__PURE__ */ (0, S.jsx)("p", {
				className: "rv-learning-goal",
				children: /* @__PURE__ */ (0, S.jsx)(D, { value: u.goal })
			}),
			/* @__PURE__ */ (0, S.jsx)("p", {
				className: "rv-learning-core",
				children: /* @__PURE__ */ (0, S.jsx)(D, { value: u.core || c.description })
			}),
			u.example && /* @__PURE__ */ (0, S.jsxs)("section", {
				className: "rv-worked-example",
				children: [/* @__PURE__ */ (0, S.jsx)("h2", { children: "یک مثال برای بازخوانی" }), /* @__PURE__ */ (0, S.jsx)("p", { children: /* @__PURE__ */ (0, S.jsx)(D, { value: u.example }) })]
			}),
			u.pitfall && /* @__PURE__ */ (0, S.jsx)("p", {
				className: "rv-concept-note",
				children: /* @__PURE__ */ (0, S.jsx)(D, { value: u.pitfall })
			}),
			o.note && /* @__PURE__ */ (0, S.jsxs)("details", {
				className: "rv-own-note",
				children: [/* @__PURE__ */ (0, S.jsx)("summary", { children: "یادداشت قبلی من" }), /* @__PURE__ */ (0, S.jsx)("p", { children: o.note })]
			}),
			o.last_reflection?.text && /* @__PURE__ */ (0, S.jsxs)("details", {
				className: "rv-own-note",
				children: [/* @__PURE__ */ (0, S.jsx)("summary", { children: "برداشت قبلی من" }), /* @__PURE__ */ (0, S.jsx)("p", { children: o.last_reflection.text })]
			}),
			/* @__PURE__ */ (0, S.jsxs)("div", {
				className: "rv-practice-tools",
				children: [/* @__PURE__ */ (0, S.jsx)(O, {
					tone: "primary",
					icon: "arrow",
					"data-question": "",
					disabled: t,
					onClick: () => void i.openQuestion(),
					children: "حالا با یک مثال دیگر امتحان کن"
				}), /* @__PURE__ */ (0, S.jsx)(O, {
					tone: "text-link",
					disabled: t,
					onClick: i.reason,
					children: "بازگشت به دلیل پیشنهاد"
				})]
			}),
			f && /* @__PURE__ */ (0, S.jsxs)("a", {
				className: "rv-text-link rv-reference",
				target: "_blank",
				rel: "noopener",
				href: f,
				children: [c.review_anchor ? "مطالعهٔ بخش مرتبط در یادداشت" : "مطالعهٔ یادداشت مرتبط", " ←"]
			})
		] })
	] });
}
function R({ practice: e, busy: t, controller: n }) {
	let { entry: r, run: i, selected: a } = e;
	return /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [
		/* @__PURE__ */ (0, S.jsxs)("p", {
			className: "rv-eyebrow",
			children: ["آزمودن دوباره · ", r.title]
		}),
		/* @__PURE__ */ (0, S.jsx)(k, {
			id: "rv-stage-title",
			children: /* @__PURE__ */ (0, S.jsx)(D, { value: i.question.stem })
		}),
		/* @__PURE__ */ (0, S.jsxs)("form", {
			"data-answer-form": "",
			onSubmit: (e) => {
				e.preventDefault(), n.answer();
			},
			children: [/* @__PURE__ */ (0, S.jsxs)("fieldset", {
				disabled: t,
				children: [/* @__PURE__ */ (0, S.jsx)("legend", {
					className: "sr-only",
					children: "پاسخت را انتخاب کن"
				}), i.question.options.map((e, t) => /* @__PURE__ */ (0, S.jsxs)("label", {
					className: "rv-answer",
					children: [/* @__PURE__ */ (0, S.jsx)("input", {
						type: "radio",
						name: "review-answer",
						value: t,
						checked: a === String(t),
						required: !0,
						onChange: () => n.select(String(t))
					}), /* @__PURE__ */ (0, S.jsx)("span", { children: /* @__PURE__ */ (0, S.jsx)(D, { value: e }) })]
				}, t))]
			}), /* @__PURE__ */ (0, S.jsxs)("div", {
				className: "rv-practice-tools",
				children: [
					/* @__PURE__ */ (0, S.jsx)(O, {
						tone: "primary",
						type: "submit",
						icon: "arrow",
						disabled: t,
						children: "بررسی پاسخ"
					}),
					/* @__PURE__ */ (0, S.jsx)(O, {
						"data-hint": "",
						disabled: t || !!i.hint_used,
						onClick: () => void n.hint(),
						children: "Hint"
					}),
					/* @__PURE__ */ (0, S.jsx)(O, {
						tone: "text-link",
						"data-skip": "",
						disabled: t,
						onClick: () => void n.answer(!0),
						children: "هنوز نمی‌دانم"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, S.jsx)("div", {
			"aria-live": "polite",
			children: i.hint && /* @__PURE__ */ (0, S.jsx)("p", {
				className: "rv-hint",
				"data-hint-text": "",
				children: /* @__PURE__ */ (0, S.jsx)(D, { value: i.hint })
			})
		}),
		/* @__PURE__ */ (0, S.jsx)(O, {
			tone: "text-link",
			className: "rv-text-link rv-reference",
			"data-reread": "",
			disabled: t,
			onClick: () => void n.reread(),
			children: "بازخوانی نکته ←"
		})
	] });
}
function z({ practice: e, busy: t, controller: n }) {
	let { entry: r, run: i, answer: a, receipt: o, reflection: s, context: c, queue: l } = e, u = o.answer === void 0 ? -1 : Number(o.answer), d = i.question.options[u], p = !o.correct || o.hint_used || o.preparation_used;
	return /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [/* @__PURE__ */ (0, S.jsx)("h1", {
		id: "rv-stage-title",
		children: r.title
	}), /* @__PURE__ */ (0, S.jsxs)("section", {
		className: "rv-feedback",
		"data-correct": o.correct,
		"aria-labelledby": "rv-feedback-title",
		children: [
			/* @__PURE__ */ (0, S.jsx)(k, {
				id: "rv-feedback-title",
				level: 2,
				children: f(o).title
			}),
			/* @__PURE__ */ (0, S.jsx)("p", { children: /* @__PURE__ */ (0, S.jsx)(D, { value: o.explanation }) }),
			/* @__PURE__ */ (0, S.jsxs)("details", {
				className: "rv-own-note",
				children: [
					/* @__PURE__ */ (0, S.jsx)("summary", { children: "مرور سؤال و پاسخ من" }),
					/* @__PURE__ */ (0, S.jsx)("p", { children: /* @__PURE__ */ (0, S.jsx)(D, { value: i.question.stem }) }),
					/* @__PURE__ */ (0, S.jsxs)("p", { children: ["پاسخ تو: ", a === null ? "هنوز نمی‌دانم" : /* @__PURE__ */ (0, S.jsx)(D, { value: i.question.options[Number(a)] })] })
				]
			}),
			!o.correct && d && /* @__PURE__ */ (0, S.jsxs)("p", { children: ["پاسخ این تمرین: ", /* @__PURE__ */ (0, S.jsx)("strong", { children: /* @__PURE__ */ (0, S.jsx)(D, { value: d }) })] }),
			/* @__PURE__ */ (0, S.jsxs)("p", {
				className: "rv-next-date",
				children: [p ? "مرور بعدی کمک می‌کند این نکته را دوباره بررسی کنی." : "نتیجهٔ همین تمرین ثبت شد.", o.next_due && " مرور بعدی: " + w(o.next_due)]
			}),
			/* @__PURE__ */ (0, S.jsxs)("section", {
				className: "rv-reflection",
				children: [
					/* @__PURE__ */ (0, S.jsx)("h3", { children: "با زبان خودم" }),
					/* @__PURE__ */ (0, S.jsx)("label", {
						htmlFor: "rv-reflection-text",
						children: /* @__PURE__ */ (0, S.jsx)(D, { value: c.concept.learning?.reflection_prompt || "از این مرور چه نکته‌ای را می‌خواهم به خاطر بسپارم؟" })
					}),
					/* @__PURE__ */ (0, S.jsx)("textarea", {
						id: "rv-reflection-text",
						"data-reflection": "",
						maxLength: 2e3,
						rows: 3,
						disabled: t,
						placeholder: "اختیاری؛ یک جمله هم کافی است.",
						value: s.text,
						onChange: (e) => n.editReflection(e.target.value)
					}),
					/* @__PURE__ */ (0, S.jsx)(O, {
						tone: "text-link",
						"data-save-reflection": "",
						disabled: t,
						onClick: () => void n.saveReflection(),
						children: "ذخیرهٔ برداشت من"
					}),
					/* @__PURE__ */ (0, S.jsx)("p", {
						className: "rv-dialog-status",
						role: "status",
						children: s.message
					}),
					s.conflict && /* @__PURE__ */ (0, S.jsx)(O, {
						"data-reflection-compare": "",
						disabled: t,
						onClick: () => void n.compareReflection(),
						children: "دریافت نسخهٔ حساب برای مقایسه"
					}),
					s.remote !== void 0 && /* @__PURE__ */ (0, S.jsxs)("details", {
						open: !0,
						children: [/* @__PURE__ */ (0, S.jsx)("summary", { children: "برداشت ذخیره‌شدهٔ حساب" }), /* @__PURE__ */ (0, S.jsx)("p", {
							className: "rv-preserve",
							children: s.remote || "خالی"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, S.jsxs)("div", {
				className: "rv-practice-tools",
				children: [p && /* @__PURE__ */ (0, S.jsx)(O, {
					tone: o.correct ? "outline" : "primary",
					icon: "arrow",
					disabled: t,
					"data-retry-concept": "",
					onClick: () => void n.leave("retry"),
					children: o.correct ? "یک مثال دیگر، بدون بازخوانی" : "بازخوانی و یک سؤال دیگر"
				}), /* @__PURE__ */ (0, S.jsx)(O, {
					tone: o.correct ? "primary" : "outline",
					icon: "arrow",
					"data-next": "",
					disabled: t,
					onClick: () => void n.leave("next"),
					children: l.length ? "موضوع بعدی" : "بازگشت به دفتر"
				})]
			})
		]
	})] });
}
function B(e) {
	let { practice: t, busy: n, controller: r } = e, i = [
		"reason",
		"concept",
		"question",
		"feedback"
	].indexOf(t.stage);
	return /* @__PURE__ */ (0, S.jsxs)("div", {
		className: "rv-mode-practice",
		children: [/* @__PURE__ */ (0, S.jsxs)("div", {
			className: "rv-practice-head",
			children: [/* @__PURE__ */ (0, S.jsxs)(O, {
				tone: "text-link",
				"data-back": "",
				disabled: n,
				onClick: () => void r.leave("back"),
				children: [/* @__PURE__ */ (0, S.jsx)(T, { name: "arrow" }), " بازگشت به دفتر"]
			}), /* @__PURE__ */ (0, S.jsx)("span", { children: i < 2 ? "به تجربهٔ قبلی برگرد و دوباره امتحان کن" : "یک تمرین، یک مفهوم" })]
		}), /* @__PURE__ */ (0, S.jsxs)("section", {
			className: "rv-practice" + (i < 2 ? " rv-context-flow" : ""),
			"aria-labelledby": "rv-stage-title",
			children: [/* @__PURE__ */ (0, S.jsx)("ol", {
				className: "rv-learning-steps",
				"aria-label": "مراحل مرور",
				children: P.map((e, t) => /* @__PURE__ */ (0, S.jsxs)("li", {
					"aria-current": i === t ? "step" : void 0,
					children: [/* @__PURE__ */ (0, S.jsx)("bdi", { children: t + 1 }), e]
				}, e))
			}), t.stage === "question" ? /* @__PURE__ */ (0, S.jsx)(R, {
				practice: t,
				busy: n,
				controller: r
			}, t.run.id) : t.stage === "feedback" ? /* @__PURE__ */ (0, S.jsx)(z, {
				practice: t,
				busy: n,
				controller: r
			}, t.run.id) : /* @__PURE__ */ (0, S.jsx)(L, { ...e }, t.entry.id + t.stage)]
		})]
	});
}
// frontend/review/mount.tsx
function V({ controller: e, options: t }) {
	let n = (0, o.useSyncExternalStore)(e.subscribe, e.getSnapshot);
	return /* @__PURE__ */ (0, S.jsxs)("div", {
		"data-review-view": "",
		"aria-busy": n.busy || n.phase === "loading",
		children: [
			n.phase === "ready" ? n.practice ? /* @__PURE__ */ (0, S.jsx)(B, {
				practice: n.practice,
				busy: n.busy,
				controller: e,
				lessons: t.lessons,
				url: t.url
			}) : /* @__PURE__ */ (0, S.jsx)(M, {
				notebook: n.notebook,
				filters: n.filters,
				busy: n.busy,
				controller: e,
				lessons: t.lessons,
				dashboard: t.url("dashboard/")
			}) : n.phase === "error" ? /* @__PURE__ */ (0, S.jsxs)("section", {
				className: "rv-empty",
				children: [/* @__PURE__ */ (0, S.jsx)("h1", { children: "دفتر مرور دریافت نشد." }), /* @__PURE__ */ (0, S.jsx)(O, {
					"data-retry": "",
					onClick: () => void e.load(),
					children: "تلاش دوباره"
				})]
			}) : /* @__PURE__ */ (0, S.jsx)("p", {
				className: "rv-status",
				role: "status",
				children: "در حال دریافت دفتر مرور…"
			}),
			/* @__PURE__ */ (0, S.jsx)("p", {
				className: "rv-status",
				"data-review-status": "",
				"data-error": n.error,
				role: "status",
				children: n.notice
			}),
			n.editor && /* @__PURE__ */ (0, S.jsx)(N, {
				editor: n.editor,
				notebook: n.notebook,
				busy: n.busy,
				controller: e,
				url: t.url
			})
		]
	});
}
function H(e, t) {
	let n = e.ownerDocument, r = n.defaultView;
	if (!r) throw Error("REVIEW_WINDOW_UNAVAILABLE");
	let i = x({
		...t,
		initialURL: r.location.href,
		isCurrent: () => t.isCurrent() && e.isConnected,
		updateURL(e, t = "reason") {
			try {
				let n = new URL(r.location.href);
				e ? (n.searchParams.set("practice", e), n.searchParams.set("step", t)) : (n.searchParams.delete("practice"), n.searchParams.delete("step")), r.history.replaceState(r.history.state, "", n.href);
			} catch {}
		},
		onProgress: () => n.dispatchEvent(new r.CustomEvent("classroom-progress-changed")),
		requestId: () => r.crypto.randomUUID()
	}), a = (0, s.createRoot)(e, { identifierPrefix: "review-" }), o = () => {
		i.persist();
	};
	return a.render(/* @__PURE__ */ (0, S.jsx)(V, {
		controller: i,
		options: t
	})), r.addEventListener("pagehide", o), {
		load: i.load,
		prepareSignOut: i.prepareSignOut,
		dispose() {
			r.removeEventListener("pagehide", o), i.dispose(), a.unmount();
		}
	};
}
export { H as mountReviewNotebook };
