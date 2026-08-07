import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ContactSection } from '@/components/sections/ContactSection'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.kontakt' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/kontakt' },
  }
}

/* -------------------------------------------------------------------------- */
/*  Kontakt — plná verze split layoutu z homepage (spec §D)                    */
/*                                                                              */
/*  Krátký paper otvírák (stejný duch jako Opener.tsx) nad sdílenou             */
/*  ContactSection - ta samá komponenta, co homepage a ServicePageTemplate,     */
/*  bez jakýchkoli přepínačů. Dekorativní "mapa" oblasti působnosti byla         */
/*  odstraněna (klient 2026-08-07, viz ContactSection.tsx).                     */
/* -------------------------------------------------------------------------- */

export default async function KontaktPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')

  return (
    <div className="bg-paper">
      <header className="bg-paper">
        <div className="container-content pb-14 pt-36 md:pb-20 md:pt-44">
          <p className="font-mono text-xs uppercase tracking-widest text-oak">{t('title')}</p>
          <h1 className="mt-5 max-w-[16ch] text-balance font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-timber">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 max-w-[46ch] font-body text-lg text-oak md:text-xl">
            {t('intro')}
          </p>
        </div>
      </header>

      <ContactSection />
    </div>
  )
}
