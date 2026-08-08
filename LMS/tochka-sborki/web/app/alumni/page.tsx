import type { Metadata } from 'next'
import { AlumniClient } from '@/components/alumni-client'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Синергемы'),
  description: 'Opt-in кластеры соучеников по общему интересу и усилию.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AlumniClient locale="ru" />
}
