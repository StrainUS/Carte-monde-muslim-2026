/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts,svx,md}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        paper: 'rgb(var(--paper) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        ok: 'rgb(var(--ok) / <alpha-value>)',
        'surface-1': 'rgb(var(--surface-1) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        'surface-3': 'rgb(var(--surface-3) / <alpha-value>)',
        'sunni-strong': 'rgb(var(--sunni-strong) / <alpha-value>)',
        'sunni-soft': 'rgb(var(--sunni-soft) / <alpha-value>)',
        'shia-strong': 'rgb(var(--shia-strong) / <alpha-value>)',
        'shia-soft': 'rgb(var(--shia-soft) / <alpha-value>)',
        mixed: 'rgb(var(--mixed) / <alpha-value>)',
        ibadi: 'rgb(var(--ibadi) / <alpha-value>)'
      },
      boxShadow: {
        soft: '0 6px 24px -12px rgb(0 0 0 / 0.25), 0 2px 6px -2px rgb(0 0 0 / 0.1)'
      }
    }
  },
  plugins: []
};
