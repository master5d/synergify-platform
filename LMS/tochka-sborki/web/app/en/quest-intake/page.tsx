import { Nav } from '@/components/nav'
import { IntakeWizard } from '@/components/intake/intake-wizard'
import { EntryFrame } from '@/components/entry-frame'
import { getAllModules } from '@/lib/content'
export default function Page() {
  const moduleTitles = Object.fromEntries(getAllModules('en').map(m => [m.slug, m.title]))
  return (<><Nav locale="en" /><EntryFrame locale="en" style={{ margin: '2rem auto 0', width: 'calc(100% - 2.5rem)' }} /><IntakeWizard locale="en" moduleTitles={moduleTitles} /></>)
}
