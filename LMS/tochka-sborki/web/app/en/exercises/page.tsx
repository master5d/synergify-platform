import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'

export const metadata: Metadata = {
  title: 'Exercises — Tochka Sborki',
  description: '8 practical exercises',
}

export default function Page() {
  return <MdxPage name="exercises" locale="en" />
}
