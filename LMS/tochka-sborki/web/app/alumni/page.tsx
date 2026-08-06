import type { Metadata } from 'next'
import { AlumniClient } from '@/components/alumni-client'

export const metadata: Metadata = {
  title: 'Синергемы — Точка Сборки',
  description: 'Opt-in кластеры соучеников по общему интересу и усилию.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AlumniClient locale="ru" />
}
