---
date: 2026-04-17
category: ui-patterns
problem_type: cross-route view-transition participant coverage
components: [pages/index.astro, pages/projects.astro, pages/writing/index.astro, pages/about.astro, pages/contact.astro]
technologies: [Astro view transitions, ClientRouter, CSS view-transition-name]
severity: low
volatility: stable
---

# Cross-route view-transition pairing requires complete participant coverage

## Problem

A View-Transitions morph only occurs when both the departing and arriving
routes carry an element sharing the same `transition:name` (compiled to
`view-transition-name`). If the name exists on one route but not the other,
the browser has no pair to interpolate — the departing element plays an exit
animation and the arriving element plays an entry animation separately. The
result looks like a snap-fade, not a morph, but no error, warning, or test
failure surfaces. The gap is purely in the authored DOM.

## Context

The site's five top-level routes — `/`, `/projects`, `/writing`, `/about`,
`/contact` — each open with a single load-bearing sentence (the "Primary
page claim" in Refactoring-UI terms). The intent is that navigating between
any two top-level routes morphs that claim: same slot, same content shape,
different words.

Expected: `/writing` → `/projects` animates *"Essays on closing the gap…"*
into *"Three lead projects, one supporting strip."* as a continuous text
swap.

Actual: the departing lede faded out and the arriving lede faded in
separately. Card ↔ detail morphs on the same pages continued to work
correctly — the defect was specific to the top-level page-claim slot.

## Symptoms

- Navigating between two routes that each have a logical counterpart element
  produces a snap-fade (one exit + one entry animation) instead of a morph
  (one group animation interpolating position and content).
- `getComputedStyle(el).viewTransitionName` resolves to a name on one side
  but to `none` on the other.
- No console errors. Typecheck, build, lint, and unit tests all pass. The
  regression is only visible during interactive navigation in a browser that
  supports View Transitions (Chrome/Edge 111+, Safari 18+).
- Card-level and divider-level morphs on the same pages still work — the
  defect is scoped to whichever slot was left without a paired name.

## Root Cause

View Transitions pair participants purely by name match at the
`::view-transition-group(<name>)` pseudo level. The authoring model in Astro
compiles `transition:name="foo"` into a per-element CSS declaration and
emits no compile-time audit of "which names appear on which routes." It is
the author's responsibility to ensure that every slot intended to morph
across a pair of routes carries the same name on both sides.

In this project, paired naming had been applied consistently to grid
collections (`project-card-<id>`, `project-title-<id>`, `project-desc-<id>`)
and to the `SectionDivider` component, but no shared name had ever been
designated for the top-level "page claim" slot. Home's hero carried two
Home-only names — `intro-text` on the hero grid wrapper and `page-title` on
the display name — both of which paired with nothing on the other four
routes. `/projects`, `/writing`, `/about`, and `/contact` each had a plain
`<h1 class="lede">` with no transition name at all.

The omission was invisible to every automated check because it manifests
only in CSS layout behavior during a navigation event, not in rendered
output, type safety, or assertion-based tests.

## Learning Level

- **Level:** Pattern. This is the second view-transition compound entry in
  the same week (see `view-transition-sibling-grid-z-order-2026-04-17.md`),
  and both defects share the same structural cause: the authoring model
  treats transition participants as per-element ornaments rather than
  declared cross-route contracts, and the pipeline has no gate that closes
  the loop.
- **Feedback loop or delay:** Missing feedback. The first signal is a human
  noticing a brand-feel regression during manual navigation. Typecheck,
  build, lint, pre-commit, and existing tests all pass through the defect
  cleanly. In this case the regression was introduced (or had always been
  present) through every slice from the original hero scaffold forward and
  was only caught during slice-9 cutover QA — several iterations after the
  authoring decision that produced it.

## Solution

Designate each logical cross-route slot with a shared `transition:name`
that matches on every route in its pair-set. For the five top-level routes,
the Primary page-claim slot is now `page-lede`.

**Before:**

```astro
<!-- index.astro (Home): Home-only names, no cross-route pair -->
<div class="hero-grid" transition:name="intro-text">
  …
  <h1 class="hero-name" transition:name="page-title">{hero.name}</h1>
  <p class="hero-lede">{hero.lede}</p>
  …
</div>

<!-- projects.astro, writing/index.astro, about.astro, contact.astro -->
<h1 class="lede">…</h1>
```

No shared name across routes → snap-fade.

**After:**

```astro
<!-- index.astro (Home): page-lede on the lede paragraph; intro-text retired -->
<div class="hero-grid">
  …
  <h1 class="hero-name" transition:name="page-title">{hero.name}</h1>
  <p class="hero-lede" transition:name="page-lede">{hero.lede}</p>
  …
</div>

<!-- projects.astro, writing/index.astro, about.astro, contact.astro -->
<h1 class="lede" transition:name="page-lede">…</h1>
```

Three sub-decisions inside this fix are worth naming, because each one
recurs whenever cross-route pairing is extended:

1. **Choose the participant at the semantic slot, not at a convenient
   wrapper.** Home's Primary page claim is the `.hero-lede` paragraph, not
   the hero grid container. Picking the wrapper would pair a proper-noun
   identity block with other routes' single-sentence ledes — different
   content shapes, large width jumps, poor morph quality.
2. **Retire wrapper-level names that no longer pair with anything.**
   `transition:name="intro-text"` on `.hero-grid` existed only on Home, so
   it had no cross-route counterpart and produced a lone exit animation
   while its descendant `page-lede` was separately trying to morph.
   Ancestor + descendant names on the same subtree can compete for
   ownership of a region during a transition, so the cleanest resolution is
   to keep only the element that actually pairs.
3. **Preserve single-route names that are intentional identity anchors.**
   Home's `page-title` on the display name stays — it's a Home-only anchor
   by design, not a failed cross-route pair.

## Prevention

**Code-level.** A build-output smoke check can close the missing feedback
loop cheaply without requiring a browser harness. For each declared
participant slot in the pair-set, assert that every route in that pair-set
emits exactly one matching `view-transition-name` in its compiled HTML. One
expression of this for the current project:

```bash
# Each of the five top-level routes must emit one `page-lede` group.
for page in dist/client/index.html dist/client/projects/index.html \
            dist/client/writing/index.html dist/client/about/index.html \
            dist/client/contact/index.html; do
  count=$(grep -c 'view-transition-name: page-lede' "$page")
  [[ "$count" == "1" ]] || { echo "✗ $page has $count page-lede groups"; exit 1; }
done
```

The same shape generalises to any future pair-set (e.g. a "page eyebrow"
slot, an "author credit" slot).

**Process-level.** During `/execute` Tier 3 verification of any slice that
adds, removes, or renames a `transition:name` — or that adds a new route
into an existing pair-set — exercise every direction of every declared
pair, not only the one mentioned in the slice description. The sibling-grid
z-order solution (`view-transition-sibling-grid-z-order-2026-04-17.md`)
already asks for back-navigation coverage; this solution extends the
coverage rule to every route in the pair-set, not only two.

**Authoring-level.** When introducing a new top-level route, treat "does
this route belong to any existing pair-set?" as a shaping question during
`/write-a-prd`, not an implementation detail. A new route that silently
omits an established participant will produce a brand-feel regression on
every navigation into or out of it.

## Planning / Calibration Notes

- **What widened the work:** almost nothing. The scope stayed at the exact
  five files named in the issue.
- **What tightened the work:** the issue body itself was unusually
  load-bearing. It already named the participant slot ("Primary page
  claim"), scoped the pair-set (five top-level routes), ruled out the
  obvious wrong participant on Home (the display name), and flagged the
  wrapper-vs-descendant tension on Home for the implementer to resolve.
  Most of the shaping decisions that would normally live in a PRD were
  pre-decided in the bug report. If future bug reports in this area can
  follow the same shape, implementation stays a one-commit change.
- **Future planning adjustment:** `/write-a-prd` and `/prd-to-issues` for
  any slice that touches routing, layout shells, or navigation chrome
  should surface "does this affect the cross-route participant ledger?" as
  a completeness-scan question. The ledger currently lives in the source
  (grep for `transition:name`); a future `docs/participant-ledger.md` could
  make it explicit, but the grep-based discipline is sufficient for the
  current size of the pair-set.

## Defect Classification

**Origin phase:** Design error. Paired naming was applied correctly to grid
collections from their first slice, but the Primary page-claim slot was
never explicitly designated as a cross-route participant during the
original authoring of the top-level routes. The omission persisted until
slice-9 QA because nothing in the pipeline forces participant coverage to
be named and verified.

**Fix type:** Correction. The fix adds the missing paired names and
retires the wrapper-level name that had no counterpart; it does not
suppress the symptom with an override or a workaround.

## Key Decision

**Decision:** Use one shared flat name (`page-lede`) across all five
top-level routes, applied to the innermost semantic element that carries
the Primary claim, rather than a per-page unique name or a wrapper-level
name.

**Rationale:**

- Flat shared names scale as new top-level routes are added — every future
  top-level route picks up the morph by tagging its claim element once.
- Innermost-semantic placement keeps the morph on the actual sentence box,
  not a bounding container whose size would otherwise animate independently.
- Single-participant-per-page avoids the competing-subtree problem that
  would arise if the wrapper also carried a shared name.

**Alternatives considered:**

- Per-page unique names with a stylesheet that enumerates each pairing —
  rejected as maintenance-heavy and fragile to page renames.
- Keeping `intro-text` on the hero wrapper alongside the new `page-lede` on
  the descendant — rejected because the wrapper had no cross-route pair and
  would compete with the descendant morph on Home.
- Pairing Home's display name with the other routes' ledes — rejected
  because the content shapes (proper noun vs. sentence) and widths are too
  different to morph coherently.

**Revisable:** Yes, if the top-level information architecture changes (e.g.
adding a route whose page-claim slot is legitimately a different shape) or
if Astro adds a compile-time participant audit that makes the code-level
prevention unnecessary.

## Related

- GitHub issue: #15
- PR: #22
- Sibling solution: `docs/solutions/ui-patterns/view-transition-sibling-grid-z-order-2026-04-17.md` — same technology family, different failure mode (z-order during intra-page grid morphs). Both share the structural cause of missing participant-coverage feedback in the pipeline.

## Shelf Life

Stable. Astro's view-transitions integration and the browser View
Transitions spec are both stable as of April 2026.

Revisit if:

- The top-level route set changes materially (a new route whose page-claim
  slot is a different content shape, or retirement of one of the five
  existing routes).
- Astro adds a compile-time audit for cross-route `transition:name`
  coverage. At that point the code-level prevention check can be retired.
- A future refactor consolidates the page-claim slot into a shared layout
  component — the participant would then be declared once in the layout and
  the per-page application of `page-lede` would no longer be the authoring
  surface.
