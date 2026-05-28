// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import path from 'path'

import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

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
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
        "font-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", 'https://*.googletagmanager.com'],
      },
      styleDirective: {
        resources: ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
      },
    },
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [svelte(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@/': path.resolve('./src') + '/',
      },
    },
  },
})
