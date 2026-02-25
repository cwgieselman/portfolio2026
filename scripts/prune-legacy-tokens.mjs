// scripts/prune-legacy-tokens.mjs
import fs from "node:fs";
import path from "node:path";

const LEGACY_PATH = path.resolve("src/assets/scss/_tokens--legacy.scss");
const GEN_PRIMITIVES = path.resolve("src/assets/scss/_tokens--primitives.scss");
const GEN_SEMANTIC = path.resolve("src/assets/scss/_tokens--semantic.scss");

// Usage:
//   node scripts/prune-legacy-tokens.mjs
//   node scripts/prune-legacy-tokens.mjs --write
//   node scripts/prune-legacy-tokens.mjs --write --in-place
//
// Default is DRY RUN: prints report only.

const args = new Set(process.argv.slice(2));
const DO_WRITE = args.has("--write");
const IN_PLACE = args.has("--in-place");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function extractVarsMap(scssText) {
  // Capture: --var-name: value;
  // Handles values with calc(), var(), rgba(), quoted strings, etc.
  const re = /(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g;
  const map = new Map();
  let m;
  while ((m = re.exec(scssText)) !== null) {
    const name = m[1].trim();
    const value = m[2].trim().replace(/\s+/g, " ");
    map.set(name, value);
  }
  return map;
}

function extractVarNamesSet(scssText) {
  return new Set([...extractVarsMap(scssText).keys()]);
}

function pruneLegacyByNames(legacyText, namesToRemove) {
  // Remove whole declaration lines like: "  --foo: ...;"
  // Keeps formatting and comments intact, only strips matching declarations.
  const lines = legacyText.split("\n");
  const out = [];
  const declRe = /^\s*(--[A-Za-z0-9_-]+)\s*:\s*.*;\s*$/;

  for (const line of lines) {
    const match = line.match(declRe);
    if (match) {
      const varName = match[1];
      if (namesToRemove.has(varName)) {
        continue; // drop it
      }
    }
    out.push(line);
  }

  // Clean up excessive blank lines (optional, mild)
  return out.join("\n").replace(/\n{4,}/g, "\n\n\n");
}

function main() {
  const legacy = read(LEGACY_PATH);
  const gen = read(GEN_PRIMITIVES) + "\n" + read(GEN_SEMANTIC);

  const legacyMap = extractVarsMap(legacy);
  const genMap = extractVarsMap(gen);

  const legacyNames = new Set(legacyMap.keys());
  const genNames = new Set(genMap.keys());

  const covered = [...legacyNames].filter((n) => genNames.has(n)).sort();
  const missing = [...legacyNames].filter((n) => !genNames.has(n)).sort();

  const conflicts = covered
    .filter((n) => legacyMap.get(n) !== genMap.get(n))
    .map((n) => ({
      name: n,
      legacy: legacyMap.get(n),
      generated: genMap.get(n),
    }));

  console.log("\n=== Token Prune Report ===");
  console.log(`Legacy file:     ${LEGACY_PATH}`);
  console.log(`Generated files: ${GEN_PRIMITIVES}, ${GEN_SEMANTIC}\n`);

  console.log(
    `✅ Covered by generated (safe to delete from legacy): ${covered.length}`,
  );
  console.log(
    `⚠️ Still missing (must remain in legacy for now):      ${missing.length}`,
  );
  console.log(
    `❗ Conflicts (same name, different value):             ${conflicts.length}\n`,
  );

  if (conflicts.length) {
    console.log("Conflicts (review these before deleting):");
    for (const c of conflicts.slice(0, 50)) {
      console.log(`- ${c.name}`);
      console.log(`  legacy:    ${c.legacy}`);
      console.log(`  generated: ${c.generated}`);
    }
    if (conflicts.length > 50)
      console.log(`  ...and ${conflicts.length - 50} more\n`);
  }

  if (missing.length) {
    console.log("\nMissing vars (still only in legacy):");
    for (const n of missing.slice(0, 80)) console.log(`- ${n}`);
    if (missing.length > 80) console.log(`...and ${missing.length - 80} more`);
    console.log("");
  }

  // If conflicts exist, we can still prune “covered” vars, but safer to skip conflicts.
  const safeToRemove = new Set(
    covered.filter((n) => !conflicts.some((c) => c.name === n)),
  );

  if (!DO_WRITE) {
    console.log("DRY RUN only. Add --write to output a pruned legacy file.");
    console.log("Tip: also add --in-place to overwrite the legacy file.\n");
    return;
  }

  const pruned = pruneLegacyByNames(legacy, safeToRemove);

  if (IN_PLACE) {
    fs.writeFileSync(LEGACY_PATH, pruned, "utf8");
    console.log(`Wrote pruned legacy file in place: ${LEGACY_PATH}\n`);
  } else {
    const outPath = LEGACY_PATH.replace(/\.scss$/, ".pruned.scss");
    fs.writeFileSync(outPath, pruned, "utf8");
    console.log(`Wrote pruned legacy file: ${outPath}\n`);
  }
}

main();
