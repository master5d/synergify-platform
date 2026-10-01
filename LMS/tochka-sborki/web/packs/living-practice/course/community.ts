// packs/living-practice/course/community.ts
// Слой сообщества (intake LMS#13, spec docs/superpowers/specs/2026-09-28-community-layer.md).
// Место встречи — чат академии «Мастерская Перехода», тема «Тишина» (решение владельца 2026-09-14,
// тема открыта владельцем: t.me/kundaliniRUs/7823; та же ссылка — в u8, FAQ и экосистеме).
// moduleTopics пуст НАМЕРЕННО: единственный модуль заканчивается u8, который сам ведёт в тему с
// оговорками, а «покажи результат практики» здесь неуместно — в теме не разбирают чужой опыт.
// Ссылка курса здесь и в workers/src/lib/community.ts сверяется тестом воркера.
import type { CommunityData } from '@/lib/community-types'

export const COMMUNITY: CommunityData = {
  enabled: true,
  groupUrl: 'https://t.me/kundaliniRUs',
  courseTopicUrl: 'https://t.me/kundaliniRUs/7823',
  moduleTopics: {},
  recordings: {},
  copy: {
    heading: { ru: 'Где найти людей для круга', en: 'Where to find people for a circle' },
    intro: {
      ru: 'Практике внимания нужны другие люди. У академии есть место, где их можно найти: тема «Тишина» в Telegram-чате «Мастерская Перехода». Вход — по ссылке, сам; платформа туда твоих данных не передаёт.',
      en: 'A practice of attention needs other people. The academy has a place to find them: the «Тишина» topic in the Telegram chat "Мастерская Перехода". You join by the link yourself; the platform passes none of your data there.',
    },
    cta: { ru: 'Открыть тему «Тишина»', en: 'Open the «Тишина» topic' },
    shareHeading: { ru: '', en: '' },
    shareBody: { ru: '', en: '' },
    shareCta: { ru: '', en: '' },
    recordingsHeading: { ru: 'Записи живых встреч', en: 'Live session recordings' },
    note: {
      ru: 'Это не терапевтическая группа: там не разбирают чужой опыт и не лечат друг друга. При кризисе — не в чат, а на живую линию из пятого шага.',
      en: 'This is not a therapy group: nobody analyses anyone’s experience or treats each other there. In a crisis — not the chat, but the live line from step five.',
    },
  },
}
