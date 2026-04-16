<script lang="ts">
  import { base } from '$app/paths';
  import { countries, quiz, sources, chronology, timeline } from '$data';

  const totalMuslims = countries.reduce(
    (sum, c) => sum + (c.population * c.muslimPct) / 100,
    0
  );
  const muslimBn = (totalMuslims / 1000).toFixed(2);

  const features = [
    {
      href: '/carte',
      icon: '🗺',
      title: 'Carte interactive',
      desc: `${countries.length} pays · couches sunnite / chiite / ibadi / tensions / hotspots terrorisme · fiches détaillées.`
    },
    {
      href: '/savoir',
      icon: '📚',
      title: 'Savoir',
      desc: `Timeline 610 → 2026 (${timeline.length} repères), courants, glossaire, écoles juridiques.`
    },
    {
      href: '/terrorisme',
      icon: '⚠',
      title: 'Terrorisme',
      desc: `Chronologie France ${chronology.events.length} événements · cadre PNAT / Europol / SGDSN.`
    },
    {
      href: '/quiz',
      icon: '✎',
      title: 'Quiz',
      desc: `Auto-évaluation ${quiz.length} questions · correction avec sources · sans valeur certifiante.`
    },
    {
      href: '/guide',
      icon: '🎓',
      title: 'Guide & diaporama',
      desc: '8 écrans pédagogiques, méthode de veille, pyramide des sources.'
    },
    {
      href: '/sources',
      icon: '🔗',
      title: 'Sources',
      desc: `${sources.length} références officielles (Pew, Europol, SGDSN, Intérieur, ONU, INSEE…).`
    }
  ];
</script>

<svelte:head>
  <title>Islam mondial 2026 — Carte interactive, veille &amp; prévention</title>
</svelte:head>

<section class="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 sm:pt-16">
  <div class="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
    <div>
      <p class="text-sm font-medium uppercase tracking-wider text-muted">
        Outil de veille 2026 · sans valeur certifiante
      </p>
      <h1 class="h-display mt-3 text-4xl leading-tight sm:text-5xl">
        Carte mondiale de l'islam,
        <br />
        <span class="bg-gradient-to-r from-sunni-soft to-shia-soft bg-clip-text text-transparent">
          veille géopolitique et prévention
        </span>
      </h1>
      <p class="mt-5 max-w-xl text-lg text-muted">
        Pour les agents de sécurité et les équipes en accueil du public : carte interactive,
        contexte par pays, chronologie terrorisme France, guide pédagogique et quiz
        d'auto-évaluation. Données indicatives sourcées.
      </p>
      <div class="mt-7 flex flex-wrap items-center gap-3">
        <a
          href="{base}/carte"
          class="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-medium text-white shadow-soft hover:brightness-110 transition"
        >
          Ouvrir la carte →
        </a>
        <a
          href="{base}/guide"
          class="inline-flex items-center gap-2 rounded-lg border border-surface-3 bg-surface-1 px-5 py-3 font-medium hover:bg-surface-2 transition"
        >
          Commencer par le guide
        </a>
      </div>
    </div>

    <aside class="rounded-2xl border border-surface-3 bg-surface-1 p-6 shadow-soft">
      <p class="text-xs font-medium uppercase tracking-wider text-muted">Repères rapides</p>
      <dl class="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt class="text-muted">Musulmans dans le monde</dt>
          <dd class="h-display text-2xl">~{muslimBn} Md</dd>
        </div>
        <div>
          <dt class="text-muted">Pays couverts</dt>
          <dd class="h-display text-2xl">{countries.length}</dd>
        </div>
        <div>
          <dt class="text-muted">Questions de quiz</dt>
          <dd class="h-display text-2xl">{quiz.length}</dd>
        </div>
        <div>
          <dt class="text-muted">Sources référencées</dt>
          <dd class="h-display text-2xl">{sources.length}</dd>
        </div>
      </dl>
      <p class="mt-5 text-xs text-muted">
        Ordres de grandeur. Croiser les sources primaires (Pew, ONU WPP, INSEE, Europol) pour tout
        compte rendu sérieux.
      </p>
    </aside>
  </div>
</section>

<section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
  <h2 class="h-display text-2xl mb-6">Parcourir</h2>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each features as f (f.href)}
      <a
        href="{base}{f.href}"
        class="group rounded-xl border border-surface-3 bg-surface-1 p-5 transition hover:border-accent/50 hover:bg-surface-2"
      >
        <div class="flex items-start gap-3">
          <span
            class="grid size-10 place-items-center rounded-lg bg-surface-2 text-xl"
            aria-hidden="true">{f.icon}</span
          >
          <div>
            <h3 class="h-display text-lg group-hover:text-accent">{f.title} →</h3>
            <p class="mt-1 text-sm text-muted">{f.desc}</p>
          </div>
        </div>
      </a>
    {/each}
  </div>
</section>

<section class="mx-auto max-w-7xl px-4 pt-2 pb-12 sm:px-6">
  <div class="rounded-xl border border-warn/30 bg-warn/5 p-5 text-sm">
    <p class="font-medium text-ink">Avertissement pédagogique.</p>
    <p class="mt-2 text-muted">
      Les synthèses et cartographies présentées sont des <strong>ordres de grandeur indicatifs</strong>
      à des fins de sensibilisation et de veille. Elles ne se substituent pas au droit positif, aux
      consignes employeur, ni aux publications officielles à jour (Légifrance, EUR-Lex, Europol,
      SGDSN, INSEE).
    </p>
  </div>
</section>
