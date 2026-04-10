#!/usr/bin/env node
/**
 * Lance toutes les vérifications locales (statique + HTTP).
 * Usage : node scripts/run-all-tests.mjs
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));

function run(name, args) {
  const r = spawnSync(process.execPath, args, {
    cwd: path.join(dir, ".."),
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("═══ 1/2 — Vérifications statiques (verify.mjs) ═══\n");
run("verify", [path.join(dir, "verify.mjs")]);

console.log("\n═══ 2/2 — Intégration HTTP locale (integration-http.mjs) ═══\n");
run("integration-http", [path.join(dir, "integration-http.mjs")]);

console.log("\n═══════════════════════════════════════════════════");
console.log("Tous les tests locaux ont réussi.");
console.log("═══════════════════════════════════════════════════");
