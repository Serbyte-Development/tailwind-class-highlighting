# Open Questions and Risks

## What This Is

Current items that can affect correctness, compatibility, or public release quality.

Verified 2026-08-11.

## Accuracy

- **Tailwind v4 only:** Tailwind v3 and earlier are intentionally unsupported because reliable support requires a separate JIT/config compatibility layer. Unsupported projects receive no highlighting. (`src/tailwind/project.ts`, `README.md`)
- **CSS-root discovery is intentionally smaller than Tailwind IntelliSense:** current v4 discovery follows relative project CSS imports, handles multiple roots, and selects the nearest root, but it does not yet reproduce every package-import/project-graph edge case. (`src/tailwind/project.ts`, `tests/project.test.ts`)
- **Ambiguous roots deliberately disable highlighting:** if two independent Tailwind roots are equally close to a document, the extension chooses correctness over coverage and does not guess. (`src/tailwind/project.ts`, `tests/project.test.ts`)
- **Config/plugin invalidation:** CSS and `package.json` changes invalidate caches. Arbitrary local files loaded through `@plugin`/`@config` are not yet tracked individually for cache invalidation. (`src/extension/controller.ts`, `src/tailwind/project.ts`)

## Parser / Runtime

- Source-context parsing is intentionally lightweight rather than a language AST. Unusual framework syntax can expose cases not covered by current region tests. (`src/core/regions.ts`, `tests/regions.test.ts`)
- There is no VS Code extension-host integration test suite yet; current coverage is core unit tests plus real VSIX packaging/install validation. (`tests/`, `package.json`)
- Activation still occurs at `onStartupFinished`; only the native Oxide module is lazy. (`package.json`, `src/core/scanner.ts`)
- Runtime now loads the workspace project's Tailwind package and may execute Tailwind `@plugin`/`@config` modules while constructing the design system, matching Tailwind tooling expectations. (`src/tailwind/project.ts`)

## Release

- Release identity and Marketplace metadata are configured. The repository is still private and actual VS Code Marketplace/Open VSX publication remains a deliberate launch action. (`package.json`, `.github/workflows/package.yml`)
- Only six native desktop targets are packaged. Alpine/musl-specific distribution, Linux armhf, and web extensions are not current targets. (`scripts/package.mjs`, `.github/workflows/package.yml`)
- Theme colors have light/dark/high-contrast defaults, but final public visual QA across representative themes remains a release check rather than automated coverage. (`package.json`)

## Staleness Watch

- The v4 project resolver/design-system seam is concentrated in `src/tailwind/project.ts`; verify it against Tailwind API changes.
- Native packaging assumptions are concentrated in `scripts/package.mjs` and `.github/workflows/package.yml`.
- Shared Tailwind IntelliSense setting names are read in `src/extension/config.ts`; verify them if the official extension changes those APIs/settings.

## Related

- [[pages/Project Overview]]
- [[pages/Highlighting Pipeline]]
- [[pages/Build Test and Release]]
- [[pages/Roadmap]]
