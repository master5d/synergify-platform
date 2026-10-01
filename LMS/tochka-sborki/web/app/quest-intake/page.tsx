import { Nav } from '@/components/nav'
import { IntakeWizard } from '@/components/intake/intake-wizard'
import { EntryFrame } from '@/components/entry-frame'
import { getAllModules } from '@/lib/content'
export default function Page() {
  const moduleTitles = Object.fromEntries(getAllModules('ru').map(m => [m.slug, m.title]))
  return (<><Nav locale="ru" /><EntryFrame locale="ru" style={{ margin: '2rem auto 0', width: 'calc(100% - 2.5rem)' }} /><IntakeWizard locale="ru" moduleTitles={moduleTitles} /></>)
}
