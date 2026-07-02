import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getService } from '@/lib/constants'
import { ServicePageTemplate } from '@/components/sections/ServicePageTemplate'

const SLUG = 'tesarstvi'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: `services.${SLUG}` })
  const service = getService(SLUG)!
  const title = t('seoTitle')
  const description = t('seoDescription')
  return {
    title,
    description,
    alternates: { canonical: `/sluzby/${SLUG}` },
    openGraph: { title, description, images: [{ url: service.heroImage }] },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const service = getService(SLUG)
  if (!service) notFound()
  return <ServicePageTemplate service={service} />
}
