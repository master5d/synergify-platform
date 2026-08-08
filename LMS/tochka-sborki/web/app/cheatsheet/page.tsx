import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Шпаргалка'),
  description: 'Быстрая справка по командам и паттернам Claude Code',
}

export default function Page() {
  return <MdxPage name="cheatsheet" locale="ru" />
}
