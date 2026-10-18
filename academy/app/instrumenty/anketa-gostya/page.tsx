import type { Metadata } from 'next'
import { GuestFormPage } from '../../../components/retreat-guest-form/guest-form-page'

export const metadata: Metadata = {
  title: 'Анкета гостя ретрита — инструменты академии',
  description: 'Анкета гостя из готовых вопросов для Google Forms, Typeform или письма и сводка ответов: диеты для шефа, лист прибытия, что важно знать на месте. Ответы разбираются в браузере и никуда не уходят.',
}

export default function Page() {
  return <GuestFormPage locale="ru" />
}
