import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import {
  getNavigationItems,
  getLessonBySlug,
  getModuleMeta,
  isModule,
} from '@/lib/content'
import { LessonLayout } from '@/components/lesson-layout'
import { ModuleRedirect } from '@/components/module-redirect'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Sidebar } from '@/components/sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { IntakeGuard } from '@/components/intake-guard'
import { mdxComponents } from '@/components/mdx-components'
import type { Locale } from '@/lib/dictionaries'

interface Props { slug: string; locale: Locale }

export function ModulePage({ slug, locale }: Props) {
  const navItems = getNavigationItems(locale)
  const topics = navItems.filter(i => i.type === 'module').map(i => ({ slug: i.slug, title: i.title }))

  if (isModule(slug, locale)) {
    const moduleMeta = getModuleMeta(slug, locale)
    return (
      <AuthGuard locale={locale}>
        <IntakeGuard locale={locale}>
        <Nav locale={locale} />
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 3rem)' }}>
          <Sidebar navItems={navItems} currentSlug={slug} locale={locale} />
          <main id="main-content" tabIndex={-1} style={{ flex: 1, padding: '2rem 3rem' }}>
            <ModuleRedirect moduleSlug={slug} units={moduleMeta.units} locale={locale} />
          </main>
        </div>
        <Footer locale={locale} topics={topics} />
        </IntakeGuard>
      </AuthGuard>
    )
  }

  const { meta, content } = getLessonBySlug(slug, locale)

  return (
    <LessonLayout meta={meta} navItems={navItems} locale={locale}>
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </LessonLayout>
  )
}
