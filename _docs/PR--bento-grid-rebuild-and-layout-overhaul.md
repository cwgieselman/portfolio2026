# PR — Bento Grid Rebuild & Layout System Overhaul
*Session: March 22, 2026 | Branch: build/inficon-bento-series*

---

## Summary

Complete rebuild of the bento grid geometry and the macro layout system. The FF Grid is no longer the default page container — it is preserved as an opt-in section mode. Case study pages now use a new `choreographed` layout mode built entirely from bento unit math. The INFICON Impact Manager page has been recompiled against the new system with three beats.

---

## Design Intent

The new system is a unified token architecture — the bento cell size and gap are the atomic unit for everything: cells, columns, gutters, and the page grid. Nothing is arbitrary.

**The content slot is the anchor. Gap and padding are the shock absorbers.**

Cell size snaps at three authored states. Gap and padding flex fluidly between them so text reflows predictably at any viewport width.

| State | Cell | Grid width (4-up) |
|-------|------|-------------------|
| MIN | 144px | 624px |
| MONEY | 176px | 752px |
| MAX | 208px | 432px (2-up only) |

Gap: `clamp(8px, 2cqi, 16px)` — always 16px at designed states, compresses gracefully between.

**Macro layout derived from the same unit system:**

| Zone | Formula | Width |
|------|---------|-------|
| Content column | 2 bento units | 368px |
| Gutter | 5 gaps | 80px |
| Bento column | 4 bento units | 752px |
| Total | | 1200px |

---

## Files Changed

| File | Nature of change |
|------|-----------------|
| `src/assets/scss/components/_bento-grid.scss` | Major — new geometry, 4-up system, fluid gap/padding |
| `src/assets/scss/_layout.scss` | Major — grid moves from page to section level, two section modes |
| `src/_includes/layouts/compiled-page.njk` | Minor — section mode class applied from YAML |
| `src/_data/pages/inficon-impact-manager/page.yml` | Major — recompiled, three beats, mode: choreographed |
| `src/assets/scss/placements/_inficon-impact-manager.scss` | Major — new macro placements, three bento area maps |

---

## Changes in Detail

### 1 — `_bento-grid.scss` — New geometry

**Cell size:** 5-up system retired. Replaced with 4-up at two size states:
- Default (2-up): `repeat(2, minmax(144px, 208px))` — fluid, cells grow from MIN to MAX
- 4-up MIN (≥ 624px content-cell): `--bento-cell-size: 144px`, `repeat(4, 144px)`
- 4-up MONEY (≥ 752px content-cell): `--bento-cell-size: 176px`, `repeat(4, 176px)`

**Gap and padding:** Both now use `clamp(8px, 2cqi, 16px)` — fluid between states, 16px at designed states. Kept independent so they can be tuned separately.

**Container query thresholds:** 732px/900px → **624px** (4-up MIN) and **752px** (4-up MONEY). Scrollable cell visibility threshold updated to match 624px.

**Cell size 176px:** Changed from 140px/208px split. 176 is divisible by 16 (the gap value), making all span math clean integers.

### 2 — `_layout.scss` — Grid at section level

The macro grid has moved from `.layout__page` to `.layout__section--[mode]`. `.layout__page` is now a dumb centered container.

Two section modes replace the old single FF Grid page grid:

**`layout__section--choreographed`** (new default):
- Fires at ≥ 640px
- Three named columns: `[content-start] 368px [content-end] 80px [bento-start] 752px [bento-end]`
- `max-width: 1200px`, `margin-inline: auto` — centers naturally, no transform hack
- Field text cells → `content-start / content-end`
- Bento cells → `bento-start / bento-end`
- Header cells → `content-start / bento-end` (full width)

**`layout__section--designed`** (opt-in, bookend only):
- Fires at ≥ 1248px
- The existing FF Grid, unchanged, moved here from `.layout__page`
- Used as first or last section on a page only

**Default mode:** `choreographed`. Any section without an explicit `mode:` key gets choreographed behavior.

### 3 — `compiled-page.njk`

Single change: reads `section.mode` and applies `layout__section--{{ sectionMode }}` class. Default fallback is `choreographed`.

### 4 — INFICON Impact Manager recompile

The old single-bento five-section page is replaced with three beats. Each beat is a separate bento instance sharing the same 4×4 grid track system — beats register against the same geometry, enabling the scroll choreography work planned for the next phase.

**Beat 01** (`inficon--im-beat-01`) — The Place & Stakes
- 4×2 grid. Alps exterior photo (col 2/4, row 1/2), Craig full cleanroom (col 4/5, row 1/3).
- Col 1 intentionally empty — reserved.
- Field text left: "Four weeks into the role..."

**Beat 02** (`inficon--im-beat-02`) — Week One Work
- 4×3 grid. ROCC control room (col 1/3, row 2/4), "1 Week" stat (col 3/4, row 2/3), island photo (col 3/5, row 3/4).
- Bento only, no field text (deferred to choreography phase).

**Beat 03** (`inficon--im-beat-03`) — The Quote
- 4×4 grid. Quote cell (col 1/3, row 4/5) only.
- Selfie (Craig closeup in cleanroom suit) is a `::before` pseudo-element on the quote cell — no DOM node, no image optimization.
  - Desktop: `right: 100%` — hangs left of the quote cell outside the grid boundary
  - Mobile: `top: 100%, left: 50%, translateX(-50%)` — drops below, centered

### 5 — New section mode nomenclature

| Old | New | Intent |
|-----|-----|--------|
| `beat-series` | `choreographed` | Field text + bento, scroll-driven reading |
| `ff-grid` | `designed` | FF Grid IU compositions, opt-in bookend |

---

## What to Verify

- [ ] `npm run build` completes without SCSS errors
- [ ] INFICON page renders at 1440px — header full width, beat-01 field text left / bento right
- [ ] Beat-02 bento renders in bento column with no field text to its left
- [ ] Beat-03 quote cell renders gold (`secondary-dark`) at row 4 of a 4×4 grid
- [ ] At ~800px viewport — 4-up MIN fires, bento cells at 144px
- [ ] At ~640px — layout shifts to block, bento goes 2-up
- [ ] BMTx page still renders without errors (layout change is scoped to `.layout__section--choreographed` / `--designed`, BMTx uses same section structure — verify no regression)

---

## Outstanding / Deferred

- **Missing images** — beats 01 and 02 have broken image cells. Three iPhone photos need to be added to `src/assets/images/` with the correct filenames before the bento renders fully:
  - `inficon--photo--st-facility-alps.jpg` + `--CROP.jpg`
  - `inficon--photo--craig-cleanroom-full.jpg`
  - `inficon--photo--craig-cleanroom-selfie.jpg` (used as `::before` background-image on beat-03 quote cell)
- **Beat-02 field text** — removed for now, reinserted in choreography phase
- **Scroll choreography** — beats are sibling bento instances sharing grid track registration, ready for the next phase
- **BMTx conversion** — not yet converted to choreographed/beat structure
- **`bento-arrow.njk`** — still in the codebase, can be deleted

---

## Commit Suggestions

| Commit | Files |
|--------|-------|
| `refactor(bento): 4-up geometry, fluid gap/padding, unified token system` | `_bento-grid.scss` |
| `refactor(layout): grid moves to section level, choreographed + designed modes` | `_layout.scss`, `compiled-page.njk` |
| `feat(inficon): recompile beats 1-3, new YAML and placement SCSS` | `page.yml`, `_inficon-impact-manager.scss` |
