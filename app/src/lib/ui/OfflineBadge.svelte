<script lang="ts">
  import { onMount } from 'svelte';

  let online = $state(true);

  onMount(() => {
    online = navigator.onLine;
    const on = () => (online = true);
    const off = () => (online = false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  });
</script>

{#if !online}
  <div
    role="status"
    aria-live="polite"
    class="fixed bottom-4 left-4 z-[60] rounded-full border border-warn/40 bg-warn/20 px-3 py-1.5 text-xs font-medium text-ink shadow-soft backdrop-blur"
  >
    ● Mode hors ligne — contenu local
  </div>
{/if}
