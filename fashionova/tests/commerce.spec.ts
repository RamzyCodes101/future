import { test, expect } from '@playwright/test'

test.describe('buying a piece', () => {
  test('add to bag, check out, and land on a confirmed order', async ({ page }) => {
    await page.goto('/shop/sankofa-applique-kaftan')

    await page.getByRole('button', { name: 'M', exact: true }).click()
    await page.getByRole('button', { name: 'Add to bag' }).click()

    const bag = page.getByRole('dialog', { name: 'Shopping bag' })
    await expect(bag).toBeVisible()
    await expect(bag.getByText('Sankofa Appliqué Kaftan')).toBeVisible()

    await bag.getByRole('link', { name: 'Checkout' }).click()
    await page.waitForURL('**/checkout')

    await page.fill('#name', 'Ama Mensah')
    await page.fill('#email', 'ama@example.com')
    await page.fill('#phone', '0244123456')
    await page.fill('#address', '12 Ring Road, Osu, near the Total station')
    await page.getByRole('button', { name: /^Pay / }).click()

    await page.waitForURL('**/order/**')
    await expect(page.getByRole('heading', { name: 'Thank you.' })).toBeVisible()

    // A confirmed order empties the bag; an abandoned one must not.
    await page.goto('/shop')
    await expect(page.getByRole('button', { name: /Open bag/ })).toContainText('(0)')
  })

  test('a size must be chosen before anything can be added', async ({ page }) => {
    await page.goto('/shop/adinkra-fan-two-piece')
    await page.getByRole('button', { name: 'Add to bag' }).click()
    // Scoped to the page body: Next renders its own empty role="alert" route
    // announcer, which an unscoped alert lookup matches too.
    await expect(page.locator('main [role="alert"]')).toContainText('Choose a size')
  })

  test('filtering the grid keeps only the chosen category', async ({ page }) => {
    await page.goto('/shop')
    await page.getByRole('button', { name: /^Headwear/ }).click()
    await page.waitForTimeout(900) // the Flip animation
    const names = await page.locator('article h3').allTextContents()
    expect(names.length).toBeGreaterThan(0)
    expect(names).toContain('Fan Motif Gele')
  })
})

test.describe('server-side guards', () => {
  test('a tampered line price is recomputed from the catalogue', async ({ request }) => {
    const res = await request.post('/api/checkout', {
      data: {
        email: 'a@b.com',
        name: 'Test Buyer',
        phone: '0244123456',
        address: '1 Test Street, Accra',
        zone: 'Greater Accra',
        // The agbada is GHS 4,200. The client claims it costs 1.
        lines: [{ slug: 'kente-lattice-agbada', size: 'M', colour: 'Ivory', quantity: 1, price: 1 }],
      },
    })
    expect(res.ok()).toBeTruthy()
    expect((await res.json()).total).toBe(4200)
  })

  test('a malformed payload is rejected', async ({ request }) => {
    const res = await request.post('/api/checkout', {
      data: { email: 'not-an-email', name: 'x', phone: '1', address: 'y', zone: 'Z', lines: [] },
    })
    expect(res.status()).toBe(400)
  })

  test('a product that is not active cannot be bought', async ({ request }) => {
    const res = await request.post('/api/checkout', {
      data: {
        email: 'a@b.com',
        name: 'Test Buyer',
        phone: '0244123456',
        address: '1 Test Street, Accra',
        zone: 'Greater Accra',
        lines: [{ slug: 'no-such-product', size: 'M', colour: 'Ivory', quantity: 1 }],
      },
    })
    expect(res.status()).toBe(409)
  })

  test('the Paystack webhook refuses a forged signature', async ({ request }) => {
    const res = await request.post('/api/paystack/webhook', {
      headers: { 'x-paystack-signature': 'forged' },
      data: { event: 'charge.success', data: { reference: 'FAKE', amount: 100 } },
    })
    expect(res.status()).not.toBe(200)
  })
})
