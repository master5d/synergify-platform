import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { COURSE } from '@/lib/course'

export const metadata: Metadata = {
  title: `Шпаргалка — ${COURSE.shortName}`,
  description: 'Быстрая справка по командам и паттернам Claude Code',
}

export default function Page() {
  return <MdxPage name="cheatsheet" locale="ru" />
}
