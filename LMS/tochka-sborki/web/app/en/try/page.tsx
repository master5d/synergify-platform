import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { TryChains } from '@/components/try-chains'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Try it before the course'),
  description:
    'Six chains of instructions that carry one real task to the end: a folder you can search, letters from a spreadsheet, reconciled exports, a pile of notes, an unfamiliar subject, the household archive. No signup, no email.',
}

export default function Page() {
  return (
    <>
      <Nav locale="en" />
      <TryChains locale="en" />
    </>
  )
}
