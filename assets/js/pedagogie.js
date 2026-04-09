/**
 * Diaporama pédagogique : navigation clavier et points.
 */
(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotsWrap = document.getElementById("slide-dots");
  const prevBtn = document.getElementById("slide-prev");
  const nextBtn = document.getElementById("slide-next");
  const counter = document.getElementById("slide-counter");
  const root = document.getElementById("slideshow");

  if (!slides.length || !root) return;

  let index = 0;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle("is-active", j === index));
    if (dotsWrap) {
      dotsWrap.querySelectorAll("button").forEach((b, j) => {
        b.setAttribute("aria-current", j === index ? "true" : "false");
      });
    }
    if (counter) counter.textContent = index + 1 + " / " + slides.length;
  }

  if (dotsWrap) {
    slides.forEach((_, j) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Diapositive " + (j + 1));
      b.addEventListener("click", () => show(j));
      dotsWrap.appendChild(b);
    });
  }

  prevBtn?.addEventListener("click", () => show(index - 1));
  nextBtn?.addEventListener("click", () => show(index + 1));

  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      show(index - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      show(index + 1);
    }
  });

  root.setAttribute("tabindex", "0");
  show(0);
})();
