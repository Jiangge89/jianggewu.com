// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

let buildDirectory = new URL('./dist/', import.meta.url);

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
  integrations: [
    {
      name: 'seo-build-directory',
      hooks: { 'astro:build:done': ({ dir }) => { buildDirectory = dir; } },
    },
    sitemap({
      serialize(item) {
        // Read the generated metadata so sitemap and noindex never disagree.
        const pathname = new URL(item.url).pathname;
        const html = readFileSync(new URL(`.${pathname}index.html`, buildDirectory), 'utf8');
        if (/<meta name="robots" content="noindex[^"]*"/.test(html)) return undefined;
        const modified = html.match(/"dateModified":"([^"]+)"/);
        if (modified) item.lastmod = modified[1];
        return item;
      },
    }),
  ],
});
