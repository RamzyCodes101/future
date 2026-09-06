import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { TAGS } from '@/lib/sanity'

/**
 * Called by a Sanity webhook whenever a document is published.
 *
 * This is what makes a price change appear on the live site in seconds
 * without a rebuild — the whole reason the brand owner can run this alone.
 */
const TYPE_TO_TAG: Record<string, string> = {
  product: TAGS.product,
  category: TAGS.product,
  collection: TAGS.collection,
  lookbookEntry: TAGS.lookbook,
  journalPost: TAGS.journal,
  siteSettings: TAGS.settings,
}

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 })

  // Sanity sends the shared secret as a bearer token on the webhook.
  const provided = request.headers.get('authorization')?.replace('Bearer ', '')
  if (provided !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { _type?: string }
  const tag = body._type ? TYPE_TO_TAG[body._type] : undefined

  if (!tag) {
    return NextResponse.json({ revalidated: false, reason: 'unknown type' })
  }

  // 'max' expires the tag immediately for subsequent requests — a published
  // price should be live on the next page view, not on the next hour.
  revalidateTag(tag, 'max')
  return NextResponse.json({ revalidated: true, tag, at: Date.now() })
}
