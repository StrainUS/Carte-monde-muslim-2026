import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createTheme() {
  let current = $state<Theme>('dark');

  if (browser) {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') current = saved;
    else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      current = prefersLight ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', current);
  }

  return {
    get value() {
      return current;
    },
    toggle() {
      current = current === 'dark' ? 'light' : 'dark';
      if (browser) {
        document.documentElement.setAttribute('data-theme', current);
        localStorage.setItem('theme', current);
      }
    },
    set(next: Theme) {
      current = next;
      if (browser) {
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      }
    }
  };
}

export const theme = createTheme();
