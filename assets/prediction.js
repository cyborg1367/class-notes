"use strict";

document.querySelectorAll(".problem-role-lab").forEach(root => {
  const buttons = root.querySelectorAll("[data-problem-role]");
  const price = root.querySelector('[data-role-column="price"]');
  const description = root.querySelector("[data-role-explanation]");
  buttons.forEach(button => button.addEventListener("click", () => {
    const isPrice = button.dataset.problemRole === "price";
    buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    price.classList.toggle("role-target", isPrice);
    price.classList.toggle("role-feature", !isPrice);
    price.querySelector("span").textContent = isPrice ? "هدف" : "ویژگیِ مقایسه";
    description.textContent = isPrice
      ? "در مسئلهٔ پیش‌بینی قیمت، RAM و باتری ورودی‌اند و قیمت هدف است. شناسه فقط سطر را مشخص می‌کند."
      : "در تمرینِ شباهت، قیمت، RAM و باتری هر سه ویژگی‌های مقایسه بودند؛ هدفِ جداگانه‌ای برای پیش‌بینی تعریف نکرده بودیم.";
  }));
});
