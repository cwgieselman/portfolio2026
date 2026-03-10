/*
 * bentoDiscovery.js
 *
 * Thin loader that exposes inficon--discovery-bento.yml under a valid JS identifier.
 *
 * Required because 11ty derives the template variable key directly from the
 * filename stem. "inficon--discovery-bento" contains double-hyphens that Nunjucks
 * parses as arithmetic operators, making the key unreachable in template syntax.
 * This follows the same pattern as pages.js (see comment there:
 * "This avoids Eleventy filename/camelCase ambiguity entirely").
 *
 * Exposed in templates as: bentoDiscovery.bento
 */
const fs   = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

module.exports = function () {
  const raw = fs.readFileSync(
    path.join(__dirname, "inficon--discovery-bento.yml"),
    "utf8"
  );
  return yaml.load(raw);
};
