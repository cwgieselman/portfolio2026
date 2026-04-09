# Session State
*Last updated: April 9, 2026 (session 13)*

> **THIS FILE IS AUTHORITATIVE STATE -- read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branch

`experiment/inter-chapter-transition` — all session 13 work committed here. Half-note transition merged to `main` (session 12). This branch continues with C03 screenshot chapter work.

---

## Where We Are

### Real project
`localhost:8080/portfolio/inficon-impact-manager/` — C01, C02, C03 all rendering. C03 is the first "screenshot chapter" — uses a new `chapter__screenshot` panel element.

**What's working:**
- C01 → C02 half-note transition: mechanically correct, visually confirmed
- C03 screenshot panel: fades in/out with content text (choreography.js chorus)
- C03 real YAML content from Figma: 5 beats, stats tiles, image panel
- Content text narrows to 176px (1 mosaic unit) in screenshot chapters via `.layout__chapter--screenshot`
- Screenshot image constrained to 800×500 with object-fit:cover (eleventy-img blowout fixed)

**What needs browser verification / tuning (not confirmed this session):**
- Screenshot sticky positioning (top: 256px, grid-row: row-2-start / row-4-end)
- Content text width at 176px in browser
- C03 skeleton accuracy vs. designed tile positions
- C03 mosaic beat sequencing end-to-end

---

## What Was Done This Session (session 12)

### Skeleton horizontal alignment fix (`choreography.js`)
- **Bug:** C02 skeleton was shifted ~60px right of the mosaic column.
- **Root cause:** `getBoundingClientRect().left` read at `DOMContentLoaded`, mid-reflow.
- **Fix:** Extracted `positionSkeletons()`, deferred to `window.load`, added debounced `window.resize` handler.

### Merged `experiment/inter-chapter-transition` → `main`, pushed to GitHub.

---

## What Was Done This Session (session 13)

### C03 "Screenshot Chapter" — new architecture

**New element: `chapter__screenshot`**
- Chapter-level sibling to `chapter__content` and `chapter__mosaic` (not a mosaic tile)
- Defined in YAML as `chapter.screenshot: { src, hasAlt, alt }`
- Rendered via `src/_includes/components/screenshot.njk` → `components/media.njk`
- Fixed geometry: 800×500 image (16:10) with 8px top/side padding, footer reserve below
- Fades in/out in chorus with `chapter__content` via choreography.js class toggling
- z-index set by choreography.js above chapter__mosaic

**`_layout.scss` changes:**
- Added full `.chapter__screenshot` rule block (grid placement, sticky, animation states)
- Added `.chapter__screenshot picture` and `.chapter__screenshot picture img` rules to fix eleventy-img blowout
- Added `.chapter__screenshot__footer` flex-grow rule
- Split chapter grid first track: `192px [screenshot-start]` → `176px [content-narrow-end] 16px [screenshot-start]`
  - `content-narrow-end` named line at 176px (1 mosaic unit)
  - `screenshot-start` remains at 192px (unchanged position)
- Added `.layout__chapter--screenshot .chapter__content { grid-column: content-start / content-narrow-end; }` — narrows content text to 1 mosaic unit in screenshot chapters

**`compiled-page.njk` changes:**
- Renders `chapter__screenshot` between content and mosaic when `chapter.screenshot` is defined
- Adds `layout__chapter--screenshot` modifier class when `chapter.screenshot` is defined

**`choreography.js` changes:**
- Extended `contentRanges` to include `screenshot` alongside `content`
- `update()` loop toggles both panels in chorus (same `showAt`/`hideAt`)
- Sets screenshot z-index above mosaic (`mosaicZ + 1`)

**`CONTRACT.md`:** Added full `chapter__screenshot` specification section.

**`page.yml` — C03 real content:**
- `screenshot`: Impact Manager Feed image
- `skeleton`: 5 tiles (cols 2–4 row 1, col 4 rows 2–3)
- 5 beats: B00 skeleton, B01 empty (screenshot/richtext enter), B02–B04 stat tiles
- Full content from Figma: stats (3 iterations, 12 weeks, 6 FABs, $6M, ~18 months)

**`transition:` between C02 and C03** — standard rowOverlap: 1, fadePx/pausePx: 50.

---

## Uncommitted Changes

None — all changes committed this session.

---

## What Is Currently Broken / Unresolved

### Needs browser verification (session 14 start)
- Screenshot sticky position: top 256px, grid-row rows 2–4 — confirm in browser
- Content text narrowing to 176px in C03 — confirm in browser
- C03 mosaic beat sequencing — verify all 5 beats animate correctly
- C03 skeleton accuracy (col 2–4 row 1 + col 4 rows 2–3) — confirm tiles match design

### Dead scroll after last beat
Chapter height formula over-allocates by ~300px (3 beats × BEAT_PX × (1-OVERLAP)).
Result: dead scroll after last beat before chapter releases. Deferred — may be absorbed by C02→C03 transition budget.

### Skeleton auto-derivation
Skeletons hand-maintained in YAML. Should be computed in `pages.js` from beat union.

### Deferred (unchanged)
- Beat vocabulary rename (page → beat) in codebase
- Speed throttle — make BEAT_PX viewport-relative
- Per-chapter beat tuning (data-beat-factor attribute)
- Token backlog: shadow, alpha/overlay, frosted glass bg
- Frosted glass on page-header (initFrosting() exists, CSS may be missing)
- Mobile typography pass
- Comparison slider (BMTx)
- Arrow indicator system
- Sticky-stack section navigation
- Playwright visual regression suite
- Mosaic Builder YAML export refinement

---

## Inter-Chapter Transition Design (session 10 — full concept)

This is the designed transition replacing the placeholder scroll-tied fade. Applies when editorial goals call for chapter separation — not required when mosaics are flush.

### The "half note" metaphor
- Beats arrive as **quarter notes** — regular rhythm, same scroll budget each
- Chapter transitions arrive as **half notes** — longer breath, clears the deck

### Sequence
1. **C(N) last beat lands** → C(N+1) skeleton fades in, scroll-bound (subtle, not dead scroll). C(N+1) skeleton positioned so its top row overlaps C(N)'s bottom row by 1 row — grids interlock like puzzle pieces / Tetris.
2. **Brief scroll-bound pause** — holds the interlocked state. Maintains assembly rhythm.
3. **C(N+1) B01 scrolls in** over the skeleton. As it scrolls, it physically pushes C(N) upward — C(N) still sticky, but scroll budget shared between C(N+1) arriving and C(N) moving up.
4. **C(N+1) B01 lands** → this is C(N)'s release point. C(N) unsticks and scrolls off.
5. **C(N+1) B01 sticks** at CHROME_TOP. C(N) finishes scrolling off the page.
6. **At ~90% of C(N+1) B01's final position** → C(N+1) B02 starts scrolling in, back into quarter-note beat rhythm.

### Implementation status
**Implemented and merged to main.** Mechanically correct. Visually confirmed C01→C02.

---

## Plan for Next Session (session 14)

1. **Verify** screenshot sticky position + content text width in browser (JS diagnostics first)
2. **Verify** C03 beat sequencing end-to-end
3. **Tune** skeleton tiles if needed (YAML + placements)
4. **C02→C03 transition** — verify half-note plays correctly between chapters

**Start by reading this file. One change at a time. Verify before reporting.**

---

## Canonical Vocabulary (locked)

| Concept | Name |
|---|---|
| One 176×176px grid position | **cell** |
| Unique content component spanning cells | **tile** |
| B00 / full cell footprint of chapter | **skeleton** |
| A beat within a chapter | **beat** (B01, B02...) — codebase still uses "page", rename deferred |
| One chapter's full mosaic composite | **mosaic** |

---

## Open Priorities

### Next session
- Browser verify C03 screenshot + content text positioning
- C03 beat sequencing + mosaic choreography
- C02→C03 transition

### Post-C03
- Re-verify Chapter 01 end-to-end
- Skeleton auto-derivation in pages.js

### Deferred
(see list above)

---

## Figma Reference

| File | Key |
|------|-----|
| CGDC-DS | `zOZ13bdI68LuugJklgohm2` |
| Layouts--INFI | `LTePGo8Q1Lbapffom2X0W5` |
| BMTx compile-ready | `REMxlDlqN4otxhfoUuYi5c` |

---

## Rules (carried forward)

- Read Figma before writing CSS. One change at a time. Verify in browser.
- Session ends: update this file. No exceptions.
- Scale tokens stay as math expressions.
- Token Studio is gone. Do not reinstall.
- `--color-text` and `--color-text-subtle` are retired. Use `--color-body`.
- YAML `tiles:` → HTML `<article>`. In CONTRACT.
- Figma is source of truth. Codebase must match Figma, not the other way around.
- `richtext.njk` is the single rendering path for all long-form text.
- `custom: true` is an additive boolean on `type: frame | bleed`. Not a standalone type.
- No `.mosaic-tile--custom` class. Extended behavior lives on `[data-mosaic-variant]`.
- `justify-content: center` is axiomatic on `.mosaic-tile__inner`. Override in placements only.
- Claude.ai produces documents. Claude Code produces file changes.
- `theme:` may be set on bleed tiles when Figma explicitly sets it.
- `font-style: italic` and `font-variant: small-caps` are not tokenizable in Figma variables.

### Claude Code workflow rules
- Claude Code is the PRIMARY development tool for .scss/.js/.njk files
- Claude.ai is restricted to Figma reading and YAML generation only
- One change at a time. Describe → approve → change → stop → verify → confirm → repeat
- Never patch a Firefox-specific bug without understanding the root cause in Figma first
- The sandbox is abandoned. All work happens in the real project.

### Verification rules (session 8 — non-negotiable)
- When something looks wrong: run a JS diagnostic FIRST. Never guess.
- Never report a fix as working without measuring it in the browser.
- MCP screenshots are not reliable verification — use JS diagnostics.
- One change → verify the change took effect → report result. No chaining.

### Skeleton rules (session 9)
- Skeleton tiles must match the union of all beat tile positions in the chapter.
- Both YAML tile list and placements CSS must agree.
- Skeleton map in YAML and placements comments are documentation only — not used by templates.
- Auto-derivation in pages.js is the target architecture (not yet implemented).
