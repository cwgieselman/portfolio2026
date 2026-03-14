# PROMPT C — FULL PAGE COMPILE (Figma → Eleventy page data + placements + report)

## ROLE

You are a deterministic compiler. You MUST NOT invent copy, labels, alt text, captions, or URLs. Only use raw Figma text. When missing, emit explicit TODO tokens.

## INPUTS

**Mode A (preferred):** Figma MCP — direct node access
- pageKey: `<PAGE_KEY>` (kebab-case slug; matches root frame name)
- figmaFileKey: `<FILE_KEY>` (extracted from Figma URL)
- rootNodeId: `<NODE_ID>` (the compilation target frame)

#### Mode A Execution Sequence

**CRITICAL:** Do not attempt to read the entire Figma file at once. Do not write parsing scripts. Do not fetch or consume JSON exports. Do not run `npm run figma:fetch` or any variant of it. Do not fall back to Mode B or Mode C unless the user explicitly asks for it. Work incrementally through MCP calls, writing output as you go.

**Phase 1 — Scaffold (one-time setup)**

1. Call `get_metadata` on `rootNodeId` to get the full section/page/content-cell tree.
   This returns node IDs, names, positions (x, y, width, height), and hierarchy.
   From this single call, you have:
   - All section names and IDs
   - All page names and IDs within each section
   - All content-cell names, IDs, and bounding boxes within each page
   - The grid-tracks sibling instance ID on each page
   Save this tree as your working manifest. Sort per §E.

2. Call `get_design_context` (with `excludeScreenshot: true`) on **one** `grid-tracks` instance.
   Extract the `grid-template-columns` and `grid-template-rows` values.
   Build the grid line lookup table per §D. This is reused for all pages.

3. Initialize the output files:
   - Begin writing the YAML file header (`pageKey`, `meta`, `sections:`)
   - Begin the placements SCSS file
   - Begin the extract report

**Phase 2 — Compile section by section**

For each section (in order):

4. Open the section in YAML (`- sectionKey: "section-NN"`).
   Set `mode: "composite"` if the section has >1 page, else `"normal"`.

5. For each page in the section (in order):
   Open the page in YAML (`- pageKey: "page-NN"`).

6. For each content-cell on the page (sorted per §E):
   - You already have x, y, width, height from the Phase 1 metadata call.
   - Compute grid placement per §D and write to the placements SCSS.
   - Call `get_design_context` (with `excludeScreenshot: true`) on this content-cell's node ID.
   - Extract the payload: identify includes, extract params per §PARAM EXTRACTION RULES.
   - Write the cell's YAML entry (wrapper ID, includes, params).
   - Log the cell in the extract report.

7. After completing all cells on a page, close the page in YAML.
   After completing all pages in a section, close the section in YAML.
   **Confirm with the user before proceeding to the next section.**

**Phase 3 — Finalize**

8. Write/update the thin Eleventy page scaffold.
9. Complete the extract report with counts, TODOs, and warnings.
10. Present all output files.

#### Mode A Constraints

- **One `get_design_context` call per content-cell.** Do not batch. Do not call on sections or pages.
- **Do not write scripts** to parse, transform, or fetch Figma data. The MCP calls are the parser.
- **Write output incrementally.** Do not accumulate the entire page in memory before writing.
- **If a `get_design_context` call returns unexpected data,** log it in the extract report and move on. Do not retry repeatedly or attempt workarounds.
- **Stop and ask the user** if: a content-cell has no recognizable children, a coordinate doesn't snap to any grid line, or any other ambiguity arises.

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

### A) No Invented Copy

All string content must come from raw Figma text in JSON.
If missing, output TODO tokens (e.g. `TODO:headline`, `TODO:body`, `TODO:src`, `TODO:alt`).

### B) Node Tree Navigation

The Figma node tree has this hierarchy:

```
<pageKey> [FRAME]
  section-NN [FRAME]
    page-NN [FRAME]
      grid-tracks [INSTANCE]        ← sibling; carries grid definition (see §D)
      content-cell-NN [INSTANCE]    ← sibling; positioned via snap to grid-tracks
        content-cell--payload-wrapper [INSTANCE]
          <child-1> [INSTANCE]  ← determines include type
          <child-2> [INSTANCE]  ← additional include if stacked
          ...
```

**Key structural note:** `grid-tracks` and `content-cell-NN` are **siblings** — both are direct children of `page-NN`. The grid-tracks instance is a visual reference and grid definition source, not a parent container. It may have `hidden="true"` set. Content-cells are positioned by snapping to the grid-tracks lines in Figma.

**Payload resolution — Slot-first with fallback:**

For each content-cell, resolve the payload using this priority order:

1. **Slot (preferred):** Look for a direct child node with `name="Slot"` and type `SLOT`. If found, use its children as the ordered payload sequence.
2. **Fallback:** If no `Slot` node is found, look for a child instance named `content-cell--payload-wrapper`. Use its children as the payload sequence.
3. **Error:** If neither is found, log a `CONTENT_ERROR` in the extract report and emit `includes: []` for that cell.

Each child node's `name` determines the template include:

| Figma child name | Include |
|------------------|---------|
| `header` | `components/header.njk` |
| `paragraph` | `components/richtext.njk` (kind: `"p"`) |
| `list` | `components/richtext.njk` (kind: `"ul"`) |
| `figure` | `components/figure.njk` |
| `link-block` | `components/link-block.njk` |

If a child name doesn't match this table, log a warning in the extract report and emit an empty `includes: []` for that cell.

**Stacking:** A single content-cell may contain multiple children. Each child becomes a separate entry in the YAML `includes[]` array, ordered by their position in the Figma children array.

### C) Wrapper ID Convention

Each content-cell gets a wrapper ID for the YAML and placements SCSS.

**Format:** `<prefix>--<sectionKey>--<pageKey>--<cellName>`

**Prefix rules:**
- `header--` → cell contains exactly one child, and it is `header`
- `figure--` → cell contains exactly one child, and it is `figure`
- `content--` → everything else (single richtext, single link-block, or any stacked combination)

**Examples:**
- `header--section-01--page-01--content-cell-01`
- `content--section-01--page-01--content-cell-02`
- `figure--section-01--page-02--content-cell-02`
- `content--section-02--page-01--content-cell-02` (stacked: richtext + list + link-block)

### D) Grid Placement Contract

Content-cell grid positions are **inferred at compile time** from the grid-tracks sibling and content-cell bounding boxes. The grid-tracks instance is not a parent container — it is a sibling of the content-cells within each page, carrying the CSS Grid definition as a lookup table.

#### Step 1: Build the Grid Line Lookup Table

Read the `grid-tracks` sibling instance on any page. Extract its CSS Grid definition:

- **Column tracks:** `grid-template-columns` (e.g. `228px 100px 32px 24px 360px 24px 360px 24px 360px 24px 32px 100px 228px`)
- **Row tracks:** `grid-template-rows` (e.g. `20px 80px 144px 24px 116px 24px 84px 24px 116px 24px 144px 80px 20px`)

Compute cumulative pixel positions for each grid line (1-based CSS line numbering):

| Column Line | px position |
|-------------|-------------|
| 1 | 0 |
| 2 | 228 |
| 3 | 328 |
| 4 | 360 |
| 5 | 384 |
| 6 | 744 |
| 7 | 768 |
| 8 | 1128 |
| 9 | 1152 |
| 10 | 1512 |
| 11 | 1536 |
| 12 | 1568 |
| 13 | 1668 |
| 14 | 1896 |

| Row Line | px position |
|----------|-------------|
| 1 | 0 |
| 2 | 20 |
| 3 | 100 |
| 4 | 244 |
| 5 | 268 |
| 6 | 384 |
| 7 | 408 |
| 8 | 492 |
| 9 | 516 |
| 10 | 632 |
| 11 | 656 |
| 12 | 800 |
| 13 | 880 |
| 14 | 900 |

The grid definition is standardized across all pages. Build the lookup table once and reuse it.

#### Step 2: Note the Grid-Tracks Y Offset

The `grid-tracks` instance is positioned within the page frame at a consistent y offset (typically `y=100`). Read this offset from the grid-tracks instance position. All content-cell y values must be adjusted by this offset before matching to row lines.

**Grid-relative y** = content-cell y − grid-tracks y offset

#### Step 3: Map Content-Cell Coordinates to Grid Lines

For each content-cell on a page, read its `x`, `y`, `width`, and `height` from the Figma node.

Compute:
- **column-start:** Match `x` to the nearest column line position
- **column-end:** Match `x + width` to the nearest column line position
- **row-start:** Match `grid-relative y` to the nearest row line position
- **row-end:** Match `grid-relative y + height` to the nearest row line position

#### Step 4: Apply Snap Tolerance

Figma's grid-snapping uses 1px rectangle tracks, so content-cell coordinates may be off by 1–2 pixels. Apply a **±2px tolerance** when matching coordinates to grid line positions.

If a coordinate does not match any grid line within tolerance, log a warning in the extract report with the cell name, coordinate, and nearest grid line.

#### Step 5: Emit CSS Grid Placement

For each content-cell, emit:
```
grid-column: [column-start-line] / [column-end-line];
grid-row: [row-start-line] / [row-end-line];
```

**Validation example 1 — wide multi-column cell** (BMTx section-02/page-01/content-cell-03):
- Figma: `x=768, y=200, width=800, height=700`
- Grid-tracks y offset: `100`
- Grid-relative y: `200 − 100 = 100`
- x=768 → column line 7, x+width=1568 → column line 12
- y=100 → row line 3, y+height=800 → row line 12
- **Result:** `grid-column: 7 / 12; grid-row: 3 / 12;`

**Validation example 2 — narrow single-column cell** (BMTx section-01/page-01/content-cell-02):
- Figma: `x=384, y=617, width=361, height=283`
- Grid-tracks y offset: `100`
- Grid-relative y: `617 − 100 = 517`
- x=384 → column line 5, x+width=745 → nearest line is 6 (744px, 1px off, within tolerance)
- y=517 → nearest line is 9 (516px, 1px off, within tolerance), y+height=800 → row line 12
- **Result:** `grid-column: 5 / 6; grid-row: 9 / 12;`

**COMMON ERROR:** Do not confuse column span count with column end line. The end value in `grid-column: start / end` is a **line number**, not a span. Always compute the end line from `x + width` matched to the lookup table. A 360px-wide cell starting at line 5 (384px) ends at line 6 (744px), NOT line 8.

Numeric grid placement only. DO NOT use absolute positioning, transforms, negative margins, top/left, etc.
Emit placements SCSS only (no inline styles).

### E) Ordering Contract

- Ignore JSON child order for sections and pages.
- Sort sections by numeric suffix (`section-01`, `section-02`…).
- Sort pages by numeric suffix within each section (`page-01`, `page-02`…).
- Sort content-cells within a page by visual position using bounding box:
  - Primary: y (top)
  - Secondary: x (left)
- For ties, use node id ascending as stable fallback and report ties.
- Within a content-cell, preserve Figma children order (do not re-sort).

### F) Layout Contract

Global centering/clipping is already handled by `layout__section` + `layout__page`.
Do not change global layout in this compile step. Only generate placements + data.

---

### G) Bento Grid Compile Rules

Bento grid frames are identified by their direct children being named `article-NN` (e.g. `article-01`, `article-02`). When the compiler encounters a frame whose children follow this naming pattern, apply the bento compile rules below instead of the standard content-cell rules.

#### Bento Node Tree

```
<bentoKey> [FRAME]
  grid-tracks [INSTANCE]     ← sibling; carries grid definition (same §D inference logic)
  article-01 [INSTANCE]      ← ordered top-left to bottom-right (reading order)
  article-02 [INSTANCE]
  article-03 [INSTANCE]
  ...
```

#### Article Naming and HTML

Articles are named numerically from top-left to bottom-right in reading order. This naming order is canonical — it defines the semantic sequence in the HTML output.

Each article emits only:
```html
<article class="bento-cell bento-cell--{type} [bento-cell--theme-{theme}]" data-bento-cell="article-NN">
```

The `data-bento-cell` attribute is the CSS hook for per-cell placement. No numeric index class. No inline styles. No id attributes.

#### Z-Index from Figma Layer Order

Figma layer order (document order in the node tree) represents back-to-front stacking. The compiler derives `z-index` values from this order automatically.

**Rule:** For each `article-NN` sibling, read its index position in the Figma node tree (0-based). Emit `z-index` equal to that index + 1. Emit in the placements SCSS only — never as a YAML field or inline style.

#### Bento Grid Placement

Use the same §D grid inference logic (grid-tracks sibling, bounding box matching, ±2px tolerance). The grid-tracks instance for a bento frame uses uniform square tracks with a common gutter — simpler than the master grid but the same algorithm applies.

All placement output goes to `src/assets/scss/placements/_<pageKey>.scss`, in the same file as the content-cell placements. Structure:

```scss
/* ─── bento--<id> — grid dimensions ─── */

#bento--<id> {
    --bento-cols: N;
    --bento-rows: N;
}

/* ─── bento--<id> — cell placements ─── */

.bento-cell[data-bento-cell="article-01"] {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    z-index: 12;
}
.bento-cell[data-bento-cell="article-02"] {
    grid-column: 2 / 4;
    grid-row: 1 / 2;
    z-index: 11;
}
```

The `desktop.col` / `desktop.row` values in YAML are human-readable reference only — the template does not read them. The placements SCSS is the single source of truth for grid placement.

#### Bento YAML Shape

```yaml
bento:
  id: inficon--discovery
  cols: 5
  rows: 5
  cells:
    - id: article-01
      type: content              # content | image | custom
      theme: primary-dark        # omit for image cells
      zIndex: 1                  # derived from Figma layer order
      desktop:
        col: "1 / 2"
        row: "1 / 2"
      content: |                 # raw HTML from Figma Slot — rendered via | safe
        <span class="bento-type--eyebrow">Week on-site</span>
        <span class="bento-type--paragraphLead">at the pilot FAB in France</span>

    - id: article-08
      type: content
      theme: secondary-light
      zIndex: 8
      ariaDetails: "inficon-discovery--article-06"   # only when points-to is set
      desktop:
        col: "4 / 6"
        row: "3 / 4"
      content: |
        <span class="bento-type--paragraph">annotation text here</span>

    - id: article-06
      type: image
      # theme omitted — defaults to white
      zIndex: 6
      desktop:
        col: "3 / 6"
        row: "2 / 4"
      content: |
        <img src="/assets/images/inficon--screen.png" alt="" />
```

**Content extraction from Slot:** Read the Slot node’s children. For each child, extract text content and node name. Map node names to `bento-type--*` span classes using the inline typography table in CONTRACT.md. Wrap each text node in the appropriate span. For image nodes (`rounded-rectangle` or similar), emit an `<img>` tag with `src: TODO:src` and `alt: ""`.

If a Slot child is a `wrapper` frame, iterate its children and apply the same mapping — preserve document order.

---

## PARAM EXTRACTION RULES

Extract component properties from Figma `componentProperties` on each child instance. Property keys use the format `name#id`.

### 1) `components/header.njk`

Source: child instance named `header`

| YAML param | Figma property | Notes |
|------------|---------------|-------|
| `level` | `level` (VARIANT) | Values: `"h1"`, `"h2"`, `"h3"`, `"quiet-h2"`. See below for `"quiet-h2"` mapping. |
| `variant` | — | `"quiet"` or omit. Derived from Figma `level` value. See below. |
| `headline` | `headline#445:3` (TEXT) | Required. If missing: `"TODO:headline"` |
| `showEyebrow` | `showEyebrow#447:4` (BOOLEAN) | Emit as boolean |
| `eyebrow` | `eyebrow#445:2` (TEXT) | Only relevant when showEyebrow is true |
| `showSubhead` | `showSubhead#458:0` (BOOLEAN) | Emit as boolean |
| `subhead` | `subhead#458:3` (TEXT) | Only relevant when showSubhead is true |

**Figma `level: "quiet-h2"` mapping:** When Figma reports `level: "quiet-h2"`, emit:
- `level: "h2"`
- `variant: "quiet"`

For all other level values (`h1`, `h2`, `h3`), do not emit `variant`.

### 2) `components/richtext.njk` (paragraph mode)

Source: child instance named `paragraph`

| YAML param | Figma property | Notes |
|------------|---------------|-------|
| `kind` | — | Always `"p"` for paragraph instances |
| `text` | `Text#466:0` (TEXT) | Required. If missing: `"TODO:body"` |

**Multiple paragraphs:** If a content-cell contains multiple `paragraph` children, emit each as a separate `include` entry with `kind: "p"`.

### 3) `components/richtext.njk` (list mode)

Source: child instance named `list`

| YAML param | Figma property | Notes |
|------------|---------------|-------|
| `kind` | — | Default `"ul"`. Use `"ol"` only if explicitly indicated. |
| `items` | `items#472:0` (TEXT) | Split on newlines into array. |

### 4) `components/figure.njk`

Source: child instance named `figure`

Figure properties are split between the figure instance and its nested `media` child instance.

**From figure instance:**

| YAML param | Figma property | Notes |
|------------|---------------|-------|
| `showCaption` | `showCaption#663:4` (BOOLEAN) | Emit as boolean |
| `caption` | `Caption#663:3` (TEXT) | Only relevant when showCaption is true |

**From nested `media` child instance:**

| YAML param | Figma property | Notes |
|------------|---------------|-------|
| `type` | `type` (VARIANT) | Values: `"desktop"`, `"mobile"`, `"composite"` |
| `hasAlt` | `hasAlt#2793:1` (BOOLEAN) | Emit as boolean |
| `alt` | `alt#2793:0` (TEXT) | Only relevant when hasAlt is true. If the text matches the Figma placeholder string, emit `"TODO:alt"` |
| `src` | — | ALWAYS `"TODO:src"` unless a real image path exists |

**Figma placeholder detection for alt:** If `alt` value is `"Image description for assistive technology. If this is blank the image will be marked as role=\"presentation\"."` or similar boilerplate, treat it as missing and emit `"TODO:alt"`.

### 5) `components/link-block.njk`

Source: child instance named `link-block`

| YAML param | Figma property | Notes |
|------------|---------------|-------|
| `hasSecondary` | `hasSecondary#616:6` (BOOLEAN) | Emit as boolean |

**Primary link** — from nested `link--primary` child:

| YAML param | Figma property | Notes |
|------------|---------------|-------|
| `primary.priority` | `priority` (VARIANT) | Should be `"Primary"` |
| `primary.label` | `label#616:0` (TEXT) | |
| `primary.link` | `link#902:0` (TEXT) | The descriptive link text |
| `primary.URL` | `url#616:3` (TEXT) | If absent, omit URL (renders disabled span) |

**Secondary link** — from nested `link--secondary` child (only when `hasSecondary` is true):

Same param shape as primary, with `secondary.` prefix.

**Do not emit placeholder strings** like `"TODO:href"`. If URL is missing, omit the `URL` key entirely so `components/link.njk` renders the disabled span.

---

## TARGET YAML SHAPE

File: `src/_data/pages/<pageKey>/page.yml`

```yaml
pageKey: "<pageKey>"
sections:
  - sectionKey: "section-01"
    mode: "composite"       # "composite" if section has >1 page, else "normal"
    pages:
      - pageKey: "page-01"
        cells:
          - wrapper: "header--section-01--page-01--content-cell-01"
            includes:
              - include: "components/header.njk"
                params:
                  level: "h1"
                  headline: "Raw Figma text"
                  showEyebrow: false
                  showSubhead: true
                  subhead: "Raw Figma text"

          - wrapper: "content--section-01--page-01--content-cell-02"
            includes:
              - include: "components/richtext.njk"
                params:
                  kind: "p"
                  text: "Raw Figma text"

      - pageKey: "page-02"
        cells:
          - wrapper: "content--section-01--page-02--content-cell-01"
            includes:
              - include: "components/header.njk"
                params:
                  level: "h2"
                  variant: "quiet"
                  headline: "Raw Figma text"
                  showEyebrow: true
                  showSubhead: true
                  subhead: "Raw Figma text"
              - include: "components/richtext.njk"
                params:
                  kind: "p"
                  text: "Raw Figma text paragraph 1"
              - include: "components/richtext.njk"
                params:
                  kind: "p"
                  text: "Raw Figma text paragraph 2"

          - wrapper: "figure--section-01--page-02--content-cell-02"
            includes:
              - include: "components/figure.njk"
                params:
                  type: "desktop"
                  showCaption: true
                  caption: "Raw Figma text"
                  src: "TODO:src"
                  hasAlt: true
                  alt: "Raw Figma text"
```

Rules:
- Must be valid YAML.
- Use YAML block scalars (`|`) for multiline strings.
- Boolean values must be actual YAML booleans (`true`/`false`), not strings.

---

## PLACEMENTS SCSS OUTPUT

File: `src/assets/scss/placements/_<pageKey>.scss`

For each content-cell, emit a placement rule using the wrapper ID:

```scss
/* section-01 / page-01 */
.content-cell[data-cell="header--section-01--page-01--content-cell-01"] {
    grid-column: 3 / 12;
    grid-row: 5 / 8;
}

.content-cell[data-cell="content--section-01--page-01--content-cell-02"] {
    grid-column: 5 / 8;
    grid-row: 9 / 13;
}
```

Rules:
- Group placements by section/page with comment headers.
- All numbers are CSS grid lines (Figma anchor + 1).
- Do not include unrelated styles.

---

## THIN PAGE SCAFFOLD

File: `src/<pageKey>/index.njk`

Create folder if missing. If file exists, only update front matter fields if missing.
Content must remain empty — rendering happens via `layouts/compiled-page.njk`.

The `title` field should be derived from the h1 headline text found in section-01/page-01 during compilation. This is the page's public-facing title used in `<title>` and meta tags.

```njk
---
layout: layouts/base.njk
title: "<h1 headline text from Figma>"
permalink: "/portfolio/<pageKey>/"
pageKey: "<pageKey>"
mainClass: "layout--case-study"
---

<main class="layout {{ mainClass }}">
  {% include "layouts/compiled-page.njk" %}
</main>
```

If no h1 is found, use `"TODO:title"`.

---

## REPORT OUTPUT

File: `_docs/extract/<pageKey>.md`

Must include:

**Summary header** with pageKey and timestamp.

**Counts:**
- Sections found
- Pages found
- Cells found
- Wrappers emitted
- Includes emitted (by type)

**TODO counts:**
- `TODO:headline`
- `TODO:body`
- `TODO:src`
- `TODO:alt`
- `TODO:title`
- Any other `TODO:*` encountered

**Warnings:**
- Unrecognized child instance names (list node ids and names)
- Figma placeholder text detected and replaced with TODO
- Bounding box tie-breaks applied
- Any nodes skipped and why

**Wrapper Manifest:**
- Wrapper ID → includes list (in order)
- This helps diff stability

---

## IMPLEMENTATION NOTES

- Do not refactor unrelated files.
- Do not change global layouts or component templates.
- Only touch the four outputs listed.
- Use deterministic formatting: stable key ordering in YAML, stable sorting rules.

---

## NOW DO THIS

Given:
- pageKey: `<PAGE_KEY>`
- figmaJsonPath OR figmaFrameUrl (Mode A or B)

Perform the compile and write the outputs exactly as specified.
