import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getJournal, getJournalPost } from '@/lib/catalogue'
import { SplitHeading } from '@/components/anim/SplitHeading'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getJournal()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await getJournalPost(slug)
  if (!post) return { title: 'Not found' }
  return { title: post.title, description: post.excerpt }
}

export default async function JournalPostPage({ params }: Params) {
  const { slug } = await params
  const post = await getJournalPost(slug)
  if (!post) notFound()

  return (
    <article className="pb-24">
      <header className="gutter pb-12 pt-20">
        <Link href="/journal" className="label link-underline mb-10 block text-taupe">
          ← Journal
        </Link>
        <span className="label mb-6 block text-champagne-dim">
          {new Date(post.publishedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <SplitHeading as="h1" mode="lines" className="text-hero max-w-4xl">
          {post.title}
        </SplitHeading>
      </header>

      <div className="relative aspect-16/9 w-full" data-anim="scale">
        <Image
          src={post.image.url}
          alt={post.image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="gutter mx-auto max-w-2xl pt-16">
        {post.body.map((paragraph, i) => (
          <p key={i} className="mb-6 text-lg leading-relaxed text-graphite" data-anim="up">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  )
}
