import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { StarterGuide } from '@/components/starter-guide'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Student starter'),
  description:
    'A ready course project for any agent — Claude Code, Codex, Antigravity, Hermes: an AGENTS.md rules file, memory between sessions, a practice folder, templates and a hygiene checklist. Three steps: download, open in your agent, first command.',
}

export default function Page() {
  return (
    <>
      <Nav locale="en" />
      <StarterGuide locale="en" />
    </>
  )
}
