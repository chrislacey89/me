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
    title: 'skills',
    blurb:
      'A Claude Code skill pipeline that turns shaped engineering work into reusable, invocable skills.',
    image: skillsImage,
    imageAlt:
      'A vertical list of slash-command skills — /shape and /research checked off, /write-a-prd highlighted in terracotta, with /execute and /compound still queued below.',
    github: 'https://github.com/chrislacey89/skills',
    detail: PLACEHOLDER,
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
