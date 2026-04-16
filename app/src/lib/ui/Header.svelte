<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { theme } from './theme.svelte.ts';
  import ThemeToggle from './ThemeToggle.svelte';

  const routes = [
    { href: '/carte', label: 'Carte', key: 'carte' },
    { href: '/savoir', label: 'Savoir', key: 'savoir' },
    { href: '/terrorisme', label: 'Terrorisme', key: 'terrorisme' },
    { href: '/quiz', label: 'Quiz', key: 'quiz' },
    { href: '/guide', label: 'Guide', key: 'guide' },
    { href: '/sources', label: 'Sources', key: 'sources' }
  ];

  let menuOpen = $state(false);

  function isActive(href: string): boolean {
    const path = $page.url.pathname;
    if (href === '/carte') return path === '/' || path.startsWith('/carte') || path === `${base}/`;
    return path.startsWith(base + href) || path === href;
  }
</script>

<header class="sticky top-0 z-50 border-b border-surface-3 bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
  <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
    <a href="{base}/" class="flex items-center gap-2.5 min-w-0">
      <span
        aria-hidden="true"
        class="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-sunni-soft to-shia-soft text-white font-display text-lg shadow-soft"
      >
        ☪
      </span>
      <span class="hidden sm:flex sm:flex-col leading-tight min-w-0">
        <strong class="h-display text-sm truncate">Islam mondial · veille &amp; prévention</strong>
        <span class="text-xs text-muted truncate">2026 · carte, contexte, quiz, guide</span>
      </span>
    </a>

    <nav
      class="ml-auto hidden items-center gap-0.5 md:flex"
      aria-label="Navigation principale"
    >
      {#each routes as r (r.key)}
        <a
          href="{base}{r.href}"
          class="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-2
                 {isActive(r.href) ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink'}"
          aria-current={isActive(r.href) ? 'page' : undefined}
        >
          {r.label}
        </a>
      {/each}
    </nav>

    <div class="ml-auto flex items-center gap-1 md:ml-2">
      <ThemeToggle />
      <button
        type="button"
        class="md:hidden rounded-md p-2 text-muted hover:bg-surface-2 hover:text-ink"
        aria-expanded={menuOpen}
        aria-controls="mobile-nav"
        aria-label="Ouvrir le menu"
        onclick={() => (menuOpen = !menuOpen)}
      >
        {#if menuOpen}✕{:else}☰{/if}
      </button>
    </div>
  </div>

  {#if menuOpen}
    <nav
      id="mobile-nav"
      class="md:hidden border-t border-surface-3 bg-paper"
      aria-label="Navigation mobile"
    >
      <ul class="flex flex-col p-2">
        {#each routes as r (r.key)}
          <li>
            <a
              href="{base}{r.href}"
              class="block rounded-md px-3 py-2.5 text-sm font-medium
                     {isActive(r.href) ? 'bg-surface-2 text-ink' : 'text-muted hover:bg-surface-2 hover:text-ink'}"
              aria-current={isActive(r.href) ? 'page' : undefined}
              onclick={() => (menuOpen = false)}
            >
              {r.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</header>
