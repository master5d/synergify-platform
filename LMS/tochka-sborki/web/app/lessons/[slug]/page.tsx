import type { Metadata } from 'next'
import {
  getAllLessons,
  getAllModules,
  getLessonBySlug,
  getModuleMeta,
  isModule,
} from '@/lib/content'
import { ModulePage } from '@/components/pages/module-page'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const lessons = getAllLessons('ru')
  const modules = getAllModules('ru')
  return [
    ...lessons.map(l => ({ slug: l.slug })),
    ...modules.map(m => ({ slug: m.slug })),
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (isModule(slug, 'ru')) {
    const meta = getModuleMeta(slug, 'ru')
    return { title: `${meta.title} — Точка Сборки`, description: meta.description }
  }
  const { meta } = getLessonBySlug(slug, 'ru')
  return { title: `${meta.title} — Точка Сборки`, description: meta.description }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  return <ModulePage slug={slug} locale="ru" />
}
