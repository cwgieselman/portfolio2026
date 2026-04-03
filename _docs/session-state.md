# Session State
*Last updated: April 2, 2026*

> **THIS FILE IS AUTHORITATIVE STATE -- read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branch

`main` — all work merged and pushed

---

## Where We Are

`rehab/frame-bleed-rename` merged to main. Full architecture audit complete and all items resolved.

---

## What Was Completed This Session

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

## Open Priorities

### Figma → YAML verification (next Claude.ai session)
- Finish chapter-02 rebuild in Figma (Layouts--INFI)
- Claude.ai verification diff: read Figma, compare to current `page.yml`, return delta report
- Do NOT do a fresh full compile — page.yml is working, protect it
- After delta is reviewed, Claude Code applies confirmed changes

### Build priorities
- Resolve bento page stacking/accumulation in choreography
- Container query / responsiveness pass on mosaic
- Complete chapter-02 YAML once Figma is ready

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
