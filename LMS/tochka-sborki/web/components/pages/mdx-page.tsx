import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getPageContent, getAllModules } from '@/lib/content'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { mdxComponents } from '@/components/mdx-components'
import type { Locale } from '@/lib/dictionaries'

interface Props { name: string; locale: Locale }

export function MdxPage({ name, locale }: Props) {
  const { content } = getPageContent(name, locale)
  const modules = getAllModules(locale)
  return (
    <>
      <Nav locale={locale} />
      <main id="main-content" tabIndex={-1} style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 3rem' }}>
        <MDXRemote source={content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </main>
      <Footer locale={locale} topics={modules.map(m => ({ slug: m.slug, title: m.title }))} showCertificateCta={false} />
    </>
  )
}
