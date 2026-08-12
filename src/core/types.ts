export const highlightGroups = [
  'utility',
  'breakpoint',
  'variant',
  'arbitrary',
  'important',
] as const

export type HighlightGroup = (typeof highlightGroups)[number]

export interface SourceRegion {
  start: number
  end: number
}

export interface HighlightSpan {
  start: number
  end: number
  group: HighlightGroup
}
