import { n as e, t } from "./jsx-runtime-CMv_BHj2.mjs";
import { a as n } from "./QuizResult-CdyqSXHC.mjs";
// frontend/quiz-result/mount.tsx
var r = e(), i = t();
function a(e, t, a) {
	let o = (0, r.createRoot)(e, {
		identifierPrefix: "quiz-result-",
		onUncaughtError: a
	});
	return o.render(/* @__PURE__ */ (0, i.jsx)(n, { ...t })), { dispose: () => o.unmount() };
}
export { a as mountQuizResult };
