import type { Metadata } from 'next'
import { ProgramPage } from '../../../../components/retreat-program/program-page'
export const metadata: Metadata = { title: 'Retreat program builder — academy tools', description: 'A 30-minute grid of retreat days from your own practice registry: load, free time, touch and promises checked, CSV and print. Runs in your browser; data goes nowhere.' }
export default function Page() { return <ProgramPage locale="en" /> }
