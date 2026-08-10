import { Scanner } from '@tailwindcss/oxide'
import { splitCandidate } from './candidate'
import { classifyUtility } from './classify'
import { findSourceRegions, type RegionOptions } from './regions'
import type { HighlightSpan, SourceRegion } from './types'

const scanner = new Scanner({ sources: [] })

export interface AnalyzeOptions extends RegionOptions {
  extension: string
}

function isResponsiveVariant(variant: string): boolean {
  return /^(?:sm|md|lg|xl|2xl|(?:min|max)-|@)/.test(variant)
}

interface BufferRegion {
  bufferStart: number
  bufferEnd: number
  sourceStart: number
}

function mergeRegions(regions: SourceRegion[]): SourceRegion[] {
  if (regions.length < 2) return regions

  const merged: SourceRegion[] = [{ ...regions[0]! }]
  for (let i = 1; i < regions.length; i++) {
    const region = regions[i]!
    const previous = merged[merged.length - 1]!

    if (region.start <= previous.end) {
      previous.end = Math.max(previous.end, region.end)
    } else {
      merged.push({ ...region })
    }
  }

  return merged
}

function buildScanBuffer(
  text: string,
  regions: SourceRegion[],
): {
  content: string
  regions: BufferRegion[]
} {
  const chunks: string[] = []
  const bufferRegions: BufferRegion[] = []
  let offset = 0

  for (const region of regions) {
    const chunk = text.slice(region.start, region.end)
    const bufferStart = offset
    const bufferEnd = bufferStart + chunk.length

    chunks.push(chunk, '\n')
    bufferRegions.push({ bufferStart, bufferEnd, sourceStart: region.start })
    offset = bufferEnd + 1
  }

  return { content: chunks.join(''), regions: bufferRegions }
}

function mapToSource(regions: BufferRegion[], start: number, end: number): number | null {
  let low = 0
  let high = regions.length - 1

  while (low <= high) {
    const mid = (low + high) >> 1
    const region = regions[mid]!

    if (start < region.bufferStart) high = mid - 1
    else if (start >= region.bufferEnd) low = mid + 1
    else if (end <= region.bufferEnd) return region.sourceStart + (start - region.bufferStart)
    else return null
  }

  return null
}

export function analyzeText(text: string, options: AnalyzeOptions): HighlightSpan[] {
  const sourceRegions = mergeRegions(findSourceRegions(text, options))
  if (sourceRegions.length === 0) return []

  const scanBuffer = buildScanBuffer(text, sourceRegions)
  const candidates = scanner.getCandidatesWithPositions({
    content: scanBuffer.content,
    extension: 'html',
  })
  const highlights = new Map<string, HighlightSpan>()

  for (const { candidate, position } of candidates) {
    const bufferStart = Number(position)
    const sourceStart = mapToSource(scanBuffer.regions, bufferStart, bufferStart + candidate.length)
    if (sourceStart == null) continue

    const parts = splitCandidate(candidate)
    const utility = candidate.slice(parts.utilityStart)
    const group = classifyUtility(utility)
    if (!group) continue

    for (const variant of parts.variantRanges) {
      const variantName = candidate.slice(variant.start, variant.end - 1)
      const span: HighlightSpan = {
        start: sourceStart + variant.start,
        end: sourceStart + variant.end,
        group: isResponsiveVariant(variantName) ? 'variantResponsive' : 'variant',
      }
      highlights.set(`${span.start}:${span.end}:${span.group}`, span)
    }

    const utilitySpan: HighlightSpan = {
      start: sourceStart + parts.utilityStart,
      end: sourceStart + candidate.length,
      group,
    }
    highlights.set(`${utilitySpan.start}:${utilitySpan.end}:${utilitySpan.group}`, utilitySpan)
  }

  return [...highlights.values()].sort((a, b) => a.start - b.start || a.end - b.end)
}
