import fs from 'node:fs'
import path from 'node:path'
import { ImageResponse } from '@vercel/og'
import type { APIRoute } from 'astro'

export const prerender = false

// Brand palette (mirrors src/styles/global.css @theme tokens)
const COLOR_BACKGROUND = '#F4EEE1' // Legal Pad
const COLOR_FOREGROUND = '#0B1221' // Ink Well
const COLOR_ACCENT = '#C1502E' // Terracotta Signal
const COLOR_FOREST = '#2F5D50' // Forest Floor
const COLOR_RULE = 'rgba(47, 93, 80, 0.25)'
const COLOR_MUTED = 'rgba(11, 18, 33, 0.6)'

// Satori supports TTF, OTF, WOFF — not WOFF2. Both @fontsource-variable/source-serif-4
// and @fontsource/ibm-plex-mono ship WOFF2 only for the variable builds, so we fetch
// the static WOFF builds from jsdelivr at request time (Vercel caches the cold start).
async function fetchJsdelivrWoff(urlPath: string): Promise<ArrayBuffer> {
  const res = await fetch(`https://cdn.jsdelivr.net/npm/${urlPath}`)
  if (!res.ok) {
    throw new Error(`Font fetch failed (${res.status}): ${urlPath}`)
  }
  return res.arrayBuffer()
}

function loadLocalWoff(relPathFromRoot: string): Buffer | null {
  const candidates = [path.resolve(relPathFromRoot), path.join(process.cwd(), relPathFromRoot)]
  for (const p of candidates) {
    try {
      return fs.readFileSync(p)
    } catch {
      // try next
    }
  }
  return null
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || 'Chris Lacey'
  const subtitle = url.searchParams.get('subtitle') || 'Full-stack AI product engineer'

  const [serifRegular, serifMedium, monoRegularRemote, monoMediumRemote] = await Promise.all([
    fetchJsdelivrWoff('@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff'),
    fetchJsdelivrWoff('@fontsource/source-serif-4/files/source-serif-4-latin-500-normal.woff'),
    fetchJsdelivrWoff('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff'),
    fetchJsdelivrWoff('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff'),
  ])

  // Prefer bundled local WOFF for IBM Plex Mono if available (faster cold start on Vercel).
  const monoRegular =
    loadLocalWoff(
      'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff',
    ) ?? monoRegularRemote
  const monoMedium =
    loadLocalWoff(
      'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff',
    ) ?? monoMediumRemote

  const fonts = [
    {
      name: 'Source Serif 4',
      data: serifRegular,
      weight: 400 as const,
      style: 'normal' as const,
    },
    {
      name: 'Source Serif 4',
      data: serifMedium,
      weight: 500 as const,
      style: 'normal' as const,
    },
    {
      name: 'IBM Plex Mono',
      data: monoRegular,
      weight: 400 as const,
      style: 'normal' as const,
    },
    {
      name: 'IBM Plex Mono',
      data: monoMedium,
      weight: 500 as const,
      style: 'normal' as const,
    },
  ]

  const html = {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        background: COLOR_BACKGROUND,
        padding: '80px 96px',
        fontFamily: 'Source Serif 4',
        color: COLOR_FOREGROUND,
      },
      children: [
        // Eyebrow (mono)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontFamily: 'IBM Plex Mono',
              fontSize: '22px',
              fontWeight: 500,
              color: COLOR_FOREST,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '36px',
                    height: '2px',
                    background: COLOR_ACCENT,
                  },
                },
              },
              { type: 'div', props: { children: 'Chris Lacey' } },
            ],
          },
        },
        // Title (serif lede) + subtitle
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '960px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Source Serif 4',
                    fontWeight: 400,
                    fontSize: '92px',
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    color: COLOR_FOREGROUND,
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    marginTop: '28px',
                    fontFamily: 'Source Serif 4',
                    fontWeight: 500,
                    fontSize: '34px',
                    lineHeight: 1.3,
                    color: COLOR_MUTED,
                  },
                  children: subtitle,
                },
              },
            ],
          },
        },
        // Footer — thin rule + domain and tag
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: '20px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '100%',
                    height: '1px',
                    background: COLOR_RULE,
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    fontFamily: 'IBM Plex Mono',
                    fontSize: '20px',
                    fontWeight: 400,
                    color: COLOR_FOREST,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  },
                  children: [
                    { type: 'div', props: { children: 'chrislacey.dev' } },
                    { type: 'div', props: { children: 'Close the gap' } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  }

  return new ImageResponse(html as React.ReactElement, {
    width: 1200,
    height: 630,
    fonts,
  })
}
