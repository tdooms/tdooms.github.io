# tdooms.github.io

Personal research website: Astro 7 generates static HTML, Svelte 5 handles the eigenvector demo and Atlas, and Tailwind 4 with DaisyUI 5 supplies styling. Bun manages dependencies; Node.js 22.19+ runs Astro and the checks. GitHub Actions deploys to GitHub Pages after both build and browser checks pass.

Keep project guidance in this file. Do not commit review logs, local agent settings, credentials, or unpublished drafts. An underscore excludes content from the site; it does not make a tracked file private. Use GitHub's noreply email for commits. Check the commit and built output before publishing.

## Architecture

- Use normal links between static pages. Hover prefetch remains enabled; no client-side page router is needed.
- Atlas owns `/bae/`. Its small navigation module stores `?composite=` and `?q=` in browser history. Composite links must work when copied or opened in another tab. Back/Forward must preserve the current search and selected view.
- `Explorer.svelte` owns fetching and error states. It cancels requests for an abandoned view and passes typed data to components. Composite code and vocabulary load on first selection. Only HTTP 404 means an optional cluster annotation is absent.
- The Atlas HTML preloads the three shared index files through the same URL builder as Explorer, and supplies a loading fallback before hydration. KaTeX loads with the first equation; share its in-flight promise across instances so WebKit does not duplicate the download.
- Arrow decoding and coordinate conversion live in `bae/lib/arrow.ts` and `manifold.ts`. Validate the transport boundary; never fill missing scientific data with zeros.
- Validate every context token against the vocabulary before exposing a composite. Renderers consume the verified data; they must not discover missing tokens after the loading error boundary.
- `Manifold.svelte` owns a Three.js scene for its current points, pauses it while hidden, and disposes it on replacement. Custom shaders must convert linear colours to the renderer's output colour space. Charts import only the ECharts features they use.
- `tsconfig.json` owns import aliases. Imported Atlas code is maintained here and follows the same type and formatting checks as the rest of the site.

## Styling and content

`src/assets/app.css` owns the Clay + Teal palette through DaisyUI semantic tokens. Use `base-*`, `base-content`, `primary`, and `secondary`; avoid hardcoded surface/text grays that break dark mode. Override the existing tokens instead of adding a parallel palette.

Light is the default. The manual toggle persists to localStorage, restores before paint, and resynchronizes on native `pageshow`. Atlas canvas renderers subscribe to the shared theme store because CSS cannot repaint a canvas.

Layout owns the global CSS and KaTeX stylesheet. Avoid importing those styles again in islands. Keep interactive demos lazy with `client:visible`; Atlas is the full-page `client:only` exception.

Small screens expose every Atlas panel through native buttons. Use native popovers for explanations and keep scrolling regions keyboard reachable. Honor reduced motion in CSS and canvas renderers; automatic rotation can be explicitly enabled by the visitor.

Keep citations available on phones. Blog posts use icon-only home links back to `/#blog`; the homepage section is the only blog listing. Keep the page structure small. Atlas return links preserve the search.

Explanation cards open on desktop hover as well as touch and keyboard activation. Position them before their first visible paint, including after viewport changes. Keep them readable while the pointer moves into the card, and preserve Escape and outside-click dismissal.

Overview dot tooltips use a consistent width and stay above their point, constrained at plot edges. Avoid automatic side switching and animated movement between unrelated marks.

Personal styling belongs in the existing photos, writing and Clay + Teal details. Keep figures still and hover movements small. Do not add an animation library for decorative effects.

Keep the introduction conversational and curious; avoid forceful metaphors such as "pry it out."

Keep Google Analytics and its deferred loading; Thomas uses it.

- Blogs: `src/content/blogs/*.mdx`; an initial underscore excludes drafts. Slugs are single words.
- Papers: `src/content/papers/<id>/metadata.toml` plus `content.mdx`. Paper bodies start at h2; the page supplies h1.
- Titles and headings use sentence case. Paper `shortTitle` uses title case for cards and page headings. Descriptions are one sentence ending in a period, 80–91 characters.
- Preserve published BibTeX and author forms. Use one display name per author; BibTeX may differ.
- News lives in TOML. `**bold**` emphasizes the named thing announced, not the verb. Titles have no trailing period.
- External links open in a new tab with `rel="noopener noreferrer"`. Astro components use an explicit external flag; MDX gets these attributes from the configured rehype plugin.

## Verification

```bash
bun install --frozen-lockfile
bunx playwright install chromium
bun run dev
bun run check:ci
```

`check:ci` formats, checks Astro and Svelte/TypeScript, runs the static-link checker fixtures, builds once, validates built links/fragments, and runs Playwright against that output. Standalone `check:test` builds before testing.

Use `bunx prettier --write <files>` for scoped formatting. Do not weaken a check to make a change pass. Static checks cover all maintained source, including Atlas.

Scope browser selectors to the intended component: a paper card and a news item on the home page can share the same link destination. When checking tooltip geometry, wait for the newly hovered datum's content first; the previous card can remain briefly visible.

For camera-motion checks, compare rendered canvas pixels; element screenshots also capture overlaid controls and their focus animations. Keep keyboard focus within Atlas content after view navigation, and preserve an input that the visitor is typing in while data loads. Camera letter keys belong only to the focused plot.

Playwright runs Chromium locally. CI also runs Firefox and WebKit; headed Firefox uses Xvfb for software WebGL. Atlas fixtures protect behavior without a remote dataset, and separate live-data/external-link smoke tests verify published resources. Those network checks can fail when an external service is unavailable.

`bun run perf` builds and runs Lighthouse over every generated page, three desktop runs each. The budgets are owned by `lighthouse.config.json`; reports go to `.lighthouseci/`. The best value per metric preserves the previous Lighthouse CI aggregation; missing measurements fail. Run timing benchmarks on an idle host. `node scripts/perf.mjs / /bae/` checks a smaller batch against the existing build. `bun run audit` combines the functional checks and Lighthouse. A successful build does not establish that performance budgets passed.

After changing dependencies or Vite configuration, restart an active dev server if it reports stale optimized dependencies. Production builds are checked separately.
