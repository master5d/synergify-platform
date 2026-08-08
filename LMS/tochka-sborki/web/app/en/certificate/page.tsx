import type { Metadata } from 'next'
import { CertificatePage } from '@/components/pages/certificate-page'
import { COURSE } from '@/lib/course'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Certificate'),
  description: 'Certificate of completion for the vibe-coding course',
  openGraph: {
    title: `${COURSE.shortName} — Certificate`,
    description: 'Vibe coding is the new basic literacy',
    type: 'website',
  },
}

export default function Page() {
  return <CertificatePage locale="en" />
}
