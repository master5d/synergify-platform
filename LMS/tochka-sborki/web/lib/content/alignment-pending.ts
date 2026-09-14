// Храповик раскатки учебной связки (спека 2026-09-14 §2): модули, ещё не получившие утверждённых
// владельцем целей и вопросов. НЕ ослабление гварда: модуль из списка, уже имеющий цели, — красный
// тест (вычеркни), модуль вне списка без целей — красный, а список сверяется со снимком и может
// только сокращаться. Пустой список удаляется вместе с этим файлом.
export const PENDING_SNAPSHOT: Record<string, readonly string[]> = {
  'tochka-sborki': [
    '00-kickstart', '01-introduction', '02-setup-guide', '03-stack-selection', '04-prompt-engineering',
    '05-context-memory', '06-audio-pipeline', '07-tools', '08-agent-engineering', '09-ai-notebook',
  ],
  'living-practice': ['01-living-practice'],
}

export const PENDING_ALIGNMENT: Record<string, readonly string[]> = {
  'tochka-sborki': PENDING_SNAPSHOT['tochka-sborki'],
  'living-practice': PENDING_SNAPSHOT['living-practice'],
}
