import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const cache = new Map<string, Promise<string>>()

/**
 * Build a tiny blurred webp for use as an inline LQIP placeholder.
 * Runs at build time only — reads the source file with sharp, emits a
 * ~300–600 byte base64 data URI safe to set as a CSS background-image.
 *
 * Pass a project-relative path (e.g. "src/assets/projects/fulcrum.png").
 * `import.meta.url` is unreliable inside bundled server chunks, so we
 * resolve from `process.cwd()` instead — Astro runs builds from the
 * project root, so this is stable.
 */
export function getBlurDataUri(relPath: string): Promise<string> {
  const cached = cache.get(relPath)
  if (cached) return cached

  const task = (async () => {
    const absolute = path.resolve(process.cwd(), relPath)
    const buf = await readFile(absolute)
    const out = await sharp(buf)
      .resize(24, null, { fit: 'inside' })
      .blur(6)
      .webp({ quality: 40 })
      .toBuffer()
    return `data:image/webp;base64,${out.toString('base64')}`
  })()

  cache.set(relPath, task)
  return task
}
