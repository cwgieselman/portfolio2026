// scripts/check-executor-invariants.mjs
// Cheap invariant checks to prevent accidental weakening of the executor.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXECUTOR_PATH = "src/_includes/layouts/content-cell.njk";

const abs = path.join(ROOT, EXECUTOR_PATH);
if (!fs.existsSync(abs)) {
  console.error(`FAIL: Missing executor file: ${EXECUTOR_PATH}`);
  process.exit(1);
}

const src = fs.readFileSync(abs, "utf8");

// Minimal invariants (string checks)
const REQUIRED_SNIPPETS = ["EXECUTOR_ERROR", "UNKNOWN_INCLUDE", "item.include"];

// Optional: verify explicit safelist-style branching exists.
// This is intentionally fuzzy — adjust if your executor structure changes.
const SAFELIST_HINTS = ["elseif item.include", "if item.include"];

let failures = [];

for (const s of REQUIRED_SNIPPETS) {
  if (!src.includes(s))
    failures.push(`Missing required executor marker/snippet: "${s}"`);
}

if (!SAFELIST_HINTS.some((s) => src.includes(s))) {
  failures.push(
    `Safelist branching not detected (expected one of: ${SAFELIST_HINTS.map((s) => `"${s}"`).join(", ")})`,
  );
}

if (failures.length) {
  console.error("\nFAIL: Executor invariants violated:\n");
  for (const f of failures) console.error(`- ${f}`);
  console.error("");
  process.exit(1);
}

console.log("PASS: Executor invariants present.");
