# Tailwind Class Highlighting Wiki Maintainer

This vault follows the LLM wiki pattern from Andrej Karpathy's "LLM Wiki" gist (`https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f`): raw sources are read-only evidence, the wiki is maintained markdown, and this file is the schema for future agents.

The vault lives at `wiki/`.

## Purpose

- Tailwind Class Highlighting is a VS Code/Cursor extension that adds restrained visual structure to recognized Tailwind CSS classes without styling ordinary custom classes.
- Start with [[pages/Project Overview]] for concise orientation across the project's purpose, audience, status, workflows, boundaries, conventions, constraints, and deeper wiki entry points.
- The wiki covers the class-detection pipeline, Oxide integration, visual precedence, extension lifecycle/configuration, testing, packaging, release mechanics, and known accuracy limits.
- Keep maintained synthesis in the wiki so future agents do not have to rediscover the project from scratch.

## Layers

- `raw/`: supporting source documents and `source-manifest.md`. Treat source material as read-only evidence.
- `pages/`: maintained synthesis. Update existing pages when project facts change.
- `templates/`: page templates for future additions.
- `index.md`: the content map and primary entry point. Update it when pages are added or renamed.
- `log.md`: the append-only maintenance log using `## [YYYY-MM-DD] operation | description` entries.

## Wiki Rules

- Start with `index.md`, then open only the pages relevant to the current question or task.
- Use current code and tests for implementation truth and approved business sources for business facts.
- Cite repository-relative paths for implementation facts.
- If evidence conflicts, preserve the current fact in the wiki and record the conflict with the supporting source.
- Update an existing page before adding one. Keep pages short, direct, and marked `Verified YYYY-MM-DD`.
- Connect related pages with Obsidian wikilinks rooted at `wiki/`.
- Keep `Possible Features` clearly labeled as uncommitted ideas, not current behavior or an approved roadmap.
- Do not update the wiki during unrelated work. Update it when the user requests maintenance or the current task changes documented facts.
- Preserve the visual contract unless the user explicitly changes it: normal Tailwind utilities get only the faint dotted underline; breakpoint and state variants use separate colors; arbitrary syntax colors only square brackets; important classes use one foreground color across the whole candidate; ordinary custom classes remain untouched.
- Treat the workspace project's Tailwind v4 design system as the only semantic source of truth for class validity and breakpoint/container metadata. Tailwind v3, missing projects, and failed project loads receive no highlighting rather than heuristic fallback results.

## Ingest Workflow

1. Record the supporting source in `raw/source-manifest.md`.
2. Read enough of the source to preserve its actual claims and context.
3. Verify drift-prone claims against current repository evidence.
4. Update existing pages before creating a new one.
5. Add backlinks and update `index.md` when pages change.
6. Append a `log.md` entry with the source, pages touched, corrections, and unresolved questions.

## Query Workflow

1. Read `index.md`.
2. Open the one to three most relevant pages.
3. Answer from the wiki when it is current enough.
4. Verify drift-prone claims against the repository or relevant service before presenting them as current.

## Lint Workflow

Periodically check for:

- Dead `index.md` entries.
- Orphan pages missing from `index.md` or without inbound wikilinks.
- Contradictions between wiki pages.
- Missing repository-path citations or backlinks.
- Stale claims and resolved open questions not folded back into maintained pages.
- Possible features accidentally described as implemented or committed work.
