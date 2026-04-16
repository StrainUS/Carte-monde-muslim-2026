<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  onMount(() => {
    goto(`${base}/guide`, { replaceState: true });
  });
</script>

<svelte:head>
  <title>Redirection…</title>
  <meta http-equiv="refresh" content="0;url=/guide" />
</svelte:head>

<div class="mx-auto max-w-xl px-4 py-16 text-center text-muted">
  <p>
    Cette page a déménagé. Redirection vers
    <a href="{base}/guide" class="underline">le guide pédagogique</a>.
  </p>
</div>
