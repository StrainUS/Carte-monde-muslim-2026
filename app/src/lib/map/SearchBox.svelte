<script lang="ts">
  import { findCountry, type Country } from '$data';

  interface Props {
    onPick: (c: Country) => void;
  }
  let { onPick }: Props = $props();

  let query = $state('');
  let focused = $state(false);
  let highlight = $state(0);

  const results = $derived(query.length >= 1 ? findCountry(query) : []);

  function pick(c: Country) {
    query = c.name;
    focused = false;
    onPick(c);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlight = Math.min(results.length - 1, highlight + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlight = Math.max(0, highlight - 1);
    } else if (e.key === 'Enter' && results[highlight]) {
      e.preventDefault();
      pick(results[highlight]);
    } else if (e.key === 'Escape') {
      focused = false;
      query = '';
    }
  }
</script>

<div class="relative">
  <label for="country-search" class="sr-only">Rechercher un pays</label>
  <div class="relative">
    <svg
      class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
    <input
      id="country-search"
      type="search"
      autocomplete="off"
      placeholder="Rechercher un pays…"
      bind:value={query}
      onfocus={() => (focused = true)}
      onblur={() => setTimeout(() => (focused = false), 150)}
      onkeydown={onKey}
      class="w-full rounded-md border border-surface-3 bg-surface-1 py-2 pl-9 pr-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
      role="combobox"
      aria-expanded={focused && results.length > 0}
      aria-controls="search-results"
      aria-autocomplete="list"
    />
  </div>

  {#if focused && results.length > 0}
    <ul
      id="search-results"
      role="listbox"
      class="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-auto rounded-md border border-surface-3 bg-surface-1 py-1 text-sm shadow-soft"
    >
      {#each results as c, i (c.name)}
        <li>
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-surface-2
                   {i === highlight ? 'bg-surface-2' : ''}"
            role="option"
            aria-selected={i === highlight}
            onmouseenter={() => (highlight = i)}
            onclick={() => pick(c)}
          >
            <span class="truncate">{c.name}</span>
            <span class="text-xs text-muted">{c.muslimPct}% · {c.region}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
