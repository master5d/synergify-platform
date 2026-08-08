import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { NotebookPack } from '@/components/notebook-pack'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Notebook pack'),
  description:
    'An open pack for a source-grounded notebook: what to upload, which prompts to use, and how to verify answers through quoted sources.',
}

export default function Page() {
  return (
    <>
      <Nav locale="en" />
      <NotebookPack locale="en" />
    </>
  )
}
