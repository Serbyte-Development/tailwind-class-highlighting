# Project Overview

## What This Is

Tailwind Class Highlighting is a VS Code/Cursor extension that makes dense Tailwind class lists easier to scan with restrained, Tailwind-aware visual cues.

Verified 2026-08-11.

## Current Facts

- The extension package is `tailwind-class-highlighting`, display name `Tailwind Class Highlighting`, version `0.1.0`, with VS Code engine `^1.95.0`. (`package.json`)
- It is intentionally a highlighting tool, not an IntelliSense, linting, formatting, sorting, or completion replacement. It is designed to coexist with Tailwind CSS IntelliSense. (`README.md`)
- Recognized Tailwind utilities keep the editor theme's normal text color and receive a faint dotted underline. (`src/extension/decorations.ts`, `package.json`)
- Breakpoint/container-query variants and state/behavior variants use separate foreground colors. Arbitrary syntax colors square brackets only. Important classes use one foreground color across the entire class candidate. (`src/core/analyze.ts`, `src/core/candidate.ts`, `src/extension/decorations.ts`)
- Important foreground styling wins over breakpoint, state, and arbitrary-bracket foreground styling; the normal utility underline may remain. (`src/core/analyze.ts`)
- Tailwind v4 candidates are validated by the project's own installed Tailwind design system, including project-defined utilities, variants, theme values, and breakpoint/container names. (`src/tailwind/project.ts`, `src/core/analyze.ts`)
- Ordinary custom classes remain untouched because candidates must be accepted by the project's Tailwind v4 design system before spans are emitted. (`src/tailwind/project.ts`, `src/core/analyze.ts`)
- Project resolution is bounded to the document's VS Code workspace folder. Multiple workspace/package roots do not leak Tailwind state across one another, and equally close Tailwind roots are treated as ambiguous rather than guessed. (`src/extension/controller.ts`, `src/tailwind/project.ts`, `tests/project.test.ts`)
- The native Tailwind Oxide scanner is lazy-loaded only after a supported visible editor actually needs analysis. (`src/core/scanner.ts`, `src/extension/controller.ts`)
- Visual colors are contributed as native VS Code theme colors so users/themes can override them with `workbench.colorCustomizations`. (`package.json`, `src/extension/decorations.ts`)

## Primary Workflow

1. Find configured class-bearing attributes/functions. (`src/core/regions.ts`)
2. Build one compact buffer containing only those regions. (`src/core/analyze.ts`)
3. Extract candidate strings and UTF-16 positions with Tailwind Oxide. (`src/core/scanner.ts`, `src/core/analyze.ts`)
4. Resolve the nearest project Tailwind installation and v4 CSS root, then validate candidates through that design system when available. (`src/tailwind/project.ts`, `src/core/validator.ts`)
5. Split variant/arbitrary/important syntax and emit visual spans only for accepted candidates. (`src/core/analyze.ts`, `src/core/candidate.ts`)
6. Batch editor ranges by visual treatment and skip unchanged decoration groups. (`src/extension/decorations.ts`)

## Important Boundaries

- Oxide remains the bundled tokenizer because installing `tailwindcss` does not guarantee a project-local `@tailwindcss/oxide` package. Tailwind v4 semantic validity comes from the project's own `tailwindcss` design system. (`src/core/scanner.ts`, `src/tailwind/project.ts`)
- Tailwind v3 and earlier are intentionally unsupported. Missing Tailwind projects and v4 projects whose design system cannot load receive no highlighting rather than heuristic fallback styling. (`src/extension/controller.ts`, `src/tailwind/project.ts`)
- Class contexts are configurable and also merge Tailwind CSS IntelliSense's `tailwindCSS.classFunctions` and `tailwindCSS.classAttributes` settings. (`src/extension/config.ts`)
- Native Oxide packaging makes releases platform-specific rather than one universal VSIX. (`scripts/package.mjs`, `.github/workflows/package.yml`)
- Project-local Tailwind loading requires the workspace extension host, including in Remote/SSH/WSL environments. (`package.json`, `src/tailwind/project.ts`)

## Current Status

- The production candidate has unit tests, type checking, formatting checks, benchmarks, production bundling, native packaging, and CI workflows. (`package.json`, `tests/`, `benchmarks/analyze.bench.ts`, `.github/workflows/`)
- Public release identity is configured as `serbytedevelopment.tailwind-class-highlighting`, with GitHub repository/homepage/issues metadata and a 512x512 PNG Marketplace icon. (`package.json`, `images/icon.png`)
- The repository can remain private while release preparation finishes; changing visibility and publishing to registries are deliberate launch actions rather than code changes.

## Related

- [[pages/Architecture Map]]
- [[pages/Highlighting Pipeline]]
- [[pages/Build Test and Release]]
- [[pages/Open Questions and Risks]]
- [[pages/Roadmap]]
