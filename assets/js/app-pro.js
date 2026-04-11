/**
 * SPA — navigation hub (Carte, Savoir, Terrorisme, Quiz, Références), frise chronologique, glossaire, quiz, thème, SW.
 */
(function () {
  "use strict";

  const D = window.IslamMapData;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const DEFAULT_HUB = "section-carte";
  const HUB_ORDER = ["section-carte", "savoir", "terrorisme", "quiz-cert", "sources"];

  /** Anciens favoris #accueil / #veille → hub actuel. */
  function resolveHubFromHash(raw) {
    if (!raw) return DEFAULT_HUB;
    if (raw === "accueil") return DEFAULT_HUB;
    if (raw === "veille") return "savoir";
    if (HUB_ORDER.indexOf(raw) >= 0) return raw;
    return DEFAULT_HUB;
  }

  /* ── Navigation hub ── */
  function showHub(id, opts) {
    opts = opts || {};
    const safe = HUB_ORDER.indexOf(id) >= 0 ? id : DEFAULT_HUB;
    HUB_ORDER.forEach((hid) => {
      const sec = document.getElementById(hid);
      const tab = document.querySelector('#site-nav [data-hub="' + hid + '"]');
      const on = hid === safe;
      if (sec) {
        sec.classList.toggle("is-active", on);
        sec.setAttribute("aria-hidden", on ? "false" : "true");
      }
      if (tab && tab.getAttribute("role") === "tab") {
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
      }
    });
    if (!opts.skipHash) history.replaceState(null, "", "#" + safe);
    requestAnimationFrame(() => {
      try {
        window.scrollTo(0, 0);
        const panel = document.getElementById(safe);
        if (panel) panel.scrollTop = 0;
      } catch (_) {}
    });
    const nav = $("#site-nav");
    const menuBtn = $("#site-menu-btn");
    if (nav && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    }
    if (safe === "section-carte") {
      const core = window.IslamMapCore;
      const refresh = () => { try { if (core && core.MAP) core.MAP.invalidateSize(); } catch (_) {} };
      requestAnimationFrame(() => {
        try {
          if (window.IslamMapUI && typeof window.IslamMapUI.collapseSidePanelsForCarteSection === "function") {
            window.IslamMapUI.collapseSidePanelsForCarteSection();
          }
        } catch (_) {}
      });
      requestAnimationFrame(refresh);
      setTimeout(refresh, 120);
      setTimeout(refresh, 400);
    }
    if (safe === "savoir") renderTimelineFrise();
    if (safe === "terrorisme") loadFranceTerrorChronologyOnce();
  }

  function initHubTabs() {
    $all('#site-nav [data-hub]').forEach((t) => {
      if (t.tagName !== "BUTTON") return;
      t.addEventListener("click", () => {
        const hid = t.getAttribute("data-hub");
        if (hid) showHub(hid);
      });
    });
  }

  function initHubHashLinks() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href^='#']");
      if (!a || a.closest("#site-nav")) return;
      const raw = (a.getAttribute("href") || "").replace(/^#/, "");
      if (!raw) return;
      const hub = resolveHubFromHash(raw);
      if (hub !== raw && HUB_ORDER.indexOf(raw) < 0) {
        e.preventDefault();
        showHub(hub);
        return;
      }
      if (HUB_ORDER.indexOf(raw) >= 0) {
        e.preventDefault();
        showHub(raw);
      }
    });
  }

  function initHubHistory() {
    window.addEventListener("hashchange", () => {
      const raw = (location.hash || "").replace(/^#/, "") || DEFAULT_HUB;
      const hub = resolveHubFromHash(raw);
      showHub(hub, { skipHash: true });
    });
  }

  function initHubFromUrl() {
    const raw = (location.hash || "").replace(/^#/, "") || DEFAULT_HUB;
    const hub = resolveHubFromHash(raw);
    if (hub !== raw && raw) history.replaceState(null, "", "#" + hub);
    showHub(hub, { skipHash: true });
  }

  /* ── Boutons hub (data-goto-hub) ── */
  function initHubButtons() {
    $all("[data-goto-hub]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const hid = btn.getAttribute("data-goto-hub");
        if (hid) showHub(hid);
      });
    });
  }

  /* ── Menu mobile ── */
  function initSiteMenu() {
    const btn = $("#site-menu-btn");
    const nav = $("#site-nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  /* ── Thème : préférence système uniquement (pas de bouton manuel) ── */
  function initTheme() {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    function apply() {
      document.documentElement.setAttribute("data-theme", mq.matches ? "light" : "dark");
    }
    apply();
    mq.addEventListener("change", apply);
  }

  /* ── Frise chronologique (HTML — évite chevauchements Plotly sur une seule ligne) ── */
  let timelineFriseBuilt = false;
  function renderTimelineFrise() {
    if (timelineFriseBuilt || !D || !D.TIMELINE_EVENTS) return;
    const mount = document.getElementById("timeline-plot");
    if (!mount) return;
    timelineFriseBuilt = true;
    const ev = D.TIMELINE_EVENTS;
    const rows = ev.map((e) => {
      const y = escHtml(String(e.year));
      const t = escHtml(e.t);
      const d = escHtml(e.d);
      return (
        "<li class='timeline-frise-item'>" +
        "<span class='timeline-frise-year'>" + y + "</span>" +
        "<div class='timeline-frise-card'>" +
        "<strong class='timeline-frise-title'>" + t + "</strong>" +
        "<p class='timeline-frise-desc'>" + d + "</p>" +
        "</div></li>"
      );
    });
    mount.innerHTML =
      "<ol class='timeline-frise' aria-label='Jalons chronologiques 610 à 2026'>" + rows.join("") + "</ol>";
  }

  /* ── Chronologie attentats France (JSON — sources judiciaires / parquet) ── */
  let frTerrorChronoState = 0;

  function fmtFrShortDate(iso) {
    if (!iso || typeof iso !== "string") return "";
    const p = iso.split("-");
    if (p.length !== 3) return iso;
    const y = Number(p[0]);
    const m = Number(p[1]);
    const d = Number(p[2]);
    if (!y || !m || !d) return iso;
    try {
      return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (_) {
      return iso;
    }
  }

  function buildFranceTerrorChronoHtml(data) {
    const disc =
      data && data.disclaimer
        ? '<p class="terror-chrono-disclaimer">' + escHtml(data.disclaimer) + "</p>"
        : "";
    const note =
      data && data.official_catalog_note
        ? '<p class="terror-p">' + escHtml(data.official_catalog_note) + "</p>"
        : "";
    const evs = (data && Array.isArray(data.events) ? data.events.slice() : []).sort(function (a, b) {
      return String(a.date || "").localeCompare(String(b.date || ""));
    });
    const rows = evs.map(function (e) {
      const dt = escHtml(e.date || "");
      const lab = fmtFrShortDate(e.date);
      return (
        "<tr>" +
        '<td><time datetime="' +
        dt +
        '">' +
        escHtml(lab) +
        "</time></td>" +
        "<td>" +
        escHtml(e.place || "") +
        "</td>" +
        "<td>" +
        escHtml(e.summary || "") +
        "</td>" +
        "<td>" +
        escHtml(e.actors_official || "") +
        "</td>" +
        '<td class="terror-chrono-jnote">' +
        escHtml(e.judicial_note || "") +
        "</td>" +
        "</tr>"
      );
    });
    return (
      disc +
      note +
      '<div class="table-responsive terror-chrono-table-wrap" role="region" aria-label="Chronologie indicative des attentats et actes qualifiés de terrorisme en France">' +
      '<table class="compare-table terror-chrono-table">' +
      "<thead><tr>" +
      '<th scope="col">Date</th>' +
      '<th scope="col">Lieu</th>' +
      '<th scope="col">Fait</th>' +
      '<th scope="col">Acteurs et qualification (parquet / jugements publics)</th>' +
      '<th scope="col">Note judiciaire</th>' +
      "</tr></thead><tbody>" +
      rows.join("") +
      "</tbody></table></div>"
    );
  }

  function loadFranceTerrorChronologyOnce() {
    const mount = document.getElementById("terror-fr-chrono-mount");
    if (!mount || frTerrorChronoState >= 2) return;
    if (frTerrorChronoState === 1) return;
    frTerrorChronoState = 1;
    fetch("assets/data/france-terror-chronology.json")
      .then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(function (data) {
        frTerrorChronoState = 2;
        mount.innerHTML = buildFranceTerrorChronoHtml(data);
      })
      .catch(function () {
        frTerrorChronoState = 2;
        mount.innerHTML =
          '<p class="terror-chrono-err">Impossible de charger la chronologie (serveur HTTP requis, ou réseau). Pour des bilans exhaustifs et à jour : <a href="https://www.sgdsn.gouv.fr/" rel="noopener noreferrer">SGDSN</a>, <a href="https://www.interieur.gouv.fr/" rel="noopener noreferrer">ministère de l’Intérieur</a>, rapports du Parlement.</p>';
      });
  }

  /* ── Onglets internes section Savoir ── */
  function initSavoirTabs() {
    const stabs = document.getElementById("savoir-stabs");
    if (!stabs) return;
    const btns = Array.from(stabs.querySelectorAll(".stab-btn[role='tab']"));
    const panels = Array.from(stabs.querySelectorAll(".stab-panel[role='tabpanel']"));

    function activateTab(btn) {
      const panelId = btn.getAttribute("aria-controls");
      btns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
        b.tabIndex = -1;
      });
      panels.forEach((p) => p.classList.remove("is-active"));
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      btn.tabIndex = 0;
      const panel = document.getElementById(panelId);
      if (panel) panel.classList.add("is-active");
      if (panelId === "stab-timeline") renderTimelineFrise();
    }

    btns.forEach((btn) => {
      btn.addEventListener("click", () => activateTab(btn));
      btn.addEventListener("keydown", (e) => {
        const i = btns.indexOf(btn);
        if (e.key === "ArrowRight") {
          e.preventDefault();
          const n = (i + 1) % btns.length;
          activateTab(btns[n]);
          btns[n].focus();
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          const n = (i - 1 + btns.length) % btns.length;
          activateTab(btns[n]);
          btns[n].focus();
        }
      });
    });
  }

  /* ── Glossaire ── */
  function initGlossary() {
    const wrap = $("#glossary-mount");
    if (!wrap || !D || !D.GLOSSARY) return;
    wrap.innerHTML = "";
    Object.keys(D.GLOSSARY).forEach((term) => {
      const div = document.createElement("div");
      div.className = "glossary-item";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = term;
      btn.setAttribute("aria-expanded", "false");
      const p = document.createElement("p");
      p.hidden = true;
      p.textContent = D.GLOSSARY[term];
      div.appendChild(btn);
      div.appendChild(p);
      wrap.appendChild(div);
    });
    const sav = document.getElementById("savoir");
    if (sav && !sav.dataset.glossDelegated) {
      sav.dataset.glossDelegated = "1";
      sav.addEventListener("click", (e) => {
        const btn = e.target.closest(".glossary-item button");
        if (!btn) return;
        const p = btn.nextElementSibling;
        if (!p || p.tagName !== "P") return;
        p.hidden = !p.hidden;
        btn.setAttribute("aria-expanded", String(!p.hidden));
      });
    }
  }

  function shuffleCopy(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /** `**gras**` → HTML échappé par morceaux */
  function formatBold(raw) {
    const parts = String(raw).split("**");
    let html = "";
    for (let i = 0; i < parts.length; i++) {
      const bit = escHtml(parts[i]);
      html += i % 2 === 1 ? "<strong>" + bit + "</strong>" : bit;
    }
    return html;
  }

  function isQcm(q) {
    return q && q.type === "qcm";
  }

  function normQcmAns(ans) {
    if (!Array.isArray(ans)) return [Number(ans)].filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);
    return ans.slice().sort((a, b) => a - b);
  }

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function sourceBlock(srcId) {
    if (!srcId || !Array.isArray(D.SOURCES_2026)) return "";
    const s = D.SOURCES_2026.find(function (x) { return x.id === srcId; });
    if (!s) return "";
    return (
      "<p class='quiz-src'><a href='" +
      escHtml(s.url) +
      "' target='_blank' rel='noopener noreferrer'>" +
      escHtml(s.label) +
      "</a><span class='quiz-src-note'> — " +
      escHtml(s.note) +
      "</span></p>"
    );
  }

  function correctLabelsHtml(q) {
    if (isQcm(q)) {
      return normQcmAns(q.ans)
        .map(function (i) {
          return escHtml(q.opts[i] != null ? q.opts[i] : "");
        })
        .join(" · ");
    }
    const i = Number(q.ans);
    return escHtml(q.opts[i] != null ? q.opts[i] : "");
  }

  /* ── Quiz hub : banque mélangée, QCU + QCM, correction après chaque question ── */
  function initQuizCert() {
    const box = $("#quiz-cert-box");
    if (!box || !D) return;
    if (!Array.isArray(D.QUIZ_DATA) || !D.QUIZ_DATA.length) {
      box.innerHTML =
        "<p class='pro-lead'>Banque de questions indisponible. Vérifiez que <code>quiz-bank.js</code> est chargé avant <code>pedagogy-bundle.js</code>.</p>";
      return;
    }

    let series = [];
    let idx = 0;
    let score = 0;
    let answered = false;

    function renderEnd() {
      const tot = series.length;
      const pct = tot ? Math.round((score / tot) * 100) : 0;
      box.innerHTML =
        "<div class='quiz-end'>" +
        "<p class='pro-lead'><strong>Série terminée.</strong> Score : " +
        score +
        " / " +
        tot +
        " (" +
        pct +
        "%)</p>" +
        "<button type='button' class='btn-ghost quiz-cert-primary' id='quiz-cert-new-series'>Nouvelle série aléatoire</button>" +
        "</div>";
      $("#quiz-cert-new-series")?.addEventListener("click", startSeries);
    }

    function feedbackHtml(ok, q) {
      const title = ok ? "Bonne réponse" : "Réponse incorrecte";
      const expl = q.explain
        ? "<p class='quiz-feedback-explain'>" + escHtml(q.explain) + "</p>"
        : "";
      const src = sourceBlock(q.srcId);
      const corr =
        "<p class='quiz-feedback-correct'><strong>Réponse attendue :</strong> " + correctLabelsHtml(q) + "</p>";
      return (
        "<div class='quiz-feedback " +
        (ok ? "quiz-feedback--ok" : "quiz-feedback--no") +
        "' role='status'><p class='quiz-feedback-title'>" +
        escHtml(title) +
        "</p>" +
        expl +
        src +
        corr +
        "<button type='button' class='btn-ghost quiz-cert-primary quiz-next-btn' id='quiz-cert-next'>Question suivante</button></div>"
      );
    }

    function attachNext() {
      $("#quiz-cert-next")?.addEventListener("click", function () {
        idx++;
        answered = false;
        renderQuestion();
      });
    }

    function renderQuestion() {
      if (idx >= series.length) {
        renderEnd();
        return;
      }
      const q = series[idx];
      const n = idx + 1;
      const tot = series.length;
      const badge = isQcm(q) ? "QCM" : "QCU";
      let html =
        "<div class='quiz-cert-head'><span class='quiz-badge'>" +
        escHtml(badge) +
        "</span><span class='quiz-progress'>" +
        n +
        " / " +
        tot +
        "</span></div>";
      html += "<p class='quiz-q'>" + formatBold(q.q) + "</p>";

      if (isQcm(q)) {
        html += "<div class='quiz-qcm-grid' id='quiz-qcm-opts'>";
        q.opts.forEach(function (opt, i) {
          html +=
            "<label class='quiz-qcm-label'><input type='checkbox' class='quiz-qcm-cb' name='qcm' value='" +
            i +
            "'> <span>" +
            escHtml(opt) +
            "</span></label>";
        });
        html +=
          "</div><div class='quiz-actions'><button type='button' class='btn-ghost quiz-cert-primary' id='quiz-cert-validate'>Valider</button></div><div id='quiz-feedback-slot'></div>";
        box.innerHTML = html;
        $("#quiz-cert-validate")?.addEventListener("click", function () {
          if (answered) return;
          const picked = Array.prototype.map
            .call(box.querySelectorAll(".quiz-qcm-cb:checked"), function (el) {
              return parseInt(el.value, 10);
            })
            .sort(function (a, b) {
              return a - b;
            });
          const ok = arraysEqual(picked, normQcmAns(q.ans));
          if (ok) score++;
          answered = true;
          const want = normQcmAns(q.ans);
          box.querySelectorAll(".quiz-qcm-cb").forEach(function (el) {
            el.disabled = true;
            const vi = parseInt(el.value, 10);
            const lab = el.closest(".quiz-qcm-label");
            if (!lab) return;
            if (want.indexOf(vi) >= 0) lab.classList.add("quiz-hit");
            else if (el.checked) lab.classList.add("quiz-miss");
          });
          const slot = $("#quiz-feedback-slot");
          const act = box.querySelector(".quiz-actions");
          if (act) act.remove();
          if (slot) slot.innerHTML = feedbackHtml(ok, q);
          attachNext();
        });
        return;
      }

      html += "<div class='quiz-opts-qcu'>";
      q.opts.forEach(function (opt, i) {
        html +=
          "<button type='button' class='quiz-opt btn-ghost' data-i='" +
          i +
          "'>" +
          escHtml(opt) +
          "</button>";
      });
      html += "</div><div id='quiz-feedback-slot'></div>";
      box.innerHTML = html;
      box.querySelectorAll(".quiz-opt").forEach(function (b) {
        b.addEventListener("click", function () {
          if (answered) return;
          answered = true;
          const i = parseInt(b.getAttribute("data-i"), 10);
          const ok = i === Number(q.ans);
          if (ok) score++;
          box.querySelectorAll(".quiz-opt").forEach(function (btn) {
            btn.disabled = true;
            const bi = parseInt(btn.getAttribute("data-i"), 10);
            if (bi === Number(q.ans)) btn.classList.add("quiz-hit");
            else if (bi === i) btn.classList.add("quiz-miss");
          });
          const slot = $("#quiz-feedback-slot");
          if (slot) slot.innerHTML = feedbackHtml(ok, q);
          attachNext();
        });
      });
    }

    function startSeries() {
      series = shuffleCopy(D.QUIZ_DATA);
      idx = 0;
      score = 0;
      answered = false;
      renderQuestion();
    }

    startSeries();
  }

  /* ── Copier citations ── */
  function initCiteButtons() {
    $all("[data-cite]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const block = document.getElementById(btn.getAttribute("data-cite") || "");
        if (!block) return;
        const t = block.innerText || block.textContent || "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(t)
            .then(() => alert("Références copiées."))
            .catch(() => alert(t));
        } else {
          alert(t);
        }
      });
    });
  }

  /* ── Service Worker ── */
  function initSw() {
    if (!("serviceWorker" in navigator)) return;
    const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (isLocal) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.getRegistrations()
          .then((regs) => regs.forEach((r) => r.unregister()))
          .catch(() => {});
      });
      return;
    }
    if (location.protocol !== "https:") return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  /* ── Navigation clavier (Alt+flèches) ── */
  function initArrowNav() {
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, textarea, select, [contenteditable]")) return;
      if (!e.altKey) return;
      const curRaw = (location.hash || "#" + DEFAULT_HUB).replace("#", "") || DEFAULT_HUB;
      const cur = resolveHubFromHash(curRaw);
      let i = HUB_ORDER.indexOf(cur);
      if (i < 0) i = 0;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); i = Math.min(HUB_ORDER.length - 1, i + 1); }
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); i = Math.max(0, i - 1); }
      else return;
      showHub(HUB_ORDER[i]);
    });
  }

  /* ── Resize carte au passage de l'onglet ── */
  function initMapResize() {
    const sec = document.getElementById("section-carte");
    const core = window.IslamMapCore;
    if (!sec || !core || !core.MAP) return;
    const map = core.MAP;
    const refresh = () => requestAnimationFrame(() => map.invalidateSize());
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => entries.forEach((en) => { if (en.isIntersecting) setTimeout(refresh, 250); }),
        { threshold: 0.15 }
      ).observe(sec);
    }
    window.addEventListener("load", () => setTimeout(refresh, 400));
  }

  /* ── Bannière protocole file:// ── */
  function initFileProtocolBanner() {
    const el = document.getElementById("file-protocol-banner");
    if (el && location.protocol === "file:") el.hidden = false;
  }

  /* ── Boot ── */
  function boot() {
    initFileProtocolBanner();
    initHubTabs();
    initHubHashLinks();
    initHubHistory();
    initHubButtons();
    initSiteMenu();
    initTheme();
    initSavoirTabs();
    initGlossary();
    initQuizCert();
    initCiteButtons();
    initSw();
    initArrowNav();
    initMapResize();
    initHubFromUrl();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
