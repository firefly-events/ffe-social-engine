import { test, expect } from '@playwright/test'

test.describe('Auth pages', () => {
  test('sign-in page loads and renders Clerk component', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page).toHaveURL(/sign-in/)

    // Clerk renders its sign-in UI inside a card/form — wait for it to hydrate
    // Clerk embeds an iframe or a div with role="main" or a form
    await page.waitForLoadState('networkidle')

    // The page should not be a blank 404 or error page
    await expect(page.locator('body')).toBeVisible()

    // Clerk sign-in component renders an email or identifier input
    const clerkForm = page.locator('input[name="identifier"], input[type="email"], [data-localization-key]')
    await expect(clerkForm.first()).toBeVisible({ timeout: 10_000 })
  })

  test('sign-up page loads and renders Clerk component', async ({ page }) => {
    await page.goto('/sign-up')
    await expect(page).toHaveURL(/sign-up/)

    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()

    // Clerk sign-up component renders an email or first name input
    const clerkForm = page.locator('input[name="emailAddress"], input[name="email_address"], input[type="email"], [data-localization-key]')
    await expect(clerkForm.first()).toBeVisible({ timeout: 10_000 })
  })

  test('unauthenticated user is redirected from /dashboard to sign-in', async ({ page }) => {
    // No session cookie set — Clerk middleware should redirect
    await page.goto('/dashboard')

    // Should end up at a sign-in URL (Clerk redirects to /sign-in with redirectUrl param)
    await expect(page).toHaveURL(/sign-in/, { timeout: 10_000 })
  })

  test('unauthenticated user is redirected from /admin to sign-in or dashboard', async ({ page }) => {
    // The admin route is protected; without a session the user is redirected to sign-in
    // With a non-admin session the middleware redirects to /(dashboard) — but we have no session here
    await page.goto('/admin')

    // Should redirect away from /admin — either to sign-in or another page
    await page.waitForURL((url) => !url.pathname.includes('/admin'), { timeout: 10_000 })
    const finalUrl = page.url()
    expect(finalUrl).not.toContain('/admin')
  })
})
