# Illustration Prompt Guide

*Operational how-to for producing brand-consistent illustrations. Pairs with [chris-lacey-brand-storyboard.md](./chris-lacey-brand-storyboard.md) (what the brand is) and [shape-handoff.md](./shape-handoff.md) (how the site expresses it).*

---

## 1. Context & purpose

Three brand-aligned illustrations ship on chrislacey.dev today: Fulcrum's hexagonal decision lattice, the skills terminal pipeline, and the AI Empowerment Brief pillar grid. They were produced during a single session using Gemini 3 Pro Image (a.k.a. Nano Banana Pro). The conventions that made them work — the canonical prompt template, the hex-with-role-labels discipline, the dot-placement language, the family-coherence rule, the typography pin — all lived in chat context and nowhere else.

This doc is the durable reference. It captures:

- **The illustration grammar** — brand-level rules that don't depend on which generator we use.
- **The current prompt technique** — Gemini 3 Pro Image specifics, subject to change as the tool evolves.
- **The three shipped prompts verbatim** — worked examples, each annotated with what landed and what drifted.

### Primary consumer

Future Claude sessions. Chris's workflow is: ask Claude to generate a prompt, paste the output into the Gemini web editor, download the result, apply to the repo. Claude reads this doc as working context; Chris reads the appendix when scanning for a reference to riff from.

**Boundary note.** Claude's deliverable is the prompt, not the image. Image generation happens in the Gemini web editor on Chris's side.

### When to use this doc

- Adding a fourth project card.
- Producing an OG image or social card that goes beyond the coded template at `src/pages/api/og.png.ts`.
- Any other brand-facing illustration where consistency with the existing three matters.

Out of scope (for now): headshots, marketing visuals, writing-post diagrams. Those can be added when they come up.

---

## 2. The illustration grammar

The rules that survive any tool change. If we swap generators, this section stays intact.

### Canvas

- **Aspect ratio:** 16:9 for project-card illustrations. 1200×630 for OG. 1080×1080 for square social. 1500×500 for wide banners.
- **Background:** `#1A1F2E` Ink Well, fills the entire canvas.

### Line color and stroke

- **Color:** `#F4EEE1` Legal Pad. Warm off-white.
- **Weight:** Consistent 2px stroke across every structural line. No varying weights, no thick-to-thin strokes.

### Accent fill

- **Color:** `#C1502E` Terracotta.
- **Rule:** Exactly **one** filled shape per illustration. This is the "look here" element — the decision chosen, the step active, the pillar featured.

### Secondary accent

- **Color:** `#2F5D50` Forest Floor.
- **Rule:** Sparingly. Uses include: prompt chevrons in a terminal layout, one-of-three tick marks inside repeating shapes, muted supporting glyphs. Not a second primary accent.

### Confidence marker

- **Color:** `#7AE582` Terminal Green.
- **Rule:** Exactly **one** small mark per illustration. A ≤12px circular dot, or a single `✓` glyph. Semantically reserved for "completed / verified / confident."

### Perspective

- **Plan view only.** Straight top-down. No isometric, no three-quarter, no perspective / vanishing point, no 3D rendering.

### Stroke style

- **Voice:** Single-stroke technical line illustration in the language of an architect's blueprint or a Moleskine field-notebook sketch. Not a cartoon, not a marketing infographic, not a photorealistic render.

### Typography (when rendered text appears)

- **Typeface:** IBM Plex Mono. Pin this explicitly in the prompt — not "Berkeley Mono or IBM Plex Mono," not "a monospaced sans-serif." Single canonical mono.
- **Case:** Lowercase unless a pillar name or proper noun forces otherwise.
- **Weight:** Regular (not bold). Fixed character width, uniform stroke weight.
- **Rules:** No italic, no ligatures, no kerning adjustments, no stylized glyphs.

### Composition

- **Centering:** Both vertically and horizontally within the canvas.
- **Subject extent:** Middle 55–75% of canvas width. Generous negative space on all sides.

### Family-coherence rule

Each illustration must use a **distinct shape vocabulary** from its siblings. Producing a fourth card requires picking a new vocabulary that isn't one of these three:

- **Fulcrum:** hexagonal lattice.
- **skills:** vertical column of horizontal mono-text rows.
- **AI Empowerment Brief:** 2×3 grid of labelled rectangular tiles.

Possible new vocabularies: annotated diagram with callout lines; isometric-forbidden axonometric stack; radial spoke graph; timeline with milestone markers; concentric rings; cross-section layers. Pick one that directly captures the new project's metaphor.

### Banned palette and effects

Do not include any of these:

- **Colors:** purple, cyan, magenta, neon, sky blue, fluorescent anything.
- **Effects:** gradients, glows, drop shadows, bloom, lens flare, outer text shadows.
- **Style:** photo textures, 3D rendering, isometric perspective, drop-shadowed depth, vanishing-point perspective, paper textures, grain, noise.
- **Chrome:** window frames, title bars, traffic-light dots, scroll bars, tab markers, menu bars, cursor arrows.
- **Decoration:** ornamental borders, decorative corner flourishes, background plates, framing boxes around the subject.

---

## 3. OG / social extension

The grammar above is tuned for project-card illustrations on an Ink Well background. When the output is an OG image, social card, or any brand-facing visual where the audience reads text first and image second, a few rules flip.

### Palette inversion

- **Background:** `#F4EEE1` Legal Pad (not Ink Well).
- **Foreground lines and text:** `#1A1F2E` Ink Well (not Legal Pad).
- **Accent:** `#C1502E` Terracotta, unchanged.
- **Confidence marker:** `#7AE582` Terminal Green, unchanged. Still at most one.

Reference: the inversion is already coded at `src/pages/api/og.png.ts` lines 8–14, which defines the OG palette constants.

### Typography on OG / social

- **Headlines:** Source Serif 4 (weight 400 or 500). Serif, not mono. Source: `src/pages/api/og.png.ts` lines 20–26.
- **Receipts / eyebrows / monospaced detail:** IBM Plex Mono (weight 400 or 500).
- **No all-mono compositions on OG.** The reader is scanning for a headline; serif carries it.

### Same discipline

One Terracotta accent. At most one Terminal Green confidence marker. Same banned list. Same plan-view perspective. Same single-stroke line style when illustration elements are present.

---

## 4. The prompt template

Gemini 3 Pro Image (Nano Banana Pro) responds best to a specific structure. Distilled from Google's Nano Banana Pro prompting guide, the Atlabs guide, the Cliprise guide, and our production use during the redesign pass.

### Canonical skeleton

```
[Subject + adjectives] doing [action] in [location/context].
[Composition / camera angle].
[Lighting / atmosphere].
[Style / media].
[Specific constraints / text].
```

Every prompt fills all five fields. Missing fields get filled in by the model, unpredictably.

### Prose sentences, not keyword stacks

The model over-analyzes stuffed prompts and ignores filler like "4k, masterpiece, trending on artstation, octane render." Write natural sentences.

### Hex-with-role-labels discipline

Every hex value appears paired with the one role it plays. No hex ever appears without its assigned role. Example block:

```
Color palette (use exactly these hex values for the roles stated, nothing else):
- Background: #1A1F2E (deep navy — fills the entire canvas)
- Line color: #F4EEE1 (warm off-white — every structural line)
- Accent fill: #C1502E (terracotta — fills the one chosen shape, one use)
- Secondary accent: #2F5D50 (muted forest green — supporting marker role)
- Confidence marker: #7AE582 (terminal green — the single small dot or ✓)
```

The "nothing else" phrase is load-bearing. It tells the model these are the only colors allowed.

### Explicit exclusions

Close every prompt with a "No X. No Y." block. Exclusions are respected and they are how we kill neon / purple / gradient drift. See §9 B.2 for the reusable exclusions paragraph.

### Rendered text (when a prompt includes it)

When the illustration will contain text:

- Pin IBM Plex Mono as the typeface, by name, at the top of the typography section.
- Pin every string **verbatim** — quote exactly what characters should render.
- Pin position on the row — "left-aligned," "indented two spaces," "at the end of row 4," etc.
- Forbid extra words — "no extra lines, no placeholder words, no additional punctuation" goes in the exclusions block.

See §9 B.3 for the reusable text-bearing typography block.

### Spatial language

Precise beats vague:

- "The middle third of the canvas" beats "in the middle."
- "Above the top vertex, offset by one dot-diameter of clear negative space" beats "just outside the upper-right edge."
- "Centered both vertically and horizontally" beats "centered."
- "Three cards offset diagonally down-and-right by roughly 8–10% of a card's width" beats "stacked cards."

---

## 5. Lessons learned

Each lesson below is a convention, anchored in a concrete incident from the three shipped illustrations. Treat these as load-bearing rules, not suggestions.

### Describe zones without naming them

Prompt 3A for the empowerment-brief pillar grid named two zones inside each tile: a `TOP LABEL` zone and a `DIAGRAM` zone. The model rendered those strings as visible text inside every tile. The words were metadata in the prompt; the model treated them as content.

**Rule:** describe zones by position and content, never by label name. Write "a small monospaced lowercase text label positioned top-left inside the tile" — do not write "a TOP LABEL zone at the top-left of the tile."

### Pin specific sizes, not vague ones

Fulcrum v1 said the central hexagon should be "slightly larger" than the outer six. The model rendered it slightly **smaller**, leaving the hierarchy ambiguous. v2 said "approximately 20% larger in width." That rendered correctly.

**Rule:** give the model a number, not an adjective, whenever the scale of one element relative to another matters.

### Dot / small-element placement by vertex, not edge

Fulcrum v1 placed the Terminal Green dot "just outside the upper-right edge of the central hexagon." Multiple generations straddled the edge, with the dot touching or overlapping the hex outline. v2 said "above the top vertex, offset by roughly one dot-diameter of clear negative space." Cleaner.

**Rule:** reference vertices (points) not edges (lines). The model hugs edges; vertices give it a single anchor point.

### Surgical refinement preserves what worked

When a generation lands 80% right, the temptation is to rewrite the prompt. Don't. Change only the one axis that drifted and keep everything else verbatim.

**Rule:** name the single drift in the evaluation, pin it in the prompt, regenerate. If three things drifted, fix the one that matters most and live with the other two until the composition changes enough to warrant a full rewrite.

### Family typography consistency requires pinning a single typeface

The shipped skills prompt said "Berkeley Mono or IBM Plex Mono." The shipped empowerment-brief prompt said the same. The model picked different mono faces across the two generations — a rounder humanist mono for skills, a more geometric mono for empowerment-brief. The brand's canonical mono (per `src/styles/global.css` and the storyboard) is IBM Plex Mono alone.

**Rule:** pin **IBM Plex Mono** alone in every text-bearing prompt. Do not leave the font open to interpretation. If an existing illustration in the family has already rendered text, optionally pass it as a typography reference image when generating the next one.

### Verbatim text must be forbidden from expanding

Gemini will invent placeholder words to fill rows if the prompt doesn't forbid it. Early skills prompts produced renderings with `OUTPUT ✓✓✓✓` and `[SHAPED OUTPUT]` placeholder filler.

**Rule:** in every text-bearing prompt, include "no extra words, no additional punctuation, no additional characters, render each line verbatim with no substitutions" in the rendering-row spec and restate it in the exclusions block.

### Capacity limits are real

Both `gemini-2.5-flash-image` and `gemini-3-pro-image-preview` hit capacity caps multiple times during the redesign session (via the CLI surface). The web editor has its own quota but similar patterns.

**Rule:** generate in batches of 2–3 variants per run, not 8. Expect retries. If capacity is hard-capped, revisit later rather than switching to Flash for brand-critical work.

### Claude writes prompts; Chris generates images

Clean separation. Claude's deliverable is a copy-paste-ready prose block. Chris runs the Gemini web editor. Claude doesn't generate images from its side of the conversation.

---

## 6. Tool surface: Gemini web editor

Current tool, subject to change. This section is the most likely to go stale when Google changes the UI or Chris switches generators; it's scoped to a single heading so a future swap is a localized edit.

### Where to paste

- **Primary:** Google AI Studio at `aistudio.google.com`, with model set to `gemini-3-pro-image-preview`. AI Studio offers direct model control and clean aspect/count controls.
- **Fallback:** The image-generation mode in `gemini.google.com` (consumer Gemini). Acceptable but less explicit about which model is running.

### Model selection

Always `gemini-3-pro-image-preview` (a.k.a. Nano Banana Pro) for brand-critical illustrations. Pro has better prompt adherence, better text rendering, and a "thinking" pass that drafts compositions before the final render.

The Flash variants (`gemini-2.5-flash-image`, `gemini-3.1-flash-image-preview`) are faster and cheaper but render text less reliably and drift more on hex-role discipline. Use Flash only for throwaway iteration, never for the final artifact.

### Controls to set

Before generating:

- **Aspect ratio:** 16:9 for project-card illustrations. 1200×630 for OG. 1080×1080 for square social.
- **Count:** 2–3 variants per run. Randomness is real; one-shot generation is a lottery.

### Prompt formatting for paste

Paste the prompt as a single block of plain prose, preserving the sectioned layout (composition, lighting, style, palette roles, exclusions). Square brackets, hex codes, and verbatim text strings paste cleanly. No Markdown formatting, no code fencing.

When Claude produces a prompt for Chris, the output should be ready to paste as-is — no surrounding explanation inside the prompt itself.

### Download

Save the chosen generation as `.jpg` to Chris's Downloads folder with its default Gemini-timestamped filename. The repo-apply step (§7) converts and renames.

---

## 7. End-to-end workflow

The sequence that shipped three illustrations in a single session. Steps split between Claude (prompt craft) and Chris (generation + review).

### Claude's part

1. **Audit the real project first.** Read the repo and visit the live site before picking a metaphor. Fulcrum's hex lattice came from "mental models as a decision lattice." skills' pipeline-as-pipeline came from reading the canonical pipeline in the repo's README. empowerment-brief's 5-pillar grid came from auditing the actual methodology. Stock metaphors are weaker than project-grounded metaphors every time.
2. **Propose 2–3 metaphor options to Chris, pick one.** Get alignment on the concept before writing the prompt.
3. **Draft the prompt using the canonical template.** Fill all five fields. Include the hex-with-role-labels block (§9 B.1). Include the exclusions block (§9 B.2). If text is rendered, include the typography block (§9 B.3). Output a single copy-paste-ready prose block.

### Chris's part

4. **Paste into the Gemini web editor.** AI Studio with `gemini-3-pro-image-preview` selected. Set aspect ratio and count of 2–3 variants.
5. **Generate and share results back with Claude.** Either pick the strongest variant or share all variants for evaluation.

### Claude's part again

6. **Evaluate the output against intent.** Name every drift: palette discipline, shape accuracy, text rendering, composition, family coherence.
7. **Surgical refinement.** Change only the axis that drifted. Produce a revised prompt for Chris to paste.

### Together

8. **Apply to the repo.** Convert jpg → png:
   ```
   sips -s format png "<downloaded>.jpg" --out src/assets/projects/<id>.png
   ```
   Import in `src/data/projects.ts` (add to the `LeadProject` entry or supporting entry). Run `pnpm build` to verify.
9. **Verify via Playwright.** Navigate to `/` at 1440×900 and 390×844, screenshot, confirm the new asset renders at card scale.

---

## 8. Appendix A — Shipped illustrations

Every shipped prompt in full, as it was run during the redesign session. Each is followed by a "what landed / drifted / apply retrospectively" block. These are archaeology — the prompts reflect what was run at the time, not necessarily what we'd write today. Post-mortem notes flag where a future run should diverge from the shipped text.

### A.1 — Fulcrum (hexagonal decision lattice)

**Project:** AI advisory platform that applies mental models and structured reasoning to high-stakes decisions.

**Prompt (v2, refined):**

```
A minimalist architectural line diagram of a hexagonal decision lattice:
seven regular hexagons arranged in a honeycomb — one centered, six surrounding
at equal radius, each connected to the center by a single thin line. Inside
each outer hexagon: three short horizontal tick marks of varying length,
stacked vertically, like score bars on a scorecard. The central hexagon is
filled solid and is noticeably larger than the outer six — approximately 20%
larger in width — anchoring the composition as the chosen option.

A single small circular dot sits outside the central hexagon, positioned just
beyond its upper-right edge, offset by roughly one dot-diameter of clear
negative space between the dot and the hex outline. The dot must not touch
or overlap the hexagon.

Composition: centered on the canvas, both horizontally and vertically,
16:9 aspect ratio, plan view (straight top-down, not isometric, not
perspective). Lattice occupies the middle 55% horizontally; generous
negative space left and right.

Lighting: flat and even. No cast shadows, no ambient light, no gradients.

Style: single-stroke technical line illustration in the visual language of
an architect's blueprint or a Moleskine field-notebook sketch. Consistent
stroke weight across every line. Every outer hexagon is an open outline;
the central hexagon is the only filled shape.

Color palette (use exactly these hex values for the roles stated, nothing else):
- Background: #1A1F2E (deep navy — fills the entire canvas)
- Line color: #F4EEE1 (warm off-white — every hex outline, every connection
  line, and most score tick marks inside the outer hexagons)
- Accent fill: #C1502E (terracotta — fills the central hexagon only, one use)
- Secondary accent: #2F5D50 (muted forest green — exactly one of the three
  score tick marks in each outer hexagon is this color; the other two remain
  warm off-white. Keep it consistent across all six outer hexagons.)
- Confidence marker: #7AE582 (terminal green — the single small status dot
  outside the central hexagon, approximately 10–12px diameter)

Exclusions. No text, no labels, no numbers, no UI elements, no buttons, no
toolbars, no cursors. No purple, no cyan, no magenta, no neon. No gradients,
no glows, no drop shadows, no bloom, no lens flare. No photo textures,
no 3D rendering, no isometric perspective, no drop-shadowed depth. No
additional decorative elements outside the hexagonal lattice.
```

**What landed.** Palette locked in. Plan view, flat rendering, blueprint voice. Central hex as the only filled shape. Six outer hexes at equal radius with score ticks.

**What drifted.** Green dot straddled the central hex's edge in v2 (same issue as v1, not fully fixed by "must not touch or overlap" language — the "upper-right edge" anchor was the problem). Score-tick count sometimes crept from three to four. Both drifts were judged acceptable at card scale and the illustration shipped.

**Apply retrospectively.** For a re-run today, reframe the dot placement from "upper-right edge" to "above the top vertex" (per §5 lesson: vertices beat edges). No other changes needed.

---

### A.2 — skills (pipeline-as-pipeline)

**Project:** Claude Code skill pipeline that turns shaped engineering work into reusable, invocable skills. Repo lives at `~/Desktop/skills`, README pins the canonical pipeline as `/shape → /research → /write-a-prd → /prd-to-issues → /execute → QA → /pre-merge → merge → /compound → cleanup`.

**Prompt (2E, the pipeline-as-pipeline framing that replaced earlier single-invocation attempts):**

```
A minimalist architectural line illustration of a stylized terminal
printout: five horizontal rows of mono-width text stacked vertically,
reading top to bottom like a pipeline progress log. Every character is
rendered in a clean monospaced typeface with uniform stroke weight —
the rows feel like lines from a Berkeley Mono or IBM Plex Mono terminal
session.

Exact row content from top to bottom (render each line verbatim, no
substitutions, no extra words, no additional punctuation, no extra
characters):

Row 1:     /shape          ✓
Row 2:     /research       ✓
Row 3 (HIGHLIGHTED):     /write-a-prd
Row 4:     /execute
Row 5:     /compound

Row 3 is the HIGHLIGHTED row: rendered as a single continuous terracotta-
filled rectangular bar that wraps the entire text "/write-a-prd" with
consistent padding around the text. The text inside this bar remains
the warm off-white line color, set against the terracotta fill. The
bar's width is only as wide as the text it wraps — it does not extend
to fill the whole row. All other rows sit on the dark navy background
with no fill behind them.

Typography: clean monospaced sans-serif, fixed character width, regular
weight (not bold), uniform stroke weight across every character. All
text lowercase as shown. No italic, no stylized glyphs, no kerning
adjustments, no ligatures.

Row heights consistent. Vertical gaps between rows consistent and
roughly equal to one row-height. All slash-commands ("/shape",
"/research", "/write-a-prd", "/execute", "/compound") are left-aligned
to the same vertical start column. The two visible checkmarks on rows
1 and 2 are right-aligned to the same vertical end column, so the two
checks sit directly above each other.

Composition: the transcript occupies the middle 55% of the canvas
horizontally, centered both vertically and horizontally within the
canvas. 16:9 aspect ratio. Generous negative space above, below, and
to the sides.

Lighting: flat and even. No cast shadows, no ambient gradients, no
glow behind the text.

Style: single-stroke technical line illustration in the visual language
of an architect's blueprint or a Moleskine field-notebook sketch. The
composition sits on the dark navy canvas directly — no frame, no window
chrome, no card outline, no paper texture behind the transcript, no
arrows between the rows, no vertical connecting lines between the rows.

Color palette (use exactly these hex values for the roles stated,
nothing else):
- Background: #1A1F2E (deep navy — fills the entire canvas)
- Primary text color: #F4EEE1 (warm off-white — every character of
  every slash-command on every row, including "/write-a-prd" set
  inside the terracotta bar on row 3)
- Accent fill: #C1502E (terracotta — the single continuous rectangular
  fill wrapping the text "/write-a-prd" on row 3 only, one use)
- Confidence marker: #7AE582 (terminal green — the "✓" checkmark glyph
  on row 1 AND the "✓" checkmark glyph on row 2; both check glyphs are
  terminal green. No other terminal green anywhere.)

Note: do not use forest green for anything in this illustration. There
are no ">" prompt markers on any row. There is no cursor block.

Exclusions. No additional text, no extra lines, no placeholder words,
no other slash-commands, no lorem ipsum, no fake syntax highlighting,
no comments, no numbering, no brackets around "/write-a-prd" (the
terracotta fill is the highlight, not brackets). No window chrome, no
title bars, no traffic-light dots, no scroll bars, no tab markers, no
line numbers, no timestamps, no arrows, no connecting lines. No purple,
no cyan, no magenta, no neon. No gradients, no glows, no drop shadows,
no bloom, no lens flare, no text outer-shadow. No photo textures, no
3D rendering, no perspective. No frames, borders, or background plates
behind the transcript.
```

**What landed.** Five slash-commands rendered verbatim and correctly spelled. Terracotta bar wraps `/write-a-prd` cleanly. Two Terminal Green checkmarks, right-aligned above each other on rows 1 and 2. Pipeline-as-pipeline metaphor communicates the real product structure in one glance.

**What drifted.** Nothing structural. Minor: the rendered mono face was humanist / rounded rather than the geometric feel of IBM Plex Mono.

**Apply retrospectively.** Update the "Typography:" section to pin **IBM Plex Mono** alone — remove "Berkeley Mono or" from the opening sentence. This is the §5 lesson about family typography consistency. When regenerating, also consider passing the empowerment-brief rendering (A.3) as a reference image to anchor the mono face across the family.

### A.2 pre-history — the pivot from 2D to 2E

The earlier prompt for skills (2D) framed it as a single invocation: `/shape` → `shaped` → `[ invocable ]` → `✓ done` → `>`. That was rendered cleanly and looked good, but an audit of the real skills repo revealed that the project is not a single invocation — it's a named canonical pipeline of ~10 skills handed off in sequence.

Lesson encoded: metaphor accuracy beats visual polish. If the illustration misrepresents what the product is, redirect and redraft even if the earlier rendering was clean.

---

### A.3 — AI Empowerment Brief (pillar grid)

**Project:** Interactive educational platform teaching a structured AI methodology through 25+ custom visualizations. Repo at `/Users/christopherlacey/Documents/ai-empowerment-brief/product-plan/empowerment-brief`. Live at `ai-enablement-gamma.vercel.app`. The methodology is six chapters: foundation, prompt, context, mcp, skills, agents.

**Prompt (3B, agents-highlighted, with all-six-labels-bracketed variant selected):**

```
A minimalist architectural line illustration of a 2×3 grid of six
rectangular tiles representing the six chapters of an educational
methodology. Each tile is the same size and proportion (roughly 1.4:1
landscape), with consistent uniform gaps between tiles both horizontally
and vertically. The grid is centered on the canvas.

Each tile has two zones:
- A TOP LABEL zone: a small monospaced lowercase text label positioned
  top-left inside the tile, padded from the tile's inner corner by a
  consistent small margin.
- A DIAGRAM zone: the remaining space below the label, containing a
  small abstract mini-diagram in warm off-white lines that hints at that
  chapter's content. Each mini-diagram is simple — short tick marks,
  small circles, short connecting lines, or small rectangles — nothing
  ornate.

Tile positions and content (left to right, top to bottom):

Row 1:
  [foundation] — three short horizontal bars of increasing length stacked
                vertically in the diagram zone (a scaling / growth motif)
  [prompt]    — five short horizontal tick marks of varying length
                stacked vertically (a structured multi-part block motif)
  [context]   — a single long horizontal rectangle with a small vertical
                fill-marker partway across, suggesting a progress bar
                (a context-window filling motif)

Row 2:
  [mcp]       — three small circles connected by two short straight lines,
                suggesting a tiny node network (a tool-wiring motif)
  [skills]    — three small rectangles offset diagonally down-and-right,
                suggesting a stack of cards (a packaged-expertise motif)
  [agents]    — three small dots connected left-to-right by two short
                arrow shapes, suggesting a flow sequence (a multi-step
                motif). THIS IS THE HIGHLIGHTED TILE.

The HIGHLIGHTED tile is the "agents" tile, positioned in row 2, right
column. It is rendered with its entire body filled solid in terracotta.
Inside the highlighted tile:
  - The label text "agents" is rendered in warm off-white on the
    terracotta fill
  - The mini-diagram (three dots connected by two arrows) is rendered
    in warm off-white lines on the terracotta fill
  - A single small terminal-green checkmark glyph "✓" is positioned at
    the bottom-right corner of the tile, inset from the tile's inner
    edge by a small consistent margin — the completion marker

All other five tiles are open-outline rectangles with warm off-white
borders, labels, and diagrams on the deep navy background — no fill.

Composition: the grid occupies the middle 75% of the canvas horizontally
and is centered both vertically and horizontally. 16:9 aspect ratio.
Generous negative space on all sides.

Lighting: flat and even. No cast shadows, no ambient gradients, no glow
behind the tiles or the text.

Style: single-stroke technical line illustration in the visual language
of an architect's blueprint or a Moleskine field-notebook sketch.
Consistent 2px stroke weight across every tile outline, every mini-diagram
line, and every character of label text. The composition sits on the
dark navy canvas directly — no frame, no window chrome, no card outline
around the grid, no paper texture.

Typography: clean monospaced sans-serif, fixed character width, regular
weight (not bold), uniform stroke weight across every character. All
tile labels are lowercase exactly as shown. No italic, no stylized
glyphs, no kerning adjustments, no ligatures.

Color palette (use exactly these hex values for the roles stated,
nothing else):
- Background: #1A1F2E (deep navy — fills the entire canvas)
- Line color: #F4EEE1 (warm off-white — every tile outline, every label
  on the five unfilled tiles, every mini-diagram line on the five
  unfilled tiles, and the label "agents" plus the mini-diagram inside
  the terracotta-filled tile)
- Accent fill: #C1502E (terracotta — the entire body fill of the
  "agents" tile only, one use)
- Confidence marker: #7AE582 (terminal green — the single "✓" checkmark
  glyph at the bottom-right corner inside the terracotta "agents" tile.
  No other terminal green anywhere.)

Exclusions. No additional text beyond the six tile labels exactly as
specified. No numbers, no chapter numbers, no pillar numbers, no lorem
ipsum, no placeholder words, no extra labels, no subtitles, no tooltips.
No window chrome, no title bars, no traffic-light dots, no scroll bars,
no tab markers, no arrows between the tiles, no connecting lines between
the tiles (the arrows between dots inside the "agents" mini-diagram are
allowed; arrows between full tiles are not). The tiles sit in a plain
grid with only whitespace between them.

No purple, no cyan, no magenta, no neon, no sky blue. No gradients, no
glows, no drop shadows, no bloom, no lens flare, no text outer-shadow.
No photo textures, no 3D rendering, no perspective. No frames, borders,
or background plates behind the grid.
```

**What landed.** All six tiles in correct positions, correct mini-diagrams, correct bracket-wrapped labels. `agents` tile filled terracotta in bottom-right with Terminal Green ✓ at bottom-right corner. Palette discipline perfect.

**What drifted.** On an earlier variant the model dropped the brackets from the highlighted-tile label (`agents` rendered without its `[ ]` wrapper while the other five kept theirs). The selected final variant got brackets on all six — no action needed.

**Apply retrospectively.** Two fixes before rerunning this prompt:

1. **Remove the zone-naming language.** The early 3A variant leaked `TOP LABEL` and `DIAGRAM` as visible text inside every tile because the prompt named those zones (§5 lesson: describe zones without naming them). Rewrite the "Each tile has two zones:" paragraph to describe the upper and lower areas by position and content only, without the words `TOP LABEL` or `DIAGRAM`. Example: *"Each tile has a small monospaced lowercase text label in its upper-left corner, with a small abstract mini-diagram filling the remaining space below."*
2. **Pin IBM Plex Mono alone.** Same fix as A.2. Remove any hedged typography language; pin `IBM Plex Mono` as the typeface.

---

## 9. Appendix B — Reusable snippets

Copy-pasteable blocks. When drafting a new prompt, start by filling these in; the rest of the prompt is the metaphor-specific prose that describes the shapes and their relationships.

### B.1 — Palette role paragraph

Use for standard Ink Well-background project-card illustrations. Swap the role descriptions after each hex to match what each color does in the specific illustration.

```
Color palette (use exactly these hex values for the roles stated, nothing else):
- Background: #1A1F2E (deep navy — fills the entire canvas)
- Line color: #F4EEE1 (warm off-white — every structural line, every outline,
  every text character on unfilled elements)
- Accent fill: #C1502E (terracotta — fills the one chosen shape only, one use)
- Secondary accent: #2F5D50 (muted forest green — supporting marker role,
  used sparingly)
- Confidence marker: #7AE582 (terminal green — the single small dot or
  "✓" glyph, approximately 10–12px. No other terminal green anywhere.)
```

### B.2 — Exclusions block

Paste at the end of every illustration prompt. Append illustration-specific exclusions above this block if needed (e.g., "no additional slash-commands" for a terminal-receipt layout).

```
Exclusions. No additional text beyond what is specified above. No lorem
ipsum, no placeholder words, no extra labels, no subtitles, no tooltips,
no numbering, no timestamps, no line numbers, no tab markers. No window
chrome, no title bars, no traffic-light dots, no scroll bars, no menu
bars, no cursor arrows. No purple, no cyan, no magenta, no neon, no sky
blue. No gradients, no glows, no drop shadows, no bloom, no lens flare,
no text outer-shadow. No photo textures, no 3D rendering, no isometric
perspective, no vanishing-point perspective, no drop-shadowed depth. No
frames, borders, decorative flourishes, or background plates behind the
subject.
```

### B.3 — Typography block for text-bearing illustrations

Use when the illustration will contain rendered text. Drop in directly after the composition/style sections.

```
Typography: IBM Plex Mono, fixed character width, regular weight (not
bold), uniform stroke weight across every character. All text rendered
in lowercase unless a pillar name or proper noun forces otherwise. No
italic, no stylized glyphs, no kerning adjustments, no ligatures, no
small caps.

Render each text string exactly as specified, verbatim, with no
substitutions, no extra words, no additional punctuation, no additional
characters. Line lengths and spacings match what the prompt specifies;
do not fill unspecified rows with placeholder text.
```

### B.4 — OG / social palette-inversion block

Use for OG images and social cards. Replaces B.1 in the prompt.

```
Color palette (use exactly these hex values for the roles stated, nothing else):
- Background: #F4EEE1 (warm off-white Legal Pad — fills the entire canvas)
- Foreground: #1A1F2E (deep navy Ink Well — every structural line, every
  character of serif or mono text, every outline)
- Accent fill: #C1502E (terracotta — fills the one chosen shape or
  highlights the one chosen phrase, one use)
- Confidence marker: #7AE582 (terminal green — a single small dot or
  "✓" glyph, approximately 10–12px, only if a completion / verification
  semantic is present in this composition)

Typography: Source Serif 4 for headlines (regular or medium weight).
IBM Plex Mono for receipts, eyebrows, timestamps, and any monospaced
detail (regular or medium weight). No sans-serif system fonts, no
Arial, no Helvetica.
```

---

*This doc is versioned with the repo. When a fourth illustration ships, append it to §8 and promote any new lessons to §5.*
