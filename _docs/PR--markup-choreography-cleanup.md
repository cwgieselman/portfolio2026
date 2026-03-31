# PR — Markup & Choreography Cleanup
*Branch: `rehab/markup-choreography-cleanup`*
*Date: March 30, 2026*

---

## What This PR Does

A structural cleanup pass across templates, SCSS, and JS. No new features. No visual regressions (verified in browser after each change). Chapter 01 choreography working correctly at end of session.

---

## Changes

### Templates

**`src/_includes/layouts/compiled-page.njk`**
- `<section>` → `<div>`. Single narrative per page means the `<section>` landmark added no value over `<main>`. `aria-labelledby` removed (was wired to a heading outside the section — incorrect). `sectionTitleId` variable removed.
- `layout__section` / `layout__section--{{ sectionMode }}` → `layout__narrative` / `layout__narrative--{{ sectionMode }}`. Removes FF Grid vocabulary from an element that is now a choreographed narrative container.
- Legacy flat-pages branch (`elif section.pages`) removed — dead code from old FF Grid structure.
- `sectionMode == "choreographed"` conditional removed — all sections are choreographed. Loop iterates `section.chapters` directly.
- `pageItemIndex0`, `cellIndex0` variables removed — were only used by the dead header-injection logic in `content-cell.njk`.
- `data-skeleton-*` attributes removed from section element — unused.
- `data-skeleton-areas` removed from chapter element — unused.

**`src/_includes/layouts/page.njk`**
- `content-cell.njk` include removed entirely. `layout__page` is always a bento beat container — `bento-grid` renders directly as its child. No conditional needed.
- `bento-grid` macro imported and called directly.

**`src/_includes/layouts/page-header.njk`**
- `page-header__frosting` div removed — moved to `index.njk` (see below). Frosting is a page-type concern, not a header-internal concern.

**`src/_includes/layouts/content-cell.njk`**
- Dead `sectionTitleId` heading-injection block removed. Was unreachable now that bentos bypass `content-cell` entirely.

**`src/inficon-impact-manager/index.njk`**
- `page-header__frosting` div added as first child of `<main>`, before the `page-header` include. Sibling position is required — frosting is `position: fixed` and must live in the root stacking context to sit correctly behind `.page-header` (z-index: 90). As a child of `.page-header` it could not be z-indexed behind its own parent.

---

### SCSS — `src/assets/scss/_layout.scss`

- `.layout__section` → `.layout__narrative` (all occurrences)
- `.layout__section--choreographed` → `.layout__narrative--choreographed`
- `.layout__section--designed` → `.layout__narrative--designed`
- `.layout__section .layout__chapter` → `.layout__narrative .layout__chapter`
- `.chapter__bento` — removed `display: grid`, `grid-template-rows: subgrid`, `grid-row: row-1-start / row-4-end`. Subgrid approach is dead. JS sets height directly. Element is now `position: relative` only.
- `.chapter__bento .layout__page` — added `container-type: inline-size` and `container-name: content-cell`. `layout__page` is now the container query host for the bento grid. Name kept as `content-cell` so placements SCSS fires without changes.
- `.chapter__bento .layout__page .content-cell` rule removed — dead, `content-cell` no longer exists in the bento render path.
- `.page-header__frosting` — new rule. `position: fixed`, `top: 48px` (flush under navbar), `left: var(--grid-margin)`, `width: 624px`, `height: 192px`. `opacity: 0` on load, `opacity: 1` when JS adds `.is-frosted`. `z-index: 88` — behind `.page-header` (90) and navbar (100).
- `.page-header__inner` — visual treatment (background, blur, shadow, border-radius, transition) removed. Now a pure layout/content container.
- `.page-header--stuck` ruleset removed — replaced by `initFrosting()` in JS.

---

### JS — `src/assets/js/choreography.js`

- `initHeaderStuck()` removed entirely. Was injecting a sentinel `<div>` into `<main>` with a stale hardcoded `top: 240px` value to drive an IntersectionObserver. Replaced by `initFrosting()`.
- `initFrosting()` added. Simple scroll listener. Threshold: `176px` (the header's `margin-block-start` on load — the distance it travels before reaching its stuck position). Toggles `.is-frosted` on `.page-header__frosting`. Runs on load to handle pre-scrolled state.
- Both `querySelector` calls updated: `.layout__section--choreographed` → `.layout__narrative--choreographed`.
- File-level comment updated — removed reference to `page-header--stuck` class toggling.
- `CHROME_TOP` restored to `64` (navbar 48 + gap 16). Was incorrectly set to `240` (navbar + full header height) in a previous session — this was pushing the bento 176px too low.

---

## Geometry Verified

- Frosting bottom edge flush with bento row 1 bottom edge ✓
- Frosting fades in correctly at scroll threshold ✓
- Frosting sits behind header text ✓
- Chapter 01 beat choreography working correctly ✓
- No visual regressions from rename or structural changes ✓

---

## What's Still Open (not in this PR)

- Micro-alignment issues inside bento cells — next session
- Chapter gap between C01 and C02 — next session
- Field text / extended page approach — Priority 1 per session state
- `content-header.njk` audit — any template still referencing old `header.njk` path will fail on build
- `bento-arrow.njk` — dead file, can be deleted
