<script lang="ts">
  import { editorial } from '$data';
  import { base } from '$app/paths';
</script>

<footer class="mt-auto border-t border-surface-3 bg-surface-1 text-sm text-muted">
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div class="space-y-1">
        <p>
          <strong class="text-ink">Islam mondial 2026</strong> · version {editorial.version} · mis à jour
          le {editorial.lastUpdated}
        </p>
        <p class="text-xs max-w-xl">{editorial.legal}</p>
      </div>
      <nav aria-label="Liens de pied de page" class="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <a href="{base}/sources" class="hover:text-ink underline underline-offset-2"
          >Sources &amp; méthode</a
        >
        <a href="{base}/guide" class="hover:text-ink underline underline-offset-2"
          >Guide pédagogique</a
        >
        <a
          href="https://www.stop-djihadisme.gouv.fr/"
          class="hover:text-ink underline underline-offset-2"
          rel="noopener noreferrer"
          target="_blank"
        >
          stop-djihadisme.gouv.fr ↗
        </a>
        <a
          href="https://www.interieur.gouv.fr/"
          class="hover:text-ink underline underline-offset-2"
          rel="noopener noreferrer"
          target="_blank"
        >
          interieur.gouv.fr ↗
        </a>
      </nav>
    </div>
    <p class="mt-6 text-xs">
      Outil pédagogique d'auto-évaluation. <strong>Ne remplace pas</strong> les référentiels officiels,
      les consignes employeur ni le droit positif. Quiz sans valeur certifiante.
    </p>
  </div>
</footer>
