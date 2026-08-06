// web/lib/quests/retrieval-bank.ts
import type { Bi } from '@/lib/rpg/types'

// One retrieval (recall) prompt per module. Shown only for COMPLETED modules, prefixed with the
// skin's mentor name. Neutral copy; theming is the mentor-name prefix (light, per SP2d philosophy).
export const RETRIEVAL_BANK: Record<string, Bi> = {
  '00-kickstart': { ru: 'что на «карте местности» оказалось для тебя самым неожиданным — и почему?', en: 'what on the "map of the territory" surprised you most — and why?' },
  '01-introduction': { ru: 'назови своими словами четыре сдвига Software 3.0.', en: 'name the four shifts of Software 3.0 in your own words.' },
  '02-setup-guide': { ru: 'какие инструменты ты поставил и какой из них уже пригодился?', en: 'which tools did you install, and which has already proven useful?' },
  '03-stack-selection': { ru: 'какой стек ты выбрал и какой главный аргумент за него?', en: 'which stack did you pick, and what was the main argument for it?' },
  '04-prompt-engineering': { ru: 'какие «магические слова» в промпте дают тебе самый заметный эффект?', en: 'which prompt "magic words" give you the most noticeable effect?' },
  '05-context-memory': { ru: 'что стоит держать в памяти агента между сессиями, а что — нет?', en: 'what is worth keeping in an agent\'s memory across sessions, and what is not?' },
  '06-audio-pipeline': { ru: 'из каких шагов состоит твой пайплайн «сырьё → инсайты»?', en: 'what are the steps of your "raw → insights" pipeline?' },
  '07-tools': { ru: 'чем отличаются MCP-серверы, Skills и Hooks — и когда что брать?', en: 'how do MCP servers, Skills and Hooks differ — and when do you reach for each?' },
  '08-agent-engineering': { ru: 'как ты разложишь одну свою задачу на нескольких агентов?', en: 'how would you split one of your tasks across several agents?' },
}
