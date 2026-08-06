import { getAllModules } from '@/lib/content'
import { ProfileClient } from '@/app/character/profile-client'

export default function Page() {
  const mods = getAllModules('en')
  const modules = Object.fromEntries(mods.map(m => [m.slug, { title: m.title, duration: m.duration }]))
  const unitsByModule = Object.fromEntries(mods.map(m => [m.slug, m.units]))
  return <ProfileClient modules={modules} unitsByModule={unitsByModule} locale="en" />
}
