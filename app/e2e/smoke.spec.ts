import { test, expect, type Page } from '@playwright/test';

/**
 * SvelteKit + adapter-static hydrates via dynamic import AFTER the `load` event,
 * so tests must wait for network-idle before interacting with client-only state.
 */
async function gotoHydrated(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  // Svelte 5 attaches delegated event listeners during `kit.start(...)` which
  // runs as an async `import().then(...)` chain after the `load` event. A tick
  // after networkidle ensures the root listener is in place before interacting.
  await page.waitForTimeout(200);
}

test.describe('Smoke — routes principales', () => {
  test("page d'accueil affiche le titre et les liens de navigation", async ({ page }) => {
    await gotoHydrated(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ouvrir la carte →' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
  });

  test('la carte charge Leaflet et permet de rechercher un pays', async ({ page }) => {
    await gotoHydrated(page, '/carte');
    await expect(page.locator('.leaflet-container').first()).toBeVisible({ timeout: 15_000 });

    const search = page
      .getByRole('complementary', { name: 'Contrôles de la carte' })
      .getByRole('combobox');
    await search.fill('Iran');
    const option = page.getByRole('option', { name: /Iran/ }).first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(page.getByRole('heading', { name: 'Iran', exact: true })).toBeVisible();
  });

  test('le quiz permet de répondre à une question et affiche la correction', async ({ page }) => {
    await gotoHydrated(page, '/quiz');
    await expect(page.getByText(/QCU|QCM/).first()).toBeVisible();
    const firstOption = page.getByRole('listitem').getByRole('button').first();
    await firstOption.click();
    const validate = page.getByRole('button', { name: 'Valider' });
    await expect(validate).toBeEnabled();
    await validate.click();
    await expect(page.getByText(/Bonne réponse|Réponse incorrecte/)).toBeVisible();
  });

  test('la chronologie terrorisme se charge', async ({ page }) => {
    await gotoHydrated(page, '/terrorisme');
    await expect(page.getByRole('heading', { level: 1, name: /Chronologie/ })).toBeVisible();
    await expect(page.locator('time').first()).toBeVisible();
  });

  test('les sources affichent des liens externes', async ({ page }) => {
    await gotoHydrated(page, '/sources');
    await expect(page.getByRole('link', { name: /Pew/i }).first()).toBeVisible();
  });

  test('le guide navigue entre les écrans', async ({ page }) => {
    await gotoHydrated(page, '/guide');
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.getByText('1 / 8')).toBeVisible();
    await page.getByRole('button', { name: /Suivant/ }).click();
    await expect(page.getByText('2 / 8')).toBeVisible();
  });

  test('le bouton thème bascule entre clair et sombre', async ({ page }) => {
    await gotoHydrated(page, '/');
    const initial = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await page.getByRole('button', { name: /Passer en thème/ }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme')), {
        timeout: 5_000
      })
      .not.toBe(initial);
  });
});
