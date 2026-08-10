export interface CandidateParts {
  variantRanges: Array<{ start: number; end: number }>
  utilityStart: number
}

export function splitCandidate(candidate: string): CandidateParts {
  const variantRanges: Array<{ start: number; end: number }> = []
  let squareDepth = 0
  let parenDepth = 0
  let quote: string | null = null
  let segmentStart = 0

  for (let i = 0; i < candidate.length; i++) {
    const char = candidate[i]

    if (quote) {
      if (char === '\\') i++
      else if (char === quote) quote = null
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }

    if (char === '[') squareDepth++
    else if (char === ']') squareDepth = Math.max(0, squareDepth - 1)
    else if (char === '(') parenDepth++
    else if (char === ')') parenDepth = Math.max(0, parenDepth - 1)
    else if (char === ':' && squareDepth === 0 && parenDepth === 0) {
      variantRanges.push({ start: segmentStart, end: i + 1 })
      segmentStart = i + 1
    }
  }

  return { variantRanges, utilityStart: segmentStart }
}
