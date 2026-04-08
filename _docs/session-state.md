# Session State
*Last updated: April 8, 2026 (session 8)*

> **THIS FILE IS AUTHORITATIVE STATE -- read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branch

`main` — all work in progress, uncommitted

---

## Where We Are

### Real project
`localhost:8080/portfolio/inficon-impact-manager/` — Firefox now in parity with Chrome and Safari.
Chapter 01 beat animation is working. Some values need fine-tuning (user's words: "off by a little").
Chapter 02 is still hidden for isolation.

### Sandbox
`portfolio-sandbox/` — abandoned. Not a reliable reference.

---

## What Was Done This Session (session 8)

### Root cause found and fixed: mosaic width:0 bug
`width: fit-content` + `container-type: inline-size` = computed width of 0.
CSS containment suppresses intrinsic sizing, so `fit-content` resolved to 0.
`overflow: hidden` on `.mosaic` then clipped all tile content to invisible.
This was the root cause of the "grid floating in wrong place" and invisible skeleton tiles
that had been misdiagnosed for multiple sessions.

**Fix:** `src/assets/scss/components/_mosaic.scss` — both container query states changed
`width: fit-content` → `width: 100%`. Result: mosaic renders at correct width.

### CSS Grid stacking architecture implemented
Replaced `position: absolute` on beat pages with CSS Grid single-cell stacking.
- `.chapter__mosaic` now has `display: grid; grid-template-columns: 752px; grid-template-rows: 752px`
- All `.layout__page` children get `grid-column: 1; grid-row: 1`
- Removed `contain: layout` (not needed, was clipping off-screen beats)
- Removed `position`, `top`, `left` from JS page setup loop
- Eliminates Firefox sticky-in-grid containing block bug entirely

### Partnership and process documents added
- `CRAIG.md` created at project root — Craig's side of the working guidelines
- `CLAUDE.md` updated with non-negotiable verification rules at the top
- `_docs/session-state.md` rules section updated
- Memory: `feedback_verify-before-report.md` added

### Verification rule (now in all docs, non-negotiable)
Diagnose with real data (JS diagnostics) before touching code.
One change → verify it took effect → report result.
Never report fixed without measuring. MCP screenshots are unreliable.

---

## Uncommitted Changes

All session 7 + session 8 changes are in `src/` but NOT committed. Files changed:
- `src/assets/js/choreography.js`
- `src/assets/scss/_layout.scss`
- `src/assets/scss/components/_mosaic.scss`
- `src/assets/scss/components/_page-header.scss`
- `src/assets/scss/components/_content-cell.scss`
- `src/assets/scss/_shame.scss`
- `src/assets/scss/placements/_inficon-impact-manager.scss`
- `_docs/WORKFLOW.md`
- `CLAUDE.md`
- `CRAIG.md`
- `.zed/tasks.json`

---

## What Is Currently Broken / Unresolved

### Needs fine-tuning (next session priority)
Beat animation values are "off by a little" — user's assessment after Firefox fix.
Specific issues to verify in Chapter 01:
1. Beat timing / overlap (BEAT_PX=300, OVERLAP=0.5 — may need adjustment)
2. Inter-beat 16px gap (known issue from session 6, still unresolved)
3. Frosted glass on page-header (still missing)
4. Chapter 02 hidden — needs re-enable after Chapter 01 verified end-to-end

### Deferred
- Beat vocabulary rename (page → beat) in codebase
- Speed throttle — make BEAT_PX viewport-relative (discussed, not yet implemented)
- Per-chapter beat tuning (data-beat-factor attribute)
- Inter-chapter skeleton fade / transition variants
- Token backlog: shadow, alpha/overlay, frosted glass bg
- Mobile typography pass
- Comparison slider (BMTx)
- Arrow indicator system
- Sticky-stack section navigation
- Playwright visual regression suite
- Mosaic Builder YAML export refinement

---

## Plan for Next Session

1. Run JS diagnostic on beat animation state (scrollY ranges, actual transforms during scroll)
2. Fine-tune BEAT_PX and OVERLAP values for Chapter 01
3. Fix inter-beat 16px gap
4. Fix frosted glass
5. Verify Chapter 01 end-to-end in Firefox + Safari
6. Re-enable Chapter 02
7. Commit everything

**Start with a diagnostic. One change at a time. Verify before reporting.**

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

### Chapter 01 fine-tuning (next session)
- Beat timing, overlap, inter-beat gap
- Frosted glass
- End-to-end scroll verification

### Post-Chapter-01
- Re-enable Chapter 02
- Commit all session 7+8 changes

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
