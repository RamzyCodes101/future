import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

/**
 * Every page is checked against WCAG 2.1 A and AA.
 *
 * This suite exists because the accessibility claims in the brief were once
 * asserted rather than measured — and when they were finally measured, seven
 * pages failed on colour contrast. The palette is easy to regress, so the
 * check is automated.
 */
const PAGES = [
  ['home', '/'],
  ['shop', '/shop'],
  ['product', '/shop/sankofa-applique-kaftan'],
  ['collection', '/collections/harmattan'],
  ['about', '/about'],
  ['journal', '/journal'],
  ['contact', '/contact'],
  ['checkout', '/checkout'],
] as const

for (const [name, path] of PAGES) {
  test(`${name} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    // Entrance animations start elements at opacity 0; let them land first.
    await page.waitForTimeout(1200)

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // The marquees are repeated ghost wordmarks carrying no information.
      // WCAG 1.4.3 exempts pure decoration from the contrast minimum; the
      // exclusion is explicit so it can never pass by accident.
      .exclude('[data-decorative]')
      .analyze()

    expect(
      violations.map((v) => `${v.id}: ${v.nodes.length} node(s) — ${v.help}`),
      `axe violations on ${path}`
    ).toEqual([])
  })
}
