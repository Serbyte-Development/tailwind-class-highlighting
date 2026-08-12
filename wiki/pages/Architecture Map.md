# Architecture Map

## What This Is

Technical map of the extension runtime, build stack, and major source boundaries.

Verified 2026-08-11.

## Stack

- TypeScript with strict checking and no emit from `tsc`. (`tsconfig.json`)
- VS Code Extension API with Node 20 target. (`package.json`, `esbuild.mjs`)
- Tailwind Oxide `4.3.3` for candidate extraction. (`package.json`)
- The workspace project's installed Tailwind v4 package for project-aware candidate validation and variant metadata. Tailwind is a dev dependency only for reproducible fixtures; runtime loading resolves the user's project package. (`src/tailwind/project.ts`, `package.json`)
- esbuild for the CommonJS extension bundle, Vitest for unit/benchmark coverage, Prettier for formatting, and `vsce` for VSIX packaging. (`package.json`, `esbuild.mjs`, `scripts/package.mjs`)

## Layers

| Layer               | Where                                                    | Responsibility                                                                                      |
| ------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Extension entry     | `src/extension.ts`                                       | Creates and disposes the controller.                                                                |
| Lifecycle/config    | `src/extension/controller.ts`, `src/extension/config.ts` | Visible-editor updates, debounce, config refresh, lazy scanner acquisition.                         |
| Source context      | `src/core/regions.ts`                                    | Finds class-bearing attributes/functions while respecting strings/comments/balanced expressions.    |
| Native scanner seam | `src/core/scanner.ts`                                    | Dynamically imports and caches one Oxide scanner.                                                   |
| Tailwind project    | `src/tailwind/project.ts`, `src/core/validator.ts`       | Resolves local Tailwind, discovers v4 CSS roots, loads/caches design systems, validates candidates. |
| Analysis            | `src/core/analyze.ts`                                    | Compact scan buffer, offset mapping, candidate recognition, visual span generation.                 |
| Candidate syntax    | `src/core/candidate.ts`                                  | Top-level variant splitting, arbitrary bracket positions, important modifier detection.             |
| Rendering           | `src/extension/decorations.ts`                           | Theme-color-backed decoration types, range batching, unchanged-range suppression.                   |

## Runtime Lifecycle

- Activation is `onStartupFinished`; the controller itself is lightweight. (`package.json`, `src/extension.ts`)
- Visible editors are scheduled immediately; document edits are debounced per `TextEditor`, so split editors do not cancel one another. (`src/extension/controller.ts`)
- Unsupported/disabled documents are cleared before scanner acquisition, so Oxide is not loaded just because the extension activated. (`src/extension/controller.ts`, `src/core/scanner.ts`)
- Each file document passes its own VS Code workspace-folder boundary into project resolution, which keeps multi-root workspaces isolated and prevents resolution from walking into unrelated parent directories. (`src/extension/controller.ts`, `src/tailwind/project.ts`)
- The controller waits for the lazily loaded scanner and drops stale async results if the document version changed while waiting. (`src/extension/controller.ts`)
- The controller resolves the local Tailwind project in parallel with Oxide loading. CSS and `package.json` changes invalidate project/design-system caches and rescan visible editors. (`src/extension/controller.ts`, `src/tailwind/project.ts`)
- `extensionKind` is `workspace`, not UI-first, because project-local packages must be resolved where the workspace filesystem and `node_modules` actually live. (`package.json`)
- Configuration changes rebuild decoration types and rescan visible editors. Changes to both `tailwindClassHighlighting` and shared Tailwind IntelliSense class settings are observed. (`src/extension/controller.ts`, `src/extension/config.ts`)

## Configuration Boundary

- User settings live under `tailwindClassHighlighting`. (`package.json`, `src/extension/config.ts`)
- Defaults cover HTML, JS/JSX, TS/TSX, Vue, Svelte, Astro, PHP, and Blade plus common class attributes/functions. (`package.json`, `src/extension/config.ts`)
- Theme colors are separate contribution points and are not ordinary extension settings. (`package.json`, `src/extension/decorations.ts`)

## Related

- [[pages/Project Overview]]
- [[pages/Highlighting Pipeline]]
- [[pages/Build Test and Release]]
