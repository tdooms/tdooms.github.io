// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import path from 'path'

import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import icon from 'astro-icon'
import tailwindcss from '@tailwindcss/vite'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeExternalLinks from 'rehype-external-links'

// https://astro.build/config
export default defineConfig({
  site: 'https://tdooms.github.io',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  fonts: [
    {
      name: 'Fira Sans',
      cssVariable: '--font-fira-sans',
      provider: fontProviders.google(),
      weights: [300, 400, 500, 600, 700],
      styles: ['normal'],
    },
    {
      name: 'Fira Code',
      cssVariable: '--font-fira-code',
      provider: fontProviders.google(),
      weights: [400, 500],
      styles: ['normal'],
    },
  ],
  // No CSP via Astro auto-config. Astro v6 always emits sha256 hashes for known
  // inline styles, and per CSP spec hashes nullify 'unsafe-inline'. KaTeX needs
  // 'unsafe-inline' for its per-equation `style="..."` attributes, so the two
  // conflict. For a static site with no user input the strict CSP earns nothing
  // worth the score hit. Add a real CSP via deploy-time HTTP headers if needed.
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },
  integrations: [svelte(), mdx(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@/': path.resolve('./src') + '/',
      },
    },
    build: {
      // Ship sourcemaps so Lighthouse's valid-source-maps audit passes.
      sourcemap: true,
    },
  },
})
