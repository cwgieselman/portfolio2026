# Session State
*Last updated: March 31, 2026*

> **THIS FILE IS AUTHORITATIVE STATE — read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branches

All previous branches — merged to main ✓
`build/figma-pull-script` — merged to main ✓

---

## Where We Are

Tokens session. The full token pipeline cycle is now complete:

```
Figma Variables (CGDC-DS)
  ↓ npm run tokens:pull  (scripts/figma-pull.mjs — NEW, ready to commit)
tokens/tokens.json
  ↓ npm run tokens:build
src/assets/scss/_tokens--*.scss
  ↓ Eleventy
CSS
```

Craig is in Figma building Text Styles and Color Styles using the clean variable system.

---

## What's Done This Session (full list)

- Token Studio fully decommissioned — plugin blob wiped, plugin removed
- Figma variables cleaned — no duplicates, correct structure, mosaic vocabulary
- Font stack finalized — Raleway · PT Sans · Playfair Display · Courier Prime
- `tokens.json` updated — Playfair Display, Courier Prime, ctaLink, letterSpacing fix
- Vocabulary rename — bento→mosaic, layout__narrative→layout__story (all files)
- `.zed/settings.json` — Design Tokens LSP wired
- `package.json` — `tokens:pull` script registered
- `src/_data/tokenDocs.js` — Eleventy data transform for token viewer
- `src/design-system/index.njk` — token viewer wired to tokenDocs, hardcoded array removed
- `_docs/DESIGN-SYSTEM-HUB-VISION.md` — vision and roadmap written
- `README.md` — complete rewrite with current pipeline, Style Dictionary decision record
- `scripts/figma-pull.mjs` — NEW. Figma REST API pull script. Ready to commit.

---

## Canonical Vocabulary (locked)

| Concept | Name | CSS / YAML |
|---|---|---|
| Whole case study | **story** | `layout__story` |
| Narrative unit | **chapter** | unchanged |
| Scroll stack unit | **page** | `pages:` in YAML |
| Grid composition | **mosaic** | `.mosaic` |
| Composition cell | **mosaic-tile** | `.mosaic-tile` / `tiles:` in YAML |

YAML `tiles:` → HTML `<article>`. Intentional split. Documented in CONTRACT.

---

## Design System Hub

Token viewer live at `/design-system/`. Sourced from `tokens/tokens.json` via `tokenDocs.js`.
Component gallery mothballed — ready to revive.
Vision at `_docs/DESIGN-SYSTEM-HUB-VISION.md`.

---

## Open Priorities

### 1. First live pull test
Run: `FIGMA_TOKEN=your_pat npm run tokens:pull`
Verify: pulled/skipped counts look right. `primitives.scale` unchanged.
Then: `npm run tokens:build` — no errors.
Then: open `/design-system/` — token viewer still renders correctly.

### 3. Token backlog items (need Figma design decisions)
- Shadow system (item 1) — design in Figma, then add to pull
- Alpha/overlay color (item 2)
- Frosted glass bg token (item 3)
- Scale/275 line-height decision (item 4) — quick Figma check
- Em-based letter-spacing (item 5)
- DS hub UI redesign (item 6 — defer to rebuild)

### 4. Build priorities (separate from tokens)
- Micro-alignment inside mosaic + chapter gap
- Field text extended page approach (`.layout__page--extended`)
- Section 2 content authoring

---

## Deferred

- **DS hub component gallery revival** — future branch
- **DS hub YAML builder** — spec in Figma first
- **Page header detached-on-load behavior**
- **Sticky-stack section navigation**
- **Section 2 authored content**
- **Skeletons re-enabled**

---

## Key Files

| File | State |
|------|-------|
| `scripts/figma-pull.mjs` | NEW — ready to commit |
| `scripts/build-tokens-scss.mjs` | Working. Run via `npm run tokens:build`. |
| `tokens/tokens.json` | Authoritative. Playfair Display, Courier Prime, mosaic vocab. |
| `src/_data/tokenDocs.js` | Eleventy data transform for token viewer |
| `src/design-system/index.njk` | Token viewer wired to tokenDocs |
| `src/_includes/layouts/base.njk` | Playfair Display + Courier Prime in Google Fonts |
| `.zed/settings.json` | Design Tokens LSP → tokens/tokens.json |
| `README.md` | Rewritten — current pipeline + Style Dictionary decision |
| `_docs/DESIGN-SYSTEM-HUB-VISION.md` | DS hub vision + roadmap |

---

## Figma Reference

| File | Key |
|------|-----|
| CGDC-DS | `zOZ13bdI68LuugJklgohm2` |
| Layouts--INFI | `LTePGo8Q1Lbapffom2X0W5` |
| BMTx compile-ready | `REMxlDlqN4otxhfoUuYi5c` |

---

## Rules (learned the hard way)

- Read Figma metadata before writing CSS. `get_metadata` first, every time.
- Verify in Chrome before declaring anything done. One change at a time.
- Session ends: PR doc written → Claude Code commits, OR this file updated.
- Scale tokens stay in tokens.json as math expressions. Figma stores resolved values.
- Pull script pulls color/semantic/component only. Scale is code-side truth.
- YAML `tiles:` → HTML `<article>`. Intentional. In CONTRACT.
- Token Studio is gone. Do not reinstall. Do not reference in new docs.
- Style Dictionary was evaluated and deliberately not adopted — see README.
