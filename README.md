# portfolio2026
UX, UI, and Design Systems portfolio for Craig Gieselman. Built with Figma, Claude, and 11ty.

---

## Active Page

`/portfolio/bmtx-nextgen/`

All other legacy pages are quarantined and not part of the active system.

---

## Architecture

```
Figma (Token Studio) → tokens/tokens.json
  ↓ npm run tokens:build
src/assets/scss/_tokens--*.scss
  ↓ 11ty (native SCSS compilation)
_site/assets/css/main.css
```

```
Figma JSON (design intent)
  ↓ COMPILE_PROMPTS.md workflow
src/_data/pages/<pageKey>/page.yml
  ↓ Eleventy + Nunjucks
_site/
```

---

## Commands

| Command | Description |
|---|---|
| `npm start` | Build tokens, serve with hot reload |
| `npm run build` | Full production build |
| `npm run tokens:build` | Regenerate SCSS from `tokens/tokens.json` |

---

## Token Sync (Figma → GitHub)

1. Update variables in Figma via Token Studio plugin
2. Push to `tokens/sync` branch from the plugin
3. GitHub Action runs `tokens:build`, commits generated SCSS, opens PR
4. Review and merge

Token Studio sync settings: repo `cwgieselman/portfolio2026`, branch `tokens/sync`, file `tokens/tokens.json`.

---

## Key Docs

| File | Purpose |
|---|---|
| `CONTRACT.md` | Normative render contract — component APIs, executor rules, all invariants |
| `scripts/COMPILE_PROMPTS.md` | Figma JSON → YAML compile workflow |
| `CLAUDE.md` | Claude Code instructions and project conventions |
| `tokens/TOKEN-BACKLOG.md` | Candidate and deferred token additions |

---

## Components

### Executor Pipeline (compiled pages)

Routed through `layouts/content-cell.njk`. Safelisted includes only:

| Component | Include |
|---|---|
| Header | `components/header.njk` |
| Richtext | `components/richtext.njk` |
| Figure | `components/figure.njk` |
| Link Block | `components/link-block.njk` |
| Link | `components/link.njk` |

### Standalone Components (non-executor)

Used directly in page templates or test pages outside the compiled-page pipeline.

| Component | Template | Data Source |
|---|---|---|
| Bento Grid | `components/bento-grid.njk` | YAML via `src/_data/*.yml` |
| Comparison Slider | `components/comparison-slider.njk` | Macro params |
| Annotation Toggle | `components/annotation-toggle.njk` | Macro params |

**Bento Grid** — editorial grid for process/discovery layouts. Four named themes (`primary-dark`, `primary-light`, `secondary-dark`, `secondary-light`). Five scoped typography span classes (`bento-type--*`). Stat cells use Tienne Bold display font. Full API in `bento-grid.njk` file header and `CLAUDE.md`.

---

## Branch Naming

| Prefix | Purpose |
|---|---|
| `rehab/` | Restore structural integrity, eliminate drift |
| `stabilize/` | Contract alignment, systemic corrections |
| `build/` | New feature work |
| `experiment/` | Prototypes and exploratory work |
