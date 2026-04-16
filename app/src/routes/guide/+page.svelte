<script lang="ts">
  const slides = [
    {
      n: 1,
      title: 'Diversité plutôt qu\'uniformité',
      lede: '~2 milliards de musulmans, répartis sur tous les continents. Pas une seule culture, mais des centaines — arabes, turques, perses, subsahariennes, sud-est-asiatiques, balkaniques, diasporiques.',
      bullets: [
        'Pays le plus peuplé : Indonésie (~242 M musulmans), non arabe.',
        'Majorité chiite : Iran, Irak, Azerbaïdjan, Bahreïn.',
        'Branche distincte : Ibadisme (Oman), ni sunnite ni chiite.'
      ]
    },
    {
      n: 2,
      title: 'Lire la carte — la légende',
      lede: 'Sur la carte, les couleurs indiquent la branche dominante, l\'intensité indique le % de musulmans dans la population totale.',
      bullets: [
        'Vert : sunnites ; Bleu : chiites ; Violet : mixte ou ibadi.',
        'Cercles orangés : tensions régionales indicatives.',
        'Cercles rouges : hotspots terrorisme (non exhaustifs).'
      ]
    },
    {
      n: 3,
      title: 'Sunnisme — la majorité',
      lede: '~85–90 % des musulmans. Héritage du consensus sur les quatre premiers califes. Quatre écoles juridiques (hanafite, malékite, chaféite, hanbalite) plus des courants transverses (soufisme, salafisme).',
      bullets: [
        'Ne pas confondre sunnisme et djihadisme : le second est minoritaire et politique.',
        'Soufisme : dimension spirituelle, transverse, très présente au Sénégal, au Maroc, en Turquie.'
      ]
    },
    {
      n: 4,
      title: 'Chiisme — la branche structurée',
      lede: '~10–13 % des musulmans. Duodécimain majoritaire (Iran, Irak). Zaïdites au Yémen, Ismaéliens en Asie centrale. Alaouites de Syrie souvent distingués du duodécimain.',
      bullets: [
        'Villes saintes : Najaf, Kerbala, Qom, Machhad.',
        'Autorité spirituelle : marja\' (Irak, Iran).',
        'Hezbollah (Liban) : acteur politico-militaire, listes UE/US variables selon périodes.'
      ]
    },
    {
      n: 5,
      title: 'Ibadisme — la branche discrète',
      lede: 'Né au VIIᵉ siècle, ni sunnite ni chiite. Majorité en Oman (~75 %). Tradition d\'ouverture doctrinale, neutralité diplomatique régionale légendaire (médiations Iran-USA, Iran-Irak).',
      bullets: [
        'Rappel : pas de tensions sectaires internes notables au sein d\'Oman.',
        'Présence mineure au Maghreb (Mozabites d\'Algérie, Djerba tunisienne).'
      ]
    },
    {
      n: 6,
      title: 'Conflits — distinguer les causes',
      lede: 'Les conflits « musulmans » sont d\'abord politiques, économiques, ethniques ou postcoloniaux. La religion peut y être instrumentalisée — elle en est rarement la cause première.',
      bullets: [
        'Syrie, Yémen, Irak, Libye, Sahel : enchevêtrement d\'acteurs locaux et régionaux.',
        'Guerres par procuration Iran / Arabie Saoudite dans plusieurs théâtres.',
        'Éviter le réductionnisme « sunnites vs chiites » : les alliances évoluent.'
      ]
    },
    {
      n: 7,
      title: 'En accueil du public — posture',
      lede: 'La connaissance géopolitique ne doit pas induire de stigmatisation. La posture professionnelle repose sur la neutralité, le cadre légal et le signalement encadré.',
      bullets: [
        'Documenter les faits, pas les apparences.',
        'Suivre les procédures internes et le cadre PNAT.',
        'Distinguer idéologie d\'État, société civile et individus.'
      ]
    },
    {
      n: 8,
      title: 'Pyramide des sources',
      lede: 'Toute synthèse sérieuse remonte à la source primaire : Pew Research, ONU WPP, INSEE, Légifrance, EUR-Lex, SGDSN, Europol.',
      bullets: [
        'Primaire d\'abord : textes de loi, rapports officiels, bases statistiques.',
        'Synthèses reconnues ensuite : IFRI, ICG, académiques revus.',
        'Presse et commentaires en dernier — avec esprit critique.'
      ]
    }
  ];

  let idx = $state(0);
  const current = $derived(slides[idx]);

  function go(d: number) {
    idx = Math.max(0, Math.min(slides.length - 1, idx + d));
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  }
</script>

<svelte:window on:keydown={onKey} />

<svelte:head>
  <title>Guide pédagogique — Islam 2026</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
  <header class="mb-6">
    <p class="text-sm font-medium uppercase tracking-wider text-muted">Guide pédagogique</p>
    <h1 class="h-display mt-2 text-4xl">Huit écrans pour comprendre</h1>
  </header>

  <div class="relative overflow-hidden rounded-2xl border border-surface-3 bg-surface-1 shadow-soft">
    <div class="h-1 bg-surface-3">
      <div class="h-full bg-accent transition-all duration-500" style="width: {((idx + 1) / slides.length) * 100}%"></div>
    </div>
    <div class="p-6 sm:p-10">
      <p class="text-sm font-medium text-accent">{current.n} / {slides.length}</p>
      <h2 class="h-display mt-2 text-3xl sm:text-4xl">{current.title}</h2>
      <p class="mt-4 text-lg text-muted">{current.lede}</p>
      <ul class="mt-6 space-y-2 text-sm">
        {#each current.bullets as b}
          <li class="flex gap-2">
            <span class="mt-1 text-accent" aria-hidden="true">▸</span>
            <span>{b}</span>
          </li>
        {/each}
      </ul>
    </div>

    <div class="flex items-center justify-between gap-3 border-t border-surface-3 bg-surface-2/40 px-5 py-3">
      <button
        type="button"
        class="rounded-md bg-surface-1 px-3 py-2 text-sm hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={idx === 0}
        onclick={() => go(-1)}
      >
        ← Précédent
      </button>
      <div class="flex gap-1" role="tablist" aria-label="Écrans du guide">
        {#each slides as s, i (s.n)}
          <button
            type="button"
            class="size-2 rounded-full transition-all {i === idx ? 'bg-accent w-6' : 'bg-surface-3 hover:bg-muted'}"
            aria-label="Écran {s.n} : {s.title}"
            onclick={() => (idx = i)}
          ></button>
        {/each}
      </div>
      <button
        type="button"
        class="rounded-md bg-surface-1 px-3 py-2 text-sm hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={idx === slides.length - 1}
        onclick={() => go(1)}
      >
        Suivant →
      </button>
    </div>
  </div>

  <p class="mt-4 text-xs text-muted">
    <kbd class="rounded bg-surface-2 px-1">←</kbd> / <kbd class="rounded bg-surface-2 px-1">→</kbd>
    pour naviguer.
  </p>
</div>
