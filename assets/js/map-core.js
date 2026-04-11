/**
 * Carte Leaflet : géométries, couches, étiquettes, zoom fluide.
 * Exporté sur window.IslamMapCore — consommé par map-ui.js.
 */
(function () {
  "use strict";

  const D = window.IslamMapData;
  if (!D) {
    console.error("[IslamMap] IslamMapData manquant — charger data.js avant map-core.js");
    return;
  }

  const { DATA, CENTROIDS, BY_ISO, OVERSEAS_BY_ISO } = D;
  const overseasBoxes = OVERSEAS_BY_ISO && typeof OVERSEAS_BY_ISO === "object" ? OVERSEAS_BY_ISO : {};

  const LAYERS = { sunni: true, shia: true, conflict: false, labels: true };

  let geoLayer = null;
  let conflictLayer = null;
  /* Label group : toujours conservé, show/hide plutôt que rebuild */
  let labelGroup = null;
  let labelGroupAdded = false;
  /** Marqueurs d’étiquettes + population (M) pour filtrer selon le zoom */
  let labelEntries = [];
  let bboxByIsoCache = null;
  let nameByIdGlobal = null;

  /* ── Carte ── */
  const MAP = L.map("map", {
    center: [20, 15],
    zoom: 2.75,
    minZoom: 1.5,
    maxZoom: 10,
    zoomControl: false,
    worldCopyJump: true,
    touchZoom: "center",
    bounceAtZoomLimits: false,
    scrollWheelZoom: false, /* remplacé par zoom molette fluide ci-dessous */
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    /* Note : preferCanvas n'affecte pas les polygones GeoJSON (SVG par défaut) */
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
  }).addTo(MAP);

  /**
   * Étiquettes : tous les pays du jeu DATA (~100) sont classés par « importance » pour la veille
   * (pop. musulmane, pop. totale, tension). Au zoom faible on n’affiche qu’une fraction du classement ;
   * la fraction augmente de façon continue jusqu’à 100 % au zoom max — pas de pays « oublié » par un seuil absolu mal calé.
   */
  const LABEL_VISIBLE_FRACTION = [
    [1.5, 0.085],
    [2, 0.12],
    [2.5, 0.19],
    [3, 0.28],
    [3.5, 0.36],
    [4.25, 0.48],
    [5.25, 0.6],
    [6.25, 0.72],
    [7.5, 0.84],
    [8.75, 0.94],
    [10, 1],
  ];

  function interpolateThreshold(z, anchors) {
    if (!anchors.length) return 0;
    if (z <= anchors[0][0]) return anchors[0][1];
    const last = anchors[anchors.length - 1];
    if (z >= last[0]) return last[1];
    for (let i = 0; i < anchors.length - 1; i++) {
      const z0 = anchors[i][0];
      const v0 = anchors[i][1];
      const z1 = anchors[i + 1][0];
      const v1 = anchors[i + 1][1];
      if (z >= z0 && z <= z1) {
        const u = (z - z0) / (z1 - z0);
        return v0 + (v1 - v0) * u;
      }
    }
    return last[1];
  }

  /** Score comparable sur tout le périmètre DATA (même échelle pour chaque pays du projet). */
  function labelImportanceScore(pM, mMusM, mPct, tension) {
    const p = typeof pM === "number" ? pM : 0;
    const mm = typeof mMusM === "number" ? mMusM : 0;
    const m = typeof mPct === "number" ? mPct : 0;
    const c = typeof tension === "number" ? tension : 0;
    return mm * 1.38 + p * 0.4 + m * 0.22 + c * 9.2;
  }

  function finalizeLabelRanks() {
    labelEntries.sort(function (a, b) {
      const ds = b.score - a.score;
      if (ds !== 0) return ds;
      return String(a.name).localeCompare(String(b.name), "fr");
    });
    for (let i = 0; i < labelEntries.length; i++) {
      labelEntries[i].rank = i;
    }
  }

  function refreshLabelZoomVisibility() {
    if (!labelEntries.length) return;
    const z = MAP.getZoom();
    const n = labelEntries.length;
    const frac = interpolateThreshold(z, LABEL_VISIBLE_FRACTION);
    const cap = Math.max(1, Math.ceil(frac * n));
    for (let i = 0; i < n; i++) {
      const row = labelEntries[i];
      const el = row.mk.getElement ? row.mk.getElement() : null;
      if (!el) continue;
      el.style.display = row.rank < cap ? "" : "none";
    }
  }

  let labelZoomRaf = null;
  function scheduleLabelZoomRefresh() {
    if (!LAYERS.labels || !labelGroupAdded) return;
    if (labelZoomRaf) return;
    labelZoomRaf = requestAnimationFrame(function () {
      labelZoomRaf = null;
      refreshLabelZoomVisibility();
    });
  }

  MAP.on("zoom", scheduleLabelZoomRefresh);
  MAP.on("zoomend", scheduleLabelZoomRefresh);

  /* ── Zoom molette fluide (Mac trackpad + souris) ── */
  (function () {
    const el = document.getElementById("map");
    let acc = 0;
    let raf = null;

    function normDelta(e) {
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 20;
      if (e.deltaMode === 2) d *= 200;
      return Math.abs(d) < 50 ? d * 0.036 : d * 0.0016;
    }

    el.addEventListener(
      "wheel",
      function (e) {
        /* Sans Ctrl/⌘ : laisser la page défiler (trackpad / molette). Zoom : Ctrl+molette, boutons +/−, ou pincer (trackpad). */
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        acc += normDelta(e);
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (Math.abs(acc) < 0.03) {
            acc = 0;
            raf = null;
            return;
          }
          const target = Math.max(MAP.getMinZoom(), Math.min(MAP.getMaxZoom(), MAP.getZoom() - acc));
          /* Zoom centré pour éviter les déplacements brusques au pinch 2 doigts. */
          MAP.setZoom(target, { animate: true });
          acc = 0;
          raf = null;
        });
      },
      { passive: false }
    );
  })();

  /* ── Fix antimeridian (Russie, Fidji…) ── */
  function fixRing(ring) {
    if (!ring || ring.length < 2) return ring;
    const out = [ring[0].slice()];
    for (let i = 1; i < ring.length; i++) {
      const prev = out[i - 1];
      const cur = ring[i].slice();
      const dx = cur[0] - prev[0];
      if (dx > 180) cur[0] -= 360;
      else if (dx < -180) cur[0] += 360;
      out.push(cur);
    }
    return out;
  }

  function fixGeom(g) {
    if (!g) return;
    if (g.type === "Polygon") g.coordinates = g.coordinates.map(fixRing);
    else if (g.type === "MultiPolygon") g.coordinates = g.coordinates.map((p) => p.map(fixRing));
  }

  /** Aire signée approx. (lng, lat) — suffisant pour trier l’empilement SVG. */
  function planarRingArea(ring) {
    if (!ring || ring.length < 3) return 0;
    let a = 0;
    const n = ring.length;
    const lim = ring[n - 1][0] === ring[0][0] && ring[n - 1][1] === ring[0][1] ? n - 1 : n;
    for (let i = 0; i < lim; i++) {
      const j = (i + 1) % lim;
      a += ring[i][0] * ring[j][1] - ring[j][0] * ring[i][1];
    }
    return Math.abs(a * 0.5);
  }

  /** Aire totale des anneaux extérieurs (sans trous) — pour l’ordre d’insertion Leaflet. */
  function featureHitArea(f) {
    const g = f && f.geometry;
    if (!g) return 0;
    if (g.type === "Polygon") return planarRingArea(g.coordinates[0]);
    if (g.type === "MultiPolygon") {
      return g.coordinates.reduce((s, poly) => s + (poly[0] ? planarRingArea(poly[0]) : 0), 0);
    }
    return 0;
  }

  /**
   * Frontières 110m simplifiées : polygones voisins se chevauchent souvent en SVG.
   * Leaflet teste le dernier path du DOM en premier → placer les plus petits pays
   * en dernier pour que le bon pays capte le survol (ex. Suriname vs Guyane française).
   */
  function sortFeaturesForHitOrder(fc) {
    if (!fc || !fc.features) return;
    fc.features.sort((a, b) => {
      const da = featureHitArea(a);
      const db = featureHitArea(b);
      if (db !== da) return db - da;
      return String(a.id).localeCompare(String(b.id));
    });
  }

  /* ── Couleurs pays — opacité clampée à [0,1] ── */
  function countryColor(name) {
    const d = DATA[name];
    if (!d || d.m < 3) return "rgba(255,255,255,.028)";
    const m = d.m / 100;
    const s = d.s / 100;
    const h = d.h / 100;
    const clamp = (v) => Math.min(1, Math.max(0, v));

    if (d.ib > 50) return `rgba(106,27,154,${clamp(0.22 + m * 0.6).toFixed(3)})`;
    if (h > 0.6)   return `rgba(11,61,138,${clamp(0.25 + m * h * 0.88).toFixed(3)})`;
    if (h > 0.4)   return `rgba(20,86,200,${clamp(0.24 + m * h * 0.82).toFixed(3)})`;
    if (h > 0.2 && s > 0.5) return `rgba(74,20,120,${clamp(0.18 + m * 0.55).toFixed(3)})`;
    if (s > 0.8)   return `rgba(20,92,34,${clamp(0.15 + m * s * 0.78).toFixed(3)})`;
    return               `rgba(30,138,48,${clamp(0.11 + m * s * 0.63).toFixed(3)})`;
  }

  function conflictColor(name) {
    const d = DATA[name];
    if (!d) return null;
    if (d.c === 3) return "rgba(194,40,40,.52)";
    if (d.c === 2) return "rgba(220,88,0,.42)";
    if (d.c === 1) return "rgba(240,170,30,.28)";
    return null;
  }

  /* ── Contenu tooltip ── */
  function tooltipContent(name, d) {
    const mAbs = ((d.p * d.m) / 100).toFixed(1);
    const flag = ["", "🟡", "🟠", "🔴"][d.c] || "";
    let html = `<b style="color:#c9a84c">${escapeHtml(name)}</b> ${flag}<br>`;
    html += `Pop. : <b>${d.p} M</b> &nbsp; Musulmans : <b>${d.m} %</b> (${mAbs} M)<br>`;
    html += `<span style="color:#5ec972">Sunnites : ${d.s} %</span> &nbsp; `;
    html += `<span style="color:#4d9ef5">Chiites : ${d.h} %</span>`;
    if (d.ib > 5) html += `<br><span style="color:#ce93d8">Ibadi : ${d.ib} %</span>`;
    return html;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /**
   * world-atlas 110m regroupe parfois métropole + outre-mer sous un même code ISO (ex. 250 = France + DOM).
   * Retourne la clé DATA affichée (tooltip, clic) selon la position du pointeur.
   */
  function resolveDisplayName(iso, latlng) {
    const canon = BY_ISO[iso];
    if (!latlng || typeof latlng.lat !== "number" || typeof latlng.lng !== "number") return canon;
    const boxes = overseasBoxes[iso];
    if (!boxes || !boxes.length) return canon;
    const lat = latlng.lat;
    const lng = latlng.lng;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (lat >= b.lat0 && lat <= b.lat1 && lng >= b.lng0 && lng <= b.lng1) return b.name;
    }
    return canon;
  }

  /* ── Étiquettes : construction unique, show/hide ── */
  function buildLabelsOnce() {
    if (labelGroup) return; /* déjà construit */

    if (!bboxByIsoCache) {
      bboxByIsoCache = {};
      geoLayer && geoLayer.eachLayer((ly) => {
        const id = String(ly.feature.id).padStart(3, "0");
        try { bboxByIsoCache[id] = L.geoJSON(ly.feature).getBounds().getCenter(); } catch (_) {}
      });
    }

    labelGroup = L.layerGroup();
    labelEntries = [];
    const seen = new Set();

    for (const name of Object.keys(DATA)) {
      if (seen.has(name)) continue;
      seen.add(name);

      let pos = null;
      if (CENTROIDS[name]) pos = L.latLng(CENTROIDS[name][0], CENTROIDS[name][1]);
      else {
        const iso = DATA[name].iso;
        if (iso && bboxByIsoCache[iso]) pos = bboxByIsoCache[iso];
      }
      if (!pos) continue;

      const d = DATA[name];
      const fontSize = d && d.m > 40 ? "10px" : "9px";
      const opacity = d && d.m > 10 ? "0.85" : d && d.m > 3 ? "0.55" : "0.30";

      const mk = L.marker(pos, {
        icon: L.divIcon({
          className: "country-label-marker",
          html: `<span style="display:block;font-family:Inter,system-ui,sans-serif;font-size:${fontSize};font-weight:600;color:rgba(255,255,255,${opacity});text-shadow:0 0 4px #000,0 0 10px #000;white-space:nowrap;transform:translate(-50%,-50%);pointer-events:none;user-select:none">${escapeHtml(name)}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
        interactive: false,
        zIndexOffset: -100,
      });
      labelGroup.addLayer(mk);
      const pNum = typeof d.p === "number" ? d.p : 0;
      const mPct = typeof d.m === "number" ? d.m : 0;
      const mMus = (pNum * mPct) / 100;
      const cVal = typeof d.c === "number" ? d.c : 0;
      const score = labelImportanceScore(pNum, mMus, mPct, cVal);
      labelEntries.push({ mk, name, p: pNum, mMus, score });
    }
    finalizeLabelRanks();
  }

  function showLabels() {
    buildLabelsOnce();
    if (!labelGroupAdded) {
      labelGroup.addTo(MAP);
      labelGroupAdded = true;
    }
    refreshLabelZoomVisibility();
  }

  function hideLabels() {
    if (labelGroupAdded && labelGroup) {
      MAP.removeLayer(labelGroup);
      labelGroupAdded = false;
    }
  }

  /* ── Classements panneaux ── */
  function buildRankLists() {
    const entries = Object.entries(DATA).filter(([, d]) => d && d.p && d.m);
    const topS = entries.map(([n, d]) => ({ n, v: (d.p * d.m * d.s) / 10000 })).sort((a, b) => b.v - a.v).slice(0, 10);
    const topH = entries.map(([n, d]) => ({ n, v: (d.p * d.m * d.h) / 10000 })).sort((a, b) => b.v - a.v).slice(0, 10);
    if (!topS.length || !topH.length) return;
    const mxS = topS[0].v || 1;
    const mxH = topH[0].v || 1;

    const elS = document.getElementById("rank-sunni");
    const elH = document.getElementById("rank-shia");
    if (!elS || !elH) return;
    elS.innerHTML = "";
    elH.innerHTML = "";

    topS.forEach((x, i) => {
      elS.insertAdjacentHTML("beforeend",
        `<div class="rank-item"><span class="rank-num">${i + 1}</span>
        <div class="rank-body"><div class="rank-name">${escapeHtml(x.n)}</div>
        <div class="rank-bar-bg"><div class="rank-bar-fill" style="width:${((x.v / mxS) * 100).toFixed(1)}%;background:linear-gradient(90deg,#145c22,#5ec972)"></div></div></div>
        <span class="rank-val">${x.v.toFixed(0)} M</span></div>`
      );
    });
    topH.forEach((x, i) => {
      elH.insertAdjacentHTML("beforeend",
        `<div class="rank-item"><span class="rank-num">${i + 1}</span>
        <div class="rank-body"><div class="rank-name">${escapeHtml(x.n)}</div>
        <div class="rank-bar-bg"><div class="rank-bar-fill" style="width:${((x.v / mxH) * 100).toFixed(1)}%;background:linear-gradient(90deg,#0b3d8a,#4d9ef5)"></div></div></div>
        <span class="rank-val">${x.v.toFixed(1)} M</span></div>`
      );
    });
  }

  /* ── Chargement GeoJSON ── */
  async function initMap() {
    const ld = document.getElementById("loading");
    try {
      if (typeof topojson === "undefined" || typeof topojson.feature !== "function") {
        throw new Error("Bibliothèque topojson-client introuvable (vérifiez le script CDN avant map-core.js).");
      }
      const resp = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json");
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const world = await resp.json();
      const geo = topojson.feature(world, world.objects.countries);
      geo.features.forEach((f) => fixGeom(f.geometry));
      sortFeaturesForHitOrder(geo);

      const nameById = {};
      geo.features.forEach((f) => {
        nameById[String(f.id).padStart(3, "0")] = BY_ISO[String(f.id).padStart(3, "0")] || null;
      });
      nameByIdGlobal = nameById;

      const styleBase = (f) => ({
        fillColor: countryColor(nameById[String(f.id).padStart(3, "0")]),
        fillOpacity: 1,
        color: "rgba(255,255,255,.09)",
        weight: 0.45,
      });

      geoLayer = L.geoJSON(geo, {
        style: styleBase,
        onEachFeature: (f, layer) => {
          const iso = String(f.id).padStart(3, "0");
          const name = nameById[iso];
          const d = name ? DATA[name] : null;
          if (!d) return;

          layer.bindTooltip("", { className: "map-tooltip", sticky: true, direction: "auto" });

          layer.on("mouseover", function (ev) {
            const disp = resolveDisplayName(iso, ev.latlng);
            const dd = DATA[disp] || d;
            this.setTooltipContent(tooltipContent(disp, dd));
            this.openTooltip();
            this.setStyle({ color: "rgba(201,168,76,.9)", weight: 1.8 });
          });
          layer.on("mouseout", function () {
            this.closeTooltip();
            this.setStyle({ color: "rgba(255,255,255,.09)", weight: 0.45 });
          });
          layer.on("click", (ev) => {
            /* Éviter l’anneau de focus navigateur sur le tracé SVG au clic */
            const t = ev.originalEvent && ev.originalEvent.target;
            if (t && typeof t.blur === "function") t.blur();
            requestAnimationFrame(function () {
              const ae = document.activeElement;
              if (ae && ae.closest && ae.closest(".leaflet-overlay-pane") && typeof ae.blur === "function") ae.blur();
            });
            const disp = resolveDisplayName(iso, ev.latlng);
            window.dispatchEvent(new CustomEvent("islammap:countryclick", { detail: { name: disp } }));
          });
        },
      }).addTo(MAP);

      conflictLayer = L.geoJSON(geo, {
        style: (f) => {
          const cc = conflictColor(nameById[String(f.id).padStart(3, "0")]);
          return { fillColor: cc || "transparent", fillOpacity: cc ? 1 : 0, color: "transparent", weight: 0 };
        },
        interactive: false,
      });

      showLabels();
      buildRankLists();

      if (ld) {
        ld.style.opacity = "0";
        setTimeout(() => { ld.style.display = "none"; }, 520);
      }

      window.dispatchEvent(new CustomEvent("islammap:ready", { detail: { map: MAP, nameById } }));
    } catch (err) {
      if (ld) {
        ld.innerHTML = `<div style="color:#ef5350;text-align:center;padding:32px;font-size:14px;line-height:1.7">
          Erreur de chargement de la carte.<br><br>
          <small style="color:#6b7a9a">Vérifiez votre connexion réseau (CDN jsDelivr).<br>${escapeHtml(String(err.message))}</small>
        </div>`;
      }
      console.error("[IslamMap]", err);
    }
  }

  /* ── Contrôle des couches ── */
  function toggleLayer(key) {
    LAYERS[key] = !LAYERS[key];
    const tog = document.getElementById("tog-" + key);
    if (tog) tog.classList.toggle("on", LAYERS[key]);

    if (key === "conflict") {
      if (conflictLayer) {
        if (LAYERS.conflict) conflictLayer.addTo(MAP);
        else MAP.removeLayer(conflictLayer);
      }
      const btn = document.getElementById("btn-conflicts");
      if (btn) btn.classList.toggle("active", LAYERS.conflict);
    }

    if (key === "labels") {
      if (LAYERS.labels) showLabels();
      else hideLabels();
    }

    if ((key === "sunni" || key === "shia") && geoLayer) {
      geoLayer.eachLayer((layer) => {
        if (!layer.feature) return;
        const iso = String(layer.feature.id).padStart(3, "0");
        const name = BY_ISO[iso];
        const d = DATA[name];
        if (!d || d.m < 5) return;
        const dominant = d.h > d.s ? "shia" : "sunni";
        const opacity = !LAYERS[dominant] ? 0.07 : 1;
        layer.setStyle({ fillColor: countryColor(name), fillOpacity: opacity });
      });
    }
  }

  window.IslamMapCore = {
    MAP,
    DATA,
    CENTROIDS,
    BY_ISO,
    LAYERS,
    initMap,
    toggleLayer,
    showLabels,
    hideLabels,
    countryColor,
    escapeHtml,
    nameById: () => nameByIdGlobal,
    getGeoLayer: () => geoLayer,
    getConflictLayer: () => conflictLayer,
  };
})();
