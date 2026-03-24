# PR: `build/inficon-bento-series` → `main`

### What this does
Overhauls the page chrome architecture based on the Figma reference (node 2350:1027).
The page header moves from full-width to left-column-only, the bento column now
clears only the 48px navbar, and all sticky/fixed offsets are unified at 64px
(navbar 48 + gap 16). Field text for chapter-01 moves to row 2 to clear the header.

---

### Changes by file

**`src/assets/scss/_layout.scss`**
- Removed `$chrome-total-height` variable — replaced by explicit sticky targets
  documented in comments
- `$chrome-header-height` updated to `194px` (from Figma node 2386:1085)
- `$chrome-content-gap` reduced to `16px`
- `body { padding-block-start }` = `$chrome-navbar-height + $chrome-content-gap` (64px)
- `.page-chrome__header` — now `position: absolute`, `width: 608px` (left column only),
  sits alongside the bento rather than above it
- `.page-chrome__header-inner` — padding-block-start `28px` (from Figma), no centering
- `.chapter__content sticky top` = `$chrome-navbar-height + $chrome-content-gap` (64px)
- `.chapter__bento .layout__page sticky top` = `$chrome-navbar-height + $chrome-content-gap` (64px)

**`src/assets/js/choreography.js`**
- Skeleton underlay `top` updated to `64px`
- `CHROME_OFFSET` updated to `64px`

**`src/_data/pages/inficon-impact-manager/page.yml`**
- `fieldTextRow: 1` → `fieldTextRow: 2` for chapter-01 (clears fixed page header)

---

### What to verify

1. `npm start` builds without errors.
2. At 1440×900 viewport: full 4-up skeleton visible on load, bento starts 16px below navbar.
3. Skeleton underlay top aligns with bento top — both at 64px from viewport top.
4. Page header sits in the left column only, does not span the bento column.
5. Field text for chapter-01 starts at row 2, no collision with page header.
6. Bento does not move on initial scroll — stays fixed at 64px until chapter releases.
7. In DevTools: `window.getComputedStyle(document.querySelector('.chapter__bento .layout__page')).top` returns `64px`.
8. In DevTools: `document.querySelector('.bento-skeleton-underlay').style.top` returns `64px`.

### What this does NOT change
- Chrome is still entirely provisional. Pixel values, typography, and layout
  will be replaced wholesale when nav and header components are designed.
- Skeleton underlay absolute-positioning issue noted — to be investigated next session.
- 4-row bento visibility at viewports shorter than 900px — deferred.
- BEAT_MULTIPLIER remains 0.25.
