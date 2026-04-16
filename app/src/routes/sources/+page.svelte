<script lang="ts">
  import { sources, editorial } from '$data';

  const groups = {
    'Démographie & géographie': ['pew', 'pew-muslim', 'un-wpp', 'cia', 'wb-data', 'oecd', 'insee'],
    'Sécurité & terrorisme (UE/ONU)': [
      'eu-tesat',
      'europol-tesat',
      'eu-dir-2017-541',
      'un-sc-terror',
      'unodc-terror',
      'fatf-tf',
      'eurojust'
    ],
    'France — veille officielle': [
      'pnat',
      'sgdsn',
      'justice-fr',
      'legi-cp-terror',
      'stop-djihadisme'
    ],
    'Humanitaire & contexte': ['unhcr', 'bamf']
  };

  const groupedSources = Object.entries(groups).map(([label, ids]) => ({
    label,
    items: ids.map((id) => sources.find((s) => s.id === id)).filter(Boolean)
  }));
</script>

<svelte:head>
  <title>Sources &amp; méthode — Islam 2026</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
  <header class="mb-8">
    <p class="text-sm font-medium uppercase tracking-wider text-muted">Références</p>
    <h1 class="h-display mt-2 text-4xl">Sources &amp; méthode</h1>
    <p class="mt-3 max-w-2xl text-muted">
      Version éditoriale {editorial.version}, mise à jour le {editorial.lastUpdated}. {editorial.method}
    </p>
  </header>

  <div class="mb-10 rounded-lg border border-accent/30 bg-accent/5 p-5 text-sm">
    <p class="font-medium text-ink">Pyramide des sources</p>
    <ol class="mt-2 space-y-1 text-muted list-decimal list-inside">
      <li>
        <strong class="text-ink">Primaire</strong> : textes de loi (Légifrance, EUR-Lex), bases statistiques
        (INSEE, ONU WPP), rapports officiels (SGDSN, Europol).
      </li>
      <li>
        <strong class="text-ink">Synthèses institutionnelles</strong> : Pew Research, ICG, UNHCR, BAMF.
      </li>
      <li>
        <strong class="text-ink">Presse et commentaires</strong> : à utiliser pour le contexte, avec croisement.
      </li>
    </ol>
  </div>

  {#each groupedSources as g (g.label)}
    <section class="mb-10">
      <h2 class="h-display mb-4 text-2xl">{g.label}</h2>
      <ul class="grid gap-3 md:grid-cols-2">
        {#each g.items as s (s!.id)}
          <li>
            <a
              href={s!.url}
              target="_blank"
              rel="noopener noreferrer"
              class="group block rounded-lg border border-surface-3 bg-surface-1 p-4 transition hover:border-accent/40 hover:bg-surface-2"
            >
              <p class="font-medium group-hover:text-accent">{s!.label} ↗</p>
              {#if s!.note}
                <p class="mt-1 text-sm text-muted">{s!.note}</p>
              {/if}
              <p class="mt-2 break-all text-xs text-muted">{s!.url}</p>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/each}

  <section class="rounded-xl border border-surface-3 bg-surface-1 p-6">
    <h2 class="h-display mb-3 text-2xl">Disclaimer</h2>
    <p class="text-sm text-muted">{editorial.legal}</p>
  </section>
</div>
