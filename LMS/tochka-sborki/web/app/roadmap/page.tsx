import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'

export const metadata: Metadata = {
  title: 'Roadmap — Точка Сборки',
  description: 'Карта пути от нонкодера до AI-generalist\'а — 7 элективных тем',
}

export default function Page() {
  return <MdxPage name="roadmap" locale="ru" />
}
