import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { NotebookPack } from '@/components/notebook-pack'

export const metadata: Metadata = {
  title: 'Пакет тетрадки — Точка Сборки',
  description:
    'Открытый пакет для source-grounded тетрадки: что загрузить, какие промпты дать и как проверить ответы цитатами в источниках.',
}

export default function Page() {
  return (
    <>
      <Nav locale="ru" />
      <NotebookPack locale="ru" />
    </>
  )
}
