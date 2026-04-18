---
date: 2026-04-18
category: ui-patterns
problem_type: view-transition-name placement for multi-element morph groups
components: [ProjectCard.astro, pages/projects/[slug].astro, styles/global.css]
technologies: [Astro view transitions, CSS view-transition-name, CSS view-transition-class]
severity: low
volatility: stable
---

# view-transition-name should wrap the semantic group, not the leaf element

## Problem

When a destination page contains a multi-element block that should arrive
together during a page transition — a section heading plus its body
paragraph, a kicker label plus its h1 — naming each leaf individually
produces desynchronized animation: one piece morphs from its source
position while the rest snap in at their final coordinates. Matching
the visual intent requires naming the wrapper, not the children.

## Context

Building the card → detail view transition on `/projects`. The card side
has `.card-title`, `.card-image`, `.card-description`. The detail side
has `.claim` (h1) under a `<p class="section-label">Claim</p>` kicker,
and a `<section>` containing `<h2 class="section-label">Context</h2>` plus
a `<p class="prose">` body.

Expected: each section on the detail page arrives as a block — label and
body travelling together either from a paired card element or as a single
fade-in.

Actual first pass: naming only `.claim` and `.prose` left their adjacent
`.section-label` elements snapping to final position while the named
elements animated.

Corrective second pass: naming each `.section-label` individually
(`project-label-claim-${id}`, etc.) made the labels fade in — but at
their final coordinates, detached from the morph arc their bodies were
travelling along. Labels arrived first (or visually ahead of) the body.

## Symptoms

- Labels appear instantaneously at final position while their associated
  body element morphs in from somewhere else.
- Giving each label its own `transition:name` to get a default fade-in
  still produces visible decoupling because "fade in at final position"
  and "morph in from card origin" are two different animation arcs.
- Forward-direction user feedback: "it fades in, but it doesn't come in
  from the same location as the text below it."

## Root Cause

CSS view-transitions operate on one capture per `view-transition-name`.
The captured snapshot is the named element plus its descendants. To make
several siblings morph or fade as a single unit, the name has to sit on
their common ancestor; the browser cannot be asked to "group these two
siblings under a single animation arc" any other way.

The instinctive placement — put the name on the element that matters
semantically (the h1, the paragraph) — is wrong when the visual group
includes a label above or a meta row below. The correct placement is the
element that bounds the whole visual group, even if that means
introducing a wrapper `<div>` whose only purpose is to carry the
transition name.

## Learning Level

- **Level:** Pattern. Hit twice in this PR (Context section, Claim
  header) and likely recurs on any future grid → detail surface that has
  a kicker label or meta row on the destination.
- **Feedback loop or delay:** Missing feedback during initial design.
  The DOM model suggests naming the content element; the visual model
  wants the named element to bound the group. Without an explicit
  check ("what is the *unit* arriving together?") the default is to
  name the semantically-important leaf.

## Solution

**Before — one name per leaf, labels detach from their body:**

```astro
<!-- detail page -->
<p class="section-label">Claim</p>
<h1 class="claim" transition:name={`project-title-${project.id}`}>{detail.claim}</h1>

<section class="section">
  <h2 class="section-label">Context</h2>
  <p class="prose" transition:name={`project-description-${project.id}`}>{detail.context}</p>
</section>
```

Result: h1 and paragraph animate; labels snap or fade independently.

**After — name bounds the whole visual group:**

```astro
<!-- detail page -->
<div class="claim-group" transition:name={`project-title-${project.id}`}>
  <p class="section-label">Claim</p>
  <h1 class="claim">{detail.claim}</h1>
</div>

<section class="section section--context" transition:name={`project-description-${project.id}`}>
  <h2 class="section-label">Context</h2>
  <p class="prose">{detail.context}</p>
</section>
```

```astro
<!-- card component (source side) -->
<h3 class="card-title" transition:name={`project-title-${id}`}>{title}</h3>
<p class="card-description" transition:name={`project-description-${id}`}>{description}</p>
```

The wrapper `<div class="claim-group">` exists purely to carry the transition
name — it has no layout role. For the Context section the existing
`<section>` was already the right boundary; no new element needed.

Unpaired destination sections (`The move`, `Artifact`, `Cost / return`,
`Receipts`) use the same pattern with detail-only names
(`project-section-move-${id}`, etc.), so their label + body fade in as
one unit rather than snapping separately.

## Prevention

**Code-level.**

- When authoring any view transition, ask "what is the visual unit that
  arrives together?" before picking the named element. If the unit
  contains more than one DOM node, name the ancestor — introduce a
  wrapper if the natural ancestor is too broad.
- Pair the wrapper-level naming with the z-index stacking recipe from
  `view-transition-sibling-grid-z-order-2026-04-17.md`: whenever a new
  group class is introduced, add a matching `::view-transition-group`
  selector to the z-index stack in `global.css`. The selector already
  elevates `.project-image`, `.project-title`, `.project-description`,
  and `.project-section`.

**Process-level.**

- During `/execute` Tier 3 verification for view-transition work,
  explicitly look for labels, kickers, or meta rows adjacent to the
  named element. If they exist and aren't inside the named ancestor,
  the transition arc will desync. Catch this at authoring time, not at
  QA screenshot review.
- The slow-transition browser snippet from
  `view-transition-sibling-grid-z-order-2026-04-17.md` surfaces this
  desync immediately — labels visibly snap while adjacent elements
  travel. Run it on any card → detail or grid → detail work before
  handoff.

## Planning / Calibration Notes

- **What widened the work:** Two intermediate commits
  (`d56d193`, `62cb8e8`) were required between the initial pair and the
  final unified-morph solution. The initial shape ("pair the card
  description with the detail prose") named the wrong element; the
  correction widened the scope to include label grouping across every
  section on the detail page.
- **What tightened the work:** Once the Context section's wrapping was
  solved, extending the pattern to Claim + the four unpaired sections
  was mechanical — under ten minutes total.
- **Future planning adjustment:** `/prd-to-issues` for any grid →
  detail morph slice should include "identify the visual unit of each
  paired region, not the leaf element" as an explicit shaping item.
  Don't split "add the pairing" from "make labels ride with the body" —
  they're one unit of work.

## Defect Classification

**Origin phase:** Design error — the initial pairing worked exactly as
authored, but the author's mental model (one name per semantic leaf)
didn't match the browser's model (one name per animation arc, capturing
the subtree).

**Fix type:** Correction — each detached label was resolved by lifting
the name to the containing group, not by adding more per-label
animations to cover for the desync.

## Key Decision

**Decision:** Lift `transition:name` to the section or wrapper element
rather than naming individual labels with their own fade-in transitions.

**Rationale:** A shared transition group guarantees label and body
travel as one unit — forward morph arrives together, back-nav
compresses together. Per-label names produce visible desync even when
each individual animation is correct in isolation.

**Alternatives considered:**

- Per-label fade-in with unique names — rejected: labels arrive at
  final position detached from the body's morph arc.
- CSS animation on label opacity keyed to transition start — rejected:
  reimplements what view-transition wrapper already does, and doesn't
  handle back-nav.
- Restructuring the detail markup to remove labels — rejected: labels
  carry structural meaning in the copy deck.

**Revisable:** Yes, if a future design removes the label/body
adjacency, per-leaf naming becomes valid again.

## Related

- PR: #25
- Precedent: `docs/solutions/ui-patterns/view-transition-sibling-grid-z-order-2026-04-17.md` (companion — naming decision first, stacking recipe second).
- Precedent: `docs/solutions/ui-patterns/view-transition-destination-image-preload-2026-04-17.md` (related view-transition polish).

## Shelf Life

Stable. The CSS view-transitions spec treats the named element's
subtree as the capture unit; this is unlikely to change. Revisit if a
future spec revision introduces sibling-grouping primitives that would
let multiple named leaves share an animation arc without a wrapper.
