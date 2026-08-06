import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/nav'
import { LessonProse } from '@/components/lesson-prose'
import { resolveSpeedreadingCourse } from '@/lib/speedreading/course'
import { getSpeedreadingProse, writtenSpeedreadingSlugs } from '@/lib/speedreading/lessons'

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
  const course = resolveSpeedreadingCourse('en')
  const idx = course.lessons.findIndex((l) => l.slug === slug)
  const lesson = course.lessons[idx]
  const body = lesson ? getSpeedreadingProse(slug, 'en') : null
  if (!lesson || !body) notFound()

  return (
    <>
      <Nav locale="en" />
      <LessonProse
        locale="en"
        courseTitle={course.title}
        courseHref="/en/speedreading/"
        title={lesson.title}
        objective={lesson.objective}
        body={body}
        prev={course.lessons[idx - 1]}
        next={course.lessons[idx + 1]}
      />
    </>
  )
}
