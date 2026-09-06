import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="gutter flex min-h-[70svh] flex-col items-center justify-center text-center">
      <p className="label mb-6 text-champagne-dim">404</p>
      <h1 className="text-hero mb-8">This piece has gone</h1>
      <p className="mb-10 max-w-md text-graphite">
        When a cloth runs out, the piece goes with it. Have a look at what is on the rail now.
      </p>
      <Link href="/shop" className="label link-underline">
        Back to the collection
      </Link>
    </div>
  )
}
