# My Personal Website

Written in `astro.js`. Please steal, it's quite customizable.
I try to update this regularly.

## Development

This project uses [Bun](https://bun.sh) as runtime + package manager, and [Prettier](https://prettier.io) (with Astro/Svelte/Tailwind plugins) for formatting. Type-checking is via `astro check`. No Node or npm required.

Install Bun (one-time):

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

Install dependencies:

```bash
bun install
```

Run the dev server:

```bash
bun run dev
```

Format and typecheck:

```bash
bun run format        # write formatting fixes across the repo
bun run format:check  # verify formatting without writing (used in CI)
bun run typecheck     # astro check — types for .astro, .ts, .svelte
```

Update all dependencies to latest:

```bash
bunx npm-check-updates -u && bun install
```

## Deployment

```bash
bun run build
```

## External

A list of external references to this website that I should try to maintain.

```txt
Bilinear Autoencoder Paper: https://tdooms.github.io/demos/manifolds
Bilinear Autoencoder Poster: https://tdooms.github.io/research/bae
```
