import type { CollectionEntry } from 'astro:content'

type Essay = CollectionEntry<'essays'>

export type WritingIndexState =
  | { mode: 'empty'; posts: [] }
  | { mode: 'flat'; posts: Essay[] }
  | { mode: 'year-grouped'; groups: Array<{ year: number; posts: Essay[] }> }

const YEAR_SPAN_THRESHOLD = 2
const GROUPED_MIN_COUNT = 5

export function resolveWritingIndexState(posts: readonly Essay[]): WritingIndexState {
  if (posts.length === 0) {
    return { mode: 'empty', posts: [] }
  }

  const sorted = [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())

  if (sorted.length >= GROUPED_MIN_COUNT && spansAtLeastYears(sorted, YEAR_SPAN_THRESHOLD)) {
    return { mode: 'year-grouped', groups: groupByYear(sorted) }
  }

  return { mode: 'flat', posts: sorted }
}

function spansAtLeastYears(sorted: Essay[], years: number): boolean {
  const newest = sorted[0].data.pubDate.getUTCFullYear()
  const oldest = sorted[sorted.length - 1].data.pubDate.getUTCFullYear()
  return newest - oldest >= years
}

function groupByYear(sorted: Essay[]): Array<{ year: number; posts: Essay[] }> {
  const groups = new Map<number, Essay[]>()
  for (const post of sorted) {
    const year = post.data.pubDate.getUTCFullYear()
    const bucket = groups.get(year)
    if (bucket) bucket.push(post)
    else groups.set(year, [post])
  }
  return [...groups.entries()].sort(([a], [b]) => b - a).map(([year, posts]) => ({ year, posts }))
}
