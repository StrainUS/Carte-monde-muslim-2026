<script lang="ts">
  import type { Country } from '$data';
  import { getSecurityFor, sourceById } from '$data';
  import { dominant, SECT_LABEL } from './colors.ts';

  interface Props {
    country: Country | null;
    onClose: () => void;
  }
  let { country, onClose }: Props = $props();

  const security = $derived(country ? getSecurityFor(country.name) : undefined);
  const absMuslims = $derived(
    country ? ((country.population * country.muslimPct) / 100).toFixed(country.muslimPct < 5 ? 2 : 1) : '0'
  );
  const sect = $derived(country ? dominant(country) : 'none');
</script>

{#if country}
  <aside
    class="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-surface-3 bg-surface-1 shadow-2xl"
    aria-label="Fiche pays"
  >
    <header class="flex items-start justify-between gap-3 border-b border-surface-3 p-5">
      <div class="min-w-0">
        <p class="text-xs font-medium uppercase tracking-wider text-muted">
          {country.region}
        </p>
        <h2 class="h-display mt-1 text-2xl leading-tight">{country.name}</h2>
        <p class="mt-1 text-xs text-muted">
          Branche dominante : <strong class="text-ink">{SECT_LABEL[sect]}</strong>
        </p>
      </div>
      <button
        type="button"
        class="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-ink"
        aria-label="Fermer la fiche pays"
        onclick={onClose}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </header>

    <div class="flex-1 overflow-y-auto p-5 space-y-6">
      <section>
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Démographie</h3>
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-muted">Population</dt>
            <dd class="h-display text-xl">{country.population} M</dd>
          </div>
          <div>
            <dt class="text-muted">Musulmans</dt>
            <dd class="h-display text-xl">{country.muslimPct}%</dd>
          </div>
          <div>
            <dt class="text-muted">Volume absolu</dt>
            <dd class="h-display text-xl">~{absMuslims} M</dd>
          </div>
          <div>
            <dt class="text-muted">Niveau tensions</dt>
            <dd class="h-display text-xl">
              {#if country.conflict === 0}–
              {:else}{country.conflict} / 3{/if}
            </dd>
          </div>
        </dl>

        <!-- Répartition visuelle (barre horizontale) -->
        <div class="mt-4">
          <p class="mb-1.5 text-xs text-muted">Répartition au sein de la population musulmane</p>
          <div class="flex h-3 overflow-hidden rounded-full bg-surface-3">
            {#if country.sunniPct > 0}
              <span
                class="bg-sunni-soft"
                style="width: {country.sunniPct}%"
                title="Sunnites : {country.sunniPct}%"
              ></span>
            {/if}
            {#if country.shiaPct > 0}
              <span
                class="bg-shia-soft"
                style="width: {country.shiaPct}%"
                title="Chiites : {country.shiaPct}%"
              ></span>
            {/if}
            {#if country.ibadiPct > 0}
              <span
                class="bg-ibadi"
                style="width: {country.ibadiPct}%"
                title="Ibadi : {country.ibadiPct}%"
              ></span>
            {/if}
          </div>
          <div class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span>Sunnites {country.sunniPct}%</span>
            <span>Chiites {country.shiaPct}%</span>
            {#if country.ibadiPct > 0}<span>Ibadi {country.ibadiPct}%</span>{/if}
          </div>
        </div>
      </section>

      <section>
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Contexte</h3>
        <p class="text-sm leading-relaxed text-ink/90">{country.notes}</p>
      </section>

      {#if security}
        <section class="rounded-lg border border-warn/30 bg-warn/5 p-4">
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-warn">
            Veille sécurité &amp; prévention
          </h3>
          <dl class="space-y-3 text-sm">
            {#if security.conflit}
              <div>
                <dt class="font-medium text-ink">Conflit</dt>
                <dd class="mt-0.5 text-muted">{security.conflit}</dd>
              </div>
            {/if}
            {#if security.terrorisme}
              <div>
                <dt class="font-medium text-ink">Terrorisme</dt>
                <dd class="mt-0.5 text-muted">{security.terrorisme}</dd>
              </div>
            {/if}
            {#if security.france}
              <div>
                <dt class="font-medium text-ink">France</dt>
                <dd class="mt-0.5 text-muted">{security.france}</dd>
              </div>
            {/if}
            {#if security.ue}
              <div>
                <dt class="font-medium text-ink">UE</dt>
                <dd class="mt-0.5 text-muted">{security.ue}</dd>
              </div>
            {/if}
          </dl>
          <p class="mt-3 text-xs text-muted">
            Synthèse indicative, à croiser avec les sources primaires (SGDSN, Europol, Intérieur).
          </p>
        </section>
      {/if}
    </div>

    <footer class="border-t border-surface-3 p-4 text-xs text-muted">
      Données indicatives. Sources : Pew, ONU WPP, CIA Factbook, BAMF, Europol, Intérieur.
    </footer>
  </aside>
{/if}
