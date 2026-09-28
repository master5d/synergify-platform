// packs/tochka-sborki/course/week-map.ts
//
// «Карта недели» (module V, следующим под-шагом после V_AUTO_VERDICT) — BACKLOG.md, intake
// LMS#17, одобрено владельцем 2026-09-28. Логика — lib/intake/week-map.ts (движок); здесь —
// course-data: какой модуль ЭТОГО курса разбирает какой тип работы, и копия RU/EN.
// Черновик: формулировки и таблица соответствия — на вычитку владельцем.
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
  // Таблица соответствия. Порядок «тип → модуль» объяснён по юнитам:
  // building      → 08 «Агентский инжиниринг» (что отдавать AI, от прототипа к продакшену);
  // meetings      → 06 «Pipeline автоматизации» (аудио → текст → действие, trigger → action);
  // scheduling    → 07 «Инструменты расширения» (MCP/hooks — календарь, CRM, напоминания);
  // research      → 09 «AI-тетрадка» (ответы только по твоим источникам + где оно врёт);
  // data          → 06 «Pipeline автоматизации» (повторяющийся поток информации, отчёты);
  // knowledge     → 05 «Контекст и память» (заметки, база знаний, инструкции);
  // communication → 06 «Pipeline автоматизации» (входящие → черновик ответа → твоя проверка);
  // writing       → 04 «Промпт-инжиниринг» (формула спецификации для текста);
  // other         → 04 — тот же дефолт, что у NICHE_MODULE: первый модуль, где задача превращается в промпт.
  moduleByKind: {
    building: '08-agent-engineering',
    meetings: '06-audio-pipeline',
    scheduling: '07-tools',
    research: '09-ai-notebook',
    data: '06-audio-pipeline',
    knowledge: '05-context-memory',
    communication: '06-audio-pipeline',
    writing: '04-prompt-engineering',
    other: '04-prompt-engineering',
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
