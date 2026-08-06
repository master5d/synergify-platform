import Link from 'next/link'
import type { Locale } from '@/lib/dictionaries'
import { resolveSpeedreadingCourse } from '@/lib/speedreading/course'
import { writtenSpeedreadingSlugs } from '@/lib/speedreading/lessons'

export function SpeedreadingSyllabus({ locale }: { locale: Locale }) {
  const c = resolveSpeedreadingCourse(locale)
  const written = new Set(writtenSpeedreadingSlugs())
  const base = locale === 'en' ? '/en/speedreading/' : '/speedreading/'
  const badge = locale === 'en' ? 'in preparation' : 'готовится'
  const allWritten = c.lessons.every((l) => written.has(l.slug))
  const intro = allWritten
    ? (locale === 'en' ? 'Six lessons and three trainers — all of it works now.' : 'Шесть уроков и три тренажёра — всё уже работает.')
    : (locale === 'en'
      ? 'The trainers below work right now. The lessons are still being written — here is the shape they will take.'
      : 'Тренажёры ниже уже работают. Уроки ещё пишутся — вот структура, которую они примут.')
  return (
    <section style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)', marginBottom: '2.5rem' }}>
      <h1 style={{ margin: '0 0 .5rem', fontSize: '1.4rem', color: 'var(--text-primary)' }}>{c.title}</h1>
      <p style={{ margin: '0 0 1rem', fontSize: '.95rem', lineHeight: 1.55, color: 'var(--text-primary)', borderLeft: '3px solid var(--text-accent)', paddingLeft: '.8rem' }}>{c.tagline}</p>
      <p style={{ margin: '0 0 1.25rem', fontSize: '.85rem', color: 'var(--text-secondary)' }}>{intro}</p>
      <ol style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '.7rem' }}>
        {c.lessons.map((l) => (
          <li key={l.slug} style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {written.has(l.slug)
              ? <Link href={`${base}${l.slug}/`} style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}>{l.title}</Link>
              : <>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{l.title}</span>
                  <span style={{ marginLeft: '.5rem', fontFamily: 'var(--font-mono)', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-accent)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '.05rem .4rem' }}>{badge}</span>
                </>}
            <div>{l.objective}</div>
          </li>
        ))}
      </ol>
    </section>
  )
}
