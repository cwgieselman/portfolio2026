# PROMPT C — FULL PAGE COMPILE (Figma → Eleventy page data + placements + report)

## ROLE

You are a deterministic compiler. You MUST NOT invent copy, labels, alt text, captions, or URLs. Only use raw Figma text. When missing, emit explicit TODO tokens.

## CANONICAL TERMINOLOGY

Use these names exactly. Do not use synonyms.

| Canonical name | What it is |
|---|---|
| **Field and Frame Grid** (abbrev: **FF Grid**) | The full 5-IU macro page grid. Active at ≥ 1248px viewport. |
| **2-col Grid** | The simplified two-column layout grid. Active at 640px–1247px. |
| **Bento Grid** | The CSS Grid inside a `.bento-grid` component instance. |

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
    page-NN [INSTANCE]             ← live grid-tracks component instance
      guides [FRAME]               ← hidden; contains COL-- and ROW-- guide instances
      grid [SLOT]                  ← Slot where content-cells live
        content-cell-NN [INSTANCE] ← positioned via snap to grid lines
          Slot [SLOT]
            <child-1> [INSTANCE]   ← determines include type
            <child-2> [INSTANCE]   ← additional include if stacked
            ...
```

**Key structural note:** The page frame is now a live instance of the grid-tracks component. Content-cells are placed inside the `grid` Slot — not as free siblings. The `guides` frame contains named COL-- and ROW-- guide instances whose x/y positions encode the grid line lookup table directly — read guide positions rather than computing from track sizes. The guides frame has `hidden="true"` and does not render.

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

The FF Grid geometry is standardized across all pages — build the lookup table once and reuse it.

**Columns:** 5 full IUs × 384px + 4 gutters × 24px = 2016px Field. Frame = IU2–IU4 (408px → 1608px).

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

Figma's grid-snapping uses 1px rectangle tracks, so content-cell coordinates may be off by 1–2 pixels. Apply a **±2px tolerance** when matching coordinates to grid line positions.

If a coordinate does not match any grid line within tolerance, log a warning in the extract report with the cell name, coordinate, and nearest grid line.

#### Step 5: Emit CSS Grid Placement

For each content-cell, emit:
```
grid-column: [column-start-line] / [column-end-line];
grid-row: [row-start-line] / [row-end-line];
```

**Validation example 1 — full-frame figure cell** (BMTx section-02/page-01/content-cell-03):
- Figma: `x=816, y=216, width=792, height=750`
- Grid-relative y: `216` (no offset adjustment needed)
- x=816 → column line 5, x+width=1608 → column line 8
- y=216 → row line 2, y+height=966 → row line 15
- **Result:** `grid-column: 5 / 8; grid-row: 2 / 15;`

**Validation example 2 — header cell** (BMTx section-02/page-01/content-cell-01):
- Figma: `x=408, y=264, width=1200, height=126`
- Grid-relative y: `264` (no offset adjustment needed)
- x=408 → column line 3, x+width=1608 → column line 8
- y=264 → row line 4, y+height=390 → row line 5
- **Result:** `grid-column: 3 / 8; grid-row: 4 / 5;`

**COMMON ERROR:** Do not confuse column span count with column end line. The end value in `grid-column: start / end` is a **line number**, not a span. Always compute the end line from `x + width` matched to the lookup table. A 384px-wide cell starting at line 3 (408px) ends at line 4 (792px), NOT line 4 counting from the start.

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

Bento Grid frames are identified by their direct children being named `article-NN` (e.g. `article-01`, `article-02`). When the compiler encounters a frame whose children follow this naming pattern, apply the Bento Grid compile rules below instead of the standard content-cell rules.

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

For `custom` cells, also emit `data-bento-variant`:
```html
<article class="bento-cell bento-cell--custom [bento-cell--theme-{theme}]"
         data-bento-cell="article-NN"
         data-bento-variant="{variant}">
```

The `data-bento-cell` attribute is the CSS hook for per-cell placement. `data-bento-variant` is the hook for extended CSS and JS behavior. No numeric index class. No inline styles. No id attributes.

#### Z-Index from Figma Layer Order

Figma layer order (document order in the node tree) represents back-to-front stacking. The compiler derives `z-index` values from this order automatically.

**Rule:** For each `article-NN` sibling, read its index position in the Figma node tree (0-based). Emit `z-index` equal to that index + 1. Emit in the placements SCSS only — never as a YAML field or inline style.

#### Bento Grid Placement

Use the same §D grid inference logic (grid-tracks sibling, bounding box matching, ±2px tolerance). The grid-tracks instance for a Bento Grid frame uses uniform square tracks with a common gutter — simpler than the FF Grid but the same algorithm applies.

All placement output goes to `src/assets/scss/placements/_<pageKey>.scss`, in the same file as the content-cell placements. Structure:

```scss
/* ─── bento--<id> — cell area map (default 2-up, no query) ─── */

#bento--<id> {
    grid-template-areas:
        "a01 a04"
        ...;
}

/* ─── bento--<id> — 5-up area map (content-cell ≥ 732px) ─── */

@container content-cell (min-width: 732px) {
    #bento--<id> {
        grid-template-columns: repeat(5, var(--bento-cell-size));
        grid-template-rows:    repeat(5, var(--bento-cell-size));
        grid-template-areas:
            "a01 a02 a02 a03 a03"
            ...;
    }
}

/* ─── cell areas ─── */

.bento-cell[data-bento-cell="article-01"] { grid-area: a01; z-index: 12; }
.bento-cell[data-bento-cell="article-02"] { grid-area: a02; z-index: 11; }
```

The `desktop.col` / `desktop.row` values in YAML are human-readable reference only — the template does not read them. The placements SCSS is the single source of truth for Bento Grid placement.

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
      desktop:
        col: "1 / 2"
        row: "1 / 2"
      content: |
        <span class="bento-stat">1</span>
        <span class="bento-body">Week on-site at the pilot FAB in France:</span>

    - id: article-06
      type: image
      # theme omitted — defaults to white
      desktop:
        col: "3 / 6"
        row: "2 / 4"
      media:
        src: "TODO:src"
        hasAlt: true
        alt: "TODO:alt"
        sizes: "40vw"
        cssClass: "bento-cell__img"

    - id: article-07
      type: custom
      variant: "selfie"          # Figma: custom=true, variant="selfie"
      theme: primary-dark        # omit if no theme
      desktop:
        col: "1 / 3"
        row: "4 / 5"
      content: |
        <span class="bento-lead-italic">TODO:quote</span>
```

**Custom cell scaffolding rule:** When a `custom` cell is encountered, emit the YAML above and then append a scaffolding block to the compile report:

```
CUSTOM CELL SCAFFOLD — variant: selfie
  SCSS: add ruleset for [data-bento-variant="selfie"] in placements/_<pageKey>.scss
  JS:   add behavior keyed to document.querySelector('[data-bento-variant="selfie"]')
        in choreography.js or a dedicated selfie.js partial
  Note: <describe the intended visual/interactive behavior from Figma>
```

Do not attempt to author the extended CSS or JS — output the scaffold block and move on.

---

## CONTENT-CELL POSITIONING PROPS

Each `content-cell-NN` instance carries two optional positioning props. Read them from Figma `componentProperties` on the content-cell instance itself (not its children).

| Figma prop | Figma values | Axis |
|-----------|--------------|------|
| `Vert` (VARIANT) | `Default` \| `Center` \| `End` | Vertical |
| `Horiz` (VARIANT) | `Default` \| `Center` \| `End` | Horizontal |

**Purpose:** Where the cell sits within its grid slot when the cell is smaller than the slot. Not a layout engine — just spatial positioning within available space. Prop names are intentionally non-CSS.

**Emit rule:** `Default` → emit nothing. `Center` and `End` only produce output. Do not emit to YAML. Do not emit as inline styles.

**Value mapping:**

| Prop | Figma value | CSS output |
|------|------------|------------|
| `Vert` | `Center` | `align-self: center;` |
| `Vert` | `End` | `align-self: end;` |
| `Horiz` | `Center` | `justify-self: center;` |
| `Horiz` | `End` | `justify-self: end;` |

**Warning:** `Horiz: Center` emits `justify-self: center` which shrinks the cell to its intrinsic width. Only safe on cells whose content has a defined width (e.g. a Bento Grid with `width: fit-content`). Never use on text/richtext cells.

**Output target:** Placements SCSS only — in the same selector as `grid-column` and `grid-row`:

```scss
.content-cell[data-cell="content--section-01--page-01--content-cell-03"] {
    grid-column: 5 / 8;
    grid-row: 6 / 16;
    align-self: center; /* Vert=Center */
}
```

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

For each content-cell, emit a placement rule using the wrapper ID.

**FF Grid placements use `@media (min-width: 1248px)`.**
**2-col Grid placements use `@media (min-width: 640px) and (max-width: 1247px)`.**
**Bento Grid area maps use `@container content-cell` queries — see §G.**

```scss
/* section-01 / page-01 — FF Grid */
@media (min-width: 1248px) {
    .content-cell[data-cell="header--section-01--page-01--content-cell-01"] {
        grid-column: 3 / 12;
        grid-row: 5 / 8;
    }

    .content-cell[data-cell="content--section-01--page-01--content-cell-02"] {
        grid-column: 5 / 8;
        grid-row: 9 / 13;
    }
}

/* section-01 / page-01 — 2-col Grid */
@media (min-width: 640px) and (max-width: 1247px) {
    .content-cell[data-cell="header--section-01--page-01--content-cell-01"] {
        grid-column: 2 / 5;
        grid-row: 1;
    }
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
