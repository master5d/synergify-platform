// packs/retreat/course/community.ts
// Слой сообщества (intake LMS#13, spec docs/superpowers/specs/2026-09-28-community-layer.md).
// Места встречи у курса пока нет — решение владельца позже. enabled: false гасит все поверхности
// сообщества на сайте курса; в workers/src/lib/community.ts курс не заведён, приглашений нет.
import type { CommunityData } from '@/lib/community-types'

const EMPTY = { ru: '', en: '' }

export const COMMUNITY: CommunityData = {
  enabled: false,
  groupUrl: '',
  courseTopicUrl: '',
  moduleTopics: {},
  recordings: {},
  // Тексты заполнены, хотя поверхности выключены: контракт lib/community.test.ts требует их для каждой
  // поверхности, которую pack может показать, — и они честны на случай включения.
  copy: {
    heading: { ru: 'Где обсудить свою сделку', en: 'Where to talk through your deal' },
    intro: {
      ru: 'Места встречи у курса пока нет. Когда оно появится, ссылка будет здесь; платформа туда твоих данных не передаёт.',
      en: 'The course has no meeting place yet. When it opens, the link will be here; the platform passes none of your data there.',
    },
    cta: { ru: 'Открыть место встречи', en: 'Open the meeting place' },
    shareHeading: EMPTY,
    shareBody: EMPTY,
    shareCta: EMPTY,
    recordingsHeading: { ru: 'Записи живых встреч', en: 'Live session recordings' },
    note: EMPTY,
  },
}
