import { test, expect } from '@playwright/test'

test.describe('Pricing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing')
  })

  test('loads successfully', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /simple pricing/i })).toBeVisible()
  })

  test('all 6 tier cards render', async ({ page }) => {
    const tierNames = ['Free', 'Starter', 'Basic', 'Pro', 'Business', 'Enterprise']

    for (const name of tierNames) {
      // Each tier has its name as a text label in a card
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
    }
  })

  test('monthly/annual billing toggle works', async ({ page }) => {
    // Default state: monthly
    await expect(page.getByText('Monthly')).toBeVisible()
    await expect(page.getByText('Annual')).toBeVisible()

    // Pro monthly price: $29.99
    const proPrice = page.locator('text=$29.99').first()
    await expect(proPrice).toBeVisible()

    // Toggle to annual
    const toggle = page.getByRole('button', { name: /toggle billing interval/i })
    await toggle.click()

    // Annual savings badge should appear
    await expect(page.getByText('20% off')).toBeVisible()

    // Pro annual price: $23.99
    const proAnnualPrice = page.locator('text=$23.99').first()
    await expect(proAnnualPrice).toBeVisible()

    // Toggle back to monthly
    await toggle.click()
    await expect(proPrice).toBeVisible()
  })

  test('Pro tier is highlighted as Most Popular', async ({ page }) => {
    await expect(page.getByText('Most Popular')).toBeVisible()

    // The Pro card contains both "Most Popular" badge and "Pro" label
    const proCard = page.locator('[class*="popular"], :has-text("Most Popular")').first()
    await expect(proCard).toBeVisible()
  })

  test('Enterprise tier shows Talk to Us CTA', async ({ page }) => {
    await expect(page.getByRole('button', { name: /talk to us/i })).toBeVisible()
  })

  test('Enterprise CTA is styled differently (amber/gold)', async ({ page }) => {
    const enterpriseBtn = page.getByRole('button', { name: /talk to us/i })
    await expect(enterpriseBtn).toBeVisible()
    // Verify it has the enterprise amber styling class
    const className = await enterpriseBtn.getAttribute('class')
    expect(className).toContain('amber')
  })

  test('comparison table renders with all 6 plan columns', async ({ page }) => {
    await expect(page.getByText('Compare plans at a glance')).toBeVisible()

    const table = page.locator('table')
    await expect(table).toBeVisible()

    // All tier names appear in table headers
    for (const name of ['Free', 'Starter', 'Basic', 'Pro', 'Business', 'Enterprise']) {
      await expect(table.getByText(name, { exact: true }).first()).toBeVisible()
    }
  })

  test('FAQ section is present', async ({ page }) => {
    await expect(page.getByText('Frequently asked questions')).toBeVisible()
    // First FAQ question
    await expect(page.getByText('Can I switch plans at any time?')).toBeVisible()
  })

  test('visual snapshot of pricing page', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(page).toHaveScreenshot('pricing-page.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    })
  })
})
