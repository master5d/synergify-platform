import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Cheatsheet'),
  description: 'Quick reference for Claude Code commands and patterns',
}

export default function Page() {
  return <MdxPage name="cheatsheet" locale="en" />
}
