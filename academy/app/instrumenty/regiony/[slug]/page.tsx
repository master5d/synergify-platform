import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GuidePage } from '../../../../components/retreat-regions/guide-page'
import { GUIDES, guideBySlug } from '../../../../lib/retreat-regions/regions'

export function generateStaticParams() { return GUIDES.map((g) => ({ slug: g.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = guideBySlug(slug)
  if (!guide) return {}
  return { title: `${guide.name.ru} — регионы ретритов` }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = guideBySlug(slug)
  if (!guide) notFound()
  return <GuidePage locale="ru" guide={guide} buildDate={new Date().toISOString().slice(0, 10)} />
}
