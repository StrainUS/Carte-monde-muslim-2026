<script lang="ts">
  const fills: Array<{ label: string; swatch: string }> = [
    { label: 'Majorité sunnite', swatch: 'linear-gradient(90deg,#145c1d,#1e8a30)' },
    { label: 'Majorité chiite', swatch: 'linear-gradient(90deg,#0b3d8a,#1456c8)' },
    { label: 'Mixte sunnite/chiite', swatch: 'linear-gradient(90deg,#4a1478,#6a1b9a)' },
    { label: 'Ibadi (Oman)', swatch: 'linear-gradient(90deg,#6a1b9a,#8e24aa)' },
    { label: 'Minorité musulmane', swatch: 'rgba(255,255,255,0.12)' }
  ];

  const tensions: Array<{ label: string; color: string; hint: string }> = [
    { label: 'Conflit ouvert (niv. 3)', color: '#c62828', hint: 'toujours visible' },
    { label: 'Tensions élevées (niv. 2)', color: '#e65100', hint: 'dès zoom 3+' },
    { label: 'Tensions modérées (niv. 1)', color: '#f9a825', hint: 'dès zoom 4+' }
  ];
</script>

<section class="space-y-1.5">
  <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Légende</h3>
  <ul class="space-y-1.5 text-sm">
    {#each fills as r (r.label)}
      <li class="flex items-center gap-2.5">
        <span class="inline-block h-3 w-6 rounded-sm" style:background={r.swatch} aria-hidden="true"
        ></span>
        <span class="text-muted">{r.label}</span>
      </li>
    {/each}
    {#each tensions as r (r.label)}
      <li class="flex items-center gap-2.5">
        <span
          class="relative inline-flex size-5 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          <span
            class="absolute size-5 rounded-full border opacity-30"
            style:border-color={r.color}
          ></span>
          <span
            class="absolute size-3.5 rounded-full border opacity-60"
            style:border-color={r.color}
          ></span>
          <span class="size-2 rounded-full" style:background={r.color}></span>
        </span>
        <span class="flex-1 text-muted">{r.label}</span>
        <span class="text-[10px] uppercase tracking-wider text-muted/70">{r.hint}</span>
      </li>
    {/each}
    <li class="flex items-center gap-2.5">
      <span
        class="inline-block size-3"
        style:background="#ff5722"
        style:clip-path="polygon(50% 0, 100% 100%, 0 100%)"
        aria-hidden="true"
      ></span>
      <span class="text-muted">Hotspot terrorisme ⚠</span>
    </li>
  </ul>
  <p class="pt-2 text-xs text-muted">
    Radars à ondes = tensions (1/2/3 ondes selon le niveau, dévoilées
    progressivement au zoom). Triangles pulsants ⚠ = hotspots terroristes. Les deux sont
    cliquables pour le détail.
  </p>
</section>
