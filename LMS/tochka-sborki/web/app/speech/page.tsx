import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { SpeechSyllabus } from '@/components/speech-syllabus'

export const metadata: Metadata = {
  title: 'Ораторское мастерство — Точка Сборки',
  description: 'Шесть уроков ораторского мастерства: подготовка, структура, приёмы, голос, запоминание, работа с залом. Служа, а не манипулируя.',
}

export default function Page() {
  return (
    <>
      <Nav locale="ru" />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <SpeechSyllabus locale="ru" />
      </main>
    </>
  )
}
