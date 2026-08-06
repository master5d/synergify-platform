import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { TryChains } from '@/components/try-chains'

export const metadata: Metadata = {
  title: 'Попробуй до курса — Точка Сборки',
  description:
    'Шесть цепочек команд, которые доводят одно реальное дело до конца: порядок в папке, письма из таблицы, сверка выписок, разбор заметок, незнакомая тема, домашний архив. Без записи и без почты.',
}

export default function Page() {
  return (
    <>
      <Nav locale="ru" />
      <TryChains locale="ru" />
    </>
  )
}
