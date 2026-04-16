import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

const dev = process.env.NODE_ENV !== 'production';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx', '.md'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.svx', '.md']
    })
  ],
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: true
    }),
    paths: {
      base: dev ? '' : (process.env.BASE_PATH ?? '')
    },
    alias: {
      $data: 'src/lib/data',
      $map: 'src/lib/map',
      $ui: 'src/lib/ui',
      $content: 'src/lib/content'
    }
  }
};

export default config;
