import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Exercises'),
  description: '8 practical exercises',
}

export default function Page() {
  return <MdxPage name="exercises" locale="en" />
}
