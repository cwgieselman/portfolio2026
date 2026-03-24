# PR: `build/inficon-bento-series` → `main`

### What this does
Refactors the compiled page YAML architecture and supporting templates for
clarity, consistency, and correctness. No visual changes — this is a
vocabulary and structure pass on Layer 1 of the system.

### Why
The post-commit review of the YAML revealed several issues: the h1 header was
entangled inside section-01 rather than belonging to the page; a redundant
`cells:` wrapper existed at page level; `cells:` inside the bento conflicted
with the same word one level up; article types were inconsistently represented;
and the `white` theme token was a synonym for `default` with no reason to be
named differently.

---

### Changes by file

**`src/_data/pages/inficon-impact-manager/page.yml`**
- `header:` moved from inside `sections[0]` to a top-level page key
- Outer `cells:` wrapper removed from every page — `wrapper` and `bento` are
  now direct keys on each page object
- `cells:` inside every `bento:` block renamed to `articles:`
- `theme:` added to all image articles (was previously omitted — now required
  on all article types)
- Selfie article updated: `type: custom`, `variant: selfie`, `description:`
  added, `custom: true` flag removed
- Verbose architecture comment block removed — lives in `_docs/YAML-architecture.md`
- All existing `theme: white` references updated to `theme: default`

**`src/inficon-impact-manager/index.njk`**
- Header block emitted here, above the compiled-page include, reading from
  `data.header` (top-level page key)

**`src/_includes/layouts/compiled-page.njk`**
- Header block removed from the sections loop entirely
- `{% set cells = pageItem.cells %}` replaced with `{% set cell = pageItem %}`

**`src/_includes/layouts/page.njk`**
- Loop over `cells` removed — now a thin wrapper that includes
  `content-cell.njk` once with `cell` already set by compiled-page

**`src/_includes/components/bento-grid.njk`**
- `{% for cell in bento.cells %}` → `{% for cell in bento.articles %}`

**`tokens/tokens.json`**
- `component.bento.theme.white` renamed to `component.bento.theme.default`

**`src/assets/scss/components/_bento-grid.scss`**
- `.bento-cell--theme-white` renamed to `.bento-cell--theme-default`
- Token references updated to `--bento-theme-default-*`

**`_docs/YAML-architecture.md`** *(new file)*
- Full authoring reference for the compiled page YAML format
- Covers all levels: page, header, section, skeleton, chapter, page, bento,
  article (all types), media, typography spans, and theme reference table

---

### What to verify

1. `npm run tokens:build` runs without errors and regenerates
   `src/assets/scss/_tokens--component.scss` with `--bento-theme-default-*`
   replacing `--bento-theme-white-*`.
2. `npm start` builds without SCSS or Nunjucks errors.
3. `/portfolio/inficon-impact-manager/` renders correctly — visual output
   unchanged from previous commit.
4. In DevTools: `document.querySelector('h1').closest('section')` returns
   `null` (h1 is not inside a section element).
5. In DevTools: `document.querySelectorAll('.bento-grid').length` returns `5`.
6. In DevTools: `document.querySelectorAll('.bento-cell').length` returns a
   non-zero number with no Nunjucks error `<pre>` elements on the page.
7. Confirm no references to `bento-cell--theme-white` remain in any SCSS file.
8. Confirm no references to `bento.cells` remain in any Nunjucks template.
9. Confirm `_docs/YAML-architecture.md` exists and is readable.

### What this does NOT change
- Visual output — no design changes in this PR
- Choreography JS — untouched
- Any other page's YAML or templates
- Token Studio sync branch — `tokens/tokens.json` updated directly;
  Token Studio should be updated to match on next Figma session
