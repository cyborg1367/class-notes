import { a as e, i as t, n, t as r } from "./react/jsx-runtime-CMv_BHj2.mjs";
import { i, t as a } from "./react/runtime-D2U6pln4.mjs";
// frontend/account/AccountPage.tsx
var o = n(), s = /* @__PURE__ */ e(t(), 1), c = r();
function l({ port: e, onReady: t }) {
	let n = (0, s.useSyncExternalStore)(e.subscribe, e.getSnapshot, e.getServerSnapshot), r = n.phase === "guest", i = n.phase === "authenticated";
	return (0, s.useEffect)(() => {
		t?.();
	}, [t]), /* @__PURE__ */ (0, c.jsxs)(c.Fragment, { children: [/* @__PURE__ */ (0, c.jsx)("nav", {
		className: "shell route-trail",
		"aria-label": "مسیر صفحه",
		children: /* @__PURE__ */ (0, c.jsxs)("ol", { children: [/* @__PURE__ */ (0, c.jsx)("li", { children: /* @__PURE__ */ (0, c.jsx)("a", {
			dir: "auto",
			href: "../index.html",
			children: "صفحهٔ اصلی"
		}) }), /* @__PURE__ */ (0, c.jsx)("li", { children: /* @__PURE__ */ (0, c.jsx)("span", {
			"aria-current": "page",
			dir: "auto",
			children: "حساب کاربری"
		}) })] })
	}), /* @__PURE__ */ (0, c.jsxs)("section", {
		className: "shell portal-main",
		id: "top",
		children: [/* @__PURE__ */ (0, c.jsxs)("header", {
			className: "page-head",
			children: [/* @__PURE__ */ (0, c.jsx)("h1", { children: "حساب کاربری" }), /* @__PURE__ */ (0, c.jsx)("p", {})]
		}), /* @__PURE__ */ (0, c.jsxs)("div", {
			className: "account-grid",
			children: [/* @__PURE__ */ (0, c.jsxs)("div", {
				className: "account-message",
				children: [
					/* @__PURE__ */ (0, c.jsxs)("div", {
						"data-account-intro-guest": "",
						hidden: !r,
						children: [
							/* @__PURE__ */ (0, c.jsx)("p", {
								className: "eyebrow",
								children: "ورود به حساب"
							}),
							/* @__PURE__ */ (0, c.jsx)("h2", { children: "دسترسی به کلاس‌ها" }),
							/* @__PURE__ */ (0, c.jsx)("p", { children: "با حساب Google وارد شو و دسترسی کلاس را درخواست کن. پس از تأیید مدرس، یادداشت‌ها، تمرین‌ها و آزمون‌های کلاس در دسترس تو هستند." })
						]
					}),
					/* @__PURE__ */ (0, c.jsxs)("div", {
						"data-account-intro-member": "",
						hidden: !i,
						children: [
							/* @__PURE__ */ (0, c.jsx)("p", {
								className: "eyebrow",
								children: "حساب کاربری"
							}),
							/* @__PURE__ */ (0, c.jsx)("h2", { children: "مشخصات حساب تو" }),
							/* @__PURE__ */ (0, c.jsx)("p", { children: "نام و ایمیل این حساب برای شناسایی تو در کلاس استفاده می‌شود. وضعیت عضویت و مسیر یادگیری‌ات را در داشبورد ببین." })
						]
					}),
					/* @__PURE__ */ (0, c.jsx)("p", {
						className: "hero-signature",
						lang: "en",
						children: "Instructor · Masoud Ahangary"
					})
				]
			}), /* @__PURE__ */ (0, c.jsxs)("div", {
				className: "panel-card",
				children: [
					/* @__PURE__ */ (0, c.jsxs)("div", {
						"data-account-guest": "",
						hidden: !r,
						children: [
							/* @__PURE__ */ (0, c.jsx)("h2", { children: "ورود با حساب Google" }),
							/* @__PURE__ */ (0, c.jsx)("p", { children: "برای اولین ورود هم کافی است حساب Google خودت را انتخاب کنی." }),
							/* @__PURE__ */ (0, c.jsx)("button", {
								className: "google-button",
								"data-signin": "",
								"data-react-account-action": "",
								type: "button",
								disabled: !r || !!n.busy,
								onClick: () => {
									e.signIn();
								},
								children: "ورود با Google"
							}),
							/* @__PURE__ */ (0, c.jsx)("p", {
								className: "small-note",
								children: "نام و ایمیل Google برای شناسایی حساب استفاده می‌شوند. ثبت‌نام به‌تنهایی دسترسی به کلاس ایجاد نمی‌کند."
							})
						]
					}),
					/* @__PURE__ */ (0, c.jsxs)("div", {
						"data-account-member": "",
						hidden: !i,
						children: [
							/* @__PURE__ */ (0, c.jsx)("h2", { children: "حساب کاربری" }),
							/* @__PURE__ */ (0, c.jsx)("p", { children: /* @__PURE__ */ (0, c.jsx)("bdi", {
								"data-user-name": "",
								children: n.identity?.name || ""
							}) }),
							/* @__PURE__ */ (0, c.jsx)("p", {
								className: "member-email",
								"data-user-email": "",
								children: n.identity?.email || ""
							}),
							/* @__PURE__ */ (0, c.jsxs)("div", {
								className: "portal-actions",
								children: [/* @__PURE__ */ (0, c.jsx)("a", {
									className: "button-forest",
									href: n.continueURL,
									"data-continue": "",
									children: "ورود به داشبورد ←"
								}), /* @__PURE__ */ (0, c.jsx)("button", {
									className: "signout-button",
									"data-signout": "",
									"data-react-account-action": "",
									type: "button",
									disabled: !!n.busy,
									onClick: () => {
										e.signOut();
									},
									children: "خروج از حساب"
								})]
							}),
							/* @__PURE__ */ (0, c.jsx)("div", { "data-account-presence-slot": "" })
						]
					}),
					/* @__PURE__ */ (0, c.jsx)("p", {
						className: "status-line",
						"data-auth-status": "",
						"data-error": n.notice.error,
						role: "status",
						"aria-live": "polite",
						children: n.notice.text
					}),
					n.phase === "error" && /* @__PURE__ */ (0, c.jsx)("button", {
						type: "button",
						className: "button-outline",
						"data-account-retry": "",
						onClick: () => e.retry(),
						children: "تلاش دوباره"
					}),
					/* @__PURE__ */ (0, c.jsx)("p", {
						className: "small-note",
						children: "در دستگاه مشترک، پس از پایان کار از حساب خارج شو. پیش‌نویس‌ها ممکن است در همان مرورگر باقی بمانند."
					})
				]
			})]
		})]
	})] });
}
// frontend/account-page.tsx
var u, d, f = new Promise((e) => {
	d = e;
});
function p() {
	if (u) return;
	let e = document.querySelector("[data-account-react-root]");
	if (!e) {
		d();
		return;
	}
	let { port: t } = a(document, i("../"));
	u = (0, o.hydrateRoot)(e, /* @__PURE__ */ (0, c.jsx)(l, {
		port: t,
		onReady: d
	}), {
		identifierPrefix: "account-page-",
		onRecoverableError(t) {
			e.dataset.reactRecovery = "true", console.warn("Account page hydration:", t);
		}
	});
}
function m() {
	u?.unmount(), u = void 0;
}
window.ClassNotesAccountPage = {
	ready: f,
	mountAccountPage: p,
	dispose: m
}, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", p, { once: !0 }) : p();
export { m as dispose, p as mountAccountPage, f as ready };
