export const COURSE_ORDER = [
  '00-kickstart',
  '01-introduction',
  '02-setup-guide',
  '03-stack-selection',
  '04-prompt-engineering',
  '05-context-memory',
  '06-audio-pipeline',
  '07-tools',
  '08-agent-engineering',
  '09-ai-notebook',
] as const

export type CourseSlug = (typeof COURSE_ORDER)[number]
