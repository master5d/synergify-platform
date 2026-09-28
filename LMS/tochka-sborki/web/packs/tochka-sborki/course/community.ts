// packs/tochka-sborki/course/community.ts
// Слой сообщества (intake LMS#13, spec docs/superpowers/specs/2026-09-28-community-layer.md).
// Сообщество живёт в Telegram-группе владельца — платформа только ведёт туда ссылками.
// ВЫКЛЮЧЕНО и пусто: группу, ветки модулей и ссылки Точки Сборки даёт владелец. Заполнить
// groupUrl/courseTopicUrl/moduleTopics и поставить enabled: true — кода не нужно.
// Ссылка курса здесь и в workers/src/lib/community.ts сверяется тестом воркера.
import type { CommunityData } from '@/lib/community-types'

export const COMMUNITY: CommunityData = {
  enabled: false,
  groupUrl: '',
  courseTopicUrl: '',
  // Модуль → ветка модуля в группе: там ученики показывают результат практики модуля.
  moduleTopics: {},
  // 'модуль/юнит' → записи живых встреч к этому уроку.
  recordings: {},
  copy: {
    heading: { ru: 'Сообщество курса', en: 'The course community' },
    intro: {
      ru: 'Учиться легче рядом с другими. Сообщество курса живёт в Telegram: вопросы, практика соучеников, записи живых встреч. Вход — по ссылке, сам; платформа туда твоих данных не передаёт.',
      en: 'Learning is easier next to others. The course community lives on Telegram: questions, fellow learners’ practice, recordings of live sessions. You join by the link yourself; the platform passes none of your data there.',
    },
    cta: { ru: 'Открыть сообщество', en: 'Open the community' },
    shareHeading: { ru: 'Покажи результат практики', en: 'Show your practice result' },
    shareBody: {
      ru: 'Модуль позади. Выложи, что получилось, в ветку модуля и ответь двоим соученикам: что сработало, что бы ты попробовал иначе. Твоя работа живёт в группе, а не у нас. Ключи, пароли и чужие данные — не выкладывай.',
      en: 'The module is done. Post what you built in the module thread and reply to two fellow learners: what worked, what you would try differently. Your work lives in the group, not with us. No keys, passwords or other people’s data.',
    },
    shareCta: { ru: 'В ветку модуля', en: 'To the module thread' },
    recordingsHeading: { ru: 'Записи живых встреч', en: 'Live session recordings' },
    note: { ru: '', en: '' },
  },
}
