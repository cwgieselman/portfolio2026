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

    // -- Skeleton injection ---------------------------------------------------
    // Calculates the full composite grid across ALL beats in the chapter,
    // then injects skeleton articles into beat-01 for every grid position
    // not covered by any beat's real cells.
    // This gives the reader a complete picture of the assembled page on load.

    function injectSkeletons(firstBento) {
        const chapter = firstBento.closest('.layout__chapter');
        if (!chapter) return;

        // Gather all bentos in this chapter
        const allBentos = chapter.querySelectorAll('.bento-grid');

        // Determine composite grid dimensions
        // All bentos share the same col count. Max row count = composite height.
        const cs0 = window.getComputedStyle(firstBento);
        const colCount = cs0.gridTemplateColumns.split(' ').length;
        let maxRows = 0;
        allBentos.forEach(b => {
            const cs = window.getComputedStyle(b);
            const rows = cs.gridTemplateRows.split(' ').length;
            if (rows > maxRows) maxRows = rows;
        });

        // Build a set of all occupied [row,col] positions across all beats.
        // Uses computed gridRowStart/End/ColumnStart/End from real cells only.
        // This is reliable for both single-cell and spanning cells.
        const occupied = new Set();
        allBentos.forEach(bento => {
            bento.querySelectorAll('.bento-cell:not(.bento-cell--skeleton)').forEach(cell => {
                const cs2 = window.getComputedStyle(cell);
                const rs = parseInt(cs2.gridRowStart);
                const re = parseInt(cs2.gridRowEnd);
                const cls = parseInt(cs2.gridColumnStart);
                const cle = parseInt(cs2.gridColumnEnd);
                if (!isNaN(rs) && !isNaN(re) && !isNaN(cls) && !isNaN(cle)) {
                    for (let r = rs; r < re; r++) {
                        for (let c = cls; c < cle; c++) {
                            occupied.add(r + ',' + c);
                        }
                    }
                }
            });
        });

        // Inject a skeleton for every unoccupied position in the full composite grid
        // These live on beat-01 which is always visible
        // Expand beat-01's grid to the full composite size first
        firstBento.style.gridTemplateRows = 'repeat(' + maxRows + ', var(--bento-cell-size))';

        for (let r = 1; r <= maxRows; r++) {
            for (let c = 1; c <= colCount; c++) {
                if (!occupied.has(r + ',' + c)) {
                    const skeleton = document.createElement('article');
                    skeleton.className = 'bento-cell bento-cell--skeleton';
                    skeleton.setAttribute('aria-hidden', 'true');
                    skeleton.style.gridRow = r + ' / ' + (r + 1);
                    skeleton.style.gridColumn = c + ' / ' + (c + 1);
                    firstBento.appendChild(skeleton);
                }
            }
        }
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

            // Find the tallest bento in this chapter
            const tallest = chapterBentos.reduce((max, b) => {
                const h = b.getBoundingClientRect().height;
                return h > max ? h : max;
            }, 0);

            // Normalise every page wrapper to tallest bento + one gap (16px).
            // The extra gap prevents a 1-row slip between sticky pages.
            const pageH = tallest + 16;
            const pages = chapter.querySelectorAll('.chapter__bento .layout__page');
            pages.forEach(p => { p.style.height = pageH + 'px'; });

            // Chapter height: pageH per page plus scroll beats between them
            const scrollBeats = (chapterBentos.length - 1) * vh;
            const totalHeight = (pageH * chapterBentos.length) + scrollBeats;
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

        // Beat-01 of each chapter: visible immediately, inject skeletons
        // Beat-02+ of each chapter: start hidden
        chapters.forEach(chapter => {
            const chapterBentos = chapter.querySelectorAll('.bento-grid');
            if (!chapterBentos.length) return;
            chapterBentos[0].classList.add('bento--visible');
            injectSkeletons(chapterBentos[0]);
            for (let i = 1; i < chapterBentos.length; i++) {
                chapterBentos[i].classList.add('bento--pending');
            }
        });

        // Observer: reveal pending beats as they scroll into view
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('bento--pending');
                        entry.target.classList.add('bento--visible');
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
