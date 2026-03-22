/*
 * component-docs.js
 * Eleventy global data loader for design system component documentation.
 *
 * Reads src/_data/component-docs/*.yml and exposes them as componentDocs.
 * Each file maps to componentDocs[id] — e.g. componentDocs['bento-article'].
 *
 * Consumed by src/design-system/index.njk.
 * Follows the same pattern as pages.js.
 */

const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

module.exports = function componentDocsLoader() {
  const root = path.join(__dirname, "component-docs");
  const docs = {};

  if (!fs.existsSync(root)) return docs;

  const entries = fs.readdirSync(root).filter(f => f.endsWith(".yml"));

  for (const filename of entries) {
    const filePath = path.join(root, filename);
    const raw = fs.readFileSync(filePath, "utf8");
    let parsed;

    try {
      parsed = yaml.load(raw);
    } catch (e) {
      throw new Error(`component-docs.js: YAML parse error in ${filePath}\n${e.message}`);
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error(`component-docs.js: expected YAML object in ${filePath}`);
    }
    if (!parsed.id) {
      throw new Error(`component-docs.js: missing id field in ${filePath}`);
    }

    docs[parsed.id] = parsed;
  }

  return docs;
};
