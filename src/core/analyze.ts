import {
  findArbitraryBracketRanges,
  findImportantModifierRanges,
  splitCandidate,
} from './candidate'
import { findSourceRegions, type RegionOptions } from './regions'
import type { CandidateScanner } from './scanner'
import type { HighlightSpan, SourceRegion } from './types'
import type { CandidateValidator } from './validator'

export type AnalyzeOptions = RegionOptions

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
): { content: string; regions: BufferRegion[] } {
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

function addSpan(
  highlights: Map<string, HighlightSpan>,
  sourceStart: number,
  start: number,
  end: number,
  group: HighlightSpan['group'],
): void {
  const span: HighlightSpan = {
    start: sourceStart + start,
    end: sourceStart + end,
    group,
  }
  highlights.set(`${span.start}:${span.end}:${span.group}`, span)
}

export function analyzeText(
  text: string,
  options: AnalyzeOptions,
  scanner: CandidateScanner,
  validator: CandidateValidator,
): HighlightSpan[] {
  const sourceRegions = mergeRegions(findSourceRegions(text, options))
  if (sourceRegions.length === 0) return []

  const scanBuffer = buildScanBuffer(text, sourceRegions)
  const candidates = scanner.getCandidatesWithPositions({
    content: scanBuffer.content,
    extension: 'html',
  })
  const validCandidates = validator.getValidCandidates([
    ...new Set(candidates.map(({ candidate }) => candidate)),
  ])
  const highlights = new Map<string, HighlightSpan>()

  for (const { candidate, position } of candidates) {
    const bufferStart = Number(position)
    const sourceStart = mapToSource(scanBuffer.regions, bufferStart, bufferStart + candidate.length)
    if (sourceStart == null) continue

    const parts = splitCandidate(candidate)
    if (!validCandidates.has(candidate)) continue

    const important = findImportantModifierRanges(candidate, parts.utilityStart).length > 0

    if (!important) {
      for (const variant of parts.variantRanges) {
        const variantName = candidate.slice(variant.start, variant.end - 1)
        addSpan(
          highlights,
          sourceStart,
          variant.start,
          variant.end,
          validator.isBreakpointVariant(variantName) ? 'breakpoint' : 'variant',
        )
      }

      for (const range of findArbitraryBracketRanges(candidate)) {
        addSpan(highlights, sourceStart, range.start, range.end, 'arbitrary')
      }
    }

    addSpan(highlights, sourceStart, parts.utilityStart, candidate.length, 'utility')

    if (important) {
      addSpan(highlights, sourceStart, 0, candidate.length, 'important')
    }
  }

  return [...highlights.values()].sort((a, b) => a.start - b.start || a.end - b.end)
}
