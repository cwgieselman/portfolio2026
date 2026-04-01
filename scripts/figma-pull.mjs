// scripts/figma-pull.mjs
//
// Pulls color, semantic, and component tokens from Figma Variables (CGDC-DS)
// and writes them into tokens/tokens.json.
//
// WHAT THIS PULLS:
//   primitives collection → primitives.color.*
//   semantic collection   → semantic.space.*, semantic.radius.*,
//                           semantic.color.*, semantic.type.*
//   component collection  → component.mosaic.*, component.space.*
//
// WHAT THIS SKIPS (hand-authored, never pulled):
//   primitives.scale.*       — math expressions must be preserved in CSS output
//   primitives.font-family.* — stable string values, hand-authored
//   primitives.font-weight.* — stable numeric values, hand-authored
//   primitives.font-case.*   — hand-authored
//   primitives.text.*        — hand-authored
//   component.layout.*       — layout geometry constants, not design tokens
//
// WHY scale is skipped: Figma Variables store resolved concrete values (28px).
// The SCSS pipeline requires calc(var(--scale-base) * 1.75) for the 2-col grid
// override to work at runtime. These values must remain as math expressions in
// tokens.json — Figma cannot represent that relationship.
//
// USAGE:
//   FIGMA_TOKEN=your_pat npm run tokens:pull
//
// FIGMA_TOKEN must be a Figma Personal Access Token with read access to CGDC-DS.
// Generate one at: https://www.figma.com/settings → Personal access tokens
//
// After pulling, always run:
//   npm run tokens:build
// to regenerate the SCSS files from the updated tokens.json.
//
// See README.md → "Why not Style Dictionary?" for architecture rationale.

import fs   from 'node:fs';
import path from 'node:path';

// ── Config ───────────────────────────────────────────────────────────────────

const FILE_KEY    = 'zOZ13bdI68LuugJklgohm2'; // CGDC-DS
const TOKENS_PATH = path.resolve('tokens/tokens.json');

// Collections to pull (by Figma collection name → tokens.json set name)
const COLLECTION_MAP = {
  primitives: 'primitives',
  semantic:   'semantic',
  component:  'component',
};

// Within primitives, skip these top-level path segments — hand-authored
const PRIMITIVES_SKIP = new Set(['scale', 'font-family', 'font-weight', 'font-case', 'text']);

// Within component, skip these top-level path segments
const COMPONENT_SKIP = new Set(['layout']); // layout geometry constants, not tokens

// ── Auth ─────────────────────────────────────────────────────────────────────

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
if (!FIGMA_TOKEN) {
  console.error('\nERROR: FIGMA_TOKEN environment variable is required.');
  console.error('Get a Personal Access Token at https://www.figma.com/settings');
  console.error('Usage: FIGMA_TOKEN=your_pat npm run tokens:pull\n');
  process.exit(1);
}

// ── Figma REST API ────────────────────────────────────────────────────────────

async function fetchVariables() {
  const url = `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`;
  const res  = await fetch(url, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN }
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Figma API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json.meta; // { variables: {}, variableCollections: {} }
}

// ── Type helpers ──────────────────────────────────────────────────────────────

/**
 * Convert Figma RGB float { r, g, b, a } to hex string.
 * Alpha < 1 produces 8-digit hex (RRGGBBAA).
 */
function rgbToHex({ r, g, b, a = 1 }) {
  const to = n => Math.round(n * 255).toString(16).padStart(2, '0').toUpperCase();
  const hex = `#${to(r)}${to(g)}${to(b)}`;
  return a < 1 ? hex + to(a) : hex;
}

/**
 * Map a Figma variable name (slash-path) to a DTCG $type.
 * Uses path-prefix logic rather than keyword matching — more reliable.
 */
function inferDtcgType(resolvedType, variableName) {
  if (resolvedType === 'COLOR')   return 'color';
  if (resolvedType === 'STRING')  return 'fontFamilies';
  if (resolvedType === 'BOOLEAN') return 'other';

  // FLOAT — infer from path prefix
  const parts = variableName.split('/');
  const p0 = parts[0];
  const leaf = parts[parts.length - 1];

  if (p0 === 'space')  return 'spacing';
  if (p0 === 'radius') return 'borderRadius';
  if (p0 === 'scale')  return 'number';

  // type/* and mosaic/type/* — infer from leaf name
  if (leaf === 'size' || leaf === 'lineHeight') return 'fontSizes';
  if (leaf === 'weight')                        return 'fontWeights';
  if (leaf === 'letterSpacing')                 return 'letterSpacing';
  if (leaf === 'family')                        return 'fontFamilies';

  return 'number';
}

/**
 * Determine Figma scope array for $extensions based on variable name.
 * Colors get scoped fill/stroke scopes; everything else ALL_SCOPES.
 */
function inferScopes(resolvedType, variableName) {
  if (resolvedType !== 'COLOR') return ['ALL_SCOPES'];
  const leaf = variableName.split('/').pop();
  if (leaf === 'bg')     return ['ALL_FILLS'];
  if (leaf === 'border') return ['STROKE_COLOR'];
  if (leaf === 'color')  return ['TEXT_FILL'];
  return ['ALL_SCOPES'];
}

// ── Path helpers ──────────────────────────────────────────────────────────────

/**
 * Convert Figma variable name (slash-path) to DTCG reference dot-path.
 * Used in alias $value strings: "{color.primary.60}"
 * Does NOT include the collection/set prefix — matches existing tokens.json.
 */
function toDtcgRef(variableName) {
  return `{${variableName.replace(/\//g, '.')}}`;
}

/**
 * Set a value on a nested object using a path array.
 * Creates intermediate objects as needed.
 * Preserves existing $description and $extensions on the leaf if present.
 */
function setNested(obj, parts, value) {
  let cursor = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!cursor[key] || typeof cursor[key] !== 'object' || '$value' in cursor[key]) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  const leaf    = parts[parts.length - 1];
  const existing = cursor[leaf] || {};
  cursor[leaf]  = {
    // Keep existing $extensions only if no new ones provided
    ...('$extensions' in existing && !('$extensions' in value) ? { $extensions: existing.$extensions } : {}),
    ...value,
    // Always preserve $description if it exists
    ...('$description' in existing ? { $description: existing.$description } : {}),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nPulling variables from Figma file ${FILE_KEY}...`);

  const meta = await fetchVariables();
  const { variables, variableCollections } = meta;

  // Build a lookup: variable ID → { collectionName, variableName, resolvedType }
  // Used to resolve VARIABLE_ALIAS references to their target paths
  const varById = {};
  for (const [id, variable] of Object.entries(variables)) {
    const collection = variableCollections[variable.variableCollectionId];
    if (!collection) continue;
    varById[id] = {
      collectionName: collection.name,
      variableName:   variable.name,
      resolvedType:   variable.resolvedType,
    };
  }

  // Load existing tokens.json — merge into this, preserving hand-authored sections
  const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));

  const stats = { pulled: 0, skipped: 0, warnings: 0 };

  for (const [id, variable] of Object.entries(variables)) {
    const collection = variableCollections[variable.variableCollectionId];
    if (!collection) { stats.skipped++; continue; }

    const collectionName = collection.name;
    const setName = COLLECTION_MAP[collectionName];

    // Skip collections not in our pull list
    if (!setName) { stats.skipped++; continue; }

    const variableName = variable.name;
    const parts        = variableName.split('/');
    const topLevel     = parts[0];

    // Skip hand-authored primitive sections
    if (collectionName === 'primitives' && PRIMITIVES_SKIP.has(topLevel)) {
      stats.skipped++;
      continue;
    }

    // Skip component layout constants
    if (collectionName === 'component' && COMPONENT_SKIP.has(topLevel)) {
      stats.skipped++;
      continue;
    }

    // Get the default mode value
    const modeId   = collection.defaultModeId;
    const rawValue = variable.valuesByMode[modeId];

    if (rawValue === undefined || rawValue === null) {
      stats.skipped++;
      continue;
    }

    // Build DTCG token value
    let dtcgValue;

    if (rawValue && typeof rawValue === 'object' && rawValue.type === 'VARIABLE_ALIAS') {
      // Alias → DTCG reference string
      const target = varById[rawValue.id];
      if (!target) {
        console.warn(`  WARN: unresolved alias ${variableName} → ${rawValue.id}`);
        stats.warnings++;
        stats.skipped++;
        continue;
      }
      dtcgValue = toDtcgRef(target.variableName);

    } else if (variable.resolvedType === 'COLOR') {
      dtcgValue = rgbToHex(rawValue);

    } else if (variable.resolvedType === 'FLOAT') {
      // Preserve integer representation where possible
      dtcgValue = Number.isInteger(rawValue) ? String(rawValue) : String(rawValue);

    } else if (variable.resolvedType === 'STRING') {
      dtcgValue = rawValue;

    } else {
      stats.skipped++;
      continue;
    }

    const dtcgType = inferDtcgType(variable.resolvedType, variableName);
    const scopes   = inferScopes(variable.resolvedType, variableName);

    const token = {
      $extensions: {
        'com.figma.scopes':    scopes,
        'com.figma.codeSyntax': { Web: '' },
      },
      $type:  dtcgType,
      $value: dtcgValue,
    };

    // Ensure the set exists
    if (!tokens[setName] || typeof tokens[setName] !== 'object') {
      tokens[setName] = {};
    }

    setNested(tokens[setName], parts, token);
    stats.pulled++;
  }

  // Write back — preserve $themes and $metadata at root level
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2), 'utf8');

  console.log(`\nComplete.`);
  console.log(`  Pulled:   ${stats.pulled} tokens`);
  console.log(`  Skipped:  ${stats.skipped} (hand-authored sections or out-of-scope)`);
  if (stats.warnings > 0) {
    console.log(`  Warnings: ${stats.warnings} (check output above)`);
  }
  console.log(`\nNext step: npm run tokens:build`);
  console.log(`Then verify _tokens--primitives.scss and _tokens--semantic.scss look correct.\n`);
}

main().catch(err => {
  console.error('\nERROR:', err.message);
  process.exit(1);
});
