/**
 * comparison-components.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles two comparison component types:
 *   1. [data-comparison-slider]  — drag-to-reveal before/after
 *   2. [data-annotation-toggle] — explicit toggle between raw/annotated
 *
 * No framework. No build step required. Drop into a <script defer> tag.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── 1. Comparison Slider ─────────────────────────────────────────────────────
// The range input handles all pointer/touch/keyboard interaction natively.
// This script only syncs input.value → CSS custom property --comparison-pos.

function initComparisonSliders() {
  document.querySelectorAll('[data-comparison-slider]').forEach((figure) => {
    const stage = figure.querySelector('.comparison-slider__stage');
    const input = figure.querySelector('.comparison-slider__input');
    const handle = figure.querySelector('.comparison-slider__handle');

    if (!stage || !input) return;

    function updatePosition(value) {
      const pos = value + '%';
      stage.style.setProperty('--comparison-pos', pos);
      if (handle) handle.style.left = pos;
    }

    // Set initial position from input's default value
    updatePosition(input.value);

    // Sync on every input event (covers mouse drag, touch, and keyboard)
    input.addEventListener('input', () => {
      updatePosition(input.value);
    });
  });
}

// ── 2. Annotation Toggle ─────────────────────────────────────────────────────
// Flips [data-active] on the figure and updates aria-pressed + button text.

function initAnnotationToggles() {
  document.querySelectorAll('[data-annotation-toggle]').forEach((figure) => {
    const btn = figure.querySelector('.annotation-toggle__btn');
    const annotatedImg = figure.querySelector('.annotation-toggle__img--annotated');

    if (!btn) return;

    const labelDefault = btn.dataset.labelDefault || 'Show annotations';
    const labelActive  = btn.dataset.labelActive  || 'Hide annotations';
    const btnText      = btn.querySelector('.annotation-toggle__btn-text');

    btn.addEventListener('click', () => {
      const isActive = figure.hasAttribute('data-active');

      if (isActive) {
        figure.removeAttribute('data-active');
        btn.setAttribute('aria-pressed', 'false');
        if (btnText) btnText.textContent = labelDefault;
        // Restore aria-hidden on annotated image
        if (annotatedImg) annotatedImg.setAttribute('aria-hidden', 'true');
      } else {
        figure.setAttribute('data-active', '');
        btn.setAttribute('aria-pressed', 'true');
        if (btnText) btnText.textContent = labelActive;
        // Expose annotated image to screen readers
        if (annotatedImg) annotatedImg.removeAttribute('aria-hidden');
      }
    });
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initComparisonSliders();
    initAnnotationToggles();
  });
} else {
  initComparisonSliders();
  initAnnotationToggles();
}
