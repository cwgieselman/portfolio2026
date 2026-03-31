# Session State
*Last updated: March 31, 2026*

> **THIS FILE IS AUTHORITATIVE STATE — read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.
>
> Keep it high-level. Lillypads, not mud.
> The PR docs carry the commit-specific detail. This carries the why.

---

## Branches

`rehab/markup-choreography-cleanup` — committed, pushed. PR done.
`stabilize/custom-variant-contract` — committed, pushed. PR done.
`rehab/vocabulary-rename` — **rename complete, commit pending.**

---

## Where We Are

Tokens session (Claude.ai). Two major decisions made:

**1. Vocabulary rename — ready for Claude Code**
Full rename from bento → mosaic, layout__narrative → layout__story.
Book metaphor (Story → Chapter → Page) is now the canonical system vocabulary.
PR doc at `_docs/PR--rehab-vocabulary-rename.md`. Claude Code creates the branch
and executes the rename.

**2. Token system architecture — decided, not yet built**
Token Studio is being removed. Replacing with a selective Figma pull script
(`scripts/figma-pull.mjs`). Direction of truth: Figma owns color and semantic
assignments; `tokens.json` owns scale math. This work is deferred to a future
tokens session after the vocabulary rename is committed.

---

## Canonical Vocabulary (NEW — locked this session)

The book metaphor governs all naming:

| Concept | Name | Notes |
|---|---|---|
| Whole case study | **story** | `layout__story` in CSS, `<main>` in HTML |
| Narrative unit | **chapter** | unchanged |
| Scroll stack unit | **page** | unchanged |
| Grid composition | **mosaic** | was bento-grid |
| Composition cell | **mosaic-tile** | was bento-cell, renders as `<article>` |
| Lead text | **mosaic-lead** | was bento-lead |
| Body text | **mosaic-body** | was bento-body |
| Stat text | **mosaic-stat** | was bento-stat |

**Critical:** YAML key `tiles:` maps to HTML `<article>` elements. Intentional
split — must be documented in CONTRACT.md.

---

## Token System Architecture (decided this session)

**Current state:** Token Studio is installed but disliked. GitHub sync exists but
causes conflicts. `tokens.json` is effectively hand-authored. Figma variables
are dirty — duplicate groups from multiple Token Studio export rounds.

**Decided architecture:**
- Token Studio → removed (future session)
- New script: `scripts/figma-pull.mjs` — selective pull from Figma REST API
- Direction: Figma → tokens.json → CSS (for color/semantic/component tokens)
- Scale tokens stay hand-authored in tokens.json (math expressions, not Figma's job)
- Print tokens: additive `@media print` overrides in SCSS, no `/web/` namespace needed

**Figma variable cleanup needed (before pull script can be built):**
- Delete duplicate `font-weight/*` and `font-family/*` groups (keep `font/weight/*` and `font/family/*`)
- Delete `type/*` group in semantic (keep `type/web/*`, then rename to `type/*` after)
- Delete `bento/theme/white` (identical to `bento/theme/default`, Token Studio artifact)
- Remove `/web/` namespace from type tokens → `type/paragraph/*` not `type/web/paragraph/*`
- Standardize `letterSpacing` casing throughout (camelCase S)
- Delete `type/web/primaryCTA` and `type/web/secondaryCTA` orphan variables

**Token backlog (from token-backlog-figma.md) — still open:**
- Shadow system (items 1)
- Alpha/overlay color system (item 2)
- Frosted glass background token (item 3)
- Scale/275 line-height decision (item 4)
- Em-based letter-spacing system (item 5)
- Design system hub UI (item 6 — defer to rebuild)

---

## What's Working

- `<nav class="navbar">` — global, fixed, in `base.njk` ✓
- `<header class="page-header layout__chapter">` — sticky at `top: 64px` ✓
- `page-header__frosting` — fixed sibling, fades in at 176px scroll threshold ✓
- Layout grid — 6 tracks, all named lines correct, `1200px` total ✓
- `layout__story` / `layout__story--choreographed` — working ✓
- `layout__page` is container query host for mosaic ✓
- Mosaic renders directly inside `layout__page` ✓
- `CHROME_TOP = 64` — mosaic sticks correctly below navbar ✓
- Chapter 01 beat choreography — `BEAT_PX = 300`, `OVERLAP = 0.5` ✓
- `addWatchTarget('src/assets/js/')` in `.eleventy.js` ✓

---

## Open Priorities

### 1. Vocabulary rename — DONE
Branch `rehab/vocabulary-rename` complete. All bento → mosaic, layout__narrative → layout__story renames applied. Commit pending.

### 2. Figma variable cleanup + figma-pull.mjs (AFTER rename is merged)
Tokens session. Clean Figma first, build pull script second.

### 3. Micro-alignment inside mosaic + chapter gap (PRIORITY after tokens)
- Micro-alignment issues inside mosaic tiles — not yet investigated
- Gap between C01 and C02 when C02 enters — `chapterOffset` negative margin logic

### 4. Field text — extended page approach
Subgrid dead. New approach: field text part of P02, `.layout__page--extended`
spans `content-start / bento-end`. `chapter__content` removed from template/SCSS/JS.

---

## Deferred

- **Big screenshot element** — named lines in grid, deferred until Section 2
- **Selfie scroll collision** — fade/animation, custom tile work
- **Section 2** — not yet authored
- **`bento-arrow.njk`** — deleted (was already gone before vocabulary rename)
- **Skeletons** — re-enable after Section 2 is authored
- **Page header detached-on-load behavior** — deferred
- **Sticky-stack section navigation** — deferred until all three case studies compiled
- **Token Studio removal** — deferred to tokens session
- **figma-pull.mjs** — deferred to tokens session

---

## Key Files

| File | State |
|------|-------|
| `src/assets/js/choreography.js` | `CHROME_TOP=64`, `initFrosting()`, `layout__story` selectors ✓ |
| `src/assets/scss/_layout.scss` | `layout__story` ✓ |
| `src/assets/scss/components/_mosaic.scss` | mosaic system ✓ |
| `src/_includes/layouts/compiled-page.njk` | `layout__story`, chapters loop ✓ |
| `src/_includes/layouts/page.njk` | mosaic direct child ✓ |
| `src/_includes/components/mosaic.njk` | mosaic component ✓ |
| `tokens/tokens.json` | `component.mosaic.*` ✓ |
| `CONTRACT.md` | vocabulary section updated ✓ |
| `scripts/COMPILE_PROMPTS.md` | vocabulary updated ✓ |

---

## Figma Reference

| File | Key |
|------|-----|
| Layouts--INFI | `LTePGo8Q1Lbapffom2X0W5` |
| BMTx compile-ready | `REMxlDlqN4otxhfoUuYi5c` |
| CGDC-DS | `zOZ13bdI68LuugJklgohm2` |

Key nodes: full page `2350:1027` · section 01 `2492:14630` · page header `2386:1085`

---

## Rules (learned the hard way)

- Read Figma metadata before writing CSS. `get_metadata` first, every time.
- Verify in Chrome before declaring anything done.
- One change at a time. Verify, then move.
- Session ends one of two ways: PR doc written → Claude Code handles commit, OR this file updated.
- `position: fixed` elements cannot be z-indexed behind their own parent.
- `grid-template-areas` with unnamed columns causes those columns to collapse.
- `padding-inline` on a grid container shifts all track origins.
- Frosting is a page-type concern, not a header-internal concern.
- `layout__page` is the container query host for mosaic. `container-name: content-cell` kept.
- Custom mosaic tile behavior keyed via `data-mosaic-variant` — never hardcode IDs in JS.
- Scale tokens stay in tokens.json as math expressions — Figma stores resolved values only.
- Figma pull script pulls color/semantic/component tokens only — scale is code-side.
- YAML key `tiles:` maps to HTML `<article>` elements — intentional, document in CONTRACT.
