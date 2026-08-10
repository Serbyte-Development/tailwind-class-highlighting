import { describe, expect, it } from 'vitest'
import { splitCandidate } from '../src/core/candidate'

describe('splitCandidate', () => {
  it('splits normal variants from the utility', () => {
    expect(splitCandidate('md:hover:bg-red-500')).toEqual({
      variantRanges: [
        { start: 0, end: 3 },
        { start: 3, end: 9 },
      ],
      utilityStart: 9,
    })
  })

  it('does not split colons inside arbitrary variants or values', () => {
    const candidate = '[@supports(display:grid)]:bg-[color:oklch(50%_0.2_10)]'
    expect(splitCandidate(candidate)).toEqual({
      variantRanges: [{ start: 0, end: 26 }],
      utilityStart: 26,
    })
  })
})
