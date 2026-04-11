#!/usr/bin/env node
/**
 * Serveur statique local + ouverture du navigateur (macOS, Windows, Linux).
 * PORT=3000 npm start — port fixe (échoue si occupé).
 * Sans PORT : essaie 8080 puis 8081… jusqu’à trouver un port libre.
 * NO_OPEN=1 npm start — n’ouvre pas le navigateur (CI / SSH).
 */
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { exec } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const NO_OPEN = process.env.NO_OPEN === "1" || process.env.NO_OPEN === "true";
const ENV_PORT = Number(process.env.PORT);
const USE_FIXED_PORT = Number.isFinite(ENV_PORT) && ENV_PORT > 0 && ENV_PORT < 65536;

function ctype(fp) {
  if (fp.endsWith(".html")) return "text/html; charset=utf-8";
  if (fp.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (fp.endsWith(".json")) return "application/json; charset=utf-8";
  if (fp.endsWith(".css")) return "text/css; charset=utf-8";
  if (fp.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

const server = http.createServer((req, res) => {
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
});

function openBrowser(url) {
  if (NO_OPEN) return;
  const { platform } = process;
  if (platform === "darwin") {
    exec(`open "${url}"`, () => {});
  } else if (platform === "win32") {
    exec(`start "" "${url}"`, { shell: "cmd.exe" }, () => {});
  } else {
    exec(`xdg-open "${url}"`, () => {});
  }
}

function listenFrom(port) {
  const maxPort = USE_FIXED_PORT ? port : Math.min(port + 80, 8999);
  let announced = false;

  function attempt(p) {
    server.removeAllListeners("error");
    server.once("error", (err) => {
      if (err && err.code === "EADDRINUSE") {
        if (USE_FIXED_PORT) {
          console.error("");
          console.error("  → Port", p, "déjà utilisé. Choisissez un autre :");
          console.error("     PORT=3000 npm start");
          console.error("");
          process.exit(1);
          return;
        }
        if (p < maxPort) {
          try {
            server.close(() => attempt(p + 1));
          } catch (_) {
            attempt(p + 1);
          }
          return;
        }
      }
      console.error(err);
      process.exit(1);
    });

    server.listen(p, "127.0.0.1", () => {
      if (announced) return;
      announced = true;

      const addr = server.address();
      const actual = addr && typeof addr === "object" ? addr.port : p;
      const URL = `http://127.0.0.1:${actual}/`;

      console.log("");
      console.log("  ═══════════════════════════════════════════════════");
      console.log("   SITE PRÊT — copiez cette adresse dans le navigateur :");
      console.log("");
      console.log("   ", URL);
      console.log("");
      console.log("   Guide & diaporama :", URL + "pedagogie.html");
      console.log("  ═══════════════════════════════════════════════════");
      console.log("");
      if (!USE_FIXED_PORT && actual !== 8080) {
        console.log("  (Le port 8080 était occupé ; utilisation du", actual + ".)");
        console.log("");
      }
      console.log("  Si le navigateur ne s’ouvre pas : collez l’URL ci-dessus.");
      console.log("  Arrêt du serveur : Ctrl+C dans ce terminal.");
      console.log("");

      setTimeout(() => openBrowser(URL), 400);
    });
  }

  attempt(port);
}

const startPort = USE_FIXED_PORT ? ENV_PORT : 8080;
listenFrom(startPort);
