# YAML Architecture — Compiled Page Format

Reference doc for authoring `src/_data/pages/<pageKey>/page.yml`.

---

## Hierarchy

```
page
  pageHeader
  chapters
    chapter
      skeleton
      content
      pages
        page
          mosaic
            tiles
              tile
```

---

## Page

Top-level keys.

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `pageKey` | string | yes | Matches the directory name and Eleventy data lookup key |
| `mode` | string | yes | `"choreographed"` is the only current mode. Drives `layout__story--{mode}` class. |
| `pageHeader` | object | yes | Page-level h1 — rendered sticky above all chapters |
| `chapters` | array | yes | One or more chapter objects |

---

## Page Header

Consumed by `layouts/page-header.njk`. Rendered sticky at the top of `<main>`.

| Key | Type | Notes |
|-----|------|-------|
| `headline` | string | Page h1 text |
| `showEyebrow` | boolean | |
| `eyebrowType` | string | `"text"` or `"pills"` |
| `eyebrow` | string | Only when `eyebrowType: "text"` |
| `pills` | array of strings | Only when `eyebrowType: "pills"` |
| `showSubhead` | boolean | |
| `subhead` | string | One-sentence project summary below headline |

---

## Chapter

One narrative unit. Owns a skeleton page (P00) and one or more content pages (P01–PN).

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `chapterKey` | string | yes | e.g. `"chapter-01"` |
| `chapterOffset` | integer | yes | Rows of overlap with the previous chapter. `0` = no overlap |
| `skeleton` | array of strings | yes | Reference-only grid map — not read by templates |
| `content` | array | yes | One or more richtext block objects — rendered in the left column |
| `pages` | array | yes | One or more page objects |

**`chapterOffset`** drives a negative `margin-top` in JS: `offset × 192px` (one cell + one gap at MONEY state).

### Skeleton

Reference-only. Not read by any template — the actual skeleton tiles are authored as `type: skeleton` tiles in `page-00`. This field documents the intended composite grid shape for human readers and SCSS authors.

One string per row. `s` = skeleton cell, `.` = permanently empty. Column count is inferred from string width.

```yaml
skeleton:
  - ".  s  s  s"
  - "s  s  s  s"
  - "s  s  s  s"
  - "s  s  .  ."
```

### Content

An array of richtext block objects. Each block is passed directly to `components/richtext.njk` as `richtextParams`. Uses the same shape as Pipeline B richtext.

```yaml
content:
  - kind: "p"
    text: "Four weeks into the role, I was on a plane to Grenoble, France."
```

Supported kinds: `"p"` · `"h2"` · `"h3"` · `"ul"` · `"ol"` — see CONTRACT.md Richtext section for full shape.

---

## Page

One beat. One mosaic composition. Stacks with sibling pages at the same grid origin.

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `pageKey` | string | yes | e.g. `"page-01"` |
| `mosaic` | object | yes | Mosaic grid definition — see below |

---

## Mosaic

Defines the grid and its tiles.

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `id` | string | yes | Used as the HTML `id` on the `.mosaic` element. Format: `<pageKey>--<chapterKey>--<pageKey>` |
| `cols` | integer | yes | Reference only — drives placements SCSS |
| `rows` | integer | yes | Reference only — drives placements SCSS |
| `tiles` | array | yes | One or more tile objects |

Grid placement (`grid-template-areas`, column/row counts) lives entirely in `src/assets/scss/placements/_<pageKey>.scss`, keyed off the mosaic `id`.

---

## Tile

One mosaic cell. Corresponds to an `<article class="mosaic-tile">` element.

### Fields common to all tile types

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `id` | string | yes | e.g. `"article-01"`. Drives `data-mosaic-tile` attribute and grid-area name (`a01`) |
| `type` | string | yes | `frame` · `bleed` · `skeleton` |
| `theme` | string | no | `primary-dark` · `primary-light` · `secondary-dark` · `secondary-light` · `default`. Omit for bleed and skeleton tiles. |
| `desktop` | object | yes | `col` and `row` — reference only, drives placements SCSS |

### `type: frame`

Padded tile (16px). Text, stats, quotes. Maps to Figma `frame` tile type.

| Key | Type | Notes |
|-----|------|-------|
| `content` | string (HTML block) | Raw HTML rendered via `\| safe`. Use inline type spans — see Typography below |

### `type: bleed`

No-padding tile. Media fills the tile. Maps to Figma `bleed` tile type.

| Key | Type | Notes |
|-----|------|-------|
| `artDirection` | boolean | Opt-in. Emits `data-mosaic-media="art-directed"` on article. Renders `<picture>` with two `<source>` crops — `media.src` for 4-up (≥ 624px), `media.mobileSrc` for 2-up (< 624px). CSS applies portrait aspect-ratio in 2-up via scoped container query. |
| `scrollable` | boolean | Opt-in. Renders two sibling `mosaic-tile--bleed` articles sharing the same grid-area. `data-mosaic-media="desktop"` shown in 4-up; `data-mosaic-media="scrollable"` shown in 2-up. |
| `media` | object | See Media below |

### `type: skeleton`

P00 underlay tile. No content, no theme. `aria-hidden="true"`. `z-index: 0`. Placed via `grid-column`/`grid-row` in placements SCSS (no named areas).

### `custom: true` (additive modifier)

`custom` is not a tile type — it is an additive boolean on any base type (`frame` or `bleed`). When `custom: true`, a `variant` string prop is also required. The template emits the base type class only; all extended behavior lives on `[data-mosaic-variant]` selectors in placements.

| Key | Type | Notes |
|-----|------|-------|
| `custom` | boolean | Must be `true`. Exposes the `variant` prop. |
| `variant` | string | Human-readable label for the specific custom treatment (e.g. `"selfie"`). Becomes `data-mosaic-variant` attribute. |
| `description` | string | Brief for any Agent building or debugging the behavior. Not rendered. |

---

## Media

Used by `type: bleed` tiles.

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

Used inside `content:` HTML blocks on `frame` tiles.

| Class | Font | Notes |
|-------|------|-------|
| `mosaic-stat` | Playfair Display Bold | Large number — clamp 50px→72px |
| `mosaic-lead` | Raleway Regular | Lead sentence — clamp 19px→24px |
| `mosaic-lead-italic` | Raleway Italic | Lead sentence, italic |
| `mosaic-body` | PT Sans Regular | Body copy — clamp 13px→16px |
| `mosaic-body-bold` | PT Sans Bold | Bold body copy |

---

## Theme reference

| Value | Bg | Text | Border |
|-------|----|------|--------|
| `primary-dark` | primary/60 | primary/10 | primary/80 |
| `primary-light` | primary/20 | primary/60 | primary/30 |
| `secondary-dark` | secondary/50 | secondary/80 | secondary/60 |
| `secondary-light` | secondary/20 | secondary/70 | secondary/30 |
| `default` | neutral/10 | primary/60 | neutral/60 |
