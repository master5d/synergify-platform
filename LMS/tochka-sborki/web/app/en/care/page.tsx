import type { Metadata } from 'next'
import { CarePage } from '@/components/pages/care-page'
import { careCopy } from '@/lib/care'
import { pageTitle } from '@/lib/page-title'

const t = careCopy('en')

// Care desk — help with the course. Not /en/support/: that is the donation page.
export const metadata: Metadata = { title: pageTitle(t.title), description: t.lead }

export default function Page() {
  return <CarePage locale="en" />
}
