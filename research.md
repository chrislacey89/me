# Research: Personal Site Brand Redesign

**Date:** 2026-04-13
**Depth:** STANDARD
**Domain:** Astro 5 marketing site / brand system implementation
**Confidence:** HIGH (framework + tooling); MEDIUM (font licensing, audited via reputation not direct doc fetch)
**Constraints from shape:** 🔒 Astro stays. Light-mode only (Legal Pad default). Free fonts only, Inter excluded. Single cohesive PRD. Anti-brand list is a hard filter (no gradients, glass, neon, purple, cursor effects, confetti).

This document is the compressed handoff to `/write-a-prd`. It addresses the five first-priority research targets named in `brand/shape-handoff.md`.

---

## 📦 Version Check

| Dependency | Installed | Status | Notes |
|---|---|---|---|
| astro | 5.16.6 | ✅ Current | Content collections use Loader API; `<ClientRouter />` already wired in `BaseLayout.astro:115`. |
| @tailwindcss/vite + tailwindcss | 4.1.18 | ✅ Current | CSS-first `@theme` block already in use (`src/styles/global.css:8`). Brand tokens are a drop-in replacement. |
| react / react-dom | 19.2.3 | ✅ Current | No React components present in source — installed but unused. Candidate for removal. |
| @astrojs/vercel | 9.0.2 | ✅ Current | No action needed. |
| @fontsource/geist-sans, @fontsource/geist-mono | 5.x | 🔄 Replace | Will be removed in favour of Switzer (self-hosted) + serif (Fontsource) + IBM Plex Mono (Fontsource). |
| @astrojs/sitemap | 3.6.0 | ✅ Current | Will pick up new `/writing/*` routes automatically once they exist. |
| @vercel/og | 0.8.6 | ✅ Current | Existing `/api/og.png` route survives the redesign; only the rendered template needs a brand pass. |
| @biomejs/biome | 2.3.10 | ✅ Current | No action. |

**No version landmines.** The stack is contemporary; the brand work is replacement of values inside the existing system, not a framework migration.

🔄 **NOTABLE (Astro 4 → 5):** Content collections moved to the **Loader API** (`glob()`, `file()`). The legacy `defineCollection({ type: "content" })` shape is deprecated. The new writing surface MUST use `loader: glob({ pattern, base })` from the start. ([Astro v5 collections reference](https://docs.astro.build/en/guides/content-collections/) 🔗)

---

## 💡 Summary

Five targets, condensed:

1. **Typography:** **Switzer (display, self-hosted from Fontshare) · Source Serif 4 (serif, Fontsource) · IBM Plex Mono (mono, Fontsource).** All free, all defensible against the brand spec. One serif used in both body and display roles, deliberately — the brand is doing a lot of work to be restrained, and a second serif is the kind of move that, if it doesn't land perfectly, undoes the restraint.
2. **Astro 5 + View Transitions:** Already wired correctly via `<ClientRouter />`. The redesign keeps it. The custom `cinemaIn`/`cinemaOut` page transition in `BaseLayout.astro` should be retired in favour of the default fade — the cinematic blur is exactly the kind of flourish the shape doc rules out.
3. **Content collections for writing:** Use Astro 5's Loader API. One collection (`essays`), `glob()` over `src/content/essays/*.mdx`, Zod schema with title, description, pubDate, draft, optional updatedDate. Slug from filename. `/writing` lists, `/writing/[...slug]` renders. Designed to look intentional at four posts.
4. **Component surface audit:** Of 10 existing components, **3 retire outright** (`Confetti`, `CursorTracker`, `MagneticButton`), **2 retire in their current form** (`ScrollProgress`, `InteractiveSkillIcon`), **1 transforms** (`ProjectCard` — strip the 3D tilt + animated border + radial cursor gradient down to a static card with a Terracotta hover state), **1 keeps with simplification** (`SectionDivider` — flatten to a 1px Forest Floor rule), **1 keeps with copy/style only** (`MainNav` — strip teal/gradient nav-underline, keep the structure), and **2 keep in spirit** (`SkillIcon` and `ContactCard` — strip the cursor-tracking glow and magnetic pull on `ContactCard`, then restyle to brand). New primitives needed: `Hero`, `EvidenceStrip`, `NowSection`, `WritingIndex`, `WritingPost`, `ProjectClaim`, `PullQuote`, `Receipts`. Around 8 new files; ~6 deletions; ~3 substantive rewrites.
5. **Tailwind v4 palette:** Bind brand tokens directly into the existing `@theme` block. Replace the entire teal/dark-mode-coded token set with `--color-ink-well`, `--color-legal-pad`, `--color-terracotta`, `--color-forest-floor`, `--color-terminal-green`. Set `--color-background` and `--color-foreground` aliases so semantic usage doesn't depend on remembering the brand names. No dark-mode media queries. Delete `.gradient-heading`, `.gradient-hero`, `.headshot-wrapper` conic-gradient (anti-brand). The existing `radial-gradient` on `html` in `global.css:38-40` must go.

The downstream PRD work is content-heavy (writing the project pages, the about page, the home copy, the first essay) and visual-system heavy (typography setup, palette swap, simplification of components). It is **not** framework-heavy.

---

## 🚫 Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why | Docs |
|---|---|---|---|---|
| Loading typography | Custom `@font-face` for every face | `@fontsource-variable/*` for IBM Plex Mono and Source Serif 4 | One install, woff2 + subsetting handled, version-pinnable | [Fontsource](https://fontsource.org/) 🔗 |
| Loading the display face | npm package | Self-hosted Switzer woff2 from Fontshare download | No Fontsource package exists for Switzer; foundry distribution is the canonical source | [Fontshare: Switzer](https://www.fontshare.com/fonts/switzer) 🔗 |
| Markdown rendering for essays | A separate parser, custom rehype pipeline, an MDX renderer plug-in | Astro's built-in MDX integration via `@astrojs/mdx`, with content collection Loader API | Built-in, type-safe, supports component embedding for diagrams later | [Astro MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/) 🔗 |
| Reading-time, prev/next navigation, table of contents | Manual computation in each `.astro` page | Defer until the writing surface actually has 6+ posts. At launch (1–4 posts) these add visual noise without information. | "Motion earns its place by carrying information" applies to chrome too. | — |
| OG image generation | Static images per page | `@vercel/og` (already installed), updated to brand palette/typography | Already wired at `src/pages/api/og.png`; only the template needs a brand pass | [Vercel OG](https://vercel.com/docs/og-image-generation) 🔗 |
| RSS feed for `/writing` | Custom XML route | `@astrojs/rss` package | One file, well-documented, standard | [Astro RSS](https://docs.astro.build/en/recipes/rss/) 🔗 |

---

## 🪤 Common Pitfalls

### 🪤 Pitfall: Bringing forward "improved" versions of retired components
**What goes wrong:** During execution, a retired component (e.g. `MagneticButton`) gets re-introduced in a "tasteful" form because it feels small in isolation.
**Why it happens:** The shape doc's structural-signal #1 explicitly names this — "flourishes show capability" is a live instinct that yielded but didn't die.
**How to avoid:** Each component on the retire list is hard-deleted from the repo, not stubbed/commented out. The PRD should treat retirement as a one-way door for these components specifically.
**Warning signs:** Any PR that adds a `transition: transform` or `transform-style: preserve-3d` on a non-functional element. Any new use of `radial-gradient`, `conic-gradient`, or `backdrop-filter`.

### 🪤 Pitfall: Tailwind v4 dark-mode leftovers
**What goes wrong:** Tailwind v4's `dark:` variant continues to work even without explicit configuration — old `dark:` utility classes silently no-op against the new single-mode palette but pollute the markup.
**Why it happens:** Holdover from the current site, which is dark-default with no light counterpart.
**How to avoid:** Grep the codebase for `dark:` class prefixes during the rewrite. Either delete them (preferred) or convert to flat utility classes against the new palette. Light-mode-only is the design call; the markup should reflect it. ([Tailwind v4 dark mode reference](https://tailwindcss.com/docs/dark-mode) 🔗)
**Warning signs:** `dark:bg-*`, `dark:text-*` showing up in any new component.

### 🪤 Pitfall: View Transitions persisting retired DOM
**What goes wrong:** `transition:name="nav-underline"` (`MainNav.astro:185`) and `transition:name="section-divider"` (`SectionDivider.astro:13`) reference visual flourishes that are being simplified or removed. Stale `transition:name`s either no-op (silent) or animate residual elements (loud).
**Why it happens:** View Transitions opt in by name; orphaned names linger.
**How to avoid:** Audit every `transition:name=` in the codebase during the redesign. Keep only those that animate elements that survive into the new design.
**Warning signs:** Console warnings about missing transition pairs; visual "ghosts" of removed elements during navigation.

### 🪤 Pitfall: Writing surface that looks abandoned at 4 posts
**What goes wrong:** Year-grouped lists with one entry per year scream "I started a blog and stopped."
**Why it happens:** Designed for the desired-state count, not the launch-state count.
**How to avoid:** The writing index layout privileges the *individual entry* over the list. At 1–4 posts: each post gets its own annotated card with a one-sentence description; no year groupings until ≥5 posts span ≥2 years. Ship the index in a state that is self-coherent for 1 post.
**Warning signs:** A `<h2>2026</h2>` heading above a single `<li>`.

### 🪤 Pitfall: Berkeley-Mono-coded copy without Berkeley Mono
**What goes wrong:** Copy was written in `brand/chris-lacey-brand-storyboard.md` referencing Berkeley Mono. The site ships with IBM Plex Mono. Any future copy that says "Berkeley Mono on a tactile keyboard" as a desk object then describes typography on the site that the visitor can't see.
**Why it happens:** Brand storyboard is canon; implementation is a delivery constraint.
**How to avoid:** When writing the About page's "desk objects" section, either keep "Berkeley Mono on a tactile keyboard" (true of his actual desk, fine) OR pivot the typographic example to IBM Plex Mono. The brand storyboard does NOT need to change — it's an aspirational document. The site's *delivered* monospace just needs to be IBM Plex Mono and that's fine.

---

## Options Evaluated

### Target 1: Typography

#### Display slot

##### Switzer (recommended)
- **Fits constraints:** 🔒 Free; not Inter; Swiss/neo-grotesk; reads as Söhne-adjacent to non-typographers
- **Distribution:** Self-hosted woff2 (download from Fontshare). No npm package.
- **License:** Fontshare Service License — free for personal and commercial use; cannot be sublicensed/redistributed as a font product. Verify against the [licensing page](https://www.fontshare.com/licensing) 🔗 before shipping.
- **Weights needed:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold). Variable file also available; pick variable for a single woff2.
- **Pros:** Distinctive without being trendy. Aligns with shape doc's "deliberate · legible · load-bearing."
- **Cons:** Self-hosting overhead (~10 min: download, drop in `public/fonts/`, write `@font-face` block in `global.css`).

##### Hanken Grotesk (fallback)
- **Fits constraints:** 🔒 Free (OFL); not Inter; available via Fontsource (`@fontsource-variable/hanken-grotesk`)
- **Pros:** Zero-friction install; OFL license is unambiguous.
- **Cons:** Reads slightly more "neutral system font" than "intentional brand face." Less distinctive than Switzer.

##### General Sans (alternative)
- Same distribution model as Switzer (Fontshare, self-hosted). Slightly warmer than Switzer. Equally defensible. The choice between Switzer and General Sans is taste, not technical.

#### Body serif slot

##### Source Serif 4 (recommended, sole serif)
- **Distribution:** `@fontsource-variable/source-serif-4` ([Fontsource](https://fontsource.org/fonts/source-serif-4) 🔗)
- **License:** OFL.
- **Pros:** Variable, supports optical-size axis — same file behaves like a book serif at body sizes and tightens up at display sizes. Reads as "the teacher in the room" (per brand storyboard Frame 4). Originally designed by Adobe with low-optical-size variants for body text. ~50KB woff2.
- **Cons:** Less editorially distinctive than Fraunces. The hero thesis line will read as "a sentence the writer thinks matters" rather than "a typographic moment." That's the trade and it's the right one given the rest of the brand direction.
- **Application:** Body text on essays, About page prose, project narrative, the hero thesis line, AND per-project pull quotes. One serif, used in different sizes and weights, in different roles.

##### Fraunces (rejected — kept here for traceability)
- **Why considered:** Strong display serif with a real low-optical-size axis; was a candidate for *display-serif moments only* paired with Source Serif 4 for body.
- **Why rejected:** Two serifs is indulgent unless each is doing real work the other can't. With light mode, no flourishes, single Terracotta accent — the brand is already consolidating around restraint. A second serif undoes that consolidation if it isn't applied perfectly. Source Serif 4's optical-size axis covers the display use cases at acceptable quality.

#### Mono slot

##### IBM Plex Mono (recommended)
- **Distribution:** `@fontsource-variable/ibm-plex-mono` ([Fontsource](https://fontsource.org/fonts/ibm-plex-mono) 🔗)
- **License:** OFL.
- **Pros:** Free; OFL; designed by IBM for technical contexts; reads as "the proof is in the terminal" (Frame 4) without being precious; pairs well with both Switzer and Source Serif.
- **Cons:** None significant. The realistic alternative would be Berkeley Mono (paid, ~$75) which is out of scope.

### Target 2: Astro 5 + View Transitions idioms

#### Already correct
- `<ClientRouter />` is in `BaseLayout.astro:115`. ✅
- `transition:name` is used on nav items and project cards. ✅
- `prefetch: { prefetchAll: true, defaultStrategy: 'load' }` in `astro.config.mjs:15-18`. ✅ (Possibly aggressive for a small site — `'viewport'` is a saner default for a site with this many pages, but it's not load-bearing.)
- `astro:page-load` re-init for the mobile menu and dynamic active state in `MainNav.astro:499-507`. ✅

#### Should change
- The custom `pageTransition` object at `BaseLayout.astro:48-79` and the `cinemaIn`/`cinemaOut` keyframes at `BaseLayout.astro:227-280` produce a blurred, translated page transition. **Retire this entirely.** Use Astro's default fade (which is already what you get with `<ClientRouter />` and no override). The cinematic transition is the highest-profile flourish the shape doc rules out — it's "delight for its own sake, disconnected from content."
- The `staggerReveal` animation on `main > *` (`BaseLayout.astro:286-305`) staggers the first 5 children of `<main>` on every page load. **Retire** — same reason. The brand is "load-bearing minimalism," not "everything tastefully fades in."
- The iOS Safari workaround (`BaseLayout.astro:118-140`) that disables View Transitions on touch devices by setting `data-astro-reload` on every internal link **may no longer be necessary** in current Safari. Worth re-testing during execution; if it's now a non-issue, delete. If still required, keep — the failure mode is bad enough to warrant the workaround.

### Target 3: Content collections schema for writing

The writing surface ships with the redesign. One collection, MDX-capable from the start (so a future essay can embed a diagram or highlighted code block without a schema migration).

#### Collection definition

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const essays = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),         // one-sentence annotation, used in the index
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
})

export const collections = { essays }
```

✅ Verified against [Astro 5 content collections docs](https://docs.astro.build/en/guides/content-collections/) 🔗 — the `loader: glob({ pattern, base })` shape is the current Loader API. The legacy `type: "content"` form is deprecated in v5.

#### File layout

- `src/content/essays/2026-04-the-quiet-part.mdx`
- Filename pattern: `YYYY-MM-slug.mdx`. Filename becomes the slug (Astro infers).
- The leading date in the filename is for *file system ordering only* — it doesn't appear in the URL unless you want it to. Keep URLs slug-only: `/writing/the-quiet-part`.
- Files prefixed with `_` are excluded by the glob pattern. Useful for in-progress drafts.

#### Routes

- `src/pages/writing/index.astro` — the index page. Imports `getCollection('essays')`, filters out drafts in production, sorts by `pubDate desc`, renders the year-grouped list (only group by year when ≥5 posts span ≥2 years; otherwise flat list).
- `src/pages/writing/[...slug].astro` — the renderer. Standard Astro 5 pattern using `getStaticPaths()` over the collection.

#### MDX integration

Add `@astrojs/mdx` to dependencies. One-line addition to `astro.config.mjs` integrations array. Cost: small bundle increase, only loaded for pages that actually use MDX. Worth it for the optionality.

🔄 **NOTE:** Astro 5 puts the config file at `src/content.config.ts`, not the older `src/content/config.ts`. Both work in v5 but `src/content.config.ts` is the documented path going forward. Use the new location.

### Target 4: Component surface audit

| Component | Verdict | Action | Rationale |
|---|---|---|---|
| `Confetti.astro` | 🔥 Retire | Delete file. Remove import + render in `BaseLayout.astro:7,150`. Remove `triggerConfetti` references in konami code at `BaseLayout.astro:188-191`. Remove from contact form success state. | Anti-brand. Shape doc explicit. |
| `CursorTracker.astro` | 🔥 Retire | Delete file. Remove import + render in `BaseLayout.astro:8,144`. | Anti-brand. Shape doc explicit. |
| `MagneticButton.astro` | 🔥 Retire | Delete file. Audit any usage. | Anti-brand. Shape doc explicit. |
| `ScrollProgress.astro` | 🔥 Retire (or simplify) | Default: delete + remove from `BaseLayout.astro:9,143`. **Optional:** if kept on long-form essays only, simplify to a 1px solid Forest Floor rule (no glow, no animation). Lean toward delete. | Shape doc allows the simplified version on long-form only; the safe default at launch is to ship without it. |
| `InteractiveSkillIcon.astro` | 🔄 Transform | Replace bounce/tilt/glow logic with a static `SkillIcon`-equivalent. Berkeley-Mono-style label (IBM Plex Mono in our delivered case) underneath. Single Terracotta hover state on the icon container. | Shape doc: "static grid, Berkeley Mono labels, Terracotta hover color only — no motion." |
| `SectionDivider.astro` | 🔄 Transform | Strip the gradient + pulse-glow. Replace with a 1px Forest Floor rule with appropriate vertical margin. | Shape doc: "Keep if a thin rule. Retire if motion." Currently has motion; flatten. |
| `MainNav.astro` | 🔄 Keep + restyle | Keep the structure (mobile overlay logic is sound, hamburger is sound, `astro:page-load` re-init pattern is sound). **Retire**: teal hover color (`#2dd4bf`), `nav-underline` view transition spring animation (`global.css:172-203`), backdrop-blur background (`MainNav.astro:90-94`), gradient mobile-menu accent (`MainNav.astro:349-363`). **Replace with**: single Terracotta active-state mark (could be the only Terracotta on the home page, per shape doc), Legal Pad solid background, Ink Well type. | Most expensive component to throw away; the underlying logic is good. |
| `ProjectCard.astro` | 🔄 Transform (heavy) | Strip: 3D tilt, perspective, animated conic-gradient border, radial cursor-tracking gradient, all `whimsy-utils` imports, the entire `<script>` block. Keep: `Image` integration, `transition:name` for view transitions to project detail page, the link wrapper, the basic content layout. New visual: bordered card on Legal Pad background with Ink Well type and a Terracotta hover state for the title. | Shape doc on project pages: "how I think" structure replaces "what I built." The card itself should fade into the background — the *content* is the brand. |
| `ContactCard.astro` | 🔄 Transform | Strip: cursor-tracking glow, magnetic content pull, glow color per icon, all whimsy-utils animation. Keep: external/internal link distinction, accessible label/icon pattern. New visual: simple bordered card or even just a typeset list. Brand-storyboard-aligned: "Quiet contact line." | Same logic as `ProjectCard`. |
| `SkillIcon.astro` | ✅ Keep | Already a static `<img>`. No changes needed beyond restyling its container (which lives in `InteractiveSkillIcon`). | Already brand-compatible. |

#### New primitives needed

| Component | Purpose |
|---|---|
| `Hero.astro` | Home page hero — name, role line, serif thesis, mono availability line, single Terracotta accent. |
| `EvidenceStrip.astro` | Below-the-fold home strip of 3 hand-picked lead projects. |
| `NowSection.astro` | Dated `/now` section on home. |
| `WritingIndex.astro` | Renders the essay index. Switches between flat-list and year-grouped layouts based on post count. |
| `WritingPostLayout.astro` | The reading layout for a single essay. Source Serif body. Generous measure (~65ch). Optional 1px scroll-progress bar (per shape doc). |
| `ProjectClaim.astro` | The serif one-sentence claim at the top of a project page. |
| `PullQuote.astro` | The single Terracotta-colored serif pull quote per project page. |
| `Receipts.astro` | The mono-typed footer block on project pages: repo, live, writeup, key commit. |

Roughly: **3 hard deletes**, **3 transforms**, **2 simplifications**, **1 restyle**, **1 keep**, **8 new files**.

### Target 5: Tailwind v4 palette implementation (light mode only)

Tailwind v4 uses CSS-first configuration via the `@theme` block. The existing `src/styles/global.css:8-30` already does this — the brand work is replacing the values inside it.

#### Replacement `@theme` block

```css
@theme {
  /* Brand palette */
  --color-ink-well: #0B1221;
  --color-legal-pad: #F4EEE1;
  --color-terracotta: #C1502E;
  --color-forest-floor: #2F5D50;
  --color-terminal-green: #7AE582;

  /* Semantic aliases — use these in components */
  --color-background: var(--color-legal-pad);
  --color-foreground: var(--color-ink-well);
  --color-muted: rgba(11, 18, 33, 0.6);          /* Ink Well at 60% on Legal Pad */
  --color-rule: rgba(47, 93, 80, 0.25);          /* Forest Floor, low alpha */
  --color-accent: var(--color-terracotta);
  --color-confidence: var(--color-terminal-green);

  /* Typography */
  --font-display: "Switzer", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Source Serif 4", ui-serif, Georgia, serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  /* Sans-serif default for chrome (Switzer doubles as both display and ui) */
  --font-sans: var(--font-display);
}
```

#### Things to delete from `global.css`

- All of the `--color-primary-*` ramp (lines 14-23) — teal is gone from the brand.
- `--color-background-dark`, `--color-card-dark`, `--color-text-muted`, `--color-text-muted-light` (lines 26-29) — dark-mode tokens, replaced by light-mode semantic aliases above.
- The `radial-gradient` background on `html` (lines 38-40) — anti-brand.
- `.gradient-heading`, `.gradient-hero`, `.headshot-wrapper` conic-gradient (lines 209-273) — anti-brand.
- `nav-underline` keyframes (lines 172-203) — the redesigned MainNav should use a static Terracotta active mark, not a spring-animated underline.
- The `.reveal-*` animation classes (lines 84-147) — they exist to support the global staggered-reveal flourish that's being retired.

#### Things to keep

- `:focus-visible` outline rule (lines 62-65) — accessibility, restyle to use `--color-accent` instead of teal.
- `prefers-reduced-motion` block (lines 68-77) — accessibility, structurally unchanged.
- `.sr-only` utility (lines 49-59).

#### Light-only enforcement

Do NOT add a `@media (prefers-color-scheme: dark)` override in this iteration. Light mode is the brand. If/when dark mode is revisited, it gets its own design pass (Ink Well bg / Legal Pad type per shape doc's research target #5 note), not an automatic OS-driven flip.

Grep for `dark:` Tailwind utilities during the rewrite and convert/delete them. Don't leave dead `dark:` classes in markup.

---

## 💡 Recommended Approach (consolidated)

For the PRD to slice against:

1. **Stack stays** (Astro 5.16, Tailwind v4, React 19 — though React is unused and could be removed in a separate cleanup commit). Add `@astrojs/mdx` and `@astrojs/rss`.
2. **Typography:** Switzer (self-host) + Source Serif 4 (Fontsource) + IBM Plex Mono (Fontsource). One serif, used in both body and display roles via the optical-size axis. Drop the Geist Fontsource packages.
3. **Palette:** New `@theme` block with brand tokens + semantic aliases. Light mode only. Delete teal, gradients, dark-mode tokens.
4. **Components:** Delete 3, transform 3, simplify 2, restyle 1, build 8 new primitives. The expensive ones to get right are `Hero` and `WritingPostLayout` because they set the typographic system in front of a reader for the first time.
5. **Writing surface:** Single `essays` collection via Loader API. `glob()` over `src/content/essays/*.mdx` with Zod schema. MDX-capable from launch. Index layout coherent at 1 post.
6. **View Transitions:** Keep `<ClientRouter />`; delete the cinema/blur custom transition; delete the global `staggerReveal`; audit and clean up orphaned `transition:name`s.

🔄 **Note for reviewer:** The recommended approach assumes Astro 5's content collection Loader API (`glob()` from `astro/loaders`). If for any reason the project is downgraded to Astro 4, the writing collection definition needs to revert to `defineCollection({ type: "content", schema })`. Currently a non-issue.

---

## Relevant Existing Code

- `src/styles/global.css` — sole CSS file; `@theme` block here, brand tokens replace existing teal-coded values. Many `.reveal-*`, `.gradient-*` classes here will be deleted.
- `src/layouts/BaseLayout.astro` — imports retired components (`Confetti`, `CursorTracker`, `ScrollProgress`); custom `pageTransition` object and `cinemaIn`/`cinemaOut` keyframes are the most prominent flourishes to retire. Konami easter egg + confetti at lines 152-222 also retires.
- `src/components/MainNav.astro` — keep structure, restyle palette, drop the `nav-underline` view transition spring animation.
- `src/components/ProjectCard.astro` — keep `Image` + `transition:name` integration; delete the entire `<script>` block and the 3D/gradient styles.
- `src/components/ContactCard.astro` — same surgery as `ProjectCard`.
- `src/components/InteractiveSkillIcon.astro` — replace with a static composition; `SkillIcon.astro` survives untouched.
- `src/components/SectionDivider.astro` — flatten to 1px rule.
- `src/components/Confetti.astro`, `CursorTracker.astro`, `MagneticButton.astro`, `ScrollProgress.astro` — delete.
- `src/scripts/whimsy-utils.ts`, `animation-config.ts` — once `ProjectCard`, `ContactCard`, `InteractiveSkillIcon` no longer import them, both files can be deleted (verify no other imports first).
- `src/data/{home,about,projects,contact}.json` — content moves into Astro components and (for essays) MDX files; JSON is a reasonable shape for static data but consider whether the home-page content earns a JSON file vs. living inline in the page.
- `src/pages/api/og.png.ts` (or similar `@vercel/og` route) — template needs a brand pass; structurally unchanged.
- `astro.config.mjs` — add `mdx()` to `integrations`; consider switching `prefetch.defaultStrategy` from `'load'` to `'viewport'`.

---

## 🔗 Sources

**✅ Verified (official docs, matches installed version):**
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) — Loader API, `glob()`, Zod schema, `src/content.config.ts` location
- [Astro View Transitions / ClientRouter](https://docs.astro.build/en/guides/view-transitions/) — already in use; default fade is correct behaviour
- [Astro MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/) — `@astrojs/mdx`
- [Astro RSS recipe](https://docs.astro.build/en/recipes/rss/) — `@astrojs/rss` for the writing feed
- [Tailwind v4 Theme docs](https://tailwindcss.com/docs/theme) — `@theme` CSS-first configuration
- [Tailwind v4 dark mode reference](https://tailwindcss.com/docs/dark-mode) — confirms light-mode-only path
- [Fontsource: Source Serif 4](https://fontsource.org/fonts/source-serif-4) — OFL, variable, optical-size axis
- [Fontsource: IBM Plex Mono](https://fontsource.org/fonts/ibm-plex-mono) — OFL, variable
- [Vercel OG documentation](https://vercel.com/docs/og-image-generation)

**⚠️ Partially verified (could not fetch primary doc; verified by reputation/community consensus):**
- [Fontshare: Switzer](https://www.fontshare.com/fonts/switzer) — JS-only site, page would not render to text in this session. Switzer's Fontshare Service License is widely documented as permitting free personal and commercial use, including web embedding/self-hosting; restriction is on redistribution as a font product. **Confirm by reading the licensing page directly before shipping.**
- [Fontshare licensing](https://www.fontshare.com/licensing) — same caveat.

**Internal references:**
- `brand/chris-lacey-brand-storyboard.md` — canonical brand definition (read in full).
- `brand/shape-handoff.md` — feeds this document.
