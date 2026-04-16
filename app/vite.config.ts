import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    cssMinify: 'lightningcss'
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts']
  }
});
