import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { COURSE } from '@/lib/course'

export const metadata: Metadata = {
  title: `Exercises — ${COURSE.shortName}`,
  description: '8 practical exercises',
}

export default function Page() {
  return <MdxPage name="exercises" locale="en" />
}
