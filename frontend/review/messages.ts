export const hasError = (error: unknown, name: string) =>
  typeof error === 'object' && error !== null &&
  (('message' in error && String(error.message).includes(name)) || ('code' in error && error.code === name));

export function reviewError(error: unknown) {
  if (hasError(error, 'REVIEW_NOTE_CONFLICT')) return 'نسخهٔ حساب در پنجرهٔ دیگری تغییر کرده است؛ متن تو حفظ شده است.';
  if (hasError(error, 'REVIEW_CREATE_CONFLICT')) return 'نسخهٔ قبلی این یادداشت ثبت شده است؛ نوشتهٔ فعلی در این مرورگر حفظ شده. مورد ثبت‌شده را از دفتر باز کن.';
  if (hasError(error, 'REVIEW_ENTRY_EXISTS')) return 'این موضوع از قبل در دفترت هست؛ همان مورد را باز کن.';
  if (hasError(error, 'REVIEW_NOTE_LIMIT')) return 'دفتر به سقف ۲۰۰ یادداشت آزاد رسیده است.';
  if (hasError(error, 'CLASS_ACCESS_REQUIRED')) return 'دسترسی این یادداشت فعال نیست؛ وضعیت عضویت را بررسی کن.';
  if (hasError(error, 'PGRST202') || hasError(error, 'does not exist')) return 'به‌روزرسانی دفتر مرور هنوز روی سرور فعال نشده است. با مدرس در میان بگذار.';
  return 'ثبت یا دریافت کامل نشد. دوباره تلاش کن.';
}
