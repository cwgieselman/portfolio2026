# Deterministic Mapping Contract
Figma → YAML → Eleventy → HTML → CSS

This file defines the non-negotiable data and rendering rules.

---

## 1. Single Active Rendering System

Only the compiled-page pipeline is valid.

Active flow:

pages.js
    ↓
_data/pages/<pageKey>/page.yml
    ↓
layouts/compiled-page.njk
    ↓
layouts/page.njk
    ↓
content-cell.njk
    ↓
component include

No alternative front-matter section systems are allowed.

---

## 2. Data Ownership

Figma JSON = design intent (not consumed directly by templates)

YAML = implementation contract (only source of content + structure)

Templates must NEVER:
- Reach into global collections implicitly
- Access page.* unless explicitly passed
- Access site.data unless explicitly passed

Includes receive a single object and render only that object.

---

## 3. Structural Determinism

For each content cell in YAML:

Required fields:
- component
- grid placement data
- content payload

If required data is missing:
- Render HTML comment marker:
  <!-- TODO: missing <field> -->

Silent failure is not allowed.

---

## 4. Layout Rules

No offset positioning:
- No absolute positioning
- No transform offsets
- No negative margins

Grid placement must use:
- Named grid lines
- grid-column
- grid-row
- align-self / justify-self if required

---

## 5. CSS Loading

base.njk must load:

/assets/css/main.css

If styling appears missing, verification order:

1. CSS file exists at expected path.
2. CSS file is loaded in browser (Network tab).
3. Class names match rendered markup.
4. No later stylesheet overrides intended rules.

---

## 6. Debug Method

When a mismatch occurs:

1. Confirm YAML contains expected structure.
2. Confirm compiled-page.njk passes correct object.
3. Confirm include renders correct markup.
4. Confirm CSS selector matches markup.
5. Confirm CSS file is loaded.

Each fix must:
- Address exactly one failure.
- Be committed independently.
- Be logged in README.
