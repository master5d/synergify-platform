import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import {
  getModuleMeta,
  getUnitContent,
  getNavigationItems,
  unitLayout,
} from '@/lib/content'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Sidebar } from '@/components/sidebar'
import { UnitWizard } from '@/components/unit-wizard'
import { UnitProse } from '@/components/unit-prose'
import { UnitGates } from '@/components/unit-gates'
import { MobileGate } from '@/components/mobile-gate'
import { mdxComponents } from '@/components/mdx-components'
import { bindSelfCheck } from '@/components/self-check-bound'
import { bindInterestExample } from '@/components/interest-example-bound'
import { bindRolePlay } from '@/components/role-play-bound'
import { ModuleObjectives } from '@/components/module-objectives'
import { LessonViews } from '@/components/lesson-views'
import { SpacedReview } from '@/components/spaced-review'
import { getLessonViews } from '@/lib/lesson-views/load'
import { UnitRouteStep } from '@/components/intake/unit-route-step'
import type { Locale } from '@/lib/dictionaries'
import { outlineFromNav } from '@/lib/progress-sync'
import { CommunityUnit } from '@/components/community-unit'
import { getCommunityUnit } from '@/lib/community'
import { COURSE } from '@/lib/course'
import { pickPretest, toPretestItem } from '@/lib/pedagogy/pretest'
import { pretestKey } from '@/lib/pedagogy/local'
import { PretestProvider } from '@/components/pretest'
import { bindPretestEcho, bindPretestPhase } from '@/components/pretest-bound'

interface Props { moduleSlug: string; unitSlug: string; locale: Locale }

export function UnitPage({ moduleSlug, unitSlug, locale }: Props) {
  const moduleMeta = getModuleMeta(moduleSlug, locale)
  const { content } = getUnitContent(moduleSlug, unitSlug, locale)
  const navItems = getNavigationItems(locale)

  const unitIndex = moduleMeta.units.findIndex(u => u.slug === unitSlug)
  const nextUnit = moduleMeta.units[unitIndex + 1] ?? null

  // Разметка приходит из pack'а (_meta.json). Фазовый мастер и сплошная проза —
  // две оболочки над ОДНИМ MDX: контент-контракт у курсов общий.
  const Shell = unitLayout(moduleMeta) === 'prose' ? UnitProse : UnitWizard
  const lc = locale === 'en' ? 'en' : 'ru'

  // Pretest в активации (LMS#20): вопросы — данные (_meta.json / правило «первый в концепте»), MDX не правится.
  const pretest = COURSE.pedagogy.pretest ? pickPretest(moduleMeta, unitSlug, content).map(toPretestItem) : []
  const pretestIds = pretest.map(p => p.id)

  return (
    <UnitGates locale={locale}>
      <MobileGate locale={locale}>
      <Nav locale={locale} />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 3rem)' }}>
        <Sidebar navItems={navItems} currentSlug={moduleSlug} currentUnit={unitSlug} locale={locale} />
        <main id="main-content" tabIndex={-1} style={{ flex: 1, padding: '2rem 3rem', maxWidth: '860px' }}>
          {unitIndex === 0 && <ModuleObjectives objectives={moduleMeta.objectives} locale={locale === 'en' ? 'en' : 'ru'} />}
          <UnitRouteStep moduleSlug={moduleSlug} unitSlug={unitSlug} locale={locale === 'en' ? 'en' : 'ru'} />
          {/* «Вспомни» (Педагогика 1, пилот): 2–3 самопроверки пройденных юнитов, срок которых подошёл; нечего — блока нет. */}
          <SpacedReview moduleSlug={moduleSlug} unitSlug={unitSlug} locale={locale === 'en' ? 'en' : 'ru'} />
          {/* Представления урока (LMS#8): вкладки есть, только если у юнита есть свежий артефакт pack'а. */}
          <LessonViews data={getLessonViews(moduleSlug, unitSlug, locale === 'en' ? 'en' : 'ru', moduleMeta.checks)} locale={locale === 'en' ? 'en' : 'ru'}>
          <PretestProvider items={pretest} storageKey={pretestKey(COURSE.progressKey, `${moduleSlug}/${unitSlug}`)}>
          <Shell
            moduleSlug={moduleSlug}
            unitSlug={unitSlug}
            nextUnitSlug={nextUnit?.slug ?? null}
            moduleTitle={moduleMeta.title}
            unitIndex={unitIndex}
            totalUnits={moduleMeta.units.length}
            locale={locale}
            outline={outlineFromNav(navItems)}
          >
            <MDXRemote
              source={content}
              components={{
                ...mdxComponents,
                Phase: bindPretestPhase(pretest.length > 0, lc),
                SelfCheck: bindPretestEcho(bindSelfCheck(moduleMeta.checks, lc, moduleSlug), pretestIds, lc),
                InterestExample: bindInterestExample(moduleSlug, unitSlug, locale === 'en' ? 'en' : 'ru'),
                RolePlay: bindRolePlay(moduleSlug, unitSlug, locale === 'en' ? 'en' : 'ru'),
              }}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </Shell>
          </PretestProvider>
          </LessonViews>
          {/* Слой сообщества (LMS#13): записи встреч к уроку и ветка модуля в конце модуля. */}
          <CommunityUnit vm={getCommunityUnit(moduleSlug, unitSlug, nextUnit === null, locale === 'en' ? 'en' : 'ru')} />
        </main>
      </div>
      <Footer locale={locale} topics={navItems.filter(i => i.type === 'module').map(i => ({ slug: i.slug, title: i.title }))} />
      </MobileGate>
      </UnitGates>
  )
}
