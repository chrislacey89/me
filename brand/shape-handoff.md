# Personal Site Redesign — Shape Handoff

> Compressed handoff from `/shape` to `/research`. Self-contained: a fresh research session should be able to work from this document alone. The canonical brand definition lives at `brand/chris-lacey-brand-storyboard.md`; this handoff assumes the reader will read that as well.

## Problem

The current personal site does not represent Chris's brand well. The aesthetic reads as "generic developer portfolio with animations" when it should read as the same person who wrote the essay or built the pipeline that brought the visitor here. Tone is roughly right; visual language, copy voice, and front-end flourishes are wrong. Content is largely carryable.

## Audience (in priority order)

1. **Recruiters and hiring managers** at senior AI product engineering roles. Decide in 10–20 seconds. Need: role, seniority, stack, recency, credibility — fast.
2. **Consulting prospects** arriving from writing, GitHub, or referral. Already warm.
3. **Fellow practitioners and peers.** Deciding whether to trust, link, subscribe.

All three matter. No single-audience optimization. The home page must serve a recruiter's 15-second scan and survive a peer's close read.

## Positioning

**Full-stack AI product engineer.** A decade of FE experience is the proof of craft, not a caveat. The AI/full-stack framing is forward-looking; the site supports it credibly without overclaiming.

## Success

Being taken seriously for senior AI product engineering roles at senior compensation. Recruiter inbound that references specifics. At least one attributable professional outcome within six months. The site is linkable in a cold email without a caveat.

---

## Choices (settled — do not re-debate)

### Information architecture

- **Pages:** Home · About · Projects · **Writing (new)** · Contact.
- `/now` section lives on the home page, not its own route.
- `/uses` deferred to a future iteration.

### Home page hero composition

1. Name — display face, restrained sizing.
2. Role line — *Full-stack AI product engineer.* No adjectives in front.
3. One-sentence thesis in serif: ***"Close the gap between intent and outcome."*** (Chosen over *"the quiet part, written down"* because outcome-coded copy works for a cold scanner.)
4. Availability line, Berkeley Mono, small: ***"Remote · US · open to senior AI product engineering roles."*** No city or state.
5. Exactly one Terracotta Signal accent on the page.
6. Below the fold: a hand-picked three-project "evidence of method" strip + a short dated `/now` section.
7. Deliberately absent from the hero: hero illustration, animated background, gradient, cursor effects, magnetic buttons, confetti.

### Geography handling

- **Hero:** *"Remote · US"* only. No city.
- **About page:** Bloomington, Indiana — stated plainly as a deliberate choice. *"Remote-first by choice — the work is portable, and this is where it gets done well."*
- **Footer / contact:** location fine here too.

This is a deliberate move against compensation anchoring on geography. Directionally well-founded; can't be A/B tested cheaply. Made on principle.

### Flourishes — disposition of current components

| Component | Verdict |
|---|---|
| `Confetti.astro` | Retire. |
| `CursorTracker.astro` | Retire. |
| `MagneticButton.astro` | Retire. |
| `ScrollProgress.astro` | Retire (or 1px Forest Floor rule on long-form only). |
| `InteractiveSkillIcon.astro` | Transform: static grid, Berkeley Mono labels, Terracotta hover color only — no motion. |
| `SectionDivider.astro` | Keep if a thin rule. Retire if motion. |
| View Transitions (already in place) | Keep. |
| `Confetti` on contact form success | Replace with typeset confirmation: *"Sent. I'll respond within two business days."* |

### Going-forward rule for motion

> **Motion earns its place by carrying information.** A flourish stays if it does real work tied to real content. A flourish retires if it exists to delight for its own sake, disconnected from content.

Permitted future flourishes (content-bound only):
- Diagrams that re-draw on scroll, when the re-draw is part of the explanation.
- One-time typed-character reveal on a specific code block when teaching line-by-line.
- Considered pull quotes with typographic care.
- View Transitions between pages.

### Project pages — "how I think" structure

Replaces the "what I built" structure. Every lead project page contains:

1. **Claim.** One sentence in serif. Project + problem solved. Not features.
2. **Context.** 2–3 sentences. Who asked, what was broken, what was at stake. Dated.
3. **The move.** The decision made and *why*. The single most load-bearing paragraph. This is where seniority shows.
4. **The artifact.** One or two — screenshot, diagram, code, schema, recorded demo. Picked for argument, not completeness.
5. **What it cost and what it returned.** Time invested, trade-offs accepted, outcome in real terms.
6. **Receipts.** Repo, live site, writeup, key commit. Berkeley Mono, small.
7. **One Terracotta Signal pull quote** per page — the single sentence the reader should remember.

### Project triage

Triage existing projects into:
1. **Lead (2–3):** full "how I think" page.
2. **Supporting (2–4):** strip with claim + link only.
3. **Retired:** removed from site.

If a project can't sustain a "the move" paragraph, it's probably retired. Fewer, sharper lead projects beats more, thinner ones — especially at senior-comp positioning.

### Writing surface

- Ships with the redesign.
- Designed to feel **complete at a quarterly cadence** (Chris's stated floor of one essay per quarter).
- Layout privileges the individual piece over the list. A small, year-grouped index with one-line titles, dates, and one-sentence annotations — not a long scrolling list of 4 items.
- Chris does not currently publish elsewhere; this site is the canonical venue.
- Built-in design constraint: must not look abandoned at 4 posts.

### About page structure

- 300–400 words target.
- Sections: **Lede** · **How I work** (the pipeline, plainly stated) · **Where I've been** (career shape at altitude, link to resume PDF) · **Where I am** (Bloomington as choice) · **Desk objects** (optional, 2 specifics max from the brand-safe list) · **Quiet contact line.**
- **Resume PDF linked.**
- **Portrait optional**, preferred if a brand-safe one exists (45° raking light, overcast, no softbox). No photo beats a bad photo.

### Investment envelope

- Focused rebuild, not ground-up.
- Astro stays. No framework migration.
- Done in deliberate slices across a few focused weekends.
- Worth doing well — outcome is measured in tens of thousands of dollars of annual compensation difference.

---

## Assumptions (research targets — tagged by confidence)

| # | Assumption | Tag | Notes |
|---|---|---|---|
| 1 | Astro + Tailwind + React + Geist fonts is the current stack. | `Established` | Verified in `package.json`. |
| 2 | View Transitions are in place for project navigation. | `Established` | Per recent commits. |
| 3 | Existing project and about content is editorially carryable — rewrite is voice/structure, not greenfield. | `Likely` | |
| 4 | The brand-specified faces (Söhne / Inter Display, Source Serif / Fraunces, Berkeley Mono / IBM Plex Mono) have at least one option per slot that is free or affordably licensed for a personal site. | `Likely` | **First-priority research target.** Confirm licensing and define fallback (likely Inter Display + IBM Plex Mono + free serif) if primary choices are paywalled at unacceptable price. |
| 5 | Chris has enough material for 2–3 lead-grade projects today. | `Likely` | If not, ship with fewer lead slots. |
| 6 | Chris has a brand-safe portrait available, or is willing to commission one. | `Uncertain` | If not, About launches without a photo. |
| 7 | Quarterly writing cadence will hold once the site is live. | `Uncertain` | Writing surface is designed to look intentional at 4/year, reducing downside. |
| 8 | Recruiters in the target market will read restraint as seniority rather than as "blank." | `Speculative` | Counter-signal is content density, not chrome. |
| 9 | Dropping Bloomington from the hero is net-positive against comp anchoring. | `Speculative` | Directionally well-founded; made on principle. |

### First-priority `/research` targets

1. **Typography licensing and availability.** Resolve Söhne, Inter Display, Source Serif, Fraunces, Berkeley Mono, IBM Plex Mono. Define fallback stack if primaries are paywalled. Output: one chosen face per slot (display, serif, mono) with a confirmed delivery method (Fontsource, foundry license, self-hosted file).
2. **Astro 5.16 + View Transitions idioms.** Confirm current best practices for project detail pages and the new writing surface. Surface any 5.x-specific patterns to follow.
3. **Content collection shape for the writing surface.** Astro content collections schema for essays — frontmatter fields, slug strategy, draft handling, rendering pipeline. One-time structural decision.
4. **Component surface audit.** Of the current components (`MainNav`, `ProjectCard`, `ContactCard`, `SkillIcon`, `SectionDivider`), which survive into the new design, which transform, which retire. Define the smallest set of new primitives needed for the redesign.
5. **Palette implementation in Tailwind v4.** Bind the brand hex codes (Ink Well `#0B1221`, Legal Pad `#F4EEE1`, Terracotta Signal `#C1502E`, Forest Floor `#2F5D50`, Terminal Green `#7AE582`) into the Tailwind v4 token system. Confirm light/dark behavior — the brand defaults to Legal Pad backgrounds with Ink Well type, but a dark mode (Ink Well background, Legal Pad type) may be desirable.

---

## Impositions (external; can't change)

1. **The canonical brand document** at `brand/chris-lacey-brand-storyboard.md` is source of truth for palette, typography intent, totems, adjective stack, and anti-brand. Downstream decisions defer to it.
2. **Palette is fixed.** Ink Well `#0B1221` · Legal Pad `#F4EEE1` · Terracotta Signal `#C1502E` · Forest Floor `#2F5D50` · Terminal Green `#7AE582`. No gradients, no glass, no neon, no purple.
3. **Anti-brand list is a hard filter.** Cursor trails, confetti, hoodie-hacker aesthetic, rocket emojis, 2021 SaaS-gradient energy — ruled out.
4. **Astro stays.** No framework re-platforming.
5. **Chris does not relocate.** Target market is remote / regional AI product roles.
6. **Fulcrum is not on this site.** Any historical "Lembas" references in docs translate to Fulcrum; Fulcrum gets its own surface later.

---

## Structural signals (prompts for research and PRD; not to solve now)

1. **The flourishes tension may recur during implementation.** "Flourishes show capability" was a live instinct that only yielded to "motion earns its place by carrying information." Expect this to resurface for individual micro-interactions that feel harmless in isolation. The rule must hold through execution, not just shape.
2. **Recruiter-legibility ↔ brand-quietness is coexistable, not resolved.** Every page-level design decision re-negotiates this trade-off. Watch for pages that tip too far either way.
3. **The writing surface promises a publishing cadence the user has to keep.** A behavioral risk, not a design problem. Surfaced here so research and PRD can design defensively (e.g., the layout shouldn't depend on a high post count to feel right).
4. **Compensation anchoring on geography** is the design problem behind the "no city in hero" choice. If inbound quality doesn't shift after launch, revisit.
5. **Brand specificity ↔ performativity.** Desk objects, totems, sensory details work when they ring true. Every brand-specific must pass the "is this actually true of his day" test during copy review.

---

## Handoff

- **Default next:** `/research`. This is one cohesive product — a single PRD, not a multi-PRD tranche.
- **Carry forward:** Choices (locked), Assumptions (with confidence tags), Impositions, Structural signals.
- **Treatment by tag:** `Uncertain` and `Speculative` assumptions are the highest-priority research targets. `Likely` assumptions can be confirmed during PRD writing. `Established` assumptions need only targeted verification.
