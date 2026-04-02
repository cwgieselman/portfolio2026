# PR -- Custom Tile Selector Convention + Compile Documentation + Richtext System

**Branch:** `build/custom-tile-selector-convention`
**Date:** April 2, 2026

---

## Summary

Establishes the custom tile variant selector convention, captures compile-time
annotation ignore rules, corrects two type token line-height values against
Figma, implements the richtext component as the single long-form text rendering
pattern across both pipelines, adds the ordered-list Figma component to the
system, and brings CLAUDE.md into sync with the current architecture.

---

## Commits

### Commit 1: `fix(placements): use data-mosaic-variant for selfie extended behavior`

**File:** `src/assets/scss/placements/_inficon-impact-manager.scss`

The selfie tile's extended behavior selectors (overflow, `::before`,
`.is-exiting::before`) were using `[data-mosaic-tile="article-01"]` -- the
positional placement hook. The correct selector for extended behavior is
`[data-mosaic-variant="selfie"]` -- the semantic hook derived from the tile's
`variant` prop.

Grid-area placement line unchanged. Section comment updated to document the
two-selector convention inline.

No visual change expected.

---

### Commit 2: `docs(contract): document custom tile two-selector convention`

**File:** `CONTRACT.md`

Expanded the Custom Tile Contract section with Figma prop table, two-selector
convention table, concrete selfie example, and corrected Tile Types table
(removed non-existent `graphic` row).

---

### Commit 3: `docs(compile-prompts): add 1px dashed stroke ignore rule`

**File:** `scripts/COMPILE_PROMPTS.md`

Added Figma annotation conventions section at the top of PROJECT CONTRACTS.
All CGDC component instances carry a 1px dashed stroke on their outermost node
as a visual boundary aid. Rule: any 1px dashed border on the topmost node of a
CGDC-DS component is a boundary annotation and must be ignored entirely during
compile. Currently on: `richtext`, `chapter-##`, `chapter--page-##`.

---

### Commit 4: `fix(tokens): correct sectionHeading and subheading line-height values`

**File:** `tokens/tokens.json`

Two line-height tokens corrected against Figma measurements:

- `type/sectionHeading/lineHeight`: `{scale.300}` (48px) -> `{scale.250}` (40px)
- `type/subheading/lineHeight`: `{scale.250}` (40px) -> `{scale.200}` (32px)

Figma is the source of truth. Both discrepancies confirmed by reading variable
bindings directly from CGDC-DS component definitions.

Requires `npm run tokens:build` to regenerate `_tokens--semantic.scss`.

---

### Commit 5: `feat(richtext): implement single long-form text rendering pattern`

**Files:**
- `src/_includes/components/richtext.njk` -- rewritten
- `src/assets/scss/components/_richtext.scss` -- created
- `src/_includes/layouts/compiled-page.njk` -- updated
- `src/assets/scss/_layout.scss` -- `.field-text` block removed
- `src/assets/scss/main.scss` -- `@use "components/richtext"` added

`richtext.njk` is the single rendering path for all long-form text in both
pipelines. Handles `p`, `h2` (with optional non-semantic subhead), `h3`, `ul`,
`ol`. All typography bound to design tokens from Figma. Spacing between blocks
governed by `--richtext-block` and `--richtext-continuation` component tokens.

`compiled-page.njk` updated to route `chapter.fieldText` through `richtext.njk`
instead of a raw `<p class="field-text">`.

`.field-text` class and its provisional styles removed from `_layout.scss`.

---

### Commit 6: `feat(richtext): add ordered-list; rename list components to match Figma`

**Files:**
- `src/assets/scss/components/_richtext.scss` -- updated
- `src/_includes/components/richtext.njk` -- updated
- `scripts/COMPILE_PROMPTS.md` -- updated

In Figma: `list` renamed to `unordered-list` (2781:455). New `ordered-list`
component added (3277:2226). Both share identical typography tokens
(`type/paragraph/*`, `color/body`); only the list marker differs.

SCSS: `.richtext--list` split into `.richtext--ul` (disc) and `.richtext--ol`
(decimal). Continuation spacing selectors updated to match.

`richtext.njk`: class names updated to `richtext--ul` and `richtext--ol`.

`COMPILE_PROMPTS.md`: canonical terminology updated (`Field text`/`chapter--content`
-> `Richtext`/`richtext`). Node tree diagram updated. Section H expanded with
full child component table (`paragraph`, `unordered-list`, `ordered-list`,
`heading h2/h3`) including node IDs and YAML kind mappings. Mosaic example
grid corrected from 5-up to 4-up.

No visual change for existing `ul` content. `ol` rendering now available.

---

### Commit 7: `docs(claude): sync CLAUDE.md with current architecture`

**File:** `CLAUDE.md`

- Terminology: `Field text`/`chapter--content` -> `Richtext`/`richtext`.
  Richtext description expanded to include all handled kinds (p, h2, h3, ul, ol).
- Typography table: Rewritten. Old table had three columns with wrong values.
  Corrected to two columns (Block / Desktop). Values corrected against actual
  tokens and `_typography.scss`: pageTitle 28px/48px desktop, sectionHeading
  32px/40px desktop, subheading 20px/32px desktop.
- Mosaic tile types: removed `graphic` (not an active tile type).

---

### Commit 8: `fix(placements): selfie tile -- correct selectors, offset, and text centering`

**File:** `src/assets/scss/placements/_inficon-impact-manager.scss`

Three corrections to the selfie custom tile block:

1. **Selector correctness** -- All extended behavior (overflow, `::before`,
   `.is-exiting::before`) now uses `[data-mosaic-variant="selfie"]` instead
   of `[data-mosaic-tile="article-01"]`. Grid-area placement line unchanged.

2. **Selfie offset** -- `top: 176px` corrected to `top: 184px`.
   Intent: 8px gap between the bottom of the quote tile and the top of the
   selfie image. 176px = tile height (no gap); 184px = tile height + 8px gap.
   The `right: 232px` offset is unchanged: 1 cell (176px) + 1 gap (16px) +
   half the 80px gutter between content and mosaic columns (40px) = 232px.

3. **Text centering** -- `justify-content: center` is defined on
   `.mosaic-tile__inner` base in `_mosaic.scss` — all tiles are centered by
   default. The placement comment was corrected to document this inheritance.
   No variant-scoped centering rule was added.

All comments updated. Unicode box-drawing characters replaced with ASCII dashes
throughout for `str_replace` reliability.

---

### Commit 9: `refactor(mosaic): remove graphic tile type; fix custom as additive boolean`

**Files:**
- `src/_includes/components/mosaic.njk` -- graphic branch removed
- `src/assets/scss/components/_mosaic.scss` -- graphic CSS removed; `justify-content: center`
  moved to `.mosaic-tile__inner` base; `.mosaic-tile--custom` block removed
- `src/_data/pages/inficon-impact-manager/page.yml` -- selfie tile: `type: custom` →
  `type: content` + `custom: true`
- `CONTRACT.md` -- tile types table corrected; DOM shape example corrected;
  custom tile YAML example corrected; Figma mapping note updated
- `CLAUDE.md` -- tile types rewritten; custom as additive boolean documented
- `src/_data/component-docs/mosaic.yml` -- type field description corrected
- `src/_includes/layouts/compiled-page.njk` -- stale "bento pages" comment removed

**`graphic` tile type** was documented in CONTRACT.md and CLAUDE.md as non-existent but
still present as dead code in the template, SCSS, and component-docs. All three removed.

**`custom` tile type** was used as a standalone `type:` value in YAML and CSS, contradicting
CONTRACT.md's own spec text ("custom is a modifier, not a type"). Corrected throughout:
`custom: true` is now an additive boolean alongside the base `type: content | image`. No
`.mosaic-tile--custom` CSS class is emitted — all extended behavior lives on
`[data-mosaic-variant]` in placements.

**Centering** moved from type-scoped rules to `.mosaic-tile__inner` base — all tiles are
centered by default. Overrides scoped to placement selectors when a variant needs different
alignment. `gap` retained on `.mosaic-tile--content` only (multi-child flex layout).

No visual change expected.

---

## Visual Impact

- Token corrections: subheading and section heading elements reflow slightly
  due to tighter line-heights. Verify page-header subhead and any h2/h3.
- Richtext: `fieldText` in chapter left column uses token-driven typography.
- `ol` rendering now available.
- Selfie: 8px gap now present below quote tile. Text in quote tile is centered.

---

## Testing

- [ ] `npm run tokens:build` runs clean
- [ ] `npm start` builds with no SCSS errors
- [ ] Browser: page-header subhead line-height correct (Raleway Regular, 32px)
- [ ] Browser: fieldText renders in chapter left column via richtext.njk
- [ ] Browser: selfie image appears 8px below the quote tile at desktop
- [ ] Browser: selfie offset 40px left of tile left edge (right: 232px)
- [ ] Browser: quote tile text is vertically centered
- [ ] Browser: selfie fades on page transition (.is-exiting)
