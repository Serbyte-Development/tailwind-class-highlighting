# Highlighting Pipeline

## What This Is

The core mechanism that turns class-bearing source text into restrained Tailwind-aware editor decorations.

Verified 2026-08-11.

## Pipeline

### 1. Find class-bearing regions

- `findSourceRegions` recognizes configured attributes and configured helper/tag patterns rather than scanning unrelated source as classes. (`src/core/regions.ts`)
- Attribute values may be quoted or balanced `{...}` expressions; helper calls use balanced `(...)` parsing and tagged templates use quoted-template parsing. Comments and nested strings are skipped during balanced reads. (`src/core/regions.ts`)

### 2. Scan one compact buffer

- Overlapping source regions are merged, concatenated into one buffer, and mapped back to original UTF-16 offsets. (`src/core/analyze.ts`)
- One Oxide `getCandidatesWithPositions` call scans that compact buffer. (`src/core/analyze.ts`)
- The scanner module is dynamically imported and cached on first actual need. (`src/core/scanner.ts`)

### 3. Decide whether a candidate is Tailwind

- Variants are split only on top-level `:` separators outside brackets, parentheses, and quotes. (`src/core/candidate.ts`)
- For Tailwind v4, `TailwindProjectManager` treats `@import "tailwindcss"` as the deterministic project anchor. It resolves the nearest package boundary and local `tailwindcss`, then follows relative CSS importers upward and selects the nearest top-level root for the document. (`src/tailwind/project.ts`)
- Resolution is bounded to the document's VS Code workspace folder. If multiple top-level Tailwind roots are equally close, resolution returns no project instead of depending on filesystem order. (`src/extension/controller.ts`, `src/tailwind/project.ts`)
- The project's own design system validates complete candidates with `candidatesToCss()`, so built-ins, custom theme values, `@utility`, and `@custom-variant` semantics follow the project's Tailwind version. (`src/tailwind/project.ts`, `src/core/validator.ts`)
- If a local Tailwind v4 project cannot be resolved or loaded, analysis is skipped and existing decorations are cleared. (`src/extension/controller.ts`, `src/tailwind/project.ts`)

### 4. Create visual spans

- `utility`: utility portion only, faint dotted underline. (`src/core/analyze.ts`, `src/extension/decorations.ts`)
- `breakpoint`: default breakpoint variants plus project-defined breakpoint/container names derived from Tailwind v4 variant metadata. (`src/core/analyze.ts`, `src/tailwind/project.ts`)
- `variant`: other variants such as hover/focus/dark/data/aria forms. (`src/core/analyze.ts`)
- `arbitrary`: only individual `[` and `]` characters across arbitrary variants/values. (`src/core/candidate.ts`, `src/core/analyze.ts`)
- `important`: whole candidate when the utility starts or ends with `!`. (`src/core/candidate.ts`, `src/core/analyze.ts`)

## Visual Precedence

- Normal candidate: utility underline + breakpoint/state colors + arbitrary bracket color as applicable.
- Important candidate: utility underline + whole-candidate important foreground color; breakpoint/state/arbitrary foreground spans are deliberately not emitted. (`src/core/analyze.ts`)
- Custom/unrecognized candidate: no spans at all. (`src/core/analyze.ts`)

## Theme Colors

- `tailwindClassHighlighting.utilityUnderline`
- `tailwindClassHighlighting.breakpoint`
- `tailwindClassHighlighting.variant`
- `tailwindClassHighlighting.arbitrary`
- `tailwindClassHighlighting.important`

Defaults for light, dark, and high-contrast themes are declared in `package.json`; renderer decorations reference them through `vscode.ThemeColor`. (`package.json`, `src/extension/decorations.ts`)

## Easy-to-Misread Decisions

- Oxide is intentionally only the candidate tokenizer. Tailwind v4 semantic truth comes from the project's own `tailwindcss`; bundled Oxide remains because `tailwindcss` alone does not guarantee a local Oxide dependency. (`src/core/scanner.ts`, `src/tailwind/project.ts`)
- There is no local utility-family recognizer. Tailwind's project design system is deliberately the only semantic authority. (`src/core/analyze.ts`, `src/tailwind/project.ts`)
- Arbitrary-value contents are not syntax-colored. Only the square brackets are colored to keep the extension visually restrained. (`src/core/candidate.ts`, `src/extension/decorations.ts`)
- Important classes intentionally suppress the other foreground categories so the whole class reads as one visual unit. (`src/core/analyze.ts`)

## Related

- [[pages/Project Overview]]
- [[pages/Architecture Map]]
- [[pages/Open Questions and Risks]]
- [[pages/Roadmap]]
