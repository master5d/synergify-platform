// web/lib/cs/challenge-templates.ts
import type { ChallengeFraming } from './types'

// One applied-challenge template per module. The mode's challengeTier selects task|process|outcome.
// {niche} = learner's F2 niche, {outcome} = learner's F3 desired outcome.
export const CHALLENGE_TEMPLATES: Record<string, ChallengeFraming> = {
  '00-kickstart': {
    task: { ru: 'Назови три задачи в {niche}, которые сегодня съедают больше всего времени.', en: 'Name three tasks in {niche} that eat the most of your time today.' },
    process: { ru: 'Опиши, как ты сейчас решаешь одну рутину в {niche} — по шагам.', en: 'Describe, step by step, how you currently handle one routine in {niche}.' },
    outcome: { ru: 'Сформулируй, как агент приблизит тебя к цели: {outcome}.', en: 'State how an agent moves you toward your goal: {outcome}.' },
    outcomeGeneric: { ru: 'Сформулируй один результат в {niche}, который хочешь получить с помощью агента.', en: 'State one result in {niche} you want an agent to help you reach.' },
  },
  '01-introduction': {
    task: { ru: 'Выпиши один процесс в {niche}, где «software 3.0» заменит ручной труд.', en: 'Write down one process in {niche} where "software 3.0" replaces manual work.' },
    process: { ru: 'Разложи этот процесс в {niche} на «что делает человек» и «что отдать модели».', en: 'Split that {niche} process into "human does" vs "hand to the model".' },
    outcome: { ru: 'Опиши, как четыре сдвига приближают тебя к: {outcome}.', en: 'Describe how the four shifts move you toward: {outcome}.' },
    outcomeGeneric: { ru: 'Опиши, к какому сдвигу в {niche} ты стремишься в первую очередь.', en: 'Describe which shift in {niche} you are aiming for first.' },
  },
  '02-setup-guide': {
    task: { ru: 'Установи инструменты и запусти первый промпт по задаче из {niche}.', en: 'Install the tools and run a first prompt on a {niche} task.' },
    process: { ru: 'Настрой рабочее окружение под повторяемую задачу в {niche}.', en: 'Set up your environment around a repeatable {niche} task.' },
    outcome: { ru: 'Доведи окружение до состояния, в котором можешь начать: {outcome}.', en: 'Get your environment ready enough to begin: {outcome}.' },
    outcomeGeneric: { ru: 'Доведи окружение до первого рабочего результата в {niche}.', en: 'Get your environment to a first working result in {niche}.' },
  },
  '03-stack-selection': {
    task: { ru: 'Выбери стек (Claude / Sovereign / Cloud-OSS / Behind-GFW) под бюджет и {niche}.', en: 'Pick a stack (Claude / Sovereign / Cloud-OSS / Behind-GFW) for your budget and {niche}.' },
    process: { ru: 'Сравни два стека по критериям, важным для {niche}, и обоснуй выбор.', en: 'Compare two stacks against criteria that matter for {niche} and justify the pick.' },
    outcome: { ru: 'Обоснуй, какой стек быстрее приведёт к: {outcome}.', en: 'Justify which stack reaches this fastest: {outcome}.' },
    outcomeGeneric: { ru: 'Обоснуй стек, который лучше всего подходит твоей работе в {niche}.', en: 'Justify the stack that best fits your work in {niche}.' },
  },
  '04-prompt-engineering': {
    task: { ru: 'Напиши промпт с магическими словами для одной задачи из {niche}.', en: 'Write a prompt with the magic words for one {niche} task.' },
    process: { ru: 'Итерируй промпт для {niche}: фиксируй, что улучшает каждый прогон.', en: 'Iterate a {niche} prompt: note what each pass improves.' },
    outcome: { ru: 'Сконструируй промпт, выдающий результат для: {outcome}.', en: 'Engineer a prompt that yields a result for: {outcome}.' },
    outcomeGeneric: { ru: 'Сконструируй промпт под самый частый запрос в {niche}.', en: 'Engineer a prompt for your most frequent {niche} request.' },
  },
  '05-context-memory': {
    task: { ru: 'Собери файл контекста (PERSONAL-CONTEXT) для агента под {niche}.', en: 'Assemble a context file (PERSONAL-CONTEXT) for an agent in {niche}.' },
    process: { ru: 'Спроектируй, что держать в памяти агента между сессиями для {niche}.', en: 'Design what the agent should keep in memory across {niche} sessions.' },
    outcome: { ru: 'Настрой память так, чтобы агент сам двигал тебя к: {outcome}.', en: 'Tune memory so the agent keeps moving you toward: {outcome}.' },
    outcomeGeneric: { ru: 'Настрой память агента под повторяющийся рабочий цикл в {niche}.', en: 'Tune agent memory for a recurring work cycle in {niche}.' },
  },
  '06-audio-pipeline': {
    task: { ru: 'Прогони пайплайн скрапинг→анализ на одном источнике из {niche}.', en: 'Run the scrape→analyze pipeline on one {niche} source.' },
    process: { ru: 'Спроектируй пайплайн «сырьё → инсайты» для данных {niche}.', en: 'Design a "raw → insights" pipeline for {niche} data.' },
    outcome: { ru: 'Построй пайплайн, который выдаёт инсайты для: {outcome}.', en: 'Build a pipeline that surfaces insights for: {outcome}.' },
    outcomeGeneric: { ru: 'Построй пайплайн, превращающий источник {niche} в полезные инсайты.', en: 'Build a pipeline turning a {niche} source into useful insights.' },
  },
  '07-tools': {
    task: { ru: 'Подключи один MCP-сервер или Skill под задачу из {niche}.', en: 'Wire up one MCP server or Skill for a {niche} task.' },
    process: { ru: 'Спланируй набор инструментов (MCP / Skills / Hooks) под рабочий цикл {niche}.', en: 'Plan a toolset (MCP / Skills / Hooks) for your {niche} work cycle.' },
    outcome: { ru: 'Собери инструменты, чтобы агент сам делал шаги к: {outcome}.', en: 'Assemble tools so the agent itself takes steps toward: {outcome}.' },
    outcomeGeneric: { ru: 'Собери минимальный набор инструментов под частую задачу в {niche}.', en: 'Assemble a minimal toolset for a frequent {niche} task.' },
  },
  '08-agent-engineering': {
    task: { ru: 'Опиши одного агента, который закроет повторяемую задачу в {niche}.', en: 'Describe one agent that closes a repeatable {niche} task.' },
    process: { ru: 'Спроектируй оркестрацию нескольких агентов под процесс {niche}.', en: 'Design multi-agent orchestration for a {niche} process.' },
    outcome: { ru: 'Спроектируй агентскую систему, выдающую: {outcome}.', en: 'Design an agentic system that delivers: {outcome}.' },
    outcomeGeneric: { ru: 'Спроектируй агентскую систему под ключевой результат в {niche}.', en: 'Design an agentic system for a key result in {niche}.' },
  },
}
