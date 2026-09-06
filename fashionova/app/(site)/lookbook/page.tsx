import type { Metadata } from 'next'
import { getLookbook } from '@/lib/catalogue'
import { LookbookViewer } from '@/components/site/LookbookViewer'

export const metadata: Metadata = {
  title: 'Lookbook',
  description: 'Harmattan SS26, photographed across Accra — Jamestown, Labadi, Makola, Aburi.',
}

export default async function LookbookPage() {
  const entries = await getLookbook()

  return (
    <>
      <h1 className="sr-only">Lookbook — Harmattan SS26</h1>
      <LookbookViewer entries={entries} />
    </>
  )
}
