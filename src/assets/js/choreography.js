/**
 * choreography.js
 * Scroll-driven beat sequencing for choreographed sections.
 *
 * Architecture:
 *   - Each chapter has a skeleton page (P00) as the first page in the stack.
 *     P00 is permanently visible — never translated, never animated.
 *   - P01+ start below the viewport (translateY(110vh)) and scroll in as beats.
 *   - A scroll listener maps scrollY to beat progress.
 *   - Each beat has a fixed scroll budget (BEAT_PX).
 *   - Beats overlap: the next beat starts moving before the current one lands.
 *   - chapter__content fades in/out via class toggling tied to beat ranges.
 *
 * Inter-chapter transition ("half note"):
 *   When C(N) is a transition source and C(N+1) is a transition target:
 *
 *   1. C(N) last beat lands
 *      → C(N+1) skeleton (position:fixed sibling) fades in over TRANSITION_FADE_PX
 *        scroll pixels. Positioned at 1-row overlap with C(N)'s bottom edge.
 *   2. Brief scroll-bound pause (TRANSITION_PAUSE_PX).
 *      → Interlock held. Assembly rhythm maintained.
 *   3. Push phase (BEAT_PX).
 *      → C(N+1) B01 scrolls in from below. Skeleton slides from interlock position
 *        up to CHROME_TOP, tracking B01's arrival.
 *   4. C(N+1) B01 lands → C(N) releases. C(N) scrolls off. C(N+1) goes sticky.
 *   5. At TRANSITION_OVERLAP (90%) through the push phase → C(N+1) B02 starts.
 *      Quarter-note beat rhythm resumes.
 *
 * Data model:
 *   Transition sources:    data-chapter-key on .layout__chapter
 *   Transition targets:    .chapter__skeleton[data-for][data-row-overlap] siblings
 *   Target chapter flag:   .layout__chapter has skeletonExtracted=true in YAML
 *                          → no P00 in its .chapter__mosaic
 *
 * Tuneable constants:
 *   BEAT_PX             — scroll pixels per beat transition
 *   OVERLAP             — fraction into beat N when beat N+1 starts (0–1)
 *   TRANSITION_FADE_PX  — scroll pixels for skeleton fade-in
 *   TRANSITION_PAUSE_PX — scroll pixels for interlock hold
 *   TRANSITION_OVERLAP  — fraction into push beat when C(N+1) B02 starts (0–1)
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

    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    // ── Tuneable constants ───────────────────────────────────────────────
    const BEAT_PX             = 300;  // scroll pixels to complete one beat transition
    const OVERLAP             = 0.5;  // fraction into beat N when beat N+1 starts
    const CHROME_TOP          = 64;   // navbar(48) + gap(16)
    const mosaicH             = 752;  // CONTRACT_EXCEPTION: MONEY mosaic height (4×176 + 3×16)
    const CELL_PX             = 176;  // mosaic cell height/width
    const GAP_PX              = 16;   // mosaic grid gap
    const ROW_UNIT            = CELL_PX + GAP_PX; // 192px — row stride including gap
    const TRANSITION_FADE_PX  = 50;   // default scroll budget: C(N+1) skeleton fade-in
    const TRANSITION_PAUSE_PX = 50;   // default scroll budget: hold interlocked state
    const TRANSITION_OVERLAP  = 0.9;  // push beat at 90% → C(N+1) B02 starts
    // Push travel is derived per-transition from rowOverlap — not a global constant.
    // C(N+1) mosaic lands at the interlock position so B01 fills in over the skeleton:
    //   pushTravelPx = interlockTop - CHROME_TOP
    //                = mosaicH - rowOverlap * ROW_UNIT + GAP_PX
    // For rowOverlap=1: 752 - 192 + 16 = 576px
    // ────────────────────────────────────────────────────────────────────

    const chapterList = Array.from(
      section.querySelectorAll(".layout__chapter:not(.page-header)"),
    );

    // Skeleton sibling elements — each marks an inter-chapter transition boundary
    const skeletonEls = Array.from(section.querySelectorAll(".chapter__skeleton"));

    // -- Build chapter data -----------------------------------------------

    const chapterData = chapterList.map((chapter, chapterIdx) => {
      const chapterKey         = chapter.dataset.chapterKey || "";
      const pages              = Array.from(
        chapter.querySelectorAll(".chapter__mosaic .layout__page"),
      );
      // Transition target: this chapter's P00 was extracted as a sibling skeleton.
      // Its pages array contains only beats (no skeleton page).
      const isTransitionTarget = skeletonEls.some(s => s.dataset.for === chapterKey);
      // Transition source: computed below once all chapters are known.
      return { chapter, pages, mosaicH, chapterIdx, chapterKey, isTransitionTarget,
               isTransitionSource: false };
    });

    // A chapter is a transition source if the next chapter is a transition target.
    chapterData.forEach((data, idx) => {
      if (idx < chapterData.length - 1) {
        data.isTransitionSource = chapterData[idx + 1].isTransitionTarget;
      }
    });

    // -- Apply chapter overlap (negative margin) --------------------------

    chapterList.forEach((chapter, idx) => {
      const offset = parseInt(chapter.dataset.chapterOffset || "0", 10);
      if (offset > 0) {
        const data = chapterData[idx];
        if (data?.isTransitionTarget) {
          // C(N+1) goes sticky pushTravelPx after B01 lands.
          // Same formula as skeleton registration: mosaicH - rowOverlap * ROW_UNIT + GAP_PX
          const skEl      = skeletonEls.find(s => s.dataset.for === data.chapterKey);
          const ro        = skEl ? parseInt(skEl.dataset.rowOverlap || "0", 10) : 0;
          const ptPx      = mosaicH - ro * ROW_UNIT + GAP_PX;
          chapter.style.marginTop = -(mosaicH - ptPx) + "px";
        } else {
          chapter.style.marginTop = -mosaicH + "px";
        }
      }
    });

    // -- Set chapter scroll heights ---------------------------------------

    chapterData.forEach(({ chapter, pages, isTransitionSource, isTransitionTarget }) => {
      let h;
      if (isTransitionSource) {
        // Exact beat range (no dead scroll) + full transition budget.
        // The push phase (BEAT_PX) is the last item — C(N) releases when it ends.
        // Read per-transition fade/pause from the skeleton element if present.
        const nextChapterKey = chapterData[chapterData.indexOf(
          chapterData.find(d => d.chapter === chapter)
        ) + 1]?.chapterKey;
        const skEl    = nextChapterKey
          ? skeletonEls.find(s => s.dataset.for === nextChapterKey)
          : null;
        const fadePx  = skEl?.dataset.fadePx  ? parseInt(skEl.dataset.fadePx,  10) : TRANSITION_FADE_PX;
        const pausePx = skEl?.dataset.pausePx ? parseInt(skEl.dataset.pausePx, 10) : TRANSITION_PAUSE_PX;
        const beatCount       = pages.length - 1;
        const actualBeatRange = (beatCount - 1) * OVERLAP * BEAT_PX + BEAT_PX;
        h = mosaicH + CHROME_TOP + actualBeatRange + fadePx + pausePx + BEAT_PX;
      } else if (isTransitionTarget) {
        // P00 extracted — all pages are beats. Use pages.length, not pages.length-1.
        const beatCount = pages.length;
        h = mosaicH + beatCount * BEAT_PX + CHROME_TOP;
      } else {
        const beatCount = pages.length - 1;
        h = mosaicH + beatCount * BEAT_PX + CHROME_TOP;
      }
      chapter.style.height = h + "px";
    });

    // -- Set chapter__mosaic height and z-index --------------------------

    chapterList.forEach((chapter, chapterIdx) => {
      const mosaic = chapter.querySelector(".chapter__mosaic");
      if (!mosaic) return;
      const data = chapterData.find(d => d.chapter === chapter);
      if (!data) return;
      mosaic.style.height = data.mosaicH + "px";
      // z-index: earlier chapters paint above later ones.
      // +2 offset ensures chapter mosaics always clear skeleton z-index (1).
      mosaic.style.zIndex = String(chapterList.length - chapterIdx + 1);
    });

    // -- Position skeleton elements --------------------------------------
    // Skeleton is position:fixed — align its left edge to the chapter mosaic column.
    // Read mosaic left at init (scrollY=0) — sticky doesn't affect horizontal position.

    skeletonEls.forEach(skeletonEl => {
      const forKey       = skeletonEl.dataset.for;
      const targetChapter = chapterList.find(ch => ch.dataset.chapterKey === forKey);
      if (!targetChapter) return;
      const mosaic = targetChapter.querySelector(".chapter__mosaic");
      if (!mosaic) return;
      const mosaicLeft = mosaic.getBoundingClientRect().left;
      skeletonEl.style.left = mosaicLeft + "px";
      skeletonEl.style.zIndex = "1"; // above background, below chapter mosaics (z ≥ 3)
    });

    // -- Hide non-first chapter mosaics ----------------------------------
    // Transition targets are revealed at push phase start via update().
    // Non-transition non-first chapters use the standard fade-in approach.

    chapterData.forEach(({ chapter, chapterIdx }) => {
      if (chapterIdx === 0) return;
      const mosaic = chapter.querySelector(".chapter__mosaic");
      if (mosaic) mosaic.style.opacity = "0";
    });

    // -- Stack pages at origin --------------------------------------------

    chapterData.forEach(({ pages, isTransitionTarget }) => {
      pages.forEach((page, i) => {
        page.style.width  = "752px"; // CONTRACT_EXCEPTION: MONEY mosaic width
        page.style.height = mosaicH + "px";
        if (!isTransitionTarget) {
          // Normal chapter: i=0 is P00 skeleton (permanent underlay), i>0 are beats.
          page.style.zIndex = String(i);
          page.style.transform = i === 0 ? "translateY(0)" : "translateY(110vh)";
        } else {
          // Transition target: no P00 — all pages are beats, all start off-screen.
          page.style.zIndex    = String(i + 1); // shift up since no P00 at z=0
          page.style.transform = "translateY(110vh)";
        }
      });
    });

    // -- Compute scroll ranges: beats + transitions ----------------------

    const beats             = []; // { page, scrollStart, scrollEnd, landY }
    const contentRanges     = []; // { content, selfieCell, showAt, hideAt }
    const skeletonTransitions = []; // { el, rowOverlap, fadeStart, fadeEnd, pauseEnd, pushEnd }

    chapterData.forEach((data) => {
      const { chapter, pages, chapterIdx, chapterKey,
              isTransitionSource, isTransitionTarget } = data;
      const chapterStart = chapter.offsetTop;

      // ── Transition source (C01) ──────────────────────────────────────
      if (isTransitionSource) {
        const beatCount      = pages.length - 1;
        const lastBeatEnd    = chapterStart + (beatCount - 1) * OVERLAP * BEAT_PX + BEAT_PX;

        // Transition timeline
        const fadeStart = lastBeatEnd;
        const fadeEnd   = fadeStart  + TRANSITION_FADE_PX;
        const pauseEnd  = fadeEnd    + TRANSITION_PAUSE_PX;
        const pushEnd   = pauseEnd   + BEAT_PX; // = C(N) release point

        // Register skeleton transition
        const nextData    = chapterData[chapterIdx + 1];
        const skeletonEl  = nextData
          ? skeletonEls.find(s => s.dataset.for === nextData.chapterKey) || null
          : null;
        const rowOverlap  = skeletonEl
          ? parseInt(skeletonEl.dataset.rowOverlap || "0", 10)
          : 0;

        if (skeletonEl) {
          // Per-transition tuning — fade and pause override globals when set in YAML.
          const fadePx  = skeletonEl.dataset.fadePx
            ? parseInt(skeletonEl.dataset.fadePx,  10) : TRANSITION_FADE_PX;
          const pausePx = skeletonEl.dataset.pausePx
            ? parseInt(skeletonEl.dataset.pausePx, 10) : TRANSITION_PAUSE_PX;
          // Push travel derived from rowOverlap — C(N+1) mosaic lands at interlockTop
          // so B01 fills in exactly over the skeleton before the pair rises together.
          const pushTravelPx = mosaicH - rowOverlap * ROW_UNIT + GAP_PX;
          const tFadeEnd  = fadeStart + fadePx;
          const tPauseEnd = tFadeEnd  + pausePx;
          const tPushEnd  = tPauseEnd + BEAT_PX;
          skeletonTransitions.push({ el: skeletonEl, rowOverlap, fadePx, pausePx,
                                     pushTravelPx,
                                     fadeStart,
                                     fadeEnd:       tFadeEnd,
                                     pauseEnd:      tPauseEnd,
                                     pushEnd:       tPushEnd,
                                     pushTravelEnd: tPushEnd + pushTravelPx });
        }

        // Normal beats for source chapter (P01..PN)
        pages.forEach((page, pageIdx) => {
          if (pageIdx === 0) return; // P00 skeleton — no beat
          const beatIdx    = pageIdx - 1;
          const scrollStart = chapterStart + beatIdx * OVERLAP * BEAT_PX;
          const scrollEnd   = scrollStart + BEAT_PX;

          if (beatIdx === 0) {
            const content = chapter.querySelector(".chapter__content");
            if (content) {
              // Exit at the chapter's release point (= tPushEnd), not chapterEnd.
              // C(N) content scrolls off with the chapter when C(N) releases.
              const releasePoint = chapterStart + parseInt(chapter.style.height) - mosaicH - CHROME_TOP;
              contentRanges.push({ content, selfieCell: null, showAt: scrollStart,
                                   hideAt: releasePoint });
            }
          }
          beats.push({ chapterIdx, pageIdx, page, scrollStart, scrollEnd, landY: 0 });
        });

        // Push beat: C(N+1) B01 scrolls in during C(N)'s transition window.
        // Its scroll range sits inside C(N)'s chapter height — C(N) stays sticky.
        if (nextData && nextData.pages.length > 0) {
          const pushPage = nextData.pages[0]; // B01 of transition target
          beats.push({
            chapterIdx: nextData.chapterIdx,
            pageIdx: 0,
            page: pushPage,
            scrollStart: pauseEnd,
            scrollEnd:   pushEnd,
            landY: 0,
            isPushBeat: true,
          });
        }

        return; // source chapter fully handled
      }

      // ── Transition target (C02) ──────────────────────────────────────
      if (isTransitionTarget) {
        // Find the skeleton transition registered when the source chapter was processed.
        const skeletonEl = skeletonEls.find(s => s.dataset.for === chapterKey);
        const pushData   = skeletonEl
          ? skeletonTransitions.find(t => t.el === skeletonEl)
          : null;

        // B01 is already registered as the push beat — start from B02 (pages[1]+).
        // B02 starts when B01 is 90% through its push travel (skeleton nearly at CHROME_TOP),
        // giving the skeleton time to establish itself before the next beat arrives.
        const b02ScrollStart = pushData
          ? pushData.pushEnd + TRANSITION_OVERLAP * pushData.pushTravelPx
          : chapterStart;

        pages.forEach((page, pageIdx) => {
          if (pageIdx === 0) return; // B01 registered as push beat — skip

          // pageIdx=1 → B02 (first "own" beat), pageIdx=2 → B03, etc.
          const ownBeatIdx  = pageIdx - 1; // 0-based own beat index (B02=0, B03=1...)
          const scrollStart = ownBeatIdx === 0
            ? b02ScrollStart
            : b02ScrollStart + ownBeatIdx * OVERLAP * BEAT_PX;
          const scrollEnd   = scrollStart + BEAT_PX;

          beats.push({ chapterIdx, pageIdx, page, scrollStart, scrollEnd, landY: 0 });
        });

        // Chapter content for transition target: reveal when B01 lands (C(N) releases).
        // C(N+1) content appears at the same moment C(N) content exits — clean exchange.
        const content = chapter.querySelector(".chapter__content");
        if (content) {
          const chapterEnd = chapterStart + parseInt(chapter.style.height);
          const showAt     = pushData ? pushData.pushEnd : chapterStart;
          contentRanges.push({ content, selfieCell: null, showAt, hideAt: chapterEnd });
        }

        return; // target chapter fully handled
      }

      // ── Normal chapter (no transition) ───────────────────────────────
      const chapterEnd = chapterStart + parseInt(chapter.style.height);

      pages.forEach((page, pageIdx) => {
        if (pageIdx === 0) return; // P00 skeleton — no beat
        const beatIdx    = pageIdx - 1;
        const scrollStart = chapterStart + beatIdx * OVERLAP * BEAT_PX;
        const scrollEnd   = scrollStart + BEAT_PX;

        if (beatIdx === 0) {
          const content    = chapter.querySelector(".chapter__content");
          const selfieCell = document.querySelector("[data-mosaic-variant=\"selfie\"]");
          if (content) {
            contentRanges.push({ content, selfieCell, showAt: scrollStart,
                                 hideAt: chapterEnd });
          }
        }
        beats.push({ chapterIdx, pageIdx, page, scrollStart, scrollEnd, landY: 0 });
      });
    });

    // -- Scroll listener --------------------------------------------------

    let rafPending = false;

    function update() {
      rafPending = false;
      const scrollY = window.scrollY;

      // ── Field text visibility ─────────────────────────────────────────
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

      // ── Skeleton transitions ──────────────────────────────────────────
      skeletonTransitions.forEach(({ el, rowOverlap, fadeStart, fadeEnd, pauseEnd, pushEnd, pushTravelPx, pushTravelEnd }) => {
        // Interlock position: align C(N+1) row-1 with C(N) row-(totalRows-rowOverlap+1).
        // mosaicH = N*CELL_PX + (N-1)*GAP_PX — the last row has no trailing gap, so
        // mosaicH - rowOverlap*ROW_UNIT undershoots by GAP_PX. Add it back.
        const interlockTop = CHROME_TOP + mosaicH - rowOverlap * ROW_UNIT + GAP_PX;

        if (scrollY < fadeStart) {
          // Before transition: hidden at interlock position, ready to reveal
          el.style.opacity = "0";
          el.style.top     = interlockTop + "px";
        } else if (scrollY < fadeEnd) {
          // Fade in: scroll-bound, subtle
          const progress   = (scrollY - fadeStart) / TRANSITION_FADE_PX;
          el.style.opacity = String(progress);
          el.style.top     = interlockTop + "px";
        } else if (scrollY < pauseEnd) {
          // Pause: hold interlock, full opacity
          el.style.opacity = "1";
          el.style.top     = interlockTop + "px";
        } else if (scrollY < pushEnd) {
          // Push phase: skeleton holds at interlock position while C(N+1) B01 arrives.
          el.style.opacity = "1";
          el.style.top     = interlockTop + "px";
        } else if (scrollY < pushTravelEnd) {
          // Push travel: B01 has landed. C(N) released and scrolling off.
          // C(N+1) still in document flow, rising toward sticky.
          // Skeleton slides from interlockTop → CHROME_TOP in sync with the travel.
          const travelProgress = (scrollY - pushEnd) / pushTravelPx;
          const currentTop     = interlockTop + (CHROME_TOP - interlockTop) * travelProgress;
          el.style.opacity     = "1";
          el.style.top         = currentTop.toFixed(1) + "px";
        } else {
          // C(N+1) is now sticky at CHROME_TOP — skeleton is its permanent underlay.
          el.style.opacity = "1";
          el.style.top     = CHROME_TOP + "px";
        }
      });

      // ── Chapter mosaic opacity ────────────────────────────────────────
      chapterData.forEach(({ chapter, chapterIdx, chapterKey,
                              isTransitionTarget, isTransitionSource }) => {
        const mosaic = chapter.querySelector(".chapter__mosaic");
        if (!mosaic) return;
        const h       = parseInt(chapter.style.height);
        const release = chapter.offsetTop + h - mosaicH - CHROME_TOP;
        const isFirst = chapterIdx === 0;
        const isLast  = chapterIdx === chapterData.length - 1;

        if (isTransitionTarget) {
          // Reveal C(N+1) mosaic at push phase start (B01 starts scrolling in)
          const skeletonEl = skeletonEls.find(s => s.dataset.for === chapterKey);
          const pushData   = skeletonEl
            ? skeletonTransitions.find(t => t.el === skeletonEl)
            : null;
          const showAt = pushData ? pushData.pauseEnd : 0;
          mosaic.style.opacity = scrollY >= showAt ? "1" : "0";
          return;
        }

        // Fade out after release — normal non-last chapters only.
        // Transition source (C01) scrolls off naturally; no fade applied.
        if (!isLast && !isTransitionSource && scrollY > release) {
          const exitDistance = CHROME_TOP + mosaicH;
          const opacity = Math.max(0, 1 - (scrollY - release) / exitDistance);
          mosaic.style.opacity = String(opacity);
          return;
        }

        // First chapter or transition source: always fully visible while sticky
        if (isFirst || isTransitionSource) {
          mosaic.style.opacity = "1";
          return;
        }

        // Normal non-first chapters: fade in as they approach sticky
        const stickyStart = chapter.offsetTop - CHROME_TOP;
        const fadeInStart = stickyStart - BEAT_PX;
        const opacity     = Math.min(1, Math.max(0, (scrollY - fadeInStart) / BEAT_PX));
        mosaic.style.opacity = String(opacity);
      });

      // ── Beat translations ─────────────────────────────────────────────
      beats.forEach(({ page, scrollStart, scrollEnd, landY }) => {
        if (scrollY <= scrollStart) {
          page.style.transform = "translateY(110vh)";
        } else if (scrollY >= scrollEnd) {
          page.style.transform = `translateY(${landY}px)`;
        } else {
          const progress  = (scrollY - scrollStart) / (scrollEnd - scrollStart);
          const eased     = 1 - Math.pow(1 - progress, 2);
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

  function initFrosting() {
    const frosting = document.querySelector(".page-header__frosting");
    if (!frosting) return;

    const FROST_THRESHOLD = 176;

    function updateFrosting() {
      frosting.classList.toggle("is-frosted", window.scrollY >= FROST_THRESHOLD);
    }

    window.addEventListener("scroll", updateFrosting, { passive: true });
    updateFrosting();
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
