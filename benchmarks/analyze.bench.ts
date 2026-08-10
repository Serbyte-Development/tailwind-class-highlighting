import { bench, describe } from 'vitest'
import { analyzeText } from '../src/core/analyze'

const line = `<div className={cn("flex items-center gap-2 md:hover:bg-red-500/50", active && "w-full rounded-lg shadow-sm")} />\n`
const options = {
  extension: 'tsx',
  classAttributes: ['class', 'className'],
  classFunctions: ['clsx', 'cn', 'cva', 'twMerge'],
}

for (const lineCount of [500, 1000, 5000]) {
  const document = line.repeat(lineCount)
  describe(`${lineCount.toLocaleString()}-line TSX document`, () => {
    bench('scan + classify', () => {
      analyzeText(document, options)
    })
  })
}
