// scripts/gen-report.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "_docs", "generated");
const OUT_FILE = path.join(OUT_DIR, "REPORT.md");

const files = {
  executor: "src/_includes/layouts/content-cell.njk",
  richtext: "src/_includes/components/richtext.njk",
  figure: "src/_includes/components/figure.njk",
  eleventy: ".eleventy.js",
  contract: "CONTRACT.md",
  scssRoot: "src/assets/scss",
};

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}
function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}
function walk(dirAbs, exts = []) {
  const out = [];
  for (const e of fs.readdirSync(dirAbs, { withFileTypes: true })) {
    const p = path.join(dirAbs, e.name);
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (!exts.length || exts.includes(path.extname(p))) out.push(p);
  }
  return out;
}

const results = [];
function add(status, label, detail = "") {
  results.push({ status, label, detail });
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Gate text
  const gateText = [
    "This report is generated from repository state.",
    "If any FAIL appears, code must be reconciled with CONTRACT.md before proceeding.",
    "",
  ];

  // ---------------- EXECUTOR ----------------
  if (!exists(files.executor)) {
    add("FAIL", "Executor exists", `Missing file: ${files.executor}`);
  } else {
    const ex = read(files.executor);
    add("PASS", "Executor exists");

    add(
      /\bor\s*\{\s*\}/.test(ex) ? "FAIL" : "PASS",
      "Executor: no `or {}` param defaults",
      /\bor\s*\{\s*\}/.test(ex) ? "Found `or {}` in executor" : "",
    );

    add(
      /EXECUTOR_ERROR/.test(ex) ? "PASS" : "FAIL",
      "Executor: missing params render EXECUTOR_ERROR comment",
      /EXECUTOR_ERROR/.test(ex) ? "" : "EXECUTOR_ERROR marker not found",
    );

    add(
      /UNKNOWN_INCLUDE/.test(ex) ? "PASS" : "FAIL",
      "Executor: unknown include renders visible comment",
      /UNKNOWN_INCLUDE/.test(ex) ? "" : "UNKNOWN_INCLUDE marker not found",
    );

    // include item.include is allowed ONLY if it is whitelisted by comparisons
    const hasIncludeItem = /include\s+item\.include/.test(ex);
    const hasWhitelist = /item\.include\s*==\s*["']components\//.test(ex);
    const hasUnknown = /UNKNOWN_INCLUDE/.test(ex);

    if (hasIncludeItem && hasWhitelist && hasUnknown) {
      add(
        "PASS",
        "Executor: include dispatch is whitelisted (safe include item.include)",
      );
    } else if (hasIncludeItem) {
      add(
        "FAIL",
        "Executor: include item.include is unguarded (no whitelist detected)",
      );
    } else {
      add("PASS", "Executor: no include item.include usage");
    }
  }

  // ---------------- RICHTEXT ----------------
  if (exists(files.richtext)) {
    const rt = read(files.richtext);
    const hasSetOrDefault = /\{%\s*set\s+\w+\s*=\s*[^%]*\bor\b[^%]*["']/.test(
      rt,
    );
    const hasDefaultFilter = /\|\s*default\s*\(/.test(rt);
    add(
      hasSetOrDefault || hasDefaultFilter ? "FAIL" : "PASS",
      'Richtext: no implicit defaults (`or "..."` or `| default()`)',
      hasSetOrDefault || hasDefaultFilter ? "Defaulting pattern detected" : "",
    );
  } else {
    add("WARN", "Richtext component not present (skipped)");
  }

  // ---------------- FIGURE POLICY ----------------
  if (exists(files.figure)) {
    const fg = read(files.figure);

    add(
      /<img\b/i.test(fg) ? "PASS" : "FAIL",
      "Figure: uses passthrough <img>",
      /<img\b/i.test(fg) ? "" : "No <img> found",
    );

    // Component should not contain shortcode registration (it shouldn't anyway)
    add(
      /addNunjucksAsyncShortcode\(\s*["']image["']/.test(fg) ? "FAIL" : "PASS",
      "Figure: no async image shortcode logic inside component",
    );

    add(
      /\/assets\/images\//.test(fg) && /FIGURE_ERROR/.test(fg)
        ? "PASS"
        : "WARN",
      "Figure: warns if src not under /assets/images/",
      "",
    );
  } else {
    add("FAIL", "Figure component exists", `Missing file: ${files.figure}`);
  }

  // ---------------- ELEVENTY CONFIG ----------------
  if (exists(files.eleventy)) {
    const el = read(files.eleventy);
    add(
      /addNunjucksAsyncShortcode\(\s*["']image["']/.test(el) ? "WARN" : "PASS",
      "Eleventy: async image shortcode inactive (stabilize baseline)",
      "",
    );
  } else {
    add("WARN", "Eleventy config missing (skipped)");
  }

  // ---------------- SCSS ----------------
  if (exists(files.scssRoot)) {
    const scssFiles = walk(path.join(ROOT, files.scssRoot), [".scss"]);

    let fallbackCount = 0;
    for (const file of scssFiles) {
      const src = fs.readFileSync(file, "utf8");
      const lines = src.split(/\r?\n/);
      for (const line of lines) {
        const m = line.match(/var\(--[^,)]+,\s*[^)]+\)/g);
        if (m) fallbackCount += m.length;
      }
    }

    add(
      fallbackCount === 0 ? "PASS" : "FAIL",
      "SCSS: no var(--token, fallback) usage",
      fallbackCount ? `Found ${fallbackCount} fallback usages` : "",
    );

    let typoCount = 0;
    for (const file of scssFiles) {
      const src = fs.readFileSync(file, "utf8");
      typoCount += (src.match(/--scale--/g) || []).length;
    }

    add(
      typoCount === 0 ? "PASS" : "FAIL",
      "SCSS: no token typos like --scale--*",
      typoCount ? `Found ${typoCount} token typos` : "",
    );
  } else {
    add("FAIL", "SCSS root exists", `Missing folder: ${files.scssRoot}`);
  }

  // ---------------- CONTRACT ----------------
  if (exists(files.contract)) {
    const c = read(files.contract);
    const mentionsSplit =
      /figure-optimized/i.test(c) &&
      /\bsrcFile\b/i.test(c) &&
      /\bsrc\b/i.test(c);

    add(
      mentionsSplit ? "PASS" : "WARN",
      "CONTRACT: image split policy documented (src vs srcFile)",
      mentionsSplit
        ? ""
        : "Could not confirm figure-optimized/srcFile policy text",
    );
  } else {
    add("FAIL", "CONTRACT.md exists", `Missing file: ${files.contract}`);
  }

  // ---------------- WRITE REPORT ----------------
  const now = new Date().toISOString();
  const order = { FAIL: 0, WARN: 1, PASS: 2 };
  results.sort((a, b) => order[a.status] - order[b.status]);

  const summary = {
    FAIL: results.filter((r) => r.status === "FAIL").length,
    WARN: results.filter((r) => r.status === "WARN").length,
    PASS: results.filter((r) => r.status === "PASS").length,
  };

  const lines = [];
  lines.push(...gateText);
  lines.push(`# Stabilization Report (Generated)`);
  lines.push(`Generated on: ${now}`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push(`- FAIL: ${summary.FAIL}`);
  lines.push(`- WARN: ${summary.WARN}`);
  lines.push(`- PASS: ${summary.PASS}`);
  lines.push("");
  lines.push(`## Checks`);
  for (const r of results) {
    lines.push(`- [${r.status}] ${r.label}${r.detail ? ` — ${r.detail}` : ""}`);
  }
  lines.push("");

  fs.writeFileSync(OUT_FILE, lines.join("\n"), "utf8");
  console.log(`Wrote: ${path.relative(ROOT, OUT_FILE)}`);
  if (summary.FAIL > 0) process.exitCode = 1;
}

main();
