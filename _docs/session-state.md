# Session State
*Last updated: April 8, 2026 (session 9)*

> **THIS FILE IS AUTHORITATIVE STATE -- read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branch

`main` — all work committed through session 9.

---

## Where We Are

### Real project
`localhost:8080/portfolio/inficon-impact-manager/` — Both chapters rendering. Chapter handoff working (seamless sticky release/start). Beat alignment correct. Skeleton tiles accurate for both chapters.

Chapter 01 and Chapter 02 are both enabled. Scroll behavior is mechanically correct. Inter-chapter transition is a placeholder (scroll-tied fade) pending Craig's designed transition.

### Sandbox
`portfolio-sandbox/` — abandoned. Not a reliable reference.

---

## What Was Done This Session (session 9)

### Beat alignment fix
`landY: 0` for all beats. The negative `landY` offsets were fighting the empty rows
at the top of each beat's tile placement (which already encode the 16px gap). With
`landY: 0`, beats land exactly on the skeleton and grid gaps align correctly.
Removed unused `GAP_PX` constant.

### Chapter z-index stacking
Set `z-index` on `.chapter__mosaic` elements in decreasing order (C01=2, C02=1).
Earlier chapters always paint above later ones during the overlap zone.

### pointer-events scaffold
`pointer-events: none` on `.mosaic-tile` in `_mosaic.scss`. Re-enable per custom
tile via `[data-mosaic-variant]` selectors in placements. No interactive tiles yet.

### Chapter handoff margin corrected
Changed from `-(mosaicH - CHROME_TOP)` to `-mosaicH`. With the current chapter height
formula, `-mosaicH` gives a seamless handoff: C(N).release = C(N+1).stickyStart.
The old comment claiming -752 caused overlap was wrong (based on a previous implementation).

### Inter-chapter opacity transitions (placeholder)
- Non-first chapters: fade in over one BEAT_PX before their sticky phase starts
  (hides them in normal flow before they're needed).
- Non-last chapters: scroll-tied fade out after release — opacity tracks mosaic's
  upward travel from CHROME_TOP to off-screen over (CHROME_TOP + mosaicH) px of scroll.
- These are placeholder mechanics. Craig has a designed inter-chapter transition in
  mind — this will be replaced next session.

### Skeleton tile accuracy
C01 skeleton: removed article-14/15 (row4-cols3-4 — never populated by any C01 beat).
C02 skeleton: removed article-01 (row1-col2) and article-04 (row2-col1) — never
populated by any C02 beat. YAML tile lists and placements CSS both corrected.
Skeleton map comments updated in both places.

**Open architectural item:** skeleton should be auto-derived from beat tile union
at 11ty compile time (in `pages.js`), not hand-maintained. Deferred to its own session.

### Scroll runway
Added `padding-bottom: 1000px` to `.layout__story` in `_layout.scss` with a
`TODO: REMOVE` comment. Temporary — gives enough scroll space to test the full
C01→C02 transition during design iteration.

### Scroll restoration fix (from PR doc, now committed)
`history.scrollRestoration = 'manual'` + `window.scrollTo(0,0)` on init.
PR doc deleted (stale).

---

## Uncommitted Changes

None — all committed.

---

## What Is Currently Broken / Unresolved

### Inter-chapter transition (next session priority)
Craig has a specific design in mind for how C01→C02 should feel. The current
scroll-tied fade is a mechanical placeholder. Bring Figma keyframes next session.

### Dead scroll after last beat
Chapter height formula: `mosaicH + beatCount * BEAT_PX + CHROME_TOP`.
With OVERLAP=0.5, beats consume `(beatCount-1)*OVERLAP*BEAT_PX + BEAT_PX` of scroll.
Over-allocates by `(beatCount-1)*BEAT_PX*(1-OVERLAP)` = 300px for 3 beats.
Result: 300px of extra dead scroll after last beat lands before chapter releases.
Not fixed — deferred. May be moot once transition is designed.

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

## Plan for Next Session

1. Craig explains the inter-chapter transition design
2. Pull Figma keyframes if needed
3. Implement the designed transition (replacing placeholder opacity mechanics)
4. Remove the 1000px padding-bottom TODO
5. Commit

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
