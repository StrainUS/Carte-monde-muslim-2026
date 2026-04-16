<script lang="ts">
  import { chronology, hotspots, securityNotes, sourceById } from '$data';

  const decades = (() => {
    const by: Record<string, typeof chronology.events> = {};
    for (const e of chronology.events) {
      const d = e.date.slice(0, 3) + '0s';
      (by[d] ||= []).push(e);
    }
    return Object.entries(by).sort(([a], [b]) => a.localeCompare(b));
  })();

  const cadre = [
    {
      id: 'pnat',
      name: 'PNAT — France',
      description: 'Parquet national antiterroriste (créé 2019). Centralise les enquêtes et poursuites pour actes terroristes.',
      href: 'https://www.justice.gouv.fr/parquet-national-antiterroriste'
    },
    {
      id: 'sgdsn',
      name: 'SGDSN',
      description: 'Secrétariat général de la défense et de la sécurité nationale. Rapports publics sur la menace.',
      href: 'https://www.sgdsn.gouv.fr/'
    },
    {
      id: 'europol',
      name: 'Europol TE-SAT',
      description: "Rapport annuel UE sur la situation et les tendances du terrorisme (European Union Terrorism Situation and Trend Report).",
      href: 'https://www.europol.europa.eu/publications-events/main-reports/european-union-terrorism-situation-and-trend-report-te-sat'
    },
    {
      id: 'eu-dir',
      name: 'Directive (UE) 2017/541',
      description: 'Harmonisation pénale et coopération UE contre le terrorisme.',
      href: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32017L0541'
    },
    {
      id: 'un-1373',
      name: 'ONU — Résolution 1373',
      description: 'Obligations renforcées aux États post-11 septembre : coopération, gel des avoirs, poursuites.',
      href: 'https://www.un.org/securitycouncil/ctc/content/1373'
    },
    {
      id: 'gafi',
      name: 'GAFI / FATF',
      description: "Normes internationales anti-blanchiment et contre le financement du terrorisme (AML/CFT).",
      href: 'https://www.fatf-gafi.org/en/topics/terrorist-financing.html'
    }
  ];
</script>

<svelte:head>
  <title>Terrorisme — chronologie France &amp; cadre européen · Islam 2026</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
  <header class="mb-8">
    <p class="text-sm font-medium uppercase tracking-wider text-muted">Terrorisme</p>
    <h1 class="h-display mt-2 text-4xl">Chronologie France &amp; cadre de veille</h1>
    <p class="mt-3 max-w-3xl text-muted">
      {chronology.disclaimer}
    </p>
  </header>

  <div class="mb-10 rounded-lg border border-danger/30 bg-danger/5 p-5 text-sm">
    <p class="font-medium text-ink">Avertissement légal.</p>
    <p class="mt-2 text-muted">
      Les qualifications « terroristes » et les imputations relèvent exclusivement du juge
      pénal (Légifrance, cour d'assises spéciale, cour d'appel). Les synthèses ci-dessous reprennent
      des constats judiciaires publiés. Les affaires en cours peuvent évoluer.
    </p>
  </div>

  <section class="mb-14">
    <h2 class="h-display mb-5 text-2xl">Chronologie 1980 → aujourd'hui</h2>
    <div class="space-y-8">
      {#each decades as [decade, events] (decade)}
        <div>
          <h3 class="h-display mb-3 text-xl text-accent">{decade}</h3>
          <ol class="space-y-3">
            {#each events as e (e.date)}
              <li class="rounded-lg border border-surface-3 bg-surface-1 p-4">
                <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <time class="h-display text-sm text-muted tabular-nums">{e.date}</time>
                  <p class="font-medium">{e.place}</p>
                </div>
                <p class="mt-2 text-sm text-muted">{e.summary}</p>
                {#if e.actorsOfficial}
                  <p class="mt-1.5 text-xs text-muted">
                    <span class="font-medium text-ink">Constats judiciaires :</span> {e.actorsOfficial}
                  </p>
                {/if}
                {#if e.judicialNote}
                  <p class="mt-1 text-xs text-muted italic">{e.judicialNote}</p>
                {/if}
              </li>
            {/each}
          </ol>
        </div>
      {/each}
    </div>
  </section>

  <section class="mb-14">
    <h2 class="h-display mb-5 text-2xl">Hotspots — zones de vigilance géopolitique</h2>
    <p class="mb-4 max-w-3xl text-sm text-muted">
      Cercles indicatifs (non exhaustifs) issus de la synthèse v1 du projet. Pour des analyses à
      jour, consulter les rapports Europol TE-SAT, SGDSN et UNHCR.
    </p>
    <ul class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {#each hotspots as h (h.zone)}
        <li class="rounded-lg border border-surface-3 bg-surface-1 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="h-display text-base">{h.zone}</p>
              <p class="mt-1 text-sm text-muted">{h.label}</p>
            </div>
            <span
              class="grid size-8 place-items-center rounded-full text-xs font-bold"
              style="background: rgb(255 87 34 / {0.2 + h.intensity * 0.4}); color: #ff5722"
              aria-label="Intensité indicative {h.intensity}"
            >
              {Math.round(h.intensity * 10)}
            </span>
          </div>
        </li>
      {/each}
    </ul>
  </section>

  <section class="mb-14">
    <h2 class="h-display mb-5 text-2xl">Cadre de veille institutionnel</h2>
    <div class="grid gap-3 md:grid-cols-2">
      {#each cadre as c (c.id)}
        <a
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          class="group rounded-xl border border-surface-3 bg-surface-1 p-5 hover:border-accent/40 hover:bg-surface-2"
        >
          <p class="h-display text-lg group-hover:text-accent">{c.name} ↗</p>
          <p class="mt-1.5 text-sm text-muted">{c.description}</p>
        </a>
      {/each}
    </div>
  </section>

  <section class="mb-10">
    <h2 class="h-display mb-5 text-2xl">Notes pays (sécurité &amp; prévention)</h2>
    <div class="grid gap-3 md:grid-cols-2">
      {#each securityNotes as n (n.country)}
        <article class="rounded-xl border border-surface-3 bg-surface-1 p-5">
          <h3 class="h-display text-lg">{n.country}</h3>
          {#if n.conflit}<p class="mt-2 text-sm"><strong class="text-ink">Conflit :</strong> <span class="text-muted">{n.conflit}</span></p>{/if}
          {#if n.terrorisme}<p class="mt-1.5 text-sm"><strong class="text-ink">Terrorisme :</strong> <span class="text-muted">{n.terrorisme}</span></p>{/if}
          {#if n.france}<p class="mt-1.5 text-sm"><strong class="text-ink">France :</strong> <span class="text-muted">{n.france}</span></p>{/if}
          {#if n.ue}<p class="mt-1.5 text-sm"><strong class="text-ink">UE :</strong> <span class="text-muted">{n.ue}</span></p>{/if}
        </article>
      {/each}
    </div>
  </section>

  <p class="text-xs text-muted">
    Synthèses indicatives. Pour statistiques nationales, attentats déjoués, évolutions normatives :
    croiser les rapports du SGDSN, les publications du ministère de l'Intérieur et les rapports
    parlementaires.
  </p>
</div>
