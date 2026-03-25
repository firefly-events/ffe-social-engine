import { test, expect } from '@playwright/test';

test.describe('Social Engine Smoke Tests', () => {
  test('landing page loads with styling', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Social Engine|FFE/i);

    // Verify styles are applied (not unstyled SSR fallback)
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe(''); // must have computed styles

    // Verify hero section renders with proper layout
    const heroText = page.getByText(/your social media/i);
    await expect(heroText).toBeVisible({ timeout: 10000 });

    // Verify nav renders with background color (not unstyled)
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    const navBg = await nav.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(navBg).not.toBe('rgba(0, 0, 0, 0)'); // nav must have background
  });

  test('no console errors on landing page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Filter out known non-blocking warnings
    const blocking = errors.filter(e =>
      !e.includes('PostHog') && // PostHog init warning is non-blocking
      !e.includes('favicon')
    );
    expect(blocking).toHaveLength(0);
  });

  test('no 500 errors on any page', async ({ request }) => {
    const pages = ['/', '/sign-in', '/sign-up', '/pricing'];
    for (const path of pages) {
      const response = await request.get(path);
      expect(response.status(), `${path} returned ${response.status()}`).not.toBe(500);
    }
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
    await expect(page).toHaveURL(/sign-in/);
  });

  test('pricing page loads with content', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('body')).toBeVisible();
    // Verify pricing content actually rendered
    const pricingText = page.getByText(/month|free|starter|pro/i);
    await expect(pricingText.first()).toBeVisible({ timeout: 10000 });
  });

  test('API health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/social/accounts');
    expect([401, 403]).toContain(response.status());
  });
});
