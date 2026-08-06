'use client'

import { useTranslations } from 'next-intl'
import { SITE } from '@/lib/constants'
import { ContactForm } from '@/components/ui/ContactForm'
import { Reveal } from '@/components/ui/Reveal'

export function ContactSection() {
  const t = useTranslations()

  return (
    <section
      id="kontakt"
      aria-labelledby="contact-cta-heading"
      className="relative min-h-[100dvh] overflow-hidden bg-paper py-24 shadow-panel-20 md:py-32"
    >
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="container-content relative">
        <Reveal className="text-center">
          <h2
            id="contact-cta-heading"
            className="font-display text-4xl italic text-slate md:text-5xl"
          >
            {t('home.contactHeadline')}
          </h2>
          <a
            href={`tel:${SITE.phoneHref}`}
            className="mt-8 inline-block font-mono text-4xl text-patina transition-colors hover:text-patina-dim md:text-6xl"
          >
            {SITE.phone}
          </a>
          <p className="mt-4 font-body text-sm uppercase tracking-widest text-slate/65">
            {t('common.region')}
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mx-auto mt-16 max-w-2xl rounded-sm border border-slate/10 bg-paper-dim/60 p-8 md:p-10"
        >
          <ContactForm compact />
        </Reveal>
      </div>
    </section>
  )
}
