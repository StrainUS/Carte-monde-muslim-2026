<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';
  import type * as L from 'leaflet';
  import type { Feature, FeatureCollection, Geometry } from 'geojson';
  import type { LayerKey } from './layers.svelte.ts';
  import {
    byIsoCanonical,
    byName,
    hotspots as HOTSPOTS,
    getSecurityFor,
    type Country,
    type Hotspot,
    type SecurityNote
  } from '$data';
  import { styleCountry, dominant } from './colors.ts';

  const CONFLICT_LABELS = [
    'Pas de tension significative',
    'Tensions modérées',
    'Tensions élevées',
    'Conflit ouvert / zone à risque'
  ] as const;

  function escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#39;';
        default:
          return ch;
      }
    });
  }

  function buildTensionPopup(c: Country, col: string): string {
    const notes = getSecurityFor(c.name);
    const lvl = c.conflict as 0 | 1 | 2 | 3;
    return `
      <article class="map-popup" data-kind="tension">
        <header class="map-popup-head" style="--bar:${col}">
          <span class="map-popup-kicker">Tension régionale</span>
          <strong class="map-popup-title">${escapeHtml(c.name)}</strong>
          <span class="map-popup-tag" style="background:${col}22;color:${col}">
            Niveau ${lvl} · ${CONFLICT_LABELS[lvl]}
          </span>
        </header>
        ${notes?.conflit ? `<p class="map-popup-body">${escapeHtml(notes.conflit)}</p>` : `<p class="map-popup-body map-popup-muted">${escapeHtml(c.notes)}</p>`}
        <button type="button" class="map-popup-btn" data-open-country="${escapeHtml(c.name)}">
          Voir la fiche pays →
        </button>
      </article>
    `;
  }

  function buildHotspotPopup(h: Hotspot): string {
    const notes: SecurityNote | undefined = getSecurityFor(h.zone);
    const country = byName.get(h.zone);
    const pct = Math.round(h.intensity * 100);
    return `
      <article class="map-popup" data-kind="hotspot">
        <header class="map-popup-head" style="--bar:#ff5722">
          <span class="map-popup-kicker">Hotspot terrorisme</span>
          <strong class="map-popup-title">${escapeHtml(h.label)}</strong>
          <span class="map-popup-tag" style="background:#ff572222;color:#ff5722">
            Intensité ${pct}% · rayon ≈ ${h.radiusKm} km
          </span>
        </header>
        <p class="map-popup-sub">Zone : ${escapeHtml(h.zone)}</p>
        ${notes?.terrorisme ? `<p class="map-popup-body">${escapeHtml(notes.terrorisme)}</p>` : ''}
        ${notes?.france ? `<p class="map-popup-body"><strong>France</strong> — ${escapeHtml(notes.france)}</p>` : ''}
        ${country ? `<button type="button" class="map-popup-btn" data-open-country="${escapeHtml(country.name)}">Voir la fiche ${escapeHtml(country.name)} →</button>` : ''}
      </article>
    `;
  }

  type CountryFeature = Feature<Geometry, { iso?: string }> & { id?: string | number };

  interface Props {
    layers: Record<LayerKey, boolean>;
    selected?: string | null;
    onSelect?: (country: Country) => void;
  }

  let { layers, selected = $bindable(null), onSelect }: Props = $props();

  let container: HTMLDivElement;
  let map: L.Map | null = null;
  let countriesLayer: L.GeoJSON | null = null;
  let hotspotsLayer: L.LayerGroup | null = null;
  let labelsLayer: L.LayerGroup | null = null;
  /** Un layerGroup par niveau de tension → on peut dévoiler progressivement
   *  (niveau 3 partout, niveau 2 dès zoom ≥ 3, niveau 1 dès zoom ≥ 4). */
  let tensionLevels: Record<1 | 2 | 3, L.LayerGroup> | null = null;
  let themeObserver: MutationObserver | null = null;
  let loading = $state(true);
  let error = $state<string | null>(null);
  /** Après 6 s de chargement toujours en cours, on révèle un bouton de
   *  réinitialisation du cache : SW obsolète / chunks corrompus sont la
   *  cause 9 fois sur 10 d'un "Chargement de la carte…" qui boucle. */
  let stuckHint = $state(false);

  /** Tensions intensity → color */
  function conflictColor(level: 0 | 1 | 2 | 3): string {
    return ['transparent', '#f9a825', '#e65100', '#c62828'][level];
  }

  /** "Poids" d'un pays pour priorisation visuelle des labels = population musulmane absolue (M). */
  function labelWeight(c: Country): number {
    return (c.population * c.muslimPct) / 100;
  }

  /** Nombre de labels max à afficher selon le zoom courant (évite l'empilement).
   *  Seuils en `<=` pour supporter le zoom fractionnaire (ex. 2.5, 3.75…). */
  function labelCapForZoom(zoom: number): number {
    if (zoom <= 2.5) return 10;
    if (zoom <= 3.25) return 25;
    if (zoom <= 4.25) return 60;
    return Number.POSITIVE_INFINITY;
  }

  /** Lorsqu'un popup Leaflet s'ouvre, on branche dynamiquement le bouton
   * "Voir la fiche pays" sur la callback `onSelect` du parent. Le bouton est
   * généré côté HTML (buildTensionPopup / buildHotspotPopup) avec un attribut
   * data-open-country qui porte le nom du pays cible. */
  function wireOpenCountry<T extends L.Layer>(layer: T): void {
    (layer as unknown as L.Evented).on('popupopen', (evt) => {
      const popupEvt = evt as L.PopupEvent;
      const el = popupEvt.popup.getElement();
      const btn = el?.querySelector<HTMLButtonElement>('[data-open-country]');
      if (!btn) return;
      const name = btn.getAttribute('data-open-country') ?? '';
      const country = byName.get(name);
      if (!country) {
        btn.disabled = true;
        btn.textContent = 'Fiche indisponible';
        return;
      }
      const handler = () => {
        onSelect?.(country);
        selected = country.name;
        (layer as unknown as { closePopup?: () => void }).closePopup?.();
      };
      btn.addEventListener('click', handler);
      (layer as unknown as L.Evented).once('popupclose', () =>
        btn.removeEventListener('click', handler)
      );
    });
  }

  /** Course contre la montre : si une promesse met trop de temps (SW stale,
   *  chunk perdu, réseau qui flotte), on transforme le hang en vraie erreur
   *  visible au lieu de laisser l'UI tourner indéfiniment. */
  function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`${label} : délai dépassé (${ms / 1000}s)`)), ms);
      p.then(
        (v) => {
          clearTimeout(t);
          resolve(v);
        },
        (e) => {
          clearTimeout(t);
          reject(e);
        }
      );
    });
  }

  async function loadMap() {
    try {
      const L = (await withTimeout(import('leaflet'), 10000, 'Chargement de Leaflet')).default;
      await withTimeout(import('leaflet/dist/leaflet.css'), 10000, 'Styles Leaflet');

      const geoRes = await withTimeout(
        fetch(`${base}/geo/countries-110m.json`, { cache: 'no-cache' }),
        10000,
        'Téléchargement des contours pays'
      );
      if (!geoRes.ok) {
        throw new Error(`Contours pays : HTTP ${geoRes.status}`);
      }
      const geo = (await geoRes.json()) as FeatureCollection;

      map = L.map(container, {
        center: [22, 20],
        zoom: 2.5,
        minZoom: 2,
        maxZoom: 8,
        // Zoom fractionnaire : les trackpads et les gestes de pincement
        // génèrent de nombreuses petites variations ; sans snap fractionnaire
        // chaque tick saute d'un niveau entier → feeling saccadé. Avec
        // zoomSnap 0.25 on passe par 2.5, 2.75, 3.0… en continu.
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        worldCopyJump: false,
        scrollWheelZoom: true,
        // 60 px par niveau = défaut Leaflet, équilibre bon entre réactivité
        // (trackpad) et contrôle (molette classique). 80 rendait le zoom
        // lent sur Mac.
        wheelPxPerZoomLevel: 60,
        wheelDebounceTime: 20,
        doubleClickZoom: true,
        touchZoom: true,
        bounceAtZoomLimits: false,
        keyboard: true,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: false, // SVG : gère mieux grands polygones / antiméridien
        maxBounds: [
          [-85, -180],
          [85, 180]
        ],
        maxBoundsViscosity: 1.0
      });

      L.control
        .attribution({ prefix: '', position: 'bottomright' })
        .addAttribution('Contours © Natural Earth · Données indicatives')
        .addTo(map);
      L.control.zoom({ position: 'topright' }).addTo(map);

      /* ── Fond neutre + re-stylisation des pays liée au thème ── */
      const applyBg = () => {
        if (!map) return;
        const dark = document.documentElement.getAttribute('data-theme') !== 'light';
        map.getContainer().style.background = dark ? '#0b0d12' : '#e6eaf0';
        countriesLayer?.setStyle((f) => countryStyleFor(f as CountryFeature, layers));
      };
      applyBg();
      themeObserver = new MutationObserver(applyBg);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });

      /* ── Couche pays ── */
      countriesLayer = L.geoJSON(geo, {
        style: (f) => countryStyleFor(f as CountryFeature, layers),
        onEachFeature: (f, layer) => {
          const feat = f as CountryFeature;
          const iso = String(feat.id ?? '').padStart(3, '0');
          const c = byIsoCanonical.get(iso);
          if (!c) return;
          const path = layer as L.Path;
          layer.on({
            mouseover: (e: L.LeafletMouseEvent) => {
              const isLight =
                typeof document !== 'undefined' &&
                document.documentElement.getAttribute('data-theme') === 'light';
              (e.target as L.Path).setStyle({
                weight: 1.6,
                color: isLight ? '#111827' : '#ffffff'
              });
              (e.target as L.Path).bringToFront();
            },
            mouseout: (e: L.LeafletMouseEvent) => {
              countriesLayer?.resetStyle(e.target as L.Path);
            },
            click: () => {
              onSelect?.(c);
              selected = c.name;
            },
            keypress: (e: L.LeafletKeyboardEvent) => {
              if (e.originalEvent.key === 'Enter' || e.originalEvent.key === ' ') {
                onSelect?.(c);
                selected = c.name;
              }
            }
          });
          path.bindTooltip(
            `<strong>${c.name}</strong><br>${c.muslimPct}% musulmans · ${c.region}`,
            { direction: 'top', sticky: true, className: 'map-tooltip' }
          );
        }
      }).addTo(map);

      /* ── Tensions : radar sonar (ondes concentriques) + cœur solide cliquable,
         regroupées par niveau pour le dévoilement progressif selon le zoom.

         Design :
          - Le cœur (circleMarker opaque) porte la couleur du niveau + bordure
            blanche → identité claire et cible cliquable nette.
          - Les ondes (divIcon, 1/2/3 anneaux selon le niveau) se propagent
            depuis le cœur en scale + fade avec un léger décalage d'animation
            pour un effet de ripple continu. mix-blend-mode: screen → les
            ondes qui se croisent (Syrie ∩ Irak, Sahel…) additionnent leur
            intensité lumineuse, révélant les zones de convergence.
          - Niveau 3 = urgent : 3 ondes rapides (1.9s). Niveau 1 = sourd :
            1 onde lente (3.2s). La fréquence encode l'intensité.

         Contraintes techniques :
          - Le radar est posé sur un pane dédié (tensionRadarPane) en dessous
            des hotspots mais au-dessus de l'overlayPane, avec pointer-events:
            none → les clics traversent jusqu'au cœur circleMarker en dessous.
          - L'animation CSS est sur des <span> INTERNES (pas sur la div
            .leaflet-marker-icon) pour ne pas écraser le transform: translate3d
            que Leaflet pose pour le positionnement. ── */
      if (!map.getPane('tensionRadarPane')) {
        map.createPane('tensionRadarPane');
        const p = map.getPane('tensionRadarPane');
        if (p) {
          p.style.zIndex = '450';
          p.style.pointerEvents = 'none';
        }
      }
      tensionLevels = { 1: L.layerGroup(), 2: L.layerGroup(), 3: L.layerGroup() };
      for (const c of byIsoCanonical.values()) {
        if (c.conflict > 0 && c.centroid) {
          const lvl = c.conflict as 1 | 2 | 3;
          const grp = tensionLevels[lvl];
          const col = conflictColor(lvl);

          // Radar sonar : N ondes concentriques qui se propagent
          const radarSize = 44 + lvl * 14;
          const duration = 3.2 - lvl * 0.4; // lvl3 → 2s, lvl2 → 2.4s, lvl1 → 2.8s
          const pings = Array.from(
            { length: lvl },
            (_, i) =>
              `<span class="tension-ping" style="animation-delay:${(i * duration) / lvl}s;animation-duration:${duration}s"></span>`
          ).join('');
          const radarIcon = L.divIcon({
            className: 'tension-radar-wrap',
            html: `<div class="tension-radar" style="--col:${col}">${pings}</div>`,
            iconSize: [radarSize, radarSize],
            iconAnchor: [radarSize / 2, radarSize / 2]
          });
          L.marker(c.centroid, {
            icon: radarIcon,
            pane: 'tensionRadarPane',
            interactive: false,
            keyboard: false
          }).addTo(grp);

          // Cœur solide cliquable : identité visuelle + surface d'interaction
          const core = L.circleMarker(c.centroid, {
            radius: 4 + lvl * 1.2,
            fillColor: col,
            fillOpacity: 0.95,
            color: '#ffffff',
            weight: 1.2,
            interactive: true,
            bubblingMouseEvents: false,
            className: 'tension-core'
          })
            .bindTooltip(
              `<strong>${escapeHtml(c.name)}</strong><br>Tension niveau ${lvl} · ${CONFLICT_LABELS[lvl]}`,
              { direction: 'top', className: 'map-tooltip' }
            )
            .bindPopup(buildTensionPopup(c, col), {
              className: 'map-popup-wrap',
              maxWidth: 320,
              minWidth: 260,
              autoPanPadding: [24, 24]
            });
          core.addTo(grp);
          wireOpenCountry(core);
        }
      }

      /* ── Hotspots terrorisme : triangle "⚠" en divIcon + halo circulaire.
         Pane dédiée avec z-index élevé pour toujours rester au-dessus des
         tensions. La pulsation est posée sur un <span> INTERNE : l'élément
         extérieur reste piloté par Leaflet (transform: translate3d) — c'est
         essentiel sinon l'animation CSS écrase la position et tous les
         triangles s'empilent en (0,0) du conteneur. ── */
      if (!map.getPane('hotspotPane')) {
        map.createPane('hotspotPane');
        const p = map.getPane('hotspotPane');
        if (p) {
          p.style.zIndex = '680';
          p.style.pointerEvents = 'auto';
        }
      }
      hotspotsLayer = L.layerGroup();
      for (const h of HOTSPOTS) {
        const intensity = Math.max(0.3, Math.min(1, h.intensity));
        const size = 24 + intensity * 10;
        L.circleMarker([h.lat, h.lng], {
          radius: 13 + intensity * 6,
          fillColor: '#ff5722',
          fillOpacity: 0.12,
          color: '#ff5722',
          opacity: 0.35,
          weight: 0.5,
          interactive: false,
          className: 'hotspot-halo'
        }).addTo(hotspotsLayer);
        const icon = L.divIcon({
          className: 'hotspot-warn',
          html: `<span class="hotspot-warn-inner"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" aria-hidden="true">
            <path d="M12 2.5 L22 20.5 L2 20.5 Z" fill="#ff5722" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
            <path d="M12 9 V14.5" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>
            <circle cx="12" cy="17.5" r="1.4" fill="#ffffff"/>
          </svg></span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });
        const marker = L.marker([h.lat, h.lng], {
          icon,
          pane: 'hotspotPane',
          interactive: true,
          keyboard: false,
          riseOnHover: true,
          zIndexOffset: 1000
        })
          .bindTooltip(
            `<strong>${escapeHtml(h.label)}</strong><br>${escapeHtml(h.zone)} · intensité ${Math.round(h.intensity * 100)}%`,
            { direction: 'top', className: 'map-tooltip' }
          )
          .bindPopup(buildHotspotPopup(h), {
            className: 'map-popup-wrap',
            maxWidth: 340,
            minWidth: 260,
            autoPanPadding: [24, 24]
          });
        marker.addTo(hotspotsLayer);
        wireOpenCountry(marker);
      }

      /* ── Labels pays (filtrage par zoom + priorité par population musulmane) ── */
      type Marker = L.Marker & { __country: Country };
      const allMarkers: Marker[] = [];
      const candidates = [...byName.values()]
        .filter((c) => c.centroid && c.muslimPct >= 30 && !c.skipIsoMap)
        .sort((a, b) => labelWeight(b) - labelWeight(a));

      for (const c of candidates) {
        const d = dominant(c);
        const marker = L.marker(c.centroid!, {
          icon: L.divIcon({
            className: 'country-label',
            html: `<span data-sect="${d}">${c.name}</span>`,
            iconSize: [120, 20],
            iconAnchor: [60, 10]
          }),
          interactive: false,
          keyboard: false
        }) as Marker;
        marker.__country = c;
        allMarkers.push(marker);
      }
      labelsLayer = L.layerGroup();

      function refreshLabels() {
        if (!map || !labelsLayer) return;
        labelsLayer.clearLayers();
        const z = map.getZoom();
        const cap = labelCapForZoom(z);
        for (let i = 0; i < Math.min(cap, allMarkers.length); i++) {
          labelsLayer.addLayer(allMarkers[i]);
        }
      }

      refreshLabels();
      map.on('zoomend', refreshLabels);
      map.on('zoomend', () => applyTensionVisibility(layers.tensions));

      applyLayers(layers);
      loading = false;
    } catch (e) {
      console.error(e);
      error = (e as Error).message;
      loading = false;
    }
  }

  /**
   * Style d'un pays selon les couches actives et le thème.
   *
   * - Si la couche thématique dominante du pays est activée (ou si le pays
   *   n'a pas de dominante musulmane) → fill coloré complet.
   * - Sinon → fond de carte "neutre" mais toujours visible : fill très
   *   discret + contour lisible. Le pays reste cliquable.
   *
   * Le contour et le fond neutre s'adaptent au thème clair / sombre.
   */
  function countryStyleFor(
    f: CountryFeature | undefined,
    l: Record<LayerKey, boolean>
  ): L.PathOptions {
    const c = byIsoCanonical.get(String(f?.id ?? '').padStart(3, '0'));
    const s = styleCountry(c);
    const d = s.dominant;
    const layerOn =
      d === 'none' ||
      (d === 'sunni' && l.sunni) ||
      (d === 'shia' && l.shia) ||
      (d === 'mixed' && l.mixed) ||
      (d === 'ibadi' && l.ibadi);

    const isLight =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'light';
    const strokeColor = isLight ? 'rgba(20, 28, 48, 0.45)' : 'rgba(255, 255, 255, 0.32)';

    if (layerOn) {
      return {
        fillColor: s.fillColor,
        fillOpacity: s.fillOpacity,
        color: strokeColor,
        weight: 0.6,
        opacity: 1
      };
    }
    return {
      fillColor: isLight ? '#1a2035' : '#ffffff',
      fillOpacity: isLight ? 0.05 : 0.04,
      color: strokeColor,
      weight: 0.65,
      opacity: 1
    };
  }

  function applyLayers(l: Record<LayerKey, boolean>) {
    if (!map) return;
    const m = map;
    countriesLayer?.setStyle((f) => countryStyleFor(f as CountryFeature, l));

    const swap = (layer: L.LayerGroup | null, on: boolean) => {
      if (!layer) return;
      if (on) layer.addTo(m);
      else m.removeLayer(layer);
    };
    applyTensionVisibility(l.tensions);
    swap(hotspotsLayer, l.hotspots);
    swap(labelsLayer, l.labels);
  }

  /**
   * Dévoile progressivement les tensions selon le zoom pour limiter la
   * saturation visuelle au niveau monde :
   *  - niveau 3 (conflit ouvert) : toujours visible
   *  - niveau 2 (tensions élevées) : visible dès zoom ≥ 3
   *  - niveau 1 (tensions modérées) : visible dès zoom ≥ 4
   */
  function applyTensionVisibility(on: boolean) {
    if (!map || !tensionLevels) return;
    const m = map;
    const z = m.getZoom();
    const show: Record<1 | 2 | 3, boolean> = {
      1: on && z >= 4,
      2: on && z >= 3,
      3: on
    };
    for (const lvl of [1, 2, 3] as const) {
      const grp = tensionLevels[lvl];
      const has = m.hasLayer(grp);
      if (show[lvl] && !has) grp.addTo(m);
      else if (!show[lvl] && has) m.removeLayer(grp);
    }
  }

  export function invalidateSize() {
    // Appelé après un redimensionnement du conteneur (sidebar toggle)
    requestAnimationFrame(() => map?.invalidateSize({ animate: false }));
  }

  /*
   * Effet réactif : on lit explicitement chaque clé de `layers` pour
   * s'assurer que Svelte enregistre toutes les dépendances (le proxy
   * `$state` ne notifie que les propriétés lues dans la frame courante).
   * Dès qu'une case est cochée/décochée, on réapplique le style de TOUTES
   * les features (fondu piloté par CSS transition sur les <path> Leaflet).
   */
  $effect(() => {
    void layers.sunni;
    void layers.shia;
    void layers.mixed;
    void layers.ibadi;
    void layers.tensions;
    void layers.hotspots;
    void layers.labels;
    if (map) applyLayers(layers);
  });

  export function flyTo(country: Country) {
    if (!map || !country.centroid) return;
    // Zoom cible adapté à la taille du pays : grands pays (Russie, Chine,
    // États-Unis) → vue large ; petits pays (Bahreïn, Liban) → plus proche.
    const nameLen = country.name.length;
    const target = nameLen > 14 ? 4 : nameLen > 8 ? 5 : 5.5;
    map.flyTo(country.centroid, target, { duration: 0.8 });
  }

  export function resetView() {
    map?.flyTo([22, 20], 2.5, { duration: 0.6 });
  }

  export function regionView(region: 'me' | 'af' | 'eu' | 'asia') {
    const views: Record<string, [number, number, number]> = {
      me: [29, 45, 4.25],
      af: [5, 20, 3.25],
      eu: [50, 15, 4],
      asia: [30, 100, 3.25]
    };
    const [lat, lng, zoom] = views[region];
    map?.flyTo([lat, lng], zoom, { duration: 0.6 });
  }

  /** Nettoie l'état client (service worker + caches) et recharge la page.
   *  C'est l'issue de secours quand le cache du navigateur sert des chunks
   *  périmés après un rebuild. */
  async function resetCacheAndReload() {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (e) {
      console.warn('Reset cache partial failure', e);
    } finally {
      window.location.reload();
    }
  }

  onMount(() => {
    loadMap();

    // Si le chargement s'éternise, on révèle la trappe de secours après 6 s.
    const stuckTimer = window.setTimeout(() => {
      if (loading) stuckHint = true;
    }, 6000);

    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === '+' || e.key === '=') map?.zoomIn();
      else if (e.key === '-' || e.key === '_') map?.zoomOut();
      else if (e.key === 'Home' || e.key === 'h') resetView();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(stuckTimer);
    };
  });

  onDestroy(() => {
    themeObserver?.disconnect();
    themeObserver = null;
    map?.remove();
    map = null;
  });
</script>

<div class="relative h-full w-full">
  <div bind:this={container} class="absolute inset-0" aria-label="Carte du monde interactive"></div>

  {#if loading}
    <div class="absolute inset-0 grid place-items-center bg-surface-1/80 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-3 text-muted">
        <div
          class="size-10 animate-spin rounded-full border-2 border-accent border-t-transparent"
          aria-hidden="true"
        ></div>
        <p class="text-sm">Chargement de la carte…</p>
        {#if stuckHint}
          <div class="mt-2 flex flex-col items-center gap-2 text-xs">
            <p class="max-w-xs text-center text-muted/80">
              Ça prend plus de temps que prévu — un cache obsolète bloque sans doute un ancien
              chunk.
            </p>
            <button
              type="button"
              onclick={resetCacheAndReload}
              class="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 font-medium text-accent transition-colors hover:bg-accent/20"
            >
              Réinitialiser le cache et recharger
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if error}
    <div class="absolute inset-4 grid place-items-center">
      <div class="max-w-md rounded-lg border border-danger/40 bg-danger/10 p-5 text-sm">
        <p class="font-medium text-ink">Carte indisponible</p>
        <p class="mt-2 text-muted">{error}</p>
        <button
          type="button"
          onclick={resetCacheAndReload}
          class="mt-4 rounded-md border border-danger/50 bg-danger/20 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-danger/30"
        >
          Réinitialiser le cache et recharger
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.leaflet-container) {
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    outline: none;
  }
  /* Supprime le bounding-box orange du navigateur sur les <path> SVG
     au clic (on ne garde un indicateur que pour la navigation clavier).
     Transition CSS : fondu propre lorsqu'on (dé)coche une couche. */
  :global(.leaflet-container svg path.leaflet-interactive) {
    outline: none;
    transition:
      fill-opacity 220ms ease-out,
      stroke-opacity 220ms ease-out,
      stroke-width 220ms ease-out;
  }
  :global(.leaflet-container svg path.leaflet-interactive:focus) {
    outline: none;
  }
  :global(.leaflet-container svg path.leaflet-interactive:focus-visible) {
    outline: none;
    stroke: #ffffff;
    stroke-width: 2;
  }
  /* Quand une couche est désactivée (fill-opacity = 0), le pays ne doit plus
     intercepter les événements : pas de hover fantôme, et le scroll/pan
     reste fluide au-dessus du continent. */
  :global(.leaflet-container svg path.leaflet-interactive[fill-opacity='0']) {
    pointer-events: none;
  }
  /* Le halo des hotspots est un <path> SVG décoratif : pas de pointer-events
     (le click/tooltip vit sur le triangle). Blend "screen" → deux halos qui
     se chevauchent s'additionnent en lumière au lieu de faire une bouillie. */
  :global(.leaflet-container svg .hotspot-halo) {
    pointer-events: none;
    mix-blend-mode: screen;
  }
  :global([data-theme='light'] .leaflet-container svg .hotspot-halo) {
    mix-blend-mode: multiply;
  }
  /* Cœur tension : rond cliquable, curseur main. */
  :global(.leaflet-container svg .tension-core) {
    cursor: pointer;
  }
  /* ── Radar sonar des tensions : ondes concentriques qui se propagent ──
     Le wrapper .leaflet-marker-icon reçoit le transform: translate3d(…) de
     Leaflet pour son positionnement — on n'y touche pas. Les ondes animées
     sont des <span> INTERNES avec leur propre transform scale. Les ondes
     elles-mêmes sont en mix-blend-mode: screen : quand deux tensions sont
     proches (ex. Syrie/Irak, Sahel), leurs ondes se croisent et forment des
     motifs d'interférence lumineux → la carte révèle visuellement les zones
     de convergence géopolitique. */
  :global(.leaflet-container .tension-radar-wrap) {
    background: transparent;
    border: none;
    pointer-events: none;
  }
  :global(.leaflet-container .tension-radar) {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  :global(.leaflet-container .tension-ping) {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1.5px solid var(--col);
    background: radial-gradient(circle at center, var(--col) 0%, transparent 70%);
    opacity: 0;
    transform: scale(0.3);
    transform-origin: center center;
    mix-blend-mode: screen;
    animation-name: tension-ping-anim;
    animation-timing-function: cubic-bezier(0, 0.55, 0.45, 1);
    animation-iteration-count: infinite;
    will-change: transform, opacity;
  }
  :global([data-theme='light'] .leaflet-container .tension-ping) {
    mix-blend-mode: multiply;
    background: radial-gradient(circle at center, var(--col) 0%, transparent 75%);
  }
  @keyframes tension-ping-anim {
    0% {
      transform: scale(0.3);
      opacity: 0.7;
    }
    70% {
      opacity: 0.08;
    }
    100% {
      transform: scale(3.6);
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.leaflet-container .tension-ping) {
      animation: none;
      opacity: 0.35;
      transform: scale(2);
    }
  }
  /* Hotspots : triangle d'avertissement en divIcon, avec pulse doux + glow.
     IMPORTANT : le <div class="hotspot-warn"> extérieur est positionné par
     Leaflet via transform: translate3d(…). Toute animation CSS posée dessus
     écraserait ce transform et empilerait tous les triangles en (0,0).
     On place donc la pulsation sur un <span.hotspot-warn-inner> INTERNE. */
  :global(.leaflet-container .hotspot-warn) {
    cursor: pointer;
    background: transparent;
    border: none;
  }
  :global(.leaflet-container .hotspot-warn .hotspot-warn-inner) {
    display: block;
    line-height: 0;
    filter: drop-shadow(0 0 6px rgba(255, 87, 34, 0.55));
    animation: hotspot-warn-pulse 2.4s ease-in-out infinite;
    transform-origin: center center;
    will-change: transform;
  }
  :global(.leaflet-container .hotspot-warn:hover .hotspot-warn-inner) {
    filter: drop-shadow(0 0 12px rgba(255, 87, 34, 0.95));
  }
  @keyframes hotspot-warn-pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.18);
    }
  }

  /* ── Popups info (tensions + hotspots) ── */
  :global(.leaflet-popup.map-popup-wrap .leaflet-popup-content-wrapper) {
    background: rgb(var(--surface-1));
    color: rgb(var(--ink));
    border: 1px solid rgb(var(--surface-3));
    border-radius: 12px;
    box-shadow: 0 14px 40px -16px rgb(0 0 0 / 0.55);
    padding: 0;
    overflow: hidden;
  }
  :global(.leaflet-popup.map-popup-wrap .leaflet-popup-content) {
    margin: 0;
    width: auto !important;
    line-height: 1.5;
  }
  :global(.leaflet-popup.map-popup-wrap .leaflet-popup-tip) {
    background: rgb(var(--surface-1));
    border: 1px solid rgb(var(--surface-3));
  }
  :global(.leaflet-popup.map-popup-wrap .leaflet-popup-close-button) {
    color: rgb(var(--muted));
    padding: 6px 8px;
    font-size: 18px;
  }
  :global(.leaflet-popup.map-popup-wrap .leaflet-popup-close-button:hover) {
    color: rgb(var(--ink));
  }
  :global(.map-popup) {
    font-family: inherit;
    font-size: 13px;
    color: rgb(var(--ink));
    min-width: 240px;
    max-width: 320px;
  }
  :global(.map-popup .map-popup-head) {
    padding: 12px 14px 10px;
    border-bottom: 1px solid rgb(var(--surface-3));
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--bar, #888) 20%, transparent),
      transparent 70%
    );
  }
  :global(.map-popup .map-popup-kicker) {
    display: block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(var(--muted));
    margin-bottom: 2px;
  }
  :global(.map-popup .map-popup-title) {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: rgb(var(--ink));
    margin-bottom: 6px;
    line-height: 1.3;
  }
  :global(.map-popup .map-popup-tag) {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
  }
  :global(.map-popup .map-popup-sub) {
    margin: 0;
    padding: 8px 14px 0;
    font-size: 11px;
    color: rgb(var(--muted));
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 600;
  }
  :global(.map-popup .map-popup-body) {
    margin: 0;
    padding: 8px 14px;
    font-size: 12.5px;
    color: rgb(var(--ink));
  }
  :global(.map-popup .map-popup-body.map-popup-muted) {
    color: rgb(var(--muted));
    font-style: italic;
  }
  :global(.map-popup .map-popup-body + .map-popup-body) {
    padding-top: 0;
  }
  :global(.map-popup .map-popup-btn) {
    display: block;
    width: calc(100% - 20px);
    margin: 6px 10px 10px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgb(var(--accent));
    background: rgb(var(--accent) / 0.12);
    color: rgb(var(--accent));
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 150ms ease;
    text-align: center;
  }
  :global(.map-popup .map-popup-btn:hover:not(:disabled)) {
    background: rgb(var(--accent) / 0.22);
  }
  :global(.map-popup .map-popup-btn:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :global(.leaflet-tooltip.map-tooltip) {
    background: rgb(var(--surface-1));
    color: rgb(var(--ink));
    border: 1px solid rgb(var(--surface-3));
    border-radius: 8px;
    padding: 6px 10px;
    box-shadow: 0 6px 24px -12px rgb(0 0 0 / 0.4);
    font-size: 12px;
  }
  :global(.leaflet-tooltip.map-tooltip::before) {
    border-top-color: rgb(var(--surface-3));
  }
  :global(.country-label) {
    background: transparent;
    border: 0;
    text-align: center;
    pointer-events: none;
  }
  :global(.country-label span) {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    color: rgb(var(--ink));
    text-shadow:
      0 1px 2px rgb(0 0 0 / 0.75),
      0 0 4px rgb(0 0 0 / 0.5),
      0 0 2px rgb(0 0 0 / 0.9);
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  :global([data-theme='light'] .country-label span) {
    color: #0b1220;
    text-shadow:
      0 1px 2px rgb(255 255 255 / 0.95),
      0 0 2px rgb(255 255 255 / 0.85);
  }
  :global(.leaflet-control-zoom a) {
    background: rgb(var(--surface-1)) !important;
    color: rgb(var(--ink)) !important;
    border-color: rgb(var(--surface-3)) !important;
  }
  :global(.leaflet-control-attribution) {
    background: rgb(var(--surface-1) / 0.8) !important;
    color: rgb(var(--muted)) !important;
    font-size: 10px !important;
  }
</style>
