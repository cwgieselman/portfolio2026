# portfolio2026
My UX, UI and Design System portfolio built with Figma, Codex and 11ty

---

## Current Scope

Only one page is in active development:

/portfolio/bmtx-nextgen/

All other legacy pages and rendering experiments are quarantined and are not part of the active system.

This repository is being stabilized incrementally.  
The first commit represents a known broken baseline.

---

## Stabilize Phase — Foundation Locked (BMTx NextGen)

### Status

- Active route: `/portfolio/bmtx-nextgen/`
- Render pipeline stabilized.
- Component execution model stabilized.
- All active components migrated to explicit param-object execution.
- Global hydration and reset-based scoping removed from the active route.

### Render Execution Model (Active Route)

- Cells contain `includes[]`.
- Each include provides `params` as a single object.
- The cell executor does not map params into global variables.
- Components must consume only their scoped param object.
- No param reshaping.
- No implicit defaults.
- No scope leakage.

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
Compiled CSS output: `src/assets/css/main.css`

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
- Structural fixes are committed independently.
- One component per rehab/stabilize cycle.

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
- No implicit defaults during stabilize

---

## Figure — Temporary Passthrough v1

Status: Stabilized baseline (async image optimization disabled)

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
  src: "/assets/images/figure-placeholder.jpg"
  hasAlt: true
  alt: "Accessible description."
~~~

---

## Image Rendering Issue Summary

### Observed Behavior

- When using the async `{% image %}` shortcode, `figure` could render as an empty `.content-cell`.
- No reliable error surfaced in watch mode.
- Replacing with native `<img>` restored deterministic rendering.

### Root Cause (Operational)

The `@11ty/eleventy-img` async shortcode can abort template output during render in the current runtime configuration.

### Temporary Resolution

- Disable optimized image rendering.
- Use passthrough assets only.
- Serve images from `/assets/images/...`.

### Forward Plan

1. Keep passthrough figure as stable baseline.
2. Introduce optional optimized figure include separately.
3. Split contract:
   - `src` → passthrough
   - `srcFile` → optimized
4. Re-enable optimization only after deterministic behavior is verified.
