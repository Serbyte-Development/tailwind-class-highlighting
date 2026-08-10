import { describe, expect, it } from 'vitest'
import { classifyUtility } from '../src/core/classify'

describe('classifyUtility', () => {
  it.each([
    ['absolute', 'layout'],
    ['grid-cols-3', 'flexGrid'],
    ['-mt-4', 'spacing'],
    ['w-[calc(100%-2rem)]', 'sizing'],
    ['font-semibold', 'typography'],
    ['bg-red-500/50', 'color'],
    ['rounded-xl', 'border'],
    ['shadow-lg', 'effects'],
    ['duration-200', 'motion'],
    ['cursor-pointer', 'interactivity'],
    ['sr-only', 'accessibility'],
  ] as const)('%s -> %s', (utility, group) => {
    expect(classifyUtility(utility)).toBe(group)
  })

  it('rejects unrelated identifiers', () => {
    expect(classifyUtility('condition')).toBeNull()
  })
})

describe('Tailwind v4 utility families', () => {
  it.each([
    ['@container', 'layout'],
    ['contain-layout', 'layout'],
    ['table-fixed', 'layout'],
    ['line-clamp-3', 'typography'],
    ['text-balance', 'typography'],
    ['mask-linear-45', 'effects'],
    ['inset-shadow-sm', 'effects'],
    ['perspective-near', 'motion'],
    ['backface-hidden', 'motion'],
    ['scrollbar-thin', 'interactivity'],
    ['scheme-dark', 'interactivity'],
    ['forced-color-adjust-none', 'accessibility'],
  ] as const)('%s -> %s', (utility, group) => {
    expect(classifyUtility(utility)).toBe(group)
  })
})
