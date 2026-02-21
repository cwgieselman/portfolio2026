# portfolio2026
My UX, UI and Design System portfolio built with Figma, Codex and 11ty

## Current Scope

Only one page is in active development:

/portfolio/bmtx-nextgen/

All other legacy pages and rendering experiments have been quarantined and are not part of the active system.

This repository is being stabilized incrementally. The first commit represents a known broken baseline.

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

Dev command:

    npm start

Build command:

    npm run build

---

## Project Conventions

- Only one rendering pipeline is active (compiled-page system).
- Templates must not reach into global data implicitly.
- Includes render only the object passed to them.
- YAML is the single data contract between design intent and markup.

---

## Branch Naming

| Key         | Purpose |
|------------|---------|
| `rehab/`    | Initial barrage of fixes to restore structural integrity and eliminate drift |
| `stabilize/`| Contract alignment and systemic corrections |
| `build/`    | New feature work |
| `experiment/` | Prototypes, explorations, non-permanent ideas |

Notes:
- Use short, descriptive kebab-case after the slash.
- No spaces.
- No long sentences.
- Branch name should describe the structural intent, not the emotional state.

---

## Component API: Links

### `components/link.njk`

Top-level params:

| Param      | Required | Description |
|------------|----------|-------------|
| `priority` | No       | `"Primary"` or `"Secondary"` (default `"Primary"`) |
| `label`    | No       | Small label text above link text (default `"Link"`) |
| `URL`      | No       | If present → renders `<a>`; if absent → renders disabled `<span>` |
| `link`     | No       | Main link text (anchor text) |

Behavior:
- If `URL` exists → clickable `<a>`
- If `URL` missing/empty → disabled `<span>` with `aria-disabled="true"`
- No placeholder strings are emitted

---

### `components/link-block.njk`

Top-level params:

| Param          | Required | Description |
|----------------|----------|-------------|
| `hasSecondary` | No       | Boolean controlling whether secondary link is rendered |
| `primary`      | Yes (in practice) | Object passed directly to `link.njk` |
| `secondary`    | Only if `hasSecondary: true` | Object passed directly to `link.njk` |

Object shape:

```yaml
primary:
  priority: "Primary"
  label: "Link"
  URL: "https://example.com"
  link: "Descriptive link text"
  
Rules:
- Missing URL results in disabled rendering via link.njk

---

### `components/header.njk`

Top-level params:

| Param          | Required | Description |
|----------------|----------|-------------|
| `id`           | No       | Heading `id` attribute. Typically injected automatically for chapter labeling. |
| `level`        | No       | `"h1"` or `"h2"` (default `"h1"`) |
| `headline`     | Yes      | Main heading text |
| `showEyebrow`  | No       | Boolean gate for eyebrow (default `false`) |
| `eyebrow`      | No       | Eyebrow text (only rendered when `showEyebrow: true`) |
| `showSubhead`  | No       | Boolean gate for subhead (default `false`) |
| `subhead`      | No       | Subhead text (only rendered when `showSubhead: true`) |

Behavior:
- `headline` is required; if missing, component emits an HTML comment error and does not render a heading.
- Eyebrow renders only when `showEyebrow: true` and `eyebrow` is non-empty.
- Subhead renders only when `showSubhead: true` and `subhead` is non-empty.
- No placeholder strings are emitted.
- No inference: boolean gates default to `false` when missing.

Chapter labeling (template-driven):
- Each `layout__section` uses: `aria-labelledby="{{ section.sectionKey }}__title"`.
- The first header in the first cell of the first page in a section receives:
  `id = "{{ section.sectionKey }}__title"`.
- YAML must not set header `id` manually for chapter labeling.
---

## Component: text-block

Purpose  
Renders a subhead (optional) and structured body content using deterministic YAML.  
Paragraph structure is defined explicitly in data. Templates do not infer structure.

Contract Rules

- YAML defines full structure.
- `body` must be an array of paragraph strings.
- `showSubhead` must be explicitly defined.
- `level` must be explicitly defined when a subhead is present.
- No template inference is permitted.
- No margin-based spacing inside the component.
- Vertical rhythm is controlled via grid row-gap.
- Typography values must be tokenized.
- Line-height must be explicitly tokenized.
- No global selector leakage.

Rendering Rules

- Subhead renders only when:
  - `showSubhead === true`
  - `subhead` is non-empty
- Subhead renders as:
  - `<h3>` when `level: "h3"`
  - `<p>` when `level: "None"`
- Body renders as:
  - `<div class="text-block__body">`
  - Each paragraph as a separate `<p>`
- Paragraph strings may include inline semantic tags (e.g. `<em>`)

### text-block — API

include: components/text-block.njk

Params:

- level: "h3" | "None"
- showSubhead: boolean
- subhead: string
- body: array[string]

Example:

params:
  level: "h3"
  showSubhead: true
  subhead: "Consistency becomes a Requirement"
  body:
    - "Paragraph one..."
    - "Paragraph two..."



## Component Rehab: figure — Temporary Image Rendering Fix (Passthrough v1)

Status  
Temporary stabilization applied to prevent blank renders caused by async image optimization.

Scope  
Applies only to:
- `/portfolio/bmtx-nextgen/`
- `components/figure.njk`

Rationale  
The previous `figure` implementation used the `image` Nunjucks async shortcode backed by `@11ty/eleventy-img`. In this environment the shortcode call can abort template output during render, resulting in a fully empty `.content-cell` despite valid YAML and include routing. This behavior blocks rehab progress and prevents DOM parity validation.

Temporary Policy  
During Rehab Phase, `figure` MUST render deterministically using passthrough assets only. No optimization pipeline is used.

Source of Truth  
Images are served from `src/assets/images/` via passthrough copy.

- Source path: `src/assets/images/<file>`
- Public path: `/assets/images/<file>`

Contract Shape (Passthrough v1)

include: components/figure.njk

params:
- type: "desktop" | "mobile" | "composite"
- showCaption: boolean
- caption: string
- src: string (public URL path; required)
- hasAlt: boolean
- alt: string

Constraints
- `src` MUST be a public URL path beginning with `/assets/images/`.
- `src` MUST NOT be a filesystem path.
- `src` MUST NOT be a TODO token.
- `hasAlt` MUST be explicitly defined.
- `showCaption` MUST be explicitly defined.
- Template MUST NOT infer `hasAlt` or `showCaption`.

Rendering Rules
- Image renders using native `<img>` only.
- If `hasAlt === true`:
  - render `alt="{{ alt }}"`
- If `hasAlt === false`:
  - render `alt=""` and `role="presentation"`
- Caption renders only if:
  - `showCaption === true` and `caption` is non-empty.
  
  
  ### figure — API (Temporary Passthrough v1)
  
  include: components/figure.njk
  
  Params
  - type: "desktop" | "mobile" | "composite"
  - showCaption: boolean
  - caption: string
  - src: string (public path)
  - hasAlt: boolean
  - alt: string
  
  Example
  
  params:
    type: "desktop"
    showCaption: true
    caption: "The lack of systemization in the existing design artifacts, built in Axure, created inconsistent UI."
    src: "/assets/images/figure-placeholder.jpg"
    hasAlt: true
    alt: "Image description for assistive technology."
    
    
    ## Image Rendering Issue Summary and Forward Plan
    
    Observed Behavior
    - `cell.includes` contains a valid `components/figure.njk` include object.
    - When `figure.njk` contains a `{% image ... %}` shortcode call, the rendered output for the include can collapse to an empty `.content-cell`.
    - When the shortcode is replaced with a native `<img>` element, the include renders normally.
    
    Root Cause (Operational)
    The `image` async shortcode uses `@11ty/eleventy-img`. In the current runtime configuration, the shortcode call can abort template output during render. This yields a silent failure pattern: no visible DOM output and no reliable terminal error surface during watch.
    
    Impact
    - Figure cannot be validated against DOM output.
    - Rehab progress is blocked due to non-deterministic rendering behavior.
    
    Temporary Resolution (Rehab-Compatible)
    - Disable `@11ty/eleventy-img` usage in `figure.njk`.
    - Render images via passthrough assets and native `<img>`.
    - Use public asset paths `/assets/images/...` in YAML.
    
    Forward Plan (Post-Rehab / Stabilize Phase)
    1. Maintain the passthrough figure as the stable baseline.
    2. Create an optional optimized figure component (separate include) that uses `@11ty/eleventy-img`.
    3. Introduce an explicit contract split:
       - Passthrough v1 uses `src` (public path).
       - Optimized v2 uses `srcFile` (filesystem path) and requires a verified `image` shortcode runtime.
    4. Add a non-rendering validation mechanism for build-time visibility of image pipeline failures (e.g., consistent surfaced errors or build break) to prevent silent empty renders.
    5. Re-enable optimized rendering only after the shortcode pipeline is proven deterministic on the target environment.
