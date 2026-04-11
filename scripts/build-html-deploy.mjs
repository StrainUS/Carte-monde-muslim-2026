#!/usr/bin/env node
/**
 * Construit dist/ — copie minimale pour hébergement HTTP statique (Pages, S3, etc.).
 * Lance verify.mjs avant copie.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

async function rmrf(p) {
  await fs.rm(p, { recursive: true, force: true });
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

const verify = spawnSync(process.execPath, [path.join(root, "scripts", "verify.mjs")], {
  stdio: "inherit",
  cwd: root,
});
if (verify.status !== 0) process.exit(verify.status ?? 1);

await rmrf(dist);
await fs.mkdir(dist, { recursive: true });

for (const f of ["index.html", "pedagogie.html", "sw.js"]) {
  await fs.copyFile(path.join(root, f), path.join(dist, f));
}
await copyDir(path.join(root, "assets"), path.join(dist, "assets"));
await copyDir(path.join(root, "docs"), path.join(dist, "docs"));

console.log("dist/ prêt pour déploiement HTML statique :", dist);
