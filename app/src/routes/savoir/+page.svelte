<script lang="ts">
  import { timeline, glossary, countries } from '$data';

  let glossaryQuery = $state('');
  const filteredGlossary = $derived(
    glossaryQuery
      ? glossary.filter(
          (g) =>
            g.term.toLowerCase().includes(glossaryQuery.toLowerCase()) ||
            g.definition.toLowerCase().includes(glossaryQuery.toLowerCase())
        )
      : glossary
  );

  const currents = [
    {
      name: 'Sunnisme',
      share: '~85–90 % des musulmans',
      description:
        "Majorité, héritée du consensus autour des quatre premiers califes (rashidun). Quatre écoles juridiques (hanafite, malékite, chaféite, hanbalite), transverse avec le soufisme et avec le salafisme.",
      keyCountries: ['Indonésie', 'Pakistan', 'Bangladesh', 'Égypte', 'Arabie Saoudite']
    },
    {
      name: 'Chiisme duodécimain',
      share: '~10–13 %',
      description:
        "Branche majoritaire du chiisme, reconnaissant douze imams successifs après ʿAlī. Autorité des marja' en Iran et Irak. Villes saintes : Najaf, Kerbala, Machhad, Qom.",
      keyCountries: ['Iran', 'Irak', 'Azerbaïdjan', 'Bahreïn']
    },
    {
      name: 'Zaïdisme',
      share: '< 1 %',
      description:
        'Branche chiite minoritaire, historique au Yémen. Les Houthis (Ansar Allah) en sont issus.',
      keyCountries: ['Yémen']
    },
    {
      name: 'Ismaélisme',
      share: '< 1 %',
      description:
        "Branche chiite (septimaniens). Communautés Nizarites (Aga Khan) et Mustaaliennes. Présence marquée en Asie centrale et en diaspora.",
      keyCountries: ['Tadjikistan', 'Inde', 'Pakistan']
    },
    {
      name: 'Ibadisme',
      share: '< 1 %',
      description:
        "Branche distincte, ni sunnite ni chiite, fondée au VIIᵉ s. Majorité en Oman ; tradition d'ouverture doctrinale et de neutralité diplomatique.",
      keyCountries: ['Oman']
    },
    {
      name: 'Soufisme',
      share: 'Transverse',
      description:
        "Voies spirituelles et confréries (turuq) traversant sunnisme et chiisme. Tijaniyya, Qadiriyya, Mouridiyya, Bektachiyya. Exemple : Sénégal, Maroc, Turquie.",
      keyCountries: ['Sénégal', 'Maroc', 'Turquie', 'Albanie']
    }
  ];

  const schools = [
    { name: 'Hanafite', zones: 'Asie centrale, Turquie, sous-continent indien, Balkans' },
    { name: 'Malékite', zones: 'Maghreb, Afrique de l’Ouest et sahélienne, une partie du Golfe' },
    { name: 'Chaféite', zones: 'Indonésie, Malaisie, Yémen, côtes de l’océan Indien' },
    { name: 'Hanbalite', zones: 'Péninsule arabique (cœur de la réforme wahhabite)' },
    { name: 'Jaʿfarite', zones: 'Chiisme duodécimain (Iran, Irak, Liban, Bahreïn)' }
  ];

  const topMuslim = [...countries]
    .filter((c) => c.muslimPct > 0)
    .map((c) => ({ ...c, absolute: (c.population * c.muslimPct) / 100 }))
    .sort((a, b) => b.absolute - a.absolute)
    .slice(0, 10);
</script>

<svelte:head>
  <title>Savoir — courants, timeline, glossaire · Islam 2026</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
  <header class="mb-10">
    <p class="text-sm font-medium uppercase tracking-wider text-muted">Savoir</p>
    <h1 class="h-display mt-2 text-4xl">Comprendre avant de surveiller</h1>
    <p class="mt-3 max-w-2xl text-muted">
      Courants, écoles juridiques, repères chronologiques et glossaire pour distinguer
      idéologies, sociétés et individus.
    </p>
  </header>

  <section id="timeline" class="mb-16 scroll-mt-20">
    <h2 class="h-display mb-5 text-2xl">Chronologie — 610 → 2026</h2>
    <ol class="relative border-l-2 border-surface-3 pl-6 space-y-4">
      {#each timeline as e (e.year)}
        <li class="relative">
          <span
            class="absolute -left-[34px] top-1 grid size-5 place-items-center rounded-full border-2 border-accent bg-paper text-[10px] font-bold text-accent"
            aria-hidden="true"
          ></span>
          <div class="rounded-lg border border-surface-3 bg-surface-1 p-4">
            <div class="flex items-baseline gap-3">
              <time class="h-display text-lg text-accent">{e.year}</time>
              <h3 class="font-medium">{e.title}</h3>
            </div>
            <p class="mt-1 text-sm text-muted">{e.detail}</p>
          </div>
        </li>
      {/each}
    </ol>
  </section>

  <section id="courants" class="mb-16 scroll-mt-20">
    <h2 class="h-display mb-5 text-2xl">Courants majeurs</h2>
    <div class="grid gap-4 md:grid-cols-2">
      {#each currents as c (c.name)}
        <article class="rounded-xl border border-surface-3 bg-surface-1 p-5">
          <div class="flex items-baseline justify-between gap-3">
            <h3 class="h-display text-lg">{c.name}</h3>
            <span class="text-xs text-muted">{c.share}</span>
          </div>
          <p class="mt-2 text-sm text-muted">{c.description}</p>
          <p class="mt-3 text-xs text-muted">
            <span class="font-medium text-ink">Pays clés :</span> {c.keyCountries.join(' · ')}
          </p>
        </article>
      {/each}
    </div>
  </section>

  <section id="ecoles" class="mb-16 scroll-mt-20">
    <h2 class="h-display mb-5 text-2xl">Écoles juridiques (madhahib)</h2>
    <ul class="grid gap-3 md:grid-cols-2">
      {#each schools as s (s.name)}
        <li class="rounded-lg border border-surface-3 bg-surface-1 p-4">
          <p class="h-display text-base">{s.name}</p>
          <p class="mt-1 text-sm text-muted">{s.zones}</p>
        </li>
      {/each}
    </ul>
  </section>

  <section id="top10" class="mb-16 scroll-mt-20">
    <h2 class="h-display mb-5 text-2xl">Top 10 — populations musulmanes absolues</h2>
    <div class="overflow-hidden rounded-xl border border-surface-3">
      <table class="w-full text-sm">
        <thead class="bg-surface-2 text-left text-xs uppercase tracking-wider text-muted">
          <tr>
            <th class="px-4 py-2.5">#</th>
            <th class="px-4 py-2.5">Pays</th>
            <th class="px-4 py-2.5 text-right">Population (M)</th>
            <th class="px-4 py-2.5 text-right">% musulmans</th>
            <th class="px-4 py-2.5 text-right">Musulmans ~M</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-3 bg-surface-1">
          {#each topMuslim as c, i (c.name)}
            <tr>
              <td class="px-4 py-2 text-muted">{i + 1}</td>
              <td class="px-4 py-2 font-medium">{c.name}</td>
              <td class="px-4 py-2 text-right tabular-nums">{c.population.toFixed(0)}</td>
              <td class="px-4 py-2 text-right tabular-nums">{c.muslimPct}%</td>
              <td class="px-4 py-2 text-right h-display">{c.absolute.toFixed(0)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="mt-2 text-xs text-muted">Ordres de grandeur. Source : Pew / CIA Factbook (croiser avec WPP ONU).</p>
  </section>

  <section id="glossaire" class="scroll-mt-20">
    <h2 class="h-display mb-3 text-2xl">Glossaire</h2>
    <label for="glossaire-search" class="sr-only">Rechercher dans le glossaire</label>
    <input
      id="glossaire-search"
      type="search"
      placeholder="Rechercher un terme…"
      bind:value={glossaryQuery}
      class="w-full rounded-md border border-surface-3 bg-surface-1 px-4 py-2.5 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
    />
    <dl class="mt-4 space-y-3">
      {#each filteredGlossary as g (g.term)}
        <div class="rounded-lg border border-surface-3 bg-surface-1 p-4">
          <dt class="h-display text-base">{g.term}</dt>
          <dd class="mt-1 text-sm text-muted">{g.definition}</dd>
        </div>
      {:else}
        <p class="text-sm text-muted">Aucun terme trouvé.</p>
      {/each}
    </dl>
  </section>
</div>
