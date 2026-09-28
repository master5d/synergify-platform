// packs/living-practice/course/week-map.ts
// Форма эталона. Фича у этого курса не подключена — в intake-questions.ts этого пака нет
// вопроса V_WEEK_MAP, шаг никогда не показывается и этот текст никто не видит. Файл существует
// только для того, чтобы @pack-alias резолвился на обе сборки (lib/boundary.test.ts: stubs are
// thin @pack re-exports). Копия — дословно из packs/tochka-sborki (тот же контракт), кроме
// таблицы соответствия: у курса один модуль, все типы работы ведут в него.
import type { Locale } from '@/lib/intake/types'
import type { TaskKind, WeekBucket } from '@/lib/intake/week-map'

type L = Record<Locale, string>

export interface WeekMapBucketCopy {
  label: L
  hint: L
  /** Подпись к модулю в маршруте — у «оставляю себе» она своя, без давления «отдай ИИ». */
  moduleLead: L
}

export interface WeekMapData {
  /** Тип работы → слаг модуля курса, где такую работу разбирают. */
  moduleByKind: Record<TaskKind, string>
  eyebrow: L
  lead: L
  inputLabel: L
  placeholder: L
  addButton: L
  removeLabel: L
  /** {n} — сколько задач, {min}/{max} — границы. */
  countHint: L
  limitReached: L
  rejectedEmpty: L
  rejectedDuplicate: L
  unsortedHint: L
  tooFew: L
  empty: L
  routeHeading: L
  routeLead: L
  buckets: Record<WeekBucket, WeekMapBucketCopy>
}

export const WEEK_MAP: WeekMapData = {
  moduleByKind: {
    building: '01-living-practice',
    meetings: '01-living-practice',
    scheduling: '01-living-practice',
    research: '01-living-practice',
    data: '01-living-practice',
    knowledge: '01-living-practice',
    communication: '01-living-practice',
    writing: '01-living-practice',
    other: '01-living-practice',
  },
  eyebrow: { ru: 'Карта недели', en: 'Your week map' },
  lead: {
    ru: 'Одна задача — это проба. Неделя — это картина. Выпиши 3–7 дел, которые повторяются у тебя каждую неделю, и разложи каждое: что ИИ может делать сам, где он помогает, а что ты оставляешь себе. Каждое дело привяжем к модулю курса, где такую работу разбирают, — получится твой личный маршрут.',
    en: 'One task is a probe. A week is the picture. List 3–7 things that repeat in your week and sort each one: what AI can do on its own, where it helps, and what you keep for yourself. We link each task to the course module that covers this kind of work — that becomes your personal route.',
  },
  inputLabel: { ru: 'Повторяющееся дело', en: 'A recurring task' },
  placeholder: {
    ru: 'например: отвечать на заявки клиентов',
    en: 'e.g.: reply to client inquiries',
  },
  addButton: { ru: 'Добавить', en: 'Add' },
  removeLabel: { ru: 'Убрать', en: 'Remove' },
  countHint: {
    ru: 'Задач: {n} (нужно от {min} до {max})',
    en: 'Tasks: {n} (from {min} to {max})',
  },
  limitReached: {
    ru: 'Это уже {max} — для одной недели достаточно. Чтобы добавить новое, убери что-то из списка.',
    en: "That's {max} already — enough for one week. To add another, remove one from the list.",
  },
  rejectedEmpty: {
    ru: 'Опиши дело парой слов — так, чтобы через месяц было понятно, о чём речь.',
    en: "Describe the task in a few words — so it still makes sense a month from now.",
  },
  rejectedDuplicate: { ru: 'Это дело уже в списке.', en: 'This task is already on the list.' },
  unsortedHint: {
    ru: 'Разложи по корзинам все дела — маршрут соберётся, когда у каждого будет своё место.',
    en: 'Sort every task into a bucket — the route comes together once each has its place.',
  },
  tooFew: {
    ru: 'Добавь ещё немного: по одному-двум делам неделю не видно. Нужно хотя бы {min}.',
    en: "Add a bit more: one or two tasks don't show a week yet. You need at least {min}.",
  },
  empty: {
    ru: 'Шаг необязательный — можно пропустить и вернуться к нему позже.',
    en: 'This step is optional — you can skip it and come back later.',
  },
  routeHeading: { ru: 'Твой личный маршрут', en: 'Your personal route' },
  routeLead: {
    ru: 'Начни с модулей у первой корзины — там выигрыш во времени самый быстрый.',
    en: 'Start with the modules in the first bucket — that is where the time win comes fastest.',
  },
  buckets: {
    ai_does: {
      label: { ru: 'ИИ делает', en: 'AI does it' },
      hint: {
        ru: 'Шаги понятны, ошибку легко заметить и исправить — можно отдать целиком и проверять результат.',
        en: 'The steps are clear and a mistake is easy to spot and fix — hand it over and check the result.',
      },
      moduleLead: { ru: 'Как отдать:', en: 'How to hand it over:' },
    },
    ai_helps: {
      label: { ru: 'ИИ помогает', en: 'AI helps' },
      hint: {
        ru: 'Черновик, подбор, первый проход — за ИИ; решение и финальная версия — за тобой.',
        en: 'Draft, search, first pass — AI; the decision and the final version — you.',
      },
      moduleLead: { ru: 'Как разделить работу:', en: 'How to split the work:' },
    },
    keep: {
      label: { ru: 'Оставляю себе', en: 'I keep this' },
      hint: {
        ru: 'Здесь важны твой вкус, отношения с людьми или ответственность — это осознанный выбор, а не недоработка.',
        en: 'Your taste, your relationships or your responsibility matter here — a deliberate choice, not a shortfall.',
      },
      moduleLead: {
        ru: 'Остаётся твоим. Если однажды захочешь снять с себя рутину вокруг — смотри:',
        en: 'Stays yours. If you ever want to shed the routine around it — see:',
      },
    },
  },
}
