# Ghana Fashion Brand — Awwwards-Grade Website

> **This has been built.** The working site is in [`../fashionova/`](../fashionova) —
> Next.js 16, GSAP, React Three Fiber, Sanity and Paystack, with a twelve-piece
> sample collection so it runs with no accounts or keys. Start there; this
> document is the brief it was built from, kept for reference and for briefing
> other tools.

Two things live in this folder:

1. **[The build prompt](#part-2--the-build-prompt)** — copy-paste it into Claude Code, Cursor, v0, or Lovable to scaffold the site.
2. **[The stack decision](#part-1--the-stack)** — why each tool, and the Ghana-specific bits (Mobile Money, cedis, slow-network reality) that generic "best stack" answers miss.

Read Part 1 once so you can defend the choices. Ship Part 2.

---

## Part 1 — The stack

### The short answer

**Next.js 16 + TypeScript + Tailwind v4 + GSAP (ScrollTrigger/SplitText/Flip) + React Three Fiber + Motion + Sanity CMS + Paystack + Vercel.**

### The full table

| Layer | Pick | Why this and not the alternative |
|---|---|---|
| Framework | **Next.js 16** (App Router, RSC) | Server components render your product grid as HTML — critical on 3G. Astro is faster for static, but you need a cart, auth and a live CMS, so Next wins. |
| Language | **TypeScript** | Non-negotiable once products, variants and prices have shapes. |
| Styling | **Tailwind CSS v4** | v4's CSS-first config + native cascade layers. Pair with CSS variables for the brand palette so the Three.js scene can read the same colors. |
| Scroll animation | **GSAP 3 + ScrollTrigger** | The Awwwards default. Every plugin (SplitText, ScrollSmoother, Flip, MorphSVG, DrawSVG, Observer) is free under the standard license since Webflow acquired GSAP. Nothing else pins animation to scroll position this precisely. |
| Smooth scroll | **Lenis** (or GSAP ScrollSmoother) | Lenis is lighter and plays nicely with ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`. Pick one — never run both. |
| UI motion | **Motion** (formerly Framer Motion) | For the things GSAP is clumsy at: layout transitions (`layoutId` for product-card → product-page morphs), enter/exit on modals, drag. That "Framer look" is `layoutId` + spring physics. |
| 3D | **React Three Fiber + drei + postprocessing** | Three.js as JSX components. `@react-three/drei` gives you `<Environment>`, `<ScrollControls>`, `<MeshTransmissionMaterial>` for free. |
| CMS | **Sanity** | The reason you asked. Studio embeds at `/studio`, so you log in on your own domain, edit a price, hit publish, and the page updates in seconds — no deploy, no code. Real-time collaborative, generous free tier, image CDN with on-the-fly crops built in. |
| Payments | **Paystack** | The right call for Ghana. Cards *plus* MTN MoMo, Telecel Cash and AT Money — which is how most of your customers actually pay. Settles to a Ghanaian bank in GHS. Flutterwave and Hubtel are fine alternates; Stripe is not available to Ghanaian merchants. |
| Images | **next/image + Sanity CDN** | Sanity serves AVIF/WebP with hotspot-aware crops. Your lookbook photos are the whole product — this is where the perf budget goes. |
| Email | **Resend + React Email** | Order confirmations that look designed instead of like a receipt printer. |
| Deploy | **Vercel** | Edge network has an Accra-adjacent PoP path; preview URLs on every push so you can approve designs from your phone. |
| Analytics | **Vercel Analytics + Sanity events** | Privacy-friendly, no cookie banner needed. |

### The two decisions people get wrong

**"Should I just use Shopify?"** — Use Shopify only if you need inventory sync, multi-currency and abandoned-cart flows *today*. The cost is that Shopify's checkout is a hard wall your animation can't cross, and Ghanaian MoMo support goes through third-party apps that take another cut. For a brand site where the *look* is the product and you sell a curated 20–60 pieces, Sanity + Paystack gives you a checkout you fully control. Revisit at ~500 orders/month.

**"Three.js everywhere?"** — No. WebGL is a spice, not the meal. Three scenes on this site, each earning its keep: the hero fabric, the product 3D viewer, and the WebGL image-transition layer. Everything else is GSAP on DOM elements, which is faster and accessible by default.

---

## Part 2 — The build prompt

> Copy everything below the line into your AI coding tool. It is written to be pasted whole.

---

Build a production-ready website for **Fashionova**, a contemporary fashion label based in Accra, Ghana, working in Ankara wax print, kente-inspired weaves, adire, and modern tailored silhouettes for men and women. The brand sits at the intersection of West African textile heritage and modern streetwear/ready-to-wear.

The site must feel like an **Awwwards Site of the Day**: editorial, confident, physical. Not a template. Every scroll should reveal something. Judge every screen against the question "would this get a Site of the Day nomination?" — if it looks like a Bootstrap store with animations bolted on, redo it.

### 1. Tech stack — use exactly this

```
Framework      Next.js 16 (App Router, React Server Components), TypeScript strict
Styling        Tailwind CSS v4 + CSS custom properties for the brand palette
Scroll         GSAP 3 (ScrollTrigger, SplitText, Flip, Observer, DrawSVG) + Lenis smooth scroll
UI motion      Motion (framer-motion) for layout transitions and page transitions
3D             React Three Fiber + @react-three/drei + @react-three/postprocessing
CMS            Sanity v3 with embedded Studio at /studio
Payments       Paystack (cards + MTN MoMo + Telecel Cash + AT Money), currency GHS
State          Zustand for cart, persisted to localStorage
Forms          react-hook-form + zod
Email          Resend + React Email
Deploy         Vercel
```

Install GSAP from npm (`gsap` — all plugins are included free under the standard license, including SplitText and ScrollSmoother). Register plugins once in a client-only provider.

### 2. Art direction

**Palette** — premium means restraint, not more colour. Near-black and ivory do
the structural work; the saturated tones are reserved for full-bleed editorial
surfaces, and champagne appears only as hairlines and hover states:

```css
--noir:      #0B0B0C   /* near-black — the structural colour */
--ink:       #16161A   /* body text */
--graphite:  #3A3A40   /* secondary text */
--taupe:     #9A8B79   /* muted labels, rules */
--mist:      #DCD4C7   /* text on dark grounds */
--bone:      #EFEAE1   /* image wells, secondary surfaces */
--ivory:     #F7F4EE   /* page background */
--champagne: #C6A664   /* hairlines and hover only — never a filled block */
--jade:      #12352E   /* deep editorial ground */
--oxblood:   #4A1C1B   /* deep editorial ground */
```

Use `--ivory`/`--bone` as the ground 80% of the time. Colour arrives via the photography, not via painted UI blocks. The fastest way to make this look cheap is to fill a large area with champagne.

**Type** — a high-contrast display serif for headlines (PP Editorial New, Reckless Neue, or Instrument Serif as a free stand-in) against a neutral grotesque for UI (Neue Haas, Suisse Int'l, or Inter Tight). Headline scale is aggressive: `clamp(3rem, 12vw, 14rem)`, tight tracking (`-0.04em`), leading under 0.9. Product names in small caps with wide tracking.

**Layout** — a 12-column grid you deliberately break. Asymmetric spreads, full-bleed images butting against 3-column text, generous whitespace, occasional edge-to-edge type that gets cropped by the viewport. Think a printed lookbook, not a storefront.

**Photography** — the imagery is the hero: full-body editorial on Accra streets, stairwells, and studio backdrops; models in wax print co-ords, kente-trimmed agbadas, boubous, structured two-pieces. Never crop faces awkwardly; use Sanity hotspots.

### 3. Scroll choreography — GSAP, triggered from every angle

This is the centrepiece. Build a `useGsap` hook wrapping `gsap.context()` for React 18 cleanup, and drive every effect below with ScrollTrigger. Vary the direction of entry so the page never feels like one repeated fade-up.

**Global**
- Lenis smooth scroll (`lerp: 0.08`), wired to ScrollTrigger: `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add(t => lenis.raf(t * 1000))`.
- A thin `--gold` scroll-progress rail down the right edge, `scrub: true`.
- Page transitions: on route change, a `--ink` panel wipes up over the viewport, content swaps, panel wipes off — Motion's `AnimatePresence` with `mode="wait"`.
- A custom cursor that scales and inverts over interactive elements, with GSAP `quickTo` for lag-free follow. Disable on touch.

**Directional entrances — assign these deliberately, section by section**

| Direction | Where to use it |
|---|---|
| Up from below, staggered | Product grids, `stagger: { each: 0.06, from: 'start' }` |
| Down from above | Nav reveal on scroll-up, dropdown panels |
| In from the left | Text blocks in alternating editorial spreads |
| In from the right | The paired image in those same spreads |
| Center-out scale | Hero mark, section dividers (`scale: 0.86 → 1` with `clipPath` inset opening) |
| Radial / from a point | Lookbook thumbnails exploding from grid center, `from: 'center'` stagger |
| Rotational | Circular "SHOP NOW · SS26 · MADE IN ACCRA ·" badge, infinite rotation + scrub-linked speed |
| Horizontal pinned | The collection carousel — pin the section and translate the track on vertical scroll |
| Depth (Z) | Layered hero: background photo moves 0.3×, mid subject 0.6×, foreground type 1.2× |
| Skew on velocity | `ScrollTrigger.onUpdate` → map `self.getVelocity()` to a `skewY` on image wrappers, tweened back to 0 |

**Named set pieces**

1. **Hero** — full-bleed editorial shot. SplitText the brand name into characters; each character masks up from below on a 0.04s stagger. On scroll, the image scales 1 → 1.15 while the headline splits apart vertically (odd characters up, even down) and the viewport clip-path opens into the next section.
2. **Horizontal collection rail** — `ScrollTrigger` with `pin: true`, `scrub: 1`, `end: () => '+=' + track.scrollWidth`. Cards rotate slightly and lift as they cross viewport center.
3. **Fabric story** — pin a section, `scrub` through a sequence of wax-print swatches with `clipPath` circle wipes, while a caption column changes text via SplitText line masks.
4. **Marquee** — infinite horizontal type strip whose speed and direction are driven by scroll velocity, so it reverses when you scroll up.
5. **Sticky lookbook** — image column pinned while the copy column scrolls; images cross-fade at breakpoints via a scrubbed timeline.
6. **Founder / atelier section** — parallax portrait with a DrawSVG line that traces a kente motif as you scroll past.
7. **Footer reveal** — the footer sits behind the page; the main content slides up off it (`position: sticky` body wrapper), revealing a huge `--gold` wordmark.

**Non-negotiable guardrails**
- Wrap everything in `gsap.matchMedia()`. Under `(prefers-reduced-motion: reduce)` and on mobile, ship the same layout with opacity-only transitions and no pinning.
- Animate `transform` and `opacity` only. Never `top`, `left`, `width`, or `height`.
- `ScrollTrigger.refresh()` after fonts load and after images settle.
- Kill every timeline in the `gsap.context()` revert — no orphaned triggers on route change.

### 4. WebGL — exactly three scenes

1. **Hero fabric plane** — a subdivided plane with a custom vertex shader, simplex-noise ripple, textured with a wax-print pattern. Mouse position bends it; scroll damps the amplitude. Fixed behind the hero, `pointer-events: none`.
2. **Product 3D viewer** — for a hero garment: a GLB in `<Canvas>` with `<Stage>`, `<OrbitControls>` (damped, zoom locked), studio HDRI via `<Environment preset="studio">`, and a contact shadow. Lazy-load behind an intersection observer; show the still photo until it's ready.
3. **WebGL image transitions** — in the lookbook, a shader that displacement-maps between two images using a grayscale noise texture, `progress` driven by ScrollTrigger scrub.

Everything is `dynamic(() => ..., { ssr: false })`. Cap `dpr={[1, 2]}`. Pause the render loop when off-screen (`frameloop="demand"` or drei's `useIntersect`). If `navigator.hardwareConcurrency < 4` or WebGL is unavailable, silently fall back to static images — a Ghanaian customer on a mid-range Android must never see a blank canvas.

### 5. Pages

```
/                      Hero, featured collection, fabric story, lookbook, journal teaser, newsletter
/shop                  Filterable grid (category, size, color, price) with GSAP Flip re-layout on filter change
/shop/[slug]           Gallery, 3D viewer, size guide, fabric/care, "styled with" cross-sell, sticky add-to-cart
/collections/[slug]    Editorial collection page — full-bleed spreads, horizontal rail
/lookbook              WebGL image transitions, minimal chrome
/about                 The atelier, the tailors, the sourcing story, Accra
/journal, /journal/[slug]  Editorial posts from Sanity portable text
/cart, /checkout       Cart drawer + Paystack checkout
/order/[reference]     Order confirmation
/contact               Studio address, WhatsApp link, form
/studio                Sanity Studio (embedded, auth-gated)
```

### 6. The CMS — this is the part I must be able to run myself

I am not a developer. Building this so I can add products and change prices **without touching code or redeploying** is a hard requirement, not a nice-to-have.

Embed Sanity Studio at `/studio` via `next-sanity`. When I log in there I get a visual editor where I drag in photos, type a price, and hit Publish — the live site updates within seconds.

**Product schema**

```ts
// sanity/schemas/product.ts
defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: r => r.required() }),
    defineField({ name: 'images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }],
      validation: r => r.min(1).error('Add at least one photo') }),
    defineField({ name: 'price', title: 'Price (GHS)', type: 'number',
      description: 'Just the number, in cedis. e.g. 850',
      validation: r => r.required().positive() }),
    defineField({ name: 'compareAtPrice', title: 'Was price (GHS)', type: 'number',
      description: 'Optional. Fill this in only for a sale — it shows struck through.' }),
    defineField({ name: 'category', type: 'reference', to: [{ type: 'category' }] }),
    defineField({ name: 'variants', type: 'array', of: [{ type: 'variant' }],
      description: 'One row per size/colour, each with its own stock count' }),
    defineField({ name: 'fabric', type: 'string', description: 'e.g. 100% cotton Ankara wax print' }),
    defineField({ name: 'careInstructions', type: 'text' }),
    defineField({ name: 'description', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'model3d', title: '3D model (optional)', type: 'file',
      options: { accept: '.glb' } }),
    defineField({ name: 'status', type: 'string',
      options: { list: ['draft', 'active', 'sold out', 'archived'], layout: 'radio' },
      initialValue: 'draft' }),
    defineField({ name: 'featured', title: 'Show on homepage', type: 'boolean', initialValue: false }),
    defineField({ name: 'madeToOrder', type: 'boolean', initialValue: false,
      description: 'Tick if this is sewn after ordering — shows a 7–14 day lead time' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'price', media: 'images.0' },
    prepare: ({ title, subtitle, media }) => ({ title, subtitle: `GHS ${subtitle}`, media }),
  },
})
```

Also model: `category`, `variant` (object: size, colour, stock, optional SKU), `collection` (name, season, hero image, ordered product refs, editorial blocks), `lookbookEntry`, `journalPost`, `siteSettings` (announcement bar, socials, shipping zones, contact details).

**Wire it up so edits are instant**
- Query with GROQ from React Server Components using `next-sanity`'s `sanityFetch`.
- Tag cached queries and revalidate them from a Sanity webhook → `/api/revalidate` (`revalidateTag`), so publishing a price change updates the live site in seconds without a rebuild.
- Turn on Sanity Presentation / visual editing so I can click an element on the page and jump straight to its field.
- Prices are stored as a plain number in GHS. Format them at render time with `Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' })`. Never hardcode a price anywhere in the codebase.
- Build a "Quick price edit" view in the Studio: a list of all active products with an inline editable price column, so I can update a whole season's pricing in one screen.

Seed the dataset with 12 realistic sample products so the site looks finished on first run.

### 7. Commerce and Ghana specifics

- **Paystack** initialize/verify flow: server route creates the transaction (amount in **pesewas** — multiply cedis by 100), client opens Paystack inline, webhook at `/api/paystack/webhook` verifies the `x-paystack-signature` HMAC-SHA512 before marking the order paid. Never trust the client callback alone.
- Enable **MTN MoMo, Telecel Cash and AT Money** channels alongside cards. Show the MoMo option first — it is how most customers will pay.
- Orders write back into Sanity as `order` documents so I can see them in the Studio.
- **Shipping** from `siteSettings`: Accra (Greater Accra) flat rate, other regions flat rate, international by zone. Free delivery over a threshold I control.
- **WhatsApp Business** float button with a prefilled message — a large share of Ghanaian retail conversation happens there. Include it in the product page as "Ask about this piece".
- Sizes in both **UK/EU/US** with a measurement chart in centimetres and inches.
- Made-to-order pieces show an explicit lead time at the point of sale.

### 8. Performance — assume a mid-range Android on 3G

This site is being viewed in Accra, not on a MacBook in San Francisco. Budget:

- LCP under 2.5s on a simulated Moto G on Slow 4G. Lighthouse ≥ 90 on mobile performance and ≥ 95 accessibility.
- Total JS on the homepage under 250KB gzipped, excluding the lazily-loaded 3D chunks.
- Every image through `next/image` with an explicit `sizes`, AVIF first, `priority` only on the LCP image, and a Sanity LQIP blur placeholder.
- Self-host fonts, `font-display: swap`, subset to Latin, preload only the display weight used above the fold.
- Route-split GSAP plugins; SplitText and DrawSVG load only on the routes that use them.
- Everything must work with JavaScript disabled to the extent of: readable content, visible prices, working links.

### 9. Accessibility

- Full keyboard navigation, visible `--gold` focus rings, skip-to-content link.
- Pinned/scrubbed sections must not trap keyboard focus. Test tabbing through the horizontal rail.
- Semantic landmarks, real `<button>`/`<a>` elements, labelled form fields, alt text pulled from a required Sanity `alt` field on every image.
- Respect `prefers-reduced-motion` throughout — this is checked, not assumed.
- Colour contrast ≥ 4.5:1 for body text on every surface, including text over photography (use a scrim).

### 10. Build order

1. Next.js + TypeScript + Tailwind scaffold, brand tokens, typography scale, base layout.
2. Sanity Studio at `/studio`, all schemas, seed data, GROQ queries, webhook revalidation. **Get me editing products before any animation work.**
3. Static pages with real content and real images — correct, ugly, fast.
4. Lenis + GSAP provider, then the scroll choreography section by section.
5. Cart, Paystack, orders, emails.
6. The three WebGL scenes, lazily loaded, with fallbacks.
7. Performance pass, accessibility audit, `matchMedia` reduced-motion pass, deploy to Vercel.

### 11. Deliverables

Working code, plus a `README.md` I can actually follow that covers: every environment variable and where to get it, how to log into the Studio, **how to add a product and change a price in under two minutes**, and how to connect the Paystack live keys when we go from test to real money.

Ask me for the domain and the first six products before you start. Then build it.

---

## Notes to self

- Get a **Paystack business account** verified early — Ghanaian KYC (business registration, ID, bank details) can take a few days, and you cannot take real money until it clears.
- Photography is 70% of whether this reads as Awwwards-grade. Budget for one proper editorial shoot on location in Accra before launch. No amount of GSAP rescues weak images.
- **Check the name before you print anything.** "Fashionova" is one character
  off *Fashion Nova*, the US fast-fashion company, which holds registered
  trademarks in apparel and buys heavily on search. That means a likely dispute
  over a `.com`, and paid search you will never win. Worth ten minutes with a
  Ghanaian trademark agent before the signage and packaging are ordered —
  cheap now, expensive after launch.
- Buy the `.com` if it is clear; also park the `.com.gh`.
- Set up a Sanity account and a Vercel account with the same email before your first build session.
