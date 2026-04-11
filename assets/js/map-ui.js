/**
 * Modale pays, recherche, raccourcis clavier, mode présentation.
 * Dépend de IslamMapData (data.js) et IslamMapCore (map-core.js).
 */
(function () {
  "use strict";

  const D = window.IslamMapData;
  const Core = window.IslamMapCore;
  if (!D || !Core) {
    console.error("[IslamMapUI] IslamMapData ou IslamMapCore manquant.");
    return;
  }

  const { DATA, CENTROIDS } = D;
  const { MAP, toggleLayer: coreToggleLayer } = Core;
  const escapeHtml =
    typeof Core.escapeHtml === "function"
      ? Core.escapeHtml.bind(Core)
      : function (s) {
          return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
        };

  /* ── État application : panneaux latéraux repliés par défaut (grand écran) ── */
  let rightCollapsed = true;
  let leftCollapsed = true;
  let searchTimer = null;
  let terrorLayerGroup = null;
  let terrorLayerVisible = false;
  let modalReturnFocus = null;

  /* ══════════════════════════════════════
     MODALE PAYS
  ══════════════════════════════════════ */
  function openModal(name) {
    const d = DATA[name];
    if (!d) return;
    if (isMapFullscreen()) {
      openFullscreenPopup(name, d);
      return;
    }

    const mT = (d.p * d.m) / 100;
    const sAbs = ((mT * d.s) / 100).toFixed(1);
    const hAbs = ((mT * d.h) / 100).toFixed(1);
    const ibAbs = ((mT * d.ib) / 100).toFixed(1);

    document.getElementById("modal-name").textContent = name;
    document.getElementById("modal-region").textContent =
      "📍 " + d.r + " — Données indicatives (voir Sources & méthode)";

    document.getElementById("modal-cards").innerHTML = `
      <div class="modal-card">
        <div class="modal-card-label">Population totale</div>
        <div class="modal-card-value">${d.p} M</div>
        <div class="modal-card-sub">habitants (estim.)</div>
      </div>
      <div class="modal-card">
        <div class="modal-card-label">Part musulmane</div>
        <div class="modal-card-value">${d.m} %</div>
        <div class="modal-card-sub">${mT.toFixed(1)} M personnes</div>
      </div>
      <div class="modal-card" style="border-color:rgba(30,138,48,.35)">
        <div class="modal-card-label" style="color:#5ec972">Sunnites (parmi musulmans)</div>
        <div class="modal-card-value" style="color:#5ec972">${d.s} %</div>
        <div class="modal-card-sub">${sAbs} M</div>
      </div>
      <div class="modal-card" style="border-color:rgba(20,86,200,.35)">
        <div class="modal-card-label" style="color:#4d9ef5">Chiites (parmi musulmans)</div>
        <div class="modal-card-value" style="color:#4d9ef5">${d.h} %</div>
        <div class="modal-card-sub">${hAbs} M</div>
      </div>
      ${d.ib > 3 ? `<div class="modal-card" style="border-color:rgba(106,27,154,.35)">
        <div class="modal-card-label" style="color:#ce93d8">Ibadi</div>
        <div class="modal-card-value" style="color:#ce93d8">${d.ib} %</div>
        <div class="modal-card-sub">${ibAbs} M</div>
      </div>` : ""}`;

    /* Graphique camembert */
    const cv = document.getElementById("modal-canvas");
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, 106, 106);
    const slices = [
      { pct: d.s * (d.m / 100), col: "#145c22", lbl: "Sunnites" },
      { pct: d.h * (d.m / 100), col: "#0b3d8a", lbl: "Chiites" },
      { pct: d.ib * (d.m / 100), col: "#6a1b9a", lbl: "Ibadi" },
      { pct: 100 - d.m, col: "#1c2840", lbl: "Non-musulmans" },
    ].filter((x) => x.pct > 0.15);
    let a = -Math.PI / 2;
    slices.forEach((x) => {
      const ang = (x.pct / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(53, 53);
      ctx.arc(53, 53, 48, a, a + ang);
      ctx.closePath();
      ctx.fillStyle = x.col;
      ctx.fill();
      a += ang;
    });
    /* Trou central */
    ctx.beginPath();
    ctx.arc(53, 53, 24, 0, 2 * Math.PI);
    ctx.fillStyle = "#0d1628";
    ctx.fill();
    ctx.fillStyle = "#c9a84c";
    ctx.font = "bold 10px Inter,system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(d.m + " %", 53, 57);

    document.getElementById("modal-pie-legend").innerHTML = slices
      .map((x) => `<div class="modal-pie-row"><div class="modal-pie-dot" style="background:${x.col}"></div>${escapeHtml(x.lbl)} : ${x.pct.toFixed(1)} %</div>`)
      .join("");

    /* Barres animées (double-rAF pour déclencher la transition CSS) */
    const barsEl = document.getElementById("modal-bars");
    barsEl.innerHTML = `
      <div class="modal-sep">Répartition visuelle</div>
      <div class="modal-bar-row">
        <div class="modal-bar-label"><span>Sunnites</span><span style="color:#5ec972">${d.s} % · ${sAbs} M</span></div>
        <div class="modal-bar-bg"><div class="modal-bar-fill" style="width:0%;background:linear-gradient(90deg,#145c22,#5ec972)"></div></div>
      </div>
      <div class="modal-bar-row">
        <div class="modal-bar-label"><span>Chiites</span><span style="color:#4d9ef5">${d.h} % · ${hAbs} M</span></div>
        <div class="modal-bar-bg"><div class="modal-bar-fill" style="width:0%;background:linear-gradient(90deg,#0b3d8a,#4d9ef5)"></div></div>
      </div>
      <div class="modal-bar-row">
        <div class="modal-bar-label"><span>Musulmans / population</span><span style="color:var(--gold)">${d.m} %</span></div>
        <div class="modal-bar-bg"><div class="modal-bar-fill" style="width:0%;background:linear-gradient(90deg,#c9a84c,#e8c97a)"></div></div>
      </div>`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const fills = barsEl.querySelectorAll(".modal-bar-fill");
        if (fills[0]) fills[0].style.width = d.s + "%";
        if (fills[1]) fills[1].style.width = d.h + "%";
        if (fills[2]) fills[2].style.width = d.m + "%";
      });
    });

    /* Indicateur de tensions */
    const cClass = ["l0", "l1", "l2", "l3"][d.c];
    const cText = [
      "✅ Pas de conflit majeur indiqué (niveau 0)",
      "🟡 Tensions modérées (niveau 1)",
      "🟠 Tensions élevées (niveau 2)",
      "🔴 Conflit actif ou crise aiguë (niveau 3)",
    ][d.c];
    document.getElementById("modal-conflict").innerHTML =
      `<div class="modal-sep">Indicateur de veille 2026</div><span class="conflict-badge ${cClass}">${cText}</span>`;

    document.getElementById("modal-note").innerHTML =
      "💡 <b>Pour comprendre :</b> " + escapeHtml(d.n).replace(/\n/g, "<br>");

    const sn = D.SECURITY_NOTES && D.SECURITY_NOTES[name];
    const setBlk = (id, title, text) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (text) {
        el.hidden = false;
        el.innerHTML =
          `<div class="modal-sep">${escapeHtml(title)}</div><p class="modal-extra-text">${escapeHtml(text)}</p>`;
      } else {
        el.innerHTML = "";
        el.hidden = true;
      }
    };
    setBlk("modal-terror-block", "Terrorisme & groupes (synthèse)", sn && sn.terrorisme);
    setBlk("modal-france-block", "Risques & prévention — France", sn && sn.france);
    setBlk("modal-ue-block", "Cadre européen", sn && sn.ue);
    const snConflit = document.getElementById("modal-sn-conflit");
    if (snConflit) {
      if (sn && sn.conflit) {
        snConflit.hidden = false;
        snConflit.innerHTML =
          `<div class="modal-sep">Conflit / géopolitique</div><p class="modal-extra-text">${escapeHtml(sn.conflit)}</p>`;
      } else {
        snConflit.innerHTML = "";
        snConflit.hidden = true;
      }
    }

    const src = document.getElementById("modal-source");
    if (src) {
      src.innerHTML =
        "📚 Synthèse de veille — <a href=\"#sources\">Références &amp; sources 2026</a> · " +
        "<a href=\"#guide-ped-sources\">Guide — sources (dépôt)</a>.";
    }

    const overlay = document.getElementById("modal-overlay");
    modalReturnFocus = document.activeElement;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    const closeBtn = document.getElementById("modal-close");
    requestAnimationFrame(() => {
      if (closeBtn && typeof closeBtn.focus === "function") closeBtn.focus();
    });
  }

  function openFullscreenPopup(name, d) {
    const sn = D.SECURITY_NOTES && D.SECURITY_NOTES[name];
    const mT = (d.p * d.m) / 100;
    const box = document.getElementById("map-fs-popup");
    const content = document.getElementById("map-fs-popup-content");
    if (!box || !content) return;

    content.innerHTML = `
      <h3 class="map-fs-title">${escapeHtml(name)}</h3>
      <p class="map-fs-sub">📍 ${escapeHtml(d.r)} · détail pays en mode carte agrandie</p>
      <div class="map-fs-grid">
        <div class="map-fs-card"><b>Population</b><span>${d.p} M</span></div>
        <div class="map-fs-card"><b>Part musulmane</b><span>${d.m} % (${mT.toFixed(1)} M)</span></div>
        <div class="map-fs-card"><b>Sunnites</b><span>${d.s} %</span></div>
        <div class="map-fs-card"><b>Chiites</b><span>${d.h} %</span></div>
      </div>
      <div class="map-fs-block"><strong>Lecture :</strong> ${escapeHtml(d.n)}</div>
      ${sn && sn.conflit ? `<div class="map-fs-block"><strong>Conflit / géopolitique :</strong> ${escapeHtml(sn.conflit)}</div>` : ""}
      ${sn && sn.terrorisme ? `<div class="map-fs-block"><strong>Terrorisme (synthèse) :</strong> ${escapeHtml(sn.terrorisme)}</div>` : ""}
      ${sn && sn.france ? `<div class="map-fs-block"><strong>Angle France :</strong> ${escapeHtml(sn.france)}</div>` : ""}
      <div class="map-fs-block"><strong>Sources :</strong> voir <a href="#sources">section Sources</a> pour les références officielles.</div>
    `;

    box.classList.add("open");
    box.setAttribute("aria-hidden", "false");
    content.scrollTop = 0;
  }

  function closeFullscreenPopup() {
    const box = document.getElementById("map-fs-popup");
    if (!box) return;
    box.classList.remove("open");
    box.setAttribute("aria-hidden", "true");
  }

  function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    if (modalReturnFocus && typeof modalReturnFocus.focus === "function") {
      try {
        modalReturnFocus.focus();
      } catch (_) {}
    }
    modalReturnFocus = null;
  }

  /* ══════════════════════════════════════
     RECHERCHE
  ══════════════════════════════════════ */
  function searchFold(s) {
    const t = String(s).normalize("NFD");
    try {
      return t.replace(/\p{M}/gu, "").toLowerCase();
    } catch (_) {
      return t.replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
  }

  function selectCountry(name) {
    const input = document.getElementById("search-input");
    const drop = document.getElementById("search-drop");
    input.value = name;
    drop.classList.remove("open");
    drop.setAttribute("aria-expanded", "false");
    openModal(name);
    if (CENTROIDS[name]) {
      MAP.flyTo(CENTROIDS[name], Math.max(MAP.getZoom(), 4), { duration: 0.85, easeLinearity: 0.45 });
    }
  }

  function runSearch(val) {
    const drop = document.getElementById("search-drop");
    const q = val.trim();
    if (q.length < 2) {
      drop.innerHTML = "";
      drop.classList.remove("open");
      drop.setAttribute("aria-expanded", "false");
      return;
    }
    const fq = searchFold(q);
    const keys = Object.keys(DATA);
    const hits = keys
      .filter((n) => searchFold(n).includes(fq))
      .sort((a, b) => {
        const fa = searchFold(a);
        const fb = searchFold(b);
        const pa = fa.startsWith(fq) ? 0 : 1;
        const pb = fb.startsWith(fq) ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return fa.length - fb.length || a.localeCompare(b, "fr");
      })
      .slice(0, 12);
    if (!hits.length) {
      drop.innerHTML =
        '<div class="drop-empty" role="status">Aucun pays correspondant. Essayez une autre orthographe.</div>';
      drop.classList.add("open");
      drop.setAttribute("aria-expanded", "true");
      return;
    }
    drop.innerHTML = hits.map((name) => {
      const d = DATA[name];
      const dotCol = d.ib > 50 ? "#6a1b9a" : d.h > 60 ? "#0b3d8a" : d.h > 30 ? "#1456c8" : "#1e8a30";
      const key = encodeURIComponent(name);
      return `<button type="button" class="drop-item" data-country="${key}" role="option">
        <span class="drop-dot" style="background:${dotCol}"></span>
        <span>${escapeHtml(name)}</span>
        <span class="drop-meta">${d.m} % · ${escapeHtml(d.r)}</span>
      </button>`;
    }).join("");
    drop.classList.add("open");
    drop.setAttribute("aria-expanded", "true");
  }

  function onSearchInput(val) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(val), 160);
  }

  /* ══════════════════════════════════════
     PANNEAUX
  ══════════════════════════════════════ */
  /** Applique leftCollapsed / rightCollapsed au DOM (vue mobile : panneau gauche type tiroir, sans .collapsed). */
  function syncSidePanelDom() {
    const narrow = window.matchMedia("(max-width: 900px)").matches;
    const pl = document.getElementById("panel-left");
    const pr = document.getElementById("panel-right");
    const bl = document.getElementById("left-toggle");
    const br = document.getElementById("right-toggle");

    if (narrow) {
      leftCollapsed = false;
      if (pl) pl.classList.remove("collapsed");
      if (bl) {
        bl.textContent = "▶";
        bl.classList.remove("collapsed");
        bl.setAttribute("aria-expanded", "true");
        bl.setAttribute("aria-label", "Replier le panneau couches et légende");
      }
    } else {
      if (pl) pl.classList.toggle("collapsed", leftCollapsed);
      if (bl) {
        bl.textContent = leftCollapsed ? "◀" : "▶";
        bl.classList.toggle("collapsed", leftCollapsed);
        bl.setAttribute("aria-expanded", String(!leftCollapsed));
        bl.setAttribute(
          "aria-label",
          leftCollapsed ? "Déplier le panneau couches et légende" : "Replier le panneau couches et légende"
        );
      }
    }

    if (pr) pr.classList.toggle("collapsed", rightCollapsed);
    if (br) {
      br.textContent = rightCollapsed ? "▶" : "◀";
      br.classList.toggle("collapsed", rightCollapsed);
      br.setAttribute("aria-expanded", String(!rightCollapsed));
      br.setAttribute(
        "aria-label",
        rightCollapsed ? "Déplier le panneau latéral droit" : "Replier le panneau latéral droit"
      );
    }
    requestAnimationFrame(() => {
      try {
        if (MAP) MAP.invalidateSize();
      } catch (_) {}
    });
  }

  function toggleRight() {
    rightCollapsed = !rightCollapsed;
    syncSidePanelDom();
  }

  /** Replier le panneau gauche (couches / légende) : grand écran et plein écran ; masqué en vue étroite (menu ☰). */
  function toggleLeft() {
    if (window.matchMedia("(max-width: 900px)").matches) return;
    leftCollapsed = !leftCollapsed;
    syncSidePanelDom();
  }

  function resetLeftCollapseIfNarrow() {
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    syncSidePanelDom();
  }

  /** À chaque affichage de l’onglet Carte (hub) : repartir avec les deux panneaux repliés sur grand écran. */
  function collapseSidePanelsForCarteSection() {
    leftCollapsed = true;
    rightCollapsed = true;
    syncSidePanelDom();
  }

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function requestFullscreenSafe(el) {
    if (!el) return Promise.resolve(false);
    if (el.requestFullscreen) return el.requestFullscreen().then(() => true).catch(() => false);
    if (el.webkitRequestFullscreen) {
      try {
        el.webkitRequestFullscreen();
        return Promise.resolve(true);
      } catch (_) {
        return Promise.resolve(false);
      }
    }
    return Promise.resolve(false);
  }

  function exitFullscreenSafe() {
    if (document.exitFullscreen) return document.exitFullscreen().catch(() => {});
    if (document.webkitExitFullscreen) {
      try {
        document.webkitExitFullscreen();
      } catch (_) {}
    }
  }

  /** Plein écran sur #main (carte + panneaux), pas sur #map-wrap seul — sinon le bouton ◀ ne peut pas montrer #panel-right. */
  function isMapFullscreen() {
    const fs = fullscreenElement();
    const main = document.getElementById("main");
    return !!(fs && main && fs === main);
  }

  function updateMapExpandButton() {
    const btn = document.getElementById("btn-fullscreen");
    if (!btn) return;
    const active = isMapFullscreen();
    btn.textContent = active ? "×" : "⛶";
    btn.title = active ? "Quitter le plein écran (F)" : "Plein écran : carte, légende et classements (F)";
    btn.setAttribute("aria-label", btn.title);
    btn.classList.toggle("is-active", active);
  }

  function toggleMapFullscreen() {
    const main = document.getElementById("main");
    if (!main) return;
    if (isMapFullscreen()) {
      exitFullscreenSafe();
      return;
    }
    requestFullscreenSafe(main).then((ok) => {
      if (!ok) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
      setTimeout(() => MAP.invalidateSize(), 120);
      updateMapExpandButton();
    });
  }

  /* ══════════════════════════════════════
     BINDINGS
  ══════════════════════════════════════ */
  function bindNavButtons() {
    document.getElementById("nav-zoom-in")?.addEventListener("click", () => MAP.zoomIn());
    document.getElementById("nav-zoom-out")?.addEventListener("click", () => MAP.zoomOut());
    document.getElementById("nav-world")?.addEventListener("click", () => MAP.setView([20, 15], 2.75));
    document.getElementById("nav-me")?.addEventListener("click", () => MAP.setView([27, 42], 4));
    document.getElementById("nav-af")?.addEventListener("click", () => MAP.setView([8, 20], 3));
  }

  function bindFullscreenPopup() {
    const closeBtn = document.getElementById("map-fs-popup-close");
    const handle = document.getElementById("map-fs-popup-handle");
    const content = document.getElementById("map-fs-popup-content");
    if (closeBtn) closeBtn.addEventListener("click", closeFullscreenPopup);
    if (!handle) return;

    let startY = 0;
    let moved = false;
    handle.addEventListener("touchstart", (e) => {
      moved = false;
      startY = e.touches && e.touches[0] ? e.touches[0].clientY : 0;
    }, { passive: true });
    handle.addEventListener("touchmove", (e) => {
      if (!startY) return;
      const y = e.touches && e.touches[0] ? e.touches[0].clientY : 0;
      if (y - startY > 28 && (!content || content.scrollTop <= 0)) moved = true;
    }, { passive: true });
    handle.addEventListener("touchend", () => {
      if (moved) closeFullscreenPopup();
      startY = 0;
      moved = false;
    });
  }

  function bindTopbar() {
    document.getElementById("btn-fullscreen")?.addEventListener("click", toggleMapFullscreen);
    document.getElementById("btn-mobile-menu")?.addEventListener("click", () => {
      document.getElementById("panel-left").classList.toggle("open");
    });
    document.getElementById("right-toggle")?.addEventListener("click", toggleRight);
    document.getElementById("left-toggle")?.addEventListener("click", toggleLeft);
  }

  function bindToggles() {
    [["tog-sunni", "sunni"], ["tog-shia", "shia"], ["tog-conflict", "conflict"], ["tog-labels", "labels"]]
      .forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("click", () => coreToggleLayer(key));
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); coreToggleLayer(key); }
        });
      });
    const tt = document.getElementById("tog-terror");
    if (tt) {
      const go = () => {
        terrorLayerVisible = !terrorLayerVisible;
        tt.classList.toggle("on", terrorLayerVisible);
        tt.setAttribute("aria-pressed", String(terrorLayerVisible));
        if (terrorLayerGroup) {
          if (terrorLayerVisible) MAP.addLayer(terrorLayerGroup);
          else MAP.removeLayer(terrorLayerGroup);
        }
      };
      tt.addEventListener("click", go);
      tt.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
    }
  }

  function bindSearch() {
    const input = document.getElementById("search-input");
    const drop = document.getElementById("search-drop");
    input.addEventListener("input", () => onSearchInput(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        drop.classList.remove("open");
        drop.setAttribute("aria-expanded", "false");
        return;
      }
      if (e.key === "Enter" && drop.classList.contains("open")) {
        const first = drop.querySelector(".drop-item[data-country]");
        if (first) {
          e.preventDefault();
          selectCountry(decodeURIComponent(first.getAttribute("data-country")));
        }
      }
    });
    drop.addEventListener("mousedown", (e) => e.preventDefault());
    drop.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-country]");
      if (!btn) return;
      selectCountry(decodeURIComponent(btn.getAttribute("data-country")));
    });
    input.addEventListener("blur", () => {
      setTimeout(() => {
        drop.classList.remove("open");
        drop.setAttribute("aria-expanded", "false");
      }, 260);
    });
  }

  function bindModal() {
    const overlay = document.getElementById("modal-overlay");
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    document.getElementById("modal-close")?.addEventListener("click", closeModal);
  }

  /* ── Raccourcis globaux ── */
  document.addEventListener("keydown", (e) => {
    const modalEl = document.getElementById("modal-overlay");
    if (modalEl && modalEl.classList.contains("open") && e.key === "Tab") {
      const box = document.getElementById("modal-box");
      if (box) {
        const focusable = Array.prototype.filter.call(
          box.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
          ),
          (el) => el.offsetParent !== null || el === document.activeElement
        );
        if (focusable.length) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      return;
    }
    if (e.key === "Escape") {
      closeModal();
      document.getElementById("search-drop")?.classList.remove("open");
      document.getElementById("search-drop")?.setAttribute("aria-expanded", "false");
      return;
    }
    if (e.target.closest("input, textarea, [contenteditable]")) return;
    if (e.key === "f" || e.key === "F") toggleMapFullscreen();
    if (e.key === "+" || e.key === "=") MAP.zoomIn();
    if (e.key === "-") MAP.zoomOut();
  });

  window.addEventListener("resize", () => {
    resetLeftCollapseIfNarrow();
    MAP.invalidateSize();
  });

  document.addEventListener("fullscreenchange", () => {
    if (!isMapFullscreen()) closeFullscreenPopup();
    updateMapExpandButton();
    setTimeout(() => MAP.invalidateSize(), 120);
  });
  document.addEventListener("webkitfullscreenchange", () => {
    if (!isMapFullscreen()) closeFullscreenPopup();
    updateMapExpandButton();
    setTimeout(() => MAP.invalidateSize(), 120);
  });

  window.addEventListener("islammap:countryclick", (e) => {
    const name = e.detail && e.detail.name;
    if (name) openModal(name);
  });

  function initUI() {
    bindNavButtons();
    bindTopbar();
    bindToggles();
    bindSearch();
    bindModal();
    bindFullscreenPopup();
    updateMapExpandButton();
  }

  /* Carte prête : redimensionner Leaflet + hotspots terrorisme (cercles indicatifs) */
  window.addEventListener("islammap:ready", () => {
    MAP.invalidateSize();
    if (D.TERROR_HOTSPOTS && D.TERROR_HOTSPOTS.length && !terrorLayerGroup) {
      terrorLayerGroup = L.layerGroup();
      D.TERROR_HOTSPOTS.forEach((h) => {
        const km = h.km || 200;
        const inten = typeof h.intensity === "number" ? h.intensity : 0.6;
        const circle = L.circle([h.lat, h.lng], {
          radius: km * 1000,
          color: "rgba(198,40,40,.75)",
          weight: 1,
          fillColor: "#e65100",
          fillOpacity: 0.08 + inten * 0.18,
        });
        circle.bindTooltip("<b>" + escapeHtml(h.label || "Zone") + "</b>", { sticky: true, direction: "auto", className: "map-tooltip" });
        circle.addTo(terrorLayerGroup);
      });
    }
  });

  function startApp() {
    initUI();
    Core.initMap();
    syncSidePanelDom();
  }

  const loadingEl = document.getElementById("loading");
  if (loadingEl) loadingEl.style.transition = "opacity .5s cubic-bezier(.22,1,.36,1)";

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }

  window.IslamMapUI = {
    openModal,
    closeModal,
    selectCountry,
    collapseSidePanelsForCarteSection,
  };
})();
