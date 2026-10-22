"""Practice feedback only. Browser checks are not an authoritative grade."""
import numpy as np


def check_stage(ns, stage, original_x, original_query):
    x = np.array(original_x, dtype=float, copy=True)
    q = np.array(original_query, dtype=float, copy=True)
    distances = np.sqrt(np.sum((x - q) ** 2, axis=1))
    order = np.argsort(distances, kind="stable")

    def fail(message):
        return {"ok": False, "message": message}

    def same(name, expected):
        if name not in ns:
            return False
        try:
            value = np.asarray(ns[name])
            target = np.asarray(expected)
            return (value.shape == target.shape and value.dtype.kind in "iuf" and
                    np.all(np.isfinite(value)) and
                    np.allclose(value, target, rtol=1e-7, atol=1e-9))
        except (ValueError, TypeError, OverflowError):
            return False

    if not same("X", x) or not same("query", q):
        return fail("X و query را تغییر نده؛ برای آزمایش مرحلهٔ آخر از یک کپی با نام query_new استفاده کن.")
    if stage >= 0:
        for name, expected in (("n_samples", x.shape[0]), ("n_features", x.shape[1])):
            if not same(name, expected):
                return fail("شکل X را بررسی کن و n_samples و n_features را به‌صورت دو عدد تعریف کن.")
    if stage >= 1:
        if not same("first_sample", x[0]):
            return fail("first_sample باید سطر اول X و یک آرایهٔ یک‌بعدی باشد.")
        if not same("first_feature", x[:, 0]):
            return fail("first_feature باید ستون اول X برای تمام نمونه‌ها باشد؛ شکل خروجی را بررسی کن.")
    if stage >= 2 and not same("differences", x - q):
        return fail("differences باید اختلاف هر سطر X با query باشد و هم‌شکل X بماند.")
    if stage >= 3 and not same("distances", distances):
        return fail("distances باید یک فاصله برای هر نمونه داشته باشد. توان دوم، محور جمع و ریشه را بررسی کن.")
    if stage >= 4:
        try:
            nearest = ns["nearest_index"]
            if not isinstance(nearest, (int, np.integer)) or isinstance(nearest, (bool, np.bool_)):
                return fail("nearest_index باید اندیس صحیحِ یک سطر باشد، نه مقدار فاصله.")
            if not 0 <= int(nearest) < len(x) or not np.isclose(distances[int(nearest)], distances.min(), rtol=1e-12, atol=1e-12):
                return fail("nearest_index باید به نمونه‌ای با کمترین فاصله اشاره کند.")
        except (KeyError, TypeError, ValueError):
            return fail("nearest_index را به‌صورت اندیس نزدیک‌ترین سطر تعریف کن.")
    if stage >= 5:
        try:
            indices = np.asarray(ns["neighbor_indices"])
            if indices.shape != (3,) or indices.dtype.kind not in "iu" or len(np.unique(indices)) != 3 or np.any(indices < 0) or np.any(indices >= len(x)):
                return fail("neighbor_indices باید سه اندیس صحیح، متفاوت و معتبر باشد.")
            selected = distances[indices]
            if not np.allclose(selected, distances[order[:3]], rtol=1e-12, atol=1e-12):
                return fail("سه همسایه را بر اساس فاصله، از نزدیک به دور مرتب کن.")
        except (KeyError, TypeError, ValueError, IndexError):
            return fail("neighbor_indices را به شکل آرایه‌ای از سه اندیس نزدیک‌تر تعریف کن.")
    if stage >= 6:
        try:
            q_new = np.asarray(ns["query_new"])
            if q_new.shape != q.shape or q_new.dtype.kind not in "iuf" or not np.all(np.isfinite(q_new)):
                return fail("query_new باید آرایه‌ای عددی و هم‌شکل query باشد.")
            if np.array_equal(q_new, q):
                return fail("حداقل یکی از ویژگی‌های query_new را نسبت به query تغییر بده.")
            if not same("distances_new", np.sqrt(np.sum((x - q_new) ** 2, axis=1))):
                return fail("distances_new را از پرس‌وجوی تازه محاسبه کن؛ فاصله‌های قبلی کافی نیستند.")
        except (KeyError, TypeError, ValueError):
            return fail("query_new و distances_new را تعریف کن و شکل آن‌ها را بررسی کن.")
    return {"ok": True, "message": "محاسبه‌های این مرحله درست‌اند؛ می‌توانی به مرحلهٔ بعد بروی."}
