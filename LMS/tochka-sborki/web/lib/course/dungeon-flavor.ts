// web/lib/course/dungeon-flavor.ts
import type { NicheFlavor } from '@/lib/dungeon/types'

// Per-niche dungeon identity. Skin-neutral (skin = accent/chrome); niche is the identity axis.
// `other` is both its own niche and the fallback for null/unknown niches.
export const FLAVOR_BANK: Record<string, NicheFlavor> = {
  coach: {
    dungeonName: { ru: 'Чертог Резонанса', en: 'Hall of Resonance' },
    bossName: { ru: 'Эхо Сомнения', en: 'The Echo of Doubt' },
    intro: { ru: 'Здесь слова становятся опорой для другого. Пройди вглубь — и научи агента слушать так, как слушаешь ты.', en: 'Here words become a foothold for another. Go deeper — and teach an agent to listen the way you do.' },
    bossChallenge: { ru: 'Собери агентский поток для {niche}: от первого сообщения клиента до структурированного инсайта, который двигает к {outcome}.', en: 'Assemble an agentic flow for {niche}: from a client\'s first message to a structured insight that moves toward {outcome}.' },
  },
  massage: {
    dungeonName: { ru: 'Грот Прикосновения', en: 'Grotto of Touch' },
    bossName: { ru: 'Узел Напряжения', en: 'The Knot of Tension' },
    intro: { ru: 'Тело помнит то, что забывает ум. Спустись и собери инструмент, что освободит твоё время для рук.', en: 'The body remembers what the mind forgets. Descend and build a tool that frees your time for your hands.' },
    bossChallenge: { ru: 'Спроектируй агента для {niche}, который ведёт запись, историю и follow-up клиентов — так, чтобы приблизить {outcome}.', en: 'Design an agent for {niche} that handles booking, client history and follow-ups — to bring {outcome} closer.' },
  },
  astrology: {
    dungeonName: { ru: 'Обсерватория Знаков', en: 'Observatory of Signs' },
    bossName: { ru: 'Молчание Звёзд', en: 'The Silence of Stars' },
    intro: { ru: 'Карты неба бесконечны, а часов в сутках мало. Сделай агента, что читает узор вместе с тобой.', en: 'The sky\'s charts are endless, the day\'s hours few. Make an agent that reads the pattern alongside you.' },
    bossChallenge: { ru: 'Построй для {niche} агентский разбор: входные данные клиента → персональная трактовка → шаг к {outcome}.', en: 'Build an agentic reading for {niche}: client inputs → a personal interpretation → a step toward {outcome}.' },
  },
  content: {
    dungeonName: { ru: 'Лабиринт Потока', en: 'Labyrinth of Feed' },
    bossName: { ru: 'Алгоритм-Пожиратель', en: 'The Devouring Algorithm' },
    intro: { ru: 'Лента ненасытна. Спустись и собери конвейер, что превращает идею в серию, пока ты спишь.', en: 'The feed is insatiable. Descend and build a pipeline that turns one idea into a series while you sleep.' },
    bossChallenge: { ru: 'Собери для {niche} пайплайн «идея → серия постов → распространение», нацеленный на {outcome}.', en: 'Assemble an "idea → post series → distribution" pipeline for {niche}, aimed at {outcome}.' },
  },
  ecommerce: {
    dungeonName: { ru: 'Хранилище Витрин', en: 'Vault of Storefronts' },
    bossName: { ru: 'Брошенная Корзина', en: 'The Abandoned Cart' },
    intro: { ru: 'Каждая карточка — это бой за внимание. Спустись и выкуй агента, что продаёт, пока ты считаешь прибыль.', en: 'Every listing is a fight for attention. Descend and forge an agent that sells while you count profit.' },
    bossChallenge: { ru: 'Спроектируй для {niche} агента: описания товаров, ответы покупателям и работа с возражениями — ради {outcome}.', en: 'Design an agent for {niche}: product copy, buyer replies, and objection handling — for {outcome}.' },
  },
  service: {
    dungeonName: { ru: 'Мастерская Услуг', en: 'Workshop of Services' },
    bossName: { ru: 'Очередь Без Конца', en: 'The Endless Queue' },
    intro: { ru: 'Клиенты приходят быстрее, чем уходят. Спустись и собери систему, что держит поток без выгорания.', en: 'Clients arrive faster than they leave. Descend and build a system that holds the flow without burnout.' },
    bossChallenge: { ru: 'Построй для {niche} агентский узел: заявка → квалификация → расписание → follow-up, ведущий к {outcome}.', en: 'Build an agentic hub for {niche}: lead → qualification → scheduling → follow-up that leads to {outcome}.' },
  },
  tech: {
    dungeonName: { ru: 'Ядро Систем', en: 'The Systems Core' },
    bossName: { ru: 'Легаси-Левиафан', en: 'The Legacy Leviathan' },
    intro: { ru: 'Ты строишь то, что строит другое. Спустись и собери агента, что берёт на себя черновую работу.', en: 'You build what builds other things. Descend and assemble an agent that takes the grunt work.' },
    bossChallenge: { ru: 'Спроектируй для {niche} мультиагентную систему, автоматизирующую повторяемый рабочий цикл к {outcome}.', en: 'Design a multi-agent system for {niche} that automates a repeatable work cycle toward {outcome}.' },
  },
  other: {
    dungeonName: { ru: 'Безымянный Предел', en: 'The Nameless Reach' },
    bossName: { ru: 'Туман Неопределённости', en: 'The Fog of the Undefined' },
    intro: { ru: 'Твой путь ещё не на картах — тем интереснее. Спустись и собери агента под свою собственную задачу.', en: 'Your path isn\'t on the maps yet — all the better. Descend and build an agent for your own task.' },
    bossChallenge: { ru: 'Спроектируй агента под {niche}, который закрывает твою главную повторяемую задачу — ради {outcome}.', en: 'Design an agent for {niche} that closes your single biggest repeatable task — for {outcome}.' },
  },
}
