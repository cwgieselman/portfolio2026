/**
 * Token structure migration — phase 2
 *
 * 1. Consolidate CTA tokens:
 *    type.ctaLink (family/size/lineHeight) + type.primaryCTA/secondaryCTA (weight)
 *    → type.cta (family/size/lineHeight) + type.cta.weight.primary/secondary
 *
 * 2. Merge text color tokens into type stacks:
 *    semantic.text.*.default → semantic.type.*.color
 *    Eliminates the semantic.text group entirely.
 *
 * 3. Update all internal {ref} paths accordingly.
 */

import fs from "node:fs";
import path from "node:path";

const TOKENS_PATH = path.resolve("tokens/tokens.json");
const data = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf8"));

const type = data.semantic.type;

// ─── 1. Consolidate CTA ───────────────────────────────────────────────────────

// Rename ctaLink → cta, add weight sub-group
type.cta = { ...type.ctaLink };
type.cta.weight = {
  primary:   type.primaryCTA.weight,
  secondary: type.secondaryCTA.weight,
};

delete type.ctaLink;
delete type.primaryCTA;
delete type.secondaryCTA;

// ─── 2. Move text colors into type stacks ─────────────────────────────────────

const textColors = data.semantic.text;

for (const [tokenName, variants] of Object.entries(textColors)) {
  if (!type[tokenName]) continue;
  // e.g. textColors.eyebrow.default → type.eyebrow.color
  type[tokenName].color = variants.default;
}

delete data.semantic.text;

// ─── 3. Update internal {ref} strings ─────────────────────────────────────────

const raw = JSON.stringify(data)
  .replaceAll("{type.ctaLink.",     "{type.cta.")
  .replaceAll("{type.primaryCTA.",  "{type.cta.weight.")
  .replaceAll("{type.secondaryCTA.", "{type.cta.weight.");

const updated = JSON.parse(raw);

fs.writeFileSync(TOKENS_PATH, JSON.stringify(updated, null, 2) + "\n", "utf8");
console.log("Migration complete:", TOKENS_PATH);
