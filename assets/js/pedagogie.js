/**
 * Page pédagogique : diaporama (IslamMapSlideshow) + ancres + fallback images.
 */
(function () {
  "use strict";

  function resolveSlideImageUrls() {
    var base = document.baseURI || location.href;
    document.querySelectorAll("#guide-hub #slideshow .slide-figure img[src], .pedagogie-page #slideshow .slide-figure img[src]").forEach(function (img) {
      var raw = img.getAttribute("src");
      if (!raw || /^[a-z][a-z0-9+.-]*:/i.test(raw)) return;
      try {
        var abs = new URL(raw, base).href;
        if (img.src !== abs) img.src = abs;
      } catch (_) {}
    });
  }

  function enhancePedagogyDots() {
    document.querySelectorAll("#slide-dots button").forEach(function (b, j) {
      b.classList.add("slide-dot-num");
      b.textContent = String(j + 1);
      b.setAttribute("aria-label", "Écran " + (j + 1));
    });
  }

  function updateSlideChrome(index, slideEl) {
    var root = document.getElementById("slideshow");
    if (!root) return;
    var slides = root.querySelectorAll(".slide");
    var n = slides.length || 8;
    var fill = document.getElementById("slide-progress-fill");
    if (fill) fill.style.width = ((index + 1) / n) * 100 + "%";
    var live = document.getElementById("slide-live-title");
    if (live && slideEl) {
      var h = slideEl.querySelector("h3");
      live.textContent = h ? h.textContent : "";
    }
  }

  function initInstantAnchors() {
    var root = document.querySelector(".pedagogie-page") || document.getElementById("guide-hub");
    if (!root) return;
    var hubIds = ["section-carte", "savoir", "terrorisme", "quiz-cert", "sources", "guide-hub"];
    root.querySelectorAll('a[href^="#"]').forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.length < 2) return;
      const id = href.slice(1);
      if (hubIds.indexOf(id) >= 0) return;
      a.addEventListener("click", (e) => {
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        if (window.IslamMapPro && typeof window.IslamMapPro.activateInnerStabsForAnchor === "function") {
          window.IslamMapPro.activateInnerStabsForAnchor("savoir-stabs", el);
          window.IslamMapPro.activateInnerStabsForAnchor("savoir-fr-stabs", el);
          window.IslamMapPro.activateInnerStabsForAnchor("guide-stabs", el);
          window.IslamMapPro.activateInnerStabsForAnchor("sources-stabs", el);
          window.IslamMapPro.activateInnerStabsForAnchor("quiz-stabs", el);
          window.IslamMapPro.activateInnerStabsForAnchor("terror-stabs", el);
        }
        el.scrollIntoView({ behavior: "auto", block: "start" });
        try {
          history.replaceState(null, "", href);
        } catch (_) {}
      });
    });
  }

  function initImgFallback() {
    document.querySelectorAll(".slide-figure img").forEach((img) => {
      img.addEventListener("error", function () {
        const fig = img.closest(".slide-figure");
        if (!fig || fig.querySelector(".img-fallback")) return;
        const p = document.createElement("p");
        p.className = "img-fallback";
        p.style.cssText =
          "padding:20px;text-align:center;color:var(--muted);font-size:13px;line-height:1.5";
        p.innerHTML =
          "Illustration non chargée. Utilisez un serveur local (<code>npm start</code>) ou rafraîchissez après mise à jour : le cache PWA peut garder une ancienne liste de fichiers — videz le cache du site ou désinscrivez le service worker.";
        fig.appendChild(p);
        img.style.display = "none";
      });
    });
  }

  resolveSlideImageUrls();

  if (window.IslamMapSlideshow && document.getElementById("slideshow")) {
    window.IslamMapSlideshow.init({
      rootId: "slideshow",
      prevId: "slide-prev",
      nextId: "slide-next",
      counterId: "slide-counter",
      dotsId: "slide-dots",
      onChange: function (i, el) {
        updateSlideChrome(i, el);
      },
    });
    enhancePedagogyDots();
  }

  initInstantAnchors();
  initImgFallback();
})();
