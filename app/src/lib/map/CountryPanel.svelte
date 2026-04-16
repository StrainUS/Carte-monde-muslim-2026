<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { base } from '$app/paths';
  import type { Country, Source } from '$data';
  import { getSecurityFor, sourceById } from '$data';
  import { dominant, SECT_LABEL, type DominantSect } from './colors.ts';

  interface Props {
    country: Country | null;
    onClose: () => void;
  }
  let { country, onClose }: Props = $props();

  const security = $derived(country ? getSecurityFor(country.name) : undefined);
  const sect = $derived<DominantSect>(country ? dominant(country) : 'none');
  const absMuslims = $derived(
    country
      ? ((country.population * country.muslimPct) / 100).toFixed(country.muslimPct < 5 ? 2 : 1)
      : '0'
  );
  const citedSources = $derived<Source[]>(
    country?.sources
      ? country.sources.map((id) => sourceById.get(id)).filter((s): s is Source => !!s)
      : []
  );

  // Hero gradient & accents driven by dominant sect.
  const accents: Record<DominantSect, { from: string; to: string; ring: string; label: string }> = {
    sunni: { from: '#0f5a1f', to: '#1e8a30', ring: '#5dd271', label: 'Sunnite' },
    shia: { from: '#0b3d8a', to: '#2468d6', ring: '#6aa3ff', label: 'Chiite' },
    mixed: { from: '#4a1478', to: '#7a2fb0', ring: '#c18af5', label: 'Mixte' },
    ibadi: { from: '#6a1b9a', to: '#a43dbb', ring: '#e6a1f5', label: 'Ibadi' },
    none: { from: '#2a2f3a', to: '#3a4050', ring: '#8a91a3', label: '—' }
  };
  const accent = $derived(accents[sect]);

  const tensionLabel: Record<0 | 1 | 2 | 3, { label: string; color: string }> = {
    0: { label: 'Faibles', color: '#3a4050' },
    1: { label: 'Modérées', color: '#f9a825' },
    2: { label: 'Élevées', color: '#e65100' },
    3: { label: 'Critiques', color: '#c62828' }
  };

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={onKey} />

{#if country}
  <!-- Backdrop mobile uniquement : ferme au clic, occulte la carte.
       Sur desktop, on laisse la carte interactive derrière le panneau. -->
  <button
    type="button"
    class="absolute inset-0 z-[990] cursor-default bg-black/40 backdrop-blur-[1px] md:hidden"
    aria-label="Fermer la fiche pays"
    onclick={onClose}
    transition:fade={{ duration: 150 }}
  ></button>

  <div
    class="absolute inset-y-0 right-0 z-[1000] flex w-full flex-col border-l border-surface-3 bg-surface-1 shadow-2xl md:max-w-[440px]"
    aria-label="Fiche pays détaillée"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    transition:fly={{ x: 400, duration: 260, easing: cubicOut }}
  >
    <!-- Hero header (accent couleur dominante) -->
    <header
      class="relative overflow-hidden border-b border-surface-3 px-5 pt-5 pb-6 text-white"
      style:background="linear-gradient(135deg, {accent.from} 0%, {accent.to} 100%)"
    >
      <div
        class="absolute inset-0 opacity-20"
        aria-hidden="true"
        style:background="radial-gradient(ellipse at top right, {accent.ring} 0%, transparent 60%)"
      ></div>

      <div class="relative flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70">
            {country.region}
          </p>
          <h2 class="h-display mt-1 text-3xl leading-tight drop-shadow-sm">{country.name}</h2>
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
            >
              <span class="size-1.5 rounded-full" style:background={accent.ring} aria-hidden="true"
              ></span>
              {SECT_LABEL[sect]}
            </span>
            {#if country.conflict > 0}
              <span
                class="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
              >
                <span
                  class="size-1.5 rounded-full"
                  style:background={tensionLabel[country.conflict].color}
                  aria-hidden="true"
                ></span>
                Tensions {tensionLabel[country.conflict].label.toLowerCase()}
              </span>
            {/if}
          </div>
        </div>

        <button
          type="button"
          class="shrink-0 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label="Fermer la fiche pays"
          onclick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Hero chiffre : volume absolu de musulmans -->
      <div class="relative mt-5 flex items-end justify-between gap-4">
        <div>
          <p
            class="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/70"
          >
            Population musulmane estimée
            {#if country.asOf}
              <span
                class="inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/85"
                title="Millésime de référence de l'estimation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                maj {country.asOf}
              </span>
            {/if}
          </p>
          <p class="h-display mt-0.5 text-4xl leading-none drop-shadow">
            ~{absMuslims} <span class="text-xl font-medium opacity-80">M</span>
          </p>
          <p class="mt-1 text-xs text-white/80">
            sur {country.population.toLocaleString('fr-FR')} M d'habitants · {country.muslimPct}%
          </p>
        </div>
      </div>
    </header>

    <div class="flex-1 space-y-6 overflow-y-auto p-5">
      <!-- Répartition confessionnelle -->
      <section>
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Répartition au sein des musulmans
        </h3>
        <div class="flex h-3 overflow-hidden rounded-full bg-surface-3 ring-1 ring-surface-3">
          {#if country.sunniPct > 0}
            <span
              class="bg-sunni-soft transition-all"
              style:width="{country.sunniPct}%"
              title="Sunnites : {country.sunniPct}%"
            ></span>
          {/if}
          {#if country.shiaPct > 0}
            <span
              class="bg-shia-soft transition-all"
              style:width="{country.shiaPct}%"
              title="Chiites : {country.shiaPct}%"
            ></span>
          {/if}
          {#if country.ibadiPct > 0}
            <span
              class="bg-ibadi transition-all"
              style:width="{country.ibadiPct}%"
              title="Ibadi : {country.ibadiPct}%"
            ></span>
          {/if}
        </div>
        <ul class="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <li class="flex items-center gap-1.5">
            <span class="size-2 rounded-sm bg-sunni-soft" aria-hidden="true"></span>
            Sunnites <strong class="text-ink">{country.sunniPct}%</strong>
          </li>
          <li class="flex items-center gap-1.5">
            <span class="size-2 rounded-sm bg-shia-soft" aria-hidden="true"></span>
            Chiites <strong class="text-ink">{country.shiaPct}%</strong>
          </li>
          {#if country.ibadiPct > 0}
            <li class="flex items-center gap-1.5">
              <span class="size-2 rounded-sm bg-ibadi" aria-hidden="true"></span>
              Ibadi <strong class="text-ink">{country.ibadiPct}%</strong>
            </li>
          {/if}
        </ul>
      </section>

      <!-- Stats complémentaires -->
      <section>
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Indicateurs</h3>
        <dl class="grid grid-cols-2 gap-2">
          <div class="rounded-lg border border-surface-3 bg-surface-2/50 p-3">
            <dt class="text-[11px] uppercase tracking-wider text-muted">Population</dt>
            <dd class="h-display mt-1 text-xl leading-none">
              {country.population} <span class="text-sm font-medium text-muted">M</span>
            </dd>
          </div>
          <div class="rounded-lg border border-surface-3 bg-surface-2/50 p-3">
            <dt class="text-[11px] uppercase tracking-wider text-muted">Musulmans</dt>
            <dd class="h-display mt-1 text-xl leading-none">
              {country.muslimPct}<span class="text-sm font-medium text-muted">%</span>
            </dd>
          </div>
          <div class="rounded-lg border border-surface-3 bg-surface-2/50 p-3">
            <dt class="text-[11px] uppercase tracking-wider text-muted">Dominance</dt>
            <dd class="mt-1 text-sm font-medium">{SECT_LABEL[sect]}</dd>
          </div>
          <div class="rounded-lg border border-surface-3 bg-surface-2/50 p-3">
            <dt class="text-[11px] uppercase tracking-wider text-muted">Tensions</dt>
            <dd class="mt-1 flex items-center gap-2 text-sm font-medium">
              <span
                class="size-2 rounded-full"
                style:background={tensionLabel[country.conflict].color}
                aria-hidden="true"
              ></span>
              {tensionLabel[country.conflict].label}
              {#if country.conflict > 0}<span class="text-muted">({country.conflict}/3)</span>{/if}
            </dd>
          </div>
        </dl>
      </section>

      <!-- Contexte -->
      <section>
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Contexte</h3>
        <p class="text-sm leading-relaxed text-ink/90">{country.notes}</p>
      </section>

      <!-- Sécurité -->
      {#if security}
        <section class="rounded-lg border border-warn/30 bg-warn/[0.06] p-4">
          <h3
            class="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2 4 6v6c0 5 3.5 9.2 8 10 4.5-.8 8-5 8-10V6z" />
            </svg>
            Veille sécurité &amp; prévention
          </h3>
          <dl class="space-y-3 text-sm">
            {#if security.conflit}
              <div>
                <dt class="font-medium text-ink">Conflit</dt>
                <dd class="mt-0.5 leading-relaxed text-muted">{security.conflit}</dd>
              </div>
            {/if}
            {#if security.terrorisme}
              <div>
                <dt class="font-medium text-ink">Terrorisme</dt>
                <dd class="mt-0.5 leading-relaxed text-muted">{security.terrorisme}</dd>
              </div>
            {/if}
            {#if security.france}
              <div>
                <dt class="font-medium text-ink">France</dt>
                <dd class="mt-0.5 leading-relaxed text-muted">{security.france}</dd>
              </div>
            {/if}
            {#if security.ue}
              <div>
                <dt class="font-medium text-ink">Union européenne</dt>
                <dd class="mt-0.5 leading-relaxed text-muted">{security.ue}</dd>
              </div>
            {/if}
          </dl>
          <p class="mt-3 text-[11px] leading-relaxed text-muted">
            Synthèse indicative, à croiser avec les sources primaires (SGDSN, Europol, ministère de
            l'Intérieur).
          </p>
        </section>
      {/if}

      <!-- Sources officielles citées pour ce pays -->
      {#if citedSources.length > 0}
        <section class="rounded-lg border border-surface-3 bg-surface-2/40 p-4">
          <h3
            class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Sources citées
            {#if country.asOf}
              <span class="ml-auto text-[10px] font-normal normal-case tracking-normal">
                millésime {country.asOf}
              </span>
            {/if}
          </h3>
          <ul class="flex flex-wrap gap-1.5">
            {#each citedSources as s (s.id)}
              <li>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 rounded-md border border-surface-3 bg-surface-1 px-2.5 py-1 text-xs text-ink/90 transition hover:border-accent/50 hover:bg-surface-2"
                  title={s.note ?? s.label}
                >
                  {s.label}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </a>
              </li>
            {/each}
          </ul>
          <p class="mt-3 text-[11px] leading-relaxed text-muted">
            Estimation démographique : aucun organisme officiel ne certifie une valeur unique. Les
            chiffres présentés sont l'intersection des sources ci-dessus (ordres de grandeur).
          </p>
        </section>
      {:else}
        <section class="rounded-lg border border-surface-3 bg-surface-2/30 p-4">
          <p class="text-[11px] leading-relaxed text-muted">
            <strong class="text-ink">Données en cours d'attribution.</strong> Ce pays n'a pas encore
            de sources officielles liées individuellement — l'ordre de grandeur est tiré des
            synthèses globales (Pew Research, CIA Factbook, ONU WPP). À consulter sur la page
            <a href="{base}/sources" class="text-accent underline underline-offset-2"
              >Sources &amp; méthode</a
            >.
          </p>
        </section>
      {/if}
    </div>

    <footer
      class="shrink-0 border-t border-surface-3 bg-surface-2/50 px-5 py-3 text-[11px] leading-relaxed text-muted"
    >
      Données indicatives · Sources : Pew, ONU WPP, CIA Factbook, BAMF, Europol, ministère de
      l'Intérieur.
    </footer>
  </div>
{/if}
