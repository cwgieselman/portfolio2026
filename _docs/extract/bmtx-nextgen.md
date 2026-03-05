# Extract Report — bmtx-nextgen

**pageKey:** `bmtx-nextgen`
**Source:** `https://www.figma.com/design/REMxlDlqN4otxhfoUuYi5c/compile-ready--BMTx?node-id=26-1667`
**Compiled:** 2026-03-04
**Method:** Phase 1 get_metadata → Phase 2 get_design_context (per-cell) → Phase 3 write outputs

---

## Counts

| Metric | Value |
|--------|-------|
| Sections found | 3 |
| Pages found | 4 (s01:2, s02:1, s03:1) |
| Cells found | 10 |
| Wrappers emitted | 10 |
| Includes emitted — header | 5 |
| Includes emitted — richtext (p) | 8 |
| Includes emitted — richtext (ul) | 1 |
| Includes emitted — figure | 3 |
| Includes emitted — link-block | 2 |
| **Total includes** | **19** |

---

## TODO Counts

| Token | Count | Location |
|-------|-------|----------|
| `TODO:title` | 1 | meta.title |
| `TODO:src` | 3 | figure--p2--contentcell-2, figure--p3--contentcell-3, figure--p4--contentcell-3 |

---

## Warnings

1. **meta.title not in Figma JSON** — emitted `TODO:title`. Existing YAML had "BMTx Banking as a Service Platform" (H1 headline). Do not derive title from H1 per contract.

2. **s01/p02/cc01 header level change** — Figma renders at 24px Raleway Regular (`paragraphLead` style), indicating `quiet-h2` variant. Emitted `level: "h2", variant: "quiet"`. Existing YAML had `level: "h2"` without variant.

3. **s01/p02/cc01 headline text differs from existing** — Figma: "Consistency as a Requirement". Existing YAML: "Consistency becomes a Requirement". Used Figma text per No Invention rule.

4. **s02/p01/cc03 figure type change** — Figma placeholder renders "Composite" → `type: "composite"`. Existing YAML had `type: "desktop"`.

5. **s02/p01/cc03 figure caption differs from existing** — Figma: "Mapping design intent extracted from Axure to Figma components. Brad Frost would be proud!" Existing: "The lack of systemization in the existing design artifacts, built in Axure, created inconsistent UI." Used Figma text per No Invention rule.

6. **s03/p01/cc03 figure showCaption=false** — No caption element visible in Figma output. Emitted `showCaption: false` with no caption field. Existing YAML had `showCaption: true` with a caption string.

7. **s03/p01/cc03 figure type change** — Figma placeholder renders "Composite" → `type: "composite"`. Existing YAML had `type: "desktop"`.

8. **hasAlt: false for all figures** — All figure cells render with `opacity-0` on the alt text node, indicating `hasAlt` component property is false. Emitted `hasAlt: false` and omitted `alt` field. Existing YAML had `hasAlt: true` with boilerplate placeholder text.

9. **Grid placements preserved from existing SCSS** — The Figma MCP does not expose `gridColumnAnchorIndex`, `gridColumnSpan`, `gridRowAnchorIndex`, `gridRowSpan` component properties directly. Placements carried forward from the existing `_bmtx-nextgen.scss` file. These should be verified against the raw Figma JSON if re-deriving.

10. **`<em>NextGen</em>` in s01/p02/cc01 paragraph** — Existing YAML had inline `<em>` markup. Figma MCP renders plain text "NextGen" with no emphasis marker. Emitted plain text. Add `<em>` manually if inline formatting is required.

---

## Wrapper Manifest

| Wrapper ID | Includes (in order) |
|------------|---------------------|
| `header--bmtx-nextgen--p1--contentcell-1` | header.njk (h1) |
| `content--bmtx-nextgen--p1--contentcell-2` | richtext.njk (p) |
| `content--bmtx-nextgen--p2--contentcell-1` | header.njk (h2 quiet) → richtext.njk (p) → richtext.njk (p) |
| `figure--bmtx-nextgen--p2--contentcell-2` | figure.njk (desktop) |
| `header--bmtx-nextgen--p3--contentcell-1` | header.njk (h2) |
| `figure--bmtx-nextgen--p3--contentcell-3` | figure.njk (composite) |
| `content--bmtx-nextgen--p3--contentcell-2` | richtext.njk (p) → richtext.njk (ul) → richtext.njk (p) → link-block.njk |
| `header--bmtx-nextgen--p4--contentcell-1` | header.njk (h2) |
| `figure--bmtx-nextgen--p4--contentcell-3` | figure.njk (composite) |
| `content--bmtx-nextgen--p4--contentcell-2` | richtext.njk (p) → richtext.njk (p) → richtext.njk (p) → link-block.njk |
