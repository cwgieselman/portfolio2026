# PORTFOLIO2026 — REHAB PHASE STATUS
_As of latest `main`_

Repo:
https://github.com/cwgieselman/portfolio2026

---

## 1. Scope (Strictly Enforced)

Active Page:
- `/portfolio/bmtx-nextgen/`

Next Page (after stability):
- `/portfolio/inficon-ims/`

All other routes/pages:
- Considered quarantined legacy
- Do not modify during Rehab Phase

Rehab is focused on restoring integrity to a single page before expanding scope.

---

## 2. Build Pipeline (Verified Locally)

- `npm start` runs successfully
- Eleventy builds from `src → _site`
- Sass compiles:
  - `src/assets/scss → src/assets/css/main.css`
- Validation source of truth:
  - Local browser DOM output
  - Not GitHub UI previews

All fixes must be validated against actual rendered DOM.

---

## 3. Data & Rendering Pipeline

Figma → JSON → YAML → Template → DOM

- Figma JSON may exist locally
- JSON is not committed
- YAML is the canonical contract
- Templates consume YAML only

Compiled Page Flow:

src/<page>/index.njk  
→ sets `pageKey`

src/_data/pages.js  
→ loads `src/_data/pages/<pageKey>/page.yml`

layouts/compiled-page.njk  
→ layouts/page.njk  
→ layouts/content-cell.njk  
→ component includes

Templates must not infer or reshape data.
YAML defines structure explicitly.

---

## 4. Workflow Artifacts

- `README.md` → human-facing overview
- `CONTRACT.md` → contract definitions & compiler rules
- `scripts/` → versioned Codex prompts and automation artifacts

Do not rely on ignored documentation folders.
All prompts that generate YAML must be versioned.

---

## 5. Branch Naming Convention

rehab/  
→ restore integrity and eliminate drift  

stabilize/  
→ contract alignment and systemic corrections  

build/  
→ new feature work  

experiment/  
→ prototype exploration  

Rehab branches are mechanical repair only.
No redesign, no feature expansion.

---

## 6. Non-Negotiable Working Rules

- Validate using local DOM output
- One component per rehab cycle
- Mechanical corrections only
- No placeholder strings in YAML
- No inferred structure inside templates
- No global style leakage
- No speculative “improvements”
- Fix only where mismatch exists

---

### Documentation Consistency Rule

All documentation updates must:

- Follow existing structural formatting
- Use declarative contract language
- Avoid conversational tone
- Avoid decorative formatting
- Avoid speculative phrasing

Documentation defines rules, not commentary.

---

### Chapter Semantics Rule

Sections represent chapters.

- Section key drives heading ID derivation.
- First header in section receives derived ID.
- Section applies `aria-labelledby`.
- YAML must not define heading IDs.

---

### Display Typography Rule

For H1 and H2:

- Font-size is semantic.
- Line-height is explicitly tokenized.
- Line-height must be grid-snapped.
- Multiplier-based leading is not permitted for display type.
---

## 7. Component Rehab Protocol

Each rehab cycle addresses exactly one component.

For that component:

1. Confirm current YAML contract shape
2. Confirm component template parameter API
3. Confirm Codex prompt emits exact contract shape
4. Confirm rendered DOM output matches expectation
5. Scope SCSS to the component
6. Commit
7. Log change in README

Do not skip steps.
Do not batch multiple components in one cycle.

---

## 8. Definition of “Stable” (Exit Criteria)

The page is considered stable when:

- No contract mismatches
- No template parameter ambiguity
- Each component:
  - Uses deterministic YAML
  - Renders predictable DOM
  - Matches Figma layout/spacing/typography at default viewport
  - Uses scoped SCSS only
- No placeholder data
- No structural inference in templates

Only after stability is achieved do we expand scope.

---

## 9. Intent of Rehab Phase

Rehab is not redesign.

It is:

- Contract correction
- Determinism restoration
- Design-to-code parity enforcement
- Drift elimination

This phase restores structural integrity so future build work is safe, predictable, and scalable.
