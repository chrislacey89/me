import type { ImageMetadata } from 'astro'
import empowermentBriefImage from '../assets/projects/empowerment-brief.png'
import fulcrumImage from '../assets/projects/fulcrum.png'
import skillsImage from '../assets/projects/skills.png'

export interface ProjectDetail {
  /** Serif one-sentence thesis displayed at the top of the detail page. */
  claim: string
  /** Paragraph setting up the situation the work was a response to. */
  context: string
  /** The load-bearing paragraph: the decision made and why it was the right one. */
  move: string
  /** What was built — shape, materials, and the interesting structural choices. */
  artifact: string
  /** What the work cost and what it returned. */
  costReturn: string
  /** Short mono-voiced lines: metrics, artifacts, shipped surfaces, links. */
  receipts: string[]
  /** Terracotta pull quote — the one line a reader should walk away with. */
  pullQuote: string
}

export interface LeadProject {
  id: string
  title: string
  /** Release year, used in meta rows and detail headers. */
  year: string
  /** Short category label (e.g. "Decision software") shown in mono meta strips. */
  kicker: string
  /** Short card blurb on the projects index and evidence strip. */
  blurb: string
  image?: ImageMetadata
  imageAlt?: string
  github?: string
  liveUrl?: string
  detail: ProjectDetail
}

export interface SupportingProject {
  id: string
  title: string
  /** One-line claim shown in the supporting strip. */
  claim: string
  /** Outbound link — supporting entries do not get a detail page. */
  href: string
  external?: boolean
}

export const leadProjects: LeadProject[] = [
  {
    id: 'fulcra',
    title: 'Fulcra',
    year: '2025',
    kicker: 'Decision software',
    blurb:
      'AI advisory platform that applies mental models and structured reasoning to high-stakes decisions.',
    image: fulcrumImage,
    imageAlt:
      'Stylized hexagonal network — a central terracotta hex surrounded by six outlined hexes holding lines of code, suggesting structured reasoning pulled from many models.',
    github: 'https://github.com/chrislacey89/fulcrum',
    detail: {
      claim:
        "Fulcra grounds every high-stakes decision in a named framework — not in the model's vibes.",
      context:
        "Ask a chatbot for guidance on a hard decision and it flatters you, equivocates, and pads the answer with bullet points. Deliberate decisions don't come from that. They come from being clear about two things: the assumptions behind the situation, and the framework you're using to reason through it. Most chat interfaces name neither, so nothing is auditable and the user has no real basis to trust the recommendation.",
      move: "The spark was Ray Dalio's Principles: good decisions come from being explicit about the frameworks you're using, not from situational improvisation. The move was to wire that discipline into a chat agent. Most assistants expand the conversation. Fulcra funnels. It picks a named framework from a curated library for the situation you've brought it (razors, mental models, cognitive-bias checks), surfaces it for your assent, and reasons strictly inside it. The alternative is a universal assistant willing to opine on anything — which flatters the user and washes out the recommendation. Naming the framework first makes the reasoning auditable. It gives you something concrete to push back on before you accept the answer.",
      artifact:
        "Fulcra is a decision-assistant app with two halves: a curated library of 151 frameworks across seven categories (decision-making, risk, strategic thinking, mental clarity, problem-solving, communication, learning), and an agent that reasons strictly inside the framework you've picked. Responses follow a fixed shape: recommendation, clarifying questions, low-cost experiments to run, a risk watchlist of cognitive biases to watch for, and citations back to the frameworks consulted. Two depth modes right-size the work: Decision mode for a 150–300 word action-oriented answer, Strategy mode for a 600–1000 word multi-viewpoint read with second-order thinking. Retrieval uses intent detection, HyDE, Reciprocal Rank Fusion, and LLM reranking, so the framework chosen for your problem isn't the first vector-search hit.",
      costReturn:
        'Without it, a fluent-sounding recommendation you have no way to audit or push back against. With it, a named framework you can argue with, a recommendation grounded in it, and the same frame available the next time a similar decision comes up.',
      receipts: [
        '151 frameworks across 7 categories: decision-making, risk, strategic thinking, mental clarity, problem-solving, communication, learning',
        'Response shape: recommendation · clarifying questions · experiments · risk watchlist · framework citations',
        'Decision mode (150–300 words) and Strategy mode (600–1000 words, multi-viewpoint)',
        'Retrieval: intent detection → HyDE → Reciprocal Rank Fusion → LLM reranking',
        'Built on Mastra, Next.js, Drizzle, Clerk; Playwright e2e',
        'github.com/chrislacey89/fulcrum',
      ],
      pullQuote: 'You can argue with a framework. You cannot argue with vibes.',
    },
  },
  {
    id: 'skills',
    title: 'Skill Kit',
    year: '2025',
    kicker: 'Claude Code pipeline',
    blurb:
      'A Claude Code skill pipeline that turns shaped engineering work into reusable, invocable skills.',
    image: skillsImage,
    imageAlt:
      'A vertical list of slash-command skills — /shape and /research checked off, /write-a-prd highlighted in terracotta, with /execute and /compound still queued below.',
    github: 'https://github.com/chrislacey89/skills',
    detail: {
      claim:
        "Skill Kit grounds every Claude Code decision in the industry's best thinking — not gut feelings.",
      context:
        "Most LLM-assisted workflows treat each feature as an isolated prompt: shape it, ship it, forget it. Two opportunities get left on the table: each feature could leave the system smarter about the codebase, and the pipeline's decisions could be grounded in engineering literature rather than improvised from memory and training data. Skill Kit wires both in.",
      move: "The interesting choice wasn't the plumbing of shippable skills. That pattern is well-trodden. It was wiring each stage to reach into distilled book knowledge rather than its own invented conventions. `/triage-issue` reaches for Meadows' systems archetypes and Zeller's systematic debugging when a bug hits. `/pre-merge` reviews architecture against Ousterhout's A Philosophy of Software Design, not a generic checklist. `/shape` works off Kahneman's debiasing frames and Duke's decision-quality-vs-outcome-quality split. Most prompt libraries work the other way: their \"best practice\" is whatever the author could remember writing down. Distillation-first is what turns the reference from decorative to load-bearing.",
      artifact:
        'Skill Kit ships 23 skills across seven pipeline stages plus nine side-route skills for orientation, recovery, and review. Each is a standalone `SKILL.md` with explicit preconditions, installable as a pack. Alongside the main pack, [`content-to-skill`](https://chrislacey89.github.io/content-to-skill/) converts PDFs and EPUBs into progressive-disclosure reference skills that populate a personal library the pipeline reaches into when a stage calls for expert grounding. `/pre-merge` runs an eight-dimension architecture review against that library, not a generic PR checklist.',
      costReturn:
        "Without it, you're YOLO-ing: shipping whatever best practice you happened to remember and hoping it's the one that mattered. With it, compounding knowledge: the same mistake never gets made twice.",
      receipts: [
        '23 skills across 7 pipeline stages + 9 side routes',
        'All PRDs, slices, and lineage live in GitHub issues and PRs',
        'Personal library of distilled engineering references consulted by the pipeline (Ousterhout, Meadows, Beck, Kahneman, Singer, Evans, Fowler, …)',
        '/compound → docs/solutions/ → /research reads it on the next feature',
        "`npx skills@latest add chrislacey89/skills --skill '*'`",
        'MIT · github.com/chrislacey89/skills',
      ],
      pullQuote: "The books aren't decoration — they're dependencies.",
    },
  },
  {
    id: 'empowerment-brief',
    title: 'AI Empowerment Brief',
    year: '2024',
    kicker: 'Educational platform',
    blurb:
      'Interactive educational platform teaching a structured AI methodology through 25+ custom visualizations.',
    image: empowermentBriefImage,
    imageAlt:
      'Six labeled framework tiles arranged in a grid — foundation, prompt, context, mcp, skills, and agents — each with a small line-art glyph; the agents tile is filled terracotta with a checkmark.',
    liveUrl: 'https://ai-enablement-gamma.vercel.app/',
    detail: {
      claim: 'Most AI training teaches tools — this one teaches where to point them.',
      context:
        "Plenty of companies have performative AI: leaders throw a tool at every problem because they can, and the workflows underneath stay the same. The fluency is real; the leverage isn't. On a digital-transformation team of marketers and project managers, the question wasn't which model or which app. It was where this actually pays back. Nobody had built the scaffolding to answer it, and no one had been tasked to. I pitched the education effort myself.",
      move: "Everyone has access to the tools now. The differentiator is a solid grasp of the fundamentals plus the judgment to apply them at the highest-leverage bottleneck in your actual workflow. So the teaching is a progression, not a toolbox. Six framework layers, in order: foundation, prompt, context, MCP, skills, agents. Each names the bottleneck it solves and the scarce resource it unlocks. The alternative is performative AI: throw a tool at every problem because you can, leave the workflow underneath untouched. A progression gives people a map — they know which bottleneck they're standing on, what comes before and after it, and what kind of problem belongs at which layer. The cost is slower initial lift. The return is that teammates leave with a lens for spotting leverage, not a shopping list of tools.",
      artifact:
        'The site is a six-tile framework tour. Each pillar (foundation, prompt, context, MCP, skills, agents) gets a hand-drawn line-art glyph, a one-sentence claim of what bottleneck it removes, and a deeper read if you want it. Three of the six layers carry an "In Practice" panel pointing to a working artifact: the 8-part prompt structure at the prompt layer, Skill Kit at the skills layer, Fulcra at the agents layer. Over 25 custom visualizations, not stock icons or flowcharts, carry the explanatory weight.',
      costReturn:
        'Without it, enthusiasm that decays by Friday. With it, a shared map of where AI earns its keep: a team that can place the next new tool themselves.',
      receipts: [
        '6 pillars, ordered as a progression: foundation → prompt → context → MCP → skills → agents',
        '25+ custom visualizations; no stock icons, no stock flowcharts',
        'Self-initiated lunch-and-learn inside my digital-transformation team',
        'Strategist reached out afterward; prototyping AI applications together since',
        '3 "in practice" panels link to working artifacts (8-part prompt, Skill Kit, Fulcra)',
        'Live · ai-enablement-gamma.vercel.app',
      ],
      pullQuote: 'AI makes abundance cheap. Value still concentrates at the bottlenecks.',
    },
  },
]

export const supportingProjects: SupportingProject[] = [
  {
    id: 'content-to-skill',
    title: 'Content to Skill',
    claim: 'Claude Code plugin converting books into progressive-disclosure AI agent skills.',
    href: 'https://github.com/chrislacey89/content-to-skill',
    external: true,
  },
  {
    id: 'mikelacey-site',
    title: 'Mike Lacey Portfolio',
    claim:
      'Full-stack portfolio site for a television director, Astro + Sanity with live visual editing.',
    href: 'https://www.themikelacey.com/',
    external: true,
  },
]
