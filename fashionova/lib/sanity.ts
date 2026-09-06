import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, projectId, sanityEnabled } from '@/sanity/env'

/**
 * The read client. Null when no project is configured, which is the signal
 * every accessor in lib/catalogue.ts uses to fall back to the sample data.
 */
export const client: SanityClient | null = sanityEnabled
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // Published content only, served from the CDN. Freshness comes from
      // tag revalidation in /api/revalidate, not from bypassing the cache.
      useCdn: true,
      perspective: 'published',
    })
  : null

const builder = client ? imageUrlBuilder(client) : null

export function urlFor(source: SanityImageSource, width = 1200) {
  if (!builder) return ''
  return builder.image(source).width(width).auto('format').fit('max').url()
}

/** Cache tags, so a webhook can invalidate exactly what changed. */
export const TAGS = {
  product: 'product',
  collection: 'collection',
  lookbook: 'lookbook',
  journal: 'journal',
  settings: 'settings',
} as const

export type CacheTag = (typeof TAGS)[keyof typeof TAGS]

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: CacheTag[] = []
): Promise<T | null> {
  if (!client) return null
  try {
    return await client.fetch<T>(query, params, {
      next: { tags, revalidate: 3600 },
    })
  } catch (error) {
    // A CMS outage should degrade to sample content, not a 500. The page still
    // renders; the error is visible in the server logs.
    console.error('[sanity] query failed, falling back to sample data:', error)
    return null
  }
}
