# Fashionova

The website for Fashionova, a contemporary fashion house in Accra, Ghana.

Next.js 16 · Tailwind v4 · GSAP · React Three Fiber · Sanity · Paystack

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

That is the whole setup. **No accounts, no keys, no configuration** — the site
boots on a built-in sample collection of twelve products so you can see and
judge everything immediately. Connecting Sanity and Paystack below swaps the
sample data for your own and turns the checkout on.

```bash
npm run build        # production build
npm run typecheck    # TypeScript, no emit
npm run seed:images  # regenerate the placeholder imagery
```

---

## How to change a price

This is the thing you will do most often, so it comes first.

1. Go to **yourdomain.com/studio** and log in.
2. Click **Pricing** in the left-hand list. Every live product, most expensive
   first.
3. Click the product. Change the **Price (GHS)** field — just the number, in
   cedis. `1450`, not `GHS 1,450` and not `145000`.
4. Click **Publish**.

The live site updates within a few seconds. There is no deploy, no rebuild, and
nothing to ask a developer for.

## How to add a product

1. **/studio** → **Products** → the pencil icon → **Product**.
2. Fill in: name, then click **Generate** next to the web address.
3. Drag in photographs. Give each one a short description — it is what screen
   readers and Google read. The first photo is the one on the grid; the second
   is what shows on hover, so make it a different angle.
4. **Price (GHS)** — the number in cedis.
5. **Sizes and colours** — one row per size, each with its own stock count.
   When a count hits zero that size shows as sold out automatically.
6. Tick **Made to order** if it is sewn after ordering. The page then shows a
   7–14 day lead time and ignores stock counts.
7. Set **status** to **active**. This is the switch that puts it on the site —
   a product left as *draft* stays invisible.
8. **Publish**.

To take something down, set its status to *archived* rather than deleting it,
so past orders still point at something real.

---

## Connecting Sanity (do this first)

About five minutes, once.

1. Create a free project at [sanity.io/manage](https://sanity.io/manage).
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` — from the project's settings page
   - `NEXT_PUBLIC_SANITY_DATASET` — `production`
   - `SANITY_API_READ_TOKEN` — API → Tokens → add a token with **Editor**
     access (the Paystack webhook writes orders with it)
   - `SANITY_REVALIDATE_SECRET` — invent a long random string
3. In the Sanity project, add `http://localhost:3000` and your live domain
   under **API → CORS origins**, with credentials allowed.
4. Restart the dev server. `/studio` is now your Studio.
5. **Make price changes appear instantly.** In Sanity: **API → Webhooks →
   Create webhook**.
   - URL: `https://yourdomain.com/api/revalidate`
   - Trigger on: create, update, delete
   - HTTP headers: `Authorization: Bearer <your SANITY_REVALIDATE_SECRET>`

Until step 5 is done, published changes still appear — just within the hour
rather than within seconds.

The Studio starts empty. Add your real products; the sample collection
disappears the moment there is one active product in Sanity.

## Connecting Paystack (payments)

Ghanaian customers pay with **MTN MoMo, Telecel Cash, AT Money** and cards.
Paystack handles all four; Stripe is not available to Ghanaian merchants.

1. Create an account at [paystack.com](https://paystack.com) and start business
   verification early — it needs your business registration, ID and bank
   details, and can take a few days. You cannot take real money until it clears.
2. **Settings → API Keys & Webhooks**, and put the **test** pair in
   `.env.local`:
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` = `pk_test_...`
   - `PAYSTACK_SECRET_KEY` = `sk_test_...`
3. On the same page set the webhook URL to
   `https://yourdomain.com/api/paystack/webhook`.
4. Test a full order with Paystack's test cards and test MoMo numbers.
5. When you are ready for real money, swap both keys for the `pk_live_` /
   `sk_live_` pair in your Vercel environment variables and redeploy.

Never commit `PAYSTACK_SECRET_KEY`. It is a spending key.

Without Paystack keys the checkout still runs end to end in test mode — it
skips the payment step and shows a confirmation, so the flow can be reviewed
before the account clears.

---

## Deploying

Push to GitHub, import the repo at [vercel.com](https://vercel.com), and paste
every variable from `.env.example` into **Settings → Environment Variables**.

Set `NEXT_PUBLIC_SITE_URL` to the real domain — Paystack callbacks and Open
Graph images depend on it.

---

## What is where

```
app/(site)/          The public website
app/(site)/actions.ts  Newsletter and contact form server actions
app/(studio)/studio  Sanity Studio, on your own domain
app/api/             checkout · Paystack webhook · Sanity revalidation
components/anim/     Scroll set pieces (split headings, rail, marquee, lookbook)
components/three/    The three WebGL scenes
components/shop/     Grid, card, gallery, bag, checkout
components/site/     Header, footer, hero, cursor, transitions
lib/catalogue.ts     The only place the app reads content from
lib/email.ts         Resend transport for order, contact and signup mail
lib/sizing.ts        The size chart, in centimetres
lib/seed.ts          The sample collection used before Sanity is connected
sanity/schemas/      What the Studio's forms are made of
scripts/             Placeholder image and brand mark generators
```

### The one rule worth knowing

Pages never read `lib/seed.ts` or the Sanity client directly — everything goes
through `lib/catalogue.ts`, which tries Sanity and falls back to the sample
data. That is why connecting the CMS needs no code change, and why a CMS outage
degrades to sample content instead of a 500.

Prices are stored as a plain number of cedis and only converted to pesewas at
the moment they are handed to Paystack (`lib/money.ts`). No price is hardcoded
anywhere. The checkout API recomputes every line's price from the catalogue and
ignores whatever the browser sent, so a tampered request cannot buy an agbada
for one cedi.

---

## The photography

The site currently ships with generated placeholder images — flat SVGs in the
brand palette carrying wax-print-derived motifs. They exist so the layout,
the scroll choreography and the colour relationships could be judged before a
shoot happens. **They are not meant to survive to launch.**

Replace them by uploading real photographs in the Studio; nothing references
the placeholder files once products come from Sanity. Before the CMS exists,
`public/img/photography/` is a drop-in shortcut — its README names the slot for
each photograph.

Photography is most of whether this reads as a premium house or a template.
Budget for one proper editorial shoot in Accra before launch. No amount of GSAP
rescues weak images.

## The typefaces

`app/(site)/globals.css` asks for **PP Editorial New** (display) and **Suisse
Intl** (UI), falling back to system serif and sans. Both are commercial and are
not bundled here. Licence them, drop the `.woff2` files into `public/fonts/`,
and add an `@font-face` block — the type scale is already built around them.
Free stand-ins that hold the same character: Instrument Serif and Inter Tight.

---

## Email

Order confirmations, contact enquiries and newsletter signups go out through
Resend. Add `RESEND_API_KEY` and `EMAIL_FROM` (see `.env.example`) and verify
your sending domain in the Resend dashboard.

Without a key the forms still succeed and the message is written to the server
log instead of being sent — so the whole flow is reviewable before an email
account exists, without pretending mail was delivered.

One detail worth keeping if you touch the forms: React resets an uncontrolled
form once its action completes, so a failed validation would otherwise wipe
everything the visitor typed — and the browser's own `required` check then
blocks them from resubmitting the emptied fields. The actions echo the
submitted values back in `FormState.values`, and the inputs read them as
`defaultValue`.

## Accessibility and motion

Everything respects `prefers-reduced-motion`: no smooth scroll, no pinning, no
transforms, no WebGL — the same layout, static. The WebGL scenes additionally
skip devices reporting fewer than four cores, anything sending `Save-Data`, and
browsers without WebGL, falling back to the static images. A customer on a
mid-range Android should never get a blank canvas.

Focus rings are visible throughout, the pinned sections do not trap keyboard
focus, and every Sanity image field requires alt text before it can be
published.
