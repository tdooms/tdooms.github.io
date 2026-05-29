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
import { unified } from '@astrojs/markdown-remark'

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
    // Astro 6: pass plugins to `unified()` instead of the top-level
    // markdown.remarkPlugins / rehypePlugins (deprecated in 6.x).
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatex,
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      ],
    }),
  },
  integrations: [svelte(), mdx(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@/': path.resolve('./src') + '/',
        // SvelteKit-shaped imports from the verbatim bae frontend copy resolve
        // via these aliases. $lib points into the bae tree; $app/* point at
        // tiny shim modules that re-expose our query-params router under
        // SvelteKit's API names.
        $lib: path.resolve('./src/components/bae/lib'),
        '$app/state': path.resolve('./src/components/_bae-shim/app-state.ts'),
        '$app/paths': path.resolve('./src/components/_bae-shim/app-paths.ts'),
        '$app/navigation': path.resolve('./src/components/_bae-shim/app-navigation.ts'),
      },
    },
    build: {
      // Ship sourcemaps so Lighthouse's valid-source-maps audit passes.
      sourcemap: true,
    },
    optimizeDeps: {
      // Pre-bundle heavy deps at dev-server start so adding new imports of
      // them later doesn't trigger a mid-session re-optimization (which races
      // with in-flight browser requests and returns 504 Outdated Optimize Dep).
      include: ['apache-arrow', 'echarts', 'three', 'three/examples/jsm/controls/OrbitControls.js'],
    },
    define: {
      // Bae's `lib/data.ts` reads this to build the manifold-data root URL.
      // Bake in the R2 public bucket so we don't need a .env file for prod
      // or dev. Override on the command line (`VITE_DATA_URL=... bun run dev`)
      // to point at a local data server during data-format work.
      'import.meta.env.VITE_DATA_URL': JSON.stringify(
        'https://pub-d5f674c4bd644b7d93b17b2b68f31a22.r2.dev',
      ),
    },
  },
})
