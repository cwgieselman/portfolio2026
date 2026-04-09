# Session State
*Last updated: April 9, 2026 (session 11)*

> **THIS FILE IS AUTHORITATIVE STATE -- read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branch

`experiment/inter-chapter-transition` — branched from `main` (session 10). Spike for the designed inter-chapter transition. `main` is the safe fallback at session 9 state.

---

## Where We Are

### Real project
`localhost:8080/portfolio/inficon-impact-manager/` — Both chapters rendering. The designed "half note" inter-chapter transition is implemented and mechanically correct.

**Transition working:**
- C02 skeleton fades in at 1-row interlock with C01 bottom (col 3–4 in row 1)
- Brief scroll-bound pause holds the interlock
- C02 B01 scrolls in from below; skeleton holds at interlockTop during push
- C01 releases when B01 lands; both chapters scroll together (push travel)
- C02 goes sticky at CHROME_TOP; B02 starts at 90% through push travel
- C01 scrolls off page naturally — no fade after release

### Sandbox
`portfolio-sandbox/` — abandoned. Not a reliable reference.

---

## What Was Done This Session (sessions 10–11)

#### Session 9 (reference)
Beat alignment (`landY: 0`), z-index stacking, pointer-events scaffold, chapter
handoff margin, placeholder opacity transitions, skeleton tile accuracy, scroll
runway padding, scroll restoration fix. All committed.

### Session 10–11: Half-note inter-chapter transition

**Architecture:**
- `transition:` entry in YAML between chapters carries `forChapter`, `rowOverlap`, `fadePx`, `pausePx`
- `pages.js` pre-processes: extracts C(N+1) P00 as `skeletonPage`, sets `skeletonExtracted: true` on C(N+1)
- `compiled-page.njk`: renders skeleton as `<div class="chapter__skeleton">` fixed sibling; skips P00 from C(N+1)'s mosaic
- `_layout.scss`: `.chapter__skeleton` is `position: fixed; width: 752px; height: 752px`; left/top/z-index owned by JS
- `choreography.js`: full transition sequencing — fade, pause, push, push travel, B02 start

**Key geometry:**
- `interlockTop = CHROME_TOP + mosaicH - rowOverlap * ROW_UNIT + GAP_PX` (640px for rowOverlap=1)
- `pushTravelPx = mosaicH - rowOverlap * ROW_UNIT + GAP_PX` (576px for rowOverlap=1) — derived, not tunable
- C(N+1) `marginTop = -(mosaicH - pushTravelPx)` → C(N+1) goes sticky pushTravelPx after B01 lands
- B02 starts at `pushEnd + TRANSITION_OVERLAP * pushTravelPx` (90% through push travel)

**YAML tuning knobs:** `fadePx`, `pausePx` (per-transition overrides of globals; defaults 50/50)

**Fixes applied this session:**
- Gutter offset (+GAP_PX in interlockTop formula)
- Skeleton holds at interlockTop during push phase (not sliding)
- C(N+1) marginTop correctly delays sticky point by pushTravelPx
- pushTravelPx accounts for rowOverlap (not a global constant)
- B02 timing tied to push travel (not push beat)
- C01 fade-out after release removed — C01 scrolls off naturally

---

## Uncommitted Changes

None — all committed (transition work + full doc update).

---

## What Is Currently Broken / Unresolved

### Needs visual confirmation
Craig needs to verify the transition end-to-end in his own browser. The MCP Firefox
instance confirmed correct geometry but the user's viewport/timing experience is
the true test.

### Dead scroll after last beat
Chapter height formula: `mosaicH + beatCount * BEAT_PX + CHROME_TOP`.
With OVERLAP=0.5, beats consume `(beatCount-1)*OVERLAP*BEAT_PX + BEAT_PX` of scroll.
Over-allocates by `(beatCount-1)*BEAT_PX*(1-OVERLAP)` = 300px for 3 beats.
Result: 300px of extra dead scroll after last beat lands before chapter releases.
Not fixed — deferred. May be moot now that transition consumes that budget.

### Skeleton auto-derivation
Skeletons hand-maintained in YAML. Should be computed in `pages.js` from beat union.

### Deferred (unchanged from session 8)
- Beat vocabulary rename (page → beat) in codebase
- Speed throttle — make BEAT_PX viewport-relative
- Per-chapter beat tuning (data-beat-factor attribute)
- Inter-chapter skeleton fade / transition variants
- Token backlog: shadow, alpha/overlay, frosted glass bg
- Frosted glass on page-header (initFrosting() exists, CSS may be missing)
- Mobile typography pass
- Comparison slider (BMTx)
- Arrow indicator system
- Sticky-stack section navigation
- Playwright visual regression suite
- Mosaic Builder YAML export refinement
- Remove temporary 1000px padding-bottom once transition is designed

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

### Key mechanical changes from current implementation
- C(N) release is no longer a fixed scroll formula — triggered by C(N+1) B01 landing
- `rowOverlap` in YAML drives C(N+1) skeleton Y offset relative to C(N) (interlock geometry anchor)
- Transition has its own scroll budget (the "half note") — longer than a beat, shorter than a chapter. Exact px TBD.
- C(N+1) B01 scroll-in must drive C(N) upward simultaneously (shared scroll phase)

### Implementation status
**Implemented** on `experiment/inter-chapter-transition`. The designed sequence is mechanically correct. Geometry verified with JS diagnostics. Pending Craig's visual confirmation and any tuning.

---

## Plan for Next Session (session 12)

1. Build C03 content in Figma + compile to YAML
2. Add `transition:` entry between C02 and C03 (standard half-note, rowOverlap: 1)
3. Remove 1000px `padding-bottom` TODO from `_layout.scss` (no longer needed once C03 is in place)
4. Consider merging `experiment/inter-chapter-transition` → `main`

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
- Inter-chapter transition design (Craig's vision)
- Remove 1000px padding-bottom

### Post-transition
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
