export type Currency = 'GHS'

export interface Variant {
  _key: string
  size: string
  colour: string
  stock: number
  sku?: string
}

export interface ProductImage {
  url: string
  alt: string
  /** Low-quality placeholder, base64 data URI. Sanity supplies this via LQIP. */
  lqip?: string
}

export interface Category {
  _id: string
  title: string
  slug: string
  description?: string
}

export interface Product {
  _id: string
  name: string
  slug: string
  images: ProductImage[]
  /** Whole cedis. Never store pesewas here; convert at the payment boundary. */
  price: number
  compareAtPrice?: number
  category: Category
  variants: Variant[]
  fabric: string
  careInstructions: string
  description: string
  status: 'draft' | 'active' | 'sold out' | 'archived'
  featured: boolean
  madeToOrder: boolean
  model3d?: string
}

export interface Collection {
  _id: string
  title: string
  slug: string
  season: string
  standfirst: string
  heroImage: ProductImage
  productSlugs: string[]
}

export interface LookbookEntry {
  _id: string
  title: string
  image: ProductImage
  credit?: string
}

export interface JournalPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  image: ProductImage
  body: string[]
}

export interface ShippingZone {
  _key: string
  label: string
  rate: number
}

export interface SiteSettings {
  announcement: string
  freeShippingThreshold: number
  shippingZones: ShippingZone[]
  whatsappNumber: string
  studioAddress: string
  email: string
  instagram: string
}

export interface CartLine {
  productId: string
  slug: string
  name: string
  price: number
  image: string
  size: string
  colour: string
  quantity: number
  madeToOrder: boolean
}
