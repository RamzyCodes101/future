/**
 * The single place the app reads content from.
 *
 * Every accessor tries Sanity first and falls back to the sample catalogue in
 * lib/seed.ts. Pages never import lib/seed.ts directly — that way connecting
 * the CMS is a matter of filling in environment variables, with no code change
 * anywhere in app/.
 */
import 'server-only'
import * as seed from './seed'
import { sanityFetch, TAGS } from './sanity'
import {
  activeProductsQuery,
  categoriesQuery,
  collectionsQuery,
  journalQuery,
  lookbookQuery,
  productBySlugQuery,
  siteSettingsQuery,
} from './queries'
import type {
  Category,
  Collection,
  JournalPost,
  LookbookEntry,
  Product,
  SiteSettings,
} from './types'

const nonEmpty = <T>(rows: T[] | null): rows is T[] => Array.isArray(rows) && rows.length > 0

export async function getProducts(): Promise<Product[]> {
  const rows = await sanityFetch<Product[]>(activeProductsQuery, {}, [TAGS.product])
  return nonEmpty(rows) ? rows : seed.products.filter((p) => p.status === 'active')
}

export async function getProduct(slug: string): Promise<Product | null> {
  const row = await sanityFetch<Product>(productBySlugQuery, { slug }, [TAGS.product])
  if (row) return row
  return seed.products.find((p) => p.slug === slug) ?? null
}

export async function getFeaturedProducts(limit = 5): Promise<Product[]> {
  const all = await getProducts()
  const featured = all.filter((p) => p.featured)
  return (featured.length > 0 ? featured : all).slice(0, limit)
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts()
  const sameCategory = all.filter(
    (p) => p.slug !== product.slug && p.category?.slug === product.category?.slug
  )
  const others = all.filter(
    (p) => p.slug !== product.slug && p.category?.slug !== product.category?.slug
  )
  return [...sameCategory, ...others].slice(0, limit)
}

export async function getCategories(): Promise<Category[]> {
  const rows = await sanityFetch<Category[]>(categoriesQuery, {}, [TAGS.product])
  return nonEmpty(rows) ? rows : seed.categories
}

export async function getCollections(): Promise<Collection[]> {
  const rows = await sanityFetch<Collection[]>(collectionsQuery, {}, [TAGS.collection])
  return nonEmpty(rows) ? rows : seed.collections
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const all = await getCollections()
  return all.find((c) => c.slug === slug) ?? null
}

export async function getLookbook(): Promise<LookbookEntry[]> {
  const rows = await sanityFetch<LookbookEntry[]>(lookbookQuery, {}, [TAGS.lookbook])
  return nonEmpty(rows) ? rows : seed.lookbook
}

export async function getJournal(): Promise<JournalPost[]> {
  const rows = await sanityFetch<JournalPost[]>(journalQuery, {}, [TAGS.journal])
  return nonEmpty(rows) ? rows : seed.journal
}

export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  const all = await getJournal()
  return all.find((p) => p.slug === slug) ?? null
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await sanityFetch<SiteSettings>(siteSettingsQuery, {}, [TAGS.settings])
  return row ?? seed.siteSettings
}

/** Sum of stock across variants — drives the "sold out" badge. */
export function inStock(product: Product): boolean {
  if (product.madeToOrder) return true
  return (product.variants ?? []).some((v) => v.stock > 0)
}
