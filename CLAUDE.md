# Portfolio2026 — Claude Code Instructions

UX/Design Systems portfolio for Craig Gieselman. Built with 11ty (v3), Nunjucks, Sass, and a deterministic Figma→YAML→template→DOM pipeline.

## Commands

- `npm start` — Build tokens, serve 11ty (Sass compiled natively by 11ty)
- `npm run build` — Full production build
- `npm run tokens:build` — Regenerate SCSS token files from `tokens/tokens.json`

## PR Documents

PR descriptions and commit suggestions live in `_docs/`. Claude Code should check there before committing — each PR doc includes a commit breakdown and known gaps.

| File | Branch / Topic |
|------|----------------|
| `PR--bento-responsive.md` | Earlier bento grid work |
| `PR--bento-image-types-and-typography.md` | Image cell types, 2-up model, typography (March 16 2026) |

---

## Validation (run before committing)

- No automated CI gates currently active. Validate visually in browser via `npm start`.
- Run `npm run tokens:build` after editing `tokens/tokens.json`.

## Breakpoint Inspection Rig

Four Chrome Incognito windows in Responsive Design Mode, set to these exact viewports. Bump the last two by 1px to see the crossover behavior.

| Label | Viewport | Notes |
|-------|----------|-------|
| iPhone | 390×844 | Mobile — 2-up bento, block layout |
| iPad | 820×1180 | Tablet — 2-up bento, 2-col Grid |
| Laptop | 1052×657 | Just below the 1052→1053 flip point |
| Desktop | 1248×848 | Just above the 1248 FF Grid threshold |

The 1052→1053 crossover is where the bento switches from 2-up to 5-up. The 1248→1249 crossover is where the macro layout switches from 2-col Grid to FF Grid.

---

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

**Important:** The GitHub Action only fires on pushes to `tokens/sync`. If `tokens/tokens.json` is edited directly on a feature branch, run `npm run tokens:build` manually before committing to keep the generated SCSS in sync.

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

## Development Workflow

This project uses a two-phase workflow. Full details in `_docs/WORKFLOW.md`.

**Phase 1 — Design & Build (Claude.ai chat session)**
Architectural decisions, Figma reading, file edits, browser verification.
Output: changed files on a feature branch + a PR summary document.

**Phase 2 — Review & Commit (Claude Code in Zed)**
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

---

## Terminology

**Layout grid names are canonical. Use these exactly. Do not invent synonyms.**

- **Field and Frame Grid** (abbrev: **FF Grid**) — The full 5-IU macro page grid defined in `_layout.scss`. Five IUs, four gutters, named column and row lines, fixed geometry. Active at ≥ 1248px viewport. Any reference to "the macro grid", "the page grid", "the 5-col grid", or similar must use this name instead.
- **2-col Grid** — The simplified two-column layout grid active at 640px–1247px. Columns: `1.5rem | 14rem text | 3rem gap | 1fr figure | 1.5rem`. `--scale-base` is overridden to 14px in this tier so columns and type shrink together. Any reference to "the mid-tier grid", "the responsive grid", "the text/figure grid", or similar must use this name instead.
- **Bento Grid** — The CSS Grid inside a `.bento-grid` component instance. Driven by container queries on the parent `content-cell`. Any reference to "the bento layout", "the bento's grid", or similar must use this name instead.
- **Field** — Compositional lattice built from Interface Units. Provides rhythm and alignment.
- **Frame** — Live area of the page where the main editorial point lives.
- **Force** — Editorial posture of a page (Contextual, Interpretive, Authorial).
- **Interface Unit (IU)** — Atomic building block. Two types: Wide (desktop) and Split (two mobiles).
- **Offset** — Emergent condition when two Fields interact inside one Frame. Max one per Frame.
- **pageKey** — Kebab-case slug identifying a page. Must match folder name in `src/_data/pages/`.
- **sectionKey** — Identifies a narrative chapter. Drives heading ID derivation.
- **Compiled page** — A page whose content is defined entirely in YAML and rendered through the executor pipeline. No inline content in `.njk` files.

---

## Layout Grid System

Three tiers, small → large. Defined in `src/assets/scss/_layout.scss`.

| Tier | Viewport | Grid | Notes |
|---|---|---|---|
| **Block** | `< 640px` | No grid — content stacks | 24px inline padding on `.layout__page` |
| **2-col Grid** | `640px – 1247px` | `1.5rem | 14rem | 3rem | 1fr | 1.5rem` | `--scale-base: 14px` overridden here |
| **FF Grid** | `≥ 1248px` | 5-IU Field and Frame, fixed 2016px | Centered via `left: 50% / translateX(-50%)` |

**FF Grid geometry:**
- IU Wide: 384 × 240px
- IU Split: 384 × 390px
- Gutter: 24px
- Field: 2016px (5 IUs + 4 gutters)
- Frame: 1200px wide × 750px tall (3 IUs + 2 gutters; 16:10 aspect ratio)
- Page height: 1182px (3 Wide + 1 Split + 3 gutters)

**FF Grid column lines (10 lines, px positions):**
`1=0  2=384  3=408  4=792  5=816  6=1200  7=1224  8=1608  9=1632  10=2016`

**FF Grid row lines (16 lines, px positions):**
`1=0  2=216  3=240  4=264  5=390  6=414  7=504  8=528  9=654  10=678  11=768  12=792  13=918  14=942  15=966  16=1182`

**Key named lines:**
- `frame-start` = col line 3 (408px)
- `frame-end` = col line 8 (1608px)
- `frameTop` = row line 2 (216px)
- `frameBottom` = row line 15 (966px)

---

## Typography System

Type scales are controlled by `--scale-base` in `src/assets/scss/_tokens--primitives.scss`. All type tokens derive from it via `calc(var(--scale-base) * N)`.

**Design philosophy:** Block (phone) and FF Grid (desktop) are the two primary designed states — both run at `--scale-base: 16px` (native). The 2-col Grid tier is the adaptation layer: `--scale-base` drops to 14px so columns and type shrink together, buying room for the figure column without the type feeling broken.

**Block-tier overrides** are explicit in `src/assets/scss/_typography.scss` using `@media (max-width: 639px)`. The 2-col Grid tier adjustments fall through automatically from the `--scale-base: 14px` override in `_layout.scss` — no separate overrides needed for that tier.

| Style | Element / Class | Block `< 640px` 🟢 native | 2-col Grid `640–1247px` ⚠️ adapted | FF Grid `≥ 1248px` 🟢 native |
|---|---|---|---|---|
| **h1** Raleway Bold | `h1` | 40px / 48px | 49px / 56px | 56px / 64px |
| **h2** Raleway Semibold | `h2` | 28px / 32px | 28px / 42px | 32px / 48px |
| **h2 quiet** Raleway Regular | `h2.header__headline--quiet` | 20px / 28px | 21px / 42px | 24px / 48px |
| **h3** Raleway Regular | `h3` | 20px / 28px | 21px / 42px | 24px / 48px |
| **p** PT Sans Regular | `p` | 16px / 28px | 14px / 24.5px | 16px / 28px |
| **eyebrow** Raleway Regular caps | `.header__eyebrow` | 16px / 32px | 14px / 28px | 16px / 32px |
| **fineprint** PT Sans Regular | `.fineprint` | 12px / 20px | 10.5px / 17.5px | 12px / 20px |
| **CTA** Raleway | `.link__label` | 16px / 28px | 14px / 24.5px | 16px / 28px |

**Notes:**
- h2 quiet and h3 are intentionally identical at every tier. The semantic difference is the HTML element (`h2` vs `h3`), not the visual treatment. Use `h2` + `variant: "quiet"` on sub-pages where `h3` can't be used because there's no `h2` above it in the hierarchy.
- The `headline` param on `components/header.njk` passes through `| safe`, permitting inline HTML. Use `<span class="nobr">...</span>` to prevent proper names or product names from breaking across lines.
- Block-tier h1 override: `--scale-250` / `--scale-300` (40px / 48px at 16px base).
- Block-tier h2 override: `--scale-175` / `--scale-200` (28px / 32px at 16px base).
- Block-tier h3 and h2 quiet override: `--scale-125` / `--scale-175` (20px / 28px at 16px base).

---

## Image Handling

- Using passthrough `<img>` only (`components/figure.njk`).
- `src` must be a public path under `/assets/images/`.
- `@11ty/eleventy-img` async shortcode is available but not yet wired in. Enable only after deterministic verification.

## Data File Naming

Data files referenced directly in Nunjucks templates (via `{{ varName.property }}`) must use **camelCase or single-hyphen names**. Double-hyphen names (e.g. `inficon--discovery-bento.yml`) are parsed by Nunjucks as arithmetic and will silently fail.

- Safe: `bentoDiscovery.yml`, `bento-discovery.yml`
- Unsafe: `inficon--discovery-bento.yml` (double-hyphen breaks template access)

The current `inficon--discovery-bento.yml` is accessed via the `bentoDiscovery.js` wrapper, which renames it. New bento YAML files should follow camelCase naming from the start.

---

## Bento Grid System

The Bento Grid is a standalone component for non-executor contexts (e.g. discovery/process layouts inside case study pages).

**Files:**
- Template: `src/_includes/components/bento-grid.njk` — full API docs in the file header
- Styles: `src/assets/scss/components/_bento-grid.scss`
- Themes: `src/assets/scss/components/_bento-grid.scss` (theme rulesets in the `// -- Themes` section)
- Retired (git rm pending): `src/assets/scss/components/_bento-backgrounds.scss`, `src/_includes/components/bento-arrow.njk`, `src/_data/bentoDiscovery.js`, `src/_data/inficon--discovery-bento.yml`, `src/bento-test.njk`, `src/_includes/layouts/section.njk`
- One-off overrides: `src/assets/scss/components/bento-cells/` — add partials here, uncomment import in `main.scss`

**Four named themes** (set via `theme:` in YAML):
- `primary-dark` — primary/60 bg, primary/10 text, primary/80 border
- `primary-light` — primary/20 bg, primary/60 text, primary/30 border
- `secondary-dark` — secondary/50 bg, secondary/80 text, secondary/60 border
- `secondary-light` — secondary/20 bg, secondary/70 text, secondary/30 border

**Typography spans** (inline in any text field, all pass through `| safe`):

| Span | Font | Size `clamp` | Line-height `clamp` | Align |
|------|------|-------------|---------------------|-------|
| `bento-stat` | Tienne Bold | `50px → 72px` (`36cqi`) | `1` | center (axiomatic) |
| `bento-lead` | Raleway Regular | `19px → 24px` (`13.2cqi`) | `24px → 30px` (`17cqi`) | center (axiomatic) |
| `bento-lead-italic` | Raleway Italic | `19px → 24px` (`13.2cqi`) | `24px → 30px` (`17cqi`) | center (axiomatic) |
| `bento-body` | PT Sans Regular | `13px → 16px` (`9.2cqi`) | `18px → 24px` (`13cqi`) | left (default) |
| `bento-body-bold` | PT Sans Bold | `13px → 16px` (`9.2cqi`) | `18px → 24px` (`13cqi`) | left (default) |

**Axiomatic centering:** `.bento-cell:has(.bento-lead, .bento-lead-italic, .bento-stat)` sets `text-align: center` on the cell — all child spans inherit it. No per-span alignment needed. Body-only cells stay left-aligned by default. Images unaffected.

**Computed sizes across bento states:**

| Style | 2-up MIN `~167px` | 2-up MAX `208px` | 5-up MIN `140px` | 5-up MAX `208px` |
|-------|-------------------|------------------|------------------|------------------|
| **stat** `size / lh` | `60px / 1` | `72px / 1` | `50px / 1` | `72px / 1` |
| **lead** `size / lh` | `22px / 28px` | `24px / 30px` | `19px / 24px` | `24px / 30px` |
| **body** `size / lh` | `15px / 22px` | `16px / 24px` | `13px / 18px` | `16px / 24px` |

**Responsive model — container-query driven, small → large:**

| Threshold | Layout | Cell size |
|---|---|---|
| Default (no query) | 2-up, `width: 100%` | fluid `min(1fr, 208px)` |
| `content-cell ≥ 500px` | 2-up, `width: 100%` | 208px capped |
| `content-cell ≥ 732px` | 5-up, `width: fit-content` | 140px min (reset) |
| `content-cell ≥ 900px` | 5-up, `width: fit-content` | 208px max |

The Bento Grid 5-up threshold (732px) fires at ~1052px viewport in the 2-col Grid tier. Below that it is always 2-up. In the FF Grid tier the figure content-cell is always ≥ 792px so 5-up is always active.

**2-up layout model (content-driven rows):**
`.bento-cell__inner` is always `position: relative`. In 2-up, content drives row height via normal flow — same-row cells share height automatically via grid row track sizing. In 5-up, the grid track defines the cell height and `__inner` fills it via `height: 100%`. No `position: absolute` is used anywhere in the bento system.

**Cascade note:** 2-up aspect-ratio rules (e.g. `aspect-ratio: 4/5` on `--image-directed`) are declared before the 5-up container query in `_bento-grid.scss`. The 5-up unset uses a doubled class selector (`.bento-cell--image-directed.bento-cell--image-directed`) to beat the base rule on specificity, since container queries add no specificity and the base rule compiles after the container query block.

**Cell types — full inventory:**

| `type:` | Class | 2-up behavior | 5-up behavior | Use for |
|---------|-------|---------------|---------------|---------|
| `content` | `bento-cell--content` | content-driven height | fills grid track | text, stats, quotes |
| `image` | `bento-cell--image` | fills width, content-driven height | fills grid track, `object-fit: cover` | photos that work at any ratio |
| `image` + `artDirection: true` | `bento-cell--image-directed` | `aspect-ratio: 4/5`, viewport-switched `<picture>` | fills grid track, `object-fit: cover` | photos needing specific crops per context |
| `image` + `scrollable: true` | two siblings: `--image-desktop` + `--image-scrollable` | scrollable window `2×cell` tall, 4-way scroll, no srcset | normal image cell | wide process artifacts, FigJam boards, diagrams |
| `graphic` | `bento-cell--graphic` | `aspect-ratio: 1`, `object-fit: contain`, padded | fills grid track, `object-fit: contain` | square illustrations, diagrams, small graphics |

**`type: graphic` replaces `isCustom`** — `isCustom` was a reserved escape hatch for cells needing external CSS/JS. `graphic` is the semantic replacement. It is the correct hook for animated or externally-driven assets (Lottie, CSS animation, canvas). External asset wiring (via `cssClass:`, `jsInclude:`, or similar YAML fields) to be defined when first needed.

TODO (future): define the external asset hook API on `graphic` cells for animation/interactivity.

**Art-directed image YAML example:**
```yaml
- id: article-03
  type: image
  artDirection: true
  media:
    src: "/assets/images/photo--landscape.jpg"      # 5-up (≥ 1052px)
    mobileSrc: "/assets/images/photo--CROP.jpg"     # 2-up (< 1052px)
    hasAlt: true
    alt: "Descriptive alt text"
```

**Scrollable image YAML example:**
```yaml
- id: article-07
  type: image
  scrollable: true
  media:
    src: "/assets/images/figjam--wide.png"          # 5-up desktop instance
    scrollSrc: "/assets/images/figjam--wide.png"    # 2-up scrollable instance (no srcset)
    hasAlt: true
    alt: "Descriptive alt text"
```

The 1052px breakpoint in `<source media>` (art direction) and the `732px` container query (scrollable show/hide) are both proxies for the 2-up → 5-up flip. Tightly coupled to the figure column layout — revisit if layout context changes.

TODO (future): make `mobileSrc` crop generation programmable via Sharp at build time from a crop region defined in YAML, rather than requiring manual export.

**Stat cell display font:** Tienne Bold (loaded via Google Fonts). Font family token: `--font-family-display`.

**Token additions made manually** (pending Token Studio sync):
- `scale.450` (72px), `font-family.display` (Tienne), `component.bento.theme.*`, `component.bento.type.*`
- `--font-family-display` and `--scale-450` are now generated into `_tokens--primitives.scss`.
