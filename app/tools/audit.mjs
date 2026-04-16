#!/usr/bin/env node
/**
 * Audit runtime de l'app v2 : visite chaque route, capture
 * console errors, 404, uncaught exceptions, screenshots.
 *
 *   node tools/audit.mjs [baseUrl]
 */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const outDir = resolve('audit-output');
mkdirSync(outDir, { recursive: true });

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/carte', name: 'carte', wait: '.leaflet-container' },
  { path: '/quiz', name: 'quiz' },
  { path: '/terrorisme', name: 'terrorisme' },
  { path: '/guide', name: 'guide' },
  { path: '/sources', name: 'sources' },
  { path: '/savoir', name: 'savoir' },
  { path: '/offline', name: 'offline' },
  { path: '/pedagogie', name: 'pedagogie', skipWait: true }
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

const report = { baseUrl: base, generatedAt: new Date().toISOString(), routes: [] };

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  for (const r of ROUTES) {
    const page = await ctx.newPage();
    const consoleMsgs = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') {
        consoleMsgs.push({ type: m.type(), text: m.text() });
      }
    });
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    page.on('requestfailed', (req) =>
      failedRequests.push({ url: req.url(), error: req.failure()?.errorText ?? '' })
    );
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push({ url: res.url(), status: res.status() });
    });

    try {
      await page.goto(base + r.path, { waitUntil: 'networkidle', timeout: 15_000 });
      if (!r.skipWait) await page.waitForTimeout(r.wait ? 1500 : 400);
      if (r.wait) {
        await page.waitForSelector(r.wait, { timeout: 8_000 }).catch(() => {});
      }
      const shotPath = resolve(outDir, `${vp.name}-${r.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
    } catch (e) {
      pageErrors.push(`navigation: ${String(e)}`);
    }
    const entry = {
      viewport: vp.name,
      route: r.path,
      pageErrors,
      consoleMsgs,
      failedRequests
    };
    report.routes.push(entry);
    await page.close();
  }
  await ctx.close();
}
await browser.close();

writeFileSync(resolve(outDir, 'report.json'), JSON.stringify(report, null, 2));
const counts = report.routes.map(
  (r) =>
    `${r.viewport.padEnd(7)} ${r.route.padEnd(15)} ` +
    `pageErr=${r.pageErrors.length} console=${r.consoleMsgs.length} net=${r.failedRequests.length}`
);
console.log(counts.join('\n'));
console.log(`\nReport written to ${outDir}/report.json`);
