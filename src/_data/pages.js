/*
 * Deterministic page data loader for Eleventy.
 *
 * This avoids Eleventy filename/camelCase ambiguity entirely.
 */

const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

module.exports = function pagesDataLoader() {
  const root = path.join(__dirname, "pages"); // src/_data/pages
  const pages = {};

  if (!fs.existsSync(root)) return pages;

  const entries = fs.readdirSync(root, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pageKey = entry.name; // folder name is the key (kebab-case)
    const filePath = path.join(root, pageKey, "page.yml");

    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = yaml.load(raw);

    // Hard guardrails: fail fast if compiler output is malformed
    if (!parsed || typeof parsed !== "object") {
      throw new Error(`pages.js: page.yml is not a YAML object: ${filePath}`);
    }
    if (!parsed.pageKey) {
      // Let compiler omit it if you want, but it’s a nice integrity check.
      // We'll auto-inject if missing.
      parsed.pageKey = pageKey;
    }
    if (parsed.pageKey !== pageKey) {
      throw new Error(
        `pages.js: pageKey mismatch in ${filePath}\n` +
          `folder: ${pageKey}\n` +
          `yaml:    ${parsed.pageKey}`,
      );
    }

    pages[pageKey] = parsed;
  }

  return pages;
};
