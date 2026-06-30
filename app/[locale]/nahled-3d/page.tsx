import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { House3DPreview } from './House3DPreview'

export const metadata: Metadata = {
  title: '3D rozcestník — náhled',
  robots: { index: false, follow: false },
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
