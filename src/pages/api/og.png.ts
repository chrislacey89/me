import fs from 'node:fs'
import path from 'node:path'
import { ImageResponse } from '@vercel/og'
import type { APIRoute } from 'astro'

export const prerender = false

// Brand palette (mirrors src/styles/global.css @theme tokens)
const COLOR_BACKGROUND = '#F4EEE1' // Legal Pad
const COLOR_FOREGROUND = '#1A1F2E' // Ink Well
const COLOR_ACCENT = '#C1502E' // Terracotta Signal
const COLOR_FOREST = '#2F5D50' // Forest Floor
const COLOR_RULE = 'rgba(47, 93, 80, 0.25)'
const COLOR_MUTED = 'rgba(11, 18, 33, 0.6)'

// Satori supports TTF, OTF, WOFF — not WOFF2. The brand WOFF files are committed to
// public/fonts/ so we can read them synchronously at request time without a network
// round-trip. jsdelivr is kept as a fallback for any path where the bundled asset
// can't be located.
const FONT_FILES = {
  serif400: 'source-serif-4-400.woff',
  serif500: 'source-serif-4-500.woff',
  mono400: 'ibm-plex-mono-400.woff',
  mono500: 'ibm-plex-mono-500.woff',
} as const

const JSDELIVR_FALLBACK: Record<keyof typeof FONT_FILES, string> = {
  serif400: '@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff',
  serif500: '@fontsource/source-serif-4/files/source-serif-4-latin-500-normal.woff',
  mono400: '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff',
  mono500: '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff',
}

function loadLocalFont(fileName: string): Buffer | null {
  const candidates = [
    path.resolve(`./public/fonts/${fileName}`),
    path.join(process.cwd(), 'public/fonts', fileName),
    path.resolve(`./dist/client/fonts/${fileName}`),
    path.resolve(`./dist/fonts/${fileName}`),
  ]
  for (const p of candidates) {
    try {
      return fs.readFileSync(p)
    } catch {
      // try next
    }
  }
  return null
}

async function fetchJsdelivrWoff(jsdelivrPath: string): Promise<ArrayBuffer> {
  const res = await fetch(`https://cdn.jsdelivr.net/npm/${jsdelivrPath}`)
  if (!res.ok) {
    throw new Error(`Font fetch failed (${res.status}): ${jsdelivrPath}`)
  }
  return res.arrayBuffer()
}

async function resolveFontData(key: keyof typeof FONT_FILES): Promise<Buffer | ArrayBuffer> {
  const local = loadLocalFont(FONT_FILES[key])
  if (local) return local
  return fetchJsdelivrWoff(JSDELIVR_FALLBACK[key])
}

type FontKey = keyof typeof FONT_FILES
type FontBuffer = Buffer | ArrayBuffer

const FONT_META = {
  serif400: { name: 'Source Serif 4', weight: 400 },
  serif500: { name: 'Source Serif 4', weight: 500 },
  mono400: { name: 'IBM Plex Mono', weight: 400 },
  mono500: { name: 'IBM Plex Mono', weight: 500 },
} as const satisfies Record<FontKey, { name: string; weight: number }>

// Cache resolved font buffers at module scope so warm invocations skip both the
// filesystem read and any fallback fetch.
let cachedFonts: Record<FontKey, FontBuffer> | null = null

async function loadFonts(): Promise<Record<FontKey, FontBuffer>> {
  if (cachedFonts) return cachedFonts
  const keys = Object.keys(FONT_FILES) as FontKey[]
  const buffers = await Promise.all(keys.map((k) => resolveFontData(k)))
  const result = Object.fromEntries(keys.map((k, i) => [k, buffers[i]])) as Record<
    FontKey,
    FontBuffer
  >
  cachedFonts = result
  return result
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || 'Chris Lacey'
  const subtitle = url.searchParams.get('subtitle') || 'Full-stack AI product engineer'

  const cached = await loadFonts()
  const fonts = (Object.keys(FONT_META) as FontKey[]).map((k) => ({
    ...FONT_META[k],
    data: cached[k],
    style: 'normal' as const,
  }))

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

  return new ImageResponse(html as unknown as React.ReactElement, {
    width: 1200,
    height: 630,
    fonts,
  })
}
