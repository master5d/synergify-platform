import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'

export const metadata: Metadata = {
  title: 'Упражнения — Точка Сборки',
  description: '8 практических упражнений',
}

export default function Page() {
  return <MdxPage name="exercises" locale="ru" />
}
