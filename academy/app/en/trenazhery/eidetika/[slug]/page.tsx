import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EideticsLessonPage } from '../../../../../components/eidetics/eidetics-lesson-page'
import { eideticsRobots, resolveEideticsCourse } from '../../../../../lib/eidetics/course'
import { getEideticsProse, writtenEideticsSlugs } from '../../../../../lib/eidetics/lessons'

export function generateStaticParams() {
  return writtenEideticsSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const lesson = resolveEideticsCourse('en').lessons.find((l) => l.slug === slug)
  if (!lesson) return {}
  return { title: `${lesson.title} — Eidetics`, description: lesson.objective, robots: eideticsRobots() }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!getEideticsProse(slug, 'en')) notFound()
  return <EideticsLessonPage locale="en" slug={slug} />
}
