# PR — Bento Image Cell Types & Typography
*Session: March 16, 2026*

## Summary
Rebuilt the bento 2-up responsive model from the ground up, established a complete image cell type system, and locked in bento typography. No breaking changes to the 5-up layout or YAML contract.

---

## Files Changed

| File | Nature of change |
|------|-----------------|
| `src/assets/scss/components/_bento-grid.scss` | Major — 2-up model, cell types, typography |
| `src/_includes/components/bento-grid.njk` | Moderate — new render paths for `artDirection`, `scrollable` |
| `src/_data/pages/inficon-impact-manager/page.yml` | Minor — cell type updates on articles 03, 05, 07, 10, 11, 12 |
| `src/assets/images/inficon--photo--rocc-main--CROP.jpg` | New asset — square crop for art-directed 2-up |
| `src/assets/images/inficon--photo--rocc-island--CROP.jpg` | New asset — square crop for art-directed 2-up |
| `CLAUDE.md` | Documentation — breakpoint rig, cell types, typography tables |

---

## Changes in Detail

### 1 — 2-up fluid columns
Replaced `repeat(2, var(--bento-cell-size))` with `repeat(2, min(1fr, 208px))`. Cells now fill available width at 390px viewport (previously left ~164px dead space on the right) and cap at 208px above the 500px content-cell threshold.

### 2 — Content-driven row heights
Removed `position: absolute` from `.bento-cell__inner` entirely. Inner is always `position: relative`. In 2-up, content drives row height via normal flow — same-row cells share height automatically via grid row track sizing. Multi-row span cells no longer collapse. In 5-up, `height: 100%` fills the explicit grid track. No `position: absolute` anywhere in the system.

### 3 — Cascade fix
2-up `aspect-ratio` base rules compile after the 5-up container query block in the output. Fixed by doubling the class selector on 5-up unsets:
```scss
.bento-cell--image-directed.bento-cell--image-directed,
.bento-cell--graphic.bento-cell--graphic {
    aspect-ratio: unset;
}
```
Container queries add no specificity — the doubled selector wins regardless of cascade order.

### 4 — `type: image` + `artDirection: true` → `bento-cell--image-directed`
- `aspect-ratio: 4/5` in 2-up, unset in 5-up
- Renders `<picture>` with two `<source media>` elements
- `(min-width: 1052px)` → original `src:` (5-up viewport proxy)
- `(max-width: 1051px)` → `mobileSrc:` (separately authored square/portrait crop)
- Used on INFICON articles 03 (`rocc-main`) and 05 (`rocc-island`)

### 5 — `type: image` + `scrollable: true` → two sibling `<article>` elements
Renders a desktop instance and a scrollable instance sharing the same `grid-area`.

**Desktop instance** (`.bento-cell--image-desktop`):
- Normal image cell, standard `media.njk` render
- `display: none` in 2-up, `display: block` in 5-up via `@container content-cell (min-width: 732px)`

**Scrollable instance** (`.bento-cell--image-scrollable`):
- `display: block` in 2-up, `display: none` in 5-up
- Height: `calc(var(--bento-cell-size) * 2 + var(--bento-gap))` — two grid units tall
- `overflow: auto` both axes, `-webkit-overflow-scrolling: touch`, `scrollbar-width: thin`
- Image at `height: 500px`, `width: auto`, `max-width: none` — natural width, scrollable
- No srcset — uses `scrollSrc:` field directly, bypasses 11ty image transform
- Right-edge fade affordance via `::after` pseudo-element
- `role="region"` + `aria-label` from `cell.media.alt`
- Used on INFICON article 07 (FigJam mapping)

### 6 — `type: graphic` → `bento-cell--graphic`
- `aspect-ratio: 1` in 2-up, unset in 5-up
- `object-fit: contain`, `object-position: center center`, padded
- For square illustrations and diagrams that sit within the cell rather than filling it
- **Replaces `isCustom`** as the hook for animated/externally-driven assets (Lottie, canvas, CSS animation). External asset API TBD when first needed.
- Used on INFICON articles 10 (`needs`), 11 (`clustering`), 12 (`bullseye`)

### 7 — `object-fit: cover` fix
CSS now targets `img` inside `picture` directly:
```scss
.bento-cell__img,
.bento-cell__img img { object-fit: cover; }
```
The 11ty HTML transform places `bento-cell__img` on `<picture>`, not `<img>`. The `<img>` was getting `object-fit: fill` (browser default).

### 8 — Bento typography
Tightened line-heights, added axiomatic centering.

| Span | Size `clamp` | Line-height `clamp` | Align |
|------|-------------|---------------------|-------|
| `bento-stat` | `50px → 72px` | `1` | center (axiomatic) |
| `bento-lead` | `19px → 24px` | `24px → 30px` | center (axiomatic) |
| `bento-lead-italic` | `19px → 24px` | `24px → 30px` | center (axiomatic) |
| `bento-body` | `13px → 16px` | `18px → 24px` | left (default) |
| `bento-body-bold` | `13px → 16px` | `18px → 24px` | left (default) |

**Axiomatic centering** via `:has()`:
```scss
.bento-cell:has(.bento-lead, .bento-lead-italic, .bento-stat) {
    text-align: center;
}
```
Cells containing a lead or stat center all child spans via inheritance. Body-only cells stay left. Images unaffected. No per-span alignment declarations needed.

---

## Commit Suggestions

| Commit | Files |
|--------|-------|
| `fix(bento): fluid 2-up columns, min(1fr, 208px)` | `_bento-grid.scss` |
| `refactor(bento): content-driven row heights, remove position:absolute` | `_bento-grid.scss` |
| `feat(bento): image-directed cell type with art direction` | `_bento-grid.scss`, `bento-grid.njk`, `page.yml`, `*--CROP.jpg` × 2 |
| `feat(bento): scrollable image cell type for wide process artifacts` | `_bento-grid.scss`, `bento-grid.njk`, `page.yml` |
| `feat(bento): graphic cell type, replaces isCustom` | `_bento-grid.scss`, `bento-grid.njk`, `page.yml` |
| `fix(bento): object-fit cover reaching img inside picture` | `_bento-grid.scss` |
| `fix(bento): cascade specificity for 5-up aspect-ratio unset` | `_bento-grid.scss` |
| `style(bento): tighten typography, axiomatic centering via :has()` | `_bento-grid.scss` |
| `docs: update CLAUDE.md with breakpoint rig, cell types, typography` | `CLAUDE.md` |

---

## Playwright Visual Regression Testing

Added as part of this PR. Both files are new:
- `tests/visual.spec.js` — test suite
- `playwright.config.js` — Playwright configuration

New npm scripts:
- `npm run test:visual` — run all tests, save screenshots
- `npm run test:visual:check` — run tests, fail if anything changed
- `npm run test:visual:report` — open HTML report

New devDependency: `@playwright/test`

Tests Chromium and WebKit at:
- Four main viewports (390, 820, 1052, 1248)
- Six crossover viewports (±1px around 1052 and 1248)
- Overflow sweep every 50px from 375–1400px

Screenshots gitignored. Dev server must be running before tests.

---

## Known Gaps / Follow-up

- Scroll affordance visual design needs Figma work — fade is wired, indicator treatment TBD
- Arrow indicators still pending (see existing PR doc)
- FigJam export for article-07 should be wider (3:1+) for meaningful scroll distance — current asset is 1048×692
- `graphic` cell external asset API (for animation/interactivity) TBD when first needed
- `mobileSrc` crop generation via Sharp at build time (future — currently manual export)
