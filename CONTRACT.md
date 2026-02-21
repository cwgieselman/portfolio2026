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

---

## 7. Chapter Semantics Contract

Sections represent narrative chapters.

Each `<section.layout__section>` must:

- Include `aria-labelledby="<sectionKey>__title"`
- Contain a header component as the first semantic heading
- The first header in the section receives:
  id="<sectionKey>__title"

This wiring is implemented in template logic.

YAML must NOT:
- Define header IDs manually
- Emit aria attributes
- Infer section labeling behavior

Section labeling is deterministic and derived from `section.sectionKey`.

---

## 8. Display Typography Contract (H1 / H2)

Display typography uses explicit grid-snapped line-height tokens.

Rules:

- Font-size is defined via semantic tokens:
  - `--web---title-h1`
  - `--web---section--heading-h2`

- Line-height is defined via explicit tokens:
  - `--web---title-h1--lh`
  - `--web---section--heading-h2--lh`

- Line-height must be snapped to the 4px metric scale.
- No multiplier math is permitted for display leading.
- No inline styles are permitted.

Example:

```css
--web---title-h1: var(--scale-350);      /* 56px */
--web---title-h1--lh: var(--scale-400);  /* 72px */



## Link Component Contract

### 1. `link.njk`

Input contract:
- priority?: "Primary" | "Secondary"
- label?: string
- URL?: string
- link?: string

Rendering contract:
- If `URL` is present → `<a>`
- If `URL` is absent → `<span aria-disabled="true">`
- No TODO markers or placeholder URLs permitted

---

### 2. `link-block.njk`

Input contract:
- hasSecondary?: boolean
- primary: { priority, label, URL, link }
- secondary?: { priority, label, URL, link }

Rules:
- `primary` is rendered unconditionally if present.
- `secondary` is rendered only if `hasSecondary === true`.
- `links: []` is invalid and must not be emitted by the compiler.
- YAML must not contain placeholder values (e.g., "TODO:href").

---

### Compiler Rule (Figma → YAML)

For link-block instances:

- Map `link--primary` to `primary`
- Map `link--secondary` to `secondary`
- Emit `hasSecondary: true` only when secondary exists
- Omit `URL` if not explicitly defined in Figma JSON
