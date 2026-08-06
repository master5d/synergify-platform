import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import type { Locale } from '@/lib/dictionaries'

/**
 * Рендер прозы урока изолированных курсов (скорочтение / речь).
 * Проза лежит строкой в lib/<course>/lessons.ts, а не в content/{locale}/ —
 * иначе сканеры AI-курса (getAllLessons/MODULE_SLUGS) подхватят чужие уроки.
 * Markdown гоняем тем же MDXRemote, что и остальной контент курса.
 */
export function LessonProse({
  locale,
  courseTitle,
  courseHref,
  title,
  objective,
  body,
  prev,
  next,
}: {
  locale: Locale
  courseTitle: string
  courseHref: string
  title: string
  objective: string
  body: string
  prev?: { slug: string; title: string }
  next?: { slug: string; title: string }
}) {
  const backLabel = locale === 'en' ? `← ${courseTitle}` : `← ${courseTitle}`
  return (
    <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <p style={{ margin: 0 }}>
        <Link href={courseHref} style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', color: 'var(--text-accent)', textDecoration: 'none' }}>
          {backLabel}
        </Link>
      </p>
      <h1 style={{ margin: '.75rem 0 .35rem', fontSize: '1.6rem', color: 'var(--text-primary)' }}>{title}</h1>
      {/* Цель урока — врезка в традиции цитаты: тонкая линия слева, приглушённый
          акцент. Толстая цветная полоса здесь спорила с заголовком за внимание. */}
      <p style={{ margin: '0 0 1.75rem', fontSize: '.95rem', lineHeight: 1.55, color: 'var(--text-secondary)', borderLeft: '2px solid var(--border-accent)', paddingLeft: '.9rem' }}>
        {objective}
      </p>

      <article className="lesson-prose">
        <MDXRemote source={body} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </article>

      <nav style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '3rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '.85rem' }}>
        <span>
          {prev && (
            <Link href={`${courseHref}${prev.slug}/`} style={{ color: 'var(--text-accent)', textDecoration: 'none' }}>
              ← {prev.title}
            </Link>
          )}
        </span>
        <span style={{ textAlign: 'right' }}>
          {next && (
            <Link href={`${courseHref}${next.slug}/`} style={{ color: 'var(--text-accent)', textDecoration: 'none' }}>
              {next.title} →
            </Link>
          )}
        </span>
      </nav>
    </main>
  )
}
