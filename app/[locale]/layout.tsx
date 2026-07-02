import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { SITE } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '../globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  const tSeo = await getTranslations({ locale, namespace: 'seo' })

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.name} | ${t('region')}`,
      template: `%s | ${SITE.shortName}`,
    },
    description: tSeo('siteDescription'),
    keywords: tSeo.raw('keywords') as string[],
    authors: [{ name: SITE.shortName }],
    openGraph: {
      type: 'website',
      locale: tSeo('ogLocale'),
      url: SITE.url,
      siteName: SITE.name,
      title: SITE.name,
      description: tSeo('siteDescription'),
      images: [
        {
          url: '/logo.jpg',
          width: 1200,
          height: 1200,
          alt: SITE.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE.name,
      description: tSeo('siteDescription'),
      images: ['/logo.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

interface SeoTranslator {
  (key: string): string
  raw: (key: string) => unknown
}

function buildJsonLd(tSeo: SeoTranslator, locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    description: tSeo('jsonLdDescription'),
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    image: `${SITE.url}/logo.jpg`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressRegion: tSeo('addressRegion'),
      addressCountry: 'CZ',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: tSeo('addressRegion'),
    },
    serviceType: tSeo.raw('serviceTypes') as string[],
    knowsLanguage: ['cs', 'en'],
    inLanguage: locale,
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'cs' | 'en')) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()
  const t = await getTranslations('common')
  const tSeo = (await getTranslations('seo')) as unknown as SeoTranslator
  const jsonLd = buildJsonLd(tSeo, locale)

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main-content"
            className="sr-only rounded-md bg-wood-amber px-4 py-2 font-body text-sm font-medium text-charcoal focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]"
          >
            {t('skipToContent')}
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
