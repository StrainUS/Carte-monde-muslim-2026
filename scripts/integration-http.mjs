#!/usr/bin/env node
/**
 * Sert le dépôt en local (127.0.0.1, port aléatoire) et vérifie les réponses HTTP.
 * Usage : node scripts/integration-http.mjs
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function ctype(fp) {
  if (fp.endsWith(".html")) return "text/html; charset=utf-8";
  if (fp.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (fp.endsWith(".json")) return "application/json; charset=utf-8";
  if (fp.endsWith(".css")) return "text/css; charset=utf-8";
  if (fp.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

function serve(req, res) {
  try {
    let u = new URL(req.url, "http://127.0.0.1").pathname;
    if (u === "/") u = "/index.html";
    const safe = path.normalize(u).replace(/^(\.\.(\/|\\|$))+/, "");
    const fp = path.join(ROOT, safe);
    if (!fp.startsWith(ROOT)) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(fp, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }
      res.writeHead(200, { "Content-Type": ctype(fp) });
      res.end(data);
    });
  } catch {
    res.writeHead(500);
    res.end();
  }
}

function fail(msg) {
  console.error("✗ " + msg);
  process.exitCode = 1;
}
function ok(msg) {
  console.log("✓ " + msg);
}

const server = http.createServer(serve);

await new Promise((resolve, reject) => {
  server.listen(0, "127.0.0.1", resolve);
  server.on("error", reject);
});

const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

try {
  const rIndex = await fetch(base + "/index.html");
  if (!rIndex.ok) throw new Error("index.html " + rIndex.status);
  const html = await rIndex.text();
  if (!html.includes("assets/js/pedagogy-bundle.js")) throw new Error("HTML sans pedagogy-bundle.js");
  if (!html.includes('id="modal-overlay"')) throw new Error("HTML sans modale");
  if (!html.includes('id="modal-overlay"')) throw new Error("HTML sans modale pays");
  ok("GET /index.html : structure SPA + scripts attendus");

  const rJson = await fetch(base + "/assets/data/editorial.json");
  if (!rJson.ok) throw new Error("editorial.json " + rJson.status);
  const ed = JSON.parse(await rJson.text());
  if (!ed.version) throw new Error("editorial sans version");
  ok("GET /assets/data/editorial.json : JSON OK");

  const paths = [
    "/assets/data/france-terror-chronology.json",
    "/assets/js/data.js",
    "/assets/js/quiz-bank.js",
    "/assets/js/pedagogy-bundle.js",
    "/assets/js/map-core.js",
    "/assets/js/map-ui.js",
    "/assets/js/slideshow.js",
    "/assets/js/app-pro.js",
    "/sw.js",
    "/assets/css/common.css",
    "/pedagogie.html",
    "/docs/SOURCES.md",
  ];
  for (const p of paths) {
    const r = await fetch(base + p);
    if (!r.ok) throw new Error(p + " → " + r.status);
  }
  ok(`GET : ${paths.length} ressources statiques (200)`);

  const ped = await fetch(base + "/pedagogie.html");
  const pedHtml = await ped.text();
  if (!pedHtml.includes("assets/js/pedagogie.js")) throw new Error("pedagogie.html sans script");
  ok("GET /pedagogie.html : présence script pédagogie");

  const slide = await fetch(base + "/assets/img/pedagogie/slide-01-diversite.svg");
  if (!slide.ok) throw new Error("slide SVG " + slide.status);
  ok("GET diaporama : slide-01 SVG (200)");
} catch (e) {
  fail(String(e.message || e));
} finally {
  server.close();
}

if (process.exitCode) process.exit(1);
console.log("");
console.log("Intégration HTTP locale : OK.");
