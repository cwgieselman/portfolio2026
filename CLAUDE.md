# Portfolio2026 -- Claude Code Instructions

UX/Design Systems portfolio for Craig Gieselman. Built with 11ty (v3), Nunjucks, Sass, and a deterministic Figma->YAML->template->DOM pipeline.

## Non-Negotiable Working Rules

- **Diagnose before touching code.** When something looks wrong, run a JS diagnostic (`getBoundingClientRect`, `getComputedStyle`, `console.log`) first. Never guess or reason from source code about what "should" be correct.
- **One change, then verify.** Make one change, confirm the build updated, verify the result in the browser with a diagnostic. Do not chain changes before checking.
- **Never report a fix as working without measuring it.** Code reading is not verification.
- **MCP screenshots are not reliable.** The MCP Firefox instance may differ from the user's browser. Use JS diagnostics for computed values.
- **Trust the user's visual report.** If Craig says something looks wrong, it is wrong. Run a diagnostic — do not argue from code.

## Commands

- `npm start` -- Build tokens, serve 11ty (Sass compiled natively by 11ty)
- `npm run build` -- Full production build
- `npm run tokens:build` -- Regenerate SCSS token files from `tokens/tokens.json`

## PR Documents

PR descriptions and commit suggestions live in `_docs/`. When given a PR filename to review, also read `_docs/session-state.md` for broader context on why the work was done and what problems it is solving. The PR doc carries commit-specific detail; `session-state.md` carries the why.

---

## Visual Regression Testing

Playwright tests both Chromium and WebKit at every breakpoint before committing CSS changes. **Run this before and after any CSS change that touches layout, mosaic, or responsive behavior.**

```bash
npm run test:visual          # capture/update screenshots, assert metrics
npm run test:visual:check    # assert only -- fails if anything changed
npm run test:visual:report   # open HTML report in browser
```

**What it tests:**
- Full-page screenshots at all four main viewports (390, 820, 1052, 1248) in both browsers
- Hard assertions at the six crossover viewports (+-1px around 1052 and 1248)
- Overflow sweep: mosaic `gridW <= contentCellW` assertion at every 50px from 375-1400px

**The core invariant:** The mosaic must never exceed its content-cell width at any viewport in either browser. If this assertion fails the test output tells you the exact viewport, browser, gridW, and contentCellW.

**Screenshots saved to** `tests/screenshots/{chromium|webkit}/inficon-impact-manager/` -- gitignored, local only.

**Dev server must be running** (`npm start`) before running tests.

---

## Validation (run before committing)

- No automated CI gates currently active. Validate visually in browser via `npm start`.
- Run `npm run tokens:build` after editing `tokens/tokens.json`.

## Breakpoint Inspection Rig

Four Chrome Incognito windows in Responsive Design Mode, set to these exact viewports. Bump the last two by 1px to see the crossover behavior.

| Label | Viewport | Notes |
|-------|----------|-------|
| iPhone | 390x844 | Mobile -- 2-up mosaic, block layout |
| iPad | 820x1180 | Tablet -- 2-up mosaic, 2-col Grid |
| Laptop | 1052x657 | Just below the 1052->1053 flip point |
| Desktop | 1248x848 | Just above the 1248 FF Grid threshold |

The 1052->1053 crossover is where the macro layout switches from 2-col Grid to FF Grid.
The mosaic switches from 2-up to 4-up at container width 624px (MIN cells) and 752px (MONEY cells).

---

## Token Sync Workflow (Figma -> Code)

Token Studio has been decommissioned. The active workflow is:

1. Open a Claude.ai session with Figma MCP connected
2. Read variables from the CGDC-DS Figma file via `use_figma`
3. Write updated values to `tokens/tokens.json` via the filesystem MCP
4. Run `npm run tokens:build` to regenerate SCSS token files
5. Commit `tokens/tokens.json` and the generated `_tokens--*.scss` files together

**Important:** Run `npm run tokens:build` after any edit to `tokens/tokens.json`.
The `tokens/sync` branch prefix is retired -- do not use it.

## Project Architecture

```
Figma (design intent -- not consumed directly by templates)
  |
YAML (implementation contract -- the ONLY data source for templates)
  |
Eleventy templates (Nunjucks)
  |
Rendered HTML
  |
CSS (layout + styling via Sass, compiled natively by 11ty)
```

**Two active rendering pipelines:**

Pipeline A -- Chapter/Page/Mosaic (case study pages):
`compiled-page.njk` -> chapter/page layout -> `components/mosaic.njk`

Pipeline B -- Executor (non-mosaic pages):
`compiled-page.njk` -> `page.njk` -> `content-cell.njk` -> component includes

YAML lives in `src/_data/pages/<pageKey>/page.yml`. The data loader is `src/_data/pages.js`.

## Non-Negotiable Rules

Read `CONTRACT.md` before modifying any template, executor, component, or data file. It is the normative specification. What follows is a summary -- CONTRACT.md is authoritative when in doubt.

### No Invention

Never invent copy, labels, alt text, captions, or URLs. All string content comes from Figma or is marked `TODO:<field>`. This applies to YAML generation, template output, and any content-touching work.

### Deterministic Rendering

- Templates render exactly what YAML defines. Nothing more.
- No implicit defaults. No param reshaping. No scope leakage.
- No `or {}` fallbacks, no `| default()` filters, no silent omissions.
- Missing required fields must emit visible error comments: `<!-- <SCOPE>_ERROR: <message> -->`
- Unknown includes must emit: `<!-- UNKNOWN_INCLUDE: ... -->`

### Executor Contract (Pipeline B only -- content-cell.njk)

- Each include receives a single `params` object and renders only that object.
- Safelisted includes only: `figure.njk`, `header.njk`, `link-block.njk`, `richtext.njk`
- Adding a new include requires: (1) update executor safelist, (2) add CONTRACT.md section, (3) regenerate docs.

### CSS / Layout Rules

- No `position: absolute`, no transform offsets, no negative margins (except documented CONTRACT_EXCEPTION blocks in SCSS).
- Placement uses `grid-column`, `grid-row`.
- No `var(--token, fallback)` -- fallback values in CSS custom properties are prohibited.
- No magic numbers. Every spacing/typography/layout value must trace to a token.
- Display typography (h1, h2) uses explicit grid-snapped line-height tokens, not multipliers.

### Token System

- Source of truth: `tokens/tokens.json`
- Generated outputs (do not edit directly):
  - `src/assets/scss/_tokens--primitives.scss`
  - `src/assets/scss/_tokens--semantic.scss`
  - `src/assets/scss/_tokens--component.scss`
- Run `npm run tokens:build` after editing `tokens/tokens.json`.
- Token Studio is decommissioned. Do not reinstall.

## Development Workflow

This project uses a two-phase workflow. Full details in `_docs/WORKFLOW.md`.

**Phase 1 -- Design & Build (Claude.ai chat session)**
Architectural decisions, Figma reading, file edits, browser verification.
Output: changed files on a feature branch + a PR summary document.

**Phase 2 -- Review & Commit (Claude Code in Zed)**
Mechanical verification against contracts, build checks, tidiness review.
Output: clean commit pushed to branch, ready to merge.

No branch merges to `main` without a Claude Code review pass.
See `_docs/WORKFLOW.md` for the PR summary template and review checklist format.

---

## Workflow

### For structural changes (new components, executor routing, token schema, contract changes):

1. Read CONTRACT.md
2. Make the smallest possible change
3. Verify visually in browser
4. Commit independently -- one component per cycle
5. Log change in README

### For content/visual changes (copy updates, styling, non-structural tweaks):

1. Verify visually in browser
2. Commit normally

### Branch naming

Prefix signals intent; slug identifies subject. Format: `<prefix>/<short-slug>`

| Prefix | Intent | Example |
|---|---|---|
| `rehab/` | Restore integrity, eliminate drift | `rehab/mosaic-rename` |
| `stabilize/` | Contract alignment, systemic corrections | `stabilize/executor-safelist` |
| `build/` | New feature work | `build/inficon-impact-manager` |
| `experiment/` | Prototypes and exploration | `experiment/grid-offset-layout` |

## File Boundaries

- **Safe to edit:** `src/`, `tokens/tokens.json`, `CONTRACT.md`, `README.md`, `scripts/`
- **Generated -- do not hand-edit:** `src/assets/scss/_tokens--*.scss`
- **Build output -- do not commit:** `_site/`

## Key Reference Files

- `CONTRACT.md` -- Normative render contract, component APIs, all invariants
- `scripts/COMPILE_PROMPTS.md` -- Full page compile prompt (Figma -> YAML + placements + report)

---

## Terminology

**These names are canonical. Use them exactly. Do not invent synonyms.**

- **Story** -- The full case study page. CSS class `layout__story`.
- **Chapter** -- A narrative unit. Instance of `chapter-##`. Contains a skeleton (P00), pages (P01-PN), and a richtext field text block.
- **Page** -- A scroll-stack unit within a chapter. Instance of `chapter--page-##`. Contains a mosaic grid.
- **Richtext** -- Long-form editorial text. Figma component: `richtext`. Template: `richtext.njk`. CSS class: `.richtext`. Used in both pipelines. Handles `p`, `h2`, `h3`, `ul`, `ol`.
- **Mosaic** -- The CSS Grid inside a `.mosaic` component instance. Tiles are `<article>` elements. Driven by container queries. Any reference to "bento", "bento grid", or "bento layout" must use "mosaic" instead. YAML key `tiles:` maps to `<article>` elements -- intentional split.
- **Mosaic tile** -- Individual cell inside `.mosaic`.
- **2-col Grid** -- The simplified two-column layout grid active at 640px-1247px.
- **FF Grid** -- The full 5-IU macro page grid. Active at >= 1248px viewport for special-case page types. Not the default container for case study pages.
- **pageKey** -- Kebab-case slug identifying a page. Must match folder name in `src/_data/pages/`.
- **Compiled page** -- A page whose content is defined entirely in YAML and rendered through a pipeline template. No inline content in `.njk` files.

---

## Layout Grid System

Three tiers, small -> large. Defined in `src/assets/scss/_layout.scss`.

| Tier | Viewport | Grid | Notes |
|---|---|---|---|
| **Block** | `< 640px` | No grid -- content stacks | 24px inline padding on `.layout__page` |
| **2-col Grid** | `640px - 1247px` | `1.5rem | 14rem | 3rem | 1fr | 1.5rem` | `--scale-base: 14px` overridden here |
| **FF Grid** | `>= 1248px` | 5-IU Field and Frame, fixed 2016px | Special-case page types only |

**FF Grid geometry:**
- IU Wide: 384 x 240px
- IU Split: 384 x 390px
- Gutter: 24px
- Field: 2016px (5 IUs + 4 gutters)
- Frame: 1200px wide x 750px tall

**FF Grid column lines (10 lines, px positions):**
`1=0  2=384  3=408  4=792  5=816  6=1200  7=1224  8=1608  9=1632  10=2016`

**FF Grid row lines (16 lines, px positions):**
`1=0  2=216  3=240  4=264  5=390  6=414  7=504  8=528  9=654  10=678  11=768  12=792  13=918  14=942  15=966  16=1182`

---

## Typography System

Type scales are controlled by `--scale-base` in `src/assets/scss/_tokens--primitives.scss`. All type tokens derive from it via `calc(var(--scale-base) * N)`.

**Design philosophy:** Block (phone) and desktop (2-col Grid + FF Grid) are both `--scale-base: 16px`. The block tier applies explicit overrides in `_typography.scss` where proportional scaling isn't right for narrow columns.

**Figma is the source of truth for all type values. Always read from CGDC-DS before modifying.**

| Style | Token | Block `< 640px` | Desktop `>= 640px` |
|---|---|---|---|
| **page title** Raleway Bold | `type/pageTitle/*` | 40px / 48px | 28px / 48px |
| **h2 / section heading** Raleway Semibold | `type/sectionHeading/*` | 32px / 32px | 32px / 40px |
| **h3 / subheading** Raleway Regular | `type/subheading/*` | 20px / 28px | 20px / 32px |
| **p / paragraph** PT Sans Regular | `type/paragraph/*` | 16px / 28px | 16px / 28px |
| **eyebrow** Raleway Regular caps | `type/eyebrow/*` | 16px / 20px | 16px / 20px |
| **fineprint** PT Sans Regular | `type/fineprint/*` | 12px / 20px | 12px / 20px |
| **pill** Raleway Regular caps | `type/pill/*` | 12px / 20px | 12px / 20px |

Notes:
- `pageTitle` is used for the case study page `<h1>` only (via `page-header` component).
- `sectionHeading` is the `h2` global style and the mosaic `mosaic-lead` span.
- `subheading` is the `h3` global style, the `h2` non-semantic subhead, and the `page-header` subhead.
- Block overrides are explicit in `_typography.scss`. Desktop values come directly from tokens.
- The 2-col Grid tier (640-1247px) does not override `--scale-base` for type -- all tiers >= 640px use the same token values.

---

## Image Handling

- Using passthrough `<img>` only (`components/figure.njk`).
- `src` must be a public path under `/assets/images/`.
- `@11ty/eleventy-img` async shortcode available but not yet wired. Enable only after deterministic verification.

## Data File Naming

Data files referenced in Nunjucks templates must use **camelCase or single-hyphen names**. Double-hyphen names are parsed by Nunjucks as arithmetic and will silently fail.

- Safe: `bentoDiscovery.yml`, `bento-discovery.yml`
- Unsafe: `inficon--discovery-bento.yml`

---

## Mosaic System

The Mosaic is the grid composition component for case study pages. Full contract in CONTRACT.md.

**Files:**
- Template: `src/_includes/components/mosaic.njk`
- Styles: `src/assets/scss/components/_mosaic.scss`
- Placements: `src/assets/scss/placements/_<pageKey>.scss`

**Retired (do not reference):**
- `src/assets/scss/components/_bento-backgrounds.scss`
- `src/_data/bentoDiscovery.js`
- `src/_data/inficon--discovery-bento.yml`
- `src/bento-test.njk`
- `src/_includes/layouts/section.njk`

**Five named themes:** `primary-dark`, `primary-light`, `secondary-dark`, `secondary-light`, `default`

**Inline typography spans** (pass through `| safe`):

| Span | Font | Size `clamp` |
|------|------|-------------|
| `mosaic-stat` | Playfair Display Bold | `50px -> 72px` |
| `mosaic-lead` | Raleway Regular | `19px -> 24px` |
| `mosaic-lead-italic` | Raleway Italic | `19px -> 24px` |
| `mosaic-body` | PT Sans Regular | `13px -> 16px` |
| `mosaic-body-bold` | PT Sans Bold | `13px -> 16px` |

**Responsive model -- container-query driven:**

| Container width | Layout | Cell size |
|---|---|---|
| Default | 2-up, fluid | MIN -> MAX (`minmax(144px, 208px)`) |
| `content-cell >= 624px` | 4-up, `fit-content` | MIN (144px) |
| `content-cell >= 752px` | 4-up, `fit-content` | MONEY (176px) -- designed state |

**Tile types:** `frame`, `bleed`, `bleed` + `artDirection`, `bleed` + `scrollable`, `skeleton`

- `frame` — padded (16px), for text/stats/quotes. Maps to Figma `frame` tile.
- `bleed` — no padding, media fills tile. Maps to Figma `bleed` tile.
- `artDirection: true` — additive on `bleed`. Emits `data-mosaic-media="art-directed"` on the article. No extra class. `<picture>` with viewport-switched crops.
- `scrollable: true` — additive on `bleed`. Renders two sibling articles with `data-mosaic-media="desktop"` and `data-mosaic-media="scrollable"`. CSS drives show/hide at the 624px threshold.

**Custom tiles:** `custom: true` is an additive boolean on any base type. When set, a `variant: "name"` string prop is also required — it becomes `data-mosaic-variant` on the article element. No extra CSS class is emitted. All extended behavior (overflow overrides, `::before` pseudo-elements, JS state) hangs off `[data-mosaic-variant]` selectors in the placements file.

**Art-directed image YAML:**
```yaml
- id: article-03
  type: bleed
  artDirection: true
  media:
    src: "/assets/images/photo--landscape.jpg"
    mobileSrc: "/assets/images/photo--square.jpg"
    hasAlt: true
    alt: "Descriptive alt text"
```

**Scrollable image YAML:**
```yaml
- id: article-07
  type: bleed
  scrollable: true
  media:
    src: "/assets/images/figjam--wide.png"
    scrollSrc: "/assets/images/figjam--wide.png"
    hasAlt: true
    alt: "Descriptive alt text"
```
