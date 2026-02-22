# Deterministic Rendering Contract  
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

If required component data is missing, render an HTML comment marker:

`<!-- missing <field> -->`

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

`/assets/css/main.css`

If styling appears incorrect, verify in order:

1. CSS file exists at expected path
2. CSS file is loaded in browser
3. Class names match rendered DOM
4. No later stylesheet overrides rules

---

## 8. Display Typography Contract (H1 / H2)

Display typography uses explicit grid-snapped line-height tokens.

Rules:

- Font-size uses semantic tokens:
  - `--web---title-h1`
  - `--web---section--heading-h2`

- Line-height uses explicit tokens:
  - `--web---title-h1--lh`
  - `--web---section--heading-h2--lh`

- Line-height must be snapped to the 4px metric scale.
- Multiplier-based leading is not permitted.
- No inline styles are permitted.

Example:

```css
--web---title-h1: var(--scale-350);
--web---title-h1--lh: var(--scale-400);

---

# Component Contracts (Active Route)

---

## Header

include: `components/header.njk`

### Inputs (`headerParams`)

- level: `"h1" | "h2" | "h3"`
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

### DOM Shape

~~~html
<header class="header">
  <p class="header__eyebrow"></p> <!-- optional -->
  <h1|h2|h3 class="header__headline" id=""></h1|h2|h3>
  <p class="header__subhead"></p> <!-- optional -->
</header>
~~~

---

## Text Block

include: `components/text-block.njk`

### Inputs (`textBlockParams`)

- level: `"h3" | "None"`
- showSubhead: boolean
- subhead: string
- body: array[string]

### Constraints

- `body` MUST be an array.
- Multi-paragraph strings are not permitted.
- Template must not derive `showSubhead`.
- Template must not split strings.
- Template must not reshape data.

### DOM Shape

~~~html
<div class="text-block">
  <h3|p class="text-block__subhead"></h3|p> <!-- optional -->
  <div class="text-block__body">
    <p></p>
    <p></p>
  </div>
</div>
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
