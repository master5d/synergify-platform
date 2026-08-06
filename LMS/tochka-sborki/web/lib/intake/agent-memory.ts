// web/lib/intake/agent-memory.ts
// Where the learner pastes the durable companion role-prompt into each external agent's
// persistent memory, so the agent keeps the role across sessions ("build up its memory").
// Pure data — consumed by the CompanionSetup tabs.

export interface AgentMemory {
  key: 'chatgpt' | 'claude' | 'gemini' | 'copilot'
  label: string
  where: { ru: string; en: string }
}

export const AGENT_MEMORY: AgentMemory[] = [
  {
    key: 'chatgpt',
    label: 'ChatGPT',
    where: {
      ru: 'Настройки → Персонализация → Кастомные инструкции (или включи «Память» и вставь как факт о себе).',
      en: 'Settings → Personalization → Custom Instructions (or enable "Memory" and paste it as a fact about you).',
    },
  },
  {
    key: 'claude',
    label: 'Claude',
    where: {
      ru: 'Создай Project → вставь в Project instructions. Все чаты внутри проекта будут помнить роль.',
      en: 'Create a Project → paste into Project instructions. Every chat in that project remembers the role.',
    },
  },
  {
    key: 'gemini',
    label: 'Gemini',
    where: {
      ru: 'Создай Gem → вставь в Instructions (или добавь в Saved info в настройках).',
      en: 'Create a Gem → paste into Instructions (or add it to Saved info in settings).',
    },
  },
  {
    key: 'copilot',
    label: 'Copilot',
    where: {
      ru: 'Вставь как первое сообщение нового чата и закрепи его (постоянная память ограничена).',
      en: 'Paste as the first message of a new chat and pin it (persistent memory is limited).',
    },
  },
]
