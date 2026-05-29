# tdooms.github.io

Personal research website. Static Astro site, Svelte 5 islands for interactivity, Tailwind v4 + DaisyUI 5 for styling, MDX for long-form content. Built with Bun, deployed via GitHub Pages. Stack rationale and performance principles live in `garden-frontend` (mind-palace skill); this file is the project-specific orientation.

## Theme

Two themes shipped: `light` (default) and `dark` (manual toggle only, no auto-switch on prefers-color-scheme). The brand colour is orange, defined once per theme in [src/assets/app.css](src/assets/app.css):

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
  --color-primary: oklch(55.3% 0.195 38.402); /* ~orange-700, contrast ≈ 5.0:1 on white */
  --color-primary-content: oklch(98% 0.016 73.684);
}

@plugin 'daisyui/theme' {
  name: 'dark';
  color-scheme: dark;
  --color-primary: oklch(
    70.5% 0.213 47.604
  ); /* orange-500 is the contrast-passing choice on dark */
  --color-primary-content: oklch(22% 0.05 47);
}
```

Why two oranges: orange-500 fails WCAG 4.5:1 on white but passes on dark; orange-700 passes on white but is muddy on dark. Each theme picks the contrast-passing shade.

A sun/moon toggle sits fixed top-right in [Layout.astro](src/layouts/Layout.astro), implemented as a daisyUI `swap-rotate` wrapping a `theme-controller` checkbox. Pure CSS, no JavaScript. The toggle persists across reloads via daisyUI's built-in localStorage handling.

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

Two render-blockers that historically tanked these numbers and are now gone:

- **Font Awesome CDN** → replaced with `astro-icon` + `@iconify-json/fa6-{solid,brands,regular}`. Icons are inline SVGs tree-shaken to only the ~20 actually used. Icon names use the iconify format (`fa6-solid:envelope`, `fa6-brands:github`), stored that way in TOML for the news / contact link data.
- **KaTeX CSS CDN** → self-hosted via `import 'katex/dist/katex.min.css'` in Layout.astro. The KaTeX npm package handles font self-hosting via Vite bundling.

Both moved from blocking external requests to bundled chunks. FCP dropped from ~800-900ms to ~270-510ms across the site.

## Demos live inside paper bodies

The `/demos/*` route is gone. Interactive components import inline in the relevant paper MDX:

```mdx
import Manifolds from '../../components/Manifolds.svelte'

## Explore the manifolds

<Manifolds client:visible samples={[...]} />
```

`client:visible` lazy-mounts when scrolled into view, so three.js / apache-arrow don't ship on the initial page paint. Used in [src/content/papers/bae.mdx](src/content/papers/bae.mdx) (Manifolds) and [src/content/papers/bilinear.mdx](src/content/papers/bilinear.mdx) (Eigenvectors).

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

## Conventions

- **Blogs**: MDX with frontmatter in `src/content/blogs/`. Slugs are single words (`tensors`, `tokenized`), no hyphens.
- **Papers**: TOML metadata + MDX body in `src/content/papers/`, paired by id. Same single-word slug rule. Paper MDX bodies start at `## `; the `<h1>` is the paper title in the layout. Skipping h2 fails Lighthouse heading-order.
- **News**: TOML in `src/content/news/`. Title is a single sentence with `**bold**` parts for emphasis (rendered in primary orange). Highlight the named thing being announced (a paper, an org, a launch), never the verb describing what happened to it. Em-dash only as sentence punctuation, never as a title/description separator.
- **External links**: every external `<a>` opens in a new tab. In Astro components, gate `target="_blank" rel="noopener noreferrer"` on an explicit `external` flag. In MDX prose, `rehype-external-links` (configured in [astro.config.mjs](astro.config.mjs)) auto-injects the attributes.
- **No fork-the-palette**: see Theme above. Override `--color-primary`, don't add `--color-brand`.

## Pointers

- `garden-frontend` (mind-palace), stack and performance principles
- `workshop-daisyui` (mind-palace), DaisyUI 5 usage and theme rules
- `anthropics/skills/skills/frontend-design`, aesthetic taste
- `garden-writing-prose` (mind-palace), voice for prose in `content/`
