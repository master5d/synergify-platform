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
export interface Prose {
  legendaryTitle: string; backstory: string; firstQuest: string; finalBoss: string
  source: 'gemini' | 'template'
}

export function fallbackProse(i: ProseInput): Omit<Prose, 'source'> {
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

export async function generateSheetProse(
  input: ProseInput, apiKey: string, fetchImpl: typeof fetch = fetch,
): Promise<Prose> {
  const model = 'gemini-2.5-pro'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const prompt = buildProsePrompt(input)
  try {
    const res = await fetchImpl(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
      }),
    })
    if (!res.ok) throw new Error(`gemini ${res.status}`)
    const data = await res.json() as any
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    const parsed = JSON.parse(text)
    return {
      legendaryTitle: parsed.legendaryTitle, backstory: parsed.backstory,
      firstQuest: parsed.firstQuest, finalBoss: parsed.finalBoss, source: 'gemini',
    }
  } catch {
    return { ...fallbackProse(input), source: 'template' }
  }
}

function buildProsePrompt(i: ProseInput): string {
  return [
    `You write RPG character-sheet prose for a learning platform.`,
    `Language: ${i.language}. Register: ${i.register ?? 'neutral'}. World skin: ${i.worldSkin}. Class: ${i.charClass}. Niche: ${i.niche ?? 'n/a'}.`,
    `Learner aspirational figure (G11): ${i.aspirational ?? 'n/a'}.`,
    `Desired first win: ${i.firstWin ?? 'n/a'}. Success definition: ${i.successDef ?? 'n/a'}.`,
    `Return STRICT JSON: {"legendaryTitle","backstory","firstQuest","finalBoss"}.`,
    `Tone must match the world skin. Backstory uses the aspirational figure. finalBoss frames the ultimate challenge.`,
  ].join('\n')
}

export async function classifyFilmSkin(
  film: string, apiKey: string, fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const model = 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const skins = 'slavic-myth|dark-fantasy|cyber-noir|space-opera|anime-quest|soviet-heroic|mystic-arcane|wanderer'
  try {
    const res = await fetchImpl(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text:
        `Map this film/series to ONE world skin from [${skins}]. Reply with only the skin key. Film: "${film}"` }] }] }),
    })
    if (!res.ok) throw new Error(String(res.status))
    const data = await res.json() as any
    const out = (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim().toLowerCase()
    return skins.split('|').includes(out) ? out : 'wanderer'
  } catch {
    return 'wanderer'
  }
}
