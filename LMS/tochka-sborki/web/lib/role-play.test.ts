// Гварды Role Play (intake LMS#18): метки <RolePlay id/> в MDX активного pack'а ↔ сценарии
// packs/<pack>/course/role-plays.ts в обеих локалях; промпт несёт стоп-правила и критерии;
// prefill укладывается в лимит компаньона; тексты сценариев держат манифест и de-hustle.
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { CONTENT_ROOT, PACK_SLUG } from './pack'
import { MANIFEST } from './manifest'
import { ROLE_PLAYS } from './course/role-plays'
import { checkManifest } from './authoring/manifest'
import { lintDehustle } from './authoring/dehustle'
import { MAX_BOOTSTRAP } from './learn-prompt'
import { TASK_ROLES, type TaskRole } from './intake/task-route'
import {
  MAX_CRITERIA, MIN_CRITERIA, SCENE_RULES, buildRolePlayBootstrap, buildRolePlayPrompt, profileTaskRole,
  rolePlayAgentUrl, scenarioTexts, variantFor, type RolePlayScenario,
} from './role-play'
import { RolePlay } from '../components/role-play'
import { bindRolePlay } from '../components/role-play-bound'

const LOCALES = ['ru', 'en'] as const
const MARK_RE = /<RolePlay\s+id="([^"]+)"\s*\/>/g
const FENCE_RE = /```[\s\S]*?```/g

function mdxFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? mdxFiles(join(dir, e.name)) : e.name.endsWith('.mdx') ? [join(dir, e.name)] : [])
}

function practiceMarks(module: string, unit: string, locale: 'ru' | 'en'): string[] {
  const p = join(CONTENT_ROOT, locale, module, `${unit}.mdx`)
  if (!existsSync(p)) return []
  const src = readFileSync(p, 'utf8').replace(FENCE_RE, '')
  const practice = /<Phase type="practice">([\s\S]*?)<\/Phase>/.exec(src)?.[1] ?? ''
  return [...practice.matchAll(MARK_RE)].map(m => m[1])
}

/** Все сочетания «роль ученика» для сценария: общий + каждый вариант под роль. */
function rolesOf(s: RolePlayScenario): (TaskRole | null)[] {
  return [null, ...TASK_ROLES.filter(r => s.byRole?.[r])]
}

describe(`role plays registry (${PACK_SLUG})`, () => {
  it('ключи (module/unit/id) уникальны', () => {
    const keys = ROLE_PLAYS.map(x => `${x.module}/${x.unit}/${x.id}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('каждая метка <RolePlay id/> в контенте pack\'а имеет сценарий своего юнита (обе локали)', () => {
    for (const locale of LOCALES) {
      const root = join(CONTENT_ROOT, locale)
      for (const file of mdxFiles(root)) {
        const rel = file.slice(root.length + 1).replace(/\\/g, '/')
        const [module, unitFile] = rel.split('/')
        const unit = unitFile?.replace(/\.mdx$/, '')
        const src = readFileSync(file, 'utf8').replace(FENCE_RE, '')
        for (const m of src.matchAll(MARK_RE)) {
          expect(ROLE_PLAYS.some(s => s.module === module && s.unit === unit && s.id === m[1]), `${locale}/${rel} → ${m[1]}`).toBe(true)
        }
      }
    }
  })

  for (const s of ROLE_PLAYS) {
    for (const locale of LOCALES) {
      const at = `${s.module}/${s.unit}#${s.id} [${locale}]`

      it(`${at}: метка стоит в фазе practice ровно один раз`, () => {
        expect(practiceMarks(s.module, s.unit, locale).filter(id => id === s.id)).toHaveLength(1)
      })

      it(`${at}: сценарий заполнен, ${MIN_CRITERIA}–${MAX_CRITERIA} критериев`, () => {
        expect(s.criteria.length).toBeGreaterThanOrEqual(MIN_CRITERIA)
        expect(s.criteria.length).toBeLessThanOrEqual(MAX_CRITERIA)
        for (const t of scenarioTexts(s, locale)) expect(t.trim().length, t).toBeGreaterThan(0)
        expect(s.rules.length, 'стоп-правила автора').toBeGreaterThan(0)
      })

      it(`${at}: тон — манифест и de-hustle`, () => {
        for (const t of scenarioTexts(s, locale)) {
          expect(checkManifest(t, MANIFEST), t).toEqual([])
          expect(lintDehustle(t), t).toEqual([])
        }
      })

      for (const role of rolesOf(s)) {
        const tag = `${at} (${role ?? 'общий'})`
        it(`${tag}: промпт несёт правила сцены, запреты автора и все критерии`, () => {
          const p = buildRolePlayPrompt(s, locale, role)
          for (const r of SCENE_RULES.rules) expect(p).toContain(r[locale])
          expect(p).toContain(SCENE_RULES.debrief[locale])
          for (const r of s.rules) expect(p).toContain(r[locale])
          for (const c of s.criteria) expect(p).toContain(c[locale])
          const v = variantFor(s, role)
          expect(p).toContain(v.character[locale])
          expect(p).toContain(v.opener[locale])
        })

        it(`${tag}: prefill целиком в пределах MAX_BOOTSTRAP, с правилами и критериями`, () => {
          const b = buildRolePlayBootstrap(s, locale, role)
          expect(b.length).toBeLessThanOrEqual(MAX_BOOTSTRAP)
          expect(b).toContain(SCENE_RULES.compact[locale])
          for (const c of s.criteria) expect(b).toContain(c[locale])
          for (const r of s.rules) expect(b).toContain(r[locale])
          expect(rolePlayAgentUrl('claude', b)).toMatch(/^https:\/\/claude\.ai\/new\?q=/)
        })
      }
    }
  }
})

describe('role play engine', () => {
  it('правила сцены — в обеих локалях: не выходить из роли, не решать за ученика, разбор', () => {
    expect(SCENE_RULES.rules[0].ru).toMatch(/в роли/)
    expect(SCENE_RULES.rules[1].ru).toMatch(/Не решай за меня/)
    expect(SCENE_RULES.rules[0].en).toMatch(/in character/)
    expect(SCENE_RULES.rules[1].en).toMatch(/Do not solve it for me/)
    expect(SCENE_RULES.compact.ru).toMatch(/разбор/)
    expect(SCENE_RULES.compact.en).toMatch(/debrief/)
    for (const x of [SCENE_RULES.compact, SCENE_RULES.debrief, ...SCENE_RULES.rules]) {
      for (const l of LOCALES) expect(lintDehustle(x[l])).toEqual([])
    }
  })

  it('prefill длиннее лимита — голая ссылка без ?q=, а не обрезанный сценарий', () => {
    expect(rolePlayAgentUrl('chatgpt', 'x'.repeat(MAX_BOOTSTRAP + 1))).toBe('https://chatgpt.com/')
    expect(rolePlayAgentUrl('claude', 'x'.repeat(MAX_BOOTSTRAP + 1))).toBe('https://claude.ai/new')
  })

  it('роль из профиля анкеты: объект, JSON-строка, мусор', () => {
    expect(profileTaskRole({ answers: { V_ROLE: 'creator' } })).toBe('creator')
    expect(profileTaskRole({ answers: JSON.stringify({ V_ROLE: 'entrepreneur' }) })).toBe('entrepreneur')
    expect(profileTaskRole({ answers: { V_ROLE: 'wizard' } })).toBeNull()
    expect(profileTaskRole({ answers: '{bad' })).toBeNull()
    expect(profileTaskRole(null)).toBeNull()
  })

  // Прогон COURSE_PACK=living-practice: у «Тишины» сценариев нет намеренно.
  it.runIf(PACK_SLUG === 'living-practice')('«Тишина»: сценариев Role Play нет — тема деликатная, чужой опыт не разбираем', () => {
    expect(ROLE_PLAYS).toEqual([])
  })
})

describe('RolePlay render', () => {
  const s: RolePlayScenario = {
    module: 'm', unit: 'u', id: 'r',
    persona: { ru: 'Слушатель', en: 'Listener' },
    character: { ru: 'Общий персонаж.', en: 'General character.' },
    context: { ru: 'Общая ситуация.', en: 'General situation.' },
    opener: { ru: 'Привет.', en: 'Hi.' },
    goal: { ru: 'Цель сцены.', en: 'Scene goal.' },
    criteria: [{ ru: 'Первый.', en: 'First.' }, { ru: 'Второй.', en: 'Second.' }, { ru: 'Третий.', en: 'Third.' }],
    rules: [{ ru: 'Не придумывать за меня.', en: 'Do not invent for me.' }],
    byRole: {
      creator: {
        persona: { ru: 'Редактор', en: 'Editor' },
        character: { ru: 'Редактор.', en: 'Editor.' },
        context: { ru: 'Ситуация редактора.', en: 'Editor situation.' },
        opener: { ru: 'Слушаю.', en: 'Listening.' },
      },
    },
  }

  it('без профиля — общий вариант, критерии, кнопка и prefill-ссылки', () => {
    const html = renderToStaticMarkup(createElement(RolePlay, { scenario: s, locale: 'ru', profile: null }))
    expect(html).toContain('Тренировка в роли · Слушатель')
    expect(html).toContain('Общая ситуация.')
    expect(html).toContain('Второй.')
    expect(html).toContain('Скопировать сценарий')
    expect(html).toContain('https://chatgpt.com/?q=')
    expect(html).toContain('https://claude.ai/new?q=')
    expect(html).not.toContain('Вариант для')
  })

  it('роль из анкеты — вариант под неё с пометкой', () => {
    const html = renderToStaticMarkup(createElement(RolePlay, { scenario: s, locale: 'en', profile: { answers: { V_ROLE: 'creator' } } }))
    expect(html).toContain('Role play · Editor')
    expect(html).toContain('Version for creators')
    expect(html).toContain('Editor situation.')
    expect(html).not.toContain('General situation.')
  })

  it('роль без варианта — общий сценарий без пометки', () => {
    const html = renderToStaticMarkup(createElement(RolePlay, { scenario: s, locale: 'ru', profile: { answers: { V_ROLE: 'entrepreneur' } } }))
    expect(html).toContain('Общая ситуация.')
    expect(html).not.toContain('Вариант для')
  })

  it('bindRolePlay: известный id рендерится, неизвестный — пусто', () => {
    const Bound = bindRolePlay('m', 'u', 'ru', [s])
    expect(renderToStaticMarkup(createElement(Bound, { id: 'r' }))).toContain('Цель сцены.')
    expect(renderToStaticMarkup(createElement(Bound, { id: 'zzz' }))).toBe('')
  })
})
