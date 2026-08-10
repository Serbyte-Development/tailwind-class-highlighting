import type { SourceRegion } from './types'

export interface RegionOptions {
  classAttributes: string[]
  classFunctions: string[]
}

function skipWhitespace(text: string, offset: number): number {
  while (offset < text.length) {
    const char = text[offset]
    if (!char || !/\s/.test(char)) break
    offset++
  }
  return offset
}

function readQuoted(text: string, start: number): SourceRegion | null {
  const quote = text[start]
  if (quote !== '"' && quote !== "'" && quote !== '`') return null

  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '\\') {
      i++
      continue
    }
    if (quote === '`' && text[i] === '$' && text[i + 1] === '{') {
      const expression = readBalanced(text, i + 1, '{', '}')
      if (!expression) return { start: start + 1, end: text.length }
      i = expression.end
      continue
    }
    if (text[i] === quote) return { start: start + 1, end: i }
  }

  return { start: start + 1, end: text.length }
}

function skipString(text: string, start: number): number {
  const region = readQuoted(text, start)
  return region ? Math.min(region.end + 1, text.length) : text.length
}

function readBalanced(
  text: string,
  start: number,
  open: string,
  close: string,
): SourceRegion | null {
  if (text[start] !== open) return null

  let depth = 1
  for (let i = start + 1; i < text.length; i++) {
    const char = text[i]

    if (char === '"' || char === "'" || char === '`') {
      i = skipString(text, i) - 1
      continue
    }

    if (char === '/' && text[i + 1] === '/') {
      const newline = text.indexOf('\n', i + 2)
      if (newline === -1) return { start: start + 1, end: text.length }
      i = newline
      continue
    }

    if (char === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      if (end === -1) return { start: start + 1, end: text.length }
      i = end + 1
      continue
    }

    if (char === open) depth++
    else if (char === close && --depth === 0) return { start: start + 1, end: i }
  }

  return { start: start + 1, end: text.length }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findAttributeRegions(text: string, attributes: string[]): SourceRegion[] {
  if (attributes.length === 0) return []

  const pattern = attributes
    .map(escapeRegex)
    .sort((a, b) => b.length - a.length)
    .join('|')
  const regex = new RegExp(`(?<![\\w:-])(?:${pattern})\\s*=`, 'g')
  const regions: SourceRegion[] = []

  for (const match of text.matchAll(regex)) {
    if (match.index == null) continue

    let valueStart = skipWhitespace(text, match.index + match[0].length)
    const char = text[valueStart]
    const region =
      char === '"' || char === "'" || char === '`'
        ? readQuoted(text, valueStart)
        : char === '{'
          ? readBalanced(text, valueStart, '{', '}')
          : null

    if (region && region.end > region.start) regions.push(region)
  }

  return regions
}

function findFunctionRegions(text: string, patterns: string[]): SourceRegion[] {
  if (patterns.length === 0) return []

  const validPatterns = patterns.filter((pattern) => {
    try {
      new RegExp(pattern)
      return true
    } catch {
      return false
    }
  })
  if (validPatterns.length === 0) return []

  const matcher = new RegExp(
    `(?<![\\w$])(?:${validPatterns.join('|')})(?![\\w$])\\s*(?=\\(|\\\`)`,
    'g',
  )

  const regions: SourceRegion[] = []
  for (const match of text.matchAll(matcher)) {
    if (match.index == null) continue

    let cursor = skipWhitespace(text, match.index + match[0].length)
    const char = text[cursor]
    const region =
      char === '('
        ? readBalanced(text, cursor, '(', ')')
        : char === '`'
          ? readQuoted(text, cursor)
          : null

    if (region && region.end > region.start) regions.push(region)
  }

  return regions
}

export function findSourceRegions(text: string, options: RegionOptions): SourceRegion[] {
  const regions = [
    ...findAttributeRegions(text, options.classAttributes),
    ...findFunctionRegions(text, options.classFunctions),
  ]

  regions.sort((a, b) => a.start - b.start || b.end - a.end)

  const deduped: SourceRegion[] = []
  for (const region of regions) {
    const previous = deduped[deduped.length - 1]
    if (previous && previous.start === region.start && previous.end === region.end) continue
    deduped.push(region)
  }

  return deduped
}
