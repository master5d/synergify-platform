import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'
import { COURSE } from '@/lib/course'

export const metadata: Metadata = {
  title: `Cheatsheet — ${COURSE.shortName}`,
  description: 'Quick reference for Claude Code commands and patterns',
}

export default function Page() {
  return <MdxPage name="cheatsheet" locale="en" />
}
