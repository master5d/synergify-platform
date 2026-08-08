import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { COURSE } from '@/lib/course'

export const metadata: Metadata = {
  title: `Roadmap — ${COURSE.shortName}`,
  description: 'Карта пути от нонкодера до AI-generalist\'а — 7 элективных тем',
}

export default function Page() {
  return <MdxPage name="roadmap" locale="ru" />
}
