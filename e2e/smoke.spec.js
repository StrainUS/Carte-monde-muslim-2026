// @ts-check
const { test, expect } = require("@playwright/test");

const SECTIONS = [
  "accueil",
  "section-carte",
  "savoir",
  "terrorisme",
  "quiz-cert",
  "sources",
];

test.describe("Page principale (SPA)", () => {
  test("charge index et expose le contenu scrollable", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "networkidle" });
    await expect(page.locator("#main-content")).toBeVisible();
    const scrollable = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollHeight > de.clientHeight + 80;
    });
    expect(scrollable, "la page doit être plus haute que la fenêtre (scroll possible)").toBe(
      true
    );
  });

  test("défile jusqu’au footer", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    const siteFooter = page.locator("footer.site-footer");
    await expect(siteFooter).toBeInViewport();
    await expect(siteFooter).toBeVisible();
  });

  test("liens du menu : ancres et hash", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    for (const id of SECTIONS) {
      const link = page.locator(`.site-nav a[href="#${id}"]`).first();
      await expect(link).toBeVisible();
      await link.click();
      await page.waitForTimeout(500);
      const hash = await page.evaluate(() => location.hash);
      expect(hash, `après clic #${id}`).toBe(`#${id}`);
      const sec = page.locator(`#${id}`);
      await expect(sec).toBeVisible();
      await expect(sec).toBeInViewport();
    }
  });

  test("carte Leaflet et contrôles présents", async ({ page }) => {
    await page.goto("/index.html#section-carte", { waitUntil: "networkidle" });
    await expect(page.locator("#map")).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("#nav-zoom-in")).toBeVisible();
    await expect(page.locator("#btn-quiz")).toBeVisible();
  });

  test("zoom carte : boutons + / −", async ({ page }) => {
    await page.goto("/index.html#section-carte", { waitUntil: "networkidle" });
    await page.locator("#map").waitFor({ state: "visible" });
    const z0 = await page.evaluate(() => window.IslamMapCore && window.IslamMapCore.MAP.getZoom());
    expect(typeof z0).toBe("number");
    await page.locator("#nav-zoom-in").click();
    await page.waitForTimeout(400);
    const z1 = await page.evaluate(() => window.IslamMapCore.MAP.getZoom());
    expect(z1).toBeGreaterThan(z0);
  });

  test("basculer thème", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", /^(light|dark)$/);
    const before = await html.getAttribute("data-theme");
    await page.locator("#btn-theme-toggle").click();
    const after = await html.getAttribute("data-theme");
    expect(after).not.toBe(before);
  });

  test("pédagogie : scroll jusqu’aux sources", async ({ page }) => {
    await page.goto("/pedagogie.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".ped-wrap")).toBeVisible();
    await page.locator("#sources").scrollIntoViewIfNeeded();
    await expect(page.locator("#sources")).toBeInViewport();
  });
});
