// web/app/dungeon/page.tsx
import { getAllModules } from '@/lib/content'
import { DungeonClient } from './dungeon-client'

export default function Page() {
  const moduleTitles = Object.fromEntries(getAllModules('ru').map(m => [m.slug, m.title]))
  return <DungeonClient moduleTitles={moduleTitles} locale="ru" />
}
