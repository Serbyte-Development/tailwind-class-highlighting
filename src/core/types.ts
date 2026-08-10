export const highlightGroups = [
  'variantResponsive',
  'variant',
  'layout',
  'flexGrid',
  'spacing',
  'sizing',
  'typography',
  'color',
  'border',
  'effects',
  'motion',
  'interactivity',
  'accessibility',
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
