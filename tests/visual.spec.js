/**
 * visual.spec.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Visual regression tests for portfolio2026.
 *
 * Tests each page across the full viewport range in both Chromium and WebKit.
 * Screenshots saved to tests/screenshots/{browser}/{page}/{viewport}.png
 *
 * Usage:
 *   npm run test:visual         — run all tests, save screenshots
 *   npm run test:visual:check   — run tests, FAIL if screenshots differ
 *   npm run test:visual:report  — open HTML report
 *
 * Dev server must be running (npm start) before running tests.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080';

// Pages to test
const PAGES = [
  { name: 'inficon-impact-manager', path: '/portfolio/inficon-impact-manager/' },
];

// Craig's four main inspection viewports
const MAIN_VIEWPORTS = [
  { name: 'iphone',   width: 390,  height: 844  },
  { name: 'ipad',     width: 820,  height: 1180 },
  { name: 'laptop',   width: 1052, height: 657  },
  { name: 'desktop',  width: 1248, height: 848  },
];

// Critical crossover viewports — the ±1px boundaries
const CROSSOVER_VIEWPORTS = [
  { name: '1051-before-5up',    width: 1051, height: 657 },
  { name: '1052-at-5up',        width: 1052, height: 657 },
  { name: '1053-after-5up',     width: 1053, height: 657 },
  { name: '1247-before-ff',     width: 1247, height: 848 },
  { name: '1248-at-ff',         width: 1248, height: 848 },
  { name: '1249-after-ff',      width: 1249, height: 848 },
];

// Intermediate viewports — every 50px across the full range
// These catch regressions that don't show at the exact breakpoints
const SWEEP_VIEWPORTS = [];
for (let w = 375; w <= 1400; w += 50) {
  SWEEP_VIEWPORTS.push({ name: `sweep-${w}`, width: w, height: 900 });
}

/**
 * Measure the bento grid at the current viewport.
 */
async function measureBento(page) {
  return page.evaluate(() => {
    const grid = document.querySelector('.bento-grid');
    if (!grid) return { error: 'no .bento-grid found' };
    const contentCell = grid.closest('.content-cell');
    const styles = getComputedStyle(grid);
    const cols = styles.gridTemplateColumns;
    const is5up = cols.split(' ').length === 5 && cols.includes('140px');
    return {
      viewport:      window.innerWidth,
      contentCellW:  Math.round(contentCell?.getBoundingClientRect().width ?? -1),
      cellSize:      styles.getPropertyValue('--bento-cell-size').trim(),
      gap:           styles.getPropertyValue('--bento-gap').trim(),
      gridW:         Math.round(grid.getBoundingClientRect().width),
      gridH:         Math.round(grid.getBoundingClientRect().height),
      gridCols:      cols,
      is5up,
      // Key invariant: grid must never exceed content-cell width
      overflows:     Math.round(grid.getBoundingClientRect().width) > Math.round(contentCell?.getBoundingClientRect().width ?? 9999) + 2,
    };
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

for (const pageConfig of PAGES) {
  test.describe(`${pageConfig.name}`, () => {

    // ── Full-page screenshots at main breakpoints ──────────────────────────
    test.describe('screenshots — main breakpoints', () => {
      for (const viewport of MAIN_VIEWPORTS) {
        test(`${viewport.name} (${viewport.width}×${viewport.height})`, async ({ page, browserName }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(`${BASE_URL}${pageConfig.path}`);
          await page.waitForLoadState('networkidle');

          const dir = path.join(__dirname, 'screenshots', browserName, pageConfig.name);
          ensureDir(dir);
          await page.screenshot({ path: path.join(dir, `${viewport.name}.png`), fullPage: true });

          const m = await measureBento(page);
          console.log(`  ${browserName}/${viewport.name}: gridW=${m.gridW} cols="${m.gridCols}" cellSize=${m.cellSize}`);

          // Grid must not overflow content-cell
          expect(m.overflows, `Bento overflows content-cell at ${viewport.width}px`).toBe(false);
        });
      }
    });

    // ── Screenshots + overflow assertion at crossover viewports ───────────
    test.describe('crossover viewports', () => {
      for (const viewport of CROSSOVER_VIEWPORTS) {
        test(`${viewport.name} (${viewport.width}px)`, async ({ page, browserName }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(`${BASE_URL}${pageConfig.path}`);
          await page.waitForLoadState('networkidle');

          const dir = path.join(__dirname, 'screenshots', browserName, pageConfig.name, 'crossover');
          ensureDir(dir);
          await page.screenshot({ path: path.join(dir, `${viewport.name}.png`), fullPage: false });

          const m = await measureBento(page);
          console.log(`  ${browserName}/${viewport.name}: gridW=${m.gridW} contentCellW=${m.contentCellW} is5up=${m.is5up} cellSize=${m.cellSize}`);

          // Core invariant: grid never overflows its container
          expect(m.overflows, `Bento overflows content-cell at ${viewport.width}px in ${browserName}`).toBe(false);

          // Threshold assertions
          if (viewport.width <= 1051) {
            expect(m.is5up, `Should be 2-up at ${viewport.width}px`).toBe(false);
          }
          if (viewport.width >= 1052) {
            expect(m.is5up, `Should be 5-up at ${viewport.width}px`).toBe(true);
            expect(m.gridW, `5-up grid should be 732px at ${viewport.width}px`).toBe(732);
          }
        });
      }
    });

    // ── Sweep: measure every 50px, assert no overflow anywhere ────────────
    test.describe('sweep — no overflow across full range', () => {
      for (const viewport of SWEEP_VIEWPORTS) {
        test(`${viewport.width}px`, async ({ page, browserName }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(`${BASE_URL}${pageConfig.path}`);
          await page.waitForLoadState('networkidle');

          const m = await measureBento(page);

          // The one rule that must never break at any viewport
          expect(m.overflows, `Bento overflows content-cell at ${viewport.width}px in ${browserName}: gridW=${m.gridW} contentCellW=${m.contentCellW}`).toBe(false);
        });
      }
    });

  });
}
