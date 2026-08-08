import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Roadmap'),
  description: 'A path from non-coder to AI generalist — 7 elective topics',
}

export default function Page() {
  return <MdxPage name="roadmap" locale="en" />
}
