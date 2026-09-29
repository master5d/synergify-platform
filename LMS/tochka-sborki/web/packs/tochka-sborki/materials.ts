// web/lib/materials.ts
// Declarative Course Materials manifest. The engine renders any course's materials from this
// data (MaterialsSection); a future course swaps the manifest, not the component. Scaffold.
import type { Bi } from './course.config'

export type MaterialKind = 'template' | 'link' | 'tool'

export interface Material {
  kind: MaterialKind
  title: Bi
  description?: Bi
  href: string
  /** True for off-site links (open in a new tab). Keep in sync with the href. */
  external?: boolean
}

export interface MaterialGroup {
  label: Bi
  items: Material[]
}

/** http(s):// → external; anything else (relative path) is internal. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href)
}

export const COURSE_MATERIALS: MaterialGroup[] = [
  {
    label: { ru: 'Шаблоны', en: 'Templates' },
    items: [
      {
        kind: 'template',
        title: { ru: 'Устав агента', en: 'Agent Charter' },
        description: { ru: 'Заготовка system-промпта для твоего ИИ-напарника', en: 'A system-prompt starter for your AI partner' },
        href: '/materials/agent-charter.md',
      },
      {
        kind: 'template',
        title: { ru: 'Рецепты автоматизации', en: 'Automation Recipes' },
        description: { ru: 'Готовые паттерны агентных автоматизаций', en: 'Ready-made agentic automation patterns' },
        href: '/materials/automation-recipes.md',
      },
    ],
  },
  {
    label: { ru: 'Из курса', en: 'From the course' },
    items: [
      {
        kind: 'link',
        title: { ru: 'Стартер студента', en: 'Student starter' },
        description: {
          ru: 'Готовый проект для курса с любым агентом: AGENTS.md, память, my-experiments, шаблоны',
          en: 'A ready course project for any agent: AGENTS.md, memory, my-experiments, templates',
        },
        href: '/starter/',
      },
      { kind: 'link', title: { ru: 'Шпаргалка', en: 'Cheatsheet' }, href: '/cheatsheet/' },
      { kind: 'link', title: { ru: 'Дорожная карта', en: 'Roadmap' }, href: '/roadmap/' },
      { kind: 'link', title: { ru: 'Установка стека (macOS/Linux)', en: 'Install the stack (macOS/Linux)' }, href: '/install.sh' },
      { kind: 'link', title: { ru: 'Установка стека (Windows)', en: 'Install the stack (Windows)' }, href: '/install.ps1' },
      { kind: 'link', title: { ru: 'Установка за GFW (cloud-relay)', en: 'Install behind GFW (cloud relay)' }, href: '/install-gfw.sh' },
    ],
  },
  {
    // Внешние первоисточники. Ссылки ведут на АНГЛИЙСКИЕ оригиналы сознательно:
    // русские версии курсов Microsoft сделаны машинным переводчиком (Co-op Translator,
    // дисклеймер стоит в шапке каждого файла). Русскую сторону мы пишем сами.
    label: { ru: 'Дальше и глубже', en: 'Going deeper' },
    items: [
      {
        kind: 'link',
        title: { ru: 'Курс Microsoft по агентам — карта на русском', en: 'Microsoft agents course — a Russian guide' },
        description: {
          ru: 'Наш путеводитель по 18 урокам: что читать после какого модуля и что можно пропустить',
          en: 'Our guide to the 18 lessons: what to read after which module, and what to skip',
        },
        href: '/materials/ms-agents-map.md',
      },
      {
        kind: 'link',
        title: { ru: 'AI Agents for Beginners (оригинал, англ.)', en: 'AI Agents for Beginners (original)' },
        description: {
          ru: '18 уроков от Microsoft про паттерны агентов, MCP, память и безопасность. MIT, обновляется еженедельно',
          en: '18 lessons from Microsoft on agent patterns, MCP, memory and security. MIT, updated weekly',
        },
        href: 'https://github.com/microsoft/ai-agents-for-beginners',
        external: true,
      },
      {
        // intake LMS#4: huggingface/agents-course — Apache-2.0 (проверено 2026-09-28, push 2026-09-15).
        kind: 'link',
        title: { ru: 'Hugging Face Agents Course (англ.)', en: 'Hugging Face Agents Course' },
        description: {
          ru: 'Курс Hugging Face про агентов: как они устроены, агентные фреймворки на практике, финальный проект. Бесплатно, Apache-2.0',
          en: 'Hugging Face course on agents: how they work, agent frameworks in practice, a final project. Free, Apache-2.0',
        },
        href: 'https://huggingface.co/learn/agents-course',
        external: true,
      },
      {
        // intake LMS#4: закрытая платформа без открытой лицензии — только ссылкой.
        kind: 'link',
        title: { ru: 'Короткие курсы DeepLearning.AI (англ.)', en: 'DeepLearning.AI short courses' },
        description: {
          ru: 'Часовые курсы про агентов, RAG и оркестрацию. Бесплатно, но закрытая платформа: нужна регистрация, лицензии нет',
          en: 'Hour-long courses on agents, RAG and orchestration. Free, but a closed platform: sign-up required, no open licence',
        },
        href: 'https://www.deeplearning.ai/short-courses/',
        external: true,
      },
    ],
  },
  {
    // Второй уровень: фундамент про модели и данные. Намеренно ПОСЛЕ основного курса —
    // ядро Точки Сборки про агентную практику; обучение моделей вынесено в опциональный
    // модуль 10-model-training (advanced), а здесь — его первоисточники.
    label: { ru: 'Фундамент: модели и данные', en: 'Foundations: models and data' },
    items: [
      {
        kind: 'link',
        title: { ru: 'Генеративный ИИ для начинающих', en: 'Generative AI for Beginners' },
        description: {
          ru: 'Как устроены большие модели изнутри: токены, эмбеддинги, дообучение. Microsoft, MIT',
          en: 'How large models work inside: tokens, embeddings, fine-tuning. Microsoft, MIT',
        },
        href: 'https://github.com/microsoft/generative-ai-for-beginners',
        external: true,
      },
      {
        kind: 'link',
        title: { ru: 'Машинное обучение для начинающих', en: 'Machine Learning for Beginners' },
        description: {
          ru: 'Классический ML до эпохи LLM — то, на чём всё стоит. Microsoft, MIT',
          en: 'Classical ML from before the LLM era — the ground everything stands on. Microsoft, MIT',
        },
        href: 'https://github.com/microsoft/ML-For-Beginners',
        external: true,
      },
      {
        kind: 'link',
        title: { ru: 'Данные и аналитика для начинающих', en: 'Data Science for Beginners' },
        description: {
          ru: 'Работа с данными: сбор, чистка, визуализация. Microsoft, MIT',
          en: 'Working with data: collection, cleaning, visualisation. Microsoft, MIT',
        },
        href: 'https://github.com/microsoft/Data-Science-For-Beginners',
        external: true,
      },
      {
        kind: 'link',
        title: { ru: 'LLM Course от Hugging Face', en: 'Hugging Face LLM Course' },
        description: {
          ru: 'Трансформеры и экосистема Hugging Face изнутри — теория к модулю «Обучение моделей». Apache-2.0',
          en: 'Transformers and the Hugging Face ecosystem from the inside — theory for the Model Training module. Apache-2.0',
        },
        href: 'https://huggingface.co/learn/llm-course',
        external: true,
      },
      {
        kind: 'link',
        title: { ru: 'smol-course: дообучение малых моделей', en: 'smol-course: fine-tuning small models' },
        description: {
          ru: 'Практический курс Hugging Face: SFT, LoRA, оценка на малых моделях — основа практики модуля «Обучение моделей». Apache-2.0',
          en: 'A hands-on Hugging Face course: SFT, LoRA, evaluation on small models — the basis of the Model Training practice. Apache-2.0',
        },
        href: 'https://github.com/huggingface/smol-course',
        external: true,
      },
    ],
  },
  {
    label: { ru: 'Инструменты стека', en: 'Stack tools' },
    items: [
      { kind: 'tool', title: { ru: 'Claude Code', en: 'Claude Code' }, href: 'https://claude.com/claude-code', external: true },
      { kind: 'tool', title: { ru: 'OpenAI Codex', en: 'OpenAI Codex' }, href: 'https://openai.com/codex/', external: true },
      { kind: 'tool', title: { ru: 'OpenRouter', en: 'OpenRouter' }, href: 'https://openrouter.ai', external: true },
      { kind: 'tool', title: { ru: 'LiteLLM', en: 'LiteLLM' }, href: 'https://litellm.ai', external: true },
    ],
  },
]
