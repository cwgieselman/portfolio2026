# Portfolio2026 — Claude Code Instructions

UX/Design Systems portfolio for Craig Gieselman. Built with 11ty (v3), Nunjucks, Sass, and a deterministic Figma→YAML→template→DOM pipeline.

## Commands

- `npm start` — Build tokens, watch Sass, serve 11ty
- `npm run build` — Full production build
- `npm run check:ci` — Run all validation gates (executor invariants, no CSS var fallbacks, system report)
- `npm run tokens:build` — Regenerate SCSS token files from `tokens/tokens.json`
- `npm run sass:build` — One-shot Sass compile
- `npm run figma:fetch -- "<FIGMA_URL>" <pageKey>` — Fetch Figma node JSON

## Validation (run before committing)

- `npm run check:ci` must pass. Zero FAIL results.
- Generated docs: run `node scripts/gen-system-report.mjs` and `node scripts/gen-system-docs.mjs` after structural changes.
- Regenerated files go in `_docs/generated/`. These are descriptive snapshots, not normative.

## Project Architecture

```
Figma JSON (design intent, not consumed by templates)
  ↓
YAML (implementation contract — the ONLY data source for templates)
  ↓
Eleventy templates (Nunjucks)
  ↓
Rendered HTML
  ↓
CSS (layout + styling via Sass)
```

Active rendering pipeline: `compiled-page.njk → page.njk → content-cell.njk → component includes`

YAML lives in `src/_data/pages/<pageKey>/page.yml`. The data loader is `src/_data/pages.js`.

## Non-Negotiable Rules

Read `CONTRACT.md` before modifying any template, executor, component, or data file. It is the normative specification. What follows is a summary — CONTRACT.md is authoritative when in doubt.

### No Invention

Never invent copy, labels, alt text, captions, or URLs. All string content comes from Figma JSON or is marked `TODO:<field>`. This applies to YAML generation, template output, and any content-touching work.

### Deterministic Rendering

- Templates render exactly what YAML defines. Nothing more.
- No implicit defaults. No param reshaping. No scope leakage.
- No `or {}` fallbacks, no `| default()` filters, no silent omissions.
- Missing required fields must emit visible error comments: `<!-- <SCOPE>_ERROR: <message> -->`
- Unknown includes must emit: `<!-- UNKNOWN_INCLUDE: ... -->`

### Executor Contract (content-cell.njk)

- Each include receives a single `params` object and renders only that object.
- Safelisted includes only: `figure.njk`, `header.njk`, `link-block.njk`, `richtext.njk`
- Adding a new include requires: (1) update executor safelist, (2) add CONTRACT.md section, (3) regenerate docs, (4) re-run system report.

### CSS / Layout Rules

- No `position: absolute`, no transform offsets, no negative margins.
- Placement uses named grid lines (`grid-column`, `grid-row`).
- No `var(--token, fallback)` — fallback values in CSS custom properties are prohibited.
- No magic numbers. Every spacing/typography/layout value must trace to a token.
- Display typography (h1, h2) uses explicit grid-snapped line-height tokens, not multipliers.

### Token System

- Source of truth: `tokens/tokens.json`
- Generated outputs (do not edit directly):
  - `src/assets/scss/_tokens--primitives.scss`
  - `src/assets/scss/_tokens--semantic.scss`
  - `src/assets/scss/_tokens--component.scss`
- Run `npm run tokens:build` after editing `tokens/tokens.json`.
- Legacy tokens in `_tokens--legacy.scss` exist for backward compatibility until Token Studio pipeline is fully populated.

## Workflow

### For structural changes (new components, executor routing, token schema, contract changes):

1. Read CONTRACT.md
2. Make the smallest possible change
3. Run `npm run check:ci`
4. Regenerate docs if applicable
5. Commit independently — one component per cycle
6. Log change in README

### For content/visual changes (copy updates, styling, non-structural tweaks):

1. Run `npm run check:ci`
2. Regenerate docs if needed
3. Commit normally

### Branch naming

- `rehab/` — restore integrity, eliminate drift
- `stabilize/` — contract alignment, systemic corrections
- `build/` — new feature work
- `experiment/` — prototypes and exploration

## File Boundaries

- **Safe to edit:** `src/`, `tokens/tokens.json`, `CONTRACT.md`, `README.md`, `scripts/`
- **Generated — do not hand-edit:** `src/assets/scss/_tokens--*.scss`, `_docs/generated/*`, `src/assets/css/main.css`

## Key Reference Files

- `CONTRACT.md` — Normative render contract, component APIs, all invariants
- `scripts/COMPILE_PROMPTS.md` — Full page compile prompt (Figma JSON → YAML + placements + report)
- `scripts/SEED_SUMMARY_PROMPT.md` — Project status summary and phase rules
- `_docs/QA_WORKFLOW.md` — Drift reconciliation process
- `_docs/STABILIZATION_COMPLETE.md` — What was stabilized and exit criteria

## Terminology

- **Field** — Compositional lattice built from Interface Units. Provides rhythm and alignment.
- **Frame** — Live area of the page where the main editorial point lives.
- **Force** — Editorial posture of a page (Contextual, Interpretive, Authorial).
- **Interface Unit (IU)** — Atomic building block. Two types: Wide (desktop) and Split (two mobiles).
- **Offset** — Emergent condition when two Fields interact inside one Frame. Max one per Frame.
- **pageKey** — Kebab-case slug identifying a page. Must match folder name in `src/_data/pages/`.
- **sectionKey** — Identifies a narrative chapter. Drives heading ID derivation.
- **Compiled page** — A page whose content is defined entirely in YAML and rendered through the executor pipeline. No inline content in `.njk` files.

## Image Handling

- Currently using passthrough `<img>` only (`components/figure.njk`).
- `@11ty/eleventy-img` async shortcode is disabled during stabilize phase.
- `src` must be a public path under `/assets/images/`.
- Optimized figure (`components/figure--optimized.njk`) is not active. Do not enable without deterministic verification.
