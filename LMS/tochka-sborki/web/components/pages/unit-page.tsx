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
import { ModuleObjectives } from '@/components/module-objectives'
import { LessonViews } from '@/components/lesson-views'
import { getLessonViews } from '@/lib/lesson-views/load'
import { UnitRouteStep } from '@/components/intake/unit-route-step'
import type { Locale } from '@/lib/dictionaries'
import { outlineFromNav } from '@/lib/progress-sync'

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

  return (
    <UnitGates locale={locale}>
      <MobileGate locale={locale}>
      <Nav locale={locale} />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 3rem)' }}>
        <Sidebar navItems={navItems} currentSlug={moduleSlug} currentUnit={unitSlug} locale={locale} />
        <main id="main-content" tabIndex={-1} style={{ flex: 1, padding: '2rem 3rem', maxWidth: '860px' }}>
          {unitIndex === 0 && <ModuleObjectives objectives={moduleMeta.objectives} locale={locale === 'en' ? 'en' : 'ru'} />}
          <UnitRouteStep moduleSlug={moduleSlug} unitSlug={unitSlug} locale={locale === 'en' ? 'en' : 'ru'} />
          {/* Представления урока (LMS#8): вкладки есть, только если у юнита есть свежий артефакт pack'а. */}
          <LessonViews data={getLessonViews(moduleSlug, unitSlug, locale === 'en' ? 'en' : 'ru', moduleMeta.checks)} locale={locale === 'en' ? 'en' : 'ru'}>
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
                SelfCheck: bindSelfCheck(moduleMeta.checks, locale === 'en' ? 'en' : 'ru', moduleSlug),
                InterestExample: bindInterestExample(moduleSlug, unitSlug, locale === 'en' ? 'en' : 'ru'),
              }}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </Shell>
          </LessonViews>
        </main>
      </div>
      <Footer locale={locale} topics={navItems.filter(i => i.type === 'module').map(i => ({ slug: i.slug, title: i.title }))} />
      </MobileGate>
      </UnitGates>
  )
}
