import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SpeedreadingLessonPage } from '../../../../components/speedreading/speedreading-lesson-page'
import { resolveSpeedreadingCourse } from '../../../../lib/speedreading/course'
import { getSpeedreadingProse, writtenSpeedreadingSlugs } from '../../../../lib/speedreading/lessons'

export function generateStaticParams() {
  return writtenSpeedreadingSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const lesson = resolveSpeedreadingCourse('en').lessons.find((l) => l.slug === slug)
  if (!lesson) return {}
  return { title: `${lesson.title} — Speed Reading`, description: lesson.objective }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!getSpeedreadingProse(slug, 'en')) notFound()
  return <SpeedreadingLessonPage locale="en" slug={slug} />
}
