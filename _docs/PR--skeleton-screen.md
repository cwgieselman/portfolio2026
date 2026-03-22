# PR — Skeleton Screen & Choreography Refinements
*Session: March 22, 2026 | Branch: build/inficon-bento-series*

---

## Summary

Skeleton screen system implemented. Beat-01 loads with the full composite 4×4 grid outlined as skeleton articles. Real cells sit above the skeleton. Subsequent beats stack in on scroll, covering their skeleton positions with real content.

Also: beat-02 area map placement correction.

---

## Files Changed

| File | Nature of change |
|------|-----------------|
| `src/assets/js/choreography.js` | Skeleton injection — composite grid calculation |
| `src/assets/scss/components/_bento-grid.scss` | Skeleton cell styles, real cell z-index |
| `src/assets/scss/placements/_inficon-impact-manager.scss` | Beat-02 area map corrected |

---

## Changes in Detail

### 1 — Skeleton injection (choreography.js)

`injectSkeletons()` calculates the full composite grid across all beats in the chapter, then injects `.bento-cell--skeleton` articles into beat-01 for every position not covered by any beat's real cells.

**How it works:**
1. Gathers all bentos in the chapter
2. Determines max row count across all bentos (composite height)
3. Reads computed `gridRowStart/End/ColumnStart/End` from every real cell across all bentos to build an `occupied` set of `row,col` positions
4. Expands beat-01's `grid-template-rows` to the full composite height
5. Injects a 1×1 skeleton `<article>` for every position not in the occupied set

**Result:** On page load, beat-01 shows a complete 4×4 outlined grid. Real cells from beat-01 sit above their skeleton counterparts. As beats 02 and 03 stack in on scroll, their cells cover the remaining skeleton positions.

### 2 — Skeleton cell styles + real cell z-index (`_bento-grid.scss`)

`.bento-cell--skeleton`:
- Transparent background, primary-30 border, bento-radius
- `z-index: 0` — sits below real cells
- `pointer-events: none` — invisible to interactions

`.bento-cell`:
- Added `z-index: 1` — explicit stacking above skeleton cells

### 3 — Beat-02 area map correction

Stat cell (`article-02`, "1 Week") was incorrectly spanning rows 1-2. Fixed to row 2 only, col 3, flush with the top of the ROCC rendering. Corrected area map:

```scss
grid-template-areas:
    ".   .   .   ."
    "a01 a01 a02 ."
    "a01 a01 a03 a03";
```

---

## Architecture Note — Mental Model Crystallized

This session landed the correct mental model for the choreographed layout system:

**Section** = one assembled bento composition. The bento IS the section. Has an explicit composite grid that represents the full visual when complete.

**Chapter** = one left-column narrative unit. Has field text. Owns a portion of the section's bento positions across one or more pages.

**Page** = one beat. One portion of the bento grid. Left column advances per chapter, not per page.

**Implications for YAML restructure (next phase):**
- Current flat `sections → pages` structure needs to become `sections → chapters → pages`
- Section gets a `bento:` key with a `skeleton:` area map (explicit dots for permanently empty positions)
- JS skeleton injection reads from the YAML-driven skeleton map instead of deriving from computed styles
- This solves: intentionally empty positions (no skeleton), cross-chapter cell interplay, section-to-section transitions

**Current skeleton limitation:** JS currently injects skeletons for ALL unoccupied positions. It has no way to know which positions are intentionally empty vs. waiting for content. The YAML skeleton map contract (next phase) fixes this.

---

## What to Verify

- [ ] Build completes without errors
- [ ] Beat-01 shows full 4×4 skeleton grid on page load
- [ ] Real cells (Alps, cleanroom) sit above skeleton cells — no outlines showing through
- [ ] Skeleton cells have correct border-radius and gutter spacing
- [ ] Beat-02 "1 Week" stat cell is 1×1, in row 2 col 3, flush with top of rendering
- [ ] Scrolling reveals beats with skeleton cells covered by real content

---

## Commit Suggestions

| Commit | Files |
|--------|-------|
| `fix(inficon): beat-02 area map, stat cell to row 2` | `_inficon-impact-manager.scss` |
| `feat(choreography): skeleton screen — composite grid injection` | `choreography.js`, `_bento-grid.scss` |
