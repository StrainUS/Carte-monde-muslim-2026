import { test, expect } from '@playwright/test';

test.describe('Smoke — routes principales', () => {
  test("page d'accueil affiche le titre et les liens de navigation", async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ouvrir la carte →' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
  });

  test('la carte charge Leaflet et permet de rechercher un pays', async ({ page }) => {
    await page.goto('/carte');
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
    const search = page.getByRole('combobox', { name: /pays/i });
    await search.fill('Iran');
    const option = page.getByRole('option', { name: /Iran/ }).first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(page.getByRole('heading', { name: 'Iran' })).toBeVisible();
  });

  test('le quiz permet de répondre à une question et affiche la correction', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.getByText(/QCU|QCM/)).toBeVisible();
    const options = page.locator('[aria-pressed]');
    await options.first().click();
    await page.getByRole('button', { name: 'Valider' }).click();
    await expect(page.getByText(/Bonne réponse|Réponse incorrecte/)).toBeVisible();
  });

  test('la chronologie terrorisme se charge', async ({ page }) => {
    await page.goto('/terrorisme');
    await expect(page.getByRole('heading', { name: /Chronologie/ })).toBeVisible();
    await expect(page.locator('time').first()).toBeVisible();
  });

  test('les sources affichent des liens externes', async ({ page }) => {
    await page.goto('/sources');
    await expect(page.getByRole('link', { name: /Pew/i }).first()).toBeVisible();
  });

  test('le guide navigue entre les écrans', async ({ page }) => {
    await page.goto('/guide');
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    await page.getByRole('button', { name: /Suivant/ }).click();
    await expect(page.getByText('2 / 8')).toBeVisible();
  });

  test('le bouton thème bascule entre clair et sombre', async ({ page }) => {
    await page.goto('/');
    const initial = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    await page.getByRole('button', { name: /Passer en thème/ }).click();
    const after = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    expect(after).not.toBe(initial);
  });
});
