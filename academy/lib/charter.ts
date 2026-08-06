// Правила дома — устав школы. Engine + data: движок читает данные, копи здесь.
// Источник каждого правила — разбор реальных случаев (research-09, приватный инбокс).
// Публичная формулировка НЕ называет имён традиций: разборы живут внутри академии.
import type { Locale } from './registry'

export interface CharterRule {
  /** Короткий заголовок правила */
  title: string
  /** Одно-два предложения: что это значит на практике */
  body: string
}

export interface CharterCopy {
  eyebrow: string
  heading: string
  intro: string[]
  rules: CharterRule[]
  /** Развёрнутый тезис под списком — цифровая автономия (правило про изоляцию) */
  autonomyHeading: string
  autonomyBody: string[]
  metaTitle: string
  metaDescription: string
  backLabel: string
}

const RU: CharterCopy = {
  eyebrow: 'правила дома',
  heading: 'Чем мы отвечаем',
  intro: [
    'Манифест говорит, зачем эта школа. Правила отвечают, чем мы отвечаем за то, что она не станет тем, чего сами избегали.',
    'Отсутствие иерархии не защищает само по себе: там, где нет учителя с властью, риск переезжает в среду. Поэтому нормы названы вслух, а не оставлены на усмотрение атмосферы.',
  ],
  rules: [
    {
      title: 'Тему задаёт календарь, а не ведущий',
      body: 'Круг встречается по заранее известному плану. Никто не может подстроить сегодняшний разговор под своё настроение или своё положение.',
    },
    {
      title: 'Роли вращаются, за них не платят',
      body: 'Вести круг — не должность и не профессия. Каждый ведёт, и каждого ведут.',
    },
    {
      title: 'Продвижение никогда не требует приводить людей',
      body: 'Если рост внутри школы зависит от числа приведённых — это уже не школа.',
    },
    {
      title: 'У наставника нет власти над учеником',
      body: 'Совет можно не взять, и это ничего не стоит. Одни и те же практики работают в здоровом и в нездоровом режиме — разница ровно здесь.',
    },
    {
      title: 'Знание не продаётся ступенями',
      body: 'Нет платных уровней доступа и нет тайны, за которую нужно доплатить.',
    },
    {
      title: 'Критерий должен допускать «не получилось»',
      body: 'Проверка результата, устроенная так, что отрицательный ответ невозможен, — не проверка.',
    },
    {
      title: 'После практики — время без практики',
      body: 'Занятие заканчивается, жизнь продолжается. Мы не строим круглосуточный режим.',
    },
    {
      title: 'Никакой изоляции',
      body: 'Ни один формат школы не требует отдалиться от семьи, друзей или работы. Внешние связи — не помеха занятиям.',
    },
    {
      title: 'Уйти можно молча и без последствий',
      body: 'Ушедших не отлучают, не перестают замечать и не обсуждают за спиной.',
    },
    {
      title: 'Слова имеют происхождение',
      body: 'Мы называем источники понятий, которыми пользуемся, — включая спорные. Честное заимствование сильнее тихого.',
    },
    {
      title: 'Здоровье — к врачам',
      body: 'Ни одна практика школы не заменяет лечение и не отменяет назначений.',
    },
    {
      title: 'Среду фильтруем вслух',
      body: 'Что здесь неприемлемо — говорится прямо. Молчаливое «и так понятно» защитой не является.',
    },
  ],
  autonomyHeading: 'Отдельно — о голосе в кармане',
  autonomyBody: [
    'Тридцать лет назад одно движение раздало последователям аудиокассеты с голосом учителя. Разлучить человека с общиной стало невозможно: община помещалась в кармане и звучала круглосуточно. Внешние границы перестали работать — не потому, что их сняли, а потому, что их стало нечему держать.',
    'Мы учим работать с ИИ, то есть с голосом, который всегда рядом и всегда отвечает. Поэтому цифровая автономия для нас — не тема лекции, а правило дома: инструмент, от которого нельзя отойти на день, мы считаем неисправным. Практика, требующая постоянного присутствия помощника, в школе не преподаётся.',
  ],
  metaTitle: 'Правила дома — S.A.S.H.A',
  metaDescription: 'Двенадцать правил школы: чем мы отвечаем за то, что она останется школой, а не станет чем-то другим.',
  backLabel: '← к академии',
}

const EN: CharterCopy = {
  eyebrow: 'house rules',
  heading: 'What we answer for',
  intro: [
    'The manifesto says why this school exists. The rules say what we answer for — that it will not become the thing we avoided.',
    'The absence of hierarchy protects nothing by itself: where no teacher holds power, the risk moves into the environment. So the norms are said out loud instead of being left to the atmosphere.',
  ],
  rules: [
    {
      title: 'The calendar sets the topic, not the facilitator',
      body: 'The circle meets on a plan known in advance. No one can bend today’s conversation to their mood or their standing.',
    },
    {
      title: 'Roles rotate, and no one is paid for them',
      body: 'Leading a circle is not a post and not a profession. Everyone leads and everyone is led.',
    },
    {
      title: 'Advancement never requires bringing people in',
      body: 'If growth inside the school depends on how many you recruit, it is no longer a school.',
    },
    {
      title: 'A mentor holds no power over a student',
      body: 'Advice can be declined at no cost. The same practices run in a healthy and an unhealthy mode — the difference is exactly here.',
    },
    {
      title: 'Knowledge is not sold in tiers',
      body: 'No paid levels of access, and no secret you must pay extra to receive.',
    },
    {
      title: 'A test must allow "it didn’t work"',
      body: 'A check of results built so that a negative answer is impossible is not a check.',
    },
    {
      title: 'After the practice, time without practice',
      body: 'The session ends, life goes on. We do not build a round-the-clock regime.',
    },
    {
      title: 'No isolation',
      body: 'No format of this school asks you to step away from family, friends, or work. Outside ties are not an obstacle.',
    },
    {
      title: 'You may leave quietly and without consequence',
      body: 'Those who leave are not shunned, not unseen, not discussed behind their backs.',
    },
    {
      title: 'Words have origins',
      body: 'We name the sources of the concepts we use — including the disputed ones. Honest borrowing is stronger than quiet borrowing.',
    },
    {
      title: 'Health goes to doctors',
      body: 'No practice here replaces treatment or overrides a prescription.',
    },
    {
      title: 'We filter the environment out loud',
      body: 'What is unacceptable here is said plainly. A silent "everyone knows" is not a safeguard.',
    },
  ],
  autonomyHeading: 'Separately — on the voice in your pocket',
  autonomyBody: [
    'Thirty years ago a movement handed its followers audio cassettes with the teacher’s voice. Separating a person from the community became impossible: the community fit in a pocket and played around the clock. External boundaries stopped working — not because they were removed, but because there was nothing left for them to hold.',
    'We teach people to work with AI — a voice that is always near and always answers. So digital autonomy here is not a lecture topic but a house rule: a tool you cannot step away from for a day, we consider broken. A practice that requires the constant presence of an assistant is not taught in this school.',
  ],
  metaTitle: 'House rules — S.A.S.H.A',
  metaDescription: 'Twelve rules of the school: what we answer for, so that it stays a school and does not become something else.',
  backLabel: '← back to the academy',
}

const CHARTER: Record<Locale, CharterCopy> = { ru: RU, en: EN }

export function getCharter(locale: Locale): CharterCopy {
  return CHARTER[locale]
}
