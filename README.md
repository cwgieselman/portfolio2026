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

## Branch Naming Convention

Branches follow this format:
  `<key>/<4-5-word-kebab-description>`

Examples:
- `stabilize/link-block-contract`
- `build/inficon-case-layout`
- `experiment/prototype-grid-variants`

### Branch Keys

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

## Project Conventions

- Only one rendering pipeline is active (compiled-page system).
- Templates must not reach into global data implicitly.
- Includes render only the object passed to them.
- YAML is the single data contract between design intent and markup.

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
- link-block does not accept links: []
- Links are role-based (primary, secondary), not array-based
- Missing URL results in disabled rendering via link.njk

---
