// scripts/check-no-css-var-fallbacks.mjs
// Fails if any CSS var() uses a fallback: var(--token, fallback)
//
// Why: fallback values hide token drift and break determinism.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = [
  "src/assets/scss",
  "src/_includes", // in case inline styles ever appear
];

const EXTS = new Set([".scss", ".css", ".njk", ".html"]);
const VAR_FALLBACK_RE = /var\(\s*--[^,\s)]+\s*,\s*[^)]+\)/g;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function isTargetFile(filePath) {
  return EXTS.has(path.extname(filePath));
}

let failures = [];

for (const d of TARGET_DIRS) {
  const abs = path.join(ROOT, d);
  for (const file of walk(abs)) {
    if (!isTargetFile(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    const matches = text.match(VAR_FALLBACK_RE);
    if (matches && matches.length) {
      failures.push({
        file: path.relative(ROOT, file),
        matches,
      });
    }
  }
}

if (failures.length) {
  console.error(
    "\nFAIL: CSS var() fallbacks detected. Remove fallbacks and resolve token sources.\n",
  );
  for (const f of failures) {
    console.error(`- ${f.file}`);
    // Print unique matches to reduce noise
    const uniq = [...new Set(f.matches)].slice(0, 8);
    for (const m of uniq) console.error(`  ${m}`);
    if (new Set(f.matches).size > uniq.length) console.error("  …(more)");
  }
  console.error("");
  process.exit(1);
}

console.log("PASS: No CSS var() fallbacks found.");
