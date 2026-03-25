# Session State
*Last updated: March 25, 2026*

> **THIS FILE IS AUTHORITATIVE STATE — read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.
>
> Keep it high-level. Lillypads, not mud.
> The PR docs carry the commit-specific detail. This carries the why.

---

## Branch
`build/inficon-bento-series` — `cwgieselman/portfolio2026`

---

## Where We Are

The page header semantics and layout grid refactor is complete and commit-ready (see `_docs/PR--page-header-semantics.md`). The header is correctly structured, fixed, and grid-aligned. Two open problems remain before Section 2 can be authored.

**Why the header work matters:** The layout grid now has 6 named tracks that formally define every key alignment position — content column, screenshot start/end, header end, bento column. These named lines are the single source of truth for all grid-informed elements going forward.

---

## Layout Grid (UPDATED — 6 tracks)

```
[content-start] 192px [screenshot-start] 176px [content-end] 80px
[bento-start] 176px [header-end] 384px [screenshot-end] 192px [bento-end]
```

Named line positions from grid left:
- `content-start` — 0px
- `screenshot-start` — 192px
- `content-end` — 368px
- `bento-start` — 448px
- `header-end` — 624px
- `screenshot-end` — 1008px
- `bento-end` — 1200px

Reference: Figma wireframe node `2554:1203` (file: `LTePGo8Q1Lbapffom2X0W5`).

---

## Open Priorities

### 1. Pages not stacking to build composite bento (PRIORITY 1)
Pre-existing. Pages translate in from below correctly but don't lock — they scroll away instead of accumulating.

`.chapter__bento` is `position: relative`. Pages inside are positioned/translated by `choreography.js`. The stacking is broken — incoming pages appear below P01 instead of on top of it. Measure actual rendered positions before changing anything.

### 2. Page header — audit `content-header.njk` rename (PRIORITY 2)
`header.njk` was renamed to `content-header.njk` this session. Any templates still referencing `{% include "components/header.njk" %}` will fail on build. Audit all templates before next deploy.

---

## What's Working

- `<nav class="navbar">` — global, fixed, in `base.njk` ✓
- `<header class="page-header layout__chapter">` — fixed, touches navbar, correct z-index ✓
- `page-header__inner` — spans `content-start / header-end` = 624px, frosted glass ✓
- Layout grid — 6 tracks, all named lines correct, `1200px` total ✓
- `padding-inline` removed from `.layout__chapter` — column tracks at designed geometry ✓
- `grid-template-areas` removed — gutter column no longer collapses ✓
- `.layout__section .layout__chapter { position: relative }` — scoped correctly, no conflict with fixed header ✓
- Container queries — unaffected, `.chapter__bento` still spans `bento-start / bento-end` as one element ✓
- Scroll-driven choreography — `BEAT_PX = 300`, `OVERLAP = 0.5`, `CHROME_TOP = 64` (from March 24)
- Skeletons disabled (`SHOW_SKELETON = false`) — code preserved

---

## Deferred

- **Big screenshot element** — named lines (`screenshot-start`, `screenshot-end`) are in the grid. Implementation deferred until Section 2 is authored.
- **`--grid-margin` token** — defined in `_layout.scss`, documents the pattern for grid-informed-but-not-contained elements. No active consumers right now (header uses grid placement directly).
- **Selfie scroll collision** — handle with fade/animation, custom article work
- **Section 2** — not yet authored. After Priority 1 is resolved.
- **`fieldTextRow` rows 3+4** — CSS rules exist, untested
- **`bento-arrow.njk`** — can be deleted, deferred
- **Skeletons** — re-enable after Section 2 is authored

---

## Key Files

| File | State |
|------|-------|
| `src/assets/js/choreography.js` | Scroll-driven, `SHOW_SKELETON=false` |
| `src/assets/scss/_layout.scss` | 6-track grid, page-header rules, no padding on chapter |
| `src/assets/scss/components/_bento-grid.scss` | Skeleton border `neutral-50`, good |
| `src/_data/pages/inficon-impact-manager/page.yml` | `fieldTextRow: 2` for chapter-01 |
| `src/inficon-impact-manager/index.njk` | page-header include, no page-chrome |
| `src/_includes/layouts/page-header.njk` | Fixed h1 header with frosted glass on __inner |
| `src/_includes/components/content-header.njk` | Renamed from header.njk, h2/h3 only |
| `_docs/PR--page-header-semantics.md` | Commit-ready PR doc |

---

## Figma Reference

| File | Key |
|------|-----|
| Layouts--INFI | `LTePGo8Q1Lbapffom2X0W5` |
| BMTx compile-ready | `REMxlDlqN4otxhfoUuYi5c` |
| CGDC-DS | `zOZ13bdI68LuugJklgohm2` |

Key nodes: full page `2350:1027` · section 01 `2492:14630` · page header `2386:1085` · layout grid wireframe `2554:1203`

---

## Rules (learned the hard way)

- Read Figma metadata before writing CSS. `get_metadata` first, every time.
- Verify in Chrome before declaring anything done. Screenshot + DevTools computed values.
- One change at a time. Verify, then move.
- Start fresh sessions earlier — long conversational sessions degrade work quality.
- Session ends one of two ways: PR doc written → Claude Code handles commit, OR this file updated. No other exit.
- `position: fixed` elements are not constrained by grid placement on themselves — place grid items *inside* the fixed container instead.
- `grid-template-areas` with unnamed columns causes those columns to collapse — use named lines only.
- `padding-inline` on a grid container shifts all track origins — put viewport-edge protection inside columns, not on the container.
