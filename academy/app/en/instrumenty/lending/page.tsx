import type { Metadata } from 'next'
import { LandingPage } from '../../../../components/retreat-landing/landing-page'
export const metadata: Metadata = { title: 'Retreat landing page — academy tools', description: 'Build a retreat sign-up page from your booklet.' }
export default function Page() { return <LandingPage locale="en" /> }
