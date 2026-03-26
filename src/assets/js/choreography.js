/**
 * choreography.js
 * Scroll-driven beat sequencing for choreographed sections.
 *
 * Architecture:
 *   - Pages (beats) stack at the same position in the bento column.
 *   - P01 of each chapter is visible on load.
 *   - P02+ start below the viewport (translateY(100vh)).
 *   - A scroll listener maps scrollY to beat progress.
 *   - Each beat has a fixed scroll budget (BEAT_PX).
 *   - Beats overlap: the next beat starts moving before the current one lands.
 *   - chapter__content participates in beat sequencing via data-beat-index.
 *     It translates in with its assigned beat, same easing as bento pages.
 *   - No sticky positioning. No IntersectionObserver for beats.
 *   - Skeleton underlays: preserved in DOM but hidden — wired back in later.
 *
 * Tuneable constants (top of initChoreography):
 *   BEAT_PX   — scroll pixels per beat transition. Lower = snappier.
 *   OVERLAP   — fraction into current beat when next beat starts (0–1).
 *               0 = no overlap (sequential), 1 = immediate (all at once).
 */

(function () {
  "use strict";

  // -- Scroll indicator -----------------------------------------------------

  function initScrollIndicator() {
    const section = document.querySelector(".layout__section--choreographed");
    if (!section) return;

    const indicator = document.createElement("div");
    indicator.className = "scroll-indicator";
    indicator.setAttribute("aria-hidden", "true");
    indicator.innerHTML = `
            <span class="scroll-indicator__label">Scroll to explore</span>
            <span class="scroll-indicator__chevron"></span>
        `;
    section.appendChild(indicator);

    const hideIndicator = () => {
      if (window.scrollY > 20) {
        indicator.classList.add("scroll-indicator--hidden");
        window.removeEventListener("scroll", hideIndicator, { passive: true });
      }
    };
    window.addEventListener("scroll", hideIndicator, { passive: true });

    setTimeout(() => {
      indicator.classList.add("scroll-indicator--hidden");
    }, 6000);
  }

  // -- Skeleton underlays --------------------------------------------------
  // Preserved but hidden until skeleton choreography is re-wired.
  // Set SHOW_SKELETON = true to re-enable.

  const SHOW_SKELETON = false;

  function buildSkeletonUnderlay(chapter) {
    const allBentos = Array.from(chapter.querySelectorAll(".bento-grid"));
    if (!allBentos.length) return null;

    const areasRaw = chapter.dataset.skeletonAreas;
    if (!areasRaw) return null;

    const rows = areasRaw.split("|").map((row) => row.trim().split(/\s+/));
    const rowCount = rows.length;
    const colCount = rows[0].length;

    const grid = document.createElement("div");
    grid.className = "bento-grid bento-skeleton-underlay";
    grid.setAttribute("aria-hidden", "true");
    grid.dataset.underlayChapter = chapter.dataset.chapter;

    rows.forEach((cols, rowIdx) => {
      cols.forEach((cell, colIdx) => {
        if (cell === "s") {
          const article = document.createElement("article");
          article.className = "bento-cell bento-cell--skeleton";
          article.style.gridRow = rowIdx + 1 + " / " + (rowIdx + 2);
          article.style.gridColumn = colIdx + 1 + " / " + (colIdx + 2);
          grid.appendChild(article);
        }
      });
    });

    grid.style.gridTemplateColumns = "repeat(" + colCount + ", 176px)";
    grid.style.gridTemplateRows = "repeat(" + rowCount + ", 176px)";
    grid.style.gap = "16px";
    grid.style.containerType = "normal";

    const bentoRect = allBentos[0].getBoundingClientRect();
    grid.style.position = "fixed";
    grid.style.left = Math.round(bentoRect.left) + "px";
    grid.style.top = "64px";
    grid.style.zIndex = "0";
    grid.style.pointerEvents = "none";
    grid.style.visibility = "hidden"; // hidden until re-wired

    return grid;
  }

  function injectSkeletonUnderlays(chapters) {
    if (!SHOW_SKELETON) return;
    chapters.forEach((chapter) => {
      const underlay = buildSkeletonUnderlay(chapter);
      if (underlay) document.body.appendChild(underlay);
    });
  }

  // -- Scroll-driven choreography ------------------------------------------

  function initChoreography() {
    const section = document.querySelector(".layout__section--choreographed");
    if (!section) return;

    // ── Tuneable constants ───────────────────────────────────────────────
    const BEAT_PX    = 300;  // scroll pixels to complete one beat transition
    const OVERLAP    = 0.5;  // fraction into beat N when beat N+1 starts moving
    const CHROME_TOP = 64;   // navbar(48) + gap(16) — top of sticky bento zone
    // ────────────────────────────────────────────────────────────────────

    const chapterList = Array.from(
      section.querySelectorAll(".layout__chapter:not(.page-header)"),
    );

    // -- Build chapter data -----------------------------------------------
    // For each chapter, collect its pages, content block, and compute scroll ranges.

    const chapterData = chapterList.map((chapter, chapterIdx) => {
      const pages = Array.from(
        chapter.querySelectorAll(".chapter__bento .layout__page"),
      );
      const bentos = Array.from(chapter.querySelectorAll(".bento-grid"));
      const content = chapter.querySelector(".chapter__content");
      const contentBeatIndex = content
        ? parseInt(content.dataset.beatIndex || "1", 10)
        : 1;

      // Bento height — use offsetHeight (stable, not affected by transform)
      const bentoH = bentos.reduce((max, b) => {
        return b.offsetHeight > max ? b.offsetHeight : max;
      }, 0);

      return { chapter, pages, bentos, bentoH, chapterIdx, content, contentBeatIndex };
    });

    // -- Apply chapter overlap (negative margin) --------------------------
    const ROW_UNIT = 192; // 176px cell + 16px gap
    chapterList.forEach((chapter) => {
      const offset = parseInt(chapter.dataset.chapterOffset || "0", 10);
      if (offset > 0) {
        chapter.style.marginTop = -1 * offset * ROW_UNIT + "px";
      }
    });

    // -- Set chapter scroll heights ---------------------------------------
    // Chapter height = bentoH + (pageCount × BEAT_PX) + CHROME_TOP
    // This gives the document the correct scroll distance for the chapter.
    chapterData.forEach(({ chapter, pages, bentoH }) => {
      // Chapter height must be tall enough to:
      // 1. Hold all beats in sticky position while they build
      // 2. Keep the chapter sticky until all pages have settled
      const h = bentoH + pages.length * BEAT_PX + CHROME_TOP;
      chapter.style.height = h + "px";
    });

    // -- Stack pages at origin --------------------------------------------
    // .chapter__bento is sticky — it locks to CHROME_TOP and holds
    // while pages build up inside it. Pages are absolutely positioned
    // children all at top:0, driven by translateY from below.
    chapterList.forEach((chapter) => {
      const bento = chapter.querySelector(".chapter__bento");
      if (bento) {
        const data = chapterData.find((d) => d.chapter === chapter);
        if (!data) return;
        bento.style.position = "sticky";
        bento.style.top      = CHROME_TOP + "px";
        bento.style.height   = data.bentoH + "px";
        bento.style.alignSelf = "start";
      }
    });

    chapterData.forEach(({ pages, bentoH }) => {
      pages.forEach((page, i) => {
        page.style.position  = "absolute";
        page.style.top       = "0";
        page.style.left      = "0";
        page.style.width     = "752px"; // MONEY bento width — CONTRACT_EXCEPTION
        page.style.height    = bentoH + "px";
        page.style.zIndex    = String(pages.length - i);
        if (i === 0) {
          page.style.transform = "translateY(0)";
        } else {
          page.style.transform = "translateY(110vh)";
        }
      });
    });

    // -- Set initial content state ----------------------------------------
    // content with beatIndex 1 is visible on load (same as P01).
    // content with beatIndex > 1 starts below the viewport.
    chapterData.forEach(({ content, contentBeatIndex }) => {
      if (!content) return;
      if (contentBeatIndex <= 1) {
        content.style.transform = "translateY(0)";
        content.style.opacity   = "1";
      } else {
        content.style.transform = "translateY(110vh)";
        content.style.opacity   = "0";
      }
    });

    // -- Compute global scroll ranges per beat ----------------------------
    // Each beat has a scroll range [start, end].
    // Beat N+1 starts at beat N start + (OVERLAP × BEAT_PX).

    const beats = []; // { chapterIdx, pageIdx, page, content, scrollStart, scrollEnd }

    chapterData.forEach(({ chapter, pages, chapterIdx, content, contentBeatIndex }) => {
      const chapterStart = chapter.offsetTop;

      pages.forEach((page, pageIdx) => {
        if (pageIdx === 0) return; // P01 is visible on load, no beat needed

        const beatOffset  = (pageIdx - 1) * OVERLAP * BEAT_PX;
        const scrollStart = chapterStart + beatOffset;
        const scrollEnd   = scrollStart + BEAT_PX;

        // Attach content to its assigned beat
        const beatContent = (content && contentBeatIndex === pageIdx + 1)
          ? content
          : null;

        beats.push({ chapterIdx, pageIdx, page, scrollStart, scrollEnd, beatContent });
      });
    });

    // -- Scroll listener --------------------------------------------------

    let rafPending = false;

    function update() {
      rafPending = false;
      const scrollY = window.scrollY;

      beats.forEach(({ page, scrollStart, scrollEnd, beatContent }) => {
        if (scrollY <= scrollStart) {
          page.style.transform = "translateY(110vh)";
          if (beatContent) {
            beatContent.style.transform = "translateY(110vh)";
            beatContent.style.opacity   = "0";
          }
        } else if (scrollY >= scrollEnd) {
          page.style.transform = "translateY(0)";
          if (beatContent) {
            beatContent.style.transform = "translateY(0)";
            beatContent.style.opacity   = "1";
          }
        } else {
          const progress = (scrollY - scrollStart) / (scrollEnd - scrollStart);
          const eased    = 1 - Math.pow(1 - progress, 2);
          const translateY = (1 - eased) * 110;
          page.style.transform = "translateY(" + translateY + "vh)";
          if (beatContent) {
            beatContent.style.transform = "translateY(" + translateY + "vh)";
            beatContent.style.opacity   = String(eased);
          }
        }
      });
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );

    // Run once on load to set initial state
    update();

    // -- Inject skeleton underlays (hidden until re-wired) ----------------
    requestAnimationFrame(() => {
      injectSkeletonUnderlays(chapterList);
    });
  }

  // -- Init -----------------------------------------------------------------

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initChoreography();
      initScrollIndicator();
    });
  } else {
    initChoreography();
    initScrollIndicator();
  }

})();
