import { a as e, i as t, n, r, t as i } from "./jsx-runtime-CMv_BHj2.mjs";
// frontend/lab/tutor/controller.ts
var a = r(), o = n(), s = 7e4, c = {
	TUTOR_PAUSED: "کمک آموزشی فعلاً فعال نیست.",
	TUTOR_RATE_LIMIT: "کمی صبر کن؛ تعداد درخواست‌های اخیر به حد مجاز رسیده است.",
	TUTOR_DAILY_LIMIT: "سهمیهٔ امروز تمام شده است. Hint و اجرای کد همچنان در دسترس‌اند.",
	PROVIDER_LIMIT: "Groq فعلاً به سقف مصرف رسیده است. کمی بعد دوباره ارسال کن.",
	PROVIDER_UNAVAILABLE: "ارتباط با Groq برقرار نشد. پاسخ آماده جایگزین نشده است؛ کمی بعد دوباره تلاش کن.",
	INVALID_MODEL_OUTPUT: "مدل پاسخ قابل استفاده‌ای نداد. دوباره با سؤال کوتاه‌تر امتحان کن.",
	GUIDANCE_TOO_DIRECT: "پاسخ پیشنهادی بیش از حد به حل کامل نزدیک بود و نمایش داده نشد. سؤالت را روی یک مفهوم یا خط مشخص متمرکز کن.",
	GUIDANCE_UNCERTAIN: "پاسخ پیشنهادی برای نمایش تأیید نشد. ابهامت را با جزئیات بیشتری توضیح بده.",
	CONVERSATION_EXPIRED: "این گفتگو منقضی شده است. برای ادامه «گفتگوی تازه» را بزن.",
	CONVERSATION_LIMIT: "این گفتگو به پایان شش نوبت رسیده است. می‌توانی گفتگوی تازه‌ای شروع کنی.",
	INVALID_REQUEST: "نسخهٔ دستیار آمادهٔ این درخواست نیست. صفحه را تازه کن یا به مدرس اطلاع بده.",
	TASK_LOCKED: "این مرحله هنوز باز نشده است.",
	SIGN_IN_REQUIRED: "برای ادامه دوباره وارد حساب شو.",
	CLASS_ACCESS_REQUIRED: "دسترسی کلاس فعال نیست.",
	TUTOR_TIMEOUT: "پاسخ بیش از حد طول کشید. سؤالت حفظ شده است؛ می‌توانی دوباره ارسال کنی.",
	SERVICE_UNAVAILABLE: "دستیار پاسخ نداد. سؤال و کد تو حفظ شده‌اند؛ دوباره تلاش کن."
}, l = {
	token: "",
	draft: "",
	turns: []
}, u = (e) => JSON.stringify([e.mission, e.task]), d = new Intl.NumberFormat("fa-IR");
function f(e) {
	return typeof e == "object" && e ? e : {};
}
async function p(e, t, n) {
	let { signal: r } = n;
	r.throwIfAborted();
	let i = () => {}, a = new Promise((e, t) => {
		i = () => t(r.reason), r.addEventListener("abort", i, { once: !0 });
	}), o = setTimeout(() => n.abort({ code: "TUTOR_TIMEOUT" }), s);
	try {
		return await Promise.race([e.request(t, r), a]);
	} finally {
		clearTimeout(o), r.removeEventListener("abort", i);
	}
}
function m(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), r = {
		open: !1,
		key: "",
		title: "",
		turns: [],
		draft: "",
		attach: !1,
		busy: !1
	}, i = null, a = 0, o = !1, s = () => !o && e.isCurrent();
	function m(e) {
		s() && (r = {
			...r,
			...e
		}, n.forEach((e) => e()));
	}
	function h() {
		a++, i?.abort(), i = null;
	}
	function g(e) {
		if (!s()) return;
		let n = u(e);
		if (r.key === n) return;
		h();
		let i = t.get(n) || l;
		m({
			key: n,
			title: e.title,
			open: !1,
			turns: i.turns,
			draft: i.draft,
			attach: !1,
			busy: !1,
			status: void 0
		});
	}
	function _(e) {
		s() && r.open && (e = e.slice(0, 600), e !== r.draft && (t.set(r.key, {
			...t.get(r.key) || l,
			draft: e
		}), m({ draft: e })));
	}
	async function v() {
		if (!s() || !r.open || i || r.turns.length >= 6) return;
		let n = e.getContext(), o = u(n);
		if (o !== r.key) return;
		let h = r.draft.trim();
		if (!h) {
			m({ status: {
				kind: "error",
				text: "اول سؤالت را بنویس."
			} });
			return;
		}
		let g = t.get(o) || l, _ = r.attach, v = new AbortController(), y = ++a, b = () => s() && y === a && r.open && r.key === o && u(e.getContext()) === o;
		i = v, m({
			attach: !1,
			busy: !0,
			status: {
				kind: "info",
				text: "در حال نوشتن و بررسی پاسخ…"
			}
		});
		try {
			let i = f(await p(e, {
				mission: n.mission,
				task: n.task,
				question: h,
				conversation: g.token,
				code: _ ? n.code.slice(-4e3) : "",
				output: _ ? n.output.slice(-800) : ""
			}, v));
			if (!b()) return;
			let { version: a, task: s, source: l, reply: u, conversation: x, remaining: S } = i;
			if (a !== 2 || s !== n.task || l !== "model" || typeof u != "string" || !u.trim() || u.length > 900 || typeof x != "string" || x.length > 4e4) throw Error("Invalid tutor response");
			let C = [...g.turns, {
				id: y,
				question: h,
				reply: u
			}], w = r.draft.trim() === h ? "" : r.draft;
			t.set(o, {
				token: x,
				turns: C,
				draft: w
			});
			let T = C.length >= 6 ? c.CONVERSATION_LIMIT : typeof S == "number" && Number.isInteger(S) && S >= 0 ? d.format(S) + " درخواست دیگر برای امروز" : "";
			m({
				turns: C,
				draft: w,
				status: T ? {
					kind: "info",
					text: T
				} : void 0
			});
		} catch (e) {
			if (!b()) return;
			let t = f(e).code;
			m({ status: {
				kind: "error",
				text: typeof t == "string" && Object.prototype.hasOwnProperty.call(c, t) ? c[t] : c.SERVICE_UNAVAILABLE
			} });
		} finally {
			y === a && i === v && (i = null, m({ busy: !1 }));
		}
	}
	return {
		get: () => r,
		subscribe(e) {
			return n.add(e), () => {
				n.delete(e);
			};
		},
		setStage: g,
		edit: _,
		submit: v,
		open() {
			s() && (g(e.getContext()), r.open || m({
				open: !0,
				status: r.turns.length >= 6 ? {
					kind: "info",
					text: c.CONVERSATION_LIMIT
				} : void 0
			}));
		},
		close() {
			let e = r.open;
			return h(), e && m({
				open: !1,
				attach: !1,
				busy: !1,
				status: void 0
			}), e;
		},
		attach(e) {
			r.open && !i && m({ attach: e });
		},
		reset() {
			s() && r.open && !i && (t.delete(r.key), m({
				turns: [],
				draft: "",
				attach: !1,
				status: void 0
			}));
		},
		dispose() {
			o = !0, h(), t.clear(), n.clear();
		}
	};
}
// frontend/lab/tutor/TutorPanel.tsx
var h = /* @__PURE__ */ e(t(), 1), g = i(), _ = ["مسئله را ساده‌تر توضیح بده", "چرا خروجی من درست نیست؟"];
function v({ controller: e, onClose: t }) {
	let n = (0, h.useSyncExternalStore)(e.subscribe, e.get), r = (0, h.useRef)(null), i = (0, h.useRef)(null), a = (0, h.useRef)(""), o = (0, h.useRef)(/* @__PURE__ */ new Map()), s = (0, h.useRef)(!0);
	(0, h.useLayoutEffect)(() => {
		let e = r.current;
		n.open && e && (a.current === n.key ? s.current && (e.scrollTop = e.scrollHeight) : (a.current = n.key, e.scrollTop = o.current.get(n.key) ?? e.scrollHeight, s.current = e.scrollHeight - e.clientHeight - e.scrollTop < 64));
	}, [
		n.key,
		n.open,
		n.turns
	]);
	let c = n.turns.length >= 6;
	return /* @__PURE__ */ (0, g.jsxs)("section", {
		"data-react-lab-tutor": "",
		className: "lab-tutor lab-tutor-docked",
		dir: "rtl",
		hidden: !n.open,
		"aria-labelledby": "lab-tutor-title",
		onKeyDown: (e) => {
			e.key === "Escape" && !e.nativeEvent.isComposing && (e.preventDefault(), e.stopPropagation(), t());
		},
		children: [
			/* @__PURE__ */ (0, g.jsxs)("header", {
				className: "lab-tutor-head",
				children: [/* @__PURE__ */ (0, g.jsxs)("div", { children: [/* @__PURE__ */ (0, g.jsx)("p", {
					className: "lab-tutor-eyebrow",
					children: "همراه یادگیری · گفتگوی آموزشی"
				}), /* @__PURE__ */ (0, g.jsx)("h2", {
					id: "lab-tutor-title",
					children: "کمک آموزشی"
				})] }), /* @__PURE__ */ (0, g.jsx)("button", {
					className: "lab-tutor-close",
					type: "button",
					"aria-label": "بستن کمک آموزشی",
					onClick: t,
					children: "×"
				})]
			}),
			/* @__PURE__ */ (0, g.jsxs)("div", {
				className: "lab-tutor-stage-row",
				children: [/* @__PURE__ */ (0, g.jsx)("p", {
					className: "lab-tutor-stage",
					children: /* @__PURE__ */ (0, g.jsx)("bdi", { children: n.title })
				}), /* @__PURE__ */ (0, g.jsx)("button", {
					className: "lab-tutor-reset",
					type: "button",
					disabled: n.busy,
					onClick: () => {
						e.reset(), o.current.delete(n.key), s.current = !0, i.current?.focus({ preventScroll: !0 });
					},
					children: "گفتگوی تازه"
				})]
			}),
			/* @__PURE__ */ (0, g.jsxs)("div", {
				ref: r,
				className: "lab-tutor-transcript",
				tabIndex: 0,
				"aria-label": "تاریخچهٔ گفتگو",
				onScroll: (e) => {
					let t = e.currentTarget;
					o.current.set(n.key, t.scrollTop), s.current = t.scrollHeight - t.clientHeight - t.scrollTop < 64;
				},
				children: [/* @__PURE__ */ (0, g.jsx)("div", {
					className: "lab-tutor-thread",
					role: "log",
					"aria-label": "گفتگوی این مرحله",
					"aria-live": "polite",
					"aria-relevant": "additions",
					children: n.turns.map((e) => /* @__PURE__ */ (0, g.jsx)(y, {
						question: e.question,
						reply: e.reply
					}, e.id))
				}, n.key), !n.turns.length && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [/* @__PURE__ */ (0, g.jsx)("p", {
					className: "lab-tutor-welcome",
					children: "از مسئله، داده‌ها یا بخشی از کدت بپرس. کمکت می‌کنم خودت راه‌حل را پیدا کنی؛ کد کامل تمرین را نمی‌نویسم."
				}), /* @__PURE__ */ (0, g.jsx)("div", {
					className: "lab-tutor-prompts",
					"aria-label": "شروع گفتگو",
					children: _.map((t) => /* @__PURE__ */ (0, g.jsx)("button", {
						type: "button",
						onClick: () => {
							e.edit(t), i.current?.focus({ preventScroll: !0 });
						},
						children: t
					}, t))
				})] })]
			}),
			/* @__PURE__ */ (0, g.jsxs)("footer", {
				className: "lab-tutor-composer",
				children: [/* @__PURE__ */ (0, g.jsxs)("form", {
					className: "lab-tutor-form",
					"aria-busy": n.busy,
					onSubmit: (t) => {
						t.preventDefault(), e.submit();
					},
					children: [
						/* @__PURE__ */ (0, g.jsx)("label", {
							htmlFor: "lab-tutor-question",
							children: "سؤالت را بنویس"
						}),
						/* @__PURE__ */ (0, g.jsx)("textarea", {
							ref: i,
							id: "lab-tutor-question",
							dir: "auto",
							maxLength: 600,
							rows: 3,
							placeholder: "مثلاً: منظورت از حفظ ترتیب سطرها چیه؟",
							value: n.draft,
							onChange: (t) => e.edit(t.target.value),
							onKeyDown: (t) => {
								t.key === "Enter" && !t.shiftKey && !t.nativeEvent.isComposing && (t.preventDefault(), e.submit());
							}
						}),
						/* @__PURE__ */ (0, g.jsxs)("label", {
							className: "lab-tutor-consent",
							children: [/* @__PURE__ */ (0, g.jsx)("input", {
								type: "checkbox",
								id: "lab-tutor-share",
								checked: n.attach,
								disabled: n.busy,
								onChange: (t) => e.attach(t.target.checked)
							}), /* @__PURE__ */ (0, g.jsx)("span", { children: "کد و خروجی فعلی را فقط به همین پیام ضمیمه کن" })]
						}),
						/* @__PURE__ */ (0, g.jsxs)("details", {
							className: "lab-tutor-details",
							children: [/* @__PURE__ */ (0, g.jsx)("summary", { children: "دربارهٔ ارسال اطلاعات" }), /* @__PURE__ */ (0, g.jsx)("p", {
								className: "lab-tutor-privacy",
								children: "سؤال و سابقهٔ این گفتگو برای پاسخ‌نویسی و بررسی پاسخ به Groq ارسال می‌شوند. ضمیمه اختیاری است: تا ۴۰۰۰ نویسهٔ آخر کد و ۸۰۰ نویسهٔ آخر خروجی. اطلاعات شخصی یا کلید API ننویس. گفتگو با بستن این پنل حفظ و با بازخوانی صفحه پاک می‌شود."
							})]
						}),
						/* @__PURE__ */ (0, g.jsx)("button", {
							className: "button-forest lab-tutor-send",
							type: "submit",
							disabled: n.busy || c,
							children: n.busy ? "در حال دریافت پاسخ…" : "ارسال سؤال ←"
						})
					]
				}), /* @__PURE__ */ (0, g.jsx)("p", {
					className: "lab-tutor-status",
					"data-kind": n.status?.kind,
					role: "status",
					"aria-live": "polite",
					children: n.status?.text
				})]
			})
		]
	});
}
function y({ question: e, reply: t }) {
	return /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [/* @__PURE__ */ (0, g.jsxs)("article", {
		className: "lab-tutor-message",
		"data-role": "student",
		children: [/* @__PURE__ */ (0, g.jsx)("p", {
			className: "lab-tutor-message-label",
			children: "تو"
		}), /* @__PURE__ */ (0, g.jsx)("p", {
			className: "lab-tutor-message-text",
			dir: "auto",
			children: e
		})]
	}), /* @__PURE__ */ (0, g.jsxs)("article", {
		className: "lab-tutor-message",
		"data-role": "assistant",
		children: [/* @__PURE__ */ (0, g.jsx)("p", {
			className: "lab-tutor-message-label",
			children: "همراه یادگیری"
		}), /* @__PURE__ */ (0, g.jsx)("p", {
			className: "lab-tutor-message-text",
			dir: "auto",
			children: t
		})]
	})] });
}
// frontend/lab/tutor/mount.tsx
function b(e, t) {
	let n = m(t), r = (0, o.createRoot)(t.host, { identifierPrefix: "lab-tutor-" }), i = null, s = !1, c = () => e.querySelector("#lab-code");
	function l(e = !0) {
		if (!n.close() || !e || !t.isCurrent()) return;
		t.onClose(), t.opener?.focus({ preventScroll: !0 });
		let r = c();
		r && i && (r.setSelectionRange(i.start, i.end), r.scrollTop = i.top, r.scrollLeft = i.left);
	}
	return (0, a.flushSync)(() => r.render(/* @__PURE__ */ (0, g.jsx)(v, {
		controller: n,
		onClose: () => l()
	}))), {
		open({ focus: e = !0 } = {}) {
			if (!s && t.isCurrent()) {
				if (!n.get().open) {
					let e = c();
					i = e ? {
						start: e.selectionStart,
						end: e.selectionEnd,
						top: e.scrollTop,
						left: e.scrollLeft
					} : null;
				}
				(0, a.flushSync)(() => n.open()), e && t.host.querySelector("#lab-tutor-question")?.focus({ preventScroll: !0 });
			}
		},
		setStage: n.setStage,
		close: l,
		dispose() {
			s || (s = !0, n.dispose(), r.unmount());
		}
	};
}
export { b as mountTutor };
