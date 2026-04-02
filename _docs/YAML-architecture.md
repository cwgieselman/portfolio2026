# YAML Architecture — Compiled Page Format

Reference doc for authoring `src/_data/pages/<pageKey>/page.yml`.

---

## Hierarchy

```
page
  header
  sections
    section
      skeleton
      chapters
        chapter
          pages
            page
              bento
                articles
                  article
```

---

## Page

Top-level keys.

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `pageKey` | string | yes | Matches the directory name and Eleventy data lookup key |
| `header` | object | yes | Page-level h1 — rendered above all sections |
| `sections` | array | yes | One or more section objects |

---

## Header

Consumed by `components/content-header.njk`. Rendered in `index.njk` above the compiled-page include.

| Key | Type | Notes |
|-----|------|-------|
| `level` | string | Heading level — always `"h1"` at page level |
| `headline` | string | Primary heading text |
| `showEyebrow` | boolean | |
| `eyebrow` | string | Discipline/role line above headline |
| `showSubhead` | boolean | |
| `subhead` | string | One-sentence project summary below headline |

---

## Section

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `sectionKey` | string | yes | e.g. `"section-01"` |
| `mode` | string | yes | `"choreographed"` is the only current mode |
| `skeleton` | object | yes | Composite skeleton grid map — see below |
| `chapters` | array | yes | One or more chapter objects |

### Skeleton

Defines which grid positions receive skeleton outline cells on load. The skeleton describes the full composite grid for the section — all chapters combined.

| Key | Type | Notes |
|-----|------|-------|
| `cols` | integer | Column count of the composite grid |
| `rows` | integer | Row count of the composite grid |
| `areas` | array of strings | One string per row. `s` = skeleton cell, `.` = permanently empty |

---

## Chapter

One left-column narrative unit. Owns a slice of the section's bento composite.

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `chapterKey` | string | yes | e.g. `"chapter-01"` |
| `chapterOffset` | integer | yes | Rows of overlap with the previous chapter. `0` = no overlap |
| `fieldText` | string | yes | Left-column narrative paragraph |
| `pages` | array | yes | One or more page objects |

**`chapterOffset`** drives a negative `margin-top` in JS: `offset × 192px` (one cell + one gap at MONEY state).

---

## Page

One beat. One bento composition. Stacks with sibling pages at the same grid origin.

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `pageKey` | string | yes | e.g. `"page-01"` |
| `wrapper` | string | yes | The `data-cell` ID on the wrapping `.content-cell` |
| `bento` | object | yes | Bento grid definition — see below |

### Wrapper ID convention

```
content--<sectionKey>--<chapterKey>--<pageKey>--cell-01
```

---

## Bento

Defines the grid and its articles.

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `id` | string | yes | Used as the HTML `id` on the `.bento-grid` element |
| `cols` | integer | yes | Reference only — drives placements SCSS |
| `rows` | integer | yes | Reference only — drives placements SCSS |
| `articles` | array | yes | One or more article objects |

### Bento ID convention

```
inficon--im--<sectionKey>--<chapterKey>--<pageKey>
```

Grid placement (`grid-template-areas`, column/row counts) lives entirely in `src/assets/scss/placements/_<pageKey>.scss`, keyed off the bento ID.

---

## Article

One bento cell. Corresponds to a `<article>` element with class `bento-cell`.

### Fields common to all article types

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `id` | string | yes | e.g. `"article-01"`. Drives `data-bento-cell` and the grid-area name (`a01`) |
| `type` | string | yes | `content` · `image` · `comparison` · `annotation` · `custom` |
| `theme` | string | yes | `primary-dark` · `primary-light` · `secondary-dark` · `secondary-light` · `default` |
| `desktop` | object | yes | `col` and `row` — reference only, drives placements SCSS |

### `type: content`

| Key | Type | Notes |
|-----|------|-------|
| `content` | string (HTML block) | Raw HTML rendered via `\| safe`. Use inline type spans — see Typography below |

### `type: image`

| Key | Type | Notes |
|-----|------|-------|
| `artDirection` | boolean | Opt-in. Renders `<picture>` with two `<source>` crops — `media.src` for desktop, `media.mobileSrc` for mobile |
| `scrollable` | boolean | Opt-in. Renders two sibling articles sharing the same grid-area: a desktop image cell and a horizontally scrollable mobile version |
| `media` | object | See Media below |

### `type: comparison`

Component built. Not yet wired to any page YAML. Reference: `components/comparison-slider.njk`.

### `type: annotation`

Removed in `rehab/codebase-audit`. Will be replaced by a new semantic annotation widget when BMTx page work begins. See CONTRACT.md breadcrumb.

### `custom: true` (additive modifier)

`custom` is not a tile type — it is an additive boolean on any base type (`content` or `image`). When `custom: true`, a `variant` string prop is also required. The template emits the base type class only; all extended behavior lives on `[data-mosaic-variant]` selectors in placements.

| Key | Type | Notes |
|-----|------|-------|
| `custom` | boolean | Must be `true`. Exposes the `variant` prop. |
| `variant` | string | Human-readable label for the specific custom treatment (e.g. `"selfie"`). Becomes `data-mosaic-variant` attribute. |
| `description` | string | Brief for any Agent building or debugging the behavior. Not rendered. |

---

## Media

Used by `type: image` articles.

| Key | Type | Notes |
|-----|------|-------|
| `src` | string | Image path — processed by the image optimization transform |
| `mobileSrc` | string | Art-directed crop for mobile. Required when `artDirection: true` |
| `scrollSrc` | string | Unoptimized image for the scrollable mobile instance. Required when `scrollable: true` |
| `hasAlt` | boolean | `true` if the image is meaningful content |
| `alt` | string | Alt text. Required when `hasAlt: true` |
| `sizes` | string | `sizes` attribute for the `<img>` — e.g. `"40vw"` |
| `cssClass` | string | CSS class applied to the `<img>` or `<picture>` element |

---

## Typography — inline content spans

Used inside `content:` HTML blocks.

| Class | Font | Notes |
|-------|------|-------|
| `bento-stat` | Tienne Bold | Large number — clamp 50px→72px |
| `bento-lead` | Raleway Regular | Lead sentence — clamp 19px→24px |
| `bento-lead-italic` | Raleway Italic | Lead sentence, italic |
| `bento-body` | PT Sans Regular | Body copy — clamp 13px→16px |
| `bento-body-bold` | PT Sans Bold | Bold body copy |

---

## Theme reference

| Value | Bg | Text | Border |
|-------|----|------|--------|
| `primary-dark` | primary/60 | primary/10 | primary/80 |
| `primary-light` | primary/20 | primary/60 | primary/30 |
| `secondary-dark` | secondary/50 | secondary/80 | secondary/60 |
| `secondary-light` | secondary/20 | secondary/70 | secondary/30 |
| `default` | neutral/10 | primary/60 | neutral/60 |
