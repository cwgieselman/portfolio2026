# Token Backlog — Figma Work Required

Items that need design decisions in Figma before they can be tokenized. Each one has a `CONTRACT_EXCEPTION` annotation in the SCSS pointing here. Once resolved in Figma, add the token to `tokens/tokens.json`, run `npm run tokens:build`, and substitute in the SCSS.

---

## 1. Shadow system

**Current state:** `box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.25)` in `_page-header.scss` and `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25)` in `_comparison-slider.scss`. Both are bare literals with no token backing.

**What Figma needs:** A shadow/elevation ramp. At minimum two levels — a subtle (2px) and a standard (4px) — with defined blur, spread, and opacity values. These should be defined as Effect Styles in Figma and pushed through Token Studio as `shadow.*` tokens.

**Token targets:** `--shadow-s`, `--shadow-m` (or similar naming TBD).

---

## 2. Alpha / overlay color system

**Current state:** `rgba(0, 0, 0, 0.55)` in `_comparison-slider.scss` (dark label overlays). No alpha token system exists.

**What Figma needs:** A decision on how transparent overlays are handled — either as named Effect Styles, or as a set of `color.overlay.*` tokens with defined opacity levels (e.g. `overlay-light`, `overlay-dark`). DTCG supports 8-digit hex for alpha (`#0000008C` ≈ 55% black) if a simple token is preferred over a full system.

**Token targets:** `--color-overlay-dark` (or similar naming TBD).

---

## 3. Frosted glass background

**Current state:** `background-color: rgba(255, 255, 255, 0.92)` in `_page-header.scss` (`__frosting` element).

**What Figma needs:** This is a specific component-level visual treatment. Define it as a component token in Figma — either as a fill on the frosting layer with the correct opacity, or as a named variable. Should live in the `component` token set, not semantic.

**Token targets:** `--page-header-frosting-bg` (scoped component token).

---

## 4. Page header headline line-height (2.75rem)

**Current state:** `.page-header__headline { line-height: 2.75rem; }` — 44px at 16px base. No `--scale-275` token exists. The nearest tokens are `--scale-250` (40px) and `--scale-300` (48px).

**What Figma needs:** Confirm whether 44px is intentional or a rounding error. If intentional, add `scale.275` to the primitives (same pattern as existing scale tokens). If it should be 40px or 48px, update the SCSS to use the existing token.

**Token target (if confirmed):** Add `primitives.scale.275` → `--scale-275: calc(var(--scale-base) * 2.75)`.

---

## 5. Em-based letter-spacing

**Current state:** `letter-spacing: 0.25em` in `_page-header.scss` (chip), `0.1em` in `_bento-grid.scss` (scroll indicator label), `0.08em` in `_comparison-slider.scss` (slider labels). The existing tracking tokens (`--text-tracking-loose/normal/snug`) are px-based, not em-based.

**What Figma needs:** A decision on the tracking token system — px or em? Em-relative tracking scales with font-size, which is usually preferable. If em is the right model, the existing `text-tracking-*` tokens should be reconsidered or a parallel em-based set added. If px is canonical, these values need to be converted to px equivalents and mapped to tokens.

**Token targets:** Either new `--text-tracking-*` em values, or conversion of existing values. Naming and unit convention TBD.

---

## 6. Design system hub UI

**Current state:** `_design-system-hub.scss` contains ~100+ bare hex colors, sub-pixel borders (`0.5px`), and magic px values throughout. These are bespoke colors for the token viewer UI (`#888880`, `#aaa`, `#eaeae8`, `#f0f0ee`, `#ddddd8`, etc.) that don't exist in the token system.

**What Figma needs:** A formal design pass on the design system hub UI. The component gallery panel is currently commented out (component gallery to be rebuilt as a live Storybook-style viewer). The token viewer UI should be designed in Figma with tokens before the SCSS is refactored.

**Token targets:** Likely a `component.hub.*` token set for the bespoke UI chrome. Or simply use existing semantic tokens if the redesign can constrain itself to the palette.

**Note:** This is the largest single source of token debt and should be addressed at rebuild time, not incrementally retrofitted.
