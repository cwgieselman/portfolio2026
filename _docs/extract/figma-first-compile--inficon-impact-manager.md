# First Compile — inficon-impact-manager
*Mode 1 — Cold read. Figma only. No reference to existing page.yml.*
*Generated: April 4, 2026*
*Figma file: LTePGo8Q1Lbapffom2X0W5 | Root node: 2584:1177 (inficon-ims)*

---

## Notes on What the Compiler Cannot Determine from Figma Alone

1. **artDirection** — The media component has `type: "composite"` as its variant
   prop in all bleed tiles. There is no `artDirection` boolean exposed in the
   component properties. Whether a tile uses a `<picture>` with two crops cannot
   be read from Figma; it must be declared in YAML by the author after the fact.
   All bleed tiles compiled as plain `bleed` with `src: "TODO:src"`.

2. **scrollable** — Similarly, no `scrollable` prop is exposed on the media
   component. The FigJam tile (ch02 page-02 tile-02, 560x368, 3 cols wide) is
   the only candidate. Size alone is not a reliable signal. Compiled as plain
   `bleed`; `scrollable: true` flagged as a TODO in the report.

3. **Image src paths** — No image asset paths are stored in Figma component
   props. All compiled as `src: "TODO:src"`.

4. **mosaic-tile__screenshot** — ch02 page-01 tile-01 contains both a
   `_mosaic-tile__richtext` instance (text) and a `media` instance stacked in
   the Slot. The media instance here is inside a `frame` tile, not a `bleed`
   tile. COMPILE_PROMPTS §G only describes media blocks for `bleed` tiles.
   This is a mixed frame+image tile not covered by the spec. Compiled with
   an inline img element and flagged in the report.

5. **Custom tile selfie `::before` image** — The `::before` node in the
   custom article wrapper is a bleed tile instance at x=-40, y=184 relative
   to the wrapper. It is Figma-only scaffolding for the designer's reference.
   Not compiled to YAML. Flagged as custom tile scaffold in report.

6. **chapterOffset** — Not a Figma property. Inferred as sequential integer
   (0, 1...) per COMPILE_PROMPTS ordering rules.

7. **mosaic IDs** — Derived from pageKey + chapter + page following the
   pattern: `<pageKey>--<chapterKey>--<pageKey>`.

8. **skeleton string** — Derived from tile x/y positions. Pattern confirmed
   as `.sss/ssss/ssss/ssss` for both chapters (15 tiles each, col 1 row 1 empty).

9. **Tile theme: `default`** — COMPILE_PROMPTS §G says omit theme for bleed
   tiles. For frame tiles with `theme: default`, compiled with `theme: default`
   since it IS set in Figma. Ambiguous — flagged in report.

---

## COMPILED OUTPUT

---

### page.yml

```yaml
pageKey: "inficon-impact-manager"
mode: "choreographed"

pageHeader:
  headline: "INFICON Intelligent Manufacturing Systems"
  showEyebrow: true
  eyebrowType: "pills"
  pills:
    - "UX/UI Design"
    - "Design Systems"
    - "Product Strategy"
  showSubhead: true
  subhead: "13 months as the first UX designer in the IMS Group building the next generation of software for semiconductor fabrication."

chapters:
  - chapterKey: "chapter-01"
    chapterOffset: 0
    skeleton:
      - ".  s  s  s"
      - "s  s  s  s"
      - "s  s  s  s"
      - "s  s  s  s"
    content:
      - kind: "p"
        text: "Four weeks into the role, I was on a plane to Grenoble, France. The customer had withheld their signature. They wanted to see what professional design involvement actually looked like."

    pages:
      - pageKey: "page-00"
        mosaic:
          id: "inficon-impact-manager--chapter-01--page-00"
          cols: 4
          rows: 4
          tiles:
            - id: article-01
              type: skeleton
              desktop:
                col: "2 / 3"
                row: "1 / 2"
            - id: article-02
              type: skeleton
              desktop:
                col: "3 / 4"
                row: "1 / 2"
            - id: article-03
              type: skeleton
              desktop:
                col: "4 / 5"
                row: "1 / 2"
            - id: article-04
              type: skeleton
              desktop:
                col: "1 / 2"
                row: "2 / 3"
            - id: article-05
              type: skeleton
              desktop:
                col: "2 / 3"
                row: "2 / 3"
            - id: article-06
              type: skeleton
              desktop:
                col: "3 / 4"
                row: "2 / 3"
            - id: article-07
              type: skeleton
              desktop:
                col: "4 / 5"
                row: "2 / 3"
            - id: article-08
              type: skeleton
              desktop:
                col: "1 / 2"
                row: "3 / 4"
            - id: article-09
              type: skeleton
              desktop:
                col: "2 / 3"
                row: "3 / 4"
            - id: article-10
              type: skeleton
              desktop:
                col: "3 / 4"
                row: "3 / 4"
            - id: article-11
              type: skeleton
              desktop:
                col: "4 / 5"
                row: "3 / 4"
            - id: article-12
              type: skeleton
              desktop:
                col: "1 / 2"
                row: "4 / 5"
            - id: article-13
              type: skeleton
              desktop:
                col: "2 / 3"
                row: "4 / 5"
            - id: article-14
              type: skeleton
              desktop:
                col: "3 / 4"
                row: "4 / 5"
            - id: article-15
              type: skeleton
              desktop:
                col: "4 / 5"
                row: "4 / 5"

      - pageKey: "page-01"
        mosaic:
          id: "inficon-impact-manager--chapter-01--page-01"
          cols: 4
          rows: 2
          tiles:
            - id: article-01
              type: bleed
              theme: default
              desktop:
                col: "2 / 4"
                row: "1 / 2"
              media:
                src: "TODO:src"
                hasAlt: true
                alt: "The ST Microelectronics facility in Crolles, France is a large semiconductor FAB with the French Alps visible in the background."
                sizes: "31vw"

            - id: article-02
              type: bleed
              theme: default
              desktop:
                col: "4 / 5"
                row: "1 / 3"
              media:
                src: "TODO:src"
                hasAlt: true
                alt: "Craig in a full cleanroom suit, ready to make some chips... At the pilot FAB in Crolles, France."
                sizes: "20vw"

      - pageKey: "page-02"
        mosaic:
          id: "inficon-impact-manager--chapter-01--page-02"
          cols: 4
          rows: 3
          tiles:
            - id: article-01
              type: bleed
              theme: default
              desktop:
                col: "1 / 3"
                row: "2 / 4"
              media:
                src: "TODO:src"
                hasAlt: true
                alt: "An artist's rendering of the new control center the new software would operate in."
                sizes: "31vw"

            - id: article-02
              type: frame
              theme: primary-dark
              desktop:
                col: "3 / 4"
                row: "2 / 3"
              content: |
                <span class="mosaic-stat">1</span>
                <span class="mosaic-stat-label">Week</span>
                <span class="mosaic-body">on-site at the pilot facility in France</span>

            - id: article-03
              type: bleed
              theme: default
              desktop:
                col: "3 / 5"
                row: "3 / 4"
              media:
                src: "TODO:src"
                hasAlt: true
                alt: "A Workshop Island in control room with wall-mounted screens showing specific localized production data and individual workstations."
                sizes: "31vw"

      - pageKey: "page-03"
        mosaic:
          id: "inficon-impact-manager--chapter-01--page-03"
          cols: 4
          rows: 4
          tiles:
            - id: article-01
              type: frame
              custom: true
              variant: selfie
              theme: default
              desktop:
                col: "1 / 3"
                row: "4 / 5"
              content: |
                <span class="mosaic-lead-italic">"How can we make THIS</span>
                <span class="mosaic-body">&lt;waves hand at the room as it is today&gt;</span>
                <span class="mosaic-lead-italic">more useful to you?"</span>

  - chapterKey: "chapter-02"
    chapterOffset: 1
    skeleton:
      - ".  s  s  s"
      - "s  s  s  s"
      - "s  s  s  s"
      - "s  s  s  s"
    content:
      - kind: "p"
        text: "The FAB was the brief. Before designing anything, I needed to understand how the people inside it actually worked — and what the tools they were using were failing to do."

    pages:
      - pageKey: "page-00"
        mosaic:
          id: "inficon-impact-manager--chapter-02--page-00"
          cols: 4
          rows: 4
          tiles:
            - id: article-01
              type: skeleton
              desktop:
                col: "2 / 3"
                row: "1 / 2"
            - id: article-02
              type: skeleton
              desktop:
                col: "3 / 4"
                row: "1 / 2"
            - id: article-03
              type: skeleton
              desktop:
                col: "4 / 5"
                row: "1 / 2"
            - id: article-04
              type: skeleton
              desktop:
                col: "1 / 2"
                row: "2 / 3"
            - id: article-05
              type: skeleton
              desktop:
                col: "2 / 3"
                row: "2 / 3"
            - id: article-06
              type: skeleton
              desktop:
                col: "3 / 4"
                row: "2 / 3"
            - id: article-07
              type: skeleton
              desktop:
                col: "4 / 5"
                row: "2 / 3"
            - id: article-08
              type: skeleton
              desktop:
                col: "1 / 2"
                row: "3 / 4"
            - id: article-09
              type: skeleton
              desktop:
                col: "2 / 3"
                row: "3 / 4"
            - id: article-10
              type: skeleton
              desktop:
                col: "3 / 4"
                row: "3 / 4"
            - id: article-11
              type: skeleton
              desktop:
                col: "4 / 5"
                row: "3 / 4"
            - id: article-12
              type: skeleton
              desktop:
                col: "1 / 2"
                row: "4 / 5"
            - id: article-13
              type: skeleton
              desktop:
                col: "2 / 3"
                row: "4 / 5"
            - id: article-14
              type: skeleton
              desktop:
                col: "3 / 4"
                row: "4 / 5"
            - id: article-15
              type: skeleton
              desktop:
                col: "4 / 5"
                row: "4 / 5"

      - pageKey: "page-01"
        mosaic:
          id: "inficon-impact-manager--chapter-02--page-01"
          cols: 4
          rows: 2
          tiles:
            - id: article-01
              type: frame
              theme: primary-light
              desktop:
                col: "3 / 5"
                row: "1 / 3"
              content: |
                <span class="mosaic-body">Each Workshop in the FAB has its own 'Island' with a central display of localized data and individual workstations for the Actors assigned to that Workshop</span>
                <img class="mosaic-tile__screenshot" src="TODO:src" alt="A screenshot of the customer-created Anomaly Tracking page Phase 1 of our project would replace." />

      - pageKey: "page-02"
        mosaic:
          id: "inficon-impact-manager--chapter-02--page-02"
          cols: 4
          rows: 4
          tiles:
            - id: article-01
              type: frame
              theme: secondary-dark
              desktop:
                col: "2 / 3"
                row: "2 / 3"
              content: |
                <span class="mosaic-body">Replacing this interface from the Island workstations was the focus of <span class="mosaic-body-bold">Phase 1</span>.</span>

            - id: article-02
              type: bleed
              theme: default
              desktop:
                col: "1 / 4"
                row: "3 / 5"
              media:
                src: "TODO:src"
                hasAlt: true
                alt: "A screenshot of a FigJam file that maps UI elements from the Anomaly Tracking page to the actions and workflows they triggered."
                sizes: "47vw"

            - id: article-03
              type: frame
              theme: secondary-light
              desktop:
                col: "4 / 5"
                row: "3 / 4"
              content: |
                <span class="mosaic-body">We saw the tool reporting data and spreadsheets used to identify anomalies manually.</span>

            - id: article-04
              type: frame
              theme: primary-light
              desktop:
                col: "4 / 5"
                row: "4 / 5"
              content: |
                <span class="mosaic-body">and I mapped the functionality of the interface technicians used to assign and log the fixes.</span>
```

---

### placements SCSS

```scss
// =============================================================================
// placements/_inficon-impact-manager.scss
// Generated: April 4, 2026 — first compile, cold read
// Source: Figma LTePGo8Q1Lbapffom2X0W5, node 2584:1177
// Grid unit: 176px cell + 16px gap = 192px per track
// =============================================================================


// ---------------------------------------------------------------------------
// CHAPTER 01 — P00 SKELETON
// 15 tiles, .sss / ssss / ssss / ssss pattern
// ---------------------------------------------------------------------------

#mosaic--inficon-impact-manager--chapter-01--page-00 {
    grid-template-columns: repeat(4, var(--mosaic-cell-size));
    grid-template-rows:    repeat(4, var(--mosaic-cell-size));
}

#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-01"] { grid-column: 2 / 3; grid-row: 1 / 2; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-02"] { grid-column: 3 / 4; grid-row: 1 / 2; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-03"] { grid-column: 4 / 5; grid-row: 1 / 2; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-04"] { grid-column: 1 / 2; grid-row: 2 / 3; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-05"] { grid-column: 2 / 3; grid-row: 2 / 3; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-06"] { grid-column: 3 / 4; grid-row: 2 / 3; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-07"] { grid-column: 4 / 5; grid-row: 2 / 3; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-08"] { grid-column: 1 / 2; grid-row: 3 / 4; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-09"] { grid-column: 2 / 3; grid-row: 3 / 4; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-10"] { grid-column: 3 / 4; grid-row: 3 / 4; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-11"] { grid-column: 4 / 5; grid-row: 3 / 4; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-12"] { grid-column: 1 / 2; grid-row: 4 / 5; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-13"] { grid-column: 2 / 3; grid-row: 4 / 5; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-14"] { grid-column: 3 / 4; grid-row: 4 / 5; }
#mosaic--inficon-impact-manager--chapter-01--page-00 [data-mosaic-tile="article-15"] { grid-column: 4 / 5; grid-row: 4 / 5; }


// ---------------------------------------------------------------------------
// CHAPTER 01 — P01
// 2 tiles. Sort by y then x: tile-01 (x=192 y=0), tile-02 (x=576 y=0)
// ---------------------------------------------------------------------------

#mosaic--inficon-impact-manager--chapter-01--page-01 {
    grid-template-areas:
        ". a01 a01 a02"
        ". .   .   a02";
}

@container content-cell (min-width: 752px) {
    #mosaic--inficon-impact-manager--chapter-01--page-01 {
        grid-template-columns: repeat(4, var(--mosaic-cell-size));
        grid-template-rows:    repeat(2, var(--mosaic-cell-size));
        grid-template-areas:
            ". a01 a01 a02"
            ". .   .   a02";
    }
}

#mosaic--inficon-impact-manager--chapter-01--page-01 [data-mosaic-tile="article-01"] { grid-area: a01; z-index: 2; }
#mosaic--inficon-impact-manager--chapter-01--page-01 [data-mosaic-tile="article-02"] { grid-area: a02; z-index: 1; }


// ---------------------------------------------------------------------------
// CHAPTER 01 — P02
// 3 tiles. Sort by y then x:
//   tile-01 x=0   y=192 (row 2, col 1) — bleed 2x2
//   tile-02 x=384 y=192 (row 2, col 3) — frame stat
//   tile-03 x=384 y=384 (row 3, col 3) — bleed 2x1
// ---------------------------------------------------------------------------

#mosaic--inficon-impact-manager--chapter-01--page-02 {
    grid-template-areas:
        ".   .   .   ."
        "a01 a01 a02 ."
        "a01 a01 a03 a03";
}

@container content-cell (min-width: 752px) {
    #mosaic--inficon-impact-manager--chapter-01--page-02 {
        grid-template-columns: repeat(4, var(--mosaic-cell-size));
        grid-template-rows:    repeat(3, var(--mosaic-cell-size));
        grid-template-areas:
            ".   .   .   ."
            "a01 a01 a02 ."
            "a01 a01 a03 a03";
    }
}

#mosaic--inficon-impact-manager--chapter-01--page-02 [data-mosaic-tile="article-01"] { grid-area: a01; z-index: 3; }
#mosaic--inficon-impact-manager--chapter-01--page-02 [data-mosaic-tile="article-02"] { grid-area: a02; z-index: 2; }
#mosaic--inficon-impact-manager--chapter-01--page-02 [data-mosaic-tile="article-03"] { grid-area: a03; z-index: 1; }


// ---------------------------------------------------------------------------
// CHAPTER 01 — P03
// 1 tile. Custom article wrapper at y=576 (row 4). frame+custom+selfie.
// ::before node at x=-40,y=184 relative to wrapper is Figma scaffold only.
// ---------------------------------------------------------------------------

#mosaic--inficon-impact-manager--chapter-01--page-03 {
    grid-template-areas:
        ". .   . ."
        ". .   . ."
        ". .   . ."
        "a01 a01 . .";
}

@container content-cell (min-width: 752px) {
    #mosaic--inficon-impact-manager--chapter-01--page-03 {
        grid-template-columns: repeat(4, var(--mosaic-cell-size));
        grid-template-rows:    repeat(4, var(--mosaic-cell-size));
        grid-template-areas:
            ". .   . ."
            ". .   . ."
            ". .   . ."
            "a01 a01 . .";
    }
}

#mosaic--inficon-impact-manager--chapter-01--page-03 [data-mosaic-tile="article-01"] { grid-area: a01; z-index: 1; }

// CUSTOM TILE SCAFFOLD — variant: selfie
// SCSS: overflow: visible; ::before pseudo-element for portrait photo.
//       In Figma: ::before bleed tile at x=-40, y=184 relative to wrapper.
//       40px left of tile left edge; 8px below tile bottom (176+8=184).
//       Image path and offsets require manual authoring.
// JS:   .is-exiting class behavior on page transition.

#mosaic--inficon-impact-manager--chapter-01--page-03 [data-mosaic-variant="selfie"] {
    overflow: visible;
    /* TODO: ::before pseudo-element for portrait photo */
}


// ---------------------------------------------------------------------------
// CHAPTER 02 — P00 SKELETON
// 15 tiles, .sss / ssss / ssss / ssss (identical pattern to chapter-01)
// ---------------------------------------------------------------------------

#mosaic--inficon-impact-manager--chapter-02--page-00 {
    grid-template-columns: repeat(4, var(--mosaic-cell-size));
    grid-template-rows:    repeat(4, var(--mosaic-cell-size));
}

#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-01"] { grid-column: 2 / 3; grid-row: 1 / 2; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-02"] { grid-column: 3 / 4; grid-row: 1 / 2; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-03"] { grid-column: 4 / 5; grid-row: 1 / 2; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-04"] { grid-column: 1 / 2; grid-row: 2 / 3; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-05"] { grid-column: 2 / 3; grid-row: 2 / 3; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-06"] { grid-column: 3 / 4; grid-row: 2 / 3; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-07"] { grid-column: 4 / 5; grid-row: 2 / 3; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-08"] { grid-column: 1 / 2; grid-row: 3 / 4; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-09"] { grid-column: 2 / 3; grid-row: 3 / 4; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-10"] { grid-column: 3 / 4; grid-row: 3 / 4; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-11"] { grid-column: 4 / 5; grid-row: 3 / 4; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-12"] { grid-column: 1 / 2; grid-row: 4 / 5; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-13"] { grid-column: 2 / 3; grid-row: 4 / 5; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-14"] { grid-column: 3 / 4; grid-row: 4 / 5; }
#mosaic--inficon-impact-manager--chapter-02--page-00 [data-mosaic-tile="article-15"] { grid-column: 4 / 5; grid-row: 4 / 5; }


// ---------------------------------------------------------------------------
// CHAPTER 02 — P01
// 1 tile. tile-01 x=384 y=0, 368x368 -> col 3/5, row 1/3
// ---------------------------------------------------------------------------

#mosaic--inficon-impact-manager--chapter-02--page-01 {
    grid-template-areas:
        ". . a01 a01"
        ". . a01 a01";
}

@container content-cell (min-width: 752px) {
    #mosaic--inficon-impact-manager--chapter-02--page-01 {
        grid-template-columns: repeat(4, var(--mosaic-cell-size));
        grid-template-rows:    repeat(2, var(--mosaic-cell-size));
        grid-template-areas:
            ". . a01 a01"
            ". . a01 a01";
    }
}

#mosaic--inficon-impact-manager--chapter-02--page-01 [data-mosaic-tile="article-01"] { grid-area: a01; z-index: 1; }


// ---------------------------------------------------------------------------
// CHAPTER 02 — P02
// 4 tiles. Sort by y then x:
//   tile-01 x=192 y=192 (row 2, col 2) — frame, secondary-dark
//   tile-02 x=0   y=384 (row 3, col 1) — bleed, 560x368 (3 cols x 2 rows)
//   tile-03 x=576 y=384 (row 3, col 4) — frame, secondary-light
//   tile-04 x=576 y=576 (row 4, col 4) — frame, primary-light
// ---------------------------------------------------------------------------

#mosaic--inficon-impact-manager--chapter-02--page-02 {
    grid-template-areas:
        ".   .   .   ."
        ".   a01 .   ."
        "a02 a02 a02 a03"
        "a02 a02 a02 a04";
}

@container content-cell (min-width: 752px) {
    #mosaic--inficon-impact-manager--chapter-02--page-02 {
        grid-template-columns: repeat(4, var(--mosaic-cell-size));
        grid-template-rows:    repeat(4, var(--mosaic-cell-size));
        grid-template-areas:
            ".   .   .   ."
            ".   a01 .   ."
            "a02 a02 a02 a03"
            "a02 a02 a02 a04";
    }
}

#mosaic--inficon-impact-manager--chapter-02--page-02 [data-mosaic-tile="article-01"] { grid-area: a01; z-index: 4; }
#mosaic--inficon-impact-manager--chapter-02--page-02 [data-mosaic-tile="article-02"] { grid-area: a02; z-index: 3; }
#mosaic--inficon-impact-manager--chapter-02--page-02 [data-mosaic-tile="article-03"] { grid-area: a03; z-index: 2; }
#mosaic--inficon-impact-manager--chapter-02--page-02 [data-mosaic-tile="article-04"] { grid-area: a04; z-index: 1; }
```

---

## COMPILE REPORT

**pageKey:** inficon-impact-manager
**Figma file:** LTePGo8Q1Lbapffom2X0W5
**Root node:** 2584:1177
**Compiled:** April 4, 2026 — Mode 1, cold read

---

### Counts

| Category | Count |
|---|---|
| Chapters | 2 |
| Content pages (excl. P00 skeletons) | 5 (ch01: 3, ch02: 2) |
| Total tiles (all types) | 27 |
| frame tiles | 8 |
| bleed tiles | 5 |
| skeleton tiles | 30 (15 per chapter) |
| custom tiles | 1 (selfie) |
| Field text blocks | 2 (one per chapter, kind: "p") |
| Richtext nodes detected | 2 |

---

### TODO Counts

| Token | Count | Location |
|---|---|---|
| `TODO:src` | 6 | All bleed tiles + screenshot img in ch02 p01 |

---

### Warnings

**W1 — artDirection not detectable from Figma**
The `media` component does not expose an `artDirection` boolean prop. All bleed
tiles compiled as plain `bleed`. If any tile requires art-directed `<picture>`
with two crops, the author must add `artDirection: true` and `mobileSrc:` to
the YAML after compile. Likely candidates: ch01 page-01 article-01 (landscape,
368x176) and article-02 (portrait, 176x368) may need square crops for 2-up.

**W2 — scrollable not detectable from Figma**
No `scrollable` prop is exposed on the media component. ch02 page-02 article-02
(560x368, 3 cols wide) is the strongest candidate for `scrollable: true` +
`scrollSrc:`. Compiled as plain `bleed`. Author must add after compile.

**W3 — Mixed frame+image tile (ch02 page-01 article-01)**
`type: frame` tile whose Slot contains both `_mosaic-tile__richtext` and a
`media` instance stacked vertically. Not covered by COMPILE_PROMPTS §G.
Compiled as frame tile with inline `<img class="mosaic-tile__screenshot">`.
See gap resolution below.

**W4 — Nested span pattern (ch02 page-02 article-01)**
`getStyledTextSegments()` on this tile returned two segments: PT Sans Regular
for the prefix, PT Sans Bold for "Phase 1." — confirming a bold mid-string run.
Compiled as nested span pattern. See gap resolution below.

**W5 — Custom tile selfie ::before node**
`custom article` wrapper in ch01 page-03 contains a `::before` bleed tile
instance at x=-40, y=184. Figma design scaffold only. Not compiled to YAML.
SCSS scaffold block written with TODO comment.

**W6 — Trailing whitespace in Figma text (ch02 page-02 tile-01)**
Text reads "Replacing this  interface..." (double space) and "Phase 1. "
(trailing space). Both are Figma authoring artifacts. Normalized in output:
double space -> single space, trailing space trimmed.

---

### Custom Tile Scaffold

```
CUSTOM TILE SCAFFOLD — variant: selfie
  SCSS: [data-mosaic-variant="selfie"] — overflow: visible required; ::before
        pseudo-element for portrait photo. In Figma the ::before bleed tile sits
        at x=-40, y=184 relative to the custom article wrapper, placing it 40px
        left of the tile left edge and 8px below the tile bottom (176+8=184).
        Image path and final offsets require manual authoring.
  JS:   .is-exiting class behavior on page transition. Keyed to
        document.querySelector('[data-mosaic-variant="selfie"]').
  Note: The ::before node is a bleed tile instance (custom: true, variant: selfie,
        type: bleed), 176x176, overlapping row 4 and bleeding into row 5 space.
```

---

## COMPILE_PROMPTS GAPS — Resolved

All gaps identified during this compile have been discussed with Craig and
resolved. The following decisions should be promoted into COMPILE_PROMPTS.md.

**Gap 1 — artDirection signal**
Resolution: `artDirection`, `scrollable`, and `mobileSrc` are not currently
detectable from Figma because the media component has no corresponding props.
The fix is in Figma, not the spec: add `artDirection` (boolean) and `scrollable`
(boolean) and `mobileSrc` (text) as props to the media component in CGDC-DS.
Until those props exist, spec must document that these fields are always
author-added post-compile. Compiler emits plain `bleed` and flags the tile.

**Gap 2 — scrollable signal**
Resolution: same as Gap 1. Tied to `artDirection` fix — both require new
props on the media component. Deferred to Figma component work.

**Gap 3 — Mixed frame+image tile**
Resolution: this pattern is valid and present in the design (ch02 p01 article-01).
The spec needs a new sub-section in §G for it. Compile rule: when a `frame`
tile's Slot contains both a `_mosaic-tile__richtext` instance and a `media`
instance, emit the text spans first, then emit:
`<img class="mosaic-tile__screenshot" src="TODO:src" alt="{alt from media instance}" />`
as the last child of the `content: |` block.

**Gap 4 — Nested span pattern**
Resolution: two distinct span patterns exist and both are valid.
- **Stacking spans** — separate Figma text nodes, one span per node. Signal:
  multiple text node siblings in the content slot.
- **Nested spans** — single Figma text node with mixed font runs. Signal:
  `getStyledTextSegments()` returns multiple segments with different `fontName`
  values on one text node.
Both patterns need to be documented in §G Span Vocabulary.

**Gap 5 — Mosaic ID format**
Resolution: adopt the verbose form as the new standard going forward.
Format: `<pageKey>--<chapterKey>--<pageKey>`
Example: `inficon-impact-manager--chapter-01--page-01`
The legacy shorthand form (`inficon--im--s01-c01-p01`) carries an `s01`
prefix from the old FF Grid section model and is now deprecated. It will be
migrated on the next compile pass. Add this deterministic format rule to
COMPILE_PROMPTS §G.

**Gap 6 — `theme: default` on bleed tiles**
Resolution: keep the ability to set theme on bleed tiles. The border color
coordinates with the image and is a valid design use case. Update COMPILE_PROMPTS:
emit `theme:` on bleed tiles when Figma explicitly sets it, including `default`.
Remove the "omit theme for bleed tiles" rule.

**Gap 7 — `rows:` counting convention**
Resolution: always count from row 1 to the last occupied row inclusive.
A page with a single tile at row 4 has `rows: 4`. Three empty rows above it
are implicit. Add this rule to COMPILE_PROMPTS §G.

**Gap 8 — `sizes:` media attribute**
Resolution: `sizes` is the `data-sizes` hint for the image optimization pipeline
(fed to `media.njk`). It is not a Figma concern — it is derivable at compile
time from the tile's col span using this table:

| Col span | `sizes` value | Math (span x 176 / 1200) |
|---|---|---|
| 1 col | `"20vw"` | 176 / 1200 = 14.7%, rounded up |
| 2 cols | `"31vw"` | 368 / 1200 = 30.7% |
| 3 cols | `"47vw"` | 560 / 1200 = 46.7% |
| 4 cols | `"63vw"` | 752 / 1200 = 62.7% |

The compiler reads `desktop.col` (e.g. `"2 / 4"` = 2-col span) and emits
the corresponding value. `TODO:sizes` is never needed. Add this derivation
table to COMPILE_PROMPTS §G under the media block rules.

**Gap 9 — `rows:` counting confirmed as gap 7 above**
No separate resolution needed.
