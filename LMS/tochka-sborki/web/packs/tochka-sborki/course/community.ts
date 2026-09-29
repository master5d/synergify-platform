// packs/tochka-sborki/course/community.ts
// Слой сообщества (intake LMS#13, spec docs/superpowers/specs/2026-09-28-community-layer.md).
// Сообщество живёт в Telegram-группе владельца — платформа только ведёт туда ссылками.
// ВКЛЮЧЕНО 2026-09-28 (слово владельца): тема курса в чате «Мастерская Перехода» — одна на весь курс,
// отдельных веток модулей нет, поэтому каждый модуль ведёт в ту же тему (ученик указывает номер модуля).
// Ссылка курса здесь и в workers/src/lib/community.ts сверяется тестом воркера.
import type { CommunityData } from '@/lib/community-types'

const COURSE_TOPIC = 'https://t.me/kundaliniRUs/7755'

export const COMMUNITY: CommunityData = {
  enabled: true,
  groupUrl: 'https://t.me/kundaliniRUs',
  courseTopicUrl: COURSE_TOPIC,
  // Модуль → ветка модуля в группе: там ученики показывают результат практики модуля.
  moduleTopics: {
    '00-kickstart': COURSE_TOPIC,
    '01-introduction': COURSE_TOPIC,
    '02-setup-guide': COURSE_TOPIC,
    '03-stack-selection': COURSE_TOPIC,
    '04-prompt-engineering': COURSE_TOPIC,
    '05-context-memory': COURSE_TOPIC,
    '06-audio-pipeline': COURSE_TOPIC,
    '07-tools': COURSE_TOPIC,
    '08-agent-engineering': COURSE_TOPIC,
    '09-ai-notebook': COURSE_TOPIC,
    '10-model-training': COURSE_TOPIC,
    '11-second-brain': COURSE_TOPIC,
  },
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
      ru: 'Модуль позади. Выложи, что получилось, в тему курса — с номером модуля в первой строке — и ответь двоим соученикам: что сработало, что бы ты попробовал иначе. Твоя работа живёт в группе, а не у нас. Ключи, пароли и чужие данные — не выкладывай.',
      en: 'The module is done. Post what you built in the course topic — module number in the first line — and reply to two fellow learners: what worked, what you would try differently. Your work lives in the group, not with us. No keys, passwords or other people’s data.',
    },
    shareCta: { ru: 'В тему курса', en: 'To the course topic' },
    recordingsHeading: { ru: 'Записи живых встреч', en: 'Live session recordings' },
    note: { ru: '', en: '' },
  },
}
