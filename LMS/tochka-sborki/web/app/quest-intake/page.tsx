import { Nav } from '@/components/nav'
import { IntakeWizard } from '@/components/intake/intake-wizard'
import { EntryFrame } from '@/components/entry-frame'
export default function Page() { return (<><Nav locale="ru" /><EntryFrame locale="ru" style={{ margin: '2rem auto 0', width: 'calc(100% - 2.5rem)' }} /><IntakeWizard locale="ru" /></>) }
