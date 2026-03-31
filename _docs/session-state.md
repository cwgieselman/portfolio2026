# Session State
*Last updated: March 31, 2026*

> **THIS FILE IS AUTHORITATIVE STATE — read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branches

`rehab/markup-choreography-cleanup` — committed, pushed. PR done.
`stabilize/custom-variant-contract` — committed, pushed. PR done.
`rehab/vocabulary-rename` — committed, pushed. PR done.
`rehab/font-stack-update` — **Claude Code working on this now.** `npm run tokens:build`, verify Playfair Display + Courier Prime in output, commit.

---

## Where We Are

Long tokens session. Significant ground covered:

**Completed this session:**
- Token Studio fully decommissioned — plugin data blob wiped from CGDC-DS, plugin removed from account
- Figma variables cleaned — duplicates deleted, `/web/` namespace stripped, `bento→mosaic` renamed, `letterSpacing` casing standardized, `font/family/display` restored, `font/family/mono` added
- Font stack updated — Tienne → Playfair Display (700 only), `monospace` system → Courier Prime (400 + italic). Both in `base.njk` `<link>` tag and `tokens.json`
- `tokens.json` updated — `font-family.display: Playfair Display`, `font-family.mono: Courier Prime`, `cta→ctaLink` rename, `eyebrow.letterSpacing` casing fix
- Vocabulary rename — bento→mosaic, layout__narrative→layout__story. Committed via Claude Code.
- `.zed/settings.json` created — Design Tokens LSP wired to `tokens/tokens.json`
- `package.json` — `tokens:pull` script added as placeholder
- Design System Hub — token viewer wired to `tokens/tokens.json` via Eleventy data transform
- Vision doc written — `_docs/DESIGN-SYSTEM-HUB-VISION.md`

**Architecture decisions locked:**
- Token Studio gone. Pipeline: `tokens/tokens.json` → `build-tokens-scss.mjs` → CSS
- `tokens:pull` (figma-pull.mjs) — planned, not yet built. Figma variables are clean and ready.
- Direction of truth: Figma owns color/semantic/component. Code owns scale math.
- Print tokens: additive `@media print` overrides in SCSS. No `/web/` namespace.
- Font stack: Raleway (brand) · PT Sans (plain) · Playfair Display (display) · Courier Prime (mono)

---

## Canonical Vocabulary (locked)

| Concept | Name | Notes |
|---|---|---|
| Whole case study | **story** | `layout__story` in CSS |
| Narrative unit | **chapter** | unchanged |
| Scroll stack unit | **page** | unchanged |
| Grid composition | **mosaic** | was bento-grid |
| Composition cell | **mosaic-tile** | was bento-cell, renders as `<article>` |

---

## Design System Hub — Current State

Token viewer is now wired to `tokens/tokens.json` via `src/_data/tokenDocs.js`.
- `tokenDocs.js` — Eleventy data transform. Reads tokens.json, produces flat token array.
- `index.njk` — `{{ tokenDocs | dump | safe }}` injected via `<script id="ds-token-data">`. Hardcoded array removed.
- Component gallery — mothballed (commented out). Ready to revive on a future branch.
- Vision + roadmap — `_docs/DESIGN-SYSTEM-HUB-VISION.md`

**After `rehab/font-stack-update` merges:** Token page will show Playfair Display and Courier Prime correctly in the typography section.

---

## Open Priorities

### 1. `rehab/font-stack-update` — Claude Code in progress
Run `npm run tokens:build`. Verify `_tokens--primitives.scss` has `--font-family-display: Playfair Display` and `--font-family-mono: Courier Prime`. No `Tienne` anywhere. Commit.

### 2. Token viewer verification (after font branch merges)
Open `/design-system/` in browser. Verify:
- Typography section shows Playfair Display and Courier Prime with correct previews
- No `bento` references anywhere in token names
- Color swatches rendering
- Alias tokens showing resolved colors

### 3. figma-pull.mjs (next tokens session)
Figma variables are clean. Script needed. Selective pull: color/semantic/component from Figma, skip scale. ~120 lines of Node.

### 4. Token backlog items (still open)
- Shadow system (item 1) — design in Figma first
- Alpha/overlay color (item 2)
- Frosted glass bg token (item 3)
- Scale/275 line-height decision (item 4)
- Em-based letter-spacing (item 5)
- DS hub UI redesign (item 6 — defer to rebuild)

### 5. Micro-alignment inside mosaic + chapter gap (build priority)
- Micro-alignment issues inside mosaic tiles
- Gap between C01 and C02 — `chapterOffset` negative margin logic

### 6. Field text — extended page approach
`.layout__page--extended` spanning `content-start / bento-end`. `chapter__content` removal.

---

## Deferred

- **figma-pull.mjs** — next tokens session
- **DS hub component gallery revival** — future branch
- **DS hub YAML builder** — future branch (spec in Figma first)
- **Page header detached-on-load behavior**
- **Sticky-stack section navigation** — after all three case studies compiled
- **Section 2** — not yet authored
- **Skeletons** — re-enable after Section 2

---

## Key Files

| File | State |
|------|-------|
| `tokens/tokens.json` | Playfair Display + Courier Prime. mosaic vocabulary. ctaLink. |
| `src/_data/tokenDocs.js` | NEW — Eleventy data transform for token viewer |
| `src/design-system/index.njk` | Token viewer wired to tokenDocs. Hardcoded array removed. |
| `src/_includes/layouts/base.njk` | Playfair Display + Courier Prime in Google Fonts link |
| `.zed/settings.json` | NEW — Design Tokens LSP config |
| `_docs/DESIGN-SYSTEM-HUB-VISION.md` | NEW — DS hub vision + roadmap |
| `src/assets/js/choreography.js` | `layout__story` selectors, mosaic vocabulary |
| `src/assets/scss/components/_mosaic.scss` | mosaic system (was _bento-grid.scss) |
| `CONTRACT.md` | vocabulary section updated |

---

## Figma Reference

| File | Key |
|------|-----|
| CGDC-DS | `zOZ13bdI68LuugJklgohm2` |
| Layouts--INFI | `LTePGo8Q1Lbapffom2X0W5` |
| BMTx compile-ready | `REMxlDlqN4otxhfoUuYi5c` |

---

## Rules (learned the hard way)

- Read Figma metadata before writing CSS.
- Verify in Chrome before declaring anything done.
- One change at a time. Verify, then move.
- Session ends: PR doc written → Claude Code commits, OR this file updated.
- Scale tokens stay in tokens.json as math expressions — Figma stores resolved values.
- Figma pull script pulls color/semantic/component only — scale is code-side.
- YAML key `tiles:` maps to HTML `<article>` elements — intentional, in CONTRACT.
- Token Studio is gone. Do not reinstall. Do not reference it in new docs.
