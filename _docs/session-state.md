# Session State
*Last updated: April 2, 2026*

> **THIS FILE IS AUTHORITATIVE STATE -- read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branch

`build/custom-tile-selector-convention` -- committed, ready to merge to main

---

## Where We Are

All 9 commits complete. Branch is clean and ready for PR merge.

---

## What Was Completed This Session (Claude Code review pass)

### Contract and model corrections
- `graphic` tile type fully removed — was dead code contradicting CONTRACT.md and CLAUDE.md.
  Removed from mosaic.njk, _mosaic.scss, component-docs/mosaic.yml, COMPILE_PROMPTS.md.
- `custom` tile type corrected from standalone `type:` value to additive boolean.
  YAML: `type: content` + `custom: true` + `variant: "selfie"`. No `.mosaic-tile--custom`
  CSS class emitted. All extended behavior lives on `[data-mosaic-variant]` selectors.
- `justify-content: center` moved to `.mosaic-tile__inner` base — all tiles centered by
  default. `.mosaic-tile--custom .mosaic-tile__inner` block removed.
- CONTRACT.md, CLAUDE.md, YAML-architecture.md, COMPILE_PROMPTS.md, component-docs/mosaic.yml
  all updated to reflect the corrected model.
- PR doc Commit 8 description corrected (centering is inherited, not added to placement).
- `compiled-page.njk` stale "bento pages" comment removed.

### Deferred to stabilize/mosaic-tile-model (next branch)
- Full `frame`/`bleed` rename (YAML + CSS) to align with Figma terminology
- `artDirection` and `scrollable` refactored from tile-level to figure-level properties

---

## Canonical Vocabulary (locked)

| Concept | Name | CSS / YAML |
|---|---|---|
| Whole case study | **story** | `layout__story` |
| Narrative unit | **chapter** | `chapter-##` |
| Scroll stack unit | **page** | `chapter--page-##` |
| Editorial text block | **richtext** | `richtext.njk` / `.richtext` |
| Grid composition | **mosaic** | `.mosaic` |
| Composition cell | **mosaic-tile** | `.mosaic-tile` / `tiles:` in YAML |
| Small labeled badge | **pill** | `.pill` / `pill.njk` |

---

## Open Priorities

### Next branch: stabilize/mosaic-tile-model
- Rename `content`/`image` → `frame`/`bleed` throughout YAML + CSS (Figma-aligned)
- Refactor `artDirection`/`scrollable` from tile-level to figure-level (scoped to `.mosaic-tile figure`)
- CSS: `data-mosaic-display` attributes on two-sibling scrollable articles (replace class-based show/hide)

### Build priorities (after merge)
- Complete chapter-02 in INFI Figma, then fresh compile attempt
- Resolve bento page stacking/accumulation in choreography
- Container query / responsiveness pass on mosaic

### Deferred
- Token backlog: shadow system, alpha/overlay, frosted glass bg
- Mobile typography pass
- _typography.scss block-tier h1 override
- Comparison slider full design (BMTx)
- Arrow indicator system on mosaic tiles
- Sticky-stack section navigation
- Playwright visual regression suite

---

## Key Files Changed This Branch

| File | Commits |
|------|---------|
| `tokens/tokens.json` | 1 |
| `src/assets/scss/_tokens--semantic.scss` | 1 |
| `src/_includes/components/richtext.njk` | 2 |
| `src/assets/scss/components/_richtext.scss` | 2 (new) |
| `src/_includes/layouts/compiled-page.njk` | 2, 9 |
| `src/assets/scss/_layout.scss` | 2 |
| `src/assets/scss/main.scss` | 2 |
| `src/assets/scss/placements/_inficon-impact-manager.scss` | 3 |
| `src/_includes/components/mosaic.njk` | 4 |
| `src/assets/scss/components/_mosaic.scss` | 4 |
| `src/_data/pages/inficon-impact-manager/page.yml` | 4 |
| `CONTRACT.md` | 5 |
| `scripts/COMPILE_PROMPTS.md` | 6 |
| `CLAUDE.md` | 7 |
| `_docs/YAML-architecture.md` | 8 |
| `src/_data/component-docs/mosaic.yml` | 8 |

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
- Session ends: PR doc -> Claude Code commits, OR this file updated.
- Scale tokens stay as math expressions.
- Token Studio is gone. Do not reinstall.
- `--color-text` and `--color-text-subtle` are retired. Use `--color-body`.
- YAML `tiles:` -> HTML `<article>`. In CONTRACT.
- Figma REST API is Enterprise-gated. Use Claude.ai + Figma MCP instead.
- `str_replace` unreliable on files with Unicode box-drawing characters -- use `write_file`.
- Custom tile extended behavior uses `[data-mosaic-variant]` not `[data-mosaic-tile]`.
- 1px dashed border on topmost node of any CGDC component = Figma annotation. Never compile.
- Figma is source of truth. Codebase must match Figma, not the other way around.
- richtext.njk is the single rendering path for all long-form text. No raw <p> in templates.
- `custom: true` is an additive boolean on `type: content | image`. Not a standalone type.
  No `.mosaic-tile--custom` class. Extended behavior lives on `[data-mosaic-variant]`.
- `justify-content: center` is axiomatic on `.mosaic-tile__inner`. Override in placements only.
- Next tile model rename: `content` → `frame`, `image` → `bleed` (on stabilize/mosaic-tile-model).
