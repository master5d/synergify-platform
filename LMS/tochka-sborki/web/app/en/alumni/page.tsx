import type { Metadata } from 'next'
import { AlumniClient } from '@/components/alumni-client'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Synergems'),
  description: 'Opt-in clusters of fellow learners by shared interest and effort.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AlumniClient locale="en" />
}
