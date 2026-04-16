<script lang="ts">
  import { browser } from '$app/environment';
  import MapCanvas from '$map/MapCanvas.svelte';
  import LayerToggles from '$map/LayerToggles.svelte';
  import Legend from '$map/Legend.svelte';
  import SearchBox from '$map/SearchBox.svelte';
  import CountryPanel from '$map/CountryPanel.svelte';
  import { createLayerState } from '$map/layers.svelte.ts';
  import type { Country } from '$data';

  interface MapRef {
    flyTo(c: Country): void;
    resetView(): void;
    regionView(r: 'me' | 'af' | 'eu' | 'asia'): void;
  }

  const layers = createLayerState();
  let selected = $state<Country | null>(null);
  let panelOpen = $state(false);
  let mapRef = $state<MapRef | null>(null);
  let mobileControlsOpen = $state(false);

  function onSelect(c: Country) {
    selected = c;
    panelOpen = true;
    mapRef?.flyTo(c);
  }

  function closePanel() {
    panelOpen = false;
    selected = null;
  }

  function onRegion(r: 'me' | 'af' | 'eu' | 'asia' | 'world') {
    if (r === 'world') mapRef?.resetView();
    else mapRef?.regionView(r);
  }
</script>

<svelte:head>
  <title>Carte interactive — Islam mondial 2026</title>
  <meta name="description" content="Carte Leaflet des pays par dominance confessionnelle (sunnite, chiite, ibadi), tensions et hotspots terrorisme. 132 pays, fiches détaillées." />
</svelte:head>

<div class="relative grid h-[calc(100dvh-4rem)] grid-cols-1 md:grid-cols-[280px_1fr]">
  <!-- Panneau latéral desktop -->
  <aside
    class="hidden md:flex md:flex-col md:border-r md:border-surface-3 md:bg-surface-1"
    aria-label="Contrôles de la carte"
  >
    <div class="p-4 space-y-5 overflow-y-auto">
      <SearchBox onPick={onSelect} />
      <LayerToggles layers={layers.value} onToggle={(k) => layers.toggle(k)} />
      <Legend />
      <section>
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Vue</h3>
        <div class="grid grid-cols-3 gap-1.5">
          {#each [
            { k: 'world', l: 'Monde' },
            { k: 'me', l: 'M.-Orient' },
            { k: 'af', l: 'Afrique' },
            { k: 'eu', l: 'Europe' },
            { k: 'asia', l: 'Asie' }
          ] as v (v.k)}
            <button
              type="button"
              class="rounded border border-surface-3 bg-surface-2 px-2 py-1.5 text-xs hover:bg-surface-3"
              onclick={() => onRegion(v.k as any)}
            >
              {v.l}
            </button>
          {/each}
        </div>
      </section>
      <p class="text-xs text-muted">
        <kbd class="rounded bg-surface-2 px-1">+</kbd>
        /
        <kbd class="rounded bg-surface-2 px-1">−</kbd>
        zoom ·
        <kbd class="rounded bg-surface-2 px-1">Home</kbd>
        vue mondiale · clic ou
        <kbd class="rounded bg-surface-2 px-1">Entrée</kbd>
        sur un pays pour la fiche.
      </p>
    </div>
  </aside>

  <!-- Carte -->
  <div class="relative h-full">
    {#if browser}
      <MapCanvas
        bind:this={mapRef}
        layers={layers.value}
        onSelect={onSelect}
      />
    {:else}
      <div class="absolute inset-0 grid place-items-center text-sm text-muted">
        Chargement de la carte…
      </div>
    {/if}

    <!-- Barre mobile flottante -->
    <div class="absolute left-3 right-3 top-3 z-20 md:hidden">
      <div class="flex gap-2">
        <div class="flex-1">
          <SearchBox onPick={onSelect} />
        </div>
        <button
          type="button"
          class="rounded-md border border-surface-3 bg-surface-1 px-3 text-sm"
          aria-expanded={mobileControlsOpen}
          aria-controls="mobile-controls"
          onclick={() => (mobileControlsOpen = !mobileControlsOpen)}
        >
          {mobileControlsOpen ? '✕' : '☰'}
        </button>
      </div>
      {#if mobileControlsOpen}
        <div
          id="mobile-controls"
          class="mt-2 max-h-[60dvh] overflow-y-auto rounded-lg border border-surface-3 bg-surface-1 p-4 shadow-soft"
        >
          <LayerToggles layers={layers.value} onToggle={(k) => layers.toggle(k)} />
          <div class="mt-4">
            <Legend />
          </div>
        </div>
      {/if}
    </div>
  </div>

  {#if panelOpen}
    <CountryPanel country={selected} onClose={closePanel} />
  {/if}
</div>
