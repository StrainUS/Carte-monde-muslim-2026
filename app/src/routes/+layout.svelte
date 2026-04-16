<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import Header from '$ui/Header.svelte';
  import Footer from '$ui/Footer.svelte';
  import OfflineBadge from '$ui/OfflineBadge.svelte';

  let { children } = $props();

  // Certaines routes s'affichent en "app" plein écran (pas de scroll, pas de footer visible).
  const isAppView = $derived($page.route.id === '/carte');

  onMount(() => {
    if (browser && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(`${base}/service-worker.js`, { type: 'module' })
        .catch(() => {});
    }
  });
</script>

<a href="#main" class="skip-link">Aller au contenu principal</a>

{#if isAppView}
  <div class="flex h-dvh flex-col overflow-hidden">
    <Header />
    <main id="main" class="relative min-h-0 flex-1 focus:outline-none" tabindex="-1">
      {@render children?.()}
    </main>
  </div>
{:else}
  <div class="flex min-h-dvh flex-col">
    <Header />
    <main id="main" class="flex-1 focus:outline-none" tabindex="-1">
      {@render children?.()}
    </main>
    <Footer />
  </div>
{/if}

<OfflineBadge />
