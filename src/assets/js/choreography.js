/**
 * choreography.js
 * Scroll choreography for choreographed section pages.
 *
 * Behavior:
 *   - On load: beat-01 renders fully with real cells visible.
 *     Skeleton articles are injected into beat-01's empty grid positions.
 *   - Beats 02+ start hidden (bento--pending) and reveal on scroll.
 *   - A scroll indicator appears on load and disappears on first scroll.
 *
 * No scroll-jacking. Transitions are reactions, not interventions.
 */

(function () {
    'use strict';

    // -- Scroll indicator -----------------------------------------------------

    function initScrollIndicator() {
        const section = document.querySelector('.layout__section--choreographed');
        if (!section) return;

        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        indicator.innerHTML = `
            <span class="scroll-indicator__label">Scroll to explore</span>
            <span class="scroll-indicator__chevron"></span>
        `;
        section.appendChild(indicator);

        // Hide on intentional scroll - only after user has scrolled > 20px
        const hideIndicator = () => {
            if (window.scrollY > 20) {
                indicator.classList.add('scroll-indicator--hidden');
                window.removeEventListener('scroll', hideIndicator, { passive: true });
            }
        };
        window.addEventListener('scroll', hideIndicator, { passive: true });

        // Also hide after 6 seconds
        setTimeout(() => {
            indicator.classList.add('scroll-indicator--hidden');
        }, 6000);
    }

    // -- Skeleton underlays --------------------------------------------------
    // One absolutely-positioned underlay per chapter, injected into the section.
    // Sits below all content (z-index: 0). Never scrolls with chapter content.
    //
    // Each chapter's underlay covers only that chapter's own 4x4 grid.
    // Occupied positions are derived from the chapter's own article cells.
    // The chapter overlap (chapterOffset) is accounted for in top positioning.
    //
    // Chapter-01 underlay: visible on load.
    // Chapter-02+ underlays: hidden on load, revealed by IntersectionObserver.

    function buildSkeletonUnderlay(chapter, section) {
        const allBentos = Array.from(chapter.querySelectorAll('.bento-grid'));
        if (!allBentos.length) return null;

        // Read skeleton area map from YAML-driven data attribute.
        // Format: pipe-delimited rows, space-delimited cols. 's' = skeleton, '.' = empty.
        const areasRaw = chapter.dataset.skeletonAreas;
        if (!areasRaw) return null;

        const rows = areasRaw.split('|').map(row => row.trim().split(/\s+/));
        const rowCount = rows.length;
        const colCount = rows[0].length;

        // Build the underlay bento grid from the area map
        const grid = document.createElement('div');
        grid.className = 'bento-grid bento-skeleton-underlay';
        grid.setAttribute('aria-hidden', 'true');
        grid.dataset.underlayChapter = chapter.dataset.chapter;

        rows.forEach((cols, rowIdx) => {
            cols.forEach((cell, colIdx) => {
                if (cell === 's') {
                    const article = document.createElement('article');
                    article.className = 'bento-cell bento-cell--skeleton';
                    article.style.gridRow    = (rowIdx + 1) + ' / ' + (rowIdx + 2);
                    article.style.gridColumn = (colIdx + 1) + ' / ' + (colIdx + 2);
                    grid.appendChild(article);
                }
            });
        });

        // Position the underlay fixed to the viewport.
        // When a chapter's bento is sticky it locks to top:0 of the viewport.
        // The underlay mirrors that exact position so it reads as the bento's underlay.
        // left: bento column's left offset from viewport edge (measured at load).
        // top:  0 — matches the sticky bento's resting position.
        const bentoRect = allBentos[0].getBoundingClientRect();

        // Set explicit grid geometry — bypasses container query system.
        // Underlay always renders at MONEY state (176px cells, 16px gap).
        grid.style.gridTemplateColumns = 'repeat(' + colCount + ', 176px)';
        grid.style.gridTemplateRows    = 'repeat(' + rowCount + ', 176px)';
        grid.style.gap                 = '16px';
        grid.style.containerType       = 'normal'; // disable cqi inheritance

        // top: chrome height — matches where sticky bentos come to rest.
        // left: bento column's left offset from viewport edge (measured at load).
        grid.style.position      = 'fixed';
        grid.style.left          = Math.round(bentoRect.left) + 'px';
        grid.style.top           = '64px'; // $chrome-navbar-height + $chrome-content-gap
        grid.style.zIndex        = '0';
        grid.style.pointerEvents = 'none';

        return grid;
    }

    function injectSkeletonUnderlays(section, chapters) {
        // Ensure section is a positioning context
        if (window.getComputedStyle(section).position === 'static') {
            section.style.position = 'relative';
        }

        chapters.forEach((chapter, i) => {
            const underlay = buildSkeletonUnderlay(chapter, section);
            if (!underlay) return;

            // Chapter-01 visible immediately; others hidden until observed
            if (i === 0) {
                underlay.classList.add('bento-underlay--visible');
            } else {
                underlay.classList.add('bento-underlay--hidden');
            }

            // Append to body — fixed positioning is relative to viewport, not any ancestor
            document.body.appendChild(underlay);
        });
    }

    // -- Bento choreography ---------------------------------------------------

    function initChoreography() {
        const bentos = document.querySelectorAll(
            '.layout__section--choreographed .bento-grid'
        );
        if (!bentos.length) return;

        // Set chapter height and normalise page wrapper heights.
        //
        // All .layout__page wrappers within a chapter must be the same height
        // as the tallest bento in that chapter. Sticky release timing depends
        // on wrapper height — a short wrapper releases too early.
        //
        // Chapter height = (tallest bento height x page count) + (n-1) x viewport height.
        // The viewport-height scroll beats give the reader time to read each beat.
        const chapters = document.querySelectorAll('.layout__chapter');
        const vh = window.innerHeight;
        chapters.forEach(chapter => {
            const chapterBentos = Array.from(chapter.querySelectorAll('.bento-grid'));
            if (!chapterBentos.length) return;

            // Find the tallest bento in this chapter.
            // Use offsetHeight not getBoundingClientRect — sticky positioning
            // causes getBoundingClientRect to return clipped heights.
            const tallest = chapterBentos.reduce((max, b) => {
                return b.offsetHeight > max ? b.offsetHeight : max;
            }, 0);

            // Normalise every page wrapper to tallest bento + one gap (16px).
            // The extra gap prevents a 1-row slip between sticky pages.
            const pageH = tallest + 16;
            const pages = chapter.querySelectorAll('.chapter__bento .layout__page');
            pages.forEach(p => { p.style.height = pageH + 'px'; });

            // Chapter height: pageH per page plus scroll beats between them.
            // BEAT_MULTIPLIER controls dwell time between beats (1.0 = full viewport).
            // Tune by feel — lower = snappier, higher = more dwell.
            // Add chrome offset so the chapter holds long enough — sticky releases
            // when chapter bottom passes top:204px, not top:0.
            const BEAT_MULTIPLIER = 0.25;
            const CHROME_OFFSET = 64; // $chrome-navbar-height + $chrome-content-gap
            const scrollBeats = (chapterBentos.length - 1) * vh * BEAT_MULTIPLIER;
            const totalHeight = (pageH * chapterBentos.length) + scrollBeats + CHROME_OFFSET;
            chapter.style.height = totalHeight + 'px';
        });

        // Apply chapter overlap — read data-chapter-offset and set negative margin-top
        // Cell size + gap = 176 + 16 = 192px per row
        const cellSize = 176;
        const gap = 16;
        const rowUnit = cellSize + gap; // 192px
        chapters.forEach(chapter => {
            const offset = parseInt(chapter.dataset.chapterOffset || '0', 10);
            if (offset > 0) {
                chapter.style.marginTop = (-1 * offset * rowUnit) + 'px';
            }
        });

        // Beat-01 of each chapter: visible immediately
        // Beat-02+ of each chapter: start hidden
        chapters.forEach(chapter => {
            const chapterBentos = chapter.querySelectorAll('.bento-grid');
            if (!chapterBentos.length) return;
            chapterBentos[0].classList.add('bento--visible');
            for (let i = 1; i < chapterBentos.length; i++) {
                chapterBentos[i].classList.add('bento--pending');
            }
        });

        // Inject skeleton underlays after the browser has laid out the chapters.
        // requestAnimationFrame ensures chapter heights and margins are painted
        // before bounding rects are measured for occupancy detection.
        const section = document.querySelector('.layout__section--choreographed');
        requestAnimationFrame(() => {
            injectSkeletonUnderlays(section, Array.from(chapters));
        });

        // Observer: reveal pending beats and chapter-02+ underlays on scroll
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('bento--pending');
                        entry.target.classList.add('bento--visible');
                        // Reveal the underlay for this beat's chapter
                        const chapterKey = entry.target
                            .closest('.layout__chapter')?.dataset.chapter;
                        if (chapterKey) {
                            const underlay = section.querySelector(
                                '.bento-skeleton-underlay[data-underlay-chapter="' + chapterKey + '"]'
                            );
                            if (underlay) {
                                underlay.classList.remove('bento-underlay--hidden');
                                underlay.classList.add('bento-underlay--visible');
                            }
                        }
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '0px 0px -40% 0px',
                threshold: 0.1
            }
        );

        // Observe all pending bentos across all chapters
        document.querySelectorAll(
            '.layout__section--choreographed .bento-grid.bento--pending'
        ).forEach(b => observer.observe(b));
    }

    // -- Init -----------------------------------------------------------------

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initChoreography();
            initScrollIndicator();
        });
    } else {
        initChoreography();
        initScrollIndicator();
    }

})();
