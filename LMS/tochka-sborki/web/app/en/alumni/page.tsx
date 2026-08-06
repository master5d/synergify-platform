import type { Metadata } from 'next'
import { AlumniClient } from '@/components/alumni-client'

export const metadata: Metadata = {
  title: 'Synergems — Tochka Sborki',
  description: 'Opt-in clusters of fellow learners by shared interest and effort.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AlumniClient locale="en" />
}
