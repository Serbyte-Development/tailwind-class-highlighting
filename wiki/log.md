# Wiki Maintenance Log

## [2026-08-11] initialize | Create project wiki

- Explored extension entry/lifecycle, source-region parsing, candidate parsing, Tailwind utility recognition, lazy Oxide loading, decoration rendering, configuration, tests, benchmarks, build scripts, package metadata, CI, packaging, and recent git history.
- Used current repository code/tests/configuration as primary evidence. No external or legacy project documents were ingested.
- Captured the finalized Tailwind Class Highlighting visual contract, lazy native scanner boundary, native theme-color customization, release packaging model, and known classifier/design-system limitations.
- Created Project Overview, Architecture Map, Highlighting Pipeline, Build Test and Release, Open Questions and Risks, and Roadmap pages.

## [2026-08-11] update | Add project-local Tailwind v4 architecture

- Added project-local Tailwind v4 resolution, CSS-root discovery, design-system validation, custom breakpoint/container metadata, multiple-entrypoint caching, and monorepo isolation.
- Recorded that bundled lazy Oxide remains the tokenizer because `tailwindcss` does not guarantee a local Oxide dependency.
- Reclassified `src/core/classify.ts` as the temporary v3/missing/broken-project fallback rather than the primary v4 source of truth.
- Benchmarked the steady-state project-aware path against fallback classification; the project-aware path is currently faster on all dense synthetic fixture sizes.
- Updated architecture, pipeline, build/test, risks, and roadmap pages to match current code.

## [2026-08-11] update | Make Tailwind v4 the compatibility boundary

- Reviewed the official Tailwind IntelliSense v3 path and found it requires a separate config/JIT compatibility subsystem with PostCSS dependencies, internal Tailwind module fallbacks, version gates, and config dependency tracking.
- Removed the hand-maintained utility classifier and made the project's Tailwind v4 design system the only semantic source of truth.
- Tailwind v3, missing Tailwind projects, and broken v4 projects now receive no highlighting instead of heuristic fallback results.
- Updated tests, benchmark intent, README, changelog, build plan, and wiki pages for the v4-only contract.

## [2026-08-11] update | Make v4 discovery import-anchored

- Replaced v4 stylesheet scoring and Tailwind-looking directive heuristics with `@import "tailwindcss"` as the deterministic project anchor.
- Relative CSS importers are followed upward so imported Tailwind bases still resolve to the actual top-level project stylesheet.
- Added regression coverage proving legacy `@tailwind utilities` and unimported `@utility` CSS cannot hijack v4 project discovery.

## [2026-08-11] update | Bound project resolution to the workspace

- Removed the arbitrary stylesheet-count cap so large projects cannot silently hide the Tailwind import after a fixed number of CSS files.
- Project lookup now stops at the document's VS Code workspace-folder boundary, preventing unrelated parent Tailwind installations from leaking into a workspace.
- Equal-distance Tailwind roots are treated as ambiguous and return no project instead of depending on filesystem traversal order.
- Added regression coverage for workspace boundaries and ambiguous roots.

## [2026-08-11] update | Complete project-local Tailwind migration

- Completed the project-local Tailwind v4 migration and removed the temporary root `build-plan.md` checklist.
- Final architecture is v4-only, uses `@import "tailwindcss"` discovery, validates candidates through the project's own design system, and has no hand-maintained utility classifier.
- Rechecked workspace-host behavior, six-target native packaging, tests, type checking, formatting, production build, benchmark performance, dependency audit, and VSIX contents.
