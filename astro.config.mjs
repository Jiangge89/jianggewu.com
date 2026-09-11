// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jianggewu.com',
  server: { port: 4322 },
  vite: {
    plugins: [tailwindcss()],
    server: {
      strictPort: true,
    },
  },
  integrations: [sitemap()],
});
