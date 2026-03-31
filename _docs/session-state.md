# Session State
*Last updated: March 30, 2026*

> **THIS FILE IS AUTHORITATIVE STATE — read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.
>
> Keep it high-level. Lillypads, not mud.
> The PR docs carry the commit-specific detail. This carries the why.

---

## Branches

`rehab/markup-choreography-cleanup` — committed, pushed. PR ready.
`stabilize/custom-variant-contract` — committed, pushed. PR ready.

---

## Where We Are

Both branches from this session are committed and pushed. The rehab pass is complete — markup is clean, choreography is working, contracts are updated.

Next session should open on a new feature branch targeting micro-alignment inside bento cells and the chapter gap between C01 and C02.

---

## What's Working

- `<nav class="navbar">` — global, fixed, in `base.njk` ✓
- `<header class="page-header layout__chapter">` — sticky at `top: 64px`, correct z-index (90) ✓
- `page-header__frosting` — fixed sibling of header in `index.njk`, fades in at 176px scroll threshold ✓
- `page-header__inner` — pure layout/content container, no visual treatment ✓
- Layout grid — 6 tracks, all named lines correct, `1200px` total ✓
- `layout__narrative` / `layout__narrative--choreographed` — renamed from `layout__section` ✓
- `layout__page` is now the container query host for bento (`container-name: content-cell`) ✓
- `bento-grid` renders directly inside `layout__page` — no `content-cell` wrapper in bento path ✓
- Subgrid fully removed from `.chapter__bento` ✓
- `CHROME_TOP = 64` — bento sticks correctly just below navbar ✓
- Frosting bottom / bento row 1 bottom are flush ✓
- Chapter 01 beat choreography — `BEAT_PX = 300`, `OVERLAP = 0.5` ✓
- `addWatchTarget('src/assets/js/')` in `.eleventy.js` — JS changes trigger rebuild ✓
- `data-bento-variant` attribute emitted by `bento-grid.njk` for custom cells ✓
- Custom cell contract documented in `CONTRACT.md` and `COMPILE_PROMPTS.md` ✓

---

## Open Priorities

### 1. Micro-alignment inside bento + chapter gap (PRIORITY 1)
- Micro-alignment issues inside bento cells — not yet investigated
- Gap between C01 and C02 when C02 enters — `chapterOffset` negative margin logic may be fighting chapter row track geometry

### 2. Field text — extended page approach (PRIORITY 2)
Subgrid approach is dead. Agreed new approach: field text becomes part of P02, which gets an extended grid context spanning `content-start / bento-end`. No synchronization needed — JS translates the whole page as one unit.

**What this means:**
- `chapter__content` removed from template, SCSS, JS
- `fieldText` YAML moves from chapter level to P02's page level
- `.layout__page--extended` spans `content-start / bento-end`
- Mobile: field text gets `order: -1`

### 3. `content-header.njk` audit (PRIORITY 3)
Any template still referencing `{% include "components/header.njk" %}` will fail on build. Audit before next deploy.

---

## Deferred

- **Big screenshot element** — named lines in grid, implementation deferred until Section 2
- **Selfie scroll collision** — fade/animation, custom article work
- **Section 2** — not yet authored
- **`bento-arrow.njk`** — dead file, delete it
- **Skeletons** — re-enable after Section 2 is authored
- **Page header detached-on-load behavior** — frosting trigger is wired, visual treatment deferred
- **Sticky-stack section navigation** — deferred until all three case studies are compiled

---

## Key Files

| File | State |
|------|-------|
| `src/assets/js/choreography.js` | `CHROME_TOP=64`, `initFrosting()`, no subgrid, `layout__narrative` selectors, selfie via `data-bento-variant` |
| `src/assets/scss/_layout.scss` | `layout__narrative`, `page-header__frosting`, no subgrid, `layout__page` is container host |
| `src/assets/scss/components/_bento-grid.scss` | Skeleton comment corrected — YAML-driven, not JS-injected |
| `src/_includes/layouts/compiled-page.njk` | `<div>` not `<section>`, `layout__narrative`, chapters loop directly |
| `src/_includes/layouts/page.njk` | `bento-grid` direct child, no `content-cell` |
| `src/_includes/layouts/page-header.njk` | No frosting div — moved to index.njk, doc comment corrected |
| `src/_includes/layouts/content-cell.njk` | Dead heading-injection block removed, stale error vars removed |
| `src/_includes/components/bento-grid.njk` | `data-bento-variant` emitted for custom cells |
| `src/inficon-impact-manager/index.njk` | `page-header__frosting` as first child of `<main>` |
| `src/_data/pages/inficon-impact-manager/page.yml` | `fieldTextRow` removed, skeleton maps preserved |
| `CONTRACT.md` | Custom cell contract, `data-bento-variant` hook, scaffold rule, graphic/skeleton added to type inventory |
| `scripts/COMPILE_PROMPTS.md` | Custom cell HTML output spec, YAML example, scaffold block rule |

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
- `position: fixed` elements cannot be z-indexed behind their own parent — they must be siblings, not children.
- `grid-template-areas` with unnamed columns causes those columns to collapse — use named lines only.
- `padding-inline` on a grid container shifts all track origins — put viewport-edge protection inside columns, not on the container.
- Frosting is a page-type concern, not a header-internal concern — lives in the page template, not in the header include.
- `layout__page` is the container query host for bento. `container-name: content-cell` kept so placements SCSS fires without changes.
- Custom bento article behavior is keyed via `data-bento-variant` — never hardcode bento IDs or article IDs in JS.
