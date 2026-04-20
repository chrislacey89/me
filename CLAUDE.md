# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (enforced via `preinstall: only-allow pnpm`).

```bash
pnpm dev          # astro dev server
pnpm build        # production build (output adapter: @astrojs/vercel)
pnpm preview      # preview the production build
pnpm check        # biome check --write . (lint + format, writes fixes)
pnpm lint         # biome lint only
pnpm format       # biome format --write
```

There is no test runner configured. `lefthook.yml` runs `biome check --write` on staged JS/TS/Astro/JSON on pre-commit; see the note in that file about adding a pre-push typecheck/test hook once scripts exist.

## Architecture

Astro 5 MPA, Tailwind 4 (via Vite plugin, no separate config file — tokens live in CSS), Vercel adapter, React 19 available for islands. Most pages are static; one endpoint is SSR.

### Routing & content

- `src/pages/` — file-based routes. Top-level: `index`, `about`, `contact`, `projects` (index) + `projects/[slug]`, `writing/index` + `writing/[...slug]`, `404`.
- `src/content/essays/` — Astro content collection defined in `src/content.config.ts` (glob loader, Zod schema: `title`, `description`, `pubDate`, optional `updatedDate`, `draft`). `writing/[...slug].astro` renders these.
- `src/pages/api/og.png.ts` — **SSR endpoint** (`export const prerender = false`) that generates the OG image at request time via `@vercel/og`. Fonts are read synchronously from `public/fonts` as WOFF (Satori doesn't accept WOFF2). Brand colors in that file are mirrored from the `@theme` tokens in `src/styles/global.css` — keep them in sync.
- `src/data/` — hand-authored content: `about.json`, `contact.json`, `home.json`, and `projects.ts` (typed, imports `ImageMetadata` assets). `projects.ts` is the source of truth for the projects index and `[slug]` detail pages.

### Layout, fonts, and prefetch strategy

`src/layouts/BaseLayout.astro` is the only layout. Several performance choices are load-bearing and easy to break:

- **Fonts are self-hosted** in `public/fonts/` (Switzer, Source Serif 4 variable, IBM Plex Mono). Critical faces are `<link rel="preload">`'d from `BaseLayout` and declared with matching `@font-face` URLs in `src/styles/global.css`. If you rename a font file, update both places or you'll lose the preload hint.
- **`preloadImages` prop on `BaseLayout`** lets a page emit responsive image preloads for above-the-fold or high-intent next-route hero images. Use it; don't invent a parallel mechanism.
- **Prefetch + Speculation Rules.** `astro.config.mjs` sets `prefetch: { prefetchAll: true, defaultStrategy: 'load' }`. `BaseLayout` also injects a `<script type="speculationrules">` that prerenders same-origin links (excluding `/api/*` and `/resume.pdf`) with `moderate` eagerness. Astro handles route HTML; speculation rules warm subresources.
- **Theme flash guard.** An inline `is:inline` script in `<head>` reads `localStorage['cl-theme']` and sets `data-theme` before paint. Don't move this below the first render or the theme flashes.

### Styling

Tailwind v4 with tokens/utilities defined in `src/styles/global.css` via `@theme`. There is no `tailwind.config.*` — edit the CSS. Brand palette names (Ink Well, Legal Pad, Terracotta Signal, Forest Floor, Terminal Green) are canonical; see `brand/chris-lacey-brand-storyboard.md` for usage rules.

### Project detail pages

`src/pages/projects/[slug].astro` uses `src/data/projects.ts` (typed `LeadProject` / `SupportingProject`) plus `src/lib/project-image.ts`, which exports `projectDetailImageConfig` — a shared widths/sizes/quality config used to keep `<Image>` output consistent across the index card and detail hero. Change it in one place.

## Conventions

- **Biome** (not Prettier/ESLint): single quotes, no semicolons, 2-space indent, 100-col width, JSON without trailing commas. `.astro` files have `noUnusedVariables` / `noUnusedImports` disabled (frontmatter imports often look unused to the linter).
- **TypeScript** extends `astro/tsconfigs/strict`.
- Root-level `*.png` / `*.jpg` / `*.jpeg` are gitignored — they're agent verification screenshots. Real assets go in `src/assets/` or `public/`.

## Claude Code hooks

`.claude/settings.json` wires up three hooks from `.claude/hooks/`:

- `enforce-classification.sh` — PreToolUse gate on Write/Edit (TDD classification).
- `block-dangerous-git.sh` — PreToolUse gate on Bash.
- `quality-gate.sh` — PostToolUse on Write/Edit.

Pipeline markers (`.claude/.tdd-active`, `.tdd-skipped`, `.ralph-checked`) are gitignored; don't commit them.

## Brand & writing voice

`brand/chris-lacey-brand-storyboard.md` defines voice, palette, and "load-bearing minimalism" thesis. `brand/writing-guide.md` has copy rules. When writing user-facing copy (site text, essay front matter, OG output), follow these — not generic marketing defaults.
