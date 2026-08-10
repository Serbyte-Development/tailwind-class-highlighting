# Tailwind Highlight

Fast semantic highlighting for Tailwind CSS utility classes in VS Code and Cursor.

## What it does

Tailwind Highlight makes dense utility lists easier to scan by coloring utilities according to what they do: layout, flex/grid, spacing, sizing, typography, color, borders, effects, motion, interaction, and accessibility. Variant prefixes are highlighted separately.

The extension uses Tailwind CSS's own Oxide candidate extractor for modern Tailwind syntax, including arbitrary values and arbitrary variants. It only feeds class-bearing source regions to Oxide, avoiding unrelated source-code matches.

## Supported class contexts

- `class` and `className`
- Vue `:class` / `v-bind:class`
- Angular `ngClass`
- Astro `class:list`
- `clsx`, `classnames`, `cn`, `cva`, `twMerge`
- configurable class functions and tagged templates
- automatically reuses custom `tailwindCSS.classFunctions` and `tailwindCSS.classAttributes` settings from the official IntelliSense extension

## Performance

- one source-region pass per debounced edit
- one native Tailwind Oxide scan over only class-bearing source regions
- one classification pass per candidate
- at most one `setDecorations()` call per semantic group
- unchanged decoration groups are not resent to the editor

Current synthetic benchmark on Apple Silicon with Tailwind utilities on every line: about 3.75 ms for 500 TSX lines, 7.4 ms for 1,000 lines, and 39.3 ms for 5,000 lines.

## Development

```sh
npm install
npm test
npm run check
npm run build
npm run bench
npm run package
```
