import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'

export const metadata: Metadata = {
  title: 'Шпаргалка — Точка Сборки',
  description: 'Быстрая справка по командам и паттернам Claude Code',
}

export default function Page() {
  return <MdxPage name="cheatsheet" locale="ru" />
}
