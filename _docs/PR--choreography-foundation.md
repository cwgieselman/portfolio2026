# PR — Scroll Choreography Foundation & Image Fixes
*Session: March 22, 2026 | Branch: build/inficon-bento-series*

---

## Summary

Two areas of work:

1. **Image rendering fixes** — bento image cells now correctly constrain images to their grid tracks, overriding intrinsic `width`/`height` attributes set by the image optimization transform.

2. **Scroll choreography foundation** — beats now stack as a composite grid. The `layout__chapter` wrapper, sticky page stacking, and IntersectionObserver reveal system are all in place.

---

## Files Changed

| File | Nature of change |
|------|-----------------|
| `src/assets/scss/components/_bento-grid.scss` | Image cell fix + choreography states + scroll indicator |
| `src/assets/scss/_layout.scss` | Chapter wrapper + sticky page stacking |
| `src/_includes/layouts/compiled-page.njk` | Chapter wrapper added for choreographed sections |
| `src/assets/js/choreography.js` | IntersectionObserver reveal + chapter height + scroll indicator |
| `src/_includes/layouts/base.njk` | choreography.js wired in |
| `src/assets/scss/placements/_inficon-impact-manager.scss` | Beat-02 area map corrected |

---

## Changes in Detail

### 1 — Image cell fix (`_bento-grid.scss`)

The image optimization transform adds `width="N" height="N"` attributes to `<img>` elements for CLS prevention. Inside bento cells these intrinsic dimensions override CSS layout, causing images to overflow their grid tracks.

Fix: explicit override rule targeting `img` inside `.bento-cell--image` and `.bento-cell--image-directed`:

```scss
.bento-cell--image .bento-cell__inner img,
.bento-cell--image-directed .bento-cell__inner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
}
```

### 2 — Beat-02 area map correction

`article-02` (the "1 Week" stat cell) was spanning rows 1 and 2 in the area map — authored as a 1×1 but placed in both rows accidentally. Fixed to row 2 only, flush with the top of the ROCC rendering (`article-01`):

```scss
grid-template-areas:
    ".   .   .   ."
    "a01 a01 a02 ."
    "a01 a01 a03 a03";
```

### 3 — Choreography states (`_bento-grid.scss`)

Two new state classes on `.bento-grid`:

- **`bento--pending`** — skeleton state. All cells render as ghost outlines (transparent bg, neutral border, content hidden). Shows the grid shape and affordance without revealing content.
- **`bento--visible`** — normal rendered state. Animates in with a subtle `translateY(16px) → 0` + opacity fade over 0.5s.

Respects `prefers-reduced-motion`.

### 4 — Scroll indicator (`_bento-grid.scss`)

Minimal placeholder. Fixed position, bottom center of viewport. "SCROLL TO EXPLORE" label + animated chevron. Disappears on first intentional scroll (scrollY > 20px) or after 6 seconds. Brand treatment deferred to Figma.

Known issue: hides immediately in 11ty dev environment due to livereload scroll events. Works correctly in production.

### 5 — Chapter wrapper + sticky stacking (`_layout.scss`, `compiled-page.njk`)

The `layout__chapter` div wraps all `layout__page` elements inside a choreographed section. Each `layout__page` is `position: sticky, top: 0`. As the user scrolls through the chapter height, beats arrive and stack — each beat composites onto the same grid origin as the others.

Z-index ordering ensures later beats sit above earlier ones:
```scss
.layout__section--choreographed .layout__page { z-index: 1; }
&:nth-child(2) { z-index: 2; }
&:nth-child(3) { z-index: 3; }
```

Chapter height is set by `choreography.js` on init based on beat count and bento geometry.

### 6 — choreography.js

Three responsibilities:
- **Chapter height**: sets `layout__chapter` height to provide natural scroll distance per beat
- **Skeleton/reveal**: first bento loads `bento--visible`; all others start `bento--pending`; IntersectionObserver promotes `pending → visible` when beat enters viewport at 40% threshold
- **Scroll indicator**: injected into the section, hides on scroll or after 6 seconds

---

## Current State

The stacking context is working — all three beats composite onto the same 4×4 grid origin on page load. The scroll reveal is functional.

**Not yet resolved (design decisions pending Figma):**
- Header/field text overlap when beats stack — needs background treatment or layering decision
- Scroll indicator brand treatment
- Skip-to-result anchor link
- Field text sticky behavior during scroll (deferred — needs choreography design pass in Figma)

---

## What to Verify

- [ ] Build completes without errors
- [ ] Beat-01 loads fully visible on page arrival
- [ ] Beat-02 and beat-03 load as skeleton (ghost outlines)
- [ ] Scrolling reveals beats sequentially with fade-in animation
- [ ] Beat-02 "1 Week" stat cell is 176×176px, flush with top of rendering cell
- [ ] All image cells constrain images to their grid tracks (no overflow)
- [ ] BMTx page renders without errors (no regression)

---

## Commit Suggestions

| Commit | Files |
|--------|-------|
| `fix(bento): override intrinsic img dimensions from optimization transform` | `_bento-grid.scss` |
| `fix(inficon): beat-02 area map, stat cell row placement` | `_inficon-impact-manager.scss` |
| `feat(choreography): skeleton states, scroll indicator` | `_bento-grid.scss` |
| `feat(choreography): chapter wrapper, sticky beat stacking, JS reveal` | `_layout.scss`, `compiled-page.njk`, `choreography.js`, `base.njk` |
