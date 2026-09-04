// 2026-09-04 (Task 9): generateSheetProse/classifyFilmSkin/buildProsePrompt переехали
// в llm-service (прямые вызовы Gemini больше не живут в воркере). Здесь остаётся только
// fallbackProse — шаблонная деградация на случай отказа сервиса, её знает воркер, не сервис.
import { SKINS_META } from '../../../LMS/tochka-sborki/web/lib/rpg/skins-meta'
import type { WorldSkin } from '../../../LMS/tochka-sborki/web/lib/rpg/types'

/** Readable world-skin name for prose, never the raw enum slug (e.g. 'slavic-myth' → 'Славянский Миф'). */
function skinName(skin: string, ru: boolean): string {
  const meta = SKINS_META[skin as WorldSkin]
  if (meta) return meta.displayName[ru ? 'ru' : 'en']
  return ru ? 'неизведанного пути' : 'an untrodden path'
}

export interface ProseInput {
  charClass: string; worldSkin: string; language: string
  register?: string; niche?: string | null
  attributes?: Record<string, number>
  aspirational?: string; firstWin?: string; successDef?: string
}
// М-2 финального ревью: Prose (с полем source) больше никем не импортировался — удалён.
// ProseResult — форма реального ответа /prose (без source, его добавляет воркер) и
// одновременно конкретный тип для callLlm<ProseResult> в intake.ts (И-1).
export interface ProseResult {
  legendaryTitle: string; backstory: string; firstQuest: string; finalBoss: string
}

export function fallbackProse(i: ProseInput): ProseResult {
  const ru = i.language !== 'en'
  return {
    legendaryTitle: ru ? `Герой пути «${skinName(i.worldSkin, true)}»` : `Hero of the ${skinName(i.worldSkin, false)} path`,
    backstory: ru ? 'Раньше ты делал(а) всё вручную. Но всегда знал(а), что есть другая версия тебя.'
                  : 'You used to do everything by hand — but you always knew there was another version of you.',
    firstQuest: ru ? 'Создай свой первый рабочий AI-инструмент.' : 'Build your first working AI tool.',
    finalBoss: ru ? 'Система, которая работает без твоего ежедневного участия.'
                  : 'A system that runs without your daily input.',
  }
}
