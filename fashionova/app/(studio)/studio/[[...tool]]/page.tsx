import Link from 'next/link'
import '@/app/(site)/globals.css'
import { sanityEnabled } from '@/sanity/env'
import { StudioClient } from './StudioClient'

export const dynamic = 'force-static'
export const metadata = { title: 'Studio', robots: { index: false, follow: false } }

/**
 * The Studio is only mounted when a Sanity project is configured — otherwise
 * `next build` would fail on a missing project id, and someone setting the
 * site up for the first time would hit a stack trace instead of instructions.
 */
export default function StudioPage() {
  if (!sanityEnabled) {
    return (
      <div className="gutter mx-auto max-w-xl py-24">
        <span className="label mb-6 block text-champagne-dim">Setup</span>
        <h1 className="text-section mb-8">Connect your content Studio</h1>
        <p className="mb-6 text-graphite">
          This is where you will add products and change prices. It needs a free Sanity project
          first — about five minutes, once.
        </p>
        <ol className="mb-10 space-y-4 text-graphite">
          <li>
            1. Go to <span className="text-ink">sanity.io/manage</span> and create a project.
          </li>
          <li>
            2. Copy the project ID into <code className="text-ink">.env.local</code> as{' '}
            <code className="text-ink">NEXT_PUBLIC_SANITY_PROJECT_ID</code>.
          </li>
          <li>3. Restart the site. This page becomes your Studio.</li>
        </ol>
        <p className="text-sm text-taupe">
          Until then the site runs on the built-in sample collection, so everything else works.
        </p>
        <Link href="/" className="label link-underline mt-10 block">
          Back to the site
        </Link>
      </div>
    )
  }

  return <StudioClient />
}
