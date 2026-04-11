#!/usr/bin/env node
/**
 * Vérifications statiques du dépôt (sans navigateur).
 * Usage : node scripts/verify.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function fail(msg) {
  console.error("✗ " + msg);
  process.exitCode = 1;
}
function ok(msg) {
  console.log("✓ " + msg);
}

/* ── 1. Syntaxe JS ── */
const jsFiles = [
  "sw.js",
  "assets/js/data.js",
  "assets/js/quiz-bank.js",
  "assets/js/pedagogy-bundle.js",
  "assets/js/map-core.js",
  "assets/js/map-ui.js",
  "assets/js/slideshow.js",
  "assets/js/app-pro.js",
  "assets/js/pedagogie.js",
];
for (const rel of jsFiles) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) {
    fail(`fichier manquant : ${rel}`);
    continue;
  }
  try {
    execSync(`node --check "${p}"`, { stdio: "pipe" });
    ok(`syntaxe OK : ${rel}`);
  } catch {
    fail(`syntaxe invalide : ${rel}`);
  }
}

/* ── 2. JSON éditorial ── */
try {
  const ed = JSON.parse(readFileSync(join(ROOT, "assets/data/editorial.json"), "utf8"));
  for (const k of ["version", "lastUpdated", "legal", "method"]) {
    if (typeof ed[k] !== "string" || !ed[k].length) fail(`editorial.json : champ manquant ou vide "${k}"`);
  }
  ok("assets/data/editorial.json : schéma minimal");
} catch (e) {
  fail(`editorial.json : ${e.message}`);
}

/* ── 2b. Chronologie terrorisme France (JSON) ── */
try {
  const ft = JSON.parse(readFileSync(join(ROOT, "assets/data/france-terror-chronology.json"), "utf8"));
  if (!Array.isArray(ft.events) || ft.events.length < 8) throw new Error("events[] attendu (≥ 8 entrées)");
  for (let i = 0; i < ft.events.length; i++) {
    const ev = ft.events[i];
    if (!ev || typeof ev.date !== "string" || !ev.place || !ev.actors_official)
      throw new Error("événement incomplet à l’index " + i);
  }
  ok("assets/data/france-terror-chronology.json : schéma minimal");
} catch (e) {
  fail(`france-terror-chronology.json : ${e.message}`);
}

/* ── 3. Chaîne data.js → pedagogy-bundle → IslamMapData (vm) ── */
try {
  const ctx = vm.createContext({ window: {}, console });
  vm.runInContext(readFileSync(join(ROOT, "assets/js/data.js"), "utf8"), ctx);
  vm.runInContext(readFileSync(join(ROOT, "assets/js/quiz-bank.js"), "utf8"), ctx);
  vm.runInContext(readFileSync(join(ROOT, "assets/js/pedagogy-bundle.js"), "utf8"), ctx);
  const D = ctx.window.IslamMapData;
  if (!D) throw new Error("IslamMapData absent");
  const need = [
    "DATA",
    "CENTROIDS",
    "BY_ISO",
    "QUIZ_DATA",
    "SOURCES_2026",
    "SECURITY_NOTES",
    "TERROR_HOTSPOTS",
    "GLOSSARY",
    "TIMELINE_EVENTS",
  ];
  for (const k of need) {
    if (D[k] == null) throw new Error("clé manquante : " + k);
  }
  if (typeof D.DATA !== "object") throw new Error("DATA doit être un objet");
  if (Object.keys(D.DATA).length < 50) throw new Error("DATA semble trop petit");
  if (!Array.isArray(D.QUIZ_DATA) || D.QUIZ_DATA.length < 50)
    throw new Error("QUIZ_DATA doit contenir au moins 50 entrées, obtenu : " + (D.QUIZ_DATA && D.QUIZ_DATA.length));
  for (let i = 0; i < D.QUIZ_DATA.length; i++) {
    const q = D.QUIZ_DATA[i];
    if (!q || !Array.isArray(q.opts) || !q.opts.length) throw new Error("QUIZ_DATA[" + i + "] : opts invalide");
    if (q.type === "qcm") {
      if (!Array.isArray(q.ans) || !q.ans.length) throw new Error("QUIZ_DATA[" + i + "] : QCM sans tableau ans");
      for (const x of q.ans) {
        if (!Number.isInteger(x) || x < 0 || x >= q.opts.length)
          throw new Error("QUIZ_DATA[" + i + "] : indice QCM hors bornes");
      }
    } else {
      if (!Number.isInteger(q.ans) || q.ans < 0 || q.ans >= q.opts.length)
        throw new Error("QUIZ_DATA[" + i + "] : réponse QCU invalide");
    }
  }
  ok("vm : data → quiz-bank → pedagogy-bundle → IslamMapData (quiz ≥ 50, schéma QCU/QCM)");
} catch (e) {
  fail("vm IslamMapData : " + e.message);
}

/* ── 4. Fichiers référencés par index.html (chemins locaux) ── */
const indexHtml = readFileSync(join(ROOT, "index.html"), "utf8");
const localRefs = new Set();
const reHref = /(?:href|src)="(assets\/[^"]+|docs\/[^"]+|pedagogie\.html|index\.html)"/g;
let m;
while ((m = reHref.exec(indexHtml)) !== null) {
  localRefs.add(m[1]);
}
for (const ref of localRefs) {
  if (ref.startsWith("http")) continue;
  const p = join(ROOT, ref.split("?")[0].split("#")[0]);
  if (!existsSync(p)) fail(`référence index.html introuvable : ${ref}`);
}
if (!process.exitCode) ok(`index.html : ${localRefs.size} chemins locaux résolus`);

/* ── 5. Ordre des scripts (critique) ── */
const scriptOrder = [];
const reScript = /<script[^>]+src="([^"]+)"/g;
while ((m = reScript.exec(indexHtml)) !== null) {
  if (!m[1].includes("cdn.jsdelivr")) scriptOrder.push(m[1]);
}
const expected = [
  "assets/js/data.js",
  "assets/js/quiz-bank.js",
  "assets/js/pedagogy-bundle.js",
  "assets/js/map-core.js",
  "assets/js/map-ui.js",
  "assets/js/app-pro.js",
];
if (JSON.stringify(scriptOrder) !== JSON.stringify(expected)) {
  fail(`ordre des scripts : attendu ${JSON.stringify(expected)}, obtenu ${JSON.stringify(scriptOrder)}`);
} else {
  ok("index.html : ordre des scripts data → quiz-bank → pedagogy → core → ui → app-pro");
}

/* ── 6. Sections SPA vs app-pro.js ── */
const secIds = ["section-carte", "savoir", "terrorisme", "quiz-cert", "sources"];
for (const id of secIds) {
  if (!indexHtml.includes(`id="${id}"`)) fail(`section #${id} absente du HTML`);
}
if (!process.exitCode) ok("sections SPA : 5 panneaux hub présents (navigation)");

/* ── 7. Service worker : fichiers listés ── */
const sw = readFileSync(join(ROOT, "sw.js"), "utf8");
const assetMatches = [...sw.matchAll(/BASE \+ "([^"]+)"/g)].map((x) => x[1]);
for (const sub of assetMatches) {
  const path = join(ROOT, sub);
  if (!existsSync(path)) fail(`sw.js liste un fichier absent : ${sub}`);
}
if (!process.exitCode) ok(`sw.js : ${assetMatches.length} entrées BASE+fichier présentes sur disque`);

/* ── 8. Pédagogie : images diaporama ── */
const pedHtml = readFileSync(join(ROOT, "pedagogie.html"), "utf8");
const imgs = [...pedHtml.matchAll(/src="(assets\/img\/[^"]+)"/g)].map((x) => x[1]);
for (const img of imgs) {
  if (!existsSync(join(ROOT, img))) fail(`pedagogie.html image manquante : ${img}`);
}
if (!process.exitCode && imgs.length) ok(`pedagogie.html : ${imgs.length} images locales OK`);

/* ── 9. Cohérence BY_ISO (échantillon) ── */
try {
  const ctx = vm.createContext({ window: {}, console });
  vm.runInContext(readFileSync(join(ROOT, "assets/js/data.js"), "utf8"), ctx);
  vm.runInContext(readFileSync(join(ROOT, "assets/js/quiz-bank.js"), "utf8"), ctx);
  vm.runInContext(readFileSync(join(ROOT, "assets/js/pedagogy-bundle.js"), "utf8"), ctx);
  const D = ctx.window.IslamMapData;
  const fr = D.BY_ISO["250"];
  if (fr !== "France") throw new Error('BY_ISO["250"] attendu France, obtenu ' + fr);
  ok('BY_ISO : échantillon ISO num FR → "France"');
} catch (e) {
  fail("BY_ISO : " + e.message);
}

/* ── 10. SECURITY_NOTES : clés = noms présents dans DATA ── */
try {
  const ctx = vm.createContext({ window: {}, console });
  vm.runInContext(readFileSync(join(ROOT, "assets/js/data.js"), "utf8"), ctx);
  vm.runInContext(readFileSync(join(ROOT, "assets/js/quiz-bank.js"), "utf8"), ctx);
  vm.runInContext(readFileSync(join(ROOT, "assets/js/pedagogy-bundle.js"), "utf8"), ctx);
  const D = ctx.window.IslamMapData;
  const snKeys = Object.keys(D.SECURITY_NOTES || {});
  const bad = snKeys.filter((k) => !Object.prototype.hasOwnProperty.call(D.DATA, k));
  if (bad.length) throw new Error("SECURITY_NOTES sans entrée DATA : " + bad.join(", "));
  ok(`SECURITY_NOTES : ${snKeys.length} clés alignées sur DATA`);
} catch (e) {
  fail("SECURITY_NOTES vs DATA : " + e.message);
}

console.log("");
if (process.exitCode) {
  console.error("Vérification terminée avec erreurs.");
  process.exit(1);
}
console.log("Vérification terminée : tout est cohérent côté fichiers et chaîne de données.");
