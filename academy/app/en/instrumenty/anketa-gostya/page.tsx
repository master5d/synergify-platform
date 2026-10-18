import type { Metadata } from 'next'
import { GuestFormPage } from '../../../../components/retreat-guest-form/guest-form-page'

export const metadata: Metadata = {
  title: 'Retreat guest form — academy tools',
  description: 'A guest form from ready-made questions for Google Forms, Typeform or an email, and an answers summary: diets for the chef, the arrival list, what matters on site. Answers are read in your browser and go nowhere.',
}

export default function Page() {
  return <GuestFormPage locale="en" />
}
