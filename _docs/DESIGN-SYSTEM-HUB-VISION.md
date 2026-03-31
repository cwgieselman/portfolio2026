# Design System Hub — Vision & Roadmap
*Created: March 31, 2026*

---

## What this page is

`/design-system/` is a public-facing design system workbench — not just documentation, but a live tool that demonstrates the system working. It exists at the intersection of portfolio artifact and functional product: a hiring manager can browse the token system and component library; a designer can use it to build YAML page compositions visually.

The fact that this page is built with the system it documents is the point. It eats its own cooking.

---

## The three tools

### Tool 1 — Token Viewer (exists, being wired up)
Browse the full token inventory across primitive, semantic, and component tiers. List and card views. Color swatches, scale previews, typography specimens. Sourced directly from `tokens/tokens.json` — never manually maintained.

### Tool 2 — Component Gallery (mothballed, ready to revive)
Browse every component in the system. See all variants. Switch themes, edit text inline, toggle states. The "poor man's Storybook" — not Storybook's complexity, but the core value: see a component, understand it, know how to use it. Actual component CSS classes render in the preview, not mocked approximations.

Each component entry has:
- Live preview with interactive controls (theme, text, state)
- YAML instance — the exact data structure to reproduce what you see
- Data contract — every field, type, required/optional
- Usage — when to use, when not to, gotchas, accessibility, related components
- Changelog — version history

### Tool 3 — YAML Builder (not yet started)
The most distinctive piece. Pick a component. Configure it visually — choose theme, set text, set grid placement. See the live preview update. Hit "Copy YAML" and get back the exact data structure that drops into a page YAML file and produces what you just built.

This closes the loop: a page author who knows the system can assemble a composition here, copy the output, and drop it directly into the build pipeline. No Figma required for simple pages. No guessing at field names. The builder IS the contract, made interactive.

**YAML builder open questions (decide before building):**
- Which components are buildable? Start with mosaic only, expand later.
- What does "save" mean? Copy to clipboard is v1. Download `.yml` is v2. Eventually: write directly to a data file via a local API — ambitious but possible.
- Does the builder live in the DS hub tab nav, or get its own route (`/design-system/builder/`)?
- Does it generate a single component instance, or a full chapter/page structure?

---

## Roadmap

### Phase 1 — Token Viewer (current)
- [x] Page exists at `/design-system/`
- [x] Token data hardcoded as JS array
- [ ] **Wire token viewer to `tokens/tokens.json` via Eleventy data transform** ← current work
- [ ] Patch stale font family references (Playfair Display, Courier Prime)
- [ ] Fix post-vocabulary-rename references (mosaic not bento)

### Phase 2 — Token Viewer polish
- [ ] Typography specimens use actual font families from tokens
- [ ] Scale tokens render as visual bars proportional to value
- [ ] Color tokens show contrast ratio against page background
- [ ] Token viewer reflects pull script updates automatically (no manual maintenance ever)
- [ ] `_design-system-hub.scss` redesigned in Figma, refactored to use system tokens

### Phase 3 — Component Gallery revival
- [ ] Revive mothballed gallery with mosaic vocabulary
- [ ] Real mosaic tiles render in preview using actual CSS classes
- [ ] Theme switcher — cycle through all mosaic themes live
- [ ] Inline text editing on tile content
- [ ] Component data sourced from `src/_data/component-docs/` YAML files (not hardcoded JS)
- [ ] Figure and media components added

### Phase 4 — YAML Builder v1
- [ ] Spec the builder UX in Figma first
- [ ] Mosaic tile picker — drag or click to add tiles to a grid
- [ ] Per-tile controls: type, theme, text content, grid placement
- [ ] Live preview updates as you configure
- [ ] "Copy YAML" outputs valid YAML matching the current page contract
- [ ] Validate output against CONTRACT.md rules (4-row max, etc.)

### Phase 5 — YAML Builder v2
- [ ] Chapter-level builder — field text + mosaic composition together
- [ ] Export as downloadable `.yml` file
- [ ] Side-by-side: builder left, rendered output right
- [ ] Save/load compositions within the session

---

## Technical architecture

**Token Viewer data flow (target state):**
```
tokens/tokens.json
  → src/_data/tokenDocs.js (Eleventy data transform)
  → tokenDocs global available in all templates
  → design-system/index.njk injects as JSON via script tag
  → client-side JS renders the UI
```

**Component Gallery data flow (target state):**
```
src/_data/component-docs/*.yml (one file per component)
  → componentDocs global (already wired via Eleventy data cascade)
  → design-system/index.njk injects as JSON
  → client-side JS renders gallery and detail panels
```

**YAML Builder data flow (target state):**
```
User configures composition in browser UI
  → Builder JS assembles YAML string from component data contract
  → Output validated against CONTRACT.md rules
  → Copy to clipboard / download
```

---

## Principles

- The page must use system tokens to style itself. It cannot be exempt from the system it documents.
- Every component preview must use actual CSS classes, not mocked approximations. If the real component breaks in the preview context, that's a bug to fix, not a reason to mock.
- The token viewer is never manually maintained. It sources from `tokens/tokens.json` exclusively. Accuracy is automatic.
- The YAML builder output must be valid, directly usable input to the 11ty build. It is not illustrative — it is functional.
- Design in Figma first for any new UI surface on this page. The hub is a portfolio artifact; its own UI quality matters.

---

## Notes

Token Studio has been removed from this project (March 31, 2026). The token pipeline is now:
`tokens/tokens.json` (hand-authored / figma-pull.mjs) → `build-tokens-scss.mjs` → CSS custom properties.

The `tokens:pull` script (`scripts/figma-pull.mjs`) is planned but not yet built. When it exists, the token viewer will reflect Figma variable changes automatically after a pull + build cycle.
