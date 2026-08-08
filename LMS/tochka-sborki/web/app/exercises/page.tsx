import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { COURSE } from '@/lib/course'

export const metadata: Metadata = {
  title: `Упражнения — ${COURSE.shortName}`,
  description: '8 практических упражнений',
}

export default function Page() {
  return <MdxPage name="exercises" locale="ru" />
}
