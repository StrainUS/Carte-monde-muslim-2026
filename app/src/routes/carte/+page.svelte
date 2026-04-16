<script lang="ts">
  import { browser } from '$app/environment';
  import MapCanvas from '$map/MapCanvas.svelte';
  import LayerToggles from '$map/LayerToggles.svelte';
  import Legend from '$map/Legend.svelte';
  import SearchBox from '$map/SearchBox.svelte';
  import CountryPanel from '$map/CountryPanel.svelte';
  import { LAYER_DEFAULTS, type LayerKey } from '$map/layers.svelte.ts';
  import type { Country } from '$data';

  interface MapRef {
    flyTo(c: Country): void;
    resetView(): void;
    regionView(r: 'me' | 'af' | 'eu' | 'asia'): void;
    invalidateSize(): void;
  }

  // $state proxy partagé avec MapCanvas et LayerToggles : toute mutation d'une
  // clé (layers[k] = !layers[k]) déclenche immédiatement les effets des enfants
  // qui lisent cette même propriété.
  const layers = $state<Record<LayerKey, boolean>>({ ...LAYER_DEFAULTS });
  function toggleLayer(k: LayerKey) {
    layers[k] = !layers[k];
  }
  let selected = $state<Country | null>(null);
  let panelOpen = $state(false);
  let mapRef = $state<MapRef | null>(null);
  let mobileControlsOpen = $state(false);
  let sidebarOpen = $state(true);

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

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  // À la fin de la transition de la grille, on demande à Leaflet de recalculer
  function onGridTransitionEnd(e: TransitionEvent) {
    if (e.propertyName === 'grid-template-columns') mapRef?.invalidateSize();
  }
</script>

<svelte:head>
  <title>Carte interactive — Islam mondial 2026</title>
  <meta
    name="description"
    content="Carte Leaflet des pays par dominance confessionnelle (sunnite, chiite, ibadi), tensions et hotspots terrorisme. 132 pays, fiches détaillées."
  />
</svelte:head>

<div
  class="relative grid h-full min-h-0 grid-cols-1 transition-[grid-template-columns] duration-300 ease-out md:grid-cols-[var(--cols)]"
  style:--cols={sidebarOpen ? '280px 1fr' : '0px 1fr'}
  ontransitionend={onGridTransitionEnd}
>
  <!-- Panneau latéral desktop -->
  <aside
    class="relative hidden min-h-0 overflow-hidden border-r border-surface-3 bg-surface-1 md:flex md:flex-col"
    aria-label="Contrôles de la carte"
    aria-hidden={!sidebarOpen}
  >
    <div
      class="flex-1 space-y-5 overflow-y-auto p-4 transition-opacity duration-200"
      class:opacity-0={!sidebarOpen}
      class:pointer-events-none={!sidebarOpen}
      inert={!sidebarOpen || undefined}
    >
      <SearchBox onPick={onSelect} />
      <LayerToggles {layers} onToggle={toggleLayer} />
      <Legend />
      <section>
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Vue</h3>
        <div class="grid grid-cols-3 gap-1.5">
          {#each [{ k: 'world' as const, l: 'Monde' }, { k: 'me' as const, l: 'M.-Orient' }, { k: 'af' as const, l: 'Afrique' }, { k: 'eu' as const, l: 'Europe' }, { k: 'asia' as const, l: 'Asie' }] as v (v.k)}
            <button
              type="button"
              class="rounded border border-surface-3 bg-surface-2 px-2 py-1.5 text-xs hover:bg-surface-3"
              onclick={() => onRegion(v.k)}
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
  <div class="relative h-full min-h-0">
    {#if browser}
      <MapCanvas bind:this={mapRef} {layers} {onSelect} />
    {:else}
      <div class="absolute inset-0 grid place-items-center text-sm text-muted">
        Chargement de la carte…
      </div>
    {/if}

    <!-- Bouton repli sidebar (desktop uniquement) -->
    <button
      type="button"
      class="absolute left-0 top-1/2 z-[800] hidden -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-surface-3 bg-surface-1 py-3 pl-1.5 pr-2 text-muted shadow-soft transition hover:bg-surface-2 hover:text-ink md:flex"
      aria-label={sidebarOpen
        ? 'Masquer le panneau de contrôles'
        : 'Afficher le panneau de contrôles'}
      aria-expanded={sidebarOpen}
      onclick={toggleSidebar}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        class="transition-transform duration-300"
        class:rotate-180={!sidebarOpen}
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>

    <!-- Barre mobile flottante -->
    <div class="absolute left-3 right-3 top-3 z-[900] md:hidden">
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
          class="mt-2 max-h-[60dvh] space-y-4 overflow-y-auto rounded-lg border border-surface-3 bg-surface-1 p-4 shadow-soft"
        >
          <LayerToggles {layers} onToggle={toggleLayer} />
          <Legend />
          <section>
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Vue</h3>
            <div class="grid grid-cols-3 gap-1.5">
              {#each [{ k: 'world' as const, l: 'Monde' }, { k: 'me' as const, l: 'M.-Orient' }, { k: 'af' as const, l: 'Afrique' }, { k: 'eu' as const, l: 'Europe' }, { k: 'asia' as const, l: 'Asie' }] as v (v.k)}
                <button
                  type="button"
                  class="rounded border border-surface-3 bg-surface-2 px-2 py-1.5 text-xs hover:bg-surface-3"
                  onclick={() => {
                    onRegion(v.k);
                    mobileControlsOpen = false;
                  }}
                >
                  {v.l}
                </button>
              {/each}
            </div>
          </section>
        </div>
      {/if}
    </div>
  </div>

  {#if panelOpen}
    <CountryPanel country={selected} onClose={closePanel} />
  {/if}
</div>
