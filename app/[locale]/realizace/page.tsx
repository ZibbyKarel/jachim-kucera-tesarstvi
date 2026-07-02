import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { projects } from '@/lib/constants'
import { ProjectGallery } from '@/components/ui/ProjectGallery'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.realizace' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/realizace' },
  }
}

export default async function RealizacePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('realizacePage')
  const tNav = await getTranslations('nav')

  return (
    <div className="bg-wood-dark">
      <header className="container-content pb-12 pt-36 md:pt-44">
        <span className="eyebrow">{tNav('projects')}</span>
        <h1 className="mt-3 max-w-3xl font-display text-5xl italic leading-tight text-cream md:text-7xl">
          {t('heroTitle')}
        </h1>
        <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-cream/70">
          {t('heroIntro')}
        </p>
      </header>

      <div className="container-content pb-28">
        <ProjectGallery projects={projects} enableFilter />
      </div>
    </div>
  )
}
