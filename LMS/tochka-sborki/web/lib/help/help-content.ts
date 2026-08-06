// web/lib/help/help-content.ts
import type { HelpEntry } from './types'

export const HELP_TIPS: Record<string, HelpEntry> = {
  shards: {
    title: { ru: 'Когнитивные шарды (💎)', en: 'Cognitive Shards (💎)' },
    body: { ru: 'Твой счёт и валюта. Зарабатывай, проходя юниты и задания; трать в Хранилище на новые миры.', en: 'Your score and your currency. Earn them by completing units and quests; spend them in the Vault on new worlds.' },
  },
  character: {
    title: { ru: 'Лист героя', en: 'Hero strip' },
    body: { ru: 'Твой легендарный титул, класс, уровень и сколько зон курса пройдено (X/9).', en: 'Your legendary title, class, level, and how many course zones you have cleared (X/9).' },
  },
  'world-map': {
    title: { ru: 'Карта мира', en: 'World map' },
    body: { ru: 'Курс как карта: каждый узел — зона. Текущая подсвечена, пройденные отмечены, заблокированные приглушены. Нажми на узел, чтобы перейти к нему.', en: 'The course as a map: each node is a zone. The current one is highlighted, cleared ones marked, locked ones dimmed. Tap a node to jump to it.' },
  },
  daily: {
    title: { ru: 'Сегодня', en: 'Today' },
    body: { ru: 'Ежедневные задания под твой запас времени: одно на продвижение по курсу плюс практика и повторение. Обновляются каждый день.', en: 'Daily quests sized to your time budget: one to advance the course plus practice and recall. They refresh each day.' },
  },
  'dungeon-card': {
    title: { ru: 'Подземелье ниши', en: 'Niche Dungeon' },
    body: { ru: 'Прикладной маршрут под твою нишу. Открывается, когда пройдёшь ключевой модуль своей ниши.', en: 'A hands-on arc tailored to your niche. It unlocks once you finish your niche\'s core module.' },
  },
  vault: {
    title: { ru: 'Хранилище', en: 'Vault' },
    body: { ru: 'Трать шарды, чтобы открыть альтернативные миры-темы. Твой стартовый мир — бесплатный.', en: 'Spend shards to unlock alternate world themes. Your starting world is free.' },
  },
  'wizard-phases': {
    title: { ru: 'Четыре фазы', en: 'Four phases' },
    body: { ru: 'Каждый юнит идёт по циклу: Активация → Рефлексия → Концепция → Практика. Больше всего шардов — за фазы размышления.', en: 'Each unit runs a loop: Activation → Reflection → Concept → Practice. The thinking phases pay the most shards.' },
  },
  'wizard-modes': {
    title: { ru: 'Режим прохождения', en: 'Your mode' },
    body: { ru: 'Командир / Со-пилот / Архимаг: чем меньше помощи берёшь, тем больше шардов. У Архимага подсказка наставника скрыта.', en: 'Commander / Co-Pilot / Archmage: the less help you take, the more shards you earn. On Archmage the mentor hint is hidden.' },
  },
  'dungeon-stages': {
    title: { ru: 'Этапы и босс', en: 'Stages & boss' },
    body: { ru: 'Этапы усложняются: задача → процесс → результат. Босс — синтез: собрать навык в реальный результат для своей ниши.', en: 'Stages escalate: task → process → outcome. The boss is a synthesis — combine the skill into a real result for your niche.' },
  },
}

export const INTRO_CARDS: Record<string, HelpEntry> = {
  dashboard: {
    title: { ru: 'Что это за страница?', en: 'What is this page?' },
    body: { ru: 'Это твой Квест-лог: карта курса, ежедневные задания, подземелье ниши и награды-шарды. Нажимай ⓘ рядом с элементами, чтобы понять, что есть что.', en: 'This is your Quest Log: the course map, daily quests, your niche dungeon, and shard rewards. Tap the ⓘ next to anything to learn what it is.' },
  },
  unit: {
    title: { ru: 'Как проходить юнит', en: 'How a unit works' },
    body: { ru: 'Юнит идёт по четырём фазам. Сначала выбери режим — сколько помощи брать; от него зависят шарды и подсказки. В конце ждёт прикладной вызов под твою нишу.', en: 'A unit runs in four phases. First pick a mode — how much help to take; it sets your shards and hints. At the end there is an applied challenge for your niche.' },
  },
  dungeon: {
    title: { ru: 'Подземелье ниши', en: 'The Niche Dungeon' },
    body: { ru: 'Маршрут из трёх усложняющихся этапов и босса — всё под твою нишу. Отмечай этапы по мере выполнения; за прохождение дают шарды.', en: 'A run of three escalating stages and a boss — all tailored to your niche. Mark stages as you go; clearing them earns shards.' },
  },
}
