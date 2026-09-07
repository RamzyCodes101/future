import { test, expect } from '@playwright/test'

/**
 * The parts of the site most likely to break silently: layout on a phone,
 * the reduced-motion path, and the forms.
 */

test('no page scrolls sideways', async ({ page }) => {
  for (const path of ['/', '/shop', '/shop/sankofa-applique-kaftan', '/about', '/journal']) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(2)
  }
})

test('the mobile menu opens', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the menu button only exists below the md breakpoint')
  await page.goto('/')
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page.locator('#mobile-nav')).toBeVisible()
  await expect(page.locator('#mobile-nav').getByRole('link', { name: 'Lookbook' })).toBeVisible()
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('nothing is left invisible when animation is switched off', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => window.scrollTo(0, 5200))
    await page.waitForTimeout(1000)

    // Elements tagged for entrance animation start at opacity 0. Under reduced
    // motion no timeline runs, so the provider must reveal them instead — the
    // failure mode here is a blank page, not a missing flourish.
    const invisible = await page.evaluate(() =>
      [...document.querySelectorAll('[data-anim]')].filter((el) => {
        const r = el.getBoundingClientRect()
        const onScreen = r.top < window.innerHeight && r.bottom > 0 && r.width > 0
        return onScreen && Number(getComputedStyle(el).opacity) < 0.9
      }).length
    )
    expect(invisible).toBe(0)
  })

  test('the lookbook falls back to a plain gallery', async ({ page }) => {
    await page.goto('/lookbook')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('figure img').first()).toBeVisible()
  })
})

test.describe('forms', () => {
  test('a failed contact submission keeps what was typed', async ({ page }) => {
    await page.goto('/contact')
    await page.fill('#name', 'Kofi Asante')
    await page.fill('#email', 'kofi@example.com')
    await page.fill('#message', 'short')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.locator('form [role="alert"]')).toContainText('little more')

    // React resets an uncontrolled form once its action completes. Without the
    // values being echoed back, the visitor loses everything they wrote and
    // the browser's own required check then blocks resubmission entirely.
    await expect(page.locator('#name')).toHaveValue('Kofi Asante')
    await expect(page.locator('#email')).toHaveValue('kofi@example.com')

    await page.fill('#message', 'I would like to book a fitting for the ceremonial kaftan.')
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByText('we reply within one working day')).toBeVisible()
  })

  test('the newsletter confirms a signup', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.fill('#newsletter', 'ama@example.com')
    await page.getByRole('button', { name: 'Join' }).click()
    await expect(page.locator('#newsletter-status')).toContainText('on the list')
  })
})

test('the brand marks resolve', async ({ request }) => {
  for (const asset of ['/favicon.ico', '/apple-icon.png', '/og.png', '/manifest.webmanifest']) {
    expect((await request.get(asset)).status(), asset).toBe(200)
  }
})
