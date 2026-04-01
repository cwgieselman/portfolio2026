# PR: `build/token-system-cleanup` → `main`

### What this does

Three mechanical tasks:
1. Commit the latest `tokens/tokens.json` (live Figma pull + semantic variable additions)
2. Rename `--color-text` → `--color-body` in SCSS
3. Align type token size values between `tokens.json` and `_tokens--semantic.scss`

---

### Task 1 — Commit tokens.json

`tokens/tokens.json` has been updated by Claude.ai this session. Commit it as-is.
Run `npm run tokens:build` to regenerate the three `_tokens--*.scss` files.

Changes in this file:
- `color/text` removed, `color/body` is now canonical
- `color/focus`, `color/heading`, `color/eyebrow`, `color/link` added
- `color/pillBG`, `color/pillBorder`, `color/pillText` added
- `type/pill/*` complete set added
- `type/subheading/*` complete set added
- `type/pageTitle/color`, `type/sectionHeading/color`, `type/subheading/color`, `type/eyebrow/color` added
- `type/ctaLink/weight/primary|secondary` nested structure added
- `color/accent/50: #FF5C04` new primitive added
- New semantic button/CTA color tokens added

---

### Task 2 — Rename --color-text → --color-body in SCSS

`--color-text` is being retired in favour of `--color-body`. The CSS variable
`--color-text` will no longer be emitted after `tokens:build` runs (it was
removed from tokens.json). Any remaining references will silently fail.

**Files to update — exact replacements:**

**`src/assets/scss/_base.scss`**
```
FIND:    color: var(--color-text);
REPLACE: color: var(--color-body);
```
There is exactly 1 occurrence — on the `body` rule.

**`src/assets/scss/_typography.scss`**
```
FIND:    color: var(--color-text);
REPLACE: color: var(--color-body);
```
There are exactly 4 occurrences — on h1, h2, h3, and p rules.

No other SCSS files reference `--color-text`. Verify with:
```
grep -r "color-text" src/assets/scss/
```
Should return zero results after the replacements.

---

### Task 3 — Type token size alignment (tokens.json is correct, SCSS may drift)

The Figma variables were updated tonight by Craig — the Figma values are correct
going forward. `tokens.json` currently holds the OLD values for some type sizes.
After running `npm run tokens:build` in Task 1, verify these CSS variables in
`_tokens--semantic.scss` match the values below. If they don't match, the
tokens.json values need updating to match Figma.

**DO NOT change these by guessing — verify by running `npm run tokens:build`
first and reading the output file.**

The known mismatches (Figma is correct, tokens.json may be stale):
- `type/eyebrow/lineHeight` — Figma: `scale/125` (20px), tokens.json: `scale/200` (32px)
- `type/pageTitle/size` — Figma: `scale/175` (28px), tokens.json: `scale/350` (56px)
- `type/pageTitle/lineHeight` — Figma: `scale/300` (48px), tokens.json: `scale/400` (64px)
- `type/subheading/lineHeight` — Figma: `scale/250` (40px) per Figma variable set earlier tonight

If `_tokens--semantic.scss` shows values that don't match Figma:
Update `tokens.json` semantic.type section to match the Figma values, then
re-run `npm run tokens:build`.

**Craig makes these decisions in Figma — do not invent values. Only update
tokens.json if you can verify the correct value from the Figma variable panel
or from the session notes above.**

If uncertain: leave tokens.json as-is and add a note to `_docs/session-state.md`
flagging which type tokens need a Craig decision next session.

---

### Task 4 — Update _docs/session-state.md

Update the branches section to show this branch committed and merged.
Update the open priorities to remove Task 1 and Task 2 from the list.
Add to open items: "Font primitive key rename — `font-weight` → `font.weight`
in tokens.json to align with Figma slash-path convention. Next tokens session."

---

### What to verify

1. `npm run tokens:build` completes without errors
2. `npm start` builds without errors
3. `grep -r "color-text" src/assets/scss/` returns zero results
4. `grep -r "color-body" src/assets/scss/` returns 5 results (body + h1 + h2 + h3 + p)
5. `_tokens--semantic.scss` contains `--color-body` and `--color-focus` — no `--color-text`
6. Site renders correctly in browser — body text color unchanged visually
   (both tokens resolved to the same value: `#082E54`)

### What this does NOT change

- Any visual appearance — `--color-body` resolves to the same hex as `--color-text` did
- Any Nunjucks templates or YAML data files
- The mosaic component or choreography
- Any Figma files
