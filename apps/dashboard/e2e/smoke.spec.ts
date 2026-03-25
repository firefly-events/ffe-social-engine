import { test, expect } from '@playwright/test';

test.describe('Social Engine Smoke Tests', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Social Engine|FFE/i);
  });

  test('sign-in page loads', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.locator('body')).toBeVisible();
  });

  test('sign-up page loads', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard redirects to sign-in when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/);
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('body')).toBeVisible();
  });

  test('API health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/social/accounts');
    // Should return 401 (no auth) not 500
    expect([401, 403]).toContain(response.status());
  });
});
