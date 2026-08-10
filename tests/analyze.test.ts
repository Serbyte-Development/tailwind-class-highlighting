import { describe, expect, it } from 'vitest'
import { analyzeText } from '../src/core/analyze'

const options = {
  extension: 'tsx',
  classAttributes: ['class', 'className'],
  classFunctions: ['clsx', 'cn', 'cva'],
}

describe('analyzeText', () => {
  it('highlights modern Tailwind candidates and variants', () => {
    const text = `
      <button className={cn(
        "flex items-center gap-2 md:hover:bg-red-500/50",
        active && "w-[calc(100%-2rem)] rounded-xl",
      )} />
    `

    const spans = analyzeText(text, options)
    const highlighted = spans.map((span) => ({
      value: text.slice(span.start, span.end),
      group: span.group,
    }))

    expect(highlighted).toContainEqual({ value: 'flex', group: 'flexGrid' })
    expect(highlighted).toContainEqual({ value: 'gap-2', group: 'spacing' })
    expect(highlighted).toContainEqual({ value: 'md:', group: 'variantResponsive' })
    expect(highlighted).toContainEqual({ value: 'hover:', group: 'variant' })
    expect(highlighted).toContainEqual({ value: 'bg-red-500/50', group: 'color' })
    expect(highlighted).toContainEqual({ value: 'w-[calc(100%-2rem)]', group: 'sizing' })
    expect(highlighted).toContainEqual({ value: 'rounded-xl', group: 'border' })
  })

  it('does not highlight normal code identifiers inside class expressions', () => {
    const text = `<div className={condition ? "flex" : variableName} />`
    const values = analyzeText(text, options).map((span) => text.slice(span.start, span.end))

    expect(values).toContain('flex')
    expect(values).not.toContain('condition')
    expect(values).not.toContain('variableName')
  })
})

it('maps compact-buffer positions back through Unicode source offsets', () => {
  const text = `const label = "😀"; <div className="flex p-4" />`
  const spans = analyzeText(text, options)
  const highlighted = spans.map((span) => text.slice(span.start, span.end))

  expect(highlighted).toContain('flex')
  expect(highlighted).toContain('p-4')
})
