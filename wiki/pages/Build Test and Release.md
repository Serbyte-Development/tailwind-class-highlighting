# Build Test and Release

## What This Is

Validation, bundling, native VSIX packaging, and CI/release mechanics for the extension.

Verified 2026-08-11.

## Validation

- `npm test` runs Vitest coverage for region/candidate parsing, Unicode position mapping, visual spans, project-local Tailwind v4 loading, imported CSS, custom utilities/variants/theme values, multiple entrypoints, monorepo isolation, unsupported v3 behavior, and project-load failures. (`package.json`, `tests/`)
- `npm run check` runs strict TypeScript checking without emitting files. (`package.json`, `tsconfig.json`)
- `npm run format:check` runs Prettier in check mode. (`package.json`)
- `npm run bench` measures steady-state project-aware validation on dense 500, 1,000, and 5,000-line TSX fixtures. Candidate validity is cached by unique class inside the project validator. (`package.json`, `benchmarks/analyze.bench.ts`, `src/tailwind/project.ts`)

## Build

- esbuild bundles `src/extension.ts` as CommonJS for Node 20. Development builds include source maps; production builds minify and omit source maps. (`esbuild.mjs`)
- `vscode` and `@tailwindcss/oxide` stay external. Keeping Oxide external allows `src/core/scanner.ts` to retain its runtime dynamic import instead of bundling the native loader. (`esbuild.mjs`, `src/core/scanner.ts`)
- `tailwindcss` is a dev dependency for deterministic v4 project fixtures only. Production runtime resolves the workspace project's own Tailwind package dynamically. (`package.json`, `src/tailwind/project.ts`)
- `vscode:prepublish` always runs the production build before `vsce package`. (`package.json`)

## Native Packaging

- `scripts/package.mjs` maps the current host OS/architecture to a VS Code target and emits `dist/tailwind-class-highlighting-<target>.vsix`. (`scripts/package.mjs`)
- Supported release targets are macOS x64/arm64, Windows x64/arm64, and Linux x64/arm64. (`scripts/package.mjs`, `.github/workflows/package.yml`)
- `.vscodeignore` excludes source, tests, benchmarks, wiki, scripts, editor config, local secrets/environment files, source maps, build config, lockfile, and generated VSIX files from the extension payload. (`.vscodeignore`)

## CI

- CI runs install, tests, typecheck, formatting, build, and package on Ubuntu for pushes and pull requests. (`.github/workflows/ci.yml`)
- The Package workflow runs the same validation and native packaging across six GitHub-hosted OS/architecture runners on manual dispatch or `v*` tags, then uploads VSIX artifacts. (`.github/workflows/package.yml`)
- The current workflows package artifacts but do not publish to the VS Code Marketplace or Open VSX. (`.github/workflows/package.yml`)

## Release Identity

- The extension ID is `serbytedevelopment.tailwind-class-highlighting`; `vsce` is authenticated locally for publisher `serbytedevelopment`. (`package.json`)
- `package.json` includes the GitHub repository, homepage, issue tracker, and a 512x512 PNG Marketplace icon. (`package.json`, `images/icon.png`)
- The GitHub remote is `Serbyte-Development/tailwind-class-highlighting`. Repository visibility and actual registry publication remain explicit launch steps rather than build steps.
- The current workflows package release artifacts but do not automatically publish them. The first release can remain manual so Marketplace and Open VSX publication stay independently controlled. (`.github/workflows/package.yml`)

## Related

- [[pages/Project Overview]]
- [[pages/Architecture Map]]
- [[pages/Open Questions and Risks]]
- [[pages/Roadmap]]
