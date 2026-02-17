PROMPT C — FULL PAGE COMPILE (Figma JSON → Eleventy page data + placements + report)

ROLE
You are a deterministic compiler. You MUST NOT invent copy, labels, alt text, captions, or URLs. Only use raw Figma text from the JSON. When missing, emit explicit TODO tokens.

INPUTS (one of two modes)
MODE A (preferred): Local JSON already fetched
- pageKey: <PAGE_KEY>  (kebab-case slug; matches root frame name)
- figmaJsonPath: src/_figma-json/<PAGE_KEY>.json

MODE B (optional convenience): Pasted Figma FRAME URL
- figmaFrameUrl: <PASTE_CMD_L_FRAME_URL>
- pageKey: <PAGE_KEY>
- If figmaFrameUrl is provided, run:
  npm run figma:fetch -- "<figmaFrameUrl>" <pageKey>
  Then read: src/_figma-json/<pageKey>.json

OUTPUTS (MUST WRITE ALL)
1) Data YAML (per page):
   src/_data/pages/<pageKey>/page.yml

2) Placements SCSS (per page):
   src/assets/scss/placements/_<pageKey>.scss

3) Extract report (per page):
   docs/extract/<pageKey>.md

4) Thin Eleventy page scaffold (create if missing; update minimally if exists):
   src/<pageKey>/index.njk
   - Must contain front matter: layout, title, permalink, pageKey
   - Do NOT inline the compiled YAML into the page.

PROJECT CONTRACTS (NON-NEGOTIABLE)
A) No invented copy
- All string content must come from raw Figma text in JSON.
- If missing, output TODO tokens (examples below).

B) renderSpec contract
- The source of truth is a component property whose key starts with: "renderSpec#"
- The value determines which include(s) to emit.
- Map:
  renderSpec value → includes emitted
  - header → components/header.njk
  - text-block → components/text-block.njk
  - figure → components/figure.njk
  - link-block → components/link-block.njk
  - multi:text-block+link-block → [components/text-block.njk, components/link-block.njk]
- If renderSpec is missing:
  - Use fallback wrapper-id swap logic that already exists in Prompt A/B:
    Identify the nearest plausible wrapper id used for placement; if wrapper id appears swapped with a child node id, use the swapped id. Report this as a warning in docs.
  - If still unknown, emit includes: [] and log a warning.

C) Grid placement contract
- Figma grid anchors are 0-based.
- CSS grid lines are 1-based. ALWAYS add +1 to Figma line values when emitting SCSS.
- Numeric grid placement only. DO NOT use absolute positioning, transforms, negative margins, top/left, etc.
- Emit placements SCSS only (no inline styles).

D) Ordering contract
- Ignore JSON order.
- Sort sections by numeric suffix in their names (section-01, section-02…).
- Sort pages by numeric suffix within each section (page-01, page-02…).
- Sort cells by visual position using bbox/top-left:
  primary: y (top)
  secondary: x (left)
- For ties, keep a stable deterministic fallback (e.g., node id ascending) and report ties.

E) Layout contract
- We already have global centering/clipping (layout__section + layout__page).
- Do not change global layout in this compile step. Only generate placements + data.

TARGET YAML SHAPE (src/_data/pages/<pageKey>/page.yml)
- Must be valid YAML.
- Use YAML block scalars (|) for multiline strings.
- Example shape:

pageKey: "<pageKey>"
figma:
  fileKey: "TODO:fileKey"
  nodeId: "TODO:nodeId"
  fetchedAt: "TODO:fetchedAt"
sections:
  - sectionKey: "section-01"
    mode: "composite"   # if >1 page; else "normal"
    pages:
      - pageKey: "page-01"
        cells:
          - wrapper: "<wrapperId>"
            includes:
              - include: "components/header.njk"
                params:
                  headline: "Raw Figma text or TODO"
                  subhead: "Raw Figma text or TODO"
                  eyebrow: "Raw Figma text or TODO"
              - include: "components/link-block.njk"
                params:
                  links:
                    - text: "TODO"
                      href: "TODO"
  - sectionKey: "section-02"
    mode: "normal"
    pages:
      - pageKey: "page-01"
        cells: []

PARAM EXTRACTION RULES (by include)
1) components/header.njk params:
- headline: from the main header text node
- subhead: from subhead text if present else omit
- eyebrow: from eyebrow text if present else omit
- If missing: use TODO tokens:
  - headline: "TODO:headline"

2) components/text-block.njk params:
- body: main paragraph text; preserve line breaks; use block scalar if multiline
- subhead: optional
- If missing: body: "TODO:body"

3) components/figure.njk params:
- caption: from caption text if present else omit
- src: ALWAYS "TODO:src" unless a real URL exists in the JSON (rare)
- alt: ALWAYS "TODO:alt" unless explicitly present in text nodes AND clearly intended as alt
- hasAlt: true only if alt is not TODO and not empty
- If missing caption: omit (do not invent)

4) components/link-block.njk params:
- links: array of { text, href }
- text: raw link label text
- href: ONLY if explicitly present in the JSON (e.g., in a URL text node). Otherwise "TODO:href"
- If there are N links with labels but no hrefs, emit N entries with TODO hrefs.
- If no links found: links: [] and report warning.

5) multi includes:
- Emit both includes in the order specified in renderSpec.
- Params extracted independently per include.

PLACEMENTS SCSS OUTPUT (src/assets/scss/placements/_<pageKey>.scss)
- Must define placements for each wrapper id used in YAML.
- Naming: follow existing pattern from Prompt A (do not invent a new convention).
- For each wrapper:
  - grid-column: <startLine> / <endLine>;
  - grid-row: <startLine> / <endLine>;
- All numbers are CSS grid lines (Figma+1).
- Group placements by section/page (comment headers ok).
- Do not include unrelated styles.

THIN PAGE SCAFFOLD (src/<pageKey>/index.njk)
- Create folder if missing.
- If file exists, only update the front matter fields if missing.
- Content should remain empty; rendering happens in layouts/compiled-page.njk.
- Use this template:

---
layout: layouts/compiled-page.njk
title: "TODO:title"         # DO NOT invent; if not present elsewhere, leave TODO
permalink: "/work/<pageKey>/"
pageKey: "<pageKey>"
---
{# Intentionally blank. Layout renders from pages[pageKey]. #}

REPORT OUTPUT (docs/extract/<pageKey>.md)
Must include:
- Summary header with pageKey and timestamp.
- Counts:
  - sections found
  - pages found
  - cells found
  - wrappers emitted
  - includes emitted (by type)
- TODO counts:
  - TODO:headline
  - TODO:body
  - TODO:src
  - TODO:alt
  - TODO:href
  - any other TODO:* encountered
- Warnings:
  - missing renderSpec (list node ids)
  - wrapper id swap fallbacks used
  - bbox tie-breaks applied
  - any nodes skipped and why
- A “Wrapper Manifest” list:
  - wrapper id → includes list (in order)
  - this helps diff stability

IMPLEMENTATION NOTES
- Do not refactor unrelated files.
- Do not change global layouts or component templates.
- Only touch the four outputs listed.
- Use deterministic formatting: stable key ordering in YAML, stable sorting rules.

NOW DO THIS
Given:
- pageKey: <PAGE_KEY>
- figmaJsonPath OR figmaFrameUrl (Mode A or B)
Perform the compile and write the outputs exactly as specified.
