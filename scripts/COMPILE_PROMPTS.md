# PROMPT C — FULL PAGE COMPILE (Figma -> Eleventy page data + placements + report)

## ROLE

You are a deterministic compiler. You MUST NOT invent copy, labels, alt text, captions, or URLs. Only use raw Figma text. When missing, emit explicit TODO tokens.

## CANONICAL TERMINOLOGY

Use these names exactly. Do not use synonyms.

| Canonical name | What it is |
|---|---|
| **Field and Frame Grid** (abbrev: **FF Grid**) | The full 5-IU macro page grid. Active at >= 1248px viewport. |
| **2-col Grid** | The simplified two-column layout grid. Active at 640px-1247px. |
| **Mosaic** | The CSS Grid inside a `.mosaic` component instance. Tiles are `<article>` elements. |
| **Chapter** | A narrative unit. Instance of `chapter-##`. Contains a skeleton (P00), one or more pages (P01-PN), and a `richtext` field text block. |
| **Page** | A scroll-stack unit within a chapter. Instance of `chapter--page-##`. Contains a mosaic grid. |
| **Richtext** | The editorial text block above a chapter's mosaic. Instance of `richtext`. Contains a `paragraph` instance in its Slot. |

## INPUTS

**Mode A (preferred):** Figma MCP — direct node access
- pageKey: `<PAGE_KEY>` (kebab-case slug; matches root frame name)
- figmaFileKey: `<FILE_KEY>` (extracted from Figma URL)
- rootNodeId: `<NODE_ID>` (the compilation target frame)

#### Mode A Execution Sequence

**CRITICAL:** Do not attempt to read the entire Figma file at once. Do not write parsing scripts. Do not fetch or consume JSON exports. Do not run `npm run figma:fetch` or any variant of it. Do not fall back to Mode B or Mode C unless the user explicitly asks for it. Work incrementally through MCP calls, writing output as you go.

**Phase 1 — Scaffold (one-time setup)**

1. Call `get_metadata` on `rootNodeId` to get the full chapter/page/mosaic tree.
   This returns node IDs, names, positions (x, y, width, height), and hierarchy.
   From this single call, you have:
   - All chapter names and IDs
   - All page names and IDs within each chapter
   - The skeleton (P00) mosaic per chapter
   - The `richtext` field text instance per chapter
   - All mosaic tile instances and their bounding boxes within each page
   Save this tree as your working manifest. Sort per §E.

2. Initialize the output files:
   - Begin writing the YAML file header (`pageKey`, `meta`, `chapters:`)
   - Begin the placements SCSS file
   - Begin the extract report

**Phase 2 — Compile chapter by chapter**

For each chapter (in order):

3. Open the chapter in YAML (`- chapterKey: "chapter-NN"`).

4. Extract the `richtext` field text:
   - Find the `richtext` instance in the chapter's wrapper Slot.
   - Find the `paragraph` instance in the `richtext` Slot.
   - Extract `Text#466:0` from the paragraph's componentProperties.
   - Emit as `fieldText:` in YAML.

5. Emit the skeleton (P00) mosaic placements block to the SCSS file (see §G).

6. For each page in the chapter (in order, P01-PN):
   Open the page in YAML (`- pageKey: "page-NN"`).
   Compile the mosaic per §G.
   Close the page.

7. Close the chapter.
   **Confirm with the user before proceeding to the next chapter.**

**Phase 3 — Finalize**

8. Write/update the thin Eleventy page scaffold.
9. Complete the extract report with counts, TODOs, and warnings.
10. Present all output files.

#### Mode A Constraints

- **One `get_design_context` call per mosaic frame.** Do not batch. Do not call on chapters or pages.
- **Do not write scripts** to parse, transform, or fetch Figma data. The MCP calls are the parser.
- **Write output incrementally.** Do not accumulate the entire page in memory before writing.
- **If a `get_design_context` call returns unexpected data,** log it in the extract report and move on. Do not retry repeatedly or attempt workarounds.
- **Stop and ask the user** if: a tile has no recognizable children, a coordinate doesn't snap to any grid line, or any other ambiguity arises.

**Mode B (deprecated — do not use unless explicitly instructed by the user)**
Local JSON already fetched. Only use if the user says "use the local JSON."
- pageKey: `<PAGE_KEY>`
- figmaJsonPath: `src/_figma-json/<PAGE_KEY>.json`

**Mode C (deprecated — do not use unless explicitly instructed by the user)**
Pasted Figma FRAME URL with JSON fetch script. Only use if the user says "fetch the JSON."
- figmaFrameUrl: `<PASTE_CMD_L_FRAME_URL>`
- pageKey: `<PAGE_KEY>`
- If figmaFrameUrl is provided, run:
  `npm run figma:fetch -- "<figmaFrameUrl>" <pageKey>`
  Then read: `src/_figma-json/<pageKey>.json`

**DO NOT run `npm run figma:fetch` or any JSON fetch/parse scripts unless the user explicitly requests Mode B or Mode C. If Figma MCP is connected, always use Mode A.**

## OUTPUTS (MUST WRITE ALL)

1. **Data YAML** (per page):
   `src/_data/pages/<pageKey>/page.yml`

2. **Placements SCSS** (per page):
   `src/assets/scss/placements/_<pageKey>.scss`

3. **Extract report** (per page):
   `_docs/extract/<pageKey>.md`

4. **Thin Eleventy page scaffold** (create if missing; update minimally if exists):
   `src/<pageKey>/index.njk`

---

## PROJECT CONTRACTS (NON-NEGOTIABLE)

### Figma Annotation Conventions — ALWAYS IGNORE THESE

Certain visual properties in Figma are working affordances for the designer only.
They have no CSS equivalent, no YAML representation, and must never be emitted to
any output. If encountered during compile, discard silently — do not log as a
warning, do not attempt to map to a token or class.

**Component boundary outlines:**
Components in the CGDC-DS library that participate in layout compositions carry a
1px dashed border on their outermost node. This is a Figma-only visual affordance
to make component boundaries legible while composing layouts in the design file.

Properties: `stroke: 1px, dashed, outside, on topmost node of component`

Current components carrying this treatment:
- `richtext`
- `chapter-##`
- `chapter--page-##`

More components may carry this in future. The rule is universal: **any 1px dashed
border on the topmost node of a CGDC-DS component is a boundary annotation and
must be ignored entirely.** Do not emit it as a border, outline, box-shadow, or
any other CSS property. Do not emit it to YAML.

---

### A) No Invented Copy

All string content must come from raw Figma text in JSON.
If missing, output TODO tokens (e.g. `TODO:headline`, `TODO:body`, `TODO:src`, `TODO:alt`).

### B) Node Tree Navigation

**Case study pages use the chapter/page hierarchy. This is the active pipeline.**

```
<pageKey> [FRAME]                          <- root compile target
  navbar [INSTANCE]                        <- structural, skip
  page-header [INSTANCE]                   <- h1 + eyebrow + subhead (compile separately - see §H)
  chapter-01 [INSTANCE of chapter-##]
    wrapper [SLOT]
      mosaic--skeleton [INSTANCE]          <- P00 skeleton (compile per §G)
      page-01 [INSTANCE of chapter--page-##]
        wrapper [SLOT]
          mosaic-grid [FRAME]              <- contains article-NN tiles (compile per §G)
      page-02 [INSTANCE of chapter--page-##]
        wrapper [SLOT]
          mosaic-grid [FRAME]
      richtext [INSTANCE]                  <- field text block (compile per §H)
        content [SLOT]
          paragraph [INSTANCE]            <- Text#466:0 = field text string
  chapter-02 [INSTANCE of chapter-##]
    wrapper [SLOT]
      ...
```

**Structural components — skip, do not compile:**
- `navbar` — rendered by the layout template, not YAML-authored
- `mosaic--skeleton` — compile its tiles to SCSS placements only; no YAML content
- `chapter-##`, `chapter--page-##` — scaffolding wrappers; no content props to extract

**Content-bearing components — compile:**
- `page-header` — h1 headline, eyebrow (text or pills), subhead
- `richtext` — field text (paragraph instance in Slot)
- `mosaic-grid` children (`article-NN` tiles) — mosaic content

**Legacy hierarchy (content-cell pipeline) — DO NOT USE for case study pages:**
The old `section-NN -> page-NN -> content-cell-NN` hierarchy and `components/header.njk`,
`components/richtext.njk` etc. are the executor pipeline for non-mosaic pages. Case study
pages use the chapter/page/mosaic hierarchy documented here. Do not mix the two.

### C) Wrapper ID Convention

Mosaic tiles do not use the wrapper ID convention — they use `data-mosaic-tile` attributes.
The wrapper ID convention (`content--`, `header--`, `figure--`) applies only to
executor pipeline content-cells. It is NOT used in the chapter/page/mosaic pipeline.

### D) Grid Placement Contract

Content-cell grid positions are **inferred at compile time** from the grid-tracks sibling and content-cell bounding boxes. The grid-tracks instance is not a parent container — it is a sibling of the content-cells within each page, carrying the CSS Grid definition as a lookup table.

#### Step 1: Build the Grid Line Lookup Table

The FF Grid geometry is standardized across all pages — build the lookup table once and reuse it.

**Columns:** 5 full IUs x 384px + 4 gutters x 24px = 2016px Field. Frame = IU2-IU4 (408px -> 1608px).

| Column Line | px position | Named line |
|-------------|-------------|------------|
| 1 | 0 | field-start / iu1-start |
| 2 | 384 | iu1-end |
| 3 | 408 | iu2-start / frame-start |
| 4 | 792 | iu2-end |
| 5 | 816 | iu3-start |
| 6 | 1200 | iu3-end |
| 7 | 1224 | iu4-start |
| 8 | 1608 | iu4-end / frame-end |
| 9 | 1632 | iu5-start |
| 10 | 2016 | iu5-end / field-end |

**Rows:** 3 Wide (240px) + 1 Split (390px) + 3 gutters (24px) = 1182px. Frame = 750px tall centered (frameTop=216, frameBottom=966).

| Row Line | px position | Named line |
|----------|-------------|------------|
| 1 | 0 | iu1-start |
| 2 | 216 | frameTop |
| 3 | 240 | iu1-wideEnd |
| 4 | 264 | iu2-wideStart |
| 5 | 390 | iu1-splitEnd |
| 6 | 414 | iu2-splitStart |
| 7 | 504 | iu2-wideEnd |
| 8 | 528 | iu3-wideStart |
| 9 | 654 | iu2-splitEnd |
| 10 | 678 | iu3-splitStart |
| 11 | 768 | iu3-wideEnd |
| 12 | 792 | iu4-wideStart |
| 13 | 918 | iu3-splitEnd |
| 14 | 942 | iu4-splitStart |
| 15 | 966 | frameBottom |
| 16 | 1182 | iu4-end |

#### Step 2: Note the Grid-Tracks Y Offset

The grid Slot starts at y=0 within each page frame. Content-cell coordinates are already relative to the page frame — no y offset adjustment needed.

**Grid-relative y** = content-cell y (no adjustment required)

#### Step 3: Map Content-Cell Coordinates to Grid Lines

For each content-cell on a page, read its `x`, `y`, `width`, and `height` from the Figma node.

Compute:
- **column-start:** Match `x` to the nearest column line position
- **column-end:** Match `x + width` to the nearest column line position
- **row-start:** Match `grid-relative y` to the nearest row line position
- **row-end:** Match `grid-relative y + height` to the nearest row line position

#### Step 4: Apply Snap Tolerance

Figma's grid-snapping uses 1px rectangle tracks, so content-cell coordinates may be off by 1-2 pixels. Apply a **+-2px tolerance** when matching coordinates to grid line positions.

If a coordinate does not match any grid line within tolerance, log a warning in the extract report with the cell name, coordinate, and nearest grid line.

#### Step 5: Emit CSS Grid Placement

For each content-cell, emit:
```
grid-column: [column-start-line] / [column-end-line];
grid-row: [row-start-line] / [row-end-line];
```

**COMMON ERROR:** Do not confuse column span count with column end line. The end value in `grid-column: start / end` is a **line number**, not a span. Always compute the end line from `x + width` matched to the lookup table.

Numeric grid placement only. DO NOT use absolute positioning, transforms, negative margins, top/left, etc.
Emit placements SCSS only (no inline styles).

### E) Ordering Contract

- Sort chapters by numeric suffix (`chapter-01`, `chapter-02`...).
- Sort pages by numeric suffix within each chapter (`page-01`, `page-02`...).
- Sort mosaic tiles within a page by visual position using bounding box:
  - Primary: y (top)
  - Secondary: x (left)
- For ties, use node id ascending as stable fallback and report ties.
- Within a tile, preserve Figma children order (do not re-sort).

### F) Layout Contract

Global centering/clipping is already handled by `layout__story` + layout wrappers.
Do not change global layout in this compile step. Only generate placements + data.

---

### G) Mosaic Compile Rules

Mosaic frames are identified by their direct children being named `article-NN` (e.g. `article-01`, `article-02`). When the compiler encounters a `mosaic-grid` frame whose children follow this naming pattern, apply the Mosaic compile rules below.

**Key vocabulary:** YAML key `tiles:` maps to HTML `<article>` elements — intentional split. The semantic HTML element is `<article>`; the YAML array key is `tiles:`.

#### Mosaic Component Anatomy

Each `article-NN` tile is a `mosaic-article` instance with these props:

| Figma prop | Key | Type | Notes |
|-----------|-----|------|-------|
| `type` | VARIANT | `skeleton` \| `bleed` \| `frame` | `frame` = content tile (padded), `bleed` = image tile (no padding), `skeleton` = P00 underlay |
| `custom#3129:0` | BOOLEAN | -- | True = custom/variant tile |
| `variant#3129:4` | TEXT | -- | Variant name for custom tiles |
| `Slot#2914:54` | SLOT | -- | Content slot (present on `frame` and `bleed` types) |

The `_mosaic-article__frame` sub-component carries:
- `Arrow` VARIANT: `Up` \| `Down` \| `Left` \| `Right` \| `None`
  - **Arrow indicators are deferred.** Always emit `Arrow=None`. Do not scaffold arrow behavior.

The `_mosaic-article__theme` sub-component carries:
- `theme` VARIANT: `primary-dark` \| `primary-light` \| `secondary-dark` \| `secondary-light` \| `default`
- `points-to#2918:55` TEXT: the `#ID` of the target `<article>` element this arrow points at
  - **Arrow targets are deferred.** Do not emit `points-to` to YAML.

**Type -> YAML tile type mapping:**

| Figma `type` | `custom` | YAML `type` |
|---|---|---|
| `frame` | false | `frame` |
| `bleed` | false | `bleed` |
| `frame` | true | `frame` + `custom: true` + `variant: "name"` |
| `bleed` | true | `bleed` + `custom: true` + `variant: "name"` |
| `skeleton` | -- | `skeleton` (P00 only) |

#### Tile Content Extraction

**`type=frame` (content tile):** Content lives in the `Slot`. The Slot may contain:
- Text nodes with inline spans — emit as `content: |` HTML block (see Span Vocabulary below)
- Mixed HTML — emit verbatim via `| safe`

**Span Vocabulary (frame tiles):** Each Figma text layer in the `_mosaic-tile__richtext` content slot maps to a `<span>` using this table. Use Figma style name as the key — do not infer from font properties alone.

| Figma style name | Span class |
|---|---|
| `Mosaic/Stat` | `mosaic-stat` |
| `Mosaic/Stat Label` | `mosaic-stat-label` |
| `Mosaic/Lead` | `mosaic-lead` |
| `Mosaic/Lead Italic` | `mosaic-lead-italic` |
| `Mosaic/Body` | `mosaic-body` |
| `Mosaic/Body Bold` | `mosaic-body-bold` |
| `Mosaic/Body Italic` | `mosaic-body-italic` |

Rules:
- Multiple spans stack as direct children inside the `content: |` block — no wrapper element.
- `color: inherit` always — never set color on span classes.
- `itemSpacing: 0` in Figma means line-height does all spacing. No CSS gap or margin between spans.
- Use `mosaic-stat-label` instead of `mosaic-stat` when the numeral + unit is too wide for the tile at display size (e.g. "100 PERCENT", "$6 MILLION").
- List tiles are not yet designed. Do not pre-build compile rules for content that doesn't exist.

**`type=bleed` (image tile):** No Slot content. Emit `media:` block with `src: "TODO:src"`, `hasAlt`, `alt`.

**`type=frame` + `custom=true` (custom tile):** Read `variant` TEXT prop. Emit `type: frame`, `custom: true`, `variant: "<value>"`. Append custom tile scaffold block to report.

**`type=skeleton`:** No content. Emit SCSS placements only -- no YAML entry.

#### Tile Naming and HTML

Each tile emits:
```html
<article class="mosaic-tile mosaic-tile--{type} [mosaic-tile--theme-{theme}]"
         data-mosaic-tile="article-NN">
```

For custom tiles (`custom: true` on a `frame` or `bleed` base):
```html
<article class="mosaic-tile mosaic-tile--{base-type} [mosaic-tile--theme-{theme}]"
         data-mosaic-tile="article-NN"
         data-mosaic-variant="{variant}">
```

#### Z-Index from Figma Layer Order

**Rule:** For each `article-NN` sibling, read its index position in the Figma node tree (0-based). Emit `z-index` equal to that index + 1. Emit in the placements SCSS only — never as a YAML field or inline style.

#### Mosaic Placement

Use the same §D grid inference logic (grid-tracks sibling, bounding box matching, +-2px tolerance). The grid-tracks instance for a Mosaic frame uses uniform square tracks with a common gutter — simpler than the FF Grid but the same algorithm applies.

All placement output goes to `src/assets/scss/placements/_<pageKey>.scss`. Structure:

```scss
/* --- mosaic--<id> — tile area map (default 2-up, no query) --- */

#mosaic--<id> {
    grid-template-areas:
        "a01 a04"
        ...;
}

/* --- mosaic--<id> — 4-up area map (content-cell >= 752px) --- */

@container content-cell (min-width: 752px) {
    #mosaic--<id> {
        grid-template-columns: repeat(4, var(--mosaic-cell-size));
        grid-template-rows:    repeat(4, var(--mosaic-cell-size));
        grid-template-areas:
            "a01 a02 a02 a03"
            ...;
    }
}

/* --- tile areas --- */

.mosaic-tile[data-mosaic-tile="article-01"] { grid-area: a01; z-index: 12; }
.mosaic-tile[data-mosaic-tile="article-02"] { grid-area: a02; z-index: 11; }
```

#### Skeleton P00 Block (required per chapter)

Every chapter has a P00 `mosaic--skeleton` instance. Its tiles must emit SCSS placements only — no YAML. Skeleton tiles use `grid-column`/`grid-row` directly (no named areas):

```scss
// Chapter NN P00 — mosaic--<chapterKey>--p00
// Skeleton underlay — always visible at z-index 0, never animated.
// <cols> cols x <rows> rows. Marks composite mosaic area for Chapter N (P01-PN).

#mosaic--<id>--p00 {
    grid-template-columns: repeat(<cols>, var(--mosaic-cell-size));
    grid-template-rows:    repeat(<rows>, var(--mosaic-cell-size));
}

#mosaic--<id>--p00 .mosaic-tile[data-mosaic-tile="article-01"] { grid-column: 2 / 3; grid-row: 1 / 2; }
#mosaic--<id>--p00 .mosaic-tile[data-mosaic-tile="article-02"] { grid-column: 3 / 4; grid-row: 1 / 2; }
```

Place the P00 block immediately before the P01 block for its chapter.

#### Mosaic YAML Shape

```yaml
mosaic:
  id: inficon--chapter-01--p01
  cols: 4
  rows: 4
  tiles:
    - id: article-01
      type: frame
      theme: primary-dark
      desktop:
        col: "1 / 2"
        row: "1 / 2"
      content: |
        <span class="mosaic-stat">1</span>
        <span class="mosaic-body">Week on-site at the pilot FAB in France</span>

    - id: article-06
      type: bleed
      desktop:
        col: "3 / 5"
        row: "2 / 4"
      media:
        src: "TODO:src"
        hasAlt: true
        alt: "TODO:alt"

    - id: article-07
      type: frame
      custom: true
      variant: "selfie"
      theme: primary-dark
      desktop:
        col: "1 / 3"
        row: "4 / 5"
      content: |
        <span class="mosaic-lead-italic">TODO:quote</span>
```

**Custom tile scaffolding rule:** When a `custom` tile is encountered, append to the compile report:

```
CUSTOM TILE SCAFFOLD — variant: <variant>
  SCSS: add ruleset for [data-mosaic-variant="<variant>"] in placements/_<pageKey>.scss
  JS:   add behavior keyed to document.querySelector('[data-mosaic-variant="<variant>"]')
  Note: <describe the intended visual/interactive behavior from Figma>
```

Do not attempt to author the extended CSS or JS — output the scaffold block and move on.

---

### H) Chapter/Page Hierarchy — Compile Rules

#### `page-header` (h1 block at the top of the case study page)

Source: `page-header` instance, direct child of the root `<pageKey>` frame.

The `stuck` BOOLEAN prop is a visual state flag — **ignore at compile, do not emit to YAML.**

| YAML param | Figma property | Notes |
|------------|---------------|-------|
| `headline` | `headline#445:1` (TEXT) | Required. If missing: `"TODO:headline"` |
| `showEyebrow` | `showEyebrow#447:6` (BOOLEAN) | Emit as boolean |
| `showSubhead` | `showSubhead#458:2` (BOOLEAN) | Emit as boolean |
| `subhead` | `subhead#458:5` (TEXT) | Only when showSubhead is true |

**Eyebrow extraction — two variants:**

The eyebrow is a `_page-header__eyebrow` instance with `type` VARIANT (`text` | `pills`):

- `type=text`: Read `eyebrow#3183:9` TEXT prop. Emit as `eyebrow: "<string>"`.
- `type=pills`: Read each `_pill` instance in the Slot. Extract `text#3183:15` from each. Emit as `pills: ["text1", "text2", ...]`.

**YAML shape:**

```yaml
pageHeader:
  headline: "INFICON Intelligent Manufacturing Systems"
  showEyebrow: true
  eyebrowType: "pills"         # "text" | "pills"
  pills:                       # only when eyebrowType=pills
    - "UX/UI Design"
    - "Design Systems"
    - "Product Strategy"
  # eyebrow: "..."             # only when eyebrowType=text
  showSubhead: true
  subhead: "13 months as the first UX designer in the IMS Group..."
```

#### `richtext` (left-column content for each chapter)

Source: `richtext` instance inside the chapter's `wrapper` Slot.

The `richtext` Slot may contain one or more child instances (`paragraph`, `heading`, `unordered-list`, `ordered-list`). Compile each child as a block object and emit the array as `content:` on the chapter. Uses the same shape as Pipeline B richtext — one `{ kind, text/headline/items }` object per block.

**YAML shape:**

```yaml
- chapterKey: "chapter-01"
  chapterOffset: 0
  content:
    - kind: "p"
      text: "Four weeks into the role, I was on a plane to Grenoble, France. The customer had withheld their signature. They wanted to see what professional design involvement actually looked like."
  pages:
    - pageKey: "page-01"
      mosaic:
        ...
```

#### `richtext` child components (paragraph, unordered-list, ordered-list, heading)

The `richtext` container holds child component instances dropped into its Slot.
These are the building blocks of long-form text. All render via `richtext.njk`.

| Figma component | Node ID | YAML `kind` | HTML output |
|---|---|---|---|
| `paragraph` | 2781:453 | `"p"` | `<p class="richtext">` |
| `unordered-list` | 2781:455 | `"ul"` | `<ul class="richtext richtext--ul">` |
| `ordered-list` | 3277:2226 | `"ol"` | `<ol class="richtext richtext--ol">` |
| `heading` level=h2 | 2466:1306 | `"h2"` | `<div class="richtext richtext--h2"><h2>` |
| `heading` level=h3 | 2780:439 | `"h3"` | `<div class="richtext richtext--h3"><h3>` |

Typography tokens (all from CGDC-DS variables — do not hardcode values):
- `paragraph` / `unordered-list` / `ordered-list`: `type/paragraph/*`, `color/body`
- `heading h2` headline: `type/sectionHeading/*`, `color/heading`
- `heading h2` subhead (p): `type/subheading/*`, `color/heading` (non-semantic)
- `heading h3`: `type/subheading/*`, `color/heading`

#### `heading` YAML shape

```yaml
- kind: "h2"
  headline: "Section headline"
  showSubhead: true
  subhead: "Non-semantic subhead text"

- kind: "h3"
  headline: "Sub-section headline"
```

#### Full page YAML shape (chapter/page/mosaic pipeline)

```yaml
pageKey: "inficon-ims"
mode: "choreographed"

pageHeader:
  headline: "INFICON Intelligent Manufacturing Systems"
  showEyebrow: true
  eyebrowType: "pills"
  pills:
    - "UX/UI Design"
    - "Design Systems"
    - "Product Strategy"
  showSubhead: true
  subhead: "13 months as the first UX designer in the IMS Group building the next generation of software for semiconductor fabrication."

chapters:
  - chapterKey: "chapter-01"
    chapterOffset: 0
    skeleton:
      - ".  s  s  s"
      - "s  s  s  s"
    content:
      - kind: "p"
        text: "Four weeks into the role, I was on a plane to Grenoble, France..."
    pages:
      - pageKey: "page-00"
        mosaic:
          id: "inficon-ims--chapter-01--p00"
          cols: 4
          rows: 2
          tiles:
            - id: article-01
              type: skeleton
              desktop:
                col: "2 / 3"
                row: "1 / 2"
            ...

      - pageKey: "page-01"
        mosaic:
          id: "inficon-ims--chapter-01--p01"
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
            ...

  - chapterKey: "chapter-02"
    chapterOffset: 1
    skeleton:
      - ".  .  s  s"
      - "s  s  s  s"
    content:
      - kind: "p"
        text: "The FAB was the brief. Before designing anything..."
    pages:
      - pageKey: "page-00"
        mosaic:
          ...
```

---

## THIN PAGE SCAFFOLD

File: `src/<pageKey>/index.njk`

Create folder if missing. If file exists, only update front matter fields if missing.
Content must remain empty — rendering happens via `layouts/compiled-page.njk`.

The `title` field is derived from `pageHeader.headline` found during compilation.

```njk
---
layout: layouts/base.njk
title: "<pageHeader.headline from Figma>"
permalink: "/portfolio/<pageKey>/"
pageKey: "<pageKey>"
mainClass: "layout--case-study"
---

<main class="layout {{ mainClass }}">
  {% include "layouts/compiled-page.njk" %}
</main>
```

If no headline is found, use `"TODO:title"`.

---

## REPORT OUTPUT

File: `_docs/extract/<pageKey>.md`

Must include:

**Summary header** with pageKey and timestamp.

**Counts:**
- Chapters found
- Pages found (total across all chapters)
- Tiles found (total across all pages)
- Tiles emitted by type (frame / bleed / custom / skeleton)
- Field text blocks found

**TODO counts:**
- `TODO:headline`
- `TODO:body`
- `TODO:src`
- `TODO:alt`
- `TODO:title`
- Any other `TODO:*` encountered

**Warnings:**
- Unrecognized tile types or child names
- Figma placeholder text detected and replaced with TODO
- Bounding box tie-breaks applied
- Any nodes skipped and why
- Custom tile scaffold blocks emitted (list variant names)

**Tile Manifest:**
- Chapter -> Page -> tile id, type, theme

---

## IMPLEMENTATION NOTES

- Do not refactor unrelated files.
- Do not change global layouts or component templates.
- Only touch the four outputs listed.
- Use deterministic formatting: stable key ordering in YAML, stable sorting rules.
- Arrow indicators (`_mosaic-article__frame Arrow` prop, `_mosaic-article__theme points-to` prop) are deferred. Always treat as `Arrow=None`. Do not scaffold.

---

## NOW DO THIS

Given:
- pageKey: `<PAGE_KEY>`
- figmaFileKey: `<FILE_KEY>`
- rootNodeId: `<NODE_ID>`

Perform the compile and write the outputs exactly as specified.
