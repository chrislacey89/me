---
date: 2026-04-17
category: ui-patterns
problem_type: view-transition pseudo clipping in sibling grids
components: [ProjectCard.astro, pages/projects/[slug].astro, styles/global.css]
technologies: [Astro view transitions, CSS view-transition-class, ClientRouter]
severity: low
volatility: stable
---

# View-transition pseudos clipped behind sibling grid items

## Problem

When a grid of items (project cards, post cards, anything iterable) each has a
`transition:name` on its outer wrapper for legitimate reasons — typically to
morph the wrapper between two index-style pages — any **nested** named
elements inside one of those wrappers get painted *underneath* the
neighboring wrapper groups during a grid → detail morph. The effect is a
partial or total disappearance of the morphing pseudo while it transits
through a sibling's footprint.

## Context

Building the card ↔ detail view transition for lead projects (`ProjectCard`
→ `/projects/<slug>`). The outer `<article>` of each card carries
`transition:name="project-card-<id>"` so that card-to-card navigation
between `/` and `/projects` morphs the full card. The inner `.card-image`
and `.card-title` carry their own `transition:name` to pair with the detail
page's hero image and claim heading.

Expected: on a card → detail click, the image and title morph
continuously from card coordinates to detail-page coordinates.

Actual: mid-flight the image appeared to slide **behind** the neighboring
Skill Kit and Empowerment Brief card wrappers. On the back navigation the
card-title pseudo was partially invisible while transiting across sibling
cards — producing a flash of "blank title" in the Fulcra card slot while
the old h1 claim text was still morphing down from the detail header.

## Symptoms

- During a grid-item → detail morph, the morphing image or title becomes
  visible only within the source item's footprint and disappears (or is
  severely clipped) as its animated pseudo crosses over neighboring items.
- On back-navigation (detail → grid), the destination grid-item's title
  appears *briefly blank* during the transition window, then pops to
  visible once the view-transition ends.
- No console errors. No missing pair — `getComputedStyle(el).viewTransitionName`
  resolves correctly on both sides. The bug is purely visual stacking.

## Root Cause

In the CSS view-transitions model, every element with a
`view-transition-name` is captured as its own `::view-transition-group`
pseudo during the transition. These pseudos are siblings under the
`::view-transition` root. **Without explicit `z-index`, they paint in
document order** — which means a later sibling in the DOM (e.g., the
Skill Kit card's wrapper group) is painted *on top of* earlier siblings
(e.g., the Fulcra card's nested image/title groups).

Document-order stacking is fine when named elements don't spatially
overlap. It fails the moment a morphing pseudo animates *across* a
sibling's footprint — which is exactly what happens when a nested piece
(image, title) morphs from a card position on the grid to a larger
position on the detail page. The nested piece's start and end positions
are inside its own card, but its in-flight path passes through every card
to its right or below.

The default painting order can be seen inspecting a slowed view
transition in DevTools: mid-flight pseudos disappear into neighboring
card groups and reappear only when the group geometry lands back outside
them.

## Learning Level

- **Level:** Pattern. Hit twice in the same PR — once for the image, once
  for the title — which is two independent instances of the same
  underlying stacking mechanic.
- **Feedback loop:** Missing feedback during `/execute` verification. The
  bug is invisible at full speed for image-sized elements (200ms morph,
  human eye smooths it), but very visible for title-sized elements whose
  pseudo transits a long distance. QA caught it by chance on the
  back-navigation, not because anything in the pipeline specifically
  watched for cross-cell pseudo clipping.

## Solution

Give every nested morphing element a `view-transition-class` and lift
that class's group above the baseline stacking level in `global.css`.

**Before:**

```astro
<!-- ProjectCard.astro -->
<div class="card-image" transition:name={`project-image-${id}`}>
  <Image … />
</div>
…
<h3 class="card-title" transition:name={`project-title-${id}`}>
  {title}
</h3>
```

```astro
<!-- pages/projects/[slug].astro -->
<div class="project-image" transition:name={`project-image-${project.id}`}>
  <Image … />
</div>
…
<h1 class="claim" transition:name={`project-title-${project.id}`}>
  {detail.claim}
</h1>
```

No stacking control → morphing pseudos painted under sibling-card groups.

**After:**

```astro
<!-- ProjectCard.astro scoped style -->
.card-image  { …; view-transition-class: project-image; }
.card-title  { …; view-transition-class: project-title; }
```

```astro
<!-- pages/projects/[slug].astro scoped style -->
.project-image { …; view-transition-class: project-image; }
.claim         { …; view-transition-class: project-title; }
```

```css
/* global.css */
::view-transition-group(.project-image),
::view-transition-group(.project-title) {
  z-index: 10;
}
```

`view-transition-class` is the right mechanism here (over
`view-transition-name`-per-id selectors) because it's a single selector
that auto-matches every present and future project. When a fourth lead
project is added, the stacking fix continues to apply with zero
additional CSS.

## Prevention

**Code-level.** Whenever a new grid surface gains per-item
`transition:name` on its wrapper *and* nested morphing children:

1. Give the nested morphing children a `view-transition-class` scoped to
   their semantic role (`project-image`, `post-title`, etc.).
2. Add one `::view-transition-group(.<class>) { z-index: N }` rule in
   `global.css`, elevating all nested pieces above the baseline
   card-wrapper plane.
3. Verify with a slowed transition screenshot (8s duration via
   `adoptedStyleSheets` injection in the browser console):
   ```js
   const s = new CSSStyleSheet();
   s.replaceSync(`::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation-duration: 8s !important; animation-timing-function: linear !important; }`);
   document.adoptedStyleSheets = [...document.adoptedStyleSheets, s];
   ```
   At slow speed the clipping artifact is obvious.

**Process-level.** During `/execute` Tier 3 verification of any UI slice
that uses `transition:name`, exercise at least one back-navigation
(detail → index) in addition to the forward morph. The forward direction
hides the symptom because destination is a single centered hero; the
back direction exposes it because destination is a grid of clipping
neighbors.

## Planning / Calibration Notes

- **What widened the work:** The original issue (#16) described only the
  missing image pair. The z-order consequences surfaced only during QA
  screenshot review. Two additional commits were required
  (`86a9279`, `f795720`), each of comparable cost to the original
  fix. Call it roughly 3× the shaped slice's appetite.
- **What tightened the work:** Once the image z-order root cause was
  understood, diagnosing and fixing the title clip took under ten
  minutes — the pattern was already in head.
- **Future planning adjustment:** For future "morph grid item into
  detail" slices, `/prd-to-issues` should bundle the `view-transition-class`
  scaffolding and a back-navigation QA step into the same slice. Don't
  split "add the pairing" from "get the stacking right" — they're one
  unit of work in practice.

## Defect Classification

**Origin phase:** Design error — the original implementation paired
`transition:name` values but didn't account for the CSS
view-transitions stacking model. A pure specification/coding error
would have had no visual bug; here the code worked exactly as the
author asked, but the browser's default stacking model contradicted
the author's intent.

**Fix type:** Correction — each z-order artifact was addressed by
elevating the relevant group class, not by suppressing the symptom.

## Key Decision

**Decision:** Use `view-transition-class` (not per-id
`::view-transition-group(project-image-fulcra)` enumerations) to target
the elevated groups.

**Rationale:** Class-based selection scales automatically as new lead
projects or new post-type grids are added. Enumeration of ids in CSS
would silently rot every time the project list changed.

**Alternatives considered:**

- Per-id enumeration — rejected as maintenance-heavy and rot-prone.
- Dropping the `project-card-<id>` wrapper name — would also remove the
  card-to-card wrapper morph between `/` and `/projects`, which is a
  deliberately nice effect worth keeping.
- Moving the whole card wrapper to a higher z-index and nested pieces to
  higher-still — works but adds a layer of reasoning ("which
  z-index goes with what") that `view-transition-class` avoids.

**Revisable:** Yes, if the stacking requirement changes (e.g., adding
floating overlays that *should* sit on top of the morph). In that case
reshuffle z-index values, not the class-based targeting approach.

## Related

- GitHub issue: #16
- PR: #21
- Astro's view-transition docs: `docs/viewtransitions.md` (vendored reference, does not cover this pattern)

## Shelf Life

Stable. `view-transition-class` is in Chrome 125+ and Safari 18+ (both
widely deployed at time of writing, April 2026). The CSS view-transitions
stacking model is spec-stable.

Revisit if:

- A future refactor eliminates the `project-card-<id>` wrapper morph
  (the reason nested pieces need elevation in the first place).
- Chrome or Safari changes the default stacking order of
  `::view-transition-group` pseudos (unlikely; would be a breaking web
  platform change).
