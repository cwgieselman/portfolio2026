/**
 * choreography.js
 * Scroll-driven beat sequencing for choreographed sections.
 *
 * Architecture:
 *   - Each chapter has a skeleton page (P00) as the first page in the stack.
 *     P00 is permanently visible at z-index 0 — never translated, never animated.
 *   - P01+ start below the viewport (translateY(110vh)) and scroll in as beats.
 *   - A scroll listener maps scrollY to beat progress.
 *   - Each beat has a fixed scroll budget (BEAT_PX).
 *   - Beats overlap: the next beat starts moving before the current one lands.
 *   - chapter__content fades in/out via class toggling tied to beat ranges.
 *
 * Tuneable constants (top of initChoreography):
 *   BEAT_PX   — scroll pixels per beat transition. Lower = snappier.
 *   OVERLAP   — fraction into current beat when next beat starts (0–1).
 */

(function () {
  "use strict";

  // -- Scroll indicator -----------------------------------------------------

  function initScrollIndicator() {
    const section = document.querySelector(".layout__story--choreographed");
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

  // -- Scroll-driven choreography ------------------------------------------

  function initChoreography() {
    const section = document.querySelector(".layout__story--choreographed");
    if (!section) return;

    // ── Tuneable constants ───────────────────────────────────────────────
    const BEAT_PX    = 300;  // scroll pixels to complete one beat transition
    const OVERLAP    = 0.5;  // fraction into beat N when beat N+1 starts moving
    const CHROME_TOP = 64;   // navbar(48) + gap(16) — mosaic sticks just below navbar
    const mosaicH    = 752;  // CONTRACT_EXCEPTION: MONEY mosaic height (4×176 + 3×16)
    const GAP_PX     = 16;   // px offset between stacked page landing positions
    // ────────────────────────────────────────────────────────────────────

    const chapterList = Array.from(
      section.querySelectorAll(".layout__chapter:not(.page-header)"),
    );

    // -- Build chapter data -----------------------------------------------

    const chapterData = chapterList.map((chapter, chapterIdx) => {
      const pages = Array.from(
        chapter.querySelectorAll(".chapter__mosaic .layout__page"),
      );
      return { chapter, pages, mosaicH, chapterIdx };
    });

    // -- Apply chapter overlap (negative margin) --------------------------
    const ROW_UNIT = 192; // 176px cell + 16px gap
    chapterList.forEach((chapter) => {
      const offset = parseInt(chapter.dataset.chapterOffset || "0", 10);
      if (offset > 0) {
        // FIX: use -mosaicH instead of -(offset * ROW_UNIT).
        // The row-based value (-192px) left a 644px dead zone between chapters —
        // ch1's mosaic unstuck and scrolled away before ch2's appeared.
        // -mosaicH (-752px) pulls ch2's container up far enough that its mosaic
        // sticks at exactly the scrollY where ch1's mosaic unsticks. Gap = 0.
        // Note: chapterOffset in YAML still governs the visual skeleton row overlap;
        // it is a design value and does not determine this margin.
        chapter.style.marginTop = -1 * mosaicH + "px";
      }
    });

    // -- Set chapter scroll heights ---------------------------------------
    chapterData.forEach(({ chapter, pages, mosaicH }) => {
      // pages includes P00 (skeleton) — subtract 1 for beat count
      const beatCount = pages.length - 1;
      const h = mosaicH + beatCount * BEAT_PX + CHROME_TOP;
      chapter.style.height = h + "px";
    });

    // -- Stick chapter__mosaic ---------------------------------------------
    chapterList.forEach((chapter) => {
      const mosaic = chapter.querySelector(".chapter__mosaic");
      if (mosaic) {
        const data = chapterData.find((d) => d.chapter === chapter);
        if (!data) return;
        mosaic.style.position  = "sticky";
        mosaic.style.top       = CHROME_TOP + "px";
        mosaic.style.height    = data.mosaicH + "px";
        mosaic.style.alignSelf = "start";
      }
    });

    // -- Stack pages at origin --------------------------------------------
    // P00 (skeleton): permanent underlay — z-index 0, never translated.
    // P01+: start off-screen, translate in as beats.
    chapterData.forEach(({ pages, mosaicH }) => {
      pages.forEach((page, i) => {
        page.style.position = "absolute";
        page.style.top      = "0";
        page.style.left     = "0";
        page.style.width    = "752px"; // CONTRACT_EXCEPTION: MONEY mosaic width
        page.style.height   = mosaicH + "px";
        page.style.zIndex   = String(pages.length - 1 - i);
        if (i === 0) {
          // P00 — skeleton underlay, always visible
          page.style.transform = "translateY(0)";
          page.style.zIndex    = "0";
        } else {
          // P01+ — start off-screen
          page.style.transform = "translateY(110vh)";
        }
      });
    });

    // -- Compute global scroll ranges per beat ----------------------------

    const beats = [];
    const contentRanges = [];

    chapterData.forEach(({ chapter, pages, chapterIdx, mosaicH }) => {
      const chapterStart = chapter.offsetTop;
      const beatCount    = pages.length - 1;
      const chapterEnd   = chapterStart + mosaicH + beatCount * BEAT_PX + CHROME_TOP;

      // pages[0] is skeleton — skip it. Beats start at pages[1].
      pages.forEach((page, pageIdx) => {
        if (pageIdx === 0) return; // P00 skeleton — no beat

        const beatIdx     = pageIdx - 1; // 0-based beat index
        const beatOffset  = beatIdx * OVERLAP * BEAT_PX;
        const scrollStart = chapterStart + beatOffset;
        const scrollEnd   = scrollStart + BEAT_PX;

        // P01 (beatIdx 0) is when field text should appear
        if (beatIdx === 0) {
          const content = chapter.querySelector(".chapter__content");
          const selfieCell = document.querySelector("[data-mosaic-variant=\"selfie\"]");
          if (content) {
            contentRanges.push({ content, selfieCell, showAt: scrollStart, hideAt: chapterEnd });
          }
        }

        // landY: the resting translateY for this page once it has fully arrived.
        // P01 (beatIdx 0) lands at 0. P02 lands at -GAP_PX. P03 at -2*GAP_PX.
        // This creates a visible sliver of the page beneath at the bottom edge.
        beats.push({ chapterIdx, pageIdx, page, scrollStart, scrollEnd,
                     landY: -(beatIdx * GAP_PX) });
      });
    });

    // -- Scroll listener --------------------------------------------------

    let rafPending = false;

    function update() {
      rafPending = false;
      const scrollY = window.scrollY;

      // Field text visibility
      contentRanges.forEach(({ content, selfieCell, showAt, hideAt }) => {
        if (scrollY < showAt) {
          content.classList.remove("is-visible", "is-exiting");
          if (selfieCell) selfieCell.classList.remove("is-exiting");
        } else if (scrollY >= hideAt) {
          content.classList.remove("is-visible");
          content.classList.add("is-exiting");
          if (selfieCell) selfieCell.classList.add("is-exiting");
        } else {
          content.classList.add("is-visible");
          content.classList.remove("is-exiting");
          if (selfieCell) selfieCell.classList.remove("is-exiting");
        }
      });

      // Beat translations
      beats.forEach(({ page, scrollStart, scrollEnd, landY }) => {
        if (scrollY <= scrollStart) {
          page.style.transform = "translateY(110vh)";
        } else if (scrollY >= scrollEnd) {
          page.style.transform = `translateY(${landY}px)`;
        } else {
          const progress  = (scrollY - scrollStart) / (scrollEnd - scrollStart);
          const eased     = 1 - Math.pow(1 - progress, 2);
          // Interpolate from 110vh down to landY in px (avoids vh/px unit mixing mid-tween)
          const vhPx      = window.innerHeight * 1.1;
          const currentPx = vhPx + (landY - vhPx) * eased;
          page.style.transform = `translateY(${currentPx.toFixed(1)}px)`;
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

    update();
  }

  // -- Page header frosting ------------------------------------------------
  // Fades in the frosted glass layer once the header has scrolled to its
  // stuck position. Threshold = header's margin-block-start on load (176px).

  function initFrosting() {
    const frosting = document.querySelector(".page-header__frosting");
    if (!frosting) return;

    const FROST_THRESHOLD = 176; // margin-block-start on .page-header — load offset

    function updateFrosting() {
      frosting.classList.toggle("is-frosted", window.scrollY >= FROST_THRESHOLD);
    }

    window.addEventListener("scroll", updateFrosting, { passive: true });
    updateFrosting(); // run on load in case page is already scrolled
  }

  // -- Init -----------------------------------------------------------------

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initChoreography();
      initScrollIndicator();
      initFrosting();
    });
  } else {
    initChoreography();
    initScrollIndicator();
    initFrosting();
  }

})();
