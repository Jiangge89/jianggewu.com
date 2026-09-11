// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jianggewu.com',
  trailingSlash: 'always',
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } } },
  server: { port: 4322 },
  vite: {
    plugins: [tailwindcss()],
    server: {
      strictPort: true,
    },
  },
  integrations: [sitemap()],
});
