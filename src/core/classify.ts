import type { HighlightGroup } from './types'

const exact: Record<string, HighlightGroup> = {
  '@container': 'layout',
  container: 'layout',
  block: 'layout',
  'inline-block': 'layout',
  inline: 'layout',
  contents: 'layout',
  'flow-root': 'layout',
  hidden: 'layout',
  table: 'layout',
  'list-item': 'layout',
  static: 'layout',
  fixed: 'layout',
  absolute: 'layout',
  relative: 'layout',
  sticky: 'layout',
  isolate: 'layout',
  'isolation-auto': 'layout',
  visible: 'layout',
  invisible: 'layout',
  collapse: 'layout',

  flex: 'flexGrid',
  grid: 'flexGrid',
  'inline-flex': 'flexGrid',
  'inline-grid': 'flexGrid',

  italic: 'typography',
  'not-italic': 'typography',
  underline: 'typography',
  overline: 'typography',
  'line-through': 'typography',
  'no-underline': 'typography',
  uppercase: 'typography',
  lowercase: 'typography',
  capitalize: 'typography',
  'normal-case': 'typography',
  truncate: 'typography',
  antialiased: 'typography',
  'subpixel-antialiased': 'typography',
  'break-normal': 'typography',
  'break-words': 'typography',
  'break-all': 'typography',
  'break-keep': 'typography',
  'normal-nums': 'typography',
  ordinal: 'typography',
  'slashed-zero': 'typography',
  'lining-nums': 'typography',
  'oldstyle-nums': 'typography',
  'proportional-nums': 'typography',
  'tabular-nums': 'typography',
  'diagonal-fractions': 'typography',
  'stacked-fractions': 'typography',
  'content-none': 'typography',

  transform: 'motion',
  'transform-gpu': 'motion',
  'transform-cpu': 'motion',
  'transform-none': 'motion',
  'transform-3d': 'motion',
  'transform-flat': 'motion',

  'sr-only': 'accessibility',
  'not-sr-only': 'accessibility',

  'appearance-none': 'interactivity',
  'appearance-auto': 'interactivity',
  resize: 'interactivity',
  zoom: 'interactivity',
}

const families: Array<[RegExp, HighlightGroup]> = [
  [/^inset-shadow(?:-|$)/, 'effects'],
  [/^inset-ring(?:-|$)/, 'border'],
  [
    /^(?:aspect-|columns-|contain-|box-|float-|clear-|object-|overflow-|overscroll-|inset-|top-|right-|bottom-|left-|start-|end-|z-|table-|caption-)/,
    'layout',
  ],
  [/^(?:break-before-|break-after-|break-inside-)/, 'layout'],
  [
    /^(?:flex-|basis-|grow(?:-|$)|shrink(?:-|$)|order-|grid-|col-|row-|auto-cols-|auto-rows-|justify-|items-|self-|place-)/,
    'flexGrid',
  ],
  [
    /^(?:content-(?:normal|center|start|end|between|around|evenly|baseline|stretch)(?:-safe)?$)/,
    'flexGrid',
  ],
  [/^(?:p[trblxy]?-|m[trblxy]?-|space-[xy]-|gap(?:-[xy])?-)/, 'spacing'],
  [/^(?:size-|w-|min-w-|max-w-|h-|min-h-|max-h-)/, 'sizing'],
  [
    /^(?:text-shadow|inset-shadow|shadow|opacity-|mix-blend-|bg-blend-|filter(?:-|$)|blur(?:-|$)|brightness-|contrast-|drop-shadow|grayscale(?:-|$)|hue-rotate-|invert(?:-|$)|saturate-|sepia(?:-|$)|backdrop-|mask-)/,
    'effects',
  ],
  [
    /^(?:font-|text-|leading-|tracking-|indent-|align-|whitespace-|hyphens-|list-|decoration-|underline-offset-|line-clamp-|wrap-|tab-|prose(?:-|$)|content-)/,
    'typography',
  ],
  [/^(?:bg-|from-|via-|to-|accent-|caret-|fill-|stroke-|placeholder-)/, 'color'],
  [
    /^(?:border(?:-|$)|rounded(?:-|$)|divide-|ring(?:-|$)|inset-ring(?:-|$)|outline(?:-|$))/,
    'border',
  ],
  [
    /^(?:origin-|scale(?:-|$)|rotate(?:-|$)|translate(?:-|$)|skew(?:-|$)|transition(?:-|$)|duration-|ease-|delay-|animate-|perspective(?:-|$)|perspective-origin-|backface-)/,
    'motion',
  ],
  [
    /^(?:appearance-|cursor-|pointer-events-|resize-|scroll-|scrollbar-|snap-|touch-|select-|will-change-|field-sizing-|scheme-)/,
    'interactivity',
  ],
  [/^forced-color-adjust-/, 'accessibility'],
]

const arbitraryPropertyGroups: Array<[RegExp, HighlightGroup]> = [
  [/^(?:display|position|overflow|inset|top|right|bottom|left|z-index|contain):/, 'layout'],
  [/^(?:width|min-width|max-width|height|min-height|max-height):/, 'sizing'],
  [/^(?:margin|padding|gap|row-gap|column-gap):/, 'spacing'],
  [
    /^(?:font|font-size|font-weight|line-height|letter-spacing|text-|white-space|word-break|hyphens):/,
    'typography',
  ],
  [/^(?:color|background|background-color|fill|stroke|caret-color|accent-color):/, 'color'],
  [/^(?:border|border-|outline|border-radius):/, 'border'],
  [/^(?:opacity|box-shadow|filter|backdrop-filter|mask):/, 'effects'],
  [/^(?:transform|translate|rotate|scale|transition|animation|perspective):/, 'motion'],
  [/^(?:cursor|pointer-events|user-select|resize|touch-action|scroll-):/, 'interactivity'],
]

export function classifyUtility(rawUtility: string): HighlightGroup | null {
  let utility = rawUtility
  if (utility.startsWith('!')) utility = utility.slice(1)
  if (utility.endsWith('!')) utility = utility.slice(0, -1)

  const direct = exact[utility]
  if (direct) return direct

  if (utility.startsWith('[') && utility.endsWith(']')) {
    const property = utility.slice(1, -1)
    for (const [pattern, group] of arbitraryPropertyGroups) {
      if (pattern.test(property)) return group
    }
    return null
  }

  const normalized = utility.startsWith('-') ? utility.slice(1) : utility
  for (const [pattern, group] of families) {
    if (pattern.test(normalized)) return group
  }

  return null
}
