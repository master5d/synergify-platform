import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Упражнения'),
  description: '8 практических упражнений',
}

export default function Page() {
  return <MdxPage name="exercises" locale="ru" />
}
