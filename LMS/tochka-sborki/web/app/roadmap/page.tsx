import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Дорожная карта'),
  description: 'Карта пути от нонкодера до AI-generalist\'а — 7 элективных тем',
}

export default function Page() {
  return <MdxPage name="roadmap" locale="ru" />
}
