import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/nav'
import { LessonProse } from '@/components/lesson-prose'
import { resolveSpeechCourse } from '@/lib/speech/course'
import { getSpeechProse, writtenSpeechSlugs } from '@/lib/speech/lessons'

export function generateStaticParams() {
  return writtenSpeechSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const lesson = resolveSpeechCourse('en').lessons.find((l) => l.slug === slug)
  if (!lesson) return {}
  return { title: `${lesson.title} — The Art of Speaking`, description: lesson.objective }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = resolveSpeechCourse('en')
  const idx = course.lessons.findIndex((l) => l.slug === slug)
  const lesson = course.lessons[idx]
  const body = lesson ? getSpeechProse(slug, 'en') : null
  if (!lesson || !body) notFound()

  return (
    <>
      <Nav locale="en" />
      <LessonProse
        locale="en"
        courseTitle={course.title}
        courseHref="/en/speech/"
        title={lesson.title}
        objective={lesson.objective}
        body={body}
        prev={course.lessons[idx - 1]}
        next={course.lessons[idx + 1]}
      />
    </>
  )
}
