import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { SyllabusTree } from '@/components/syllabus-tree'
import { MaterialsSection } from '@/components/materials-section'
import { getAllModules } from '@/lib/content'
import { COURSE_MATERIALS } from '@/lib/materials'

export const metadata: Metadata = {
  title: 'Программа — Точка Сборки',
  description: 'Полная программа курса: модули, юниты и материалы.',
}

export default function Page() {
  const modules = getAllModules('ru')
  return (
    <>
      <Nav locale="ru" />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Программа</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '60ch' }}>
          Полная карта курса — модули и юниты по порядку, плюс материалы и инструменты.
        </p>
        <SyllabusTree modules={modules} locale="ru" />
        <MaterialsSection groups={COURSE_MATERIALS} locale="ru" />
      </main>
    </>
  )
}
