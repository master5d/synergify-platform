import type { Metadata } from 'next'
import { BookletPage } from '../../../../components/retreat-booklet/booklet-page'
export const metadata: Metadata = { title: 'Retreat booklet — academy tools', description: 'Build a clear retreat booklet in your browser.' }
export default function Page() { return <BookletPage locale="en" /> }
