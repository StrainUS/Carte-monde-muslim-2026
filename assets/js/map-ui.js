/**
 * Modale pays, recherche, quiz avec score, raccourcis clavier, mode présentation.
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

  const { DATA, CENTROIDS, QUIZ_DATA, SECURITY_NOTES, TERROR_HOTSPOTS } = D;
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

  /** HTML interne du quiz (réutilisé après « Recommencer » ou réouverture) */
  const QUIZ_BOX_INNER_HTML =
    '<div id="quiz-score" class="quiz-score"></div>' +
    '<div id="quiz-question"></div>' +
    '<div class="quiz-options" id="quiz-options"></div>' +
    '<button type="button" id="quiz-next">Question suivante</button>';

  /* ── État application ── */
  let quizIdx = 0;
  let quizScore = 0;
  let quizAnswered = false;
  let rightCollapsed = false;
  let presentMode = false;
  let searchTimer = null;
  let terrorLayerGroup = null;
  let terrorLayerVisible = false;

  /* ══════════════════════════════════════
     MODALE PAYS
  ══════════════════════════════════════ */
  function openModal(name) {
    const d = DATA[name];
    if (!d) return;

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
      `<div class="modal-sep">Indicateur pédagogique 2026</div><span class="conflict-badge ${cClass}">${cText}</span>`;

    document.getElementById("modal-note").innerHTML =
      "💡 <b>Pour comprendre :</b> " + escapeHtml(d.n).replace(/\n/g, "<br>");

    const sn = SECURITY_NOTES && SECURITY_NOTES[name];
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
    setBlk("modal-france-block", "Risques & formation France", sn && sn.france);
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
        "📚 Synthèse pédagogique — <a href=\"#sources\">Références &amp; sources 2026</a> · " +
        "<a href=\"pedagogie.html#sources\">Guide historique</a>.";
    }

    document.getElementById("modal-overlay").classList.add("open");
  }

  function closeModal() {
    document.getElementById("modal-overlay").classList.remove("open");
  }

  /* ══════════════════════════════════════
     RECHERCHE
  ══════════════════════════════════════ */
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
    const q = val.trim().toLowerCase();
    if (q.length < 2) {
      drop.innerHTML = "";
      drop.classList.remove("open");
      drop.setAttribute("aria-expanded", "false");
      return;
    }
    const hits = Object.keys(DATA)
      .filter((n) => n.toLowerCase().includes(q))
      .slice(0, 12);
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
    const hasHits = hits.length > 0;
    drop.classList.toggle("open", hasHits);
    drop.setAttribute("aria-expanded", String(hasHits));
  }

  function onSearchInput(val) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(val), 160);
  }

  /* ══════════════════════════════════════
     QUIZ avec score
  ══════════════════════════════════════ */
  function toggleQuiz() {
    const box = document.getElementById("quiz-box");
    const btn = document.getElementById("btn-quiz");
    const open = !box.classList.contains("open");
    box.classList.toggle("open", open);
    btn.classList.toggle("active", open);
    if (open) {
      /* Après l’écran final, le DOM ne contient plus #quiz-options */
      if (!document.getElementById("quiz-options")) {
        box.innerHTML = QUIZ_BOX_INNER_HTML;
      }
      quizIdx = 0;
      quizScore = 0;
      quizAnswered = false;
      renderQuiz();
    }
  }

  function renderQuiz() {
    quizAnswered = false;
    const tot = QUIZ_DATA.length;
    const q = QUIZ_DATA[quizIdx % tot];
    const n = (quizIdx % tot) + 1;

    document.getElementById("quiz-question").textContent = `Question ${n} / ${tot} — ${q.q}`;

    const scoreEl = document.getElementById("quiz-score");
    if (scoreEl) scoreEl.textContent = `Score : ${quizScore} / ${quizIdx}`;

    const opts = document.getElementById("quiz-options");
    opts.innerHTML = "";
    q.opts.forEach((text, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt";
      b.textContent = text;
      b.dataset.quizIndex = String(i);
      b.dataset.quizCorrect = String(q.ans);
      opts.appendChild(b);
    });
    const nextBtn = document.getElementById("quiz-next");
    if (nextBtn) nextBtn.style.display = "none";
  }

  function answerQuiz(btn) {
    if (quizAnswered) return;
    const i = parseInt(btn.dataset.quizIndex, 10);
    const correct = parseInt(btn.dataset.quizCorrect, 10);
    quizAnswered = true;
    const isCorrect = i === correct;
    if (isCorrect) quizScore++;
    const opts = document.querySelectorAll("#quiz-options .quiz-opt");
    opts.forEach((el) => {
      const idx = parseInt(el.dataset.quizIndex, 10);
      el.disabled = true;
      if (idx === correct) el.classList.add("correct");
      else if (idx === i && !isCorrect) el.classList.add("wrong");
    });
    const scoreEl = document.getElementById("quiz-score");
    if (scoreEl) scoreEl.textContent = `Score : ${quizScore} / ${quizIdx + 1}`;
    const nextBtn = document.getElementById("quiz-next");
    if (nextBtn) nextBtn.style.display = "block";
  }

  function restartQuizFromEnd() {
    const box = document.getElementById("quiz-box");
    box.innerHTML = QUIZ_BOX_INNER_HTML;
    quizIdx = 0;
    quizScore = 0;
    quizAnswered = false;
    renderQuiz();
  }

  function nextQuiz() {
    quizIdx++;
    /* Fin du cycle — afficher résultat final (Recommencer géré par délégation #quiz-box) */
    if (quizIdx >= QUIZ_DATA.length) {
      const box = document.getElementById("quiz-box");
      const pct = Math.round((quizScore / QUIZ_DATA.length) * 100);
      box.innerHTML =
        '<div id="quiz-question" style="text-align:center">Quiz terminé ! Score final</div>' +
        '<div style="text-align:center;font-size:24px;font-weight:700;color:var(--gold);padding:12px 0">' +
        quizScore +
        " / " +
        QUIZ_DATA.length +
        "</div>" +
        '<div style="text-align:center;font-size:13px;color:var(--muted);margin-bottom:12px">' +
        pct +
        " % de bonnes réponses</div>" +
        '<button type="button" id="quiz-restart" class="quiz-opt" style="width:100%;justify-content:center;margin-top:4px">Recommencer</button>';
      return;
    }
    renderQuiz();
  }

  /* ══════════════════════════════════════
     PANNEAUX
  ══════════════════════════════════════ */
  function toggleRight() {
    rightCollapsed = !rightCollapsed;
    const panel = document.getElementById("panel-right");
    const b = document.getElementById("right-toggle");
    panel.classList.toggle("collapsed", rightCollapsed);
    b.textContent = rightCollapsed ? "▶" : "◀";
    b.classList.toggle("collapsed", rightCollapsed);
    b.setAttribute("aria-expanded", String(!rightCollapsed));
    b.setAttribute(
      "aria-label",
      rightCollapsed ? "Déplier le panneau latéral droit" : "Replier le panneau latéral droit"
    );
    requestAnimationFrame(() => MAP.invalidateSize());
  }

  function togglePresent() {
    presentMode = !presentMode;
    document.getElementById("btn-present").classList.toggle("active", presentMode);

    const statsBar = document.getElementById("stats-bar");
    const panelL = document.getElementById("panel-left");
    const rt = document.getElementById("right-toggle");

    if (presentMode) {
      panelL.style.display = "none";
      if (statsBar) statsBar.style.display = "none";
      if (rt) rt.style.display = "none";
      /* Panneau droit toujours masqué en présentation */
      document.getElementById("panel-right").style.display = "none";
    } else {
      panelL.style.display = "";
      if (statsBar) statsBar.style.display = "";
      if (rt) rt.style.display = "";
      /* Restaurer l'état réel du panneau droit */
      const panelR = document.getElementById("panel-right");
      panelR.style.display = "";
      panelR.classList.toggle("collapsed", rightCollapsed);
    }
    requestAnimationFrame(() => MAP.invalidateSize());
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  }

  /* ══════════════════════════════════════
     BINDINGS
  ══════════════════════════════════════ */
  function bindNavButtons() {
    document.getElementById("nav-zoom-in")?.addEventListener("click", () => MAP.zoomIn());
    document.getElementById("nav-zoom-out")?.addEventListener("click", () => MAP.zoomOut());
    document.getElementById("nav-world")?.addEventListener("click", () => MAP.setView([20, 15], 2));
    document.getElementById("nav-me")?.addEventListener("click", () => MAP.setView([27, 42], 4));
    document.getElementById("nav-af")?.addEventListener("click", () => MAP.setView([8, 20], 3));
    document.getElementById("nav-as")?.addEventListener("click", () => MAP.setView([25, 82], 3));
  }

  function bindTopbar() {
    document.getElementById("btn-conflicts")?.addEventListener("click", () => coreToggleLayer("conflict"));
    document.getElementById("btn-quiz")?.addEventListener("click", toggleQuiz);
    document.getElementById("btn-present")?.addEventListener("click", togglePresent);
    document.getElementById("btn-print")?.addEventListener("click", () => window.print());
    document.getElementById("btn-fullscreen")?.addEventListener("click", toggleFullscreen);
    document.getElementById("btn-mobile-menu")?.addEventListener("click", () => {
      document.getElementById("panel-left").classList.toggle("open");
    });
    document.getElementById("right-toggle")?.addEventListener("click", toggleRight);
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
      }, 180);
    });
  }

  /**
   * Un seul parent #quiz-box : « Question suivante », « Recommencer » et options
   * survivent aux remplacements innerHTML (plus de boutons morts).
   */
  function bindQuizBoxDelegation() {
    const box = document.getElementById("quiz-box");
    if (!box || box.dataset.quizDelegated === "1") return;
    box.dataset.quizDelegated = "1";
    box.addEventListener("click", (e) => {
      if (e.target.closest("#quiz-next")) {
        e.preventDefault();
        nextQuiz();
        return;
      }
      if (e.target.closest("#quiz-restart")) {
        e.preventDefault();
        restartQuizFromEnd();
        return;
      }
      const opt = e.target.closest("#quiz-options .quiz-opt");
      if (opt && !quizAnswered) answerQuiz(opt);
    });
  }

  function bindModal() {
    const overlay = document.getElementById("modal-overlay");
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    document.getElementById("modal-close")?.addEventListener("click", closeModal);
  }

  /* ── Raccourcis globaux ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.getElementById("search-drop")?.classList.remove("open");
      document.getElementById("search-drop")?.setAttribute("aria-expanded", "false");
      return;
    }
    if (e.target.closest("input, textarea, [contenteditable]")) return;
    if (e.key === "f" || e.key === "F") toggleFullscreen();
    if (e.key === "+" || e.key === "=") MAP.zoomIn();
    if (e.key === "-") MAP.zoomOut();
    if (e.key === "p" || e.key === "P") togglePresent();
  });

  window.addEventListener("resize", () => MAP.invalidateSize());

  document.addEventListener("fullscreenchange", () => {
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
    bindQuizBoxDelegation();
    bindModal();
  }

  /* Carte prête : redimensionner Leaflet + hotspots terrorisme (cercles indicatifs) */
  window.addEventListener("islammap:ready", () => {
    MAP.invalidateSize();
    if (TERROR_HOTSPOTS && TERROR_HOTSPOTS.length && !terrorLayerGroup) {
      terrorLayerGroup = L.layerGroup();
      TERROR_HOTSPOTS.forEach((h) => {
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
  }

  const loadingEl = document.getElementById("loading");
  if (loadingEl) loadingEl.style.transition = "opacity .5s cubic-bezier(.22,1,.36,1)";

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }

  window.IslamMapUI = { openModal, closeModal, selectCountry, toggleQuiz, togglePresent };
})();
