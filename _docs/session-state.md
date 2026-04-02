# Session State
*Last updated: April 1, 2026*

> **THIS FILE IS AUTHORITATIVE STATE — read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branch

`build/subgrid-chapter-layout` — active, uncommitted

---

## Where We Are

Long documentation and token cleanup session. The token pipeline is clean and
building correctly. CONTRACT.md, CLAUDE.md, and COMPILE_PROMPTS.md have all
been substantially updated to reflect the current architecture.

The page-header include, pill component, and YAML shape have been updated and
are ready to verify in the browser. `npm run tokens:build` needs to run before
any browser verification.

---

## What Was Completed This Session

### Docs
- CONTRACT.md rewritten — two-pipeline architecture, new Richtext shared
  contract, Mosaic correct (4-up, MONEY/MIN/MAX, 5 themes, Playfair Display),
  page-header and heading Pipeline A contracts, stale Bento Grid section
  replaced with Mosaic, Chapter Semantics Contract removed, executor
  content-cell section scoped to Pipeline B only
- CLAUDE.md rewritten — Token Studio decommissioned, correct token sync
  workflow, subheading tokens corrected, mosaic responsive model correct,
  five themes documented, FF Grid scoped to special-case only
- COMPILE_PROMPTS.md updated — §B rewritten for chapter/page/mosaic
  hierarchy, §H added (page-header, richtext/chapter--content, heading),
  executor pipeline explicitly scoped to Pipeline B only

### Figma
- `chapter--content` component renamed → `richtext`
- `space/content-rhythm/*` tokens renamed → `richtext/*` (component collection)
- Confirmed: all component references in INFI file point to CGDC library

### tokens.json + build pipeline
- Font primitives restructured: `font-family`/`font-weight`/`font-case`
  → `font.family`/`font.weight`/`font.case` (dot-path, matches Figma slash convention)
- All `{font-family.*}` and `{font-weight.*}` references updated throughout
- `component.space.content-rhythm` → `component.richtext`
- Four type token mismatches corrected to match Figma:
  - `type/pageTitle/size`: `scale.350` → `scale.175` (28px)
  - `type/pageTitle/lineHeight`: `scale.400` → `scale.300` (48px)
  - `type/subheading/size`: `scale.150` → `scale.125` (20px)
  - `type/subheading/weight`: `font.weight.semibold` → `font.weight.regular`
  - `type/eyebrow/lineHeight`: `scale.200` → `scale.125` (20px)
  - `type/subheading/lineHeight`: confirmed correct at `scale.250` (40px)
- Build script: removed stale `content-rhythm` special case, added `/` → `-`
  sanitization in fallback return (fixes `weight/bold` CSS var name)
- `npm start` builds clean — no SCSS errors

### Components
- `pill.njk` created — `<span class="pill">{{ pillParams.text }}</span>`
- `page-header.njk` rewritten:
  - Data binding: `data.header` → `data.pageHeader`
  - Eyebrow: handles `eyebrowType: "text"` and `eyebrowType: "pills"`
  - Pills loop through `pill.njk` include
- `_page-header.scss`:
  - `.page-header__chip` → `.pill`
  - Pill styles use `--type-pill-*` and `--color-pill-*` tokens
  - Headline uses `--type-pageTitle-*` tokens
  - Subhead corrected to Raleway Regular at `--type-subheading-*`
    (was PT Sans 16px — now Raleway Regular 20px/40px matching Figma)
- `_comparison-slider.scss`:
  - `--color-text-subtle` → `--color-body` + fineprint tokens on caption
  - Marked provisional — full design deferred to BMTx page work
- `inficon-impact-manager/page.yml`:
  - `header:` → `pageHeader:`
  - `eyebrow:` dot-string → `eyebrowType: "pills"` + `pills:` array

### Canonical vocabulary additions (locked)
- `richtext` — ordered sequence of typed prose blocks. Figma component,
  Nunjucks include, CSS class, component tokens all share this name.
  Replaces `chapter--content` everywhere.
- `pill` — small labeled badge. Taxonomy/categorization only.
  Replaces `chip` everywhere. `.pill` CSS class. `pill.njk` include.

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

### Immediate (this branch, before merge)
1. Run `npm run tokens:build` — regenerate SCSS from updated tokens.json
2. Run `npm start` — verify page-header renders correctly in browser:
   - Three pills in eyebrow
   - Headline at 28px Raleway Bold
   - Subhead at 20px Raleway Regular in secondary/70 yellow
3. `_typography.scss` block-tier h1 override — currently 40px/48px, sized for old
   56px desktop h1. With 28px desktop this makes mobile larger than desktop.
   Deferred pending mobile design pass — flag for next session.
4. CLAUDE.md typography table still documents h1 as 56px/64px — needs updating
   to reflect actual 28px/48px values now in tokens.

### Build priorities (after branch merge)
- Complete chapter-02 in INFI Figma, then fresh compile attempt
- Resolve bento page stacking/accumulation in choreography
  (pages translate in but don't lock to build composite)
- Container query / responsiveness pass on mosaic

### Deferred
- Token backlog: shadow system, alpha/overlay, frosted glass bg, scale/275
  line-height, em-based letter-spacing
- Mobile typography pass (block tier overrides)
- Comparison slider full design (BMTx page)
- Arrow indicator system on mosaic tiles
- Sticky-stack section navigation
- Playwright visual regression suite — maintain as changes land

---

## Token Architecture (locked)

- Token Studio: gone. Do not reinstall.
- Pull workflow: Claude.ai session + Figma MCP → write tokens.json →
  `npm run tokens:build`
- Font primitives: dot-path convention (`font.family.*`, `font.weight.*`,
  `font.case.*`) matching Figma slash convention
- `component.richtext.*` — spacing tokens for richtext component
- `component.mosaic.*` — theme and type tokens for mosaic
- Generated CSS vars: `--richtext-block`, `--richtext-continuation`,
  `--richtext-list-indent`, `--type-subheading-*`, `--type-pageTitle-*`

---

## Key Files

| File | State |
|------|-------|
| `tokens/tokens.json` | Updated this session — needs `npm run tokens:build` |
| `scripts/build-tokens-scss.mjs` | Updated — slash sanitization + stale special case removed |
| `CONTRACT.md` | Rewritten this session |
| `CLAUDE.md` | Rewritten this session |
| `scripts/COMPILE_PROMPTS.md` | Updated this session |
| `src/_includes/components/pill.njk` | New |
| `src/_includes/layouts/page-header.njk` | Rewritten |
| `src/assets/scss/components/_page-header.scss` | Updated |
| `src/assets/scss/components/_comparison-slider.scss` | Updated |
| `src/_data/pages/inficon-impact-manager/page.yml` | Updated |

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
- `str_replace` unreliable on tokens.json — use `write_file` as fallback.
