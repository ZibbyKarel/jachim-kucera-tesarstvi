import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { House3DPreview } from './House3DPreview'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.nahled3d' })
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  }
}

export default async function House3DPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <House3DPreview />
}
