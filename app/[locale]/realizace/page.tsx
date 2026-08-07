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
    <div className="bg-paper">
      <header className="container-content pb-14 pt-36 md:pb-20 md:pt-44">
        <p className="font-mono text-xs uppercase tracking-widest text-oak">{tNav('projects')}</p>
        <h1 className="mt-5 max-w-[18ch] text-balance font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-timber">
          {t('heroTitle')}
        </h1>
        <p className="mt-6 max-w-[46ch] font-body text-lg text-oak md:text-xl">
          {t('heroIntro')}
        </p>
      </header>

      <div className="container-content pb-28">
        <ProjectGallery projects={projects} enableFilter />
      </div>
    </div>
  )
}
