# Roadmap

## What This Is

Possible future improvements discovered during implementation and competitive review. None are committed unless explicitly approved.

Verified 2026-08-11.

## Possible Features

### Project dependency invalidation

- Track local modules loaded through v4 `@plugin`/`@config` if real projects show stale design systems after those files change. Current CSS and `package.json` invalidation covers the primary CSS-first path. (`src/extension/controller.ts`, `src/tailwind/project.ts`)

### Extension-host integration coverage

- Add focused VS Code extension-host tests only if lifecycle/theme/config regressions begin escaping the current core test suite. Current tests live under `tests/`.

### Additional class helper defaults

- Consider common Tailwind helper names such as `tv` or `twJoin` only if real usage justifies enabling them by default. Users can already add regex patterns through `tailwindClassHighlighting.classFunctions`. (`src/extension/config.ts`, `package.json`)

### Broader platform distribution

- Add additional native/WASM targets only if demand justifies them. Current packaging intentionally covers desktop macOS, Windows, and Linux x64/arm64. (`scripts/package.mjs`, `.github/workflows/package.yml`)

### Automated publishing

- Consider registry publish automation after the first release. Current workflows deliberately stop at validated platform-specific VSIX artifacts so VS Code Marketplace and Open VSX publication can be controlled independently. (`.github/workflows/package.yml`)

## Related

- [[pages/Project Overview]]
- [[pages/Highlighting Pipeline]]
- [[pages/Open Questions and Risks]]
- [[pages/Build Test and Release]]
