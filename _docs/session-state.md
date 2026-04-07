# Session State
*Last updated: April 6, 2026 (session 6 — Claude Code cleanup)*

> **THIS FILE IS AUTHORITATIVE STATE -- read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branch

`main` — all work merged and pushed

---

## Where We Are

Mosaic Builder sandbox tool is the active focus. Steps 1 and 2 are fully
functional. The tool lives at:

```
/Users/craiggieselman/Projects/portfolio-sandbox/src/mosaic-builder.html
```

Served at `localhost:8080/mosaic-builder/` (sandbox runs on 8080 when the
real project is not running; bumps to 8082 when both are running).

Full tool state documented in `portfolio-sandbox/EXPERIMENTS.md` under
"Mosaic Builder / YAML Builder."

**Next session — two options, decide before starting:**
1. **Step 3 — Pages:** assign saved tiles to beats (P01, P02...). More workflow
   value; unlocks the full chapter-definition loop.
2. **YAML export refinement:** tighten the output to match full contract shape,
   include skeleton cell map, surface page assignments once step 3 exists.

Craig's instinct leaning toward Pages first. Either is valid.

---

## What Was Completed This Session

### Session 5 — Mosaic Builder sandbox tool

**Workflow formalization**
- Two-tool division of labor documented in `_docs/WORKFLOW.md`
- Claude.ai: Figma reads, YAML generation, architectural decisions, PR doc drafting
- Claude Code: all file changes, build verification, git commits

**Choreography debugger**
- `portfolio-sandbox/src/choreography-test.html`
- Loads real CSS from live project server
- Verbatim markup from `_site/portfolio/inficon-impact-manager/index.html`
- Images suppressed to labeled color blocks
- Debug panel + constants tuner, both in bottom-left corner
- marginTop fix proven: `-(offset * ROW_UNIT)` → `-MOSAIC_H`
- Inter-page gap fix: `landY = -(beatIdx * GAP_PX)`
- These fixes are pending in `choreography.js` in the real project

**Mosaic Builder — Step 1 (Skeleton)**
- 4×4 grid, click to toggle cells off, lock skeleton
- Minimap + stats in right panel
- Brand tokens: Raleway/PT Sans/Courier Prime, primary navy, yellow #FFCD00

**Mosaic Builder — Step 2 (Tiles)**
- Click-drag to draw tiles, release opens config panel
- Config: type (frame/bleed), theme (5 swatches, always visible), label
- Theme applies to both tile types (matches production contract)
- Save / Redraw / Delete workflow
- One pending tile at a time enforced
- Invalid drag flashes red and aborts
- Tile list in left panel

**Mosaic Builder — Edit Skeleton**
- '← Edit Skeleton' button enters amber edit mode
- Tiles dim to 35%, pointer-events:none on tile layer
- All cells interactive (no cell--occupied in edit mode)
- Conflict warning when toggling OFF a cell under a saved tile
- Lists affected tile IDs by name, confirm/cancel
- 'Done Editing →' returns to draw mode

**Key bug fix during session**
- `write_file` with partial content corrupted the file mid-session
- Rule established: never use `write_file` with partial content on existing files
- Always read first, always write the complete file
- `filesystem:edit_file` is the correct tool for targeted changes

---

## Canonical Vocabulary (locked — mosaic builder additions)

| Concept | Name |
|---|---|
| One 176×176px grid position | **cell** |
| Unique content component spanning cells | **tile** |
| P00 / full cell footprint of chapter | **skeleton** |
| A beat within a chapter | **page** |

Full portfolio vocabulary in session-state from session 4 (below) still applies.

---

## Open Priorities

### Mosaic Builder (active)
- Step 3 — Pages: assign tiles to beats
- Step 4 — Choreography: pacing controls + live preview
- YAML export refinement: skeleton cell map, page assignments

### Real project — choreography (partially resolved)
- `marginTop` and `landY` fixes were promoted in `f6590b9` (April 4) — done
- `bento` vocabulary cleanup was done in `f6590b9` — done
- **z-index stacking order** was wrong: `pages.length - 1 - i` → `i` so later
  pages render on top of earlier ones. Fixed in session 6 — committed.
- **Scroll choreography still has issues** (beyond z-index). Being debugged in
  sandbox. Root cause not yet confirmed. Next session: bring sandbox fix here.
- Promote COMPILE_PROMPTS gap resolutions (all 9 from session 4)
- Add artDirection / scrollable / mobileSrc props to CGDC-DS media component

### Deferred
- Token backlog: shadow, alpha/overlay, frosted glass bg
- Mobile typography pass
- Comparison slider (BMTx)
- Arrow indicator system
- Sticky-stack section navigation
- Playwright visual regression suite

---

## Figma Reference

| File | Key |
|------|-----|
| CGDC-DS | `zOZ13bdI68LuugJklgohm2` |
| Layouts--INFI | `LTePGo8Q1Lbapffom2X0W5` |
| BMTx compile-ready | `REMxlDlqN4otxhfoUuYi5c` |

---

## Rules (carried forward from session 4)

- Read Figma before writing CSS. One change at a time. Verify in Chrome.
- Session ends: PR doc → Claude Code commits, OR this file updated.
- Scale tokens stay as math expressions.
- Token Studio is gone. Do not reinstall.
- `--color-text` and `--color-text-subtle` are retired. Use `--color-body`.
- YAML `tiles:` → HTML `<article>`. In CONTRACT.
- Figma REST API is Enterprise-gated. Use Claude.ai + Figma MCP instead.
- Custom tile extended behavior uses `[data-mosaic-variant]` not `[data-mosaic-tile]`.
- 1px dashed border on topmost node of any CGDC component = Figma annotation. Never compile.
- Figma is source of truth. Codebase must match Figma, not the other way around.
- `richtext.njk` is the single rendering path for all long-form text. No raw `<p>` in templates.
- `custom: true` is an additive boolean on `type: frame | bleed`. Not a standalone type.
- No `.mosaic-tile--custom` class. Extended behavior lives on `[data-mosaic-variant]`.
- `justify-content: center` is axiomatic on `.mosaic-tile__inner`. Override in placements only.
- Claude.ai produces documents. Claude Code produces file changes.
- Mosaic ID format (new standard): `<pageKey>--<chapterKey>--<pageKey>`
  e.g. `inficon-impact-manager--chapter-01--page-01`
  Legacy shorthand form (`inficon--im--s01-c01-p01`) is deprecated.
- `theme:` may be set on bleed tiles when Figma explicitly sets it.
- `font-style: italic` and `font-variant: small-caps` are not tokenizable in Figma
  variables. Both live as direct CSS declarations with explanatory comments.

### Sandbox-specific rules
- Never use `write_file` with partial content on an existing file. Always write the full file.
- `filesystem:edit_file` is the correct tool for targeted line-level changes.
- Mosaic Builder is ES5-style JS only (var, function callbacks, no arrow functions,
  no const/let) for maximum browser compatibility.
