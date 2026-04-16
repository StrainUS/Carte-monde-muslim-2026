<script lang="ts">
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>Hors ligne — Islam 2026</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
  <div class="mx-auto grid size-16 place-items-center rounded-full bg-warn/15 text-3xl">●</div>
  <h1 class="h-display mt-6 text-3xl">Mode hors ligne</h1>
  <p class="mt-4 text-muted">
    Aucune connexion détectée. L'application fonctionne en local : la carte,
    les fiches pays, le quiz et le guide sont disponibles depuis le cache.
  </p>
  <p class="mt-2 text-sm text-muted">
    Les sources externes (liens vers Légifrance, Europol…) nécessitent une connexion.
  </p>
  <div class="mt-8 flex flex-wrap justify-center gap-3">
    <a href="{base}/carte" class="rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:brightness-110">
      Ouvrir la carte
    </a>
    <a href="{base}/guide" class="rounded-lg border border-surface-3 bg-surface-1 px-5 py-2.5 hover:bg-surface-2">
      Guide pédagogique
    </a>
  </div>
</div>
