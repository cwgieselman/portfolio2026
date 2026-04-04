# Session State
*Last updated: April 4, 2026 (session 3)*

> **THIS FILE IS AUTHORITATIVE STATE -- read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branch

`main` — all work merged and pushed

---

## Where We Are

Three PRs applied and pushed to `main`. YAML is now verified against Figma for chapters 01 and 02. The delta workflow has been identified as a recognized second compile mode and needs to be formalized.

**Next session options (either order):**
1. Formalize the delta compile mode — add a Delta Mode section to `COMPILE_PROMPTS.md` (output format spec, comparison logic, stacking/nested span distinction).
2. Run a **first-compile experiment**: ask Claude.ai to compile `inficon-impact-manager` from Figma cold (Mode 1, ignoring the existing `page.yml`) and compare the output against current YAML. Goal: pressure-test COMPILE_PROMPTS.md and surface anything the delta pass may have normalized away.

---

## What Was Completed This Session

### Session 3 — Three PRs + Figma delta applied

**PR: fix/choreography-chapter-gap**
- `bentoH` → `mosaicH` throughout; `bento` local var → `mosaic`
- `mosaicH` (752) and `GAP_PX` (16) hoisted to constants block
- Chapter overlap margin: `-(offset × ROW_UNIT)` → `-mosaicH` — eliminates 644px dead zone between chapters
- Beat `landY` added: pages stack with 16px sliver between them instead of collapsing flush
- Scroll tween rewritten in px throughout (no vh/px unit jump at `scrollEnd`)

**PR: build/tile-typography**
- `font.family.display`: Playfair Display → Merriweather (lining figures stable at display size)
- `type.statLabel` semantic tokens added (Raleway Bold, 20px/20px, 4px tracking)
- Google Fonts: Merriweather in, Playfair out; PT Sans Bold Italic (`1,700`) added
- `_mosaic.scss` type block: `font-variant-numeric: lining-nums` on `mosaic-stat`; `mosaic-stat-label` and `mosaic-body-italic` added as new classes
- Docs: CONTRACT.md Tile Content Model section, COMPILE_PROMPTS.md Span Vocabulary, mosaic.njk comment all updated to 7-class vocabulary

**Figma delta: chapters 01 & 02** (`figma-yaml-delta--chapters-01-02.md`)
- 11 changes applied to `page.yml` — alt text corrections, skeleton tile fixes (ch01 +2 tiles, ch02 full pattern replaced), stat tile 3-span content, bold spans removed where Figma is plain text, screenshot alt text made meaningful
- Delta identified two compile modes (see Compilation Workflow below)

---

### Session 2 — Static analysis sweep + cleanup

- 6-check static analysis: stale terminology, CONTRACT violations, `position: absolute`, YAML↔placements, image assets, choreography.js integrity
- All findings resolved or annotated:
  - `richtext.njk` comment corrected (`fieldText` → `content[]`)
  - Selfie placement offsets (`184px`, `232px`) annotated with `CONTRACT_EXCEPTION`
  - Two missing mobileSrc CROP files flagged with TODO in `page.yml`
  - Animation magic numbers in `_layout.scss` and `_link.scss` annotated with TODO (animation token system not yet built)
  - Scroll indicator in `_mosaic.scss` annotated with TODO (needs design pass)
  - Comparison slider annotated with top-level TODO (not yet designed in Figma)
  - `componentDocs.js` JSDoc example updated from `bento-article` to `mosaic`

### rehab/frame-bleed-rename — full tile type rename + audit

- `content` → `frame`, `image` → `bleed` throughout: YAML, template, CSS, all docs
- `artDirection`/`scrollable` refactored from class-based to `data-mosaic-media` attribute selectors
- `<picture>` source breakpoints corrected from 1052px → 624px (actual mosaic 2-up threshold)
- Art-directed portrait aspect-ratio: `@container (max-width: 623px)` scoped rule
- `justify-content: center` on `.mosaic-tile__inner` base (axiomatic)
- `.mosaic-tile--custom` class removed; all extended behavior on `[data-mosaic-variant]`
- All compile-facing docs purged of stale `type: content/image` references

### Architecture audit — discrepancies found and fixed

- Sections array removed from Pipeline A YAML — chapters are now top-level. A top-level
  `mode: "choreographed"` drives the `layout__story--{mode}` class instead.
- `fieldText: string` replaced by `content: [{kind, text}]` array on each chapter.
  compiled-page.njk now iterates the array and includes richtext.njk per block — same
  mechanism as Pipeline B. One rendering path for all long-form text.
- `wrapper:` field removed from Pipeline A page objects — never read by page.njk (vestigial).
- CONTRACT.md: Header include corrected to `content-header.njk`; h1 explicitly excluded
- CONTRACT.md + COMPILE_PROMPTS.md: YAML Shape examples now use `frame`/`bleed`
- COMPILE_PROMPTS.md: Report output type names corrected; tile naming HTML corrected;
  full page YAML shape and chapter richtext compile rules updated
- YAML-architecture.md: Full rewrite — hierarchy correct, Section removed, Chapter updated
  with `content:` array, Page updated (no wrapper), Mosaic/Tile sections accurate

### All audit items resolved

- [x] `media.njk` comment corrected
- [x] `chapter__bento` → `chapter__mosaic` across compiled-page.njk, _layout.scss, choreography.js, placements
- [x] Dead `bentos` variable removed from choreography.js
- [x] Dead `.mosaic-tile--composite` block removed from _mosaic.scss
- [x] `wrapper:` field removed from Pipeline A pages (vestigial)

---

## Canonical Vocabulary (locked)

| Concept | Name | CSS / YAML |
|---|---|---|
| Whole case study | **story** | `layout__story` |
| Narrative unit | **chapter** | `chapter-##` |
| Scroll stack unit | **page** | `chapter--page-##` |
| Editorial text block | **richtext** | `richtext.njk` / `.richtext` |
| Grid composition | **mosaic** | `.mosaic` |
| Composition cell | **mosaic tile** | `.mosaic-tile` / `tiles:` in YAML |
| Small labeled badge | **pill** | `.pill` / `pill.njk` |

---

## Compilation Workflow (emerging — not yet fully formalized)

Two recognized modes. Neither has a complete prompt spec yet.

**Mode 1 — First compile** (cold read, YAML generated from scratch)
- Prompt: `COMPILE_PROMPTS.md` (exists, but stacking/nested span distinction not yet in it)
- Output: full `page.yml` + placements SCSS
- When to use: new page, no existing YAML

**Mode 2 — Delta / verification** (re-read against existing YAML)
- Prompt: not yet formalized — Claude.ai improvised the output format this session
- Output: `_docs/extract/figma-yaml-delta--<slug>.md` change document
- Claude Code applies confirmed changes only; never overwrites YAML wholesale
- When to use: design has evolved, YAML exists and is working
- Output format from session 3 was good — should be spec'd

**Gap: stacking vs nested span patterns** — documented in the delta doc but not yet in `COMPILE_PROMPTS.md`. Both modes need this.

---

## Open Priorities

### Formalize compilation workflow
- Add Delta Mode section to `COMPILE_PROMPTS.md` (output format, comparison logic)
- Promote stacking/nested span distinction into existing compile rules

### First-compile experiment
- Run Claude.ai on `inficon-impact-manager` cold (Mode 1, ignore existing `page.yml`)
- Compare output vs current YAML
- Goal: pressure-test `COMPILE_PROMPTS.md`, surface gaps the delta pass normalized away

### Build priorities
- Container query / responsiveness pass on mosaic
- Verify choreography fixes in browser at 1248px (both Chromium and WebKit)

### Deferred
- Token backlog: shadow system, alpha/overlay, frosted glass bg
- Mobile typography pass
- `_typography.scss` block-tier h1 override
- Comparison slider full design (BMTx)
- Arrow indicator system on mosaic tiles
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

## Rules

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
- First Figma→YAML run for INFICON: verification diff only — do not overwrite page.yml.
