# portfolio2026
My UX, UI and Design System portfolio built with Figma, Claude, and 11ty

---

## Current Scope

One page is in active development:

/portfolio/bmtx-nextgen/

All other legacy pages and rendering experiments are quarantined and are not part of the active system.

---

## Build Phase — Active

Stabilize phase is complete. The render pipeline, component execution model, and token system are locked. Active work is new feature development.

### What Was Stabilized

- Active route: `/portfolio/bmtx-nextgen/`
- Render pipeline: deterministic YAML → template → DOM
- Component execution model: explicit param-object pattern, no scope leakage
- Token system: `tokens/tokens.json` → generated SCSS → compiled CSS

### Render Execution Model

- Cells contain `includes[]`.
- Each include provides `params` as a single object.
- The cell executor does not map params into global variables.
- Components must consume only their scoped param object.
- No param reshaping. No implicit defaults. No scope leakage.

### Chapter Semantics

Section title ID is derived from `sectionKey`:

`${sectionKey}__title`

The derived ID is injected only for:

- First page in section
- First cell on page
- First include in cell
- Header include only

YAML must not define heading IDs.

---

## Architecture Overview

Figma JSON (design intent)
↓
Compiler (extracts required structure)
↓
YAML (implementation contract)
↓
Eleventy templates
↓
Rendered HTML
↓
CSS (layout + styling)

The YAML layer is the only data source consumed by templates.

---

## Build Pipeline

Eleventy input: `src/`
Eleventy output: `_site/`

Sass source: `src/assets/scss/`
Compiled CSS: processed natively by 11ty → `_site/assets/css/main.css`
Token source: `tokens/tokens.json` → `src/assets/scss/_tokens--*.scss`

### Dev

~~~bash
npm start
~~~

### Build

~~~bash
npm run build
~~~

---

## Project Conventions

- Only one rendering pipeline is active (compiled-page system).
- Templates must not reach into global data implicitly.
- Includes render only the object passed to them.
- YAML is the single contract between design intent and markup.
- Structural changes are committed independently.
- One component per build cycle.

---

## Branch Naming

| Key           | Purpose |
|---------------|----------|
| `rehab/`      | Restore structural integrity and eliminate drift |
| `stabilize/`  | Contract alignment and systemic corrections |
| `build/`      | New feature work |
| `experiment/` | Prototypes and exploratory work |

Guidelines:

- Short, descriptive kebab-case after the slash
- No spaces
- No long sentences
- Branch names describe structural intent, not emotion

---

# Component APIs (Active Route)

---

## Header

include: `components/header.njk`

### Params (`headerParams`)

- level: `"h1" | "h2" | "h3"`
- variant: `"quiet"` (optional — reduces visual weight without changing semantic level)
- headline: string
- showEyebrow: boolean
- eyebrow: string
- showSubhead: boolean
- subhead: string

### Derived

- `headerParamsId` injected by layout executor for chapter labeling

Rules:

- No inferred flags
- YAML must not define heading IDs
- No placeholder strings
- `variant: "quiet"` adds `header__headline--quiet` class; heading level is unchanged

---

## Text Block

include: `components/text-block.njk`

### Params (`textBlockParams`)

- level: `"h3" | "None"`
- showSubhead: boolean
- subhead: string
- body: array[string]

Rules:

- `body` must be an array
- No multi-paragraph strings
- No template inference
- No margin stacking
- Vertical rhythm controlled via grid gap
- Typography values tokenized
- Explicit line-height tokens only

Example:

~~~yaml
params:
  level: "h3"
  showSubhead: true
  subhead: "Consistency becomes a Requirement"
  body:
    - "Paragraph one..."
    - "Paragraph two..."
~~~

---

## Link Block

include: `components/link-block.njk`

### Params (`linkBlockParams`)

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

Rules:

- `primary` renders if present
- `secondary` renders only if `hasSecondary === true`
- No placeholder values
- No param reshaping into globals

---

## Link

include: `components/link.njk`

### Params (`linkParams`)

- priority: `"Primary" | "Secondary"`
- label: string
- URL: string
- link: string

Rules:

- If `URL` exists → render `<a>`
- If `URL` missing → render disabled `<span aria-disabled="true">`

---

## Figure — Passthrough v1

### Params (`figureParams`)

- type: `"desktop" | "mobile" | "composite"`
- showCaption: boolean
- caption: string
- src: string (public path)
- hasAlt: boolean
- alt: string

Constraints:

- `src` MUST begin with `/assets/images/`
- `src` MUST NOT be filesystem path
- `src` MUST NOT be TODO
- `hasAlt` must be explicit
- `showCaption` must be explicit
- No inference

Rendering Rules:

- Uses native `<img>`
- If `hasAlt === true` → render alt text
- If `hasAlt === false` → `alt=""` + `role="presentation"`
- Caption renders only if explicitly enabled

Example:

~~~yaml
params:
  type: "desktop"
  showCaption: true
  caption: "Example caption."
  src: "/assets/images/example.png"
  hasAlt: true
  alt: "Accessible description."
~~~
