import { groq } from 'next-sanity'

const imageFields = `
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  alt
`

const productFields = `
  _id,
  name,
  "slug": slug.current,
  "images": images[]{ ${imageFields} },
  price,
  compareAtPrice,
  "category": category->{ _id, title, "slug": slug.current, description },
  variants[]{ _key, size, colour, stock, sku },
  fabric,
  careInstructions,
  "description": pt::text(description),
  status,
  featured,
  madeToOrder,
  "model3d": model3d.asset->url
`

export const activeProductsQuery = groq`
  *[_type == "product" && status == "active"] | order(featured desc, name asc) {
    ${productFields}
  }
`

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] { ${productFields} }
`

export const productSlugsQuery = groq`
  *[_type == "product" && status == "active"].slug.current
`

export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id, title, "slug": slug.current, description
  }
`

export const collectionsQuery = groq`
  *[_type == "collection"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    season,
    standfirst,
    "heroImage": heroImage{ ${imageFields} },
    "productSlugs": products[]->slug.current
  }
`

export const lookbookQuery = groq`
  *[_type == "lookbookEntry"] | order(order asc) {
    _id, title, credit, "image": image{ ${imageFields} }
  }
`

export const journalQuery = groq`
  *[_type == "journalPost"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    "image": image{ ${imageFields} },
    "body": body[].children[].text
  }
`

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    announcement,
    freeShippingThreshold,
    shippingZones[]{ _key, label, rate },
    whatsappNumber,
    studioAddress,
    email,
    instagram
  }
`
