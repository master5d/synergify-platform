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
import type { Locale } from '@/lib/dictionaries'

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
          <Shell
            moduleSlug={moduleSlug}
            unitSlug={unitSlug}
            nextUnitSlug={nextUnit?.slug ?? null}
            moduleTitle={moduleMeta.title}
            unitIndex={unitIndex}
            totalUnits={moduleMeta.units.length}
            locale={locale}
          >
            <MDXRemote
              source={content}
              components={mdxComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </Shell>
        </main>
      </div>
      <Footer locale={locale} topics={navItems.filter(i => i.type === 'module').map(i => ({ slug: i.slug, title: i.title }))} />
      </MobileGate>
      </UnitGates>
  )
}
