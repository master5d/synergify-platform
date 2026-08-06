// Canonical CORE module slugs in ascending order — the RPG progression spine:
// quest-lines are permutations of this list, macro-phases partition it, quest-log
// counts progress against it. Optional modules live in OPTIONAL_MODULE_SLUGS below.
export const MODULE_SLUGS = [
  '00-kickstart', '01-introduction', '02-setup-guide', '03-stack-selection',
  '04-prompt-engineering', '05-context-memory', '06-audio-pipeline', '07-tools', '08-agent-engineering',
] as const
export type ModuleSlug = (typeof MODULE_SLUGS)[number]

// Optional modules: present in content/ (nav, syllabus, World Map via getAllModules)
// and in skins/transformations, but OUTSIDE the progression spine — quest-lines,
// macro-phases, quest-log totals and the academy admission catalog ignore them.
export const OPTIONAL_MODULE_SLUGS = ['09-ai-notebook'] as const
export type OptionalModuleSlug = (typeof OPTIONAL_MODULE_SLUGS)[number]

/** Core + optional: every module that has content, skin framing and a transformation. */
export type CourseModuleSlug = ModuleSlug | OptionalModuleSlug
