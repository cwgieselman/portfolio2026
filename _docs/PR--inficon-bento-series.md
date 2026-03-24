# PR: `build/inficon-bento-series` → `main`

### What this does
Gets Section 01 of the inficon-impact-manager case study page rendering and
scrolling correctly in the browser against the Figma reference. The full
two-chapter bento choreography — cells arriving on scroll, chapter overlap,
field text alignment, and sticky release timing — is working as intended.

### Why
The previous session established the YAML/Nunjucks/SCSS architecture for the
sections → chapters → pages hierarchy. This session resolved the remaining
rendering and choreography bugs that were preventing Section 01 from matching
the Figma scroll sequence.

---

### Changes by file

**`src/assets/js/choreography.js`**
- Chapter overlap: JS now reads `data-chapter-offset` on each `.layout__chapter`
  and applies `margin-top: -(offset × 192px)` to create the 1-row visual overlap
  between chapters.
- Per-chapter skeleton injection: `injectSkeletons()` now runs on the first bento
  of each chapter independently, scoped correctly to its own chapter's beats.
- Page wrapper height normalisation: all `.layout__page` wrappers within a chapter
  are set to `tallest bento height + 16px` (one gap). Previously hardcoded to 752px,
  which caused p02 (a 3-row, 560px bento) to release its sticky position too early.
- Chapter height formula: `(pageH × pageCount) + ((pageCount - 1) × vh)`. Each
  beat gets a full viewport height of scroll time to arrive.
- Observer registration: moved to a single `querySelectorAll('.bento--pending')`
  after all chapters are initialised, so all pending bentos across all chapters
  are observed.

**`src/_includes/layouts/compiled-page.njk`**
- `.chapter__text` now emits `data-field-text-row="{{ chapter.fieldTextRow | default(1) }}"`.
  This attribute drives the CSS offset that aligns chapter field text to the correct
  bento row.

**`src/assets/scss/_layout.scss`**
- Added `fieldTextRow` offset rules: `.chapter__text[data-field-text-row="2|3|4"]`
  with hard pixel values (`calc(var(--spacing-xl) + 192px)` etc.). Note: cannot use
  `var(--bento-cell-size)` or `var(--bento-gap)` here — those tokens are scoped to
  `.bento-grid` and do not inherit up the tree to `.chapter__text`.

**`src/assets/scss/placements/_inficon-impact-manager.scss`**
- Removed `align-self: start` from s01-c01-p02 article-02 (stat cell). Was
  collapsing the cell to content height instead of filling its 1×1 grid track.
- Added `overflow: visible` to `#bento--inficon--im--s01-c01-p03` (the bento grid)
  and its article-01 (the quote cell). Required for the selfie `::before`
  pseudo-element to escape the bento bounds.
- Changed selfie `::before` desktop position from `top: 0` to `top: -44px`.
  Per Figma: the selfie bridges rows 3 and 4, sitting 44px above the quote cell top,
  not flush with it.

**`src/_data/pages/inficon-impact-manager/page.yml`**
- Quote cell (s01-c01-p03 article-01): changed `theme: secondary-dark` to
  `theme: default`. Figma reference shows a white/default cell.

---

### What to verify

1. `npm start` builds without SCSS errors or Nunjucks errors.
2. At 1440px viewport, scroll through `/portfolio/inficon-impact-manager/` —
   chapter-01 beats arrive in order (p01 → p02 → p03), then chapter-02 beats
   (p01 → p02). No beat sticks longer than expected.
3. Chapter-01 p02 stat cell ("1 Week on-site") is square (176×176px). Check via
   DevTools → computed size on `[data-bento-cell="article-02"]` in
   `#bento--inficon--im--s01-c01-p02`.
4. Quote cell (`#bento--inficon--im--s01-c01-p03 [data-bento-cell="article-01"]`)
   has a white/default background, not yellow.
5. Selfie `::before` pseudo-element is visible to the left of the quote cell at
   desktop width, positioned above the quote cell top edge (not flush).
6. Chapter-02 field text ("The FAB was the brief…") aligns visually with row 2 of
   the chapter-02 bento, not row 1.
7. No references to the old hardcoded `bentoHeight = 752` remain in `choreography.js`.
8. `data-field-text-row` attribute is present on `.chapter__text` elements in
   rendered HTML. Check: `document.querySelectorAll('.chapter__text')` in DevTools.

### What this does NOT change
- Skeleton injection logic (still overcounts — deferred, the `injectSkeletons()`
  function runs but the result is not design-correct yet).
- Selfie scroll-away collision with chapter-01 field text — deferred, will be
  addressed with animation/fade as part of custom article work.
- Section 2 — not yet authored.
- Arrow indicators on bento cells — still deferred, `bento-arrow.njk` not yet deleted.
- `fieldTextRow` CSS rules for rows 3 and 4 exist but are untested.
