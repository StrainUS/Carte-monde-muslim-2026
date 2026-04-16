<script lang="ts">
  const rows = [
    { label: 'Majorité sunnite', swatch: 'linear-gradient(90deg,#145c1d,#1e8a30)' },
    { label: 'Majorité chiite', swatch: 'linear-gradient(90deg,#0b3d8a,#1456c8)' },
    { label: 'Mixte sunnite/chiite', swatch: 'linear-gradient(90deg,#4a1478,#6a1b9a)' },
    { label: 'Ibadi (Oman)', swatch: 'linear-gradient(90deg,#6a1b9a,#8e24aa)' },
    { label: 'Minorité musulmane', swatch: 'rgba(255,255,255,0.12)' },
    { label: 'Tensions niveau 3', swatch: '#c62828' },
    { label: 'Tensions niveau 2', swatch: '#e65100' },
    { label: 'Tensions niveau 1', swatch: '#f9a825' }
  ];
</script>

<section class="space-y-1.5">
  <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Légende</h3>
  <ul class="space-y-1.5 text-sm">
    {#each rows as r (r.label)}
      <li class="flex items-center gap-2.5">
        <span
          class="inline-block h-3 w-6 rounded-sm"
          style:background={r.swatch}
          aria-hidden="true"
        ></span>
        <span class="text-muted">{r.label}</span>
      </li>
    {/each}
  </ul>
  <p class="pt-2 text-xs text-muted">
    Intensité = % de musulmans dans la population.
  </p>
</section>
