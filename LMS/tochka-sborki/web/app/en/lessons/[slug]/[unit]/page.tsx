import type { Metadata } from 'next'
import {
  getAllModules,
  getModuleMeta,
  getUnitContent,
} from '@/lib/content'
import { UnitPage } from '@/components/pages/unit-page'

interface Props { params: Promise<{ slug: string; unit: string }> }

export async function generateStaticParams() {
  const modules = getAllModules('en')
  return modules.flatMap(m => m.units.map(u => ({ slug: m.slug, unit: u.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, unit } = await params
  const { unitMeta } = getUnitContent(slug, unit, 'en')
  const moduleMeta = getModuleMeta(slug, 'en')
  return {
    title: `${unitMeta.title} — ${moduleMeta.title} — Tochka Sborki`,
    description: moduleMeta.description,
  }
}

export default async function Page({ params }: Props) {
  const { slug, unit } = await params
  return <UnitPage moduleSlug={slug} unitSlug={unit} locale="en" />
}
