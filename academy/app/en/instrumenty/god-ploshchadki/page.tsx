import type { Metadata } from 'next'
import { VenuePage } from '../../../../components/retreat-venue/venue-page'
export const metadata: Metadata = { title: 'Retreat venue year — academy tools', description: 'A venue’s year by month: retreat weeks against nightly letting, occupancy, monthly and yearly result, project and equity payback. For all-season venues and seasonal glamping. Runs in your browser.' }
export default function Page() { return <VenuePage locale="en" /> }
