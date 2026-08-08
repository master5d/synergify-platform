import type { Metadata } from 'next'
import { AlumniClient } from '@/components/alumni-client'
import { COURSE } from '@/lib/course'

export const metadata: Metadata = {
  title: `Синергемы — ${COURSE.shortName}`,
  description: 'Opt-in кластеры соучеников по общему интересу и усилию.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AlumniClient locale="ru" />
}
