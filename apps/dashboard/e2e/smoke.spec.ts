import { test, expect } from '@playwright/test';

test.describe('Social Engine Smoke Tests', () => {
  test('landing page loads with content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Social Engine|FFE/i);

    // Verify key content renders (not a blank page or error)
    const heroText = page.getByText(/your social media|content creation|AI-powered/i);
    await expect(heroText.first()).toBeVisible({ timeout: 15000 });

    // Verify nav exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Verify CTA button exists
    const cta = page.getByText(/get started|sign up/i);
    await expect(cta.first()).toBeVisible();
  });

  test('CSS loads — page is styled (not raw HTML)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify at least one stylesheet is loaded
    const stylesheets = await page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).length
    );
    expect(stylesheets, 'No stylesheets found — Tailwind CSS is missing').toBeGreaterThan(0);

    // Verify body has non-default background (not raw white #f5f5f5 inline or unstyled)
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    const navBg = await nav.evaluate(el => getComputedStyle(el).backgroundColor);
    // Nav should NOT be transparent/white if Tailwind is working (bg-slate-950 = dark)
    expect(navBg, 'Nav has no background — CSS not applied').not.toBe('rgba(0, 0, 0, 0)');

    // Verify flexbox/grid layout is applied (not just stacked block elements)
    const heroLayout = await page.locator('nav').evaluate(el => getComputedStyle(el).display);
    expect(['flex', 'grid', 'inline-flex']).toContain(heroLayout);
  });

  test('visual snapshot — landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('landing-page.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: false,
    });
  });

  test('visual snapshot — pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('pricing-page.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: false,
    });
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

  test('API responds without 500', async ({ request }) => {
    const response = await request.get('/api/social/accounts');
    // Any response except 500 means the server is running
    expect(response.status()).not.toBe(500);
  });
});
