# tdooms.github.io

Personal research website. Static Astro site, Svelte 5 islands for interactivity, Tailwind v4 + DaisyUI 5 for styling, MDX for long-form content. Built with Bun, deployed via GitHub Pages. Stack rationale and performance principles live in `garden-frontend` (mind-palace skill); this file is the project-specific orientation.

## Theme

Two themes shipped: `light` (default) and `dark` (manual toggle only, no auto-switch on prefers-color-scheme). The palette is **Clay + Teal** — a burnt-clay primary and a teal secondary, defined once per theme in [src/assets/app.css](src/assets/app.css):

```css
@plugin 'daisyui' {
  themes:
    light --default,
    dark;
}

@plugin 'daisyui/theme' {
  name: 'light';
  default: true;
  color-scheme: light;
  --color-primary: oklch(0.55 0.15 33); /* burnt clay / terracotta-red */
  --color-primary-content: oklch(0.98 0.015 45);
  --color-secondary: oklch(0.52 0.1 195); /* teal */
  --color-secondary-content: oklch(0.98 0.012 195);
}

@plugin 'daisyui/theme' {
  name: 'dark';
  color-scheme: dark;
  /* Raised lightness so the accents clear 4.5:1 on the dark base. */
  --color-primary: oklch(0.74 0.15 38);
  --color-primary-content: oklch(0.22 0.04 38);
  --color-secondary: oklch(0.75 0.11 195);
  --color-secondary-content: oklch(0.2 0.03 195);
}
```

Why hue ~33 and not pure orange: pure orange (hue ~50–60) collapses to mud/brown once darkened for text contrast, but a red-leaning clay keeps its warmth at the same lightness. Each theme raises or lowers lightness so every accent clears WCAG 4.5:1 for its text use. Visualisations diverge clay ↔ teal (positive ↔ negative) off the same two slots.

A sun/moon toggle sits top-right in [Navbar.astro](src/components/Navbar.astro) (and the bae InfoBar), implemented as a daisyUI `swap` wrapping a `theme-controller` checkbox. The checkbox itself is pure CSS, but it forgets on its own — a small inline script in [Layout.astro](src/layouts/Layout.astro) persists the choice to localStorage and restores it before first paint and on `astro:after-swap` (guarded by [tests/theme.spec.ts](tests/theme.spec.ts)).

The reasoning behind "override `--color-primary`, never fork into `--color-brand`" lives in `workshop-daisyui` (mind-palace skill). The `.hl` highlight class uses `color-mix(in oklch, var(--color-primary) 15%, transparent)` so it follows the theme automatically.

## Colour rules (daisyUI-first)

Every surface and text colour uses a daisyUI semantic token. Never hardcode Tailwind grays:

| Use                     | Class                            | Not               |
| ----------------------- | -------------------------------- | ----------------- |
| Card / page surface     | `bg-base-100`                    | `bg-white`        |
| Sunken surface          | `bg-base-200`                    | `bg-gray-50/100`  |
| Subtle border / divider | `bg-base-300` or `ring-base-300` | `bg-gray-200`     |
| Body text               | `text-base-content`              | `text-gray-900`   |
| Muted body text         | `text-base-content/85`           | `text-gray-700`   |
| Secondary text          | `text-base-content/75`           | `text-gray-600`   |
| Caption / metadata      | `text-base-content/70`           | `text-gray-500`   |
| Decorative low-contrast | `text-base-content/65`           | `text-gray-400`   |
| Brand accent            | `text-primary`, `bg-primary/N`   | hardcoded oranges |

Dark mode breaks silently the moment you hardcode `bg-white`. The toggle works because every component uses these tokens.

## Performance budgets

`bun run perf` runs Lighthouse CI over all pages and fails on regressions. Budgets live in [lighthouserc.json](lighthouserc.json):

| Metric               | Budget   | Severity |
| -------------------- | -------- | -------- |
| Performance score    | 1.0      | error    |
| Accessibility score  | 1.0      | error    |
| Best-practices score | 1.0      | error    |
| SEO score            | 1.0      | error    |
| LCP                  | ≤ 1000ms | error    |
| FCP                  | ≤ 700ms  | error    |
| TBT                  | ≤ 50ms   | error    |
| CLS                  | ≤ 0.01   | error    |
| Speed Index          | ≤ 700ms  | error    |
| Interactive          | ≤ 1000ms | error    |

Three runs per page (`numberOfRuns: 3`) averages out the simulator's noise. Sub-1s LCP is the hard floor: "more than a second isn't a pass." Reports go to `.lighthouseci/` (gitignored); `lhr-*.html` opens in a browser for the per-page breakdown.

Lighthouse runs locally only (`bun run perf` / `bun run audit`), not in GitHub Actions: shared CI runners have too much performance variance for millisecond-level budgets to assert reliably. CI ([.github/workflows/static.yml](.github/workflows/static.yml)) and the Stop hook run the deterministic gates (format, typecheck, build, links, Playwright).

Two render-blockers that historically tanked these numbers and are now gone:

- **Font Awesome CDN** → replaced with `astro-icon` + `@iconify-json/fa6-{solid,brands,regular}`. Icons are inline SVGs tree-shaken to only the ~20 actually used. Icon names use the iconify format (`fa6-solid:envelope`, `fa6-brands:github`), stored that way in TOML for the news / contact link data.
- **KaTeX CSS CDN** → self-hosted via `import 'katex/dist/katex.min.css'` in Layout.astro. The KaTeX npm package handles font self-hosting via Vite bundling.

Both moved from blocking external requests to bundled chunks. FCP dropped from ~800-900ms to ~270-510ms across the site.

## Demos live inside paper bodies

The `/demos/*` route is gone. Interactive components import inline in the relevant paper MDX:

```mdx
import Eigenvectors from '../../../components/Eigenvectors.svelte'

<Eigenvectors client:visible />
```

`client:visible` lazy-mounts when scrolled into view, so heavy islands don't ship on the initial page paint. Used in [src/content/papers/bilinear/content.mdx](src/content/papers/bilinear/content.mdx) (Eigenvectors). The one full-app exception is the bae Atlas, which owns the whole viewport at [/bae](src/pages/bae.astro) (`client:only`, `bleed` layout) rather than embedding in the paper body.

## Commands

All gates must pass green before a change is "done":

```bash
bun run dev              # local dev server (--force if Vite dep cache is stale)
bun run check:ci         # local equivalent of GitHub Actions build + test checks
bun run check:build      # format, typecheck, production build, internal links
bun run check:test       # Playwright regression suite
bun run perf             # build + Lighthouse CI with budgets
bun run audit            # check:ci plus Lighthouse
```

Format-fix: `bunx prettier --write <file>`. Never bypass with `--no-verify` or similar.

Dev-server 504s ("Outdated Optimize Dep"): editing `astro.config.mjs` / `tsconfig.json` (or a lockfile change) invalidates Vite's dep cache; the running dev session then 504s its pre-bundled modules and islands fail to hydrate ("[astro-island] Error hydrating …"). Restart the dev server — production builds are never affected, and `postinstall` clears the cache on every install (scripts/clean-vite-cache.mjs). The Astro dev toolbar is disabled in astro.config.mjs because its lazy-loaded chunks kept 504ing after every re-optimization even on healthy sessions.

## Conventions

- **Blogs**: MDX with frontmatter in `src/content/blogs/`. Slugs are single words (`tensors`, `tokenized`), no hyphens.
- **Papers**: one directory per paper in `src/content/papers/<id>/` holding `metadata.toml` + `content.mdx`. Same single-word slug rule. Paper MDX bodies start at h2 (`##`); the `<h1>` is the paper title in the layout. Skipping h2 fails Lighthouse heading-order.
- **Copy style** (titles, descriptions, headings):
  - `title` and every MDX heading: sentence case ("Future work", not "Future Work"). Blog titles too.
  - `shortTitle`: Title Case — it acts as the paper's display name on cards and the page h1.
  - `description`: one sentence, sentence case, **always ends with a period**, 80–91 characters. 91 (the compositional paper) is the ceiling; the band keeps the home-page cards visually even.
  - News titles: headline style, no trailing period (`!` allowed); em-dash — never a comma splice — joins clauses.
  - `bibtex` blocks are the published record: never restyle their capitalization or author forms.
  - Author display names: one canonical form per person across all papers ("Jose Oramas"); the bibtex may differ.
- **News**: TOML in `src/content/news/`. Title is a single sentence with `**bold**` parts for emphasis (rendered in the primary clay). Highlight the named thing being announced (a paper, an org, a launch), never the verb describing what happened to it. Em-dash only as sentence punctuation, never as a title/description separator.
- **External links**: every external `<a>` opens in a new tab. In Astro components, gate `target="_blank" rel="noopener noreferrer"` on an explicit `external` flag. In MDX prose, `rehype-external-links` (configured in [astro.config.mjs](astro.config.mjs)) auto-injects the attributes.
- **No fork-the-palette**: see Theme above. Override `--color-primary`, don't add `--color-brand`.

## Pointers

- `garden-frontend` (mind-palace), stack and performance principles
- `workshop-daisyui` (mind-palace), DaisyUI 5 usage and theme rules
- `anthropics/skills/skills/frontend-design`, aesthetic taste
- `garden-writing-prose` (mind-palace), voice for prose in `content/`
