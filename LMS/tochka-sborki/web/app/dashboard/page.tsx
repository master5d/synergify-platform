// web/app/dashboard/page.tsx
import { getAllModules } from '@/lib/content'
import { DashboardClient } from './dashboard-client'

export default function Page() {
  const mods = getAllModules('ru')
  const modules = Object.fromEntries(mods.map(m => [m.slug, { title: m.title, duration: m.duration }]))
  const unitsByModule = Object.fromEntries(mods.map(m => [m.slug, m.units]))
  return <DashboardClient modules={modules} unitsByModule={unitsByModule} locale="ru" />
}
