import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { SyllabusTree } from '@/components/syllabus-tree'
import { MaterialsSection } from '@/components/materials-section'
import { getAllModules } from '@/lib/content'
import { COURSE_MATERIALS } from '@/lib/materials'

export const metadata: Metadata = {
  title: 'Syllabus — Tochka Sborki',
  description: 'The full course program: modules, units, and materials.',
}

export default function Page() {
  const modules = getAllModules('en')
  return (
    <>
      <Nav locale="en" />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Syllabus</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '60ch' }}>
          The full course map — modules and units in order, plus materials and tools.
        </p>
        <SyllabusTree modules={modules} locale="en" />
        <MaterialsSection groups={COURSE_MATERIALS} locale="en" />
      </main>
    </>
  )
}
