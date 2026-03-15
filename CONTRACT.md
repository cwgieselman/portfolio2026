# Portfolio2026 — Deterministic Render Contract
A formal specification of the render model, routing behavior, component contracts, and system invariants governing Portfolio2026.

Scope of this document:
- Defines the deterministic render model: YAML → executor → component params → DOM.
- Specifies routing behavior and include execution rules within `layouts/content-cell.njk`.
- Establishes component boundaries, required params, and prohibition of implicit defaults or global hydration.
- Governs image handling policy (passthrough baseline vs. future optimized mode) and prevents mixed render paths.
- Protects architectural integrity by prohibiting inference, param reshaping, silent fallbacks, and undocumented behavior.

This document is normative. Generated documentation in `_docs/generated/` is descriptive only.

---

## Relationship to Generated Docs

The `_docs/generated/` folder contains snapshots of the current repository state.
Those files are descriptive only and must not be manually edited.

If generated output conflicts with this contract, either:
- Update the code to match the contract, or
- Intentionally revise the contract.

---

## Deterministic Rendering Contract  
Figma → YAML → Eleventy → HTML → CSS  

This file defines the non-negotiable structural and rendering rules for the active system.

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
layouts/content-cell.njk  
↓  
component include  

No alternative front-matter rendering systems are permitted.

---

## 2. Data Ownership

Figma JSON  
- Represents design intent only.  
- Not consumed directly by templates.

YAML  
- Is the implementation contract.  
- Is the only source of structure and content.

Templates must NOT:

- Reach into global collections implicitly
- Access `page.*` unless explicitly passed
- Access `site.data` unless explicitly passed
- Infer structure from content
- Reshape parameter objects

Each include receives a single `params` object and renders only that object.

---

## 3. Layout Contract — content-cell Executor

File  
`src/_includes/layouts/content-cell.njk`

Purpose  
- Executes each include exactly once.
- Prevents scope leakage.
- Injects derived chapter semantics deterministically.
- Does not reshape or hydrate globals.

Input Shape

cell:  
- wrapper: string  
- includes:  
  - include: string  
  - params: object  

Execution Rules

- Each include MUST render exactly once.
- No global variable hydration is permitted.
- No param reshaping is permitted.
- Params must be passed as explicit component-specific objects:
  - headerParams
  - textBlockParams
  - figureParams
  - linkBlockParams
  - linkParams

Unknown include paths must render a non-fatal HTML comment in the DOM.

---

## 4. Chapter Semantics Contract

Sections represent narrative chapters.

Each `<section.layout__section>` must:

- Include `aria-labelledby="<sectionKey>__title"`
- Contain a header component as the first semantic heading

Derived ID Rule:

- Derived ID: `${sectionKey}__title`
- Applied only when:
  - First page in section
  - First cell on page
  - First include in cell
  - Include path == `components/header.njk`

YAML must NOT:

- Define heading IDs
- Emit aria attributes
- Infer labeling behavior

Section labeling is deterministic and derived from `section.sectionKey`.

---

## 5. Structural Determinism

Templates must:

- Render exactly what YAML defines.
- Fail visibly when required fields are missing.
- Never silently omit required structure.

### Error Marker Convention

If required component data is missing, templates MUST render a structured HTML comment marker in the format:

`<!-- <SCOPE>_ERROR: <message> -->`

Where `<SCOPE>` identifies the source of the failure (e.g., `FIGURE`, `CONTENT`, `EXECUTOR`).

Examples:

~~~html
<!-- FIGURE_ERROR: missing src -->
<!-- CONTENT_ERROR: missing kind (richtext include) -->
<!-- EXECUTOR_ERROR: missing params -->
~~~

Silent failure is not permitted.

---

## 6. Layout Rules

No offset positioning:

- No `position: absolute`
- No transform offsets
- No negative margins

Placement must use:

- Named grid lines
- `grid-column`
- `grid-row`
- `align-self`
- `justify-self`

Spacing must be controlled by grid and gap.  
Margin stacking is not permitted inside structural components.

---

## 7. CSS Loading Contract

`base.njk` must load:

`/assets/scss/main.css`

If styling appears incorrect, verify in order:

1. CSS file exists at `_site/assets/scss/main.css`
2. CSS file is loaded in browser (href must match)
3. Class names match rendered DOM
4. No later stylesheet overrides rules

---

## 8. Display Typography Contract (H1 / H2)

Display typography uses explicit grid-snapped line-height tokens.

Rules:

- Font-size uses semantic tokens:
  - `--web---title`
  - `--web---sectionHeading`

- Line-height uses explicit tokens:
  - `--web---title--lh`
  - `--web---sectionHeading--lh`

- Line-height must be snapped to the 4px metric scale.
- Multiplier-based leading is not permitted.
- No inline styles are permitted.

Example:

```css
--web---title: var(--scale-350);
--web---title--lh: var(--scale-400);

---

# Component Contracts (Active Route)

---

## Header

include: `components/header.njk`

### Inputs (`headerParams`)

- level: `"h1" | "h2" | "h3"`
- variant: `"quiet"` (optional — reduces visual weight without changing semantic level)
- headline: string
- showEyebrow: boolean
- eyebrow: string
- showSubhead: boolean
- subhead: string

### Inputs (`headerParamsId`)

- Derived heading ID for chapter semantics injection

### Rules

- No inferred flags.
- YAML must not define heading IDs.
- ID is applied only when `headerParamsId` is provided.
- When `variant` is `"quiet"`, the heading element is unchanged (still `h2`) but receives an additional CSS class `header__headline--quiet` for reduced visual weight.
- When `variant` is absent or not `"quiet"`, the heading renders with default visual treatment.

### DOM Shape

~~~html
<header class="header">
  <p class="header__eyebrow"></p> <!-- optional -->
  <h1|h2|h3 class="header__headline [header__headline--quiet]" id=""></h1|h2|h3>
  <p class="header__subhead"></p> <!-- optional -->
</header>
~~~

---

## Richtext

include: `components/richtext.njk`

### Inputs (`richtextParams`)
- kind: `"p" | "ul" | "ol"` (required)
- text: string — required when `kind == "p"`
- items: array[string] — required when `kind == "ul" or kind == "ol"`

### Constraints

- `kind` MUST be provided.
- When `kind == "p"`, text MUST be provided.
- When `kind == "ul"` or `"ol"`, items MUST be provided.
- `items` MUST be an array of strings.
- Template must not derive `kind`.
- Template must not transform, split, or reshape `text` or `items`.
- Template must not coerce between paragraph and list modes.

### Error Behavior

- Missing kind MUST emit:
~~~html
<!-- CONTENT_ERROR: missing kind (richtext include) -->
~~~
No other implicit fallbacks are permitted.

### DOM Shape

Paragraph Mode

~~~html
<p class="richtext"></p>
~~~

Unordered List Mode

~~~html
<ul class="richtext richtext--list">
    <li></li>
    <li></li>
</ul>
~~~

Ordered List Mode

~~~html
<ol class="richtext richtext--list">
    <li></li>
    <li></li>
</ol>
~~~

---

## Figure (Temporary Passthrough v1)

include: `components/figure.njk`

### Inputs (`figureParams`)

- type: `"desktop" | "mobile" | "composite"`
- showCaption: boolean
- caption: string
- src: string (public path)
- hasAlt: boolean
- alt: string

### Rules

- `src` MUST be a public URL path under `/assets/images/`.
- Eleventy Image plugin is not used in this component during stabilize.
- No inferred flags.
- If `hasAlt === false`, alt must be empty and image is presentational.

### DOM Shape

~~~html
<figure class="figure figure--{type}">
  <div class="figure__media">
    <img src="" alt="" />
  </div>
  <figcaption class="figure__caption"></figcaption> <!-- optional -->
</figure>
~~~

### Future Optimized Figure (NOT ACTIVE during stabilize)

A separate include will be introduced later:

- `components/figure-optimized.njk`

Contract split:
- `src` → passthrough only (public `/assets/images/...`)
- `srcFile` → optimized only (filesystem path, used exclusively by the optimized include)

Optimization may only be reintroduced after deterministic verification.
No mixed modes in a single include.

### Figure Modes

Baseline (ACTIVE):
- components/figure.njk
- Uses <img>
- src must be public path under /assets/images/

Optimized (NOT ACTIVE during stabilize):
- components/figure-optimized.njk
- Uses srcFile (filesystem path)
- Uses @11ty/eleventy-img
- Must not be mixed inside the same include

Optimization will only be enabled after:
- Deterministic verification passes
- Executor remains thin

---

## Link Block

include: `components/link-block.njk`

### Inputs (`linkBlockParams`)

- hasSecondary: boolean
- primary:
  - priority
  - label
  - URL
  - link
- secondary:
  - priority
  - label
  - URL
  - link

### Rules

- `primary` renders if present.
- `secondary` renders only when `hasSecondary === true`.
- YAML must not contain placeholder values.
- No param reshaping into globals.

### DOM Shape

~~~html
<div class="link-block">
  <a|span class="link ..."></a|span>
  <a|span class="link ..."></a|span <!-- optional -->
</div>
~~~

---

## Link

include: `components/link.njk`

### Inputs (`linkParams`)

- priority: `"Primary" | "Secondary"`
- label: string
- URL: string
- link: string

### Rules

- If `URL` exists → render `<a>`
- If `URL` is absent → render disabled `<span>`
- No defaults during stabilize.
- Callers must provide explicit values.

---

## Debug Method

When a mismatch occurs:

1. Confirm YAML structure.
2. Confirm executor passes correct param object.
3. Confirm component renders expected markup.
4. Confirm CSS selector matches rendered markup.
5. Confirm CSS file is loaded.

Each fix must:

- Address exactly one failure.
- Be committed independently.
- Be logged in README.

## Review Gate

No branch merges to `main` without a Claude Code review pass.
See `_docs/WORKFLOW.md` for the two-phase workflow, PR summary template,
and what a correct review looks like.

---

# Standalone Component Contracts

Standalone components operate outside the executor pipeline. They are invoked directly via Nunjucks macro calls in page templates or test pages. The executor rules (single params object, safelist enforcement, chapter semantics) do not apply to standalone components.

Standalone components may NOT be added to the executor safelist without a corresponding CONTRACT.md update.

---

## Bento Grid

Template: `src/_includes/components/bento-grid.njk`  
Styles: `src/assets/scss/components/_bento-grid.scss`  
Theme tokens: `src/assets/scss/_tokens--component.scss` (generated); rulesets in `src/assets/scss/components/_bento-grid.scss`
One-off overrides: `src/assets/scss/components/bento-cells/`

### Purpose

Editorial grid for process and discovery layouts inside case study pages. Not part of the compiled-page executor pipeline.

### Invocation

~~~njk
{% from "components/bento-grid.njk" import bentoGrid %}
{{ bentoGrid(bento) }}
~~~

Where `bento` is the top-level key from a YAML data file.

### YAML Shape

~~~yaml
bento:
  id: inficon--discovery       # drives CSS id and data-bento attribute
  variant: full-width          # full-width | two-col
  cols: 5                      # grid column count
  rows: 5                      # grid row count
  cells:
    - id: article-01
      type: content            # content | image | custom
      theme: primary-dark      # named theme — see themes below; omit for image cells
      zIndex: 1                # derived by compiler from Figma layer order
      desktop:
        col: "1 / 2"           # CSS grid-column value
        row: "1 / 2"           # CSS grid-row value
      content: |               # raw HTML from Figma Slot — rendered via | safe
        <span class="bento-type--eyebrow">Week on-site</span>
        <span class="bento-type--paragraphLead">at the pilot FAB in France</span>
~~~

### Named Themes

Set via `theme:` on a cell. Defaults to `white` when omitted.

| Theme | Background | Text | Border |
|---|---|---|---|
| `white` *(default)* | neutral/10 | primary/60 | neutral/60 |
| `primary-dark` | primary/60 | primary/10 | primary/80 |
| `primary-light` | primary/20 | primary/60 | primary/30 |
| `secondary-dark` | secondary/50 | secondary/80 | secondary/60 |
| `secondary-light` | secondary/20 | secondary/70 | secondary/30 |

Theme definitions live in the `// -- Themes` section of `_bento-grid.scss`. Each theme sets `--cell-bg`, `--cell-color`, `--cell-border` on the cell element via the corresponding `--bento-theme-*` variables from `_tokens--component.scss`. Adding themes requires a new entry in `tokens.json` (run `npm run tokens:build`) and a new ruleset in `_bento-grid.scss` — no template changes.

`white` is the default theme. When `theme` is omitted from YAML, the template applies `bento-cell--theme-white`. This ensures arrows always render against a defined background.

### Cell Types

Type controls padding only — not content structure. Content is Slot-driven and renders as-is.

**content** — cell has padding. Use for text, stats, mixed content.

**image** — no padding; content bleeds to the cell edge. Use for full-bleed images.

**custom** — reserved for animated SVGs or other bespoke cells. No padding assumption. Author controls via one-off SCSS partial.

~~~yaml
cells:
  - id: article-01
    type: content
    theme: primary-dark
    ...
  - id: article-02
    type: image
    # theme omitted — defaults to white
    ...
~~~

### Inline Typography Spans

All text fields pass through `| safe`. Inline `<span class="bento-*">` works in any content field. Classes are scoped to `.bento-cell` and do not leak to the page.

Sourced from CGDC-DS Figma node 2884-634:

| Class | Family | Style | Size |
|---|---|---|---|
| `bento-stat` | Tienne | Bold | clamp(50px -> 72px) |
| `bento-lead` | Raleway | Regular | clamp(19px -> 24px) |
| `bento-lead-italic` | Raleway | Italic | clamp(19px -> 24px) |
| `bento-body` | PT Sans | Regular | clamp(13px -> 16px) |
| `bento-body-bold` | PT Sans | Bold | clamp(13px -> 16px) |

### One-Off Cell Overrides

For cells requiring custom layout or visual personality beyond the theme system:

1. Create a SCSS partial in `src/assets/scss/components/bento-cells/`
2. Target using `data-bento-cell="box-XX"` — present on every cell
3. Uncomment (or add) the import in `main.scss`

One-off partials are explicitly not part of this contract. They are the author’s responsibility.

### Data File Naming Constraint

Bento YAML files referenced directly in Nunjucks templates must use camelCase or single-hyphen filenames. Double-hyphen filenames (e.g. `inficon--discovery-bento.yml`) are parsed by Nunjucks as arithmetic and silently fail. Use a JS wrapper file to expose double-hyphen YAML, or use camelCase from the start.

### Placement Model

Bento cell placement uses CSS Grid named areas. Each `<article>` element receives a `style="grid-area: aNN"` inline style derived from `cell.id` in the template (`article-01` → `a01`). The `grid-template-areas` map lives in the per-bento `#bento--<id>` selector in `placements/_<pageKey>.scss`.

**Why inline style is permitted here (CONTRACT_EXCEPTION):**  
`grid-area` is a name registration, not a placement value. It labels the element so the CSS area map can reference it. The actual placement — which row and column the named area occupies — is still exclusively in the placements SCSS. This is categorically different from inline `grid-column` / `grid-row` values, which would encode placement in the template. The inline style is deterministic (derived from `cell.id` by a fixed transform with no branching logic) and carries no design-intent data.

The general prohibition on inline styles in Section 6 applies to layout placement. `grid-area` name registration is a template concern and is exempt.

### Rules

- Template renders exactly what YAML defines. No implicit defaults.
- `theme:` is optional. Omitting it produces a transparent, borderless cell (correct for image cells).
- Image fallbacks are a development aid only. Production cells must have real `src` values.
- The bento grid is NOT permitted in the executor safelist.
- Structural changes to the macro (new cell types, new keys) require a CONTRACT.md update.
- `grid-area` inline styles on bento cells are permitted and intentional — see Placement Model above.
