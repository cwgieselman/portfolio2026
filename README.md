# portfolio2026

UX, UI, and Design Systems portfolio for Craig Gieselman. Built with Figma, Eleventy, SCSS, and Claude.

Live: [cwgport26.netlify.app](https://cwgport26.netlify.app)

---

## Architecture

### Token pipeline

```
Figma Variables (CGDC-DS)
  ↓ scripts/figma-pull.mjs  [planned — see Token Pipeline section]
tokens/tokens.json  (DTCG format — hand-authored / pull-generated)
  ↓ npm run tokens:build  (scripts/build-tokens-scss.mjs)
src/assets/scss/_tokens--primitives.scss
src/assets/scss/_tokens--semantic.scss
src/assets/scss/_tokens--component.scss
  ↓ Eleventy SCSS compilation
_site/assets/css/main.css
```

### Content pipeline

```
Figma (layout source of truth)
  ↓ scripts/COMPILE_PROMPTS.md  (structured compile workflow)
src/_data/pages/<pageKey>/page.yml
  ↓ Eleventy + Nunjucks
_site/
```

### Design system hub

```
tokens/tokens.json
  ↓ src/_data/tokenDocs.js  (Eleventy data transform)
tokenDocs global  →  /design-system/  (token viewer + component gallery)
```

---

## Commands

| Command | Description |
|---|---|
| `npm start` | Build tokens, serve with hot reload |
| `npm run build` | Full production build |
| `npm run tokens:build` | Regenerate SCSS from `tokens/tokens.json` |
| `npm run tokens:pull` | Pull Figma variables → `tokens.json` *(script not yet built)* |
| `npm run test:visual` | Run visual regression tests (Playwright) |
| `npm run test:visual:check` | Check visual regression without updating snapshots |

---

## Token Pipeline

`tokens/tokens.json` is the canonical token source. It is authored in DTCG format and feeds both the CSS pipeline and the design system hub token viewer.

**Direction of truth:** Figma Variables own design decisions (color, semantic assignments, component themes). `tokens.json` owns structural logic (scale math, calc() expressions). These are different concerns and are handled separately by design.

**Scale token math is preserved in CSS output intentionally.** The build script emits `calc(var(--scale-base) * 1.75)` rather than resolving to `28px`. This allows the 2-column grid layout to override `--scale-base: 14px` and have all scale-derived tokens recalculate automatically. This is the primary architectural reason a custom build script was chosen over Style Dictionary (see below).

**`npm run tokens:pull`** — a Figma REST API pull script (`scripts/figma-pull.mjs`) is planned but not yet built. When complete it will selectively pull color, semantic, and component tokens from Figma Variables and write them to `tokens.json`, replacing the manual editing workflow for those token tiers. Scale tokens will remain hand-authored.

### Why not Style Dictionary?

[Style Dictionary](https://amzn.github.io/style-dictionary/) is the industry-standard open source token transform tool and was evaluated for this project.

The decision to use a custom build script instead (`scripts/build-tokens-scss.mjs`) was deliberate and specific:

Style Dictionary resolves token references to their computed values at build time. This means `{scale.base} * 1.75` becomes `28px` in the output. For this project that behavior would break the responsive scale override — the 2-column layout tier sets `--scale-base: 14px` to rebase the entire scale system at a smaller unit, and every derived scale token must cascade through that override via `calc()` at runtime. A Style Dictionary output of concrete values would make this impossible without a custom transform that essentially reimplements the same logic as the current script.

The current script is ~150 lines, purpose-built for this token structure, and produces exactly the output the system requires. Style Dictionary would add approximately 200kb of dependencies for no capability gain, and would require a custom transform to preserve the math expressions anyway.

The correct tool for multi-platform token pipelines (web, iOS, Android, JS constants) is Style Dictionary. This project has one platform. The custom script is the appropriate scope.

---

## Design System

`/design-system/` — live token viewer and component gallery (component gallery currently mothballed). Tokens sourced directly from `tokens/tokens.json` via Eleventy data transform. Never manually maintained — accuracy is automatic after a `tokens:build` run.

Full vision and roadmap: `_docs/DESIGN-SYSTEM-HUB-VISION.md`

---

## Font Stack

| Role | Font | Weights | Source |
|---|---|---|---|
| Brand / UI / Headings | Raleway | 400, 600, 700 | Google Fonts |
| Body / Readable text | PT Sans | 400, 700 | Google Fonts |
| Display / Stats | Playfair Display | 700 | Google Fonts |
| Monospace / Code | Courier Prime | 400, 400i | Google Fonts |

---

## System Vocabulary

The editorial structure follows a book metaphor throughout — in code, YAML, templates, and conversation.

| Concept | Name | CSS class / YAML key |
|---|---|---|
| Whole case study | Story | `layout__story` |
| Narrative unit | Chapter | `layout__chapter` |
| Scroll stack unit | Page | `pages:` in YAML |
| Grid composition | Mosaic | `.mosaic` |
| Composition cell | Mosaic tile | `.mosaic-tile` / `tiles:` in YAML |

YAML key `tiles:` maps to HTML `<article>` elements. Intentional semantic split — documented in `CONTRACT.md`.

---

## Branch Naming

| Prefix | Purpose |
|---|---|
| `rehab/` | Restore structural integrity, eliminate drift |
| `stabilize/` | Contract alignment, systemic corrections |
| `build/` | New feature work |
| `experiment/` | Prototypes and exploratory work |

---

## Key Docs

| File | Purpose |
|---|---|
| `CONTRACT.md` | Normative render contract — component APIs, all invariants |
| `CLAUDE.md` | Claude Code instructions and project conventions |
| `scripts/COMPILE_PROMPTS.md` | Figma → YAML compile workflow |
| `tokens/TOKEN-BACKLOG.md` | Candidate and deferred token additions |
| `_docs/token-backlog-figma.md` | Token decisions requiring Figma design work first |
| `_docs/DESIGN-SYSTEM-HUB-VISION.md` | DS hub vision and roadmap |
| `_docs/session-state.md` | Authoritative current build state (read before every session) |
| `_docs/WORKFLOW.md` | Two-phase Claude.ai + Claude Code workflow |
