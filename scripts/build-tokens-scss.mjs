// scripts/build-tokens-scss.mjs
import fs from "node:fs";
import path from "node:path";

const TOKENS_PATH = path.resolve("tokens/tokens.json");
const OUT_PRIMITIVES = path.resolve("src/assets/scss/_tokens--primitives.scss");
const OUT_SEMANTIC = path.resolve("src/assets/scss/_tokens--semantic.scss");
const OUT_COMPONENT = path.resolve("src/assets/scss/_tokens--component.scss");

const data = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf8"));

/**
 * Resolve token reference like {scale.baseRem} using tokenSetOrder:
 * - try primitives.<ref>
 * - then semantic.<ref>
 */
function resolveRef(refPath) {
  const clean = refPath.replace(/^\{|\}$/g, ""); // remove { }
  const candidates =
    clean.startsWith("primitives.") ||
    clean.startsWith("semantic.") ||
    clean.startsWith("component.")
      ? [clean]
      : [`primitives.${clean}`, `semantic.${clean}`, `component.${clean}`];

  for (const cand of candidates) {
    const node = getNodeByPath(data, cand);
    if (node && typeof node === "object" && "$value" in node)
      return { path: cand, node };
  }
  throw new Error(`Unresolved reference: ${refPath}`);
}

function getNodeByPath(obj, dotPath) {
  return dotPath
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

/**
 * Convert a token value into a CSS var expression.
 * - numbers become `16px` (for our scale-ish world) — EXCEPT unitless types
 * - references become `var(--...)`
 * - math expressions become `calc(...)`
 *
 * @param {string} value - raw token $value
 * @param {Function} refToCssVar - path-to-var mapper
 * @param {string} [type] - DTCG $type, used to suppress px for unitless values
 */
function valueToCss(value, refToCssVar, type) {
  if (typeof value !== "string") return String(value);

  // Replace token refs {foo.bar} with var(--something)
  const replaced = value.replace(/\{[^}]+\}/g, (match) => {
    const { path: resolvedPath } = resolveRef(match);
    return `var(${refToCssVar(resolvedPath)})`;
  });

  // If the result is just a var(--token), return it as-is
  // (prevents calc(var(--baseREM)) caused by '-' in var names)
  if (/^\s*var\(--[a-zA-Z0-9-]+\)\s*$/.test(replaced)) {
    return replaced.trim();
  }

  // DTCG types that must remain unitless numbers in CSS
  const UNITLESS_TYPES = new Set(["fontWeights", "opacity", "fontWeight"]);

  // If it looks like a pure number string: "16"
  if (/^\s*\d+(\.\d+)?\s*$/.test(replaced)) {
    if (UNITLESS_TYPES.has(type)) return replaced.trim();
    return `${replaced.trim()}px`;
  }

  // If it contains math operators, wrap in calc()
  if (/[+\-*/]/.test(replaced)) {
    return `calc(${replaced})`;
  }

  // Otherwise pass through (e.g., font families later)
  return replaced;
}

/**
 * Map token path → CSS variable name.
 * This is where we preserve your existing naming patterns.
 */
function refToCssVar(fullPath) {
  // fullPath like "primitives.scale.baseRem" or "semantic.space.m"
  const [setName, ...rest] = fullPath.split(".");

  // --- PRIMITIVES -------------------------------------------------
  // primitives.scale.25 -> --scale-25
  if (setName === "primitives" && rest[0] === "scale")
    return `--scale-${rest[1]}`;

  // --- SEMANTIC ---------------------------------------------------
  // semantic.space.m -> --spacing-m
  if (setName === "semantic" && rest[0] === "space")
    return `--spacing-${rest[1]}`;

  // semantic.radius.m -> --corner-m
  if (setName === "semantic" && rest[0] === "radius")
    return `--corner-${rest[1]}`;

  // --- COMPONENT --------------------------------------------------
  // component.space.content-rhythm.block -> --content-rhythm--block
  if (
    setName === "component" &&
    rest[0] === "space" &&
    rest[1] === "content-rhythm"
  )
    return `--content-rhythm--${rest[2]}`;

  // Fallback: join path segments with dashes, preserving Figma camelCase names
  return `--${rest.join("-")}`.replace(/--+/g, "--");
}

function collectVars(node, prefixPath = []) {
  const vars = [];

  for (const [key, val] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    const nextPath = [...prefixPath, key];

    if (val && typeof val === "object" && "$value" in val) {
      if (typeof val.$value === "object") continue; // composite tokens (typography etc.) can't map to a single CSS value
      const fullPath = nextPath.join(".");
      const cssVar = refToCssVar(fullPath);
      const tokenType = val.$type || null;
      const cssVal = valueToCss(val.$value, refToCssVar, tokenType);
      vars.push([cssVar, cssVal, fullPath]);
    } else if (val && typeof val === "object") {
      vars.push(...collectVars(val, nextPath));
    }
  }

  return vars;
}

function sortVars(vars) {
  return vars.slice().sort(([a], [b]) => a.localeCompare(b));
}

function assertNoDuplicateVars(vars, label) {
  const seen = new Map();
  for (const [name, value, sourcePath] of vars) {
    if (seen.has(name)) {
      const prev = seen.get(name);
      throw new Error(
        `[${label}] Duplicate CSS var "${name}"\n` +
          `- ${prev.sourcePath} => ${prev.value}\n` +
          `- ${sourcePath} => ${value}\n`,
      );
    }
    seen.set(name, { value, sourcePath });
  }
}

function renderRoot(vars, fileLabel, descriptionBlock) {
  const lines = [];

  lines.push("/* ----------------------------------");
  lines.push(` * ${fileLabel}`);
  lines.push(` * ${descriptionBlock.title}`);
  lines.push(` * ${descriptionBlock.subtitle}`);
  lines.push(" *");
  lines.push(" * This file is AUTO-GENERATED from");
  lines.push(" * tokens/tokens.json.");
  lines.push(" * DO NOT edit this file directly.");
  lines.push(" * ----------------------------------*/");
  lines.push("");

  lines.push(":root {");
  let prevGroup = null;
  for (const [k, v, sourcePath] of vars) {
    const group = sourcePath.split(".").slice(0, -1).join(".");
    if (prevGroup !== null && group !== prevGroup) lines.push("");
    lines.push(`  ${k}: ${v};`);
    prevGroup = group;
  }
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

// Collect variables
let primitiveVars = collectVars(data.primitives, ["primitives"]);
let semanticVars = collectVars(data.semantic, ["semantic"]);
let componentVars = data.component
  ? collectVars(data.component, ["component"])
  : [];

// Sort helpers
const TSHIRT_ORDER = ["none", "xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl", "full"];

function scaleValue(varName) {
  if (varName === "--scale-base") return 0;
  const m = varName.match(/^--scale-(\d+)$/);
  return m ? parseInt(m[1]) : null;
}

function tshirtValue(varName, prefix) {
  const m = varName.match(new RegExp(`^--${prefix}-(.+)$`));
  if (!m) return null;
  const idx = TSHIRT_ORDER.indexOf(m[1]);
  return idx === -1 ? null : idx;
}

function compareVars([a], [b]) {
  const sa = scaleValue(a), sb = scaleValue(b);
  if (sa !== null && sb !== null) return sa - sb;

  for (const prefix of ["spacing", "corner"]) {
    const ta = tshirtValue(a, prefix), tb = tshirtValue(b, prefix);
    if (ta !== null && tb !== null) return ta - tb;
  }

  return a.localeCompare(b);
}

// Sort for deterministic output
primitiveVars.sort(compareVars);
semanticVars.sort(compareVars);
componentVars.sort(compareVars);

// Guard against collisions like --m being emitted twice
assertNoDuplicateVars(primitiveVars, "primitives");
assertNoDuplicateVars(semanticVars, "semantic");
assertNoDuplicateVars(componentVars, "component");

fs.writeFileSync(
  OUT_PRIMITIVES,
  renderRoot(primitiveVars, "_tokens--primitives.scss", {
    title: "Primitives (a.k.a. Base / Core / Foundations)",
    subtitle: "Raw values. No meaning. No intent.",
  }),
  "utf8",
);

fs.writeFileSync(
  OUT_SEMANTIC,
  renderRoot(semanticVars, "_tokens--semantic.scss", {
    title: "Semantic assignments (a.k.a. Alias / System)",
    subtitle: "Intent-based usage tokens.",
  }),
  "utf8",
);

fs.writeFileSync(
  OUT_COMPONENT,
  renderRoot(componentVars, "_tokens--component.scss", {
    title: "Component tokens (a.k.a. Scoped / Contextual)",
    subtitle: "Tokens scoped to context INSIDE a specific component.",
  }),
  "utf8",
);

console.log("Wrote:", OUT_PRIMITIVES);
console.log("Wrote:", OUT_SEMANTIC);
console.log("Wrote:", OUT_COMPONENT);
