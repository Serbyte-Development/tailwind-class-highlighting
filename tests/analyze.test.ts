import * as path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { Scanner } from '@tailwindcss/oxide'
import { analyzeText } from '../src/core/analyze'
import type { CandidateValidator } from '../src/core/validator'
import { TailwindProjectManager } from '../src/tailwind/project'

const scanner = new Scanner({ sources: [] })
let validator: CandidateValidator

const options = {
  classAttributes: ['class', 'className'],
  classFunctions: ['clsx', 'cn', 'cva'],
}

beforeAll(async () => {
  const manager = new TailwindProjectManager()
  const project = await manager.getProject(
    path.resolve('tests/fixtures/tailwind-v4/src/component.js'),
  )
  if (!project) throw new Error('Tailwind v4 test project did not load')
  validator = project.validator
})

describe('analyzeText', () => {
  it('colors breakpoint and state variants while coloring only arbitrary brackets', () => {
    const text = `
      <button className={cn(
        "flex items-center gap-2 md:hover:bg-red-500/50",
        active && "w-[calc(100%-2rem)] rounded-xl",
      )} />
    `

    const spans = analyzeText(text, options, scanner, validator)
    const highlighted = spans.map((span) => ({
      value: text.slice(span.start, span.end),
      group: span.group,
    }))

    expect(highlighted).toContainEqual({ value: 'flex', group: 'utility' })
    expect(highlighted).toContainEqual({ value: 'gap-2', group: 'utility' })
    expect(highlighted).toContainEqual({ value: 'md:', group: 'breakpoint' })
    expect(highlighted).toContainEqual({ value: 'hover:', group: 'variant' })
    expect(highlighted).toContainEqual({ value: 'bg-red-500/50', group: 'utility' })
    expect(highlighted).toContainEqual({ value: 'w-[calc(100%-2rem)]', group: 'utility' })
    expect(highlighted.filter(({ group }) => group === 'arbitrary')).toEqual([
      { value: '[', group: 'arbitrary' },
      { value: ']', group: 'arbitrary' },
    ])
    expect(highlighted).toContainEqual({ value: 'rounded-xl', group: 'utility' })
  })

  it('separates breakpoint variants from other variants', () => {
    const text = `<div className="@md:flex max-lg:hidden @[40rem]:grid supports-[display:grid]:block" />`
    const highlighted = analyzeText(text, options, scanner, validator).map((span) => ({
      value: text.slice(span.start, span.end),
      group: span.group,
    }))

    expect(highlighted).toContainEqual({ value: '@md:', group: 'breakpoint' })
    expect(highlighted).toContainEqual({ value: 'max-lg:', group: 'breakpoint' })
    expect(highlighted).toContainEqual({ value: '@[40rem]:', group: 'breakpoint' })
    expect(highlighted).toContainEqual({
      value: 'supports-[display:grid]:',
      group: 'variant',
    })
  })

  it('does not style custom classes or normal code identifiers', () => {
    const text = `<div className={condition ? "flex custom-card" : variableName} />`
    const values = analyzeText(text, options, scanner, validator).map((span) =>
      text.slice(span.start, span.end),
    )

    expect(values).toContain('flex')
    expect(values).not.toContain('custom-card')
    expect(values).not.toContain('condition')
    expect(values).not.toContain('variableName')
  })

  it('uses important styling for the entire class instead of variant or arbitrary colors', () => {
    const text = `<div className="hover:!mt-4 w-[13px]!" />`
    const highlighted = analyzeText(text, options, scanner, validator).map((span) => ({
      value: text.slice(span.start, span.end),
      group: span.group,
    }))

    expect(highlighted).toContainEqual({ value: '!mt-4', group: 'utility' })
    expect(highlighted).toContainEqual({ value: 'hover:!mt-4', group: 'important' })
    expect(highlighted).toContainEqual({ value: 'w-[13px]!', group: 'utility' })
    expect(highlighted).toContainEqual({ value: 'w-[13px]!', group: 'important' })
    expect(highlighted).not.toContainEqual({ value: 'hover:', group: 'variant' })
    expect(highlighted.some(({ group }) => group === 'arbitrary')).toBe(false)
  })

  it('colors brackets in arbitrary variants and values', () => {
    const text = `<div className="[&>svg]:w-[13px]" />`
    const highlighted = analyzeText(text, options, scanner, validator).map((span) => ({
      value: text.slice(span.start, span.end),
      group: span.group,
    }))

    expect(highlighted).toContainEqual({ value: '[&>svg]:', group: 'variant' })
    expect(highlighted.filter(({ group }) => group === 'arbitrary')).toEqual([
      { value: '[', group: 'arbitrary' },
      { value: ']', group: 'arbitrary' },
      { value: '[', group: 'arbitrary' },
      { value: ']', group: 'arbitrary' },
    ])
  })
})

it('maps compact-buffer positions back through Unicode source offsets', () => {
  const text = `const label = "😀"; <div className="flex p-4" />`
  const spans = analyzeText(text, options, scanner, validator)
  const highlighted = spans.map((span) => text.slice(span.start, span.end))

  expect(highlighted).toContain('flex')
  expect(highlighted).toContain('p-4')
})
