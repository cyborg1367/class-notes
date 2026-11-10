// frontend/catalog/order.ts
function e(e, t) {
	let n = String(e ?? "").trim(), r = /^[+-]?\d+$/.test(n) ? Number(n) : 0;
	return Number.isSafeInteger(r) && r > 0 ? r : t + 1;
}
function t(t) {
	return t.map((t, n) => ({
		lesson: t,
		number: e(t.number, n),
		position: n
	})).sort((e, t) => e.number - t.number || e.position - t.position);
}
export { t as n, e as t };
