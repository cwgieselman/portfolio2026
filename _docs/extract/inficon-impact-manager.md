# Extract Report — inficon-impact-manager

**Compiled:** 2026-03-12
**Mode:** A (Figma MCP)
**figmaFileKey:** kJSS8VqzcqeH8M9nPQS63U
**rootNodeId:** 30-2252
**Scope:** section-01 / page-01 only (user instruction)

---

## Counts

| Item | Count |
|------|-------|
| Sections compiled | 1 (section-01) |
| Pages compiled | 1 (page-01) |
| Content cells found | 3 |
| Wrappers emitted | 3 |
| Includes emitted — `components/header.njk` | 1 |
| Includes emitted — `components/richtext.njk` | 2 |
| Bento cells emitted | 12 |

---

## TODO Counts

| Token | Count | Location |
|-------|-------|----------|
| `TODO:src` | 8 | bento articles 03, 05, 06 (image), 07, 10, 11, 12 + article-06 (mixed) |

All `TODO:src` entries are for bento image articles. No `alt` TODOs — image articles emit `alt=""` with `role="presentation"` per user instruction.

---

## Wrapper Manifest

| Wrapper ID | Includes |
|------------|----------|
| `header--section-01--page-01--content-cell-01` | `components/header.njk` |
| `content--section-01--page-01--content-cell-02` | `components/richtext.njk` (×2) |
| `content--section-01--page-01--content-cell-03` | bento (see §Bento below) |

---

## Grid Placement Log

Grid-tracks node: 30:2255 — x=0, y=100 (offset used for all row calculations).
Grid definition: §D of COMPILE_PROMPTS.md — verified by user, not re-fetched.

| Cell | x | y | w | h | grid-rel y | col-start | col-end | row-start | row-end | Status |
|------|---|---|---|---|-----------|-----------|---------|-----------|---------|--------|
| content-cell-01 | 328 | 201 | 1240 | 143 | 101 | 3 (328px ✓) | 12 (1568px ✓) | 3 (100px ±1px) | 4 (244px ✓) | ✓ |
| content-cell-02 | 329 | 368 | 415 | 364 | 268 | 3 (328px ±1px) | 6 (744px ✓) | 5 (268px ✓) | 10 (632px ✓) | ✓ |
| content-cell-03 | 769 | 368 | 900 | 900 | 268 | 7 (768px ±1px) | 13 (1668px ±1px) | 5 (268px ✓) | ⚠ 1168px | ⚠ |

### ⚠ content-cell-03 row-end warning

grid-relative y+h = 268+900 = **1168px** — exceeds grid max (row line 14 = 900px) by 268px.
Emitted as `grid-row: 5 / 14` (last explicit line). The bento content will overflow naturally.
**Action required:** Verify with designer whether an extended grid is intended or if the cell height should be capped at 632px (row 5→14).

---

## Bento — bento--inficon--im-research

**Frame node:** bento--inficon--im-research (within Slot of content-cell-03)
**Inferred grid:** 5 columns × 5 rows, 168px uniform tracks, 10px gap
**Frame size:** 880×1058px (content fills 880×880; 178px slack below — no article content found there)

### Bento Grid Inference

All article bounding boxes verified against 168px track + 10px gap pattern:

| Article | x | y | w | h | col | row | Track check |
|---------|---|---|---|---|-----|-----|-------------|
| 01 | 0 | 0 | 168 | 168 | 1/2 | 1/2 | 168×1 ✓ |
| 02 | 178 | 0 | 346 | 168 | 2/4 | 1/2 | 168+10+168=346 ✓ |
| 03 | 534 | 0 | 346 | 168 | 4/6 | 1/2 | 534=3×178 ✓ |
| 04 | 0 | 178 | 168 | 168 | 1/2 | 2/3 | ✓ |
| 05 | 178 | 178 | 346 | 168 | 2/4 | 2/3 | ✓ |
| 06 | 534 | 178 | 346 | 346 | 4/6 | 2/4 | 346=2 rows ✓ |
| 07 | 0 | 356 | 524 | 346 | 1/4 | 3/5 | 524=3×168+2×10 ✓ |
| 08 | 534 | 534 | 346 | 168 | 4/6 | 4/5 | ✓ |
| 09 | 0 | 712 | 346 | 168 | 1/3 | 5/6 | 346=2×168+10 ✓ |
| 10 | 356 | 712 | 168 | 168 | 3/4 | 5/6 | 356=2×178 ✓ |
| 11 | 534 | 712 | 168 | 168 | 4/5 | 5/6 | ✓ |
| 12 | 712 | 712 | 168 | 168 | 5/6 | 5/6 | ✓ |

### Z-Index (from Figma layer tree order)

| Article | Tree index | z-index |
|---------|-----------|---------|
| article-12 | 0 | 1 |
| article-11 | 1 | 2 |
| article-10 | 2 | 3 |
| article-09 | 3 | 4 |
| article-07 | 4 | 5 |
| article-08 | 5 | 6 |
| article-05 | 6 | 7 |
| article-04 | 7 | 8 |
| article-03 | 8 | 9 |
| article-06 | 9 | 10 |
| article-02 | 10 | 11 |
| article-01 | 11 | 12 |

### Arrow / aria-details

| Article | Arrow dir | Points-to | Notes |
|---------|-----------|-----------|-------|
| article-01 | right | article-02 | Union overflows right 20px; article-02 is directly right ✓ |
| article-04 | right | article-05 | Union overflows right 20px; article-05 is directly right ✓ |
| article-06 | top | article-03 | Union overflows top 20px (top:-20px); article-03 is directly above ✓ |
| article-08 | left | article-07 | Union overflows left 20px (left:-20px); article-07 is directly left ✓ |
| article-09 | right | article-02 | ⚠ SEE WARNING BELOW |

**⚠ article-09 points-to warning:**
Figma data shows `points-to: article-02` for article-09, but article-02 is in row 1 (col 2/4) while article-09 is in row 5 (col 1/3). These are not adjacent. The Union arrow also overflows right (same pattern as article-01/04 which point to directly adjacent cells). This suggests `article-02` may be a Figma component property default that was not updated. **Possible intended target: article-10 (col 3/4, row 5/6 — directly to the right).** Emitted as Figma specifies (`article-02`). Verify with designer.

### Target articles receiving `id` attribute

Per §G, target articles must receive `id="<bentoKey>--<articleId>"` in HTML.
The bento template must derive these from `ariaDetails` references:

| Target | Referenced by |
|--------|--------------|
| article-02 | article-01, article-09 |
| article-03 | article-06 |
| article-05 | article-04 |
| article-07 | article-08 |

Note: article-02 is referenced by two annotating articles. It receives one `id` attribute.

**Template wiring note:** The `bento-article.njk` template needs to detect when an article is a target and emit its `id` attribute. Suggested approach: pre-collect all `ariaDetails` values, then check each article against the set during render.

---

## Warnings

1. **content-cell-03 row-end** — grid-relative y+h=1168px exceeds grid max 900px. Emitted `grid-row: 5 / 14`. See placement log above.

2. **article-01 stat number** — "1" renders as Tienne Bold 64px. No `bento-type--*` class exists for this font/size combination (table covers Raleway, PT Sans only). Emitted as bare `<span>1</span>` without a type class. A custom one-off cell override or new token class may be needed.

3. **article-09 points-to: article-02** — Spatial mismatch. See arrow/aria-details section above.

4. **bento `bento:` key in page.yml cell** — content-cell-03 uses a `bento:` key instead of `includes:`. The bento standalone component is not in the executor safelist (CONTRACT.md). Template wiring for this cell must invoke `bentoGrid()` macro directly rather than routing through the executor. This may require a custom cell type handler or a bypass pattern — coordinate with template author.

---

## Nodes skipped

None. All 3 content cells and all 12 bento articles were compiled.

---

## Source node IDs (for re-verification)

| Item | Figma node ID |
|------|--------------|
| Root frame | 30:2252 |
| section-01 | 30:2253 |
| page-01 | 30:2254 |
| grid-tracks | 30:2255 |
| content-cell-01 | 30:2262 |
| content-cell-02 | 30:2259 |
| content-cell-03 | 32:3924 |
| bento frame | I32:3924;2904:1907;32:3876 |
