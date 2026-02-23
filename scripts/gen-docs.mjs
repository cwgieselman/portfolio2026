// scripts/gen-docs.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "_docs", "generated");

const paths = {
  executor: path.join(ROOT, "src", "_includes", "layouts", "content-cell.njk"),
  tokensSystem: path.join(
    ROOT,
    "src",
    "assets",
    "scss",
    "_tokens--system.scss",
  ),
  tokensRef: path.join(
    ROOT,
    "src",
    "assets",
    "scss",
    "_tokens--reference.scss",
  ),
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readFileSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

function writeDoc(filename, content) {
  ensureDir(OUT_DIR);
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, content.trim() + "\n", "utf8");
  console.log(`Wrote: ${path.relative(ROOT, outPath)}`);
}

function genRouterMap() {
  const src = readFileSafe(paths.executor);
  if (!src) {
    writeDoc(
      "ROUTER_MAP.md",
      `# ROUTER_MAP (generated)\n\nFAIL: missing source file \`${path.relative(
        ROOT,
        paths.executor,
      )}\``,
    );
    return;
  }

  // Extract include statements: {% include item.include %} is expected
  // We want the whitelisted component paths referenced in comparisons:
  // item.include == "components/foo.njk"
  const whitelistRe = /item\.include\s*==\s*["']([^"']+)["']/g;
  const includes = [];
  let m;
  while ((m = whitelistRe.exec(src))) includes.push(m[1]);

  const unique = [...new Set(includes)].sort();

  const md = `
# ROUTER_MAP (generated)

Source: \`src/_includes/layouts/content-cell.njk\`

## Whitelisted includes
${unique.length ? unique.map((p) => `- \`${p}\``).join("\n") : "- (none found)"}

## Notes
- This file is generated. Edit the router, not this doc.
- Whitelist is derived from comparisons of \`item.include == "…"\` inside the executor.
`;
  writeDoc("ROUTER_MAP.md", md);
}

function genTokensSnapshot() {
  const parts = [];

  const ref = readFileSafe(paths.tokensRef);
  if (ref) {
    parts.push(
      `## src/assets/scss/_tokens--reference.scss\n\n\`\`\`scss\n${ref}\n\`\`\``,
    );
  } else {
    parts.push(`## src/assets/scss/_tokens--reference.scss\n\nMissing file.`);
  }

  const sys = readFileSafe(paths.tokensSystem);
  if (sys) {
    parts.push(
      `## src/assets/scss/_tokens--system.scss\n\n\`\`\`scss\n${sys}\n\`\`\``,
    );
  } else {
    parts.push(`## src/assets/scss/_tokens--system.scss\n\nMissing file.`);
  }

  const md = `
# TOKENS_SNAPSHOT (generated)

Snapshots of canonical token files for diffing.

${parts.join("\n\n")}
`;
  writeDoc("TOKENS_SNAPSHOT.md", md);
}

function main() {
  ensureDir(OUT_DIR);
  genRouterMap();
  genTokensSnapshot();
}

main();
