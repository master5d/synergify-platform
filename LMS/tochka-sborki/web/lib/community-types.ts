// Слой сообщества (intake LMS#13, spec docs/superpowers/specs/2026-09-28-community-layer.md).
// Форма данных pack'а (packs/<pack>/course/community.ts). Сообщество живёт в Telegram-группе
// владельца; платформа только ведёт туда ссылками и ничего об участниках не хранит.

export interface Bi { ru: string; en: string }

export interface Recording {
  title: Bi
  url: string
  /** ISO-дата встречи, YYYY-MM-DD. */
  date: string
}

export interface CommunityData {
  /** Выключатель всех поверхностей сообщества на сайте курса. */
  enabled: boolean
  /** Публичная ссылка или invite-ссылка группы; '' = группы нет. */
  groupUrl: string
  /** Тема/ветка курса в группе; '' = вести в саму группу. */
  courseTopicUrl: string
  /** Модуль → ветка модуля (показать результат практики). Нет ветки — нет блока. */
  moduleTopics: Record<string, string>
  /** 'модуль/юнит' → записи живых встреч к уроку. */
  recordings: Record<string, Recording[]>
  copy: {
    heading: Bi
    intro: Bi
    cta: Bi
    shareHeading: Bi
    shareBody: Bi
    shareCta: Bi
    recordingsHeading: Bi
    /** Оговорка под ссылкой; '' = нет. */
    note: Bi
  }
}
