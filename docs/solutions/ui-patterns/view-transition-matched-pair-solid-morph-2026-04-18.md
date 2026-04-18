---
date: 2026-04-18
category: ui-patterns
problem_type: view-transition matched-pair looks translucent mid-morph
components: [styles/global.css, ProjectCard.astro, pages/projects/[slug].astro]
technologies: [Astro view transitions, CSS view-transition-class, mix-blend-mode, ClientRouter]
severity: low
volatility: stable
---

# Matched-pair view-transition morph looks see-through mid-flight

## Problem

A shared-element view transition where both the old and new snapshots
render the *same source content* (e.g., a card image preloaded to match
the detail-page hero) still cross-fades by default. Because the UA
ships complementary fade-in + fade-out animations on the snapshots —
but without `mix-blend-mode: plus-lighter` when Astro's ClientRouter is
driving the transition — both snapshots sit at roughly 50% opacity at
midpoint. The rest of the page cross-fades *behind* the image, so the
morphing image looks translucent and you can see the destination page
text bleeding through it.

## Context

Building the card ↔ detail morph for lead projects (ProjectCard →
`/projects/<slug>`). The card image and detail hero use the same source
file, with the card pre-loading the detail page's srcset variant (see
`view-transition-destination-image-preload-2026-04-17.md`), so by click
time both sides would render an identical bitmap. Expected: the morph
looks like one solid image changing size and position. Actual: mid-flight
the image is visibly transparent — the old grid content and new detail
content both show through.

## Symptoms

- During a slowed view transition (or any transition on a slower
  machine) the morphing image appears see-through at ~30%–70% progress.
- Text from the outgoing page renders over/through the image.
- Symptom is most obvious when old and new sides are very different
  layouts — on back-nav the target grid shows through the detail hero
  shrinking back into a card slot.

## Root Cause

CSS view transitions composite the old snapshot and the new snapshot in
a single `::view-transition-image-pair` inside the group. The UA's
default root transition avoids the "translucent overlap" problem by
applying `mix-blend-mode: plus-lighter` alongside the complementary
fades — `plus-lighter` sums the alphas of the two overlapping surfaces,
so `1→0` + `0→1` = constant apparent opacity 1.

When Astro's `ClientRouter` applies its own `astroFadeIn/astroFadeOut`
keyframes to named elements with `transition:name`, the fade animations
fire but the accompanying `plus-lighter` blend mode is **not** applied
(the UA only applies it to the unnamed root transition). Result: the
matched pair looks translucent mid-flight even though the two snapshots
are visually identical and would look solid if their alphas were summed
instead of multiplied.

## Learning Level

- **Level:** Pattern. This is the second distinct failure mode in the
  same feature area (view-transition morphs between index and detail
  pages), after the z-order clipping captured in
  `view-transition-sibling-grid-z-order-2026-04-17.md`. Both have the
  same shape: *the default browser behavior contradicts author intent
  when a named morph is composited into a larger page transition.*
- **Feedback loop:** Missing feedback during `/execute`. The bug is
  imperceptible at full speed on a 1080p screen, invisible on a typical
  fast machine, and obvious only when the animation is slowed down.
  Regular QA misses it every time.

## Solution

Apply `mix-blend-mode: plus-lighter` to the old and new snapshots of
the matched pair. Do **not** try to suppress the fade with
`animation: none; opacity: 1` — that dead-ends against CSS's inability
to distinguish matched pairs from exit-only/entry-only groups.

```css
/* src/styles/global.css */
::view-transition-old(.project-image),
::view-transition-new(.project-image) {
  mix-blend-mode: plus-lighter;
}
```

The rule targets the CSS `view-transition-class`, which must be declared
on **both** the old and the new side — see Key Decision below. For
exit-only and entry-only groups (the non-clicked cards in the grid)
there is only one snapshot, so `plus-lighter` is a visual no-op and
those groups cross-fade with the page exactly as they did before.

## Prevention

**Code-level.** When a view-transition morph has both snapshots rendering
visually-identical source content (same image, same text, same color
block), add `mix-blend-mode: plus-lighter` to the pair by default. Do
this at the same time you add the `view-transition-class` that pairs
them — the two changes belong together.

**Process-level.** During `/execute` Tier 3 verification of any slice
that introduces a shared-element morph, slow the transition down and
take a mid-flight screenshot. The Playwright pattern that worked:

```js
await page.evaluate(() => {
  const a = document.querySelector('a[href="/destination"]');
  a.click();
  return new Promise(r => setTimeout(() => {
    document.getAnimations().forEach(an => an.pause());
    r();
  }, 2000));
});
await page.screenshot({ path: 'vt-mid.png' });
```

Pausing all animations via `document.getAnimations()` is more reliable
than `animation-duration: Ns !important` overrides, because Astro and
the UA may apply their own animations with higher specificity than a
class selector. For inspecting what actually runs, attach an
`animationstart` listener with `{ capture: true }` and read
`getComputedStyle(document.documentElement, e.pseudoElement)` —
`pseudo`, `animationName`, `zIndex`, `mixBlendMode`, and `opacity`
together are enough to diagnose any stacking or compositing issue
without guessing from source.

## Planning / Calibration Notes

- **What widened the work:** The original PRD for the grid→detail morph
  treated "the image morphs continuously" as one appetite unit. Three
  separate commits later added the z-order fix, the destination-image
  preload fix, and now the translucent-morph fix — each of comparable
  cost to the original morph itself. The shaped appetite was off by
  roughly 3–4× for the real cost of a polished shared-element morph.
- **What tightened the work:** The debugging loop (pause all
  animations + `animationstart` + computed-style inspection) was
  reusable across all three follow-on fixes. Once the pattern was in
  head, each subsequent view-transition bug took under 30 minutes to
  diagnose and fix.
- **Future planning adjustment:** When `/write-a-prd` shapes a feature
  with shared-element view transitions between index and detail pages,
  bundle the following into the slice's appetite and
  implementation-decisions:
  1. `view-transition-class` on both sides + a `z-index` elevation
     rule for the group.
  2. Destination-image preload (matching srcset/sizes/quality) when
     the pair renders the same source.
  3. `mix-blend-mode: plus-lighter` on the pair when the sources match
     visually.
  4. A mid-flight back-navigation screenshot as an acceptance step.

  These four items are not optional polish — they are the morph. A
  slice that lists only the `transition:name` pairing is under-shaped.

## Actuals Worth Reusing

- **Comparable future work:** Any `grid-of-items → item-detail` morph
  where the list image and the hero image share a source (project
  cards, post cards, gallery thumbnails, avatar grids).
- **Reusable baseline:** Plan ~4 slices, not 1, for a polished
  shared-element morph. The first slice establishes pairing; the next
  three are the z-order, preload, and blend-mode polish that make it
  actually look right in production.

## Defect Classification

**Origin phase:** Specification error. The PRD for the morph didn't
account for how Astro's ClientRouter composites named transitions — it
treated "view transition" as a single primitive rather than a
composition of fade animations + blend modes + stacking.

**Fix type:** Correction. `plus-lighter` addresses the compositing
model directly rather than suppressing the fade animation. A workaround
(`animation: none; opacity: 1`) was tried and rejected: it can't
distinguish matched pairs from exit/entry-only groups in CSS, so it
breaks the fade for non-morphing siblings.

## Key Decision

**Decision:** Declare `view-transition-class: project-image` on **both**
the card side (`.card-image` in `ProjectCard.astro`) and the detail side
(`.project-image` in `pages/projects/[slug].astro`), and target the
pair with class-based selectors (`.project-image`) rather than per-id
name selectors.

**Rationale:** Empirically, `::view-transition-group(.foo)` and
`::view-transition-old/.new(.foo)` only reliably match when the class
is declared on *both* sides of the matched pair. Declaring it on only
one side leaves `z-index: auto` and no `mix-blend-mode` on the group —
the class does not consistently merge across sides in Chromium 125.
Declaring on both sides is cheap and makes the selectors behave.

**Alternatives considered:**

- **Declare on only one side (detail).** Attempted first. Broke z-order
  on back-nav because the entry-only card groups and the matched group
  both failed to pick up the class. Rejected.
- **Two classes** (`project-image` on both sides + `project-image-match`
  only on detail) **to distinguish matched from non-matched.** Would
  require reliable cross-side class merging, which doesn't work.
  Rejected.
- **JS tagging via `astro:before-swap`** to mark the matched element at
  transition time. Works but adds lifecycle-event machinery for a
  problem that `plus-lighter` solves in one CSS line. Rejected.

**Revisable:** Yes, if Chromium/Safari later spec-defines class merging
behavior across matched pairs, or if Astro's ClientRouter changes how
it applies `astroFadeIn/astroFadeOut`. Revisit if the "class on one
side is enough" approach starts working in a future browser release.

## Related

- GitHub PR: #26
- Prior art: `view-transition-sibling-grid-z-order-2026-04-17.md`
  (z-order fix, same feature area, same "default composites against
  author intent" pattern)
- Prior art: `view-transition-destination-image-preload-2026-04-17.md`
  (preloading matching srcset variants so old and new snapshots are
  visually identical — *prerequisite* for `plus-lighter` to actually
  look solid)
- Astro view transitions reference: `docs/viewtransitions.md` (vendored;
  does not cover the UA `plus-lighter` compositing behavior or the
  interaction with `astroFadeIn/astroFadeOut`)

## Shelf Life

Stable. `mix-blend-mode: plus-lighter` is the UA's own pattern for
root transitions and is unlikely to change. Revisit if:

- Astro's ClientRouter starts applying `plus-lighter` automatically to
  named transitions (would make this rule redundant).
- The project moves off Astro's ClientRouter to native cross-document
  view transitions (spec-level `plus-lighter` behavior may differ).
- Firefox adds `plus-lighter` support — worth verifying the fallback
  no longer degrades to visible translucency there.
