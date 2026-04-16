<script lang="ts">
  import type { LayerKey } from './layers.svelte.ts';

  interface Props {
    layers: Record<LayerKey, boolean>;
    onToggle: (k: LayerKey) => void;
  }
  let { layers, onToggle }: Props = $props();

  const entries: Array<{ key: LayerKey; label: string; swatch: string }> = [
    { key: 'sunni', label: 'Sunnites', swatch: 'bg-sunni-soft' },
    { key: 'shia', label: 'Chiites', swatch: 'bg-shia-soft' },
    { key: 'mixed', label: 'Mixte sunnite/chiite', swatch: 'bg-mixed' },
    { key: 'ibadi', label: 'Ibadi', swatch: 'bg-ibadi' },
    { key: 'tensions', label: 'Tensions régionales', swatch: 'bg-warn' },
    { key: 'hotspots', label: 'Hotspots terrorisme', swatch: 'bg-danger' },
    { key: 'labels', label: 'Noms des pays', swatch: 'bg-muted' }
  ];
</script>

<fieldset class="space-y-1.5">
  <legend class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Couches</legend>
  {#each entries as e (e.key)}
    <label
      class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2"
    >
      <input
        type="checkbox"
        class="size-4 accent-accent"
        checked={layers[e.key]}
        onchange={() => onToggle(e.key)}
      />
      <span class="size-3 rounded-sm {e.swatch}" aria-hidden="true"></span>
      <span class="flex-1">{e.label}</span>
    </label>
  {/each}
</fieldset>
