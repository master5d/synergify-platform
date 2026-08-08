import type { Metadata } from 'next'
import {
  getAllLessons,
  getAllModules,
  getLessonBySlug,
  getModuleMeta,
  isModule,
} from '@/lib/content'
import { ModulePage } from '@/components/pages/module-page'
import { COURSE } from '@/lib/course'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const lessons = getAllLessons('en')
  const modules = getAllModules('en')
  return [
    ...lessons.map(l => ({ slug: l.slug })),
    ...modules.map(m => ({ slug: m.slug })),
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (isModule(slug, 'en')) {
    const meta = getModuleMeta(slug, 'en')
    return { title: `${meta.title} — ${COURSE.shortName}`, description: meta.description }
  }
  const { meta } = getLessonBySlug(slug, 'en')
  return { title: `${meta.title} — ${COURSE.shortName}`, description: meta.description }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  return <ModulePage slug={slug} locale="en" />
}
