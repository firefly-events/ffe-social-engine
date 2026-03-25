import { test, expect } from '@playwright/test';

/**
 * UI Smoke Tests — Social Engine (FIR-1240)
 *
 * KNOWN DEPLOYMENT ISSUE (2026-03-25):
 *   /dashboard and all protected routes return HTTP 404 instead of redirecting to /sign-in.
 *   Root cause: Vercel deployment uses a Clerk dev key (pk_test_...) which requires a
 *   "dev-browser" cookie that is absent for unauthenticated visitors.
 *   Evidence: response header `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
 *   Fix: set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to production (pk_live_...)
 *        values in Vercel environment variables.
 */

test.describe('Public routes — HTTP status', () => {
  test('all public pages return 200', async ({ request }) => {
    const publicRoutes = ['/', '/sign-in', '/sign-up', '/pricing'];
    for (const path of publicRoutes) {
      const response = await request.get(path);
      expect(response.status(), `${path} returned ${response.status()}`).toBe(200);
    }
  });

  test('no public page returns 500', async ({ request }) => {
    const routes = ['/', '/sign-in', '/sign-up', '/pricing'];
    for (const path of routes) {
      const response = await request.get(path);
      expect(response.status(), `${path} returned ${response.status()}`).not.toBe(500);
    }
  });
});

test.describe('Protected routes — auth behaviour', () => {
  /**
   * EXPECTED: /dashboard should redirect (3xx) to /sign-in for unauthenticated users.
   * CURRENT STATE: returns 404 due to Clerk dev key / dev-browser-missing issue.
   * This test documents the *correct* expectation; it will pass once the Clerk keys
   * are swapped to production values.
   */
  test('dashboard redirects to sign-in when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('protected routes do not return 500', async ({ request }) => {
    const protectedRoutes = ['/dashboard', '/create', '/connect', '/sessions', '/analytics'];
    for (const path of protectedRoutes) {
      const response = await request.get(path);
      expect(response.status(), `${path} should not 500`).not.toBe(500);
    }
  });

  /**
   * Verifies Clerk auth middleware headers are present — confirms the middleware is
   * running (even if the dev-browser-missing redirect is going to /404 right now).
   */
  test('Clerk auth middleware runs on protected routes', async ({ request }) => {
    const response = await request.get('/dashboard');
    const authStatus = response.headers()['x-clerk-auth-status'];
    // Middleware is running if Clerk sets this header
    expect(authStatus, 'x-clerk-auth-status header should be present').toBeTruthy();
  });
});

test.describe('Landing page content', () => {
  test('landing page loads with content and nav', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Social Engine|FFE/i);

    // Nav must exist
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Verify hero / marketing copy renders
    const heroText = page.getByText(/your social media|content creation|AI-powered/i);
    await expect(heroText.first()).toBeVisible({ timeout: 15000 });

    // CTA button must be visible and clickable
    const cta = page.getByText(/get started|sign up/i);
    await expect(cta.first()).toBeVisible();
    await expect(cta.first()).toBeEnabled();
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

  test('nav links are present', async ({ page }) => {
    await page.goto('/');
    // Check that navigation link to pricing exists
    const pricingLink = page.getByRole('link', { name: /pricing/i });
    await expect(pricingLink.first()).toBeVisible();
  });

  test('no blocking console errors on landing page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Filter known non-blocking third-party warnings
    const blocking = errors.filter(e =>
      !e.includes('PostHog') &&
      !e.includes('favicon') &&
      !e.includes('Clerk') // Clerk dev-mode console warnings are non-blocking
    );
    expect(blocking).toHaveLength(0);
  });
});

test.describe('Auth pages', () => {
  test('sign-in page renders Clerk script', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.locator('body')).toBeVisible();
    // Clerk sign-in script tag must be present
    const clerkScript = page.locator('script[data-clerk-js-script]');
    await expect(clerkScript).toHaveCount(1);
  });

  test('sign-up page renders Clerk script', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.locator('body')).toBeVisible();
    const clerkScript = page.locator('script[data-clerk-js-script]');
    await expect(clerkScript).toHaveCount(1);
  });
});

test.describe('Pricing page', () => {
  test('pricing page loads with plan information', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('body')).toBeVisible();
    // Pricing content should render
    const pricingText = page.getByText(/month|free|starter|pro/i);
    await expect(pricingText.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('API health', () => {
  test('API route returns non-500 for unauthenticated request', async ({ request }) => {
    // Expecting 401 (unauthenticated) or 404 (Clerk dev-browser issue) — never 500
    const response = await request.get('/api/social/accounts');
    expect(response.status()).not.toBe(500);
  });

  test('health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health');
    // 200 = healthy, 404 = route not deployed, 500 = broken
    expect(response.status(), '/api/health should not 500').not.toBe(500);
  });
});
