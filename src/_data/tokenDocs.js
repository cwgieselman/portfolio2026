/*
 * tokenDocs.js
 * Eleventy global data transform for the design system token viewer.
 *
 * Reads tokens/tokens.json (DTCG format) and produces a flat array of
 * token objects consumed by src/design-system/index.njk.
 *
 * Output shape per token:
 * {
 *   tier:          'primitive' | 'semantic' | 'component'
 *   group:         string   — display group label (e.g. 'color · primary')
 *   name:          string   — CSS custom property name (e.g. '--color-primary-60')
 *   value:         string   — raw $value from JSON
 *   type:          string   — DTCG $type mapped to viewer type category
 *   desc:          string   — $description or auto-generated
 *   alias:         boolean  — true if value is a token reference
 *   resolvedColor: string?  — resolved hex for alias color tokens
 *   resolvedPx:    number?  — resolved px value for alias dimension/spacing tokens
 *   px:            number?  — concrete px value for non-alias dimension tokens
 *   fontFamily:    string?  — CSS font-family stack for typography tokens
 *   preview:       string?  — 'fox' | 'aabb' for typography preview type
 *   previewSize:   string?  — CSS font-size for typography preview
 *   dimPreview:    string?  — display string for dimension tokens
 * }
 *
 * Consumed by: src/design-system/index.njk
 * Source: tokens/tokens.json
 */

const fs   = require('node:fs');
const path = require('node:path');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert DTCG $type to the viewer's type category.
 */
function mapType(dtcgType) {
  const map = {
    color:        'color',
    number:       'dimension',
    dimension:    'dimension',
    spacing:      'spacing',
    borderRadius: 'dimension',
    fontSizes:    'typography',
    fontFamilies: 'typography',
    fontWeights:  'typography',
    lineHeights:  'typography',
    letterSpacing:'typography',
    textCase:     'typography',
    typography:   'typography',
  };
  return map[dtcgType] || dtcgType || 'other';
}

/**
 * Convert a DTCG token path array to a CSS custom property name.
 * Mirrors the logic in build-tokens-scss.mjs refToCssVar().
 */
function pathToCssVar(setName, rest) {
  if (setName === 'primitives') {
    if (rest[0] === 'scale')       return `--scale-${rest[1]}`;
    if (rest[0] === 'color')       return `--color-${rest[1]}-${rest[2]}`;
    if (rest[0] === 'font-family') return `--font-family-${rest[1]}`;
    if (rest[0] === 'font-weight') return `--font-weight-${rest[1]}`;
    if (rest[0] === 'font-case')   return `--font-case-${rest[1]}`;
    if (rest[0] === 'text' && rest[1] === 'tracking') return `--text-tracking-${rest[2]}`;
  }
  if (setName === 'semantic') {
    if (rest[0] === 'space')  return `--spacing-${rest[1]}`;
    if (rest[0] === 'radius') return `--corner-${rest[1]}`;
    if (rest[0] === 'color')  return `--color-${rest.slice(1).join('-')}`;
    if (rest[0] === 'type')   return `--type-${rest.slice(1).join('-')}`;
  }
  if (setName === 'component') {
    if (rest[0] === 'space' && rest[1] === 'content-rhythm') return `--content-rhythm--${rest[2]}`;
    if (rest[0] === 'mosaic') return `--mosaic-${rest.slice(1).join('-')}`;
  }
  // Fallback
  return `--${rest.join('-')}`.replace(/--+/g, '--');
}

/**
 * Convert a path array + set name to a display group label.
 */
function pathToGroup(setName, rest) {
  if (setName === 'primitives') {
    if (rest[0] === 'color')       return `color · ${rest[1]}`;
    if (rest[0] === 'scale')       return 'scale';
    if (rest[0] === 'font-family') return 'typography · family';
    if (rest[0] === 'font-weight') return 'typography · weight';
    if (rest[0] === 'font-case')   return 'typography · case';
    if (rest[0] === 'text')        return 'typography · tracking';
  }
  if (setName === 'semantic') {
    if (rest[0] === 'space')  return 'spacing';
    if (rest[0] === 'radius') return 'radius';
    if (rest[0] === 'color')  return `color · ${rest.slice(1).join(' · ')}`;
    if (rest[0] === 'type')   return `typography · ${rest[1]}`;
  }
  if (setName === 'component') {
    if (rest[0] === 'space') return 'content rhythm';
    if (rest[0] === 'mosaic' && rest[1] === 'theme') return `mosaic · theme · ${rest[2]}`;
    if (rest[0] === 'mosaic' && rest[1] === 'type')  return 'mosaic · type';
  }
  return rest.slice(0, 2).join(' · ');
}

/**
 * Detect if a value is a token reference like {scale.25} or {color.primary.60}.
 */
function isRef(value) {
  return typeof value === 'string' && /^\{[^}]+\}$/.test(value.trim());
}

/**
 * Primitive hex color lookup table — used to resolve alias colors.
 * Populated from the primitives.color section of tokens.json.
 */
function buildColorLookup(primitives) {
  const lookup = {};
  const colors = primitives.color || {};
  for (const [palette, shades] of Object.entries(colors)) {
    for (const [shade, token] of Object.entries(shades)) {
      if (token && token.$value && !isRef(token.$value)) {
        // key: color.palette.shade → hex
        lookup[`color.${palette}.${shade}`] = token.$value;
      }
    }
  }
  return lookup;
}

/**
 * Primitive scale lookup table — used to resolve alias px values.
 */
function buildScaleLookup(primitives) {
  const lookup = {};
  const base = 16; // scale.base default
  const scale = primitives.scale || {};
  for (const [step, token] of Object.entries(scale)) {
    if (!token || !token.$value) continue;
    const raw = String(token.$value).trim();
    if (raw === '16' || step === 'base') {
      lookup[`scale.${step}`] = 16;
      continue;
    }
    // Parse expressions like "{scale.base} * 1.75"
    const match = raw.match(/\{\s*scale\.base\s*\}\s*\*\s*([\d.]+)/);
    if (match) {
      lookup[`scale.${step}`] = base * parseFloat(match[1]);
    }
  }
  return lookup;
}

/**
 * Resolve a reference string like "{color.primary.60}" to its primitive value.
 */
function resolveRef(refStr, colorLookup, scaleLookup) {
  const key = refStr.replace(/^\{|\}$/g, '').trim();
  if (colorLookup[key]) return { type: 'color', value: colorLookup[key] };
  if (scaleLookup[key] !== undefined) return { type: 'px', value: scaleLookup[key] };
  return null;
}

/**
 * Determine font family CSS stack for a token.
 */
function fontFamilyFor(name, value, primitives) {
  const families = {
    'Raleway':          'Raleway, sans-serif',
    'PT Sans':          '"PT Sans", sans-serif',
    'Playfair Display': '"Playfair Display", serif',
    'Courier Prime':    '"Courier Prime", monospace',
  };
  // Direct family token
  if (primitives['font-family']) {
    for (const [key, token] of Object.entries(primitives['font-family'])) {
      if (token.$value && families[token.$value]) {
        if (name.includes(`font-family-${key}`)) return families[token.$value];
      }
    }
  }
  // Value is a font name directly
  if (families[value]) return families[value];
  return null;
}

/**
 * Determine preview type for typography tokens.
 */
function typographyPreview(cssVar, value) {
  if (cssVar.includes('family')) {
    const families = {
      'Raleway':          { fontFamily: 'Raleway, sans-serif',           preview: 'fox',  previewSize: '11px' },
      'PT Sans':          { fontFamily: '"PT Sans", sans-serif',          preview: 'fox',  previewSize: '11px' },
      'Playfair Display': { fontFamily: '"Playfair Display", serif',      preview: 'aabb', previewSize: '18px' },
      'Courier Prime':    { fontFamily: '"Courier Prime", monospace',     preview: 'aabb', previewSize: '14px' },
    };
    return families[value] || null;
  }
  if (cssVar.includes('weight')) {
    return { fontFamily: 'Raleway, sans-serif', preview: 'fox', previewSize: '11px' };
  }
  return null;
}

// ── Main transform ────────────────────────────────────────────────────────────

module.exports = function tokenDocsLoader() {
  const tokensPath = path.join(__dirname, '../../tokens/tokens.json');

  if (!fs.existsSync(tokensPath)) {
    throw new Error(`tokenDocs.js: tokens.json not found at ${tokensPath}`);
  }

  const raw   = fs.readFileSync(tokensPath, 'utf8');
  const data  = JSON.parse(raw);

  const primitives  = data.primitives  || {};
  const semantic    = data.semantic    || {};
  const component   = data.component   || {};

  const colorLookup = buildColorLookup(primitives);
  const scaleLookup = buildScaleLookup(primitives);

  const tokens = [];

  /**
   * Recursively walk a token set and emit flat token objects.
   */
  function walk(node, setName, pathParts) {
    for (const [key, val] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (!val || typeof val !== 'object') continue;

      const nextPath = [...pathParts, key];

      // Leaf token — has $value
      if ('$value' in val) {
        // Skip composite typography tokens — can't map to a single CSS var
        if (typeof val.$value === 'object') continue;

        const tier    = setName === 'primitives' ? 'primitive'
                      : setName === 'semantic'   ? 'semantic'
                      :                            'component';
        const rest    = nextPath.slice(1); // strip set name prefix
        const cssVar  = pathToCssVar(setName, rest);
        const group   = pathToGroup(setName, rest);
        const rawVal  = String(val.$value).trim();
        const dtcgType = val.$type || '';
        const viewType = mapType(dtcgType);
        const desc    = val.$description || '';
        const alias   = isRef(rawVal);

        const token = {
          tier,
          group,
          name:  cssVar,
          value: rawVal,
          type:  viewType,
          desc,
          alias,
        };

        // Resolve alias colors
        if (alias && viewType === 'color') {
          const resolved = resolveRef(rawVal, colorLookup, scaleLookup);
          if (resolved && resolved.type === 'color') {
            token.resolvedColor = resolved.value;
          }
        }

        // Resolve alias spacing/dimension
        if (alias && (viewType === 'spacing' || viewType === 'dimension')) {
          const resolved = resolveRef(rawVal, colorLookup, scaleLookup);
          if (resolved && resolved.type === 'px') {
            token.resolvedPx = resolved.value;
          }
        }

        // Concrete px for scale tokens
        if (!alias && viewType === 'dimension' && setName === 'primitives' && rest[0] === 'scale') {
          const scaleKey = nextPath.join('.');
          const scaleRef = `scale.${rest[1]}`;
          if (scaleLookup[scaleRef] !== undefined) {
            token.px = scaleLookup[scaleRef];
          }
        }

        // Concrete px for non-scale dimension primitives
        if (!alias && viewType === 'spacing') {
          const numMatch = rawVal.match(/^(\d+(?:\.\d+)?)(?:px)?$/);
          if (numMatch) token.px = parseFloat(numMatch[1]);
        }

        // Typography enrichment
        if (viewType === 'typography') {
          const preview = typographyPreview(cssVar, rawVal);
          if (preview) {
            token.fontFamily  = preview.fontFamily;
            token.preview     = preview.preview;
            token.previewSize = preview.previewSize;
          }
          // Weight tokens — show with brand font
          if (cssVar.includes('font-weight') || cssVar.includes('weight')) {
            token.fontFamily  = token.fontFamily || 'Raleway, sans-serif';
            token.preview     = token.preview    || 'fox';
            token.previewSize = token.previewSize || '11px';
          }
        }

        // Scale preview label (dimPreview)
        if (!alias && viewType === 'dimension' && rest[0] === 'scale') {
          const px = token.px;
          token.dimPreview = px !== undefined ? `${px}px` : rawVal;
        }
        if (!alias && viewType === 'dimension' && rawVal === '0') {
          token.dimPreview = '0';
        }
        if (!alias && viewType === 'dimension' && rawVal === '1000') {
          token.dimPreview = '∞';
        }

        tokens.push(token);
        continue;
      }

      // Branch node — recurse
      walk(val, setName, nextPath);
    }
  }

  walk(primitives, 'primitives', ['primitives']);
  walk(semantic,   'semantic',   ['semantic']);
  walk(component,  'component',  ['component']);

  return tokens;
};
