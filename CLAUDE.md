# Portfolio2026 — Claude Code Instructions

UX/Design Systems portfolio for Craig Gieselman. Built with 11ty (v3), Nunjucks, Sass, and a deterministic Figma→YAML→template→DOM pipeline.

## Commands

- `npm start` — Build tokens, serve 11ty (Sass compiled natively by 11ty)
- `npm run build` — Full production build
- `npm run tokens:build` — Regenerate SCSS token files from `tokens/tokens.json`

## Validation (run before committing)

- No automated CI gates currently active. Validate visually in browser via `npm start`.
- Run `npm run tokens:build` after editing `tokens/tokens.json`.

## Token Sync Workflow (Figma → GitHub)

1. Update tokens in Figma via the Token Studio plugin
2. In Token Studio, push to the `tokens/sync` branch
3. GitHub Action triggers automatically — runs `tokens:build`, commits the generated SCSS
4. A PR from `tokens/sync` → `main` is opened (or updated if one is already open)
5. Review and merge

Token Studio sync settings (configure once in the plugin):
- Repository: `cwgieselman/portfolio2026`
- Branch: `tokens/sync`
- File path: `tokens/tokens.json`
- Auth: GitHub Personal Access Token (stored in plugin, not in repo)

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
CSS (layout + styling via Sass, compiled natively by 11ty)
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
- Adding a new include requires: (1) update executor safelist, (2) add CONTRACT.md section, (3) regenerate docs.

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
3. Verify visually in browser
4. Commit independently — one component per cycle
5. Log change in README

### For content/visual changes (copy updates, styling, non-structural tweaks):

1. Verify visually in browser
2. Commit normally

### Branch naming

Prefix signals intent; slug identifies subject. Format: `<prefix>/<short-slug>`

| Prefix | Intent | Example |
|---|---|---|
| `rehab/` | Restore integrity, eliminate drift | `rehab/bento-grid-rename` |
| `stabilize/` | Contract alignment, systemic corrections | `stabilize/executor-safelist` |
| `build/` | New feature work | `build/inficon-impact-manager` |
| `experiment/` | Prototypes and exploration | `experiment/grid-offset-layout` |

`tokens/sync` is reserved for the Token Studio pipeline — do not use this prefix for manual branches.

## File Boundaries

- **Safe to edit:** `src/`, `tokens/tokens.json`, `CONTRACT.md`, `README.md`, `scripts/`
- **Generated — do not hand-edit:** `src/assets/scss/_tokens--*.scss`
- **Build output — do not commit:** `_site/`

## Key Reference Files

- `CONTRACT.md` — Normative render contract, component APIs, all invariants
- `scripts/COMPILE_PROMPTS.md` — Full page compile prompt (Figma JSON → YAML + placements + report)

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

- Using passthrough `<img>` only (`components/figure.njk`).
- `src` must be a public path under `/assets/images/`.
- `@11ty/eleventy-img` async shortcode is available but not yet wired in. Enable only after deterministic verification.

## Data File Naming

Data files referenced directly in Nunjucks templates (via `{{ varName.property }}`) must use **camelCase or single-hyphen names**. Double-hyphen names (e.g. `inficon--discovery-bento.yml`) are parsed by Nunjucks as arithmetic and will silently fail.

- Safe: `bentoDiscovery.yml`, `bento-discovery.yml`
- Unsafe: `inficon--discovery-bento.yml` (double-hyphen breaks template access)

The current `inficon--discovery-bento.yml` is accessed via the `bentoDiscovery.js` wrapper, which renames it. New bento YAML files should follow camelCase naming from the start.

## Layout Grid System

The macro layout grid is defined in `src/assets/scss/_layout.scss`. All geometry is expressed as multiples of `--gu` (grid unit), which enables proportional scaling below the Frame breakpoint.

**Grid geometry:**
- IU Wide: 384 × 240px
- IU Split: 384 × 390px
- Gutter: 24px (horizontal and vertical, encoded as named-line gaps)
- Field: 2016px (5 IUs + 4 gutters)
- Frame: 1200px wide × 750px tall (3 IUs + 2 gutters; 16:10 aspect ratio)
- Page height: 1182px (3 Wide + 1 Split + 3 gutters)
- Breakpoint: 1248px — below this, `--gu = calc((100vw - 48px) / 1200)` and Field scales to `(100vw - 48px) × 1.68` (fires one gutter-width before Frame hits viewport edge, ensuring 24px minimum breathing room)

**Column lines (10 lines, px positions):**
`0, 384, 408, 792, 816, 1200, 1224, 1608, 1632, 2016`

**Row lines (16 lines, px positions):**
`0, 216, 240, 264, 390, 414, 504, 528, 654, 678, 768, 792, 918, 942, 966, 1182`

**Key named lines:**
- `frame-start` = col line 3 (408px)
- `frame-end` = col line 8 (1608px)
- `frameTop` = row line 2 (216px)
- `frameBottom` = row line 15 (966px)

**`--layout-fieldWidth`** is declared directly on `.layout__page` as a `CONTRACT_EXCEPTION` — it is grid geometry, not a design token, and must not be added to `tokens/tokens.json`.

---

## Bento Grid System

The bento grid is a standalone component for non-executor contexts (e.g. discovery/process layouts inside case study pages).

**Files:**
- Template: `src/_includes/components/bento-grid.njk` — full API docs in the file header
- Styles: `src/assets/scss/components/_bento-grid.scss`
- Themes: `src/assets/scss/_tokens--bento.scss` (hand-authored, safe to edit)
- Retired (git rm pending): `src/assets/scss/components/_bento-backgrounds.scss`, `src/_includes/components/bento-arrow.njk`, `src/_data/bentoDiscovery.js`, `src/_data/inficon--discovery-bento.yml`, `src/bento-test.njk`, `src/_includes/layouts/section.njk`
- One-off overrides: `src/assets/scss/components/bento-cells/` — add partials here, uncomment import in `main.scss`

**Four named themes** (set via `theme:` in YAML):
- `primary-dark` — primary/60 bg, primary/10 text, primary/80 border
- `primary-light` — primary/20 bg, primary/60 text, primary/30 border
- `secondary-dark` — secondary/50 bg, secondary/80 text, secondary/60 border
- `secondary-light` — secondary/20 bg, secondary/70 text, secondary/30 border

**Typography spans** (inline in any text field, all pass through `| safe`):
- `bento-type--paragraphLead` — Raleway Regular 24px
- `bento-type--paragraphLead-italic` — Raleway Italic 24px
- `bento-type--paragraph` — PT Sans Regular 16px
- `bento-type--paragraph-bold` — PT Sans Bold 16px
- `bento-type--eyebrow` — Raleway Bold 16px uppercase tracked

**Stat cell display font:** Tienne Bold (loaded via Google Fonts). Font family token: `--font-family-display`.

**Image fallbacks:** `image` and `composite` cells fall back to `baconmockup.com` via `onerror` if `src` is missing or 404s.

**Token additions made manually** (pending Token Studio sync):
- `scale.450` (72px), `font-family.display` (Tienne), `component.bento.theme.*`, `component.bento.type.*`
- `--font-family-display` and `--scale-450` are declared in `_tokens--bento.scss` until the generated files catch up.
