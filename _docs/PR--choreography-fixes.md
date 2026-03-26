# PR — choreography-fixes
*Branch: build/inficon-bento-series*

## Summary
Three fixes and one infrastructure improvement made during this session.

---

## Changes

### 1. `.eleventy.js` — add `addWatchTarget` for JS directory
`src/assets/js` was configured as passthrough copy only — 11ty was not watching it for changes. JS edits were silently not triggering rebuilds, which caused days of apparent choreography breakage that was actually just stale builds.

```js
eleventyConfig.addWatchTarget("src/assets/js/");
```

### 2. `choreography.js` — remove `page.style.overflow = 'hidden'`
Overflow clipping on `.layout__page` was preventing the selfie `::before` pseudo-element from rendering during and after scroll-in. Removed entirely — no visual ill effects observed without it.

Also: fixed `chapterList` selector to exclude `.page-header` via `:not(.page-header)` — the page header was being counted as a chapter, offsetting all beat scroll range calculations.

Also: fixed chapter height formula — was `bentoH * pages.length + pages.length * BEAT_PX + CHROME_TOP`, which overcounted by two extra bento heights. Correct formula: `bentoH + pages.length * BEAT_PX + CHROME_TOP`.

### 3. `page.yml` — `fieldText` promoted from flat string to object
`fieldText` is now a structured object with `beatIndex`, `rowStart`, `rowSpan`, and `content`. Groundwork for the subgrid refactor.

```yaml
fieldText:
  beatIndex: 2
  rowStart: 2
  rowSpan: 2
  content: |
    <p class="field-text">...</p>
```

### 4. `compiled-page.njk` — updated fieldText rendering
Reads from new `fieldText` object shape. Renders `content` via `| safe`. Data attributes updated from `data-content-row` to `data-beat-index`, `data-row-start`, `data-row-span`.

### 5. `_layout.scss` — updated content row placement rules
Replaced `data-content-row` padding offset rules with `data-row-start` and `data-row-span` attribute selectors. Adds `min-height` per span count.

---

## What's NOT included
`choreography.js` contains partial wiring for `chapter__content` beat sequencing (opacity + translateY). The translateY approach is wrong — `chapter__content` is `position: sticky` in document flow, so translate fires at wrong scroll positions. This is deferred to the subgrid refactor on the next branch.

---

## Next branch
`build/subgrid-chapter-layout` — see `session-state.md` Priority 1 for full spec.
