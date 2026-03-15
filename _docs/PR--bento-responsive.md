# PR: `build/bento-responsive` → `main`

### What this does
Replaces the bento grid's fixed pixel geometry with a responsive system driven by CSS Grid named areas and `@container` queries. The bento now has two authored layout modes (5-up and 2-up) and two size states (MIN at 140px cells, MAX at 208px cells), triggered by the width of the `.content-cell` container. The INFICON Impact Manager page placements have been recompiled against the updated layout grid.

### Why
The previous implementation used `grid-column` / `grid-row` line numbers on individual cells and a fixed `width: fit-content` on the grid container. It had no responsive behavior — the bento overflowed its content-cell below ~1200px viewport width. The new system preserves the authored composition at all sizes and swaps to a separately authored 2-up layout on narrow containers.

---

### Changes by file

**`src/assets/scss/components/_bento-grid.scss`**
- Removed `--bento-cols` and `--bento-rows` custom props (geometry now lives in per-bento placements SCSS)
- Added `--bento-padding` custom prop (was implicit, now explicit and overridable)
- Removed `grid-template-columns` and `grid-template-rows` from `.bento-grid` base (moved to per-bento `#bento--<id>` selectors in placements SCSS)
- Added `@container content-cell (min-width: 900px)` — MAX size state: 208px cells, 16px gap and padding
- Added `@container content-cell (max-width: 731px)` — 2-up layout: 2-column grid, auto rows
- Removed `min-height: 0` on `.bento-cell`; replaced with `min-height: var(--bento-cell-size)` to prevent cell collapse in auto-row 2-up context
- Container queries reference `content-cell` (the parent container) not `bento` (the grid itself) — a container cannot query its own width

**`src/assets/scss/placements/_inficon-impact-manager.scss`**
- Recompiled all three content-cell placements against updated layout grid (source: compile-ready--INFICON node 30:2252)
  - `content-cell-01`: col 3/10, row 4/6
  - `content-cell-02`: col 3/4, row 8/13
  - `content-cell-03`: col 5/9, row 6/16
- Removed `--bento-cols` / `--bento-rows` from `#bento--inficon--im-research`
- Added `grid-template-columns`, `grid-template-rows`, and `grid-template-areas` to `#bento--inficon--im-research` — the 5-up named area map
- Replaced all `grid-column` / `grid-row` line-number declarations on `.bento-cell` with `grid-area: aNN` shorthand
- Added `@container content-cell (max-width: 731px)` block with the 2-up `grid-template-areas` map

**`src/_includes/components/bento-grid.njk`**
- Added `style="grid-area: aNN"` inline style to each `<article>` element, derived from `cell.id` via Nunjucks filter: `article-01` → `a01`
- Updated doc comment: placement model is now named areas, not line numbers

---

### What to verify

1. `npm start` builds without SCSS errors
2. INFICON Impact Manager page renders — bento is 5-up, 140px cells, 8px gaps, 732px total, centered in its 792px content-cell
3. DevTools → `#bento--inficon--im-research` computed `grid-template-areas` matches the 5-up map in placements SCSS
4. Each `<article>` in the bento has a `style="grid-area: aNN"` attribute in rendered HTML
5. No `--bento-cols` or `--bento-rows` references remain in any non-git file
6. At wide viewport (content-cell > 900px): cells jump to 208px, gap to 16px
7. At narrow viewport (content-cell < 732px): 2-up layout fires, 2-column grid, area map matches 2-up map in placements SCSS
8. BMTx page still renders without errors — BMTx bento not yet migrated to named areas, verify it hasn't broken

### What this does NOT change
- The macro grid `--gu` system and all macro layout placements
- The BMTx bento — not yet migrated to named areas, that is the next compile task
- Cell theme tokens
- The image optimization transform in `.eleventy.js`
- Macro layout responsive behavior — adding `@media` rules for the INFICON page at sub-1248px viewports is deferred to a follow-on branch
