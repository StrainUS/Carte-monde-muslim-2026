<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import Header from '$ui/Header.svelte';
  import Footer from '$ui/Footer.svelte';
  import OfflineBadge from '$ui/OfflineBadge.svelte';

  let { children } = $props();

  onMount(() => {
    if (browser && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${base}/service-worker.js`, { type: 'module' }).catch(() => {});
    }
  });
</script>

<a href="#main" class="skip-link">Aller au contenu principal</a>

<div class="flex min-h-dvh flex-col">
  <Header />
  <main id="main" class="flex-1 focus:outline-none" tabindex="-1">
    {@render children?.()}
  </main>
  <Footer />
</div>
<OfflineBadge />
