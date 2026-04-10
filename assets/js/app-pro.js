/**
 * Coque SPA : navigation, onglets Savoir, timeline Plotly, glossaire, quiz certif, thème, SW.
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

  /* ── Scroll doux + lien actif ── */
  function initNavHighlight() {
    const links = $all(".site-nav a[href^='#']");
    const sec = $all("main section[id]");
    if (!links.length || !sec.length) return;

    const map = {};
    sec.forEach((s) => {
      map[s.id] = s;
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const id = en.target.id;
          links.forEach((a) => {
            const href = a.getAttribute("href");
            a.classList.toggle("is-active", href === "#" + id);
            if (href === "#" + id) a.setAttribute("aria-current", "location");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.1, 0.25] }
    );
    sec.forEach((s) => io.observe(s));

    links.forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        const el = map[id];
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", "#" + id);
        }
      });
    });
  }

  /* ── Menu mobile site ── */
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

  /* ── Thème ── */
  function initTheme() {
    const key = "islammap-theme";
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    function apply(pref) {
      const html = document.documentElement;
      if (pref === "light" || pref === "dark") {
        html.setAttribute("data-theme", pref);
        try {
          localStorage.setItem(key, pref);
        } catch (_) {}
        return;
      }
      const stored = (function () {
        try {
          return localStorage.getItem(key);
        } catch (_) {
          return null;
        }
      })();
      if (stored === "light" || stored === "dark") html.setAttribute("data-theme", stored);
      else html.setAttribute("data-theme", mq.matches ? "light" : "dark");
    }
    apply();
    mq.addEventListener("change", () => {
      try {
        if (!localStorage.getItem(key)) apply();
      } catch (_) {
        apply();
      }
    });
    $("#btn-theme-toggle")?.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      apply(cur === "light" ? "dark" : "light");
    });
  }

  /* ── Breadcrumb ── */
  function initBreadcrumb() {
    const el = $("#breadcrumb-here");
    if (!el) return;
    const names = {
      accueil: "Accueil",
      "section-carte": "Carte interactive",
      savoir: "Savoir pédagogique",
      terrorisme: "Focus terrorisme",
      "quiz-cert": "Quiz & certification",
      sources: "Sources",
    };
    function render() {
      const hash = (location.hash || "#accueil").replace("#", "") || "accueil";
      const label = names[hash] || "Page";
      el.innerHTML =
        "<ol><li><a href='#accueil'>Accueil</a></li><li aria-current='page'>" +
        label.replace(/</g, "&lt;") +
        "</li></ol>";
    }
    window.addEventListener("hashchange", render);
    render();
  }

  /* ── Onglets Savoir ── */
  function initSavoirTabs() {
    const tabs = $all(".savoir-tab");
    const panels = $all(".savoir-panel");
    if (!tabs.length) return;

    function activate(id) {
      tabs.forEach((t) => {
        const sel = t.getAttribute("data-tab") === id;
        t.setAttribute("aria-selected", String(sel));
        t.tabIndex = sel ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === "panel-" + id;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-hidden", String(!on));
      });
    }

    tabs.forEach((t) => {
      t.addEventListener("click", () => {
        const tid = t.getAttribute("data-tab");
        activate(tid);
        if (tid === "timeline") loadPlotlyTimeline();
      });
    });
    activate("timeline");
  }

  let plotlyLoaded = false;
  function loadPlotlyTimeline() {
    if (plotlyLoaded || !D || !D.TIMELINE_EVENTS) return;
    plotlyLoaded = true;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.35.2/plotly.min.js";
    s.async = true;
    s.onload = () => {
      const ev = D.TIMELINE_EVENTS;
      const years = ev.map((e) => e.year);
      const data = [
        {
          x: years,
          y: years.map(() => 1),
          mode: "markers+text",
          text: ev.map((e) => String(e.year)),
          textposition: "top center",
          hoverinfo: "text",
          hovertext: ev.map((e) => e.t + "\n" + e.d),
          marker: { size: 14, color: "#c9a84c" },
        },
      ];
      const light = document.documentElement.getAttribute("data-theme") === "light";
      const fg = light ? "#1a2233" : "#e4eaf4";
      const grid = light ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.08)";
      const layout = {
        paper_bgcolor: light ? "#f0f3f8" : "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { l: 48, r: 24, t: 24, b: 48 },
        xaxis: { title: "Année", gridcolor: grid, zeroline: false, color: fg },
        yaxis: { visible: false, range: [0.5, 1.5] },
        font: { family: "Inter, system-ui, sans-serif", color: fg },
        showlegend: false,
        hovermode: "closest",
      };
      const config = { responsive: true, displayModeBar: false };
      window.Plotly.newPlot("timeline-plot", data, layout, config);
    };
    document.head.appendChild(s);
  }

  /* ── Glossaire ── */
  function initGlossary() {
    const wrap = $("#glossary-mount");
    if (!wrap || !D || !D.GLOSSARY) return;
    wrap.innerHTML = "";
    Object.keys(D.GLOSSARY).forEach((term) => {
      const def = D.GLOSSARY[term];
      const div = document.createElement("div");
      div.className = "glossary-item";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = term;
      btn.setAttribute("aria-expanded", "false");
      const p = document.createElement("p");
      p.hidden = true;
      p.textContent = def;
      div.appendChild(btn);
      div.appendChild(p);
      wrap.appendChild(div);
    });
    const dup = document.getElementById("glossary-mount-duplicate");
    if (dup) dup.innerHTML = wrap.innerHTML;
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

  /* ── Mini-quiz Savoir (10 premières questions) ── */
  function initSavoirMiniQuiz() {
    const box = $("#mini-quiz-mount");
    if (!box || !D || !D.QUIZ_DATA) return;
    const qs = D.QUIZ_DATA.slice(0, 10);
    let idx = 0;
    let score = 0;
    let answered = false;

    function esc(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function render() {
      if (idx >= qs.length) {
        box.innerHTML =
          "<p><strong>Mini-quiz :</strong> " +
          score +
          " / " +
          qs.length +
          " — <a href='#quiz-cert'>Quiz complet (20 Q)</a></p>";
        return;
      }
      const q = qs[idx];
      let html =
        "<p class='pro-kicker'>Mini-quiz " +
        (idx + 1) +
        "/10</p><p class='pro-lead' style='font-size:14px'>" +
        esc(q.q) +
        "</p><div>";
      q.opts.forEach((opt, i) => {
        html +=
          "<button type='button' class='btn-ghost mini-q' data-i='" +
          i +
          "' style='display:block;width:100%;margin-bottom:6px'>" +
          esc(opt) +
          "</button>";
      });
      html += "</div>";
      box.innerHTML = html;
      box.querySelectorAll(".mini-q").forEach((b) => {
        b.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          const i = parseInt(b.getAttribute("data-i"), 10);
          if (i === q.ans) score++;
          setTimeout(() => {
            idx++;
            answered = false;
            render();
          }, 400);
        });
      });
    }
    render();
  }

  /* ── Quiz certification (20 Q) ── */
  function initQuizCert() {
    const box = $("#quiz-cert-box");
    if (!box || !D || !D.QUIZ_DATA) return;
    const qs = D.QUIZ_DATA;
    let idx = 0;
    let score = 0;
    let answered = false;

    function render() {
      if (idx >= qs.length) {
        const pct = Math.round((score / qs.length) * 100);
        box.innerHTML =
          "<p class='pro-lead'><strong>Terminé.</strong> Score : " +
          score +
          " / " +
          qs.length +
          " (" +
          pct +
          "%)</p>" +
          "<button type='button' class='btn-ghost' id='quiz-cert-restart'>Recommencer</button>";
        $("#quiz-cert-restart")?.addEventListener("click", () => {
          idx = 0;
          score = 0;
          answered = false;
          render();
        });
        return;
      }
      const q = qs[idx];
      const n = idx + 1;
      let html =
        "<p class='pro-kicker'>Question " +
        n +
        " / " +
        qs.length +
        "</p>" +
        "<p class='pro-lead' style='margin-bottom:12px'>" +
        escapeHtml(q.q) +
        "</p><div>";
      q.opts.forEach((opt, i) => {
        html +=
          "<button type='button' class='quiz-opt btn-ghost' data-i='" +
          i +
          "'>" +
          escapeHtml(opt) +
          "</button>";
      });
      html += "</div>";
      box.innerHTML = html;
      box.querySelectorAll(".quiz-opt").forEach((b) => {
        b.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          const i = parseInt(b.getAttribute("data-i"), 10);
          if (i === q.ans) score++;
          box.querySelectorAll(".quiz-opt").forEach((btn) => {
            btn.disabled = true;
            const bi = parseInt(btn.getAttribute("data-i"), 10);
            if (bi === q.ans) btn.style.borderColor = "rgba(30,138,48,.8)";
            else if (bi === i) btn.style.borderColor = "rgba(198,40,40,.6)";
          });
          setTimeout(() => {
            idx++;
            answered = false;
            render();
          }, 520);
        });
      });
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    render();
  }

  /* ── Bouton citer ── */
  function initCiteButtons() {
    $all("[data-cite]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-cite");
        const block = id ? document.getElementById(id) : null;
        if (!block) return;
        const t = block.innerText || block.textContent || "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(t).then(
            () => alert("Références copiées dans le presse-papiers."),
            () => alert(t)
          );
        } else {
          alert(t);
        }
      });
    });
  }

  /* ── Service Worker ── */
  function initSw() {
    if (!("serviceWorker" in navigator)) return;
    const ok =
      location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";
    if (!ok) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  /* ── Raccourcis ── */
  function initArrowNav() {
    const order = ["accueil", "section-carte", "savoir", "terrorisme", "quiz-cert", "sources"];
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, textarea, select, [contenteditable]")) return;
      if (!e.altKey) return;
      const cur = (location.hash || "#accueil").replace("#", "") || "accueil";
      let i = order.indexOf(cur);
      if (i < 0) i = 0;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        i = Math.min(order.length - 1, i + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        i = Math.max(0, i - 1);
      } else return;
      const el = document.getElementById(order[i]);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#" + order[i]);
    });
  }

  /* ── Lazy Plotly quand section visible ── */
  function initLazyTimeline() {
    const sec = document.getElementById("savoir");
    if (!sec || !("IntersectionObserver" in window)) {
      loadPlotlyTimeline();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            loadPlotlyTimeline();
            io.disconnect();
          }
        });
      },
      { threshold: 0.05 }
    );
    io.observe(sec);
  }

  function initEditorial() {
    const el = $("#footer-editorial");
    if (!el) return;
    fetch("assets/data/editorial.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j) return;
        el.textContent =
          j.legal + " — " + j.method + " (v" + j.version + ", " + j.lastUpdated + ").";
        el.hidden = false;
      })
      .catch(() => {});
  }

  function initSectionProgress() {
    const KEY = "islammap-sections-v1";
    const secIds = ["accueil", "section-carte", "savoir", "terrorisme", "quiz-cert", "sources"];
    const countEl = document.getElementById("parcours-count");
    const wrap = document.getElementById("parcours-hint");
    const visited = new Set();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) JSON.parse(raw).forEach((id) => visited.add(id));
    } catch (_) {}

    function persist() {
      try {
        localStorage.setItem(KEY, JSON.stringify(Array.from(visited)));
      } catch (_) {}
      if (countEl) countEl.textContent = visited.size + " / " + secIds.length;
      if (wrap) wrap.hidden = visited.size === 0;
    }

    function mark(id) {
      if (secIds.indexOf(id) < 0) return;
      if (visited.has(id)) return;
      visited.add(id);
      persist();
    }

    secIds.forEach((id) => {
      const section = document.getElementById(id);
      if (!section || !("IntersectionObserver" in window)) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) mark(id);
          });
        },
        { threshold: 0.22 }
      );
      io.observe(section);
    });

    document.querySelectorAll('.site-nav a[href^="#"]').forEach((a) => {
      a.addEventListener("click", () => {
        const id = (a.getAttribute("href") || "").replace(/^#/, "");
        if (id) mark(id);
      });
    });

    persist();
  }

  function initHashScroll() {
    const id = (location.hash || "").replace(/^#/, "");
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }

  function boot() {
    initNavHighlight();
    initSiteMenu();
    initTheme();
    initBreadcrumb();
    initSavoirTabs();
    initGlossary();
    initQuizCert();
    initSavoirMiniQuiz();
    initCiteButtons();
    initSw();
    initArrowNav();
    initLazyTimeline();
    initMapResize();
    initEditorial();
    initSectionProgress();
    initHashScroll();
  }

  function initMapResize() {
    const sec = document.getElementById("section-carte");
    const core = window.IslamMapCore;
    if (!sec || !core || !core.MAP) return;
    const map = core.MAP;
    const refresh = () => {
      requestAnimationFrame(() => map.invalidateSize());
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setTimeout(refresh, 250);
        });
      }, { threshold: 0.15 }).observe(sec);
    }
    window.addEventListener("load", () => setTimeout(refresh, 400));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
