// scripts/figma-pull.mjs
//
// ── THIS SCRIPT IS NOT FUNCTIONAL ────────────────────────────────────────────
//
// The Figma REST API endpoint for variables (/v1/files/:key/variables/local)
// requires the `file_variables:read` scope, which is only available on
// Figma Enterprise plan. This project is on Figma Professional plan.
//
// The script is preserved here as documentation of the intended approach
// and as a starting point if the plan changes.
//
// ── HOW TOKENS ARE ACTUALLY PULLED ───────────────────────────────────────────
//
// Figma Variables are pulled via a Claude.ai session using the Figma MCP
// (use_figma tool) and the filesystem MCP (write_file tool). This combination
// provides full variable read access via the Figma Plugin API — which does
// not have the Enterprise restriction — and direct filesystem write access.
//
// Workflow:
//   1. Open Claude.ai (claude.ai/chat) in the portfolio2026 project
//   2. Ask: "Pull the current Figma variables from CGDC-DS and update tokens.json"
//   3. Claude reads all variables via use_figma (figma.variables Plugin API)
//   4. Claude writes the updated tokens.json via filesystem MCP
//   5. Run: npm run tokens:build
//
// What gets pulled:
//   primitives.color.*           — all three color palettes
//   semantic.space.*             — spacing aliases
//   semantic.radius.*            — radius aliases
//   semantic.color.*             — semantic color assignments
//   semantic.type.*              — typography aliases
//   component.mosaic.*           — mosaic theme and type tokens
//   component.space.*            — content rhythm tokens
//
// What is never pulled (hand-authored, code-side truth):
//   primitives.scale.*           — math expressions preserved for CSS cascade
//   primitives.font-family.*     — stable string values
//   primitives.font-weight.*     — stable numeric values
//   primitives.font-case.*       — hand-authored
//   primitives.text.*            — tracking tokens, hand-authored
//   component.layout.*           — layout geometry constants, not design tokens
//
// WHY scale is hand-authored:
//   Figma stores resolved concrete values (scale/175 = 28).
//   The SCSS pipeline requires calc(var(--scale-base) * 1.75) so the 2-column
//   grid layout can override --scale-base: 14px and have all derived tokens
//   recalculate automatically at runtime. A concrete value would break this.
//
// See README.md → "Why not Style Dictionary?" for full architecture rationale.
// See README.md → "Token Pipeline" for the pull workflow documentation.
//
// ── IF YOU HAVE ENTERPRISE ────────────────────────────────────────────────────
//
// If the plan upgrades to Enterprise, this script can be completed by:
//   1. Generating a PAT with the file_variables:read scope
//   2. Running: FIGMA_TOKEN=your_pat node scripts/figma-pull.mjs
//
// The REST API endpoint is:
//   GET https://api.figma.com/v1/files/zOZ13bdI68LuugJklgohm2/variables/local
//
// The response shape (meta.variables, meta.variableCollections) and the
// alias resolution logic (VARIABLE_ALIAS → DTCG {dot.path} references) are
// documented in the git history of this file.

console.error('');
console.error('tokens:pull is not available via the terminal on Figma Professional plan.');
console.error('');
console.error('The Figma Variables REST API requires an Enterprise plan.');
console.error('');
console.error('To pull tokens, open a Claude.ai session in the portfolio2026 project and ask:');
console.error('  "Pull the current Figma variables from CGDC-DS and update tokens.json"');
console.error('');
console.error('Then run: npm run tokens:build');
console.error('');
process.exit(1);
