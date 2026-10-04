/**
 * Post-build step for LOCAL production runs (npm run build && npm start).
 *
 * Next.js `output: "standalone"` produces a self-contained server in
 * .next/standalone, but static assets and public/ are intentionally not
 * copied by Next itself. This script finishes the standalone bundle so
 * `npm start` serves everything correctly on a VPS / local machine.
 *
 * On Vercel the platform handles asset serving, so this is skipped.
 */
import { cpSync, existsSync } from "node:fs";

if (process.env.VERCEL === "1") {
  console.log("[postbuild] Vercel detected — skipping standalone asset copy.");
  process.exit(0);
}

if (!existsSync(".next/standalone")) {
  console.log("[postbuild] no .next/standalone output — nothing to do.");
  process.exit(0);
}

cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
cpSync("public", ".next/standalone/public", { recursive: true });
console.log("[postbuild] standalone assets copied (static + public).");
