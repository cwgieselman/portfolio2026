/**
 * One-time migration: flatten token structure
 *
 * primitives.font.family/weight/case → primitives.font-family/font-weight/font-case
 * semantic.type.web.*                → semantic.type.*
 *
 * Also updates all internal {ref} paths accordingly.
 */

import fs from "node:fs";
import path from "node:path";

const TOKENS_PATH = path.resolve("tokens/tokens.json");
const data = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf8"));

// ─── 1. Restructure primitives.font ───────────────────────────────────────────

const font = data.primitives.font;

data.primitives["font-family"] = font.family;
data.primitives["font-weight"] = font.weight;
data.primitives["font-case"]   = font.case;
delete data.primitives.font;

// ─── 2. Flatten semantic.type.web → semantic.type ─────────────────────────────

data.semantic.type = data.semantic.type.web;

// ─── 3. Update all internal {ref} strings throughout the file ─────────────────

const raw = JSON.stringify(data)
  .replaceAll("{font.family.",  "{font-family.")
  .replaceAll("{font.weight.",  "{font-weight.")
  .replaceAll("{font.case.",    "{font-case.")
  .replaceAll("{type.web.",     "{type.");

const updated = JSON.parse(raw);

fs.writeFileSync(TOKENS_PATH, JSON.stringify(updated, null, 2) + "\n", "utf8");
console.log("Migration complete:", TOKENS_PATH);
