# Session State
*Last updated: March 31, 2026 — Claude Code review pass*

> **THIS FILE IS AUTHORITATIVE STATE — read it before touching anything.**
> Both Claude.ai and Claude Code read this file.
> Every session ends by updating it. No exceptions.

---

## Branches

All previous branches — merged to main ✓
`build/figma-pull-script` — committed, merge pending (Claude Code)
`build/token-system-cleanup` — committed, merge pending (Craig)

---

## Where We Are

Long tokens session — complete. Craig is done for the night.

Figma variable layer is complete and clean. Craig can now go through
and bind Text Styles and Color Styles to the variables without making
decisions at the same time.

---

## What Was Completed This Session

- Token Studio fully decommissioned
- Figma variables cleaned — no duplicates, correct structure
- Font stack: Raleway · PT Sans · Playfair Display · Courier Prime
- Vocabulary rename: bento→mosaic, layout__narrative→layout__story
- Zed LSP config, tokens:pull placeholder
- tokenDocs.js Eleventy data transform — token viewer wired
- DESIGN-SYSTEM-HUB-VISION.md written
- README.md rewritten with Style Dictionary decision record
- figma-pull.mjs written (REST API blocked by Figma plan — Enterprise only)
- Live Figma pull via Claude.ai + Figma MCP — proved working
- tokens.json updated with live pull data
- Semantic variables created in Figma: color/focus, type/subheading/*,
  type/*/color tokens, type/ctaLink/weight/*
- tokens.json: color/body canonical, pill tokens, subheading tokens,
  button/CTA color tokens, accent/50 added
- PR doc written for Claude Code: build/token-system-cleanup

---

## Canonical Vocabulary (locked)

| Concept | Name | CSS / YAML |
|---|---|---|
| Whole case study | **story** | `layout__story` |
| Narrative unit | **chapter** | unchanged |
| Scroll stack unit | **page** | `pages:` in YAML |
| Grid composition | **mosaic** | `.mosaic` |
| Composition cell | **mosaic-tile** | `.mosaic-tile` / `tiles:` in YAML |

---

## Token Architecture (locked)

- Token Studio: gone
- Pull script: `scripts/figma-pull.mjs` exists but REST API requires Enterprise plan
- Working pull workflow: Claude.ai session → `use_figma` reads variables →
  filesystem MCP writes tokens.json → `npm run tokens:build`
- Direction: Figma owns color/semantic/component. Code owns scale math.
- Font stack keys in tokens.json still use hyphenated format (`font-weight`,
  `font-family`) — needs alignment with Figma slash-path convention next session

---

## Figma Variable State (end of session)

All three collections complete:

**Primitives** — color ramps (primary 9, secondary 9, neutral 5, accent 1),
scale math (hand-authored, never pulled), font families, font weights

**Semantic** — space, radius, color (bg, body, focus, heading, eyebrow, link,
pill*, button*, CTA*), type (paragraph, pageTitle, sectionHeading, subheading,
fineprint, eyebrow, paragraphLead, ctaLink, pill)

**Component** — mosaic themes (5), mosaic type, content-rhythm

**Next step for Craig in Figma:**
1. Create Text Styles, bind to semantic type variables
2. Create Color Styles, bind to semantic color variables
3. Then bind components to styles

---

## Open Priorities

### 1. Font primitive key alignment (next tokens session)
`font-weight` and `font-family` keys in tokens.json use hyphens.
Figma slash-path convention translates to dots: `font.weight`, `font.family`.
The pull script skip list uses `font` as the top-level skip — these are
excluded from pulls. This naming drift means type tokens pulled from Figma
that reference `{font.weight.regular}` won't resolve in the build script
which looks for `{font-weight.regular}`.

Fix: rename keys in tokens.json + update all internal references +
update `refToCssVar()` in build-tokens-scss.mjs. Then remove font/* from
pull skip list so font primitives can be pulled too.

### 2. Type token size alignment (needs Craig decision in Figma)

Four type tokens in tokens.json do not match what the PR doc says Figma holds.
Claude Code left these as-is because the Figma values conflict with the CLAUDE.md
typography table and applying them would visually break h1 (28px vs 56px).

**Suspected mismatches — verify in Figma variable panel:**
- `type/eyebrow/lineHeight` — SCSS: `scale/200` (32px), PR doc says Figma: `scale/125` (20px)
- `type/pageTitle/size` — SCSS: `scale/350` (56px), PR doc says Figma: `scale/175` (28px) ⚠️
- `type/pageTitle/lineHeight` — SCSS: `scale/400` (64px), PR doc says Figma: `scale/300` (48px) ⚠️
- `type/subheading/lineHeight` — SCSS: `scale/300` (48px), PR doc says Figma: `scale/250` (40px)

The pageTitle values are especially suspect — 28px h1 would be a major regression.
Check the Figma variable panel and update tokens.json accordingly, then `npm run tokens:build`.

### 3. Orphaned token — `--color-text-subtle`

`src/assets/scss/components/_comparison-slider.scss:175` references `--color-text-subtle`
but this token is not in tokens.json and is not emitted by the build. It silently fails.
Either add it to tokens.json or replace the reference with an existing token.

### 4. Token backlog items (need Figma design decisions)
- Shadow system (item 1)
- Alpha/overlay color (item 2)
- Frosted glass bg token (item 3)
- Scale/275 line-height (item 4)
- Em-based letter-spacing (item 5)
- DS hub UI redesign (item 6 — defer)

### 4. Build priorities
- Micro-alignment inside mosaic + chapter gap
- Field text extended page approach
- Section 2 content

---

## Deferred

- DS hub component gallery revival
- DS hub YAML builder
- Page header detached-on-load behavior
- Sticky-stack section navigation
- Section 2 content
- Skeletons re-enabled

---

## Key Files

| File | State |
|------|-------|
| `tokens/tokens.json` | Updated tonight — commit pending (Claude Code) |
| `scripts/figma-pull.mjs` | Written — REST API requires Enterprise plan |
| `scripts/build-tokens-scss.mjs` | Working |
| `src/_data/tokenDocs.js` | Live — token viewer works |
| `src/design-system/index.njk` | Token viewer wired |
| `src/_includes/layouts/base.njk` | Playfair Display + Courier Prime |
| `README.md` | Rewritten — Style Dictionary decision record |
| `_docs/DESIGN-SYSTEM-HUB-VISION.md` | Written |

---

## Figma Reference

| File | Key |
|------|-----|
| CGDC-DS | `zOZ13bdI68LuugJklgohm2` |
| Layouts--INFI | `LTePGo8Q1Lbapffom2X0W5` |
| BMTx compile-ready | `REMxlDlqN4otxhfoUuYi5c` |

---

## Rules

- Read Figma metadata before writing CSS. One change at a time. Verify in Chrome.
- Session ends: PR doc → Claude Code commits, OR this file updated.
- Scale tokens stay as math expressions. Figma pull skips scale.
- Token Studio is gone. Do not reinstall.
- Style Dictionary evaluated and deliberately not adopted — see README.
- `--color-text` is retired. Use `--color-body`.
- YAML `tiles:` → HTML `<article>`. In CONTRACT.
- Figma pull (Enterprise-gated REST API) → use Claude.ai + Figma MCP instead.
