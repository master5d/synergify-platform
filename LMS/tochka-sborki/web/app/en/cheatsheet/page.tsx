import type { Metadata } from 'next'
import { MdxPage } from '@/components/pages/mdx-page'

export const metadata: Metadata = {
  title: 'Cheatsheet — Tochka Sborki',
  description: 'Quick reference for Claude Code commands and patterns',
}

export default function Page() {
  return <MdxPage name="cheatsheet" locale="en" />
}
