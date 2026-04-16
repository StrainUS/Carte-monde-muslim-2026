<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';
  import type { LayerKey } from './layers.svelte.ts';
  import { byIsoCanonical, byName, hotspots as HOTSPOTS, type Country } from '$data';
  import { styleCountry, dominant } from './colors.ts';

  interface Props {
    layers: Record<LayerKey, boolean>;
    selected?: string | null;
    onSelect?: (country: Country) => void;
  }

  let { layers, selected = $bindable(null), onSelect }: Props = $props();

  let container: HTMLDivElement;
  let map: any = null;
  let countriesLayer: any = null;
  let hotspotsLayer: any = null;
  let labelsLayer: any = null;
  let conflictLayer: any = null;
  let loading = $state(true);
  let error = $state<string | null>(null);

  /** Tensions intensity → color */
  function conflictColor(level: 0 | 1 | 2 | 3): string {
    return ['transparent', '#f9a825', '#e65100', '#c62828'][level];
  }

  async function loadMap() {
    try {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      const geo: any = await fetch(`${base}/geo/countries-110m.json`).then((r) => r.json());

      map = L.map(container, {
        center: [22, 20],
        zoom: 2,
        minZoom: 2,
        maxZoom: 7,
        worldCopyJump: true,
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true
      });

      L.control
        .attribution({ prefix: '', position: 'bottomright' })
        .addAttribution('Contours © Natural Earth · Données indicatives')
        .addTo(map);
      L.control.zoom({ position: 'topright' }).addTo(map);

      /* ── Fond neutre ── */
      const dark = document.documentElement.getAttribute('data-theme') !== 'light';
      map.getContainer().style.background = dark ? '#0b0d12' : '#e6eaf0';

      /* ── Couche pays ── */
      countriesLayer = L.geoJSON(geo, {
        style: (f: any) => {
          const c = byIsoCanonical.get(String(f.id).padStart(3, '0'));
          const s = styleCountry(c);
          const d = s.dominant;
          const visible =
            d === 'none' ||
            (d === 'sunni' && layers.sunni) ||
            (d === 'shia' && layers.shia) ||
            (d === 'mixed' && layers.mixed) ||
            (d === 'ibadi' && layers.ibadi);
          return {
            ...s,
            fillOpacity: visible ? s.fillOpacity : 0.05
          };
        },
        onEachFeature: (f: any, layer: any) => {
          const iso = String(f.id).padStart(3, '0');
          const c = byIsoCanonical.get(iso);
          if (!c) return;
          layer.on({
            mouseover: (e: any) => {
              e.target.setStyle({ weight: 1.5, color: '#ffffff' });
              e.target.bringToFront();
            },
            mouseout: (e: any) => {
              countriesLayer?.resetStyle(e.target);
            },
            click: () => {
              if (onSelect) onSelect(c);
              selected = c.name;
            },
            keypress: (e: any) => {
              if (e.originalEvent.key === 'Enter' || e.originalEvent.key === ' ') {
                if (onSelect) onSelect(c);
                selected = c.name;
              }
            }
          });
          layer.bindTooltip(
            `<strong>${c.name}</strong><br>${c.muslimPct}% musulmans · ${c.region}`,
            { direction: 'top', sticky: true, className: 'map-tooltip' }
          );
        }
      }).addTo(map);

      /* ── Cercles tensions ── */
      conflictLayer = L.layerGroup();
      for (const c of byIsoCanonical.values()) {
        if (c.conflict > 0 && c.centroid) {
          L.circle(c.centroid, {
            radius: 80_000 + c.conflict * 140_000,
            color: conflictColor(c.conflict),
            weight: 1,
            fillColor: conflictColor(c.conflict),
            fillOpacity: 0.35,
            interactive: false
          }).addTo(conflictLayer);
        }
      }

      /* ── Hotspots terrorisme ── */
      hotspotsLayer = L.layerGroup();
      for (const h of HOTSPOTS) {
        L.circle([h.lat, h.lng], {
          radius: h.radiusKm * 1000,
          color: '#ff5722',
          weight: 1.5,
          fillColor: '#ff5722',
          fillOpacity: 0.18 + h.intensity * 0.2,
          interactive: true
        })
          .bindTooltip(`<strong>${h.label}</strong><br>Zone indicative`, {
            direction: 'top',
            className: 'map-tooltip'
          })
          .addTo(hotspotsLayer);
      }

      /* ── Labels pays (majorités musulmanes ≥ 30 %) ── */
      labelsLayer = L.layerGroup();
      for (const c of byName.values()) {
        if (!c.centroid || c.muslimPct < 30 || c.skipIsoMap) continue;
        const d = dominant(c);
        const marker = L.marker(c.centroid, {
          icon: L.divIcon({
            className: 'country-label',
            html: `<span data-sect="${d}">${c.name}</span>`,
            iconSize: [120, 20],
            iconAnchor: [60, 10]
          }),
          interactive: false,
          keyboard: false
        });
        labelsLayer.addLayer(marker);
      }

      applyLayers(layers);
      loading = false;
    } catch (e) {
      console.error(e);
      error = (e as Error).message;
      loading = false;
    }
  }

  function applyLayers(l: Record<LayerKey, boolean>) {
    if (!map) return;
    countriesLayer?.setStyle((f: any) => {
      const c = byIsoCanonical.get(String(f.id).padStart(3, '0'));
      const s = styleCountry(c);
      const d = s.dominant;
      const visible =
        d === 'none' ||
        (d === 'sunni' && l.sunni) ||
        (d === 'shia' && l.shia) ||
        (d === 'mixed' && l.mixed) ||
        (d === 'ibadi' && l.ibadi);
      return {
        ...s,
        fillOpacity: visible ? s.fillOpacity : 0.05
      };
    });

    const swap = (layer: any, on: boolean) => {
      if (!layer) return;
      if (on) layer.addTo(map);
      else map.removeLayer(layer);
    };
    swap(conflictLayer, l.tensions);
    swap(hotspotsLayer, l.hotspots);
    swap(labelsLayer, l.labels);
  }

  $effect(() => {
    if (map) applyLayers(layers);
  });

  export function flyTo(country: Country) {
    if (!map || !country.centroid) return;
    map.flyTo(country.centroid, country.name.length > 12 ? 4 : 5, { duration: 0.8 });
  }

  export function resetView() {
    map?.flyTo([22, 20], 2, { duration: 0.6 });
  }

  export function regionView(region: 'me' | 'af' | 'eu' | 'asia') {
    const views: Record<string, [number, number, number]> = {
      me: [29, 45, 4],
      af: [5, 20, 3],
      eu: [50, 15, 4],
      asia: [30, 100, 3]
    };
    const [lat, lng, zoom] = views[region];
    map?.flyTo([lat, lng], zoom, { duration: 0.6 });
  }

  onMount(() => {
    loadMap();

    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === '+' || e.key === '=') map?.zoomIn();
      else if (e.key === '-' || e.key === '_') map?.zoomOut();
      else if (e.key === 'Home' || e.key === 'h') resetView();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  onDestroy(() => {
    map?.remove();
    map = null;
  });
</script>

<div class="relative h-full w-full">
  <div bind:this={container} class="absolute inset-0" aria-label="Carte du monde interactive"></div>

  {#if loading}
    <div class="absolute inset-0 grid place-items-center bg-surface-1/80 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-3 text-muted">
        <div class="size-10 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden="true"></div>
        <p class="text-sm">Chargement de la carte…</p>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="absolute inset-4 grid place-items-center">
      <div class="max-w-md rounded-lg border border-danger/40 bg-danger/10 p-5 text-sm">
        <p class="font-medium text-ink">Carte indisponible</p>
        <p class="mt-2 text-muted">{error}</p>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.leaflet-container) {
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    outline: none;
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
      0 1px 2px rgb(0 0 0 / 0.7),
      0 0 4px rgb(0 0 0 / 0.4);
    letter-spacing: 0.01em;
  }
  :global([data-theme='light'] .country-label span) {
    color: #0b1220;
    text-shadow: 0 1px 2px rgb(255 255 255 / 0.9);
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
