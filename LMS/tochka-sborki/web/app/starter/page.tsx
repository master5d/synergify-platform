import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { StarterGuide } from '@/components/starter-guide'
import { pageTitle } from '@/lib/page-title'

export const metadata: Metadata = {
  title: pageTitle('Стартер студента'),
  description:
    'Готовый проект для курса с любым агентом — Claude Code, Codex, Antigravity, Hermes: файл правил AGENTS.md, память между сессиями, папка для практик, шаблоны и чек-лист гигиены. Три шага: скачай, открой в агенте, первая команда.',
}

export default function Page() {
  return (
    <>
      <Nav locale="ru" />
      <StarterGuide locale="ru" />
    </>
  )
}
