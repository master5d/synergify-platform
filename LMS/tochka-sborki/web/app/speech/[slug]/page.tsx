import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/nav'
import { LessonProse } from '@/components/lesson-prose'
import { resolveSpeechCourse } from '@/lib/speech/course'
import { getSpeechProse, writtenSpeechSlugs } from '@/lib/speech/lessons'

// Страницы существуют ТОЛЬКО у написанных уроков: ненаписанный slug → 404,
// а не пустая страница-обманка.
export function generateStaticParams() {
  return writtenSpeechSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const lesson = resolveSpeechCourse('ru').lessons.find((l) => l.slug === slug)
  if (!lesson) return {}
  return { title: `${lesson.title} — Ораторское мастерство`, description: lesson.objective }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = resolveSpeechCourse('ru')
  const idx = course.lessons.findIndex((l) => l.slug === slug)
  const lesson = course.lessons[idx]
  const body = lesson ? getSpeechProse(slug, 'ru') : null
  if (!lesson || !body) notFound()

  return (
    <>
      <Nav locale="ru" />
      <LessonProse
        locale="ru"
        courseTitle={course.title}
        courseHref="/speech/"
        title={lesson.title}
        objective={lesson.objective}
        body={body}
        prev={course.lessons[idx - 1]}
        next={course.lessons[idx + 1]}
      />
    </>
  )
}
