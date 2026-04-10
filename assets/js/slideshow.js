/**
 * Diaporama générique (même logique que pedagogie.html).
 * @param {{ rootId: string, prevId: string, nextId: string, counterId: string, dotsId: string, onChange?: (index: number, slideEl: Element) => void }} opts
 */
(function (global) {
  "use strict";

  function init(opts) {
    if (!opts || !opts.rootId) return null;
    const root = document.getElementById(opts.rootId);
    if (!root) return null;

    const slides = Array.from(root.querySelectorAll(".slide"));
    const dotsWrap = document.getElementById(opts.dotsId);
    const prevBtn = document.getElementById(opts.prevId);
    const nextBtn = document.getElementById(opts.nextId);
    const counter = document.getElementById(opts.counterId);

    if (!slides.length) return null;

    let index = 0;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, j) => {
        const on = j === index;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-hidden", on ? "false" : "true");
      });
      if (dotsWrap) {
        dotsWrap.querySelectorAll("button").forEach((b, j) => {
          b.setAttribute("aria-current", j === index ? "true" : "false");
        });
      }
      if (counter) {
        counter.textContent = index + 1 + " / " + slides.length;
      }
      if (typeof opts.onChange === "function") {
        opts.onChange(index, slides[index]);
      }
    }

    if (dotsWrap) {
      slides.forEach((_, j) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Écran " + (j + 1));
        b.addEventListener("click", () => show(j));
        dotsWrap.appendChild(b);
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", () => show(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => show(index + 1));

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
    root.setAttribute("role", "region");
    show(0);

    return { show: show, getIndex: function () { return index; } };
  }

  global.IslamMapSlideshow = { init: init };
})(typeof window !== "undefined" ? window : globalThis);
