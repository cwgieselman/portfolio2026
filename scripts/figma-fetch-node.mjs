#!/usr/bin/env node
/**
 * Fetch a Figma node (frame) JSON from a pasted Figma URL.
 *
 * Workflow:
 * 1) You paste a Figma FRAME URL (Cmd-L in Figma)
 * 2) Script extracts fileKey + node-id
 * 3) Uses token from:
 *    - FIGMA_TOKEN env (if provided) -> also updates cache
 *    - else cached token in .figma-token.json
 * 4) Fetches node subtree JSON via Figma API
 * 5) Saves to src/_figma-json/<sectionKey>.json
 *
 * If token is expired/invalid:
 * - Figma returns 401/403
 * - script instructs you to generate a new token and rerun with FIGMA_TOKEN="..."
 */

import fs from "node:fs";
import path from "node:path";

const TOKEN_CACHE_PATH = path.resolve(".figma-token.json");

function die(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function usage() {
  die(
    `Usage:\n` +
      `  node scripts/figma-fetch-node.mjs "<FIGMA_FRAME_URL>" <sectionKey>\n\n` +
      `Examples:\n` +
      `  FIGMA_TOKEN="..." node scripts/figma-fetch-node.mjs "https://www.figma.com/file/FILEKEY/Name?node-id=123-456" inficon-ims\n` +
      `  node scripts/figma-fetch-node.mjs "https://www.figma.com/design/FILEKEY/Name?node-id=123-456" inficon-ims\n`,
  );
}

function parseFigmaUrl(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    die(
      "That doesn’t look like a valid URL. Paste the full Figma frame URL from Cmd-L.",
    );
  }

  const parts = u.pathname.split("/").filter(Boolean);

  // Supports:
  // /file/<FILEKEY>/...
  // /design/<FILEKEY>/...
  const idx = parts.findIndex((p) => p === "file" || p === "design");
  if (idx === -1 || !parts[idx + 1]) {
    die(
      'Could not find FILEKEY in the URL path. Expected "/file/<key>/" or "/design/<key>/".',
    );
  }
  const fileKey = parts[idx + 1];

  // node-id is required for this workflow
  const rawNode = u.searchParams.get("node-id");
  if (!rawNode) {
    die(
      'Could not find "node-id" in the URL query. Make sure you copied a specific FRAME link (Cmd-L on the frame).',
    );
  }

  // Normalize for API:
  // Figma URLs often use 123-456; API expects 123:456
  const nodeId = decodeURIComponent(rawNode).replace(/-/g, ":");

  return { fileKey, nodeId };
}

function loadCachedToken() {
  if (!fs.existsSync(TOKEN_CACHE_PATH)) return null;
  try {
    const raw = fs.readFileSync(TOKEN_CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    return typeof data.token === "string" && data.token.trim()
      ? data.token.trim()
      : null;
  } catch {
    return null;
  }
}

function saveTokenToCache(token) {
  const payload = { token: token.trim(), savedAt: new Date().toISOString() };
  fs.writeFileSync(TOKEN_CACHE_PATH, JSON.stringify(payload, null, 2), "utf8");
}

async function fetchNodeJson({ fileKey, nodeId, token }) {
  const endpoint =
    `https://api.figma.com/v1/files/${fileKey}/nodes` +
    `?ids=${encodeURIComponent(nodeId)}` +
    `&geometry=paths`;

  const res = await fetch(endpoint, {
    headers: { "X-Figma-Token": token },
  });

  if (res.status === 401 || res.status === 403) {
    die(
      `Figma API rejected the token (HTTP ${res.status}).\n` +
        `Generate a new token in Figma (you’ve been using 30 days), then rerun:\n\n` +
        `  FIGMA_TOKEN="NEW_TOKEN" node scripts/figma-fetch-node.mjs "<FIGMA_FRAME_URL>" <sectionKey>\n\n` +
        `The script will cache it to .figma-token.json for future runs.`,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    die(`Figma API error ${res.status}: ${text.slice(0, 600)}`);
  }

  return await res.json();
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function main() {
  const [url, sectionKey] = process.argv.slice(2);

  if (!url || !sectionKey) usage();

  const { fileKey, nodeId } = parseFigmaUrl(url);

  // Token precedence:
  // 1) FIGMA_TOKEN env (also refresh cache)
  // 2) cached token
  const envToken = process.env.FIGMA_TOKEN && process.env.FIGMA_TOKEN.trim();
  const cachedToken = loadCachedToken();

  const token = envToken || cachedToken;
  if (!token) {
    die(
      `No token found.\n\n` +
        `Run once with a token (it will be cached):\n` +
        `  FIGMA_TOKEN="YOUR_TOKEN" node scripts/figma-fetch-node.mjs "${url}" ${sectionKey}\n`,
    );
  }

  if (envToken) saveTokenToCache(envToken);

  const json = await fetchNodeJson({ fileKey, nodeId, token });

  const outDir = path.resolve("src/_figma-json");
  ensureDir(outDir);

  const outPath = path.join(outDir, `${sectionKey}.json`);
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2), "utf8");

  console.log(`✅ Saved Figma node JSON`);
  console.log(`   sectionKey: ${sectionKey}`);
  console.log(`   fileKey:    ${fileKey}`);
  console.log(`   nodeId:     ${nodeId}`);
  console.log(`   outPath:    ${outPath}`);
}

main().catch((err) => die(err?.stack || String(err)));
