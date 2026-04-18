---
date: 2026-04-17
category: ui-patterns
problem_type: view-transition destination image cache miss
components: [ProjectCard.astro, pages/projects/[slug].astro, lib/project-image.ts]
technologies: [Astro view transitions, Astro Image pipeline, getImage, link rel=preload]
severity: medium
volatility: stable
---

# Grid → detail view-transition flashes on first click because the destination image isn't cached

## Problem

On the first card → detail view transition of a session, the detail-page
hero image flashes in late (or renders as an empty box during the morph
and pops to visible when the transition ends). The cards page and the
detail page request **different srcset widths** for the same source
image, so the destination variant has never been fetched when the
morph begins.

## Context

Building the lead-project card ↔ detail morph (PR #21). The card's
`<Image>` uses `widths={[500, 800, 1100, 1400]}` with
`sizes="(min-width: 1024px) 400px, ..."`; at 2× desktop the browser
picks `w=800`. The detail page's `<Image>` uses
`widths={[500, 800, 1100, 1400, 1800]}` with
`sizes="(min-width: 768px) 704px, 100vw"`; at 2× desktop the browser
picks `w=1800`. The two URLs are different cache entries. Even though
both pages render the same logical image, clicking from card to detail
forces a fresh network request for the larger variant mid-morph.

## Symptoms

- During the first `/` or `/projects` → `/projects/<slug>` morph of a
  session, the hex/tile artwork is absent at capture time and pops in
  after the transition settles.
- Subsequent clicks to the same project's detail page morph cleanly —
  the first click warmed the cache.
- `currentSrc` on the detail image confirms a different `w=` parameter
  than whatever the card was loading.
- Chromium DevTools Network panel shows a high-priority image request
  for `/_image?…&w=1800…` starting only after the click, racing the
  view-transition animation.

## Root Cause

Astro's image pipeline generates a distinct URL per unique
(src, width, format, quality) tuple. Any two `<Image>` components with
different `widths` props produce different URLs for the same source
file. The browser treats them as independent cache entries. A view
transition captures the new page's DOM **immediately after** the Astro
`ClientRouter` swap; if the destination `<img>` has not yet decoded
bytes, its `::view-transition-new` snapshot is empty.

Two independent conditions contribute:

1. **URL divergence between source and destination.** Unavoidable
   whenever the card and detail presentations sensibly differ in size.
2. **No prefetch of the destination variant.** Astro's `ClientRouter`
   prefetches HTML on hover but does not prefetch image assets
   referenced inside the HTML.

## Learning Level

- **Level:** Pattern. Applies to *any* grid → detail morph with
  responsive images and different rendered sizes (project cards, blog
  post cards, team grid → bio page, product grid → product detail).
- **Feedback loop:** Cache-warmth is inherently session-local, so QA
  almost always hits the warm-cache case (the test click is the second
  or third visit to that detail page). The defect only reliably
  reproduces on a cold session — which is the real user's common case.
  A staging deploy that wasn't tested with fresh incognito windows will
  ship this defect undetected.

## Solution

Centralize the destination image config in one module, then use it for
both the detail-page render and a source-page `<link rel="preload">`
call. Matching widths, sizes, format, and quality guarantees the
preload URL equals the URL the detail `<Image>` will select, so the
browser cache hits on navigation.

**Shared config** (`src/lib/project-image.ts`):

```typescript
export const projectDetailImageConfig = {
  widths: [500, 800, 1100, 1400, 1800],
  sizes: '(min-width: 768px) 704px, 100vw',
  width: 1800,
  height: 1012,
  quality: 90,
}
```

**Detail page** (`pages/projects/[slug].astro`):

```astro
---
import { projectDetailImageConfig } from '../../lib/project-image'
---
<Image
  src={project.image}
  alt={project.imageAlt ?? ''}
  {...projectDetailImageConfig}
  loading="eager"
  fetchpriority="high"
/>
```

**Source page** (`components/ProjectCard.astro`):

```astro
---
import { getImage } from 'astro:assets'
import { projectDetailImageConfig } from '../lib/project-image'

const shouldPreloadDetail = Boolean(imageSrc && href.startsWith('/projects/'))
const detailPreload = shouldPreloadDetail
  ? await getImage({ src: imageSrc!, ...projectDetailImageConfig })
  : null
---

<article …>
  {detailPreload?.srcSet.attribute && (
    <link
      rel="preload"
      as="image"
      imagesrcset={detailPreload.srcSet.attribute}
      imagesizes={projectDetailImageConfig.sizes}
      fetchpriority="low"
    />
  )}
  …
</article>
```

Why these specific choices:

- `fetchpriority="low"` on the preload so it doesn't compete with
  above-the-fold rendering.
- `fetchpriority="high"` + `loading="eager"` on the destination so a
  cold fetch (e.g., cache eviction before click) still unblocks fast.
- `getImage()` called in the Astro frontmatter (build time for static
  pages) produces the same URL the destination `<Image>` will emit,
  because both routes resolve through the same Astro image service.
- Gated by `href.startsWith('/projects/')` so supporting-work cards
  (external links) don't emit spurious preloads.
- `<link rel="preload">` is body-ok per the HTML spec, so emitting it
  inside the card's `<article>` avoids threading a prop through
  `BaseLayout`.

## Prevention

**Code-level.**

1. Whenever shipping a new grid → detail morph with responsive images:
   centralize the detail image config in a shared module, and emit a
   preload link from the source card that spreads the same config.
2. Treat "does the preload URL equal the render URL" as a *mandatory*
   verification step. `getComputedStyle(img).src` on the detail page
   should match the `imagesrcset` entry the browser selected from the
   source page's preload link. If they don't match, the cache will
   miss and the whole mechanism is inert. Chromium will warn in the
   console ("was preloaded … but not used") when they mismatch.
3. Consider (but don't blindly apply) a linter rule that flags two
   `<Image>` components of the same `src` with different `widths` / `quality`
   as a hotspot for this pattern.

**Process-level.**

- `/execute` Tier 3 (Behavioral Verification) for any view-transition
  slice should include **cold-cache verification**: exercise the
  transition in a fresh incognito window or with DevTools network
  disk-cache disabled, not just in the dev server where requests are
  sticky.
- `/write-a-prd`'s omitted activities scan for a "grid → detail morph"
  feature should pre-list three verification gates:
  1. Pairing: every element with `transition:name` has a counterpart on
     both sides.
  2. Z-order: sibling `::view-transition-group` stacking doesn't clip
     the morphing pseudo. See
     `view-transition-sibling-grid-z-order-2026-04-17.md`.
  3. Destination-asset cache warmth: preload responsive variants if
     the render widths differ between source and destination.

  Shipping a morph without verifying all three produces ship-then-patch
  iterations — which is exactly what happened on issue #16 (three
  defects across two PRs).

## Planning / Calibration Notes

- **What widened the work:** Issue #16 as originally written described
  only the pairing bug. Two additional defect classes (z-order, first-
  click flash) surfaced during verification and post-merge use — each
  of comparable cost to the original fix. Actuals: 1 PR (pairing) → 1
  bug-class discovered in QA → 1 PR (preload) → compound. Three
  distinct view-transition-on-a-grid defect classes per feature is the
  baseline to plan around, not one.
- **What tightened the work:** Once the preload mechanic was written
  once, it will be near-free to re-apply for future grids (writing
  index, future post listings). The shared-config-between-source-and-
  destination pattern generalizes.
- **Future planning adjustment:** `/write-a-prd` sessions that include
  "morph a grid item into a detail page" should emit a three-item
  verification checklist (above) and the scope estimate should absorb
  the preload mechanic as in-slice, not as a polish pass.

## Actuals Worth Reusing

- **Comparable future work:** Any `/writing` index → post detail morph,
  or supporting-grid → detail morph, if supporting projects ever get
  case study pages.
- **Reusable baseline:** ~30 LoC (one new shared config module, one
  `getImage()` call + `<link>` emission in the source card, `{...spread}`
  on the destination) plus the one-time verification sweep. Budget as
  part of the initial morph slice, not as a follow-up.

## Defect Classification

**Origin phase:** Specification error — the original issue specified
"the card image should morph into the detail hero" but did not name
the destination cache-warmth requirement. The implementation honored
the spec; the spec was incomplete.

**Fix type:** Correction — the defect (cache miss on destination URL)
is actually removed, not suppressed. The preload fetches the exact URL
the destination will request, so subsequent navigation can no longer
pay the mid-morph fetch cost.

## Key Decision

**Decision:** Centralize the destination image config in
`src/lib/project-image.ts` and have both the detail-page render and
the source-page preload spread it, rather than letting each page
maintain its own copy of `widths` / `sizes` / `quality`.

**Rationale:** If the two copies drift, the preload URL silently
mismatches the render URL, and the cache-warmth mechanism reverts to
inert without any visible error. Chromium's "preloaded but not used"
warning is easy to miss in a busy console. A single source of truth
makes drift impossible.

**Alternatives considered:**

- Inline the config at each call site (two copies) — rejected because
  of the silent-inertness failure mode.
- Prefetch on hover only (via JavaScript) — rejected because fast
  clicks and touch taps without hover still race the morph.
- `rel="prefetch"` instead of `rel="preload"` — prefetch is
  lower-priority and browser-idle; on a slow network the fetch might
  not complete before the user clicks. `preload` with
  `fetchpriority="low"` gives the browser the right intent: "do this,
  but not at the expense of above-the-fold rendering."

**Revisable:** Yes, if Astro's image pipeline ever gains automatic
destination-variant preloading for linked routes. Today (Astro 5.16)
this is not part of `ClientRouter`'s prefetch scope.

## Related

- GitHub issues: #16
- PRs: #21 (original morph fix), #23 (preload follow-up)
- Sibling doc: `view-transition-sibling-grid-z-order-2026-04-17.md` —
  the other defect class on the same morph
- Astro docs: `getImage()` from `astro:assets`; `<link rel="preload">`
  body placement per WHATWG HTML spec "body-ok" link types

## Shelf Life

Stable. Astro's image URL scheme (`/_image?href=…&w=…&q=…&f=…`) is
content-addressed and stable across Astro 4–5. The HTML spec's
`imagesrcset` / `imagesizes` on `<link rel="preload">` is widely
supported (Chrome 73+, Safari 17.2+, Firefox 115+).

Revisit if:

- Astro's `ClientRouter` gains automatic asset preload for linked
  routes — this solution becomes unnecessary.
- A refactor unifies card and detail rendered sizes (e.g., a hero page
  that uses the same-size image on both sides), in which case there's
  no URL divergence to preload past.
