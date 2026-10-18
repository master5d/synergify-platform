import type { Metadata } from 'next'
import { MenuPage } from '../../../components/retreat-menu/menu-page'

export const metadata: Metadata = {
  title: 'Генератор меню ретрита — инструменты академии',
  description: 'Меню на все дни ретрита: цена на гостя и на группу, опции за доплату отдельно, проверка диет и аллергенов, CSV для шефа. Считается в браузере, данные никуда не уходят.',
}

export default function Page() {
  return <MenuPage locale="ru" />
}
