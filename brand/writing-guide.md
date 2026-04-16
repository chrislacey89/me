# Writing Guide

**One sentence:** Every piece of writing on this site makes a single claim, names the mechanism behind it, and earns the reader's next paragraph.

This defines the skeleton. `chris-lacey-brand-storyboard.md` defines the voice. Use both.

---

## The One Test

Before anything ships: summarize it in one sentence. **If a stranger wouldn't read past that sentence, the piece isn't ready.**

That sentence is the piece. Every paragraph is defending it. Passing the test isn't *"can I summarize this"* — it's *"is the summary worth the next paragraph."*

---

## Universal Rules

- **Every heading is a promise the paragraph keeps.** If the paragraph doesn't deliver, the heading is wrong — not the paragraph.
- **Make a claim, not a label.** Titles and headings assert. *"Understanding Generators"* is a label. *"Generators control execution over time"* is a claim.
- **Name the thing.** Vague (*"this approach"*) costs the reader a second pass. Named (*"a value that knows who depends on it"*) earns the next paragraph.
- **Cut the tutorial throat-clearing.** *"Let's walk through…"*, *"In this post we'll…"*, *"First, a bit of background…"* — all gone.
- **Chronology is for journals.** Don't tell it as you lived it. Reshape for clarity.
- **Every section reminds the reader what's at stake.** Transitions carry weight; stakes carry forward. A section that doesn't renew the stakes is a section the reader abandons.
- **Bias to density.** Fewer sections, stronger transitions, shorter sentences that pull more weight.

---

## Template A — Articles

For essays, writing posts, long-form docs. Six sections, in order.

### 1. Title — a claim

Declare a position. If the title could be a blog category, it's too weak.

### 2. Opening — 3–5 sentences

Establish the core idea immediately. Shape that works:

> Most X does Y.
> This one does Z.
> That difference matters because…

Claim, contrast, stakes. If the reader bails here, they still know your position.

### 3. The Tension

Make the problem real. What's hard? Where do people get it wrong? Why should anyone care? Keep it tight. The tension is the hook, not the history lesson.

### 4. The Mechanism — the most important section

What is actually happening under the hood.

- Prefer one or two key ideas over full coverage.
- Use code and examples only when they clarify the mechanism.
- Name the thing cleanly.

If one sentence ends up screenshot-quoted, it almost always comes from here. Write accordingly.

### 5. The Fit

Why does this mechanism match this problem? The senior-comp section — tradeoffs, constraints, when it works and when it doesn't. Don't argue it's universally good; argue it's right here, and name the conditions.

### 6. The Takeaway

A general principle, not *"that's how it works."*

- *"Generators aren't about producing values. They control when work happens."*
- *"Signals trade explicit control for implicit structure."*

If someone highlights one sentence from the whole piece, this is that sentence.

### Optional sections (use sparingly)

- **Example.** Short, focused, in service of the mechanism. Never an extended walkthrough.
- **Personal reflection.** Non-technical pieces only. Same structure — claim, tension, implication.

---

## Template B — Project Pages

For `/projects/[slug]` pages, populated in `src/data/projects.ts`. Seven sections, in template order. Load-bearing is the **move**.

### Claim — serif, one sentence

The project's thesis. What you'd say if someone asked "what is it" and you had eight words.

- Bad: *"A site for my portfolio."*
- Better: *"A career-long archive that compounds into a search surface."*

### Context

The situation the work was responding to. Two to four sentences. Answer: what made this worth building? Start with the condition, not with yourself — avoid *"I started this project because…"*.

### The move — senior-comp-gated

The decision you made and why it was right.

- State the decision plainly.
- Name the alternative you rejected, and the cost of picking this over that.
- End with what the decision bought you.

This paragraph is not *"what I built."* It is *"what I decided, and why that was load-bearing."*

### Artifact

What got built — shape, materials, interesting structural choices. Two to four sentences. Don't re-describe the claim. The artifact is the *shape* — the architectural moves that wouldn't be obvious from the claim alone.

### Cost / return

What the project took, and what compounded. Time, energy, or scope on one side; durable capability, shipped surfaces, or clarified thinking on the other. One honest line on each side beats four vague ones.

### Receipts — mono, terse

Three to six lines. Metrics, artifacts, shipped surfaces, links. Each line is a thing a reader could verify.

- *"28 custom visualizations across six frameworks"*
- *"4 repos converted to skills; 2 in weekly use"*
- *"`research.md` archived at depth STANDARD; 13 pitfalls documented"*

No adjectives.

### Pull quote — Terracotta, one line

The one line a reader should walk away with. Usually an amplified restatement of the takeaway. Never a quote from someone else — this is *your* line about the project.

---

## The Editing Passes

Drafts are for getting the argument down. Editing is where the voice is.

### Pass 1 — banned words

Strip: *synergistic · revolutionary · disruptive · 10x · seamless · magical · effortless · AI-powered™ · fast · innovative*. If one survives, there's a sharper noun underneath.

### Pass 2 — tutorial tells

Cut openings like *"Let's walk through…"*, *"In this post…"*, *"First, a bit of background…"*, *"So,"*, *"Now,"*. Throat-clearing, not writing.

### Pass 3 — chronology

If the piece is structured *"first I tried X, then Y didn't work, then I discovered Z"* — restructure. Lead with Z; use X and Y as the tension.

### Pass 4 — compression

Each sentence, one question: load-bearing or glue? If glue, cut or absorb. Two dense sentences beat five thin ones.

### Pass 5 — the one-sentence test

Write the piece's one-sentence summary without looking at the draft. If you can, you're done. If you can't, the argument isn't clear — which means the piece isn't clear.

---

## Quick Reference

### Hero adjectives

deliberate · legible · load-bearing

### Supporting adjectives

patient · teacherly · composable · unshowy · honest · spare · structural · annotated · reproducible · verified

### Banned words

synergistic · revolutionary · disruptive · 10x · seamless · magical · effortless · AI-powered™ · fast · innovative

### Tonal patterns to reach for

- *"Most X does Y. This one does Z."*
- *"The cost was A. The return was B."*
- *"This works when [condition]. It breaks when [condition]."*
- *"Tests green ≠ done."*

### Tonal patterns to avoid

- *"Let's walk through…"*
- *"I'm excited to share…"*
- *"Here's what nobody's talking about…"*
- *"In this post, we'll…"*
- Emoji in headings
- Threaded *"1/"* Twitter cadence
- Rocket and fire emojis anywhere

---

## Using This Doc with an LLM

When asking an LLM to draft or edit, include:

1. The relevant template (article or project page).
2. The piece's one-sentence summary.
3. The concrete inputs the LLM cannot infer — decisions made, numbers, names, artifacts, repos.

Then ask for one section at a time. Voice survives short-scope drafting; it drifts at long scope. Edit between sections — don't batch.

For project pages specifically, the move paragraph is the gate. The LLM can draft the rest however it likes; the move is rewritten until Chris says it clears the senior-comp bar.

---

## Pre-Publish Checklist

- [ ] Title is a claim, not a label
- [ ] Opening makes the claim in 3–5 sentences
- [ ] Mechanism names the thing cleanly
- [ ] Fit paragraph states the tradeoff, not just the benefit
- [ ] Takeaway is a reusable principle, not a summary
- [ ] No banned words
- [ ] No tutorial throat-clearing
- [ ] One-sentence summary of the piece exists and is defensible
- [ ] If the piece is a project page, the move paragraph has cleared Chris's senior-comp read

---

*This guide is written to its own rules. If it stops being true, change the guide, not the writing.*
