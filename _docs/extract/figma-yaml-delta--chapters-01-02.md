# Figma → YAML Delta: Chapters 01 & 02
*Generated: April 4, 2026 (corrected re-read)*
*Figma node: 2584:1177 (inficon-ims frame, Layouts--INFI)*
*YAML: src/_data/pages/inficon-impact-manager/page.yml*

This document is for Claude Code. It identifies every discrepancy between the
current Figma design and the current YAML. Claude Code applies confirmed changes
only — do not overwrite YAML wholesale.

---

## Key Structural Findings (Read First)

**Tile component naming has changed in Figma.** The Figma tile instances are
now named `tile-01`, `tile-02`, etc. (not `mosaic-tile-##`). The frame wrapper
is `_mosaic-article__frame` / `_mosaic-article__theme` (not
`_mosaic-tile__frame`). This is a Figma-only rename — the YAML `id:` field
uses `article-NN` which maps to the CSS/HTML side. No YAML id changes needed.

**Chapter-02 has 2 content pages** (page-01, page-02) in Figma. YAML has
page-00 (skeleton) + page-01 + page-02. Confirmed match.

**Two span patterns in use — important for Claude Code to understand both:**

1. **Stacking spans** — each Figma text node is a separate typographic role
   rendered on its own line. One `<span>` per node, stacked by the flex column
   of `.mosaic-tile__inner`. Only `mosaic-stat` and `mosaic-stat-label` get
   `display: block`; others stack naturally as block-level children of the flex
   container.

2. **Nested spans** — a single Figma text node has mixed font runs within one
   continuous sentence. Outer `<span>` wraps the whole string establishing the
   block; inner `<span>` wraps only the styled segment. Neither span has
   `display: block` — the inner one is inline by default and sits within the
   outer text flow.

   Signal in Figma: `getStyledTextSegments()` on a single text node returns
   multiple segments with different `fontName` values = nested span pattern.
   Multiple separate text nodes = stacking span pattern.

---

## Richtext / Field Text

### Chapter-01
- **Figma:** "Four weeks into the role, I was on a plane to Grenoble, France.
  The customer had withheld their signature. They wanted to see what professional
  design involvement actually looked like."
- **YAML:** Identical. ✓

### Chapter-02
- **Figma:** "The FAB was the brief. Before designing anything, I needed to
  understand how the people inside it actually worked — and what the tools they
  were using were failing to do."
- **YAML:** Identical. ✓

---

## Chapter-01 Skeleton (page-00)

**Figma:** 15 skeleton tiles. Pattern: col 1 row 1 empty, all other cells
filled. `.sss / ssss / ssss / ssss`

**YAML skeleton string:**
```
- ".  s  s  s"
- "s  s  s  s"
- "s  s  s  s"
- "s  s  .  ."
```
Last row has cols 3 and 4 empty — gives 13 tiles total (articles 01-13).

**DISCREPANCY:** YAML is missing 2 skeleton tiles. Update skeleton string to:
```
- ".  s  s  s"
- "s  s  s  s"
- "s  s  s  s"
- "s  s  s  s"
```
Add to page-00 tile list:
- `article-14`: col `"3 / 4"`, row `"4 / 5"`
- `article-15`: col `"4 / 5"`, row `"4 / 5"`

---

## Chapter-01 Page-01

**Tile count:** Figma 2, YAML 2. ✓

### article-01 (landscape photo, ST facility)
- **Figma size/pos:** 368x176, x=192 -> col `"2 / 4"`, row `"1 / 2"` ✓
- **Figma alt:** "The ST Microelectronics facility in Crolles, France is a
  large semiconductor FAB with the French Alps visible in the background."
- **YAML alt:** "...in Crolles, France -- a large semiconductor FAB..."

**DISCREPANCY -- alt text:** Figma uses "is a large", YAML uses "-- a large".
Update YAML alt to match Figma exactly.

### article-02 (portrait photo, cleanroom suit)
- **Figma size/pos:** 176x368, x=576 -> col `"4 / 5"`, row `"1 / 3"` ✓
- **Figma alt:** "Craig in a full cleanroom suit, ready to make some chips...
  At the pilot FAB in Crolles, France."
- **YAML alt:** "Craig in a full cleanroom suit, ready to make some chips. At
  the pilot FAB in Crolles, France."

**DISCREPANCY -- alt text:** Figma uses ellipsis, YAML uses period.
Update YAML alt: replace ". At" with "... At".

---

## Chapter-01 Page-02

**Tile count:** Figma 3, YAML 3. ✓

### article-01 (rendering, control center)
- **Figma size/pos:** 368x368, x=0, y=192 -> col `"1 / 3"`, row `"2 / 4"` ✓
- **Figma alt:** "An artist's rendering of the new control center the new
  software would operate in." ✓ matches YAML exactly.

### article-02 (stat tile, "1 Week")
- **Figma size/pos:** 176x176, x=384, y=192 -> col `"3 / 4"`, row `"2 / 3"` ✓
- **Figma content nodes (stacking span pattern -- 3 separate text nodes):**
  - "1" -- Merriweather Bold 64px -> `mosaic-stat`
  - "Week" -- Raleway Bold 20px -> `mosaic-stat-label`
  - "on-site at the pilot facility in France" -- PT Sans Regular 16px -> `mosaic-body`
- **YAML content:**
  ```html
  <span class="mosaic-stat">1</span>
  <span class="mosaic-body">Week on-site at the pilot facility:</span>
  ```

**DISCREPANCY -- content:** YAML collapses label and body into one span, uses
wrong class for "Week", and truncates "in France". Update to:
```html
<span class="mosaic-stat">1</span>
<span class="mosaic-stat-label">Week</span>
<span class="mosaic-body">on-site at the pilot facility in France</span>
```

### article-03 (landscape photo, workshop island)
- **Figma size/pos:** 368x176, x=384, y=384 -> col `"3 / 5"`, row `"3 / 4"` ✓
- **Figma alt:** "A Workshop Island in control room with wall-mounted screens
  showing specific localized production data and individual workstations."
- **YAML alt:** "A Workshop Island in the control room with wall-mounted screens
  showing localized production data and individual workstations."

**DISCREPANCY -- alt text:** Figma omits "the" before "control room" and
includes "specific" before "localized". Update YAML alt to match Figma exactly.

---

## Chapter-01 Page-03

**Tile count:** Figma 1 (inside a `custom article` wrapper frame), YAML 1. ✓

### article-01 (quote tile, selfie)
- **Figma structure:** tile-01 sits inside a `custom article` frame at x=0,
  y=576 within the mosaic-grid -> col `"1 / 3"`, row `"4 / 5"`. The `::before`
  selfie image instance sits at x=-40, y=184 relative to the `custom article`
  frame, representing the overhanging portrait photo.
- **YAML:** col `"1 / 3"`, row `"4 / 5"` ✓ Correct.
- **Figma variantName:** "selfie" ✓ matches YAML `variant: selfie`
- **Figma content (stacking span pattern -- 3 separate text nodes):**
  - '"How can we make THIS' -- Raleway Italic 20px
  - '<waves hand at the room as it is today>' -- PT Sans Regular 16px
  - 'more useful to you?"' -- Raleway Italic 20px
- **YAML content:**
  ```html
  <span class="mosaic-lead-italic">"How can we make THIS</span>
  <span class="mosaic-body">&lt;waves hand at the room as it is today&gt;</span>
  <span class="mosaic-lead-italic">more useful to you?"</span>
  ```
  ✓ Content, span classes, and HTML entity encoding all match Figma.

**No changes needed.**

---

## Chapter-02 Skeleton (page-00)

**Figma:** 15 skeleton tiles. Same pattern as chapter-01: `.sss/ssss/ssss/ssss`

**YAML skeleton string:**
```
- ".  .  s  s"
- ".  s  s  s"
- "s  s  s  s"
- "s  s  s  s"
```
Rows 1-2 are partially empty -- gives 13 tiles total in wrong positions.

**DISCREPANCY:** YAML skeleton pattern does not match Figma. Update to:
```
- ".  s  s  s"
- "s  s  s  s"
- "s  s  s  s"
- "s  s  s  s"
```
Replace the entire page-00 tile list to match the correct 15-tile pattern:
```
article-01: col "2 / 3", row "1 / 2"
article-02: col "3 / 4", row "1 / 2"
article-03: col "4 / 5", row "1 / 2"
article-04: col "1 / 2", row "2 / 3"
article-05: col "2 / 3", row "2 / 3"
article-06: col "3 / 4", row "2 / 3"
article-07: col "4 / 5", row "2 / 3"
article-08: col "1 / 2", row "3 / 4"
article-09: col "2 / 3", row "3 / 4"
article-10: col "3 / 4", row "3 / 4"
article-11: col "4 / 5", row "3 / 4"
article-12: col "1 / 2", row "4 / 5"
article-13: col "2 / 3", row "4 / 5"
article-14: col "3 / 4", row "4 / 5"
article-15: col "4 / 5", row "4 / 5"
```
Use mosaic id `inficon--im--s01-c02-p00`.

---

## Chapter-02 Page-01

**Tile count:** Figma 1, YAML 1. ✓

### article-01 (frame + screenshot tile)
- **Figma size/pos:** 368x368, x=384, y=0 -> col `"3 / 5"`, row `"1 / 3"` ✓
- **Figma tile structure:** single `tile-01` with Slot containing
  `_mosaic-tile__richtext` at y=0 (text) and `media` at y=134 (screenshot).
  Frame tile with stacked text + image -- matches YAML approach exactly. ✓
- **Figma content text (single text node, PT Sans Regular throughout -- no
  bold runs detected via getStyledTextSegments):**
  "Each Workshop in the FAB has its own 'Island' with a central display of
  localized data and individual workstations for the Actors assigned to that
  Workshop"
- **YAML content:**
  ```html
  <span class="mosaic-body">Each <span class="mosaic-body-bold">Workshop</span>
  in the FAB has its own 'Island'...for the
  <span class="mosaic-body-bold">Actors</span> assigned to that Workshop</span>
  ```

**DISCREPANCY -- bold markup not in Figma:** "Workshop" and "Actors" are PT
Sans Regular throughout in Figma. No styled segments detected. Remove inner
bold spans. Update to:
```html
<span class="mosaic-body">Each Workshop in the FAB has its own 'Island' with a central display of localized data and individual workstations for the Actors assigned to that Workshop</span>
```

- **Figma image alt:** "A screenshot of the customer-created Anomaly Tracking
  page Phase 1 of our project would replace."
- **YAML image:** `alt="" role="presentation"` (marked decorative)

**DISCREPANCY -- image alt:** Figma has meaningful alt text; YAML marks it
presentational. Update YAML img tag:
```html
<img class="mosaic-tile__screenshot"
  src="/assets/images/inficon--screen--anomaly-ui-st.png"
  alt="A screenshot of the customer-created Anomaly Tracking page Phase 1 of our project would replace." />
```

---

## Chapter-02 Page-02

**Tile count:** Figma 4, YAML 4. ✓

### article-01 (frame, "Replacing this interface")
- **Figma size/pos:** 176x176, x=192, y=192 -> col `"2 / 3"`, row `"2 / 3"` ✓
- **Figma content:** "Replacing this  interface from the Island workstations
  was the focus of Phase 1." Double space and trailing space are authoring
  artifacts in Figma; YAML single-space version is correct.
- **Span pattern:** This is a single continuous sentence with a mid-string
  weight change on "Phase 1" -- the **nested span pattern**, not stacking.
  The outer span establishes the body block; the inner span changes weight
  inline. Both are `<span>` with no `display: block`, so the inner span sits
  inline within the outer text flow. This is correct and intentional.
- **Bold state on "Phase 1":** Could not be confirmed via API (fontName
  returned null for this nested instance). The bold is editorially reasonable,
  the inline span pattern handles it correctly, and the YAML already has it.
  Keep it. YAML is correct as written:
  ```html
  <span class="mosaic-body">Replacing this interface from the Island workstations was the focus of <span class="mosaic-body-bold">Phase 1</span>.</span>
  ```
- **No changes needed.**

### article-02 (scrollable bleed, FigJam map)
- **Figma size/pos:** 560x368, x=0, y=384 -> col `"1 / 4"`, row `"3 / 5"` ✓
- **Figma alt:** "A screenshot of a FigJam file that maps UI elements from the
  Anomaly Tracking page to the actions and workflows they triggered."
- **YAML alt:** "FigJam mapping of the legacy anomaly workstation interface --
  inputs, workflows, and display states documented in collaboration with Actors
  during discovery."

**DISCREPANCY -- alt text:** Update YAML alt to match Figma.

### article-03 (frame, "We saw the tool")
- **Figma size/pos:** 176x176, x=576, y=384 -> col `"4 / 5"`, row `"3 / 4"` ✓
- **Figma content:** "We saw the tool reporting data and spreadsheets used to
  identify anomalies manually." ✓ matches YAML exactly.

### article-04 (frame, "and I mapped")
- **Figma size/pos:** 176x176, x=576, y=576 -> col `"4 / 5"`, row `"4 / 5"` ✓
- **Figma content:** "and I mapped the functionality of the interface
  technicians used to assign and log the fixes." ✓ matches YAML exactly.

---

## Summary: All Changes Confirmed

Claude Code applies all of the following. No items require Craig's input before
proceeding.

1. **Chapter-01 skeleton string** -- update last row: `"s  s  .  ."` ->
   `"s  s  s  s"`

2. **Chapter-01 page-00** -- add 2 skeleton tiles:
   - `article-14`: col `"3 / 4"`, row `"4 / 5"`
   - `article-15`: col `"4 / 5"`, row `"4 / 5"`

3. **Chapter-01 page-01, article-01 alt** -- "...France is a large..."

4. **Chapter-01 page-01, article-02 alt** -- "...some chips... At..."

5. **Chapter-01 page-02, article-02 content** -- three-span stacking pattern:
   ```html
   <span class="mosaic-stat">1</span>
   <span class="mosaic-stat-label">Week</span>
   <span class="mosaic-body">on-site at the pilot facility in France</span>
   ```

6. **Chapter-01 page-02, article-03 alt** -- "in control room" (no "the"),
   "specific localized production data"

7. **Chapter-02 skeleton string** -- update to `.sss/ssss/ssss/ssss` pattern

8. **Chapter-02 page-00 tiles** -- replace entire tile list with 15-tile
   pattern documented above

9. **Chapter-02 page-01, article-01 content** -- remove bold spans on
   "Workshop" and "Actors"; plain mosaic-body text only

10. **Chapter-02 page-01, article-01 image alt** -- add meaningful alt text

11. **Chapter-02 page-02, article-02 alt** -- update to Figma alt text

12. **Chapter-02 page-02, article-01** -- no changes. Bold on "Phase 1" stays.
    Nested span pattern is correct. YAML is already right.
