// web/app/en/dungeon/page.tsx
import { getAllModules } from '@/lib/content'
import { DungeonClient } from '../../dungeon/dungeon-client'

export default function Page() {
  const moduleTitles = Object.fromEntries(getAllModules('en').map(m => [m.slug, m.title]))
  return <DungeonClient moduleTitles={moduleTitles} locale="en" />
}
