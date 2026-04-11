// @ts-check
const { test, expect } = require("@playwright/test");

const SECTIONS = ["section-carte", "savoir", "terrorisme", "quiz-cert", "sources", "guide-hub"];

test.describe("Page principale (SPA)", () => {
  test("charge index : hub à onglets et panneau Carte actif", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "networkidle" });
    await expect(page.locator("#main-content.hub-main")).toBeVisible();
    await expect(page.locator("#section-carte.hub-panel.is-active")).toBeVisible();
  });

  test("modale pays présente dans le DOM", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#modal-overlay")).toBeAttached();
  });

  test("hash sous-section Terrorisme ouvre l’onglet Terrorisme", async ({ page }) => {
    await page.goto("/index.html#terror-prevention", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#terrorisme.hub-panel.is-active")).toBeVisible();
    await expect(page.locator("#terror-prevention")).toBeVisible();
    await expect(page.locator("#terror-h-prev")).toBeVisible();
  });

  test("onglets du menu : hash et panneau actif", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    for (const id of SECTIONS) {
      const tab = page.locator(`#site-nav button[data-hub="${id}"]`).first();
      await expect(tab).toBeVisible();
      await tab.click();
      await page.waitForTimeout(200);
      const hash = await page.evaluate(() => location.hash);
      expect(hash, `après clic #${id}`).toBe(`#${id}`);
      await expect(page.locator(`#${id}.hub-panel.is-active`)).toBeVisible();
    }
  });

  test("carte Leaflet et contrôles présents", async ({ page }) => {
    await page.goto("/index.html#section-carte", { waitUntil: "networkidle" });
    await expect(page.locator("#map")).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("#nav-zoom-in")).toBeVisible();
    await expect(page.locator("#btn-fullscreen")).toBeVisible();
  });

  test("zoom carte : Leaflet répond (pas au zoom max)", async ({ page }) => {
    await page.goto("/index.html#section-carte", { waitUntil: "networkidle" });
    await page.locator("#map").waitFor({ state: "visible" });
    await expect(page.locator("#nav-zoom-in")).toBeVisible();
    const z0 = await page.evaluate(() => {
      const m = window.IslamMapCore && window.IslamMapCore.MAP;
      if (!m) return null;
      let z = m.getZoom();
      if (z >= m.getMaxZoom()) m.setZoom(Math.max(m.getMinZoom(), z - 1));
      z = m.getZoom();
      return z;
    });
    expect(typeof z0).toBe("number");
    await page.evaluate(() => window.IslamMapCore.MAP.zoomIn());
    await page.waitForTimeout(200);
    const z1 = await page.evaluate(() => window.IslamMapCore.MAP.getZoom());
    expect(z1).toBeGreaterThan(z0);
  });

  test("thème : data-theme aligné sur le système", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", /^(light|dark)$/);
  });

  test("guide intégré : ancre méthode ouvre l’onglet Guide", async ({ page }) => {
    await page.goto("/index.html#guide-complet", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#guide-hub.hub-panel.is-active")).toBeVisible();
    await expect(page.locator("#guide-complet")).toBeVisible();
  });
});
