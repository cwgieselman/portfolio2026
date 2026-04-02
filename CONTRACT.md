# Portfolio2026 — Deterministic Render Contract
A formal specification of the render model, component contracts, and system invariants governing Portfolio2026.

Scope of this document:
- Defines the two active rendering pipelines and when each applies.
- Specifies the chapter/page/mosaic pipeline for case study pages.
- Specifies the executor pipeline for non-mosaic pages.
- Establishes component boundaries, required params, and prohibition of implicit defaults or global hydration.
- Governs image handling policy and prevents mixed render paths.
- Protects architectural integrity by prohibiting inference, param reshaping, silent fallbacks, and undocumented behavior.

This document is normative. If generated output conflicts with this contract, either update the code to match the contract, or intentionally revise the contract.

---

## Canonical Terminology

**These names are canonical. Use them exactly — in code comments, SCSS, docs, and conversation.**

| Canonical name | Abbreviation | What it is |
|---|---|---|
| **Story** | — | A full case study page. CSS class `layout__story`. |
| **Chapter** | — | A narrative unit within a story. Instance of `chapter-##` component. |
| **Page** | — | A scroll-stack unit within a chapter. Instance of `chapter--page-##` component. |
| **Richtext** | — | An ordered sequence of typed prose blocks (paragraphs, headings, lists). Figma component: `richtext`. Template: `components/richtext.njk`. Component tokens: `component/richtext/*`. |
| **Mosaic** | — | The CSS Grid composition inside a chapter page. Tiles are `<article>` elements. |
| **Mosaic tile** | — | Individual cell inside a mosaic. YAML key `tiles:` maps to HTML `<article>` elements — intentional split. |
| **2-col Grid** | — | The simplified two-column layout grid active at 640px-1247px. |
| **FF Grid** | **FF Grid** | The full 5-IU macro page grid. Preserved for special-case page types; not the default container for case study pages. |

Do not use: "bento", "bento grid", "bento cell", "section", "macro grid", "page grid", "field text", "chapter--content", or any informal synonyms for the terms above.

---

## Deterministic Rendering Contract
Figma -> YAML -> Eleventy -> HTML -> CSS

This file defines the non-negotiable structural and rendering rules for the active system.

---

## 1. Two Active Rendering Pipelines

**Pipeline A — Chapter/Page/Mosaic (case study pages)**

The active pipeline for all case study pages. Data flows through:

```
pages.js
↓
_data/pages/<pageKey>/page.yml
↓
layouts/compiled-page.njk
↓
layouts/page.njk  (chapter/page iteration)
↓
components/mosaic.njk  (tile rendering)
```

YAML structure: `pageHeader -> chapters -> pages -> mosaic -> tiles`

Richtext blocks within a chapter compile to a `content:` array and render via `components/richtext.njk` directly — not via the executor.

**Pipeline B — Executor (non-mosaic pages)**

Used for pages with content-cell layouts. Data flows through:

```
pages.js
↓
_data/pages/<pageKey>/page.yml
↓
layouts/compiled-page.njk
↓
layouts/page.njk
↓
layouts/content-cell.njk
↓
component include
```

YAML structure: `sections -> pages -> cells -> includes`

**Do not mix pipelines.** A page uses one or the other. Never both.

---

## 2. Data Ownership

Figma JSON
- Represents design intent only.
- Not consumed directly by templates.

YAML
- Is the implementation contract.
- Is the only source of structure and content.

Templates must NOT:
- Reach into global collections implicitly
- Access `page.*` unless explicitly passed
- Access `site.data` unless explicitly passed
- Infer structure from content
- Reshape parameter objects

---

## 3. Executor Contract — content-cell.njk (Pipeline B only)

File: `src/_includes/layouts/content-cell.njk`

Purpose:
- Executes each include exactly once.
- Prevents scope leakage.
- Does not reshape or hydrate globals.

Input shape:

```
cell:
  wrapper: string
  includes:
    - include: string
      params: object
```

Execution rules:
- Each include MUST render exactly once.
- No global variable hydration is permitted.
- No param reshaping is permitted.
- Params must be passed as explicit component-specific objects.

Safelisted includes: `figure.njk`, `header.njk`, `link-block.njk`, `richtext.njk`

Adding a new include requires: (1) update executor safelist, (2) add CONTRACT.md section, (3) update docs.

Unknown include paths must render a non-fatal HTML comment in the DOM.

### Wrapper ID Convention (Pipeline B only)

Format: `<prefix>--<sectionKey>--<pageKey>--<cellName>`

Prefix rules:
- `header--` -> cell contains exactly one child: `header`
- `figure--` -> cell contains exactly one child: `figure`
- `content--` -> everything else

This convention does NOT apply to mosaic tiles. Mosaic tiles use `data-mosaic-tile` attributes as their CSS hook.

### Vert / Horiz Positioning Props (Pipeline B only)

These props control where a content-cell sits within its grid slot when the cell's content is smaller than the slot.

| Figma prop | Values | Axis |
|---|---|---|
| `Vert` | `Default` \| `Center` \| `End` | Vertical (block) |
| `Horiz` | `Default` \| `Center` \| `End` | Horizontal (inline) |

`Default` -> emit nothing. `Center` and `End` produce output. Do not emit to YAML. Do not emit as inline styles.

| Prop | Figma value | CSS output |
|---|---|---|
| `Vert` | `Center` | `align-self: center;` |
| `Vert` | `End` | `align-self: end;` |
| `Horiz` | `Center` | `justify-self: center;` |
| `Horiz` | `End` | `justify-self: end;` |

Output target: placements SCSS only, in the same selector as `grid-column` and `grid-row`.

---

## 4. Structural Determinism

Templates must:
- Render exactly what YAML defines.
- Fail visibly when required fields are missing.
- Never silently omit required structure.

### Error Marker Convention

If required component data is missing, templates MUST render:

`<!-- <SCOPE>_ERROR: <message> -->`

Examples:
```html
<!-- FIGURE_ERROR: missing src -->
<!-- CONTENT_ERROR: missing kind (richtext include) -->
<!-- EXECUTOR_ERROR: missing params -->
```

Silent failure is not permitted.

---

## 5. Layout Rules

No offset positioning:
- No `position: absolute` (except documented CONTRACT_EXCEPTION cases in SCSS)
- No transform offsets for placement
- No negative margins

Placement must use:
- Named grid lines
- `grid-column`
- `grid-row`
- `align-self`
- `justify-self`

Spacing must be controlled by grid and gap. Margin stacking is not permitted inside structural components.

---

## 6. CSS Loading Contract

`base.njk` must load: `/assets/scss/main.css`

If styling appears incorrect, verify in order:
1. CSS file exists at `_site/assets/scss/main.css`
2. CSS file is loaded in browser (href must match)
3. Class names match rendered DOM
4. No later stylesheet overrides rules

---

## 7. Display Typography Contract

Display typography uses explicit grid-snapped line-height tokens.

Rules:
- Font-size and line-height use semantic CSS custom property tokens.
- Line-height must be snapped to the 4px metric scale.
- Multiplier-based leading is not permitted.
- No inline styles are permitted.

---

## 8. Figma Annotation Conventions

Certain visual properties in Figma are working affordances for the designer only. They convey intent or structure within the design tool but have no CSS equivalent, no YAML representation, and must never be emitted to any output.

**Component boundary outlines:**

Components in the CGDC-DS library that participate in layout compositions carry a 1px dashed border on their outermost node. This is a Figma-only visual affordance — it makes component boundaries legible while composing layouts in the design file. It is not a design property and has no rendered equivalent.

Specification: `stroke: 1px, dashed, outside, on topmost node of component`

Current components carrying this treatment:
- `richtext`
- `chapter-##`
- `chapter--page-##`

The rule is universal and forward-looking: **any 1px dashed border on the topmost node of a CGDC-DS component is a boundary annotation.** When encountered during compile or code review, ignore it entirely. Do not emit it as a border, outline, box-shadow, or any other CSS property. Do not emit it to YAML. Do not log it as a warning.

---

# Component Contracts — Shared (Both Pipelines)

---

## Richtext

Figma component: `richtext` (CGDC library)
Template: `components/richtext.njk`
Component tokens: `component/richtext/block`, `component/richtext/continuation`, `component/richtext/list-indent`

### What it is

An ordered sequence of typed prose blocks. The `richtext` Figma component is a Slot-based container — its content is composed from `paragraph`, `heading`, and `list` child component instances dropped into the Slot. This is the same component used in both pipelines:

- **Pipeline B (executor):** routed through `content-cell.njk` with `richtextParams`
- **Pipeline A (chapter/page):** invoked directly by the chapter layout template; the `richtext` Slot in Figma compiles to a `content:` array in YAML

The YAML shape and template include are identical in both cases. The only difference is the call site.

### YAML Shape

```yaml
# Single block (Pipeline B, inside a cell)
- include: "components/richtext.njk"
  params:
    kind: "p"
    text: "Four weeks into the role, I was on a plane to Grenoble, France."

# Multiple blocks (Pipeline A, chapter content array)
content:
  - kind: "p"
    text: "Four weeks into the role, I was on a plane to Grenoble, France."
  - kind: "ul"
    items:
      - "The customer had withheld their signature."
      - "They wanted to see what professional design involvement looked like."
  - kind: "h2"
    headline: "What I found"
    showSubhead: false
```

### Template Inputs (`richtextParams`)

- `kind`: `"p" | "ul" | "ol" | "h2" | "h3"` (required)
- `text`: string — required when `kind == "p"`
- `items`: array[string] — required when `kind == "ul"` or `"ol"`
- `headline`: string — required when `kind == "h2"` or `"h3"`
- `showSubhead`: boolean — for h2 only
- `subhead`: string — for h2 only when showSubhead is true

### Constraints

- `kind` MUST be provided. Missing kind MUST emit `<!-- CONTENT_ERROR: missing kind (richtext include) -->`.
- Template must not derive `kind`, transform `text`, or coerce between modes.
- `items` MUST be an array of strings for list kinds.

### Component Tokens

The lobotomized owl spacing between `.richtext` sibling elements is governed by:

| Token | Key | Value |
|---|---|---|
| Block spacing | `component/richtext/block` | `space/xxl` (32px) — between distinct block types |
| Continuation spacing | `component/richtext/continuation` | `0` — between same-type siblings |
| List indent | `component/richtext/list-indent` | `space/l` (20px) |

### DOM Shape

```html
<!-- Paragraph -->
<p class="richtext">...</p>

<!-- Unordered list -->
<ul class="richtext richtext--list">
    <li>...</li>
</ul>

<!-- Ordered list -->
<ol class="richtext richtext--list">
    <li>...</li>
</ol>
```

---

# Component Contracts — Pipeline B (Executor)

---

## Header

Include: `components/header.njk`

### Inputs (`headerParams`)

- `level`: `"h1" | "h2" | "h3"`
- `variant`: `"quiet"` (optional — reduces visual weight without changing semantic level)
- `headline`: string — rendered via `| safe`. May contain inline HTML (e.g. `<span class="nobr">...</span>`)
- `showEyebrow`: boolean
- `eyebrow`: string
- `showSubhead`: boolean
- `subhead`: string

### Rules

- No inferred flags.
- YAML must not define heading IDs.
- When `variant: "quiet"`, the heading receives `header__headline--quiet` class. Visual result matches h3 sizing at all tiers.
- Use `<span class="nobr">product name</span>` to prevent proper names breaking across lines.

### DOM Shape

```html
<header class="header">
  <p class="header__eyebrow"></p> <!-- optional -->
  <h1|h2|h3 class="header__headline [header__headline--quiet]" id=""></h1|h2|h3>
  <p class="header__subhead"></p> <!-- optional -->
</header>
```

---

## Figure

Include: `components/figure.njk`

### Inputs (`figureParams`)

- `type`: `"desktop" | "mobile" | "composite"`
- `showCaption`: boolean
- `caption`: string
- `src`: string (public path under `/assets/images/`)
- `hasAlt`: boolean
- `alt`: string

### Rules

- `src` MUST be a public URL path under `/assets/images/`.
- Eleventy Image plugin is not used in this component. Future optimized path: `components/figure-optimized.njk` (not active).
- If `hasAlt === false`, alt must be empty and image is presentational.

### DOM Shape

```html
<figure class="figure figure--{type}">
  <div class="figure__media">
    <img src="" alt="" />
  </div>
  <figcaption class="figure__caption"></figcaption> <!-- optional -->
</figure>
```

---

## Link Block

Include: `components/link-block.njk`

### Inputs (`linkBlockParams`)

- `hasSecondary`: boolean
- `primary`: `{ priority, label, URL, link }`
- `secondary`: `{ priority, label, URL, link }` (only when `hasSecondary === true`)

### DOM Shape

```html
<div class="link-block">
  <a|span class="link ..."></a|span>
  <a|span class="link ..."></a|span> <!-- optional -->
</div>
```

---

## Link

Include: `components/link.njk`

### Inputs (`linkParams`)

- `priority`: `"Primary" | "Secondary"`
- `label`: string
- `URL`: string
- `link`: string

### Rules

- If `URL` exists -> render `<a>`. If absent -> render disabled `<span>`.
- No defaults. Callers must provide explicit values.

---

# Component Contracts — Pipeline A (Chapter/Page/Mosaic)

---

## page-header

Component: `page-header` (CGDC library)
Template context: direct child of the root story frame. Rendered once per case study page.

### Figma Props -> YAML

| YAML key | Figma prop | Notes |
|---|---|---|
| `headline` | `headline#445:1` (TEXT) | Required. If missing: `TODO:headline` |
| `showEyebrow` | `showEyebrow#447:6` (BOOLEAN) | Emit as boolean |
| `showSubhead` | `showSubhead#458:2` (BOOLEAN) | Emit as boolean |
| `subhead` | `subhead#458:5` (TEXT) | Only when showSubhead is true |
| — | `stuck#3124:2` (BOOLEAN) | Visual state flag — ignore at compile, do not emit |

**Eyebrow variants** — `_page-header__eyebrow` has `type` VARIANT (`text` | `pills`):

- `type=text` -> emit `eyebrowType: "text"`, `eyebrow: "<string>"`
- `type=pills` -> emit `eyebrowType: "pills"`, `pills: ["text1", "text2", ...]` (extract `text#3183:15` from each `_pill` instance in the Slot)

### YAML Shape

```yaml
pageHeader:
  headline: "INFICON Intelligent Manufacturing Systems"
  showEyebrow: true
  eyebrowType: "pills"
  pills:
    - "UX/UI Design"
    - "Design Systems"
    - "Product Strategy"
  showSubhead: true
  subhead: "13 months as the first UX designer..."
```

---

## heading

Component: `heading` (CGDC library)
Template context: used within richtext content sequences. Not used inside mosaic tiles.

### Figma Props -> YAML

| YAML key | Figma prop | Notes |
|---|---|---|
| `level` | `level` VARIANT | `"h2"` \| `"h3"` |
| `headline` | `headline#445:3` (TEXT) | Required |
| `showSubhead` | `showSubhead#458:0` (BOOLEAN) | h3 variant ignores subhead |
| `subhead` | `subhead#458:3` (TEXT) | Only when showSubhead=true and level=h2 |

Note: `heading` has no eyebrow — eyebrow is a `page-header` concern only. No `h1` variant — h1 is exclusively `page-header`.

---

## Mosaic

Template: `src/_includes/components/mosaic.njk`
Styles: `src/assets/scss/components/_mosaic.scss`
Placements: `src/assets/scss/placements/_<pageKey>.scss`

### Purpose

Grid composition component for case study chapter pages. Renders a set of tiles from compiled YAML. Not part of the executor pipeline.

### Invocation

```njk
{% from "components/mosaic.njk" import mosaic %}
{{ mosaic(cell.mosaic) }}
```

### Responsive Model — container-query driven, small -> large

Cell size has three authored states — it never interpolates between them:

| State | Size | Notes |
|---|---|---|
| MIN | 144px | Default 2-up and 4-up narrow |
| MONEY | 176px | Primary desktop designed state |
| MAX | 208px | 2-up wide only |

Gap: `clamp(8px, 2cqi, 16px)` — fluid between states, 16px at designed states.

| Container query threshold | Layout | Cell size |
|---|---|---|
| Default (no query) | 2-up, `width: 100%` | fluid `minmax(144px, 208px)` |
| `content-cell >= 624px` | 4-up, `width: fit-content` | MIN (144px) |
| `content-cell >= 752px` | 4-up, `width: fit-content` | MONEY (176px) |

### Tile Types

| `type:` | Class | Notes |
|---|---|---|
| `frame` | `mosaic-tile--frame` | Padded (16px). Text, stats, quotes. Maps to Figma `frame` tile. |
| `bleed` | `mosaic-tile--bleed` | No padding. Media fills the tile. Maps to Figma `bleed` tile. |
| `bleed` + `artDirection: true` | `mosaic-tile--bleed` + `data-mosaic-media="art-directed"` | Art-directed `<picture>`. Portrait aspect-ratio in 2-up via scoped container query. |
| `bleed` + `scrollable: true` | Two `mosaic-tile--bleed` siblings | Wide process artifacts. `data-mosaic-media="desktop"` and `data-mosaic-media="scrollable"` drive show/hide. |
| `skeleton` | `mosaic-tile--skeleton` | P00 underlay. No content, no theme. `z-index: 0`. |

**Custom tiles:** `custom: true` is an additive boolean on any base type (`frame` or `bleed`). A companion `variant: "name"` string is required — it becomes `data-mosaic-variant` on the article. No extra CSS class is emitted. All extended behavior hangs off `[data-mosaic-variant]` selectors in the placements file.

**Figma mapping:** `frame` = Figma `frame` tile (padded). `bleed` = Figma `bleed` tile (no padding). `custom` = Figma `custom` BOOLEAN prop — additive on either base type.

### Named Themes

| Theme | Background | Text | Border |
|---|---|---|---|
| `primary-dark` | primary/60 | primary/10 | primary/80 |
| `primary-light` | primary/20 | primary/60 | primary/30 |
| `secondary-dark` | secondary/50 | secondary/80 | secondary/60 |
| `secondary-light` | secondary/20 | secondary/70 | secondary/30 |
| `default` | neutral/10 | primary/60 | neutral/60 |

### Inline Typography Spans

| Class | Font | Size (clamp) | Alignment |
|---|---|---|---|
| `mosaic-stat` | Playfair Display Bold | `50px -> 72px` (`36cqi`) | center (axiomatic) |
| `mosaic-lead` | Raleway Regular | `19px -> 24px` (`13.2cqi`) | center (axiomatic) |
| `mosaic-lead-italic` | Raleway Italic | `19px -> 24px` (`13.2cqi`) | center (axiomatic) |
| `mosaic-body` | PT Sans Regular | `13px -> 16px` (`9.2cqi`) | left (default) |
| `mosaic-body-bold` | PT Sans Bold | `13px -> 16px` (`9.2cqi`) | left (default) |

Axiomatic centering: any tile containing `mosaic-lead`, `mosaic-lead-italic`, or `mosaic-stat` receives `text-align: center` via `:has()`. Body-only tiles remain left-aligned.

### DOM Shape

```html
<div class="mosaic" id="mosaic--{data.id}">

  <!-- frame tile -->
  <article class="mosaic-tile mosaic-tile--frame mosaic-tile--theme-primary-dark"
           data-mosaic-tile="article-01">
    <div class="mosaic-tile__inner">
      <span class="mosaic-stat">1</span>
      <span class="mosaic-body">Week on-site at the pilot FAB</span>
    </div>
  </article>

  <!-- bleed tile -->
  <article class="mosaic-tile mosaic-tile--bleed"
           data-mosaic-tile="article-02">
    <div class="mosaic-tile__inner"><!-- media.njk --></div>
  </article>

  <!-- bleed tile, art-directed -->
  <article class="mosaic-tile mosaic-tile--bleed"
           data-mosaic-tile="article-03"
           data-mosaic-media="art-directed">
    <div class="mosaic-tile__inner"><!-- picture with source elements --></div>
  </article>

  <!-- skeleton tile (P00 only) -->
  <article class="mosaic-tile mosaic-tile--skeleton"
           data-mosaic-tile="article-03"
           aria-hidden="true"></article>

  <!-- custom tile: base type (frame) + custom: true + variant name as data attribute -->
  <article class="mosaic-tile mosaic-tile--frame mosaic-tile--theme-primary-dark"
           data-mosaic-tile="article-04"
           data-mosaic-variant="selfie">
    <div class="mosaic-tile__inner">
      <span class="mosaic-lead-italic">TODO:quote</span>
    </div>
  </article>

</div>
```

`data-mosaic-tile` is the CSS placement hook — used in placements SCSS as `[data-mosaic-tile="article-NN"]`.
`data-mosaic-variant` is emitted only when `tile.variant` is set.

### Placement

All placement in `placements/_<pageKey>.scss`. Nothing inline.

Real tiles: `#mosaic--<id>` carries `grid-template-areas`; `[data-mosaic-tile="article-NN"]` gets `grid-area: aNN`.
Skeleton tiles: `#mosaic--<id>` carries `grid-template-columns/rows`; tiles get `grid-column`/`grid-row`.
`desktop.col` / `desktop.row` in YAML are reference only.
`z-index`: base `.mosaic-tile` has `z-index: 1`; skeleton tiles have `z-index: 0`. Additional per-tile z-index from Figma layer order in placements SCSS only.

### Choreography States

`.mosaic--pending` — hidden, skeleton underlay shows through. JS-driven.
`.mosaic--visible` — revealed, triggers `mosaic-reveal` animation.

### Custom Tile Contract

A `custom` tile is a `frame` or `bleed` tile with `custom=true` set in Figma and a non-empty `variant` string. The `variant` prop is only available in Figma when `custom=true`. The variant name is the semantic identifier for the tile's extended behavior.

**Figma component props:**

| Prop | Type | Notes |
|---|---|---|
| `type` | VARIANT | `frame` or `bleed` — base tile type |
| `custom` | BOOLEAN | Must be `true` to expose the `variant` prop |
| `variant` | TEXT | Only exposed when `custom=true`. Becomes `data-mosaic-variant` in HTML. |

**Two-selector convention — these are separate concerns and must not be conflated:**

| Hook | Selector | Purpose |
|---|---|---|
| Positional | `[data-mosaic-tile="article-NN"]` | Grid-area placement only. Authored by the compiler from tile position. |
| Semantic | `[data-mosaic-variant="<variant>"]` | All extended behavior: overflow overrides, `::before` pseudo-elements, JS state classes (`.is-exiting`, etc.). Authored by the designer via the Figma variant prop. |

These two selectors serve different concerns. Never use `[data-mosaic-tile]` for extended behavior, and never use `[data-mosaic-variant]` for grid placement.

**Example — selfie tile:**
```scss
/* Placement — positional hook, authored by compiler */
#mosaic--inficon--im--s01-c01-p03 .mosaic-tile[data-mosaic-tile="article-01"] { grid-area: a01; }

/* Extended behavior — semantic hook, authored by designer */
#mosaic--inficon--im--s01-c01-p03 .mosaic-tile[data-mosaic-variant="selfie"] { overflow: visible; }
#mosaic--inficon--im--s01-c01-p03 .mosaic-tile[data-mosaic-variant="selfie"]::before { ... }
#mosaic--inficon--im--s01-c01-p03 .mosaic-tile[data-mosaic-variant="selfie"].is-exiting::before { ... }
```

When a `custom` tile is encountered during compile, append to the report:

```
CUSTOM TILE SCAFFOLD — variant: <variant>
  SCSS: add ruleset for [data-mosaic-variant="<variant>"] in placements/_<pageKey>.scss
  JS:   add behavior keyed to document.querySelector('[data-mosaic-variant="<variant>"]')
  Note: <describe intended behavior from Figma>
```

Do not attempt to author the extended CSS or JS — output the scaffold block and move on.

### YAML Shape

```yaml
mosaic:
  id: inficon-ims--chapter-01--p01
  cols: 4
  rows: 4
  tiles:
    - id: article-01
      type: frame
      theme: primary-dark
      desktop:
        col: "1 / 2"
        row: "1 / 3"
      content: |
        <span class="mosaic-stat">1</span>
        <span class="mosaic-body">Week on-site at the pilot FAB in France</span>

    - id: article-02
      type: bleed
      desktop:
        col: "2 / 5"
        row: "1 / 3"
      media:
        src: "TODO:src"
        hasAlt: true
        alt: "TODO:alt"

    - id: article-03
      type: frame
      custom: true
      variant: "selfie"
      theme: primary-dark
      desktop:
        col: "1 / 2"
        row: "3 / 5"
      content: |
        <span class="mosaic-lead-italic">TODO:quote</span>
```

### Rules

- Template renders exactly what YAML defines. No implicit defaults.
- `theme:` is optional. Omitting produces transparent, borderless tile.
- The Mosaic is NOT permitted in the executor safelist.
- Structural changes require a CONTRACT.md update.
- Arrow indicators (`_mosaic-article__frame Arrow` prop) are deferred. Do not scaffold.

---

## Debug Method

When a mismatch occurs:
1. Confirm YAML structure.
2. Confirm template receives correct data.
3. Confirm component renders expected markup.
4. Confirm CSS selector matches rendered markup.
5. Confirm CSS file is loaded.

Each fix must address exactly one failure and be committed independently.

## Review Gate

No branch merges to `main` without a Claude Code review pass.
See `_docs/WORKFLOW.md` for the two-phase workflow and PR summary template.
