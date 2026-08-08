import type { Metadata } from 'next'
import { AlumniClient } from '@/components/alumni-client'
import { COURSE } from '@/lib/course'

export const metadata: Metadata = {
  title: `Synergems — ${COURSE.shortName}`,
  description: 'Opt-in clusters of fellow learners by shared interest and effort.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AlumniClient locale="en" />
}
