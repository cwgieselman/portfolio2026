# PR: `build/inficon-bento-series` → `main`

### What this does
Renames `.chapter__text` to `.chapter__content` across the template and SCSS,
and removes inline `style="grid-area: ..."` attributes from all bento article
elements. No visual changes.

### Why
`.chapter__content` is the correct name — the left column will hold more than
text once richtext is wired in. The inline grid-area style was a shortcut that
duplicated placement information already owned by the placements SCSS. Removing
it makes the placements SCSS the single source of truth for all grid positioning.

---

### Changes by file

**`src/_includes/layouts/compiled-page.njk`**
- `class="chapter__text"` → `class="chapter__content"`
- `data-field-text-row` → `data-content-row`

**`src/assets/scss/_layout.scss`**
- `.chapter__text` → `.chapter__content` throughout
- `grid-area: text` → `grid-area: content`
- `grid-template-areas: "text bento bento"` → `"content bento bento"`
- `data-field-text-row` → `data-content-row` on all attribute selectors
- Comment block updated to match

**`src/_includes/components/bento-grid.njk`**
- `style="grid-area: {{ areaName }}"` removed from all three `<article>` render
  paths (desktop image, scrollable image, standard cell)

---

### What to verify

1. `npm start` builds without SCSS or Nunjucks errors.
2. `/portfolio/inficon-impact-manager/` renders and scrolls correctly —
   visual output unchanged.
3. In DevTools: `document.querySelectorAll('.chapter__content').length`
   returns `2`.
4. In DevTools: `document.querySelectorAll('.chapter__text').length`
   returns `0`.
5. In DevTools: confirm no `.bento-cell` elements have an inline `style`
   attribute containing `grid-area` (skeleton cells injected by JS are
   exempt — check only rendered HTML article elements):
   `Array.from(document.querySelectorAll('article.bento-cell:not(.bento-cell--skeleton)')).filter(el => el.style.gridArea).length`
   should return `0`.
6. Confirm no references to `chapter__text` remain in any template or SCSS file.
7. Confirm no references to `data-field-text-row` remain in any template or
   SCSS file.

### What this does NOT change
- YAML — no changes
- Choreography JS — no changes
- Placements SCSS — no changes (grid-area rules already live there via
  data-bento-cell attribute selectors)
- Any other page templates or styles
