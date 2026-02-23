import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const target = path.join(ROOT, "_docs", "generated");

fs.rmSync(target, { recursive: true, force: true });
console.log(`Removed: ${path.relative(ROOT, target)}`);
