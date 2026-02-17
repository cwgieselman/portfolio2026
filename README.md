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

## Fix Log

This section records each repair commit in order.

### Commit 1 – Repository Initialization
- Quarantined legacy pages and alternate render paths.
- Preserved only `/portfolio/bmtx-nextgen/` as active page.
- Established deterministic pipeline structure.
