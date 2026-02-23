# DOC DRIFT REPORT

---

## DRIFT-001
- **Severity:** MAJOR  
- **Files:** `CONTRACT.md`, `src/assets/scss/_tokens--system.scss`, `src/assets/scss/_typography.scss`  
- **Issue:** The typography token names required by the contract do not match the token names consumed by the SCSS system and typography rules.  
- **Evidence:**
  - "Font-size uses semantic tokens: --web---title-h1" (`CONTRACT.md`)
  - "--web---title: var(--scale-350);" (`src/assets/scss/_tokens--system.scss`)
- **Recommended fix:**
  - Update code  
  - Rename/add contract token names in `src/assets/scss/_tokens--system.scss` and update usages in `src/assets/scss/_typography.scss`.  
  - Regenerate docs after token alignment.

---

## DRIFT-002
- **Severity:** MAJOR  
- **Files:** `CONTRACT.md`, `src/_includes/components/header.njk`  
- **Issue:** The contract allows `h3` for header level, but the header template falls back to `<p>` for non-`h1`/`h2` values.  
- **Evidence:**
  - `- level: "h1" | "h2" | "h3"` (`CONTRACT.md`)
  - `{% else %} <p class="header__headline"` (`src/_includes/components/header.njk`)
- **Recommended fix:**
  - Update code  
  - Add an explicit `h3` branch in `src/_includes/components/header.njk`.  
  - Keep `<p>` only for explicitly documented non-heading modes, if any.

---

## DRIFT-003
- **Severity:** MAJOR  
- **Files:** `CONTRACT.md`, `src/_includes/layouts/content-cell.njk`, `_docs/generated/ROUTER_MAP.md`  
- **Issue:** Active executor routing includes `richtext`, but the contract’s executor param-object list does not document a `richtext` param contract.  
- **Evidence:**
  - "Params must be passed as explicit component-specific objects:" (`CONTRACT.md`)
  - `{% elseif item.include == "components/richtext.njk" %}` (`src/_includes/layouts/content-cell.njk`)
- **Recommended fix:**
  - Update docs  
  - Add `richtext` include and `richtextParams` contract to `CONTRACT.md`.  
  - Add/align a component contract section for `components/richtext.njk`.

---

## DRIFT-004
- **Severity:** MINOR  
- **Files:** `CONTRACT.md`, `src/_includes/components/figure.njk`  
- **Issue:** The missing-field error marker format in code does not match the contract’s required marker format.  
- **Evidence:**
  - `<!-- missing <field> -->` (`CONTRACT.md`)
  - `<!-- FIGURE_ERROR: missing src -->` (`src/_includes/components/figure.njk`)
- **Recommended fix:**
  - Update code  
  - Standardize missing-field comments to the contract format in `src/_includes/components/figure.njk`.  
  - Apply the same marker convention across components that validate required fields.
