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

## Canonical Terminology

**Layout grid names are canonical. Use these exactly — in code comments, SCSS, docs, and conversation. Do not invent synonyms.**

| Canonical name | Abbreviation | What it is |
|---|---|---|
| **Field and Frame Grid** | **FF Grid** | The full 5-IU macro page grid in `_layout.scss`. Active at ≥ 1248px viewport. |
| **2-col Grid** | — | The simplified two-column layout grid active at 640px–1247px. |
| **Mosaic** | — | The CSS Grid inside a `.mosaic` component instance. Container-query driven. |
| **Mosaic tile** | — | Individual cell inside `.mosaic`. YAML key `tiles:` maps to HTML `<article>` elements — intentional split. |

Any use of "macro grid", "page grid", "5-col grid", "mid-tier grid", "responsive grid", "bento layout", "bento grid", or similar informal names is incorrect. Use the canonical names above.

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

### `Vert` and `Horiz` positioning props on content-cells

These props control **where a content-cell sits within its grid slot** when the cell's content is smaller than the slot. They are not a layout engine — they answer one question: when there is extra space in my grid area, where do I position myself?

**Figma prop names are intentionally non-CSS.** They describe spatial intent, not implementation. The compile contract maps intent to the correct CSS mechanism depending on context.

| Figma prop | Values | Axis |
|---|---|---|
| `Vert` | `Default` \| `Center` \| `End` | Vertical (block) |
| `Horiz` | `Default` \| `Center` \| `End` | Horizontal (inline) |

**`Default` means emit nothing.** The CSS default (`stretch`) governs. Only `Center` and `End` produce output.

**Value mapping:**

| Figma value | CSS output |
|---|---|
| `Default` | *(nothing emitted)* |
| `Center` | `align-self: center` (Vert) / `justify-self: center` (Horiz) |
| `End` | `align-self: end` (Vert) / `justify-self: end` (Horiz) |

**Important:** `Horiz: Center` (`justify-self: center`) causes a grid item to shrink to its intrinsic width. Only use it on cells whose content has a defined width (e.g. a Bento Grid with `width: fit-content`). Do not use on cells containing block-level text content — those rely on `stretch` to fill the grid track.

**Output target:** Placements SCSS only — in the same selector as `grid-column` and `grid-row`:

```scss
.content-cell[data-cell="content--section-01--page-01--content-cell-03"] {
    grid-column: 5 / 8;
    grid-row: 6 / 16;
    align-self: center; /* Vert=Center */
}
```

**Product note:** The `Vert`/`Horiz` naming is pragmatic for a portfolio build. If this system were ever developed into a product, the naming convention, prop vocabulary, and compile contract would need more rigorous design — particularly around `Horiz: Center` and its interaction with block-level content sizing.


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
- headline: string — rendered via `| safe`. May contain inline HTML (e.g. `<span class="nobr">...</span>`)
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
- When `variant` is `"quiet"`, the heading element is unchanged (still `h2`) but receives an additional CSS class `header__headline--quiet` for reduced visual weight. Visual result matches `h3` sizing at all tiers.
- When `variant` is absent or not `"quiet"`, the heading renders with default visual treatment.
- Use `<span class="nobr">product name</span>` in `headline` to prevent proper names breaking across lines.

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
  cols: 5                      # reference only — drives placements SCSS
  rows: 5                      # reference only — drives placements SCSS
  cells:
    - id: article-01
      type: content            # content | image | custom
      theme: primary-dark      # named theme — see themes below; omit for image cells
      desktop:
        col: "1 / 2"           # reference only — drives placements SCSS
        row: "1 / 2"           # reference only — drives placements SCSS
      content: |               # raw HTML from Figma Slot — rendered via | safe
        <span class="bento-stat">1</span>
        <span class="bento-body">Week on-site at the pilot FAB in France:</span>
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

### Cell Types

**content** — cell has padding. Use for text, stats, mixed content.
**image** — no padding; content bleeds to cell edge.
**graphic** — square illustration/diagram. `object-fit: contain`, padded, `aspect-ratio: 1` in 2-up.
**skeleton** — bare outline cell for P00 underlay. No content, no theme.
**custom** — extended behavior cell. Requires `variant:` string. See below.

#### Arrow Indicators (planned, not yet implemented)

Directional arrow indicators between bento cells are a planned feature. When implemented, they will be keyed by `cell.arrow` in YAML (e.g. `arrow: "right"`). The template, SCSS, and SVG sprite were removed in `rehab/codebase-audit` — the prior implementation never worked correctly and will be rebuilt from Figma when needed.

#### Annotation Toggle (removed, to be replaced)

A macro-based component (`annotation-toggle.njk`) for toggling between a raw artifact image and an annotated version via a button. Removed in `rehab/codebase-audit` — the implementation was functional but will be replaced with a more semantic and accessible annotation widget designed specifically for the BMTx case study. A design thread with pseudo-code and examples exists in Claude.ai. Files removed: `annotation-toggle.njk`, `_annotation-toggle.scss`. JS was bundled in `comparison-components.js` (still present). Rebuild from the new design when the BMTx page work begins.

#### Custom Cell Contract

A `custom` cell has two Figma boolean/text props that must be read from the article's `componentProperties`:

| Figma prop | Type | YAML key |
|---|---|---|
| `custom` | boolean | `type: custom` |
| `variant` | text | `variant: "<string>"` |

The `variant` string is the canonical key for all extended behavior tied to that cell. The template emits it as `data-bento-variant` on the `<article>` element — this is the CSS and JS hook.

**Template output (bento-grid.njk):**
```html
<article class="bento-cell bento-cell--custom [bento-cell--theme-*]"
         data-bento-cell="article-NN"
         data-bento-variant="<variant>">
```

**CSS hook** (in placements SCSS):
```scss
[data-bento-variant="<variant>"] { ... }
```

**JS hook** (in choreography.js or a dedicated script):
```js
document.querySelector('[data-bento-variant="<variant>"]')
```

**Compile scaffolding rule:** When a `custom` cell is encountered during compilation, emit the YAML and then output a scaffolding block in the compile report:

```
CUSTOM CELL SCAFFOLD — variant: <variant>
  SCSS: add ruleset for [data-bento-variant="<variant>"] in placements/_<pageKey>.scss
  JS:   add behavior keyed to document.querySelector('[data-bento-variant="<variant>"]')
        in choreography.js or a dedicated <variant>.js partial
  Note: <describe the intended visual/interactive behavior from Figma>
```

Content in `content:` renders via `| safe` as with `content` cells. Padding is not assumed — add via the variant's SCSS ruleset if needed.

### Inline Typography Spans

| Class | Family | Style | Size |
|---|---|---|---|
| `bento-stat` | Tienne | Bold | clamp(50px → 72px) |
| `bento-lead` | Raleway | Regular | clamp(19px → 24px) |
| `bento-lead-italic` | Raleway | Italic | clamp(19px → 24px) |
| `bento-body` | PT Sans | Regular | clamp(13px → 16px) |
| `bento-body-bold` | PT Sans | Bold | clamp(13px → 16px) |

### Responsive Model — container-query driven, small → large

| Threshold | Layout | Cell size |
|---|---|---|
| Default (no query) | 2-up, `width: 100%` | 140px min |
| `content-cell ≥ 500px` | 2-up, `width: 100%` | 208px max |
| `content-cell ≥ 732px` | 5-up, `width: fit-content` | 140px min (reset) |
| `content-cell ≥ 900px` | 5-up, `width: fit-content` | 208px max |

5-up fires at ~1052px viewport in the 2-col Grid tier. Always 5-up in the FF Grid tier.

### Placement Model

Cell placement uses CSS Grid named areas. Each `<article>` element receives `style="grid-area: aNN"` inline (derived from `cell.id` by fixed transform — `article-01` → `a01`). The `grid-template-areas` maps live in `placements/_<pageKey>.scss` — default 2-up map as a bare selector, 5-up map inside `@container content-cell (min-width: 732px)`.

`grid-area` inline styles are a CONTRACT_EXCEPTION — they register names for the CSS area map, not placement values. See full rationale in CLAUDE.md.

### Rules

- Template renders exactly what YAML defines. No implicit defaults.
- `theme:` is optional. Omitting produces transparent, borderless cell (correct for image cells).
- The Bento Grid is NOT permitted in the executor safelist.
- Structural changes require a CONTRACT.md update.
