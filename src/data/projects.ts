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

const PLACEHOLDER: ProjectDetail = {
  claim: 'Placeholder claim — replaced by content pass in slice #8.',
  context:
    'Placeholder context paragraph. Slice #8 fills in the situation the project was a response to.',
  move: 'Placeholder move paragraph. The load-bearing paragraph arrives in slice #8 and is gated on senior-comp read quality before launch.',
  artifact:
    'Placeholder artifact description — what was built and its interesting structural choices.',
  costReturn: 'Placeholder cost and return — time spent, outcome delivered, what compounded.',
  receipts: ['Placeholder receipt', 'Populated in slice #8'],
  pullQuote: 'Placeholder pull quote.',
}

export const leadProjects: LeadProject[] = [
  {
    id: 'fulcrum',
    title: 'Fulcrum',
    blurb:
      'AI advisory platform that applies mental models and structured reasoning to high-stakes decisions.',
    image: fulcrumImage,
    imageAlt:
      'Stylized hexagonal network — a central terracotta hex surrounded by six outlined hexes holding lines of code, suggesting structured reasoning pulled from many models.',
    github: 'https://github.com/chrislacey89/fulcrum',
    detail: PLACEHOLDER,
  },
  {
    id: 'skills',
    title: 'Skill Kit',
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
        'Skill Kit ships 23 skills across seven pipeline stages plus nine side-route skills for orientation, recovery, and review. Each is a standalone `SKILL.md` with explicit preconditions, installable as a pack. Alongside the main pack, `content-to-skill` converts PDFs and EPUBs into progressive-disclosure reference skills that populate a personal library the pipeline reaches into when a stage calls for expert grounding. `/pre-merge` runs an eight-dimension architecture review against that library, not a generic PR checklist.',
      costReturn:
        "Without it, you're YOLO-ing: shipping whatever best practice you happened to remember and hoping it's the one that mattered. With it, compounding knowledge: the same mistake never gets made twice.",
      receipts: [
        '23 skills across 7 pipeline stages + 9 side routes',
        'All PRDs, slices, and lineage live in GitHub issues and PRs',
        'Personal library of distilled engineering references consulted by the pipeline (Ousterhout, Meadows, Beck, Kahneman, Singer, Evans, Fowler, …)',
        '/compound → docs/solutions/ → /research reads it on the next feature',
        "npx skills@latest add chrislacey89/skills --skill '*'",
        'MIT · github.com/chrislacey89/skills',
      ],
      pullQuote: "The books aren't decoration — they're dependencies.",
    },
  },
  {
    id: 'empowerment-brief',
    title: 'AI Empowerment Brief',
    blurb:
      'Interactive educational platform teaching a structured AI methodology through 25+ custom visualizations.',
    image: empowermentBriefImage,
    imageAlt:
      'Six labeled framework tiles arranged in a grid — foundation, prompt, context, mcp, skills, and agents — each with a small line-art glyph; the agents tile is filled terracotta with a checkmark.',
    liveUrl: 'https://ai-enablement-gamma.vercel.app/',
    detail: PLACEHOLDER,
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
