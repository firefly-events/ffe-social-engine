import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Social Engine/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('hero section is visible with tagline', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()

    // Main headline
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Tagline text fragments present in the H1
    await expect(page.locator('h1')).toContainText('Your social media')
    await expect(page.locator('h1')).toContainText('on autopilot')
    await expect(page.locator('h1')).toContainText('Powered by your voice')
  })

  test('pricing page loads from hero CTA link', async ({ page }) => {
    const pricingLink = page.getByRole('link', { name: /see pricing/i }).first()
    await expect(pricingLink).toBeVisible()
    await pricingLink.click()
    await expect(page).toHaveURL('/pricing')
  })

  test('navigation links are visible and functional', async ({ page }) => {
    // Nav brand link
    await expect(page.getByRole('link', { name: /social engine/i }).first()).toBeVisible()

    // Features and How It Works nav links
    await expect(page.getByRole('link', { name: /features/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /how it works/i })).toBeVisible()

    // Pricing nav link
    const pricingNavLink = page.getByRole('link', { name: /^pricing$/i })
    await expect(pricingNavLink.first()).toBeVisible()
  })

  test('sign-in button is visible in the nav', async ({ page }) => {
    // Clerk renders a SignInButton with the text "Sign In"
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('Get Started Free CTA link is present', async ({ page }) => {
    const ctaLinks = page.getByRole('link', { name: /get started free/i })
    await expect(ctaLinks.first()).toBeVisible()
    await expect(ctaLinks.first()).toHaveAttribute('href', '/sign-up')
  })

  test('visual snapshot of landing page', async ({ page }) => {
    // Scroll to top to ensure consistent viewport
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(page).toHaveScreenshot('landing-page.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    })
  })
})
