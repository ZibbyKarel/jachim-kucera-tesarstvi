import { useTranslations } from 'next-intl'
import type { Service } from '@/lib/types'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/ui/Reveal'
import { Button, Arrow } from '@/components/ui/Button'
import { SITE } from '@/lib/constants'

export function ServicePageTemplate({ service }: { service: Service }) {
  const t = useTranslations('service')
  const tCommon = useTranslations('common')
  const tService = useTranslations(`services.${service.slug}`)
  const title = tService('title')
  const longDescription = tService.raw('longDescription') as string[]
  const workItems = tService.raw('workItems') as { title: string; description: string }[]
  const galleryAlt = tService.raw('galleryAlt') as string[]

  return (
    <article>
      {/* 1 — Hero */}
      <header className="relative h-[72vh] min-h-[460px] w-full overflow-hidden">
        <ImageFrame
          src={service.heroImage}
          alt={`${tCommon('serviceLabel')} — ${title}`}
          aspect="16/9"
          aged={false}
          rounded={false}
          priority
          sizes="100vw"
          className="!absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wood-dark via-wood-dark/50 to-wood-dark/20" />
        <div className="container-content absolute inset-x-0 bottom-0">
          <div className="pb-14">
            <span className="eyebrow">{tCommon('serviceLabel')} · {tCommon('region')}</span>
            <h1 className="mt-3 font-display text-6xl italic leading-none text-cream md:text-8xl">
              {title}
            </h1>
            <p className="mt-4 max-w-md font-body text-lg text-cream/70">
              {tService('tagline')}
            </p>
          </div>
        </div>
      </header>

      {/* 2 — Popis */}
      <section
        aria-label={t('descriptionAria')}
        className="bg-wood-dark py-20 md:py-28"
      >
        <div className="container-content grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <Reveal>
            <p className="font-display text-2xl italic leading-snug text-wood-amber md:sticky md:top-28">
              {tService('shortDescription')}
            </p>
          </Reveal>
          <Reveal stagger className="space-y-5">
            {longDescription.map((p) => (
              <p
                key={p.slice(0, 24)}
                data-reveal-item
                className="font-body text-base leading-relaxed text-cream/75"
              >
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 3 — Co zahrnuje */}
      <section
        aria-labelledby="includes-heading"
        className="border-t border-cream/10 bg-wood-medium py-20 md:py-28"
      >
        <div className="container-content">
          <h2
            id="includes-heading"
            className="font-display text-3xl italic text-cream md:text-4xl"
          >
            {t('includesHeading')}
          </h2>
          <Reveal stagger className="mt-12 grid gap-px overflow-hidden rounded-sm border border-cream/10 bg-cream/10 sm:grid-cols-2">
            {workItems.map((item, i) => (
              <div
                key={item.title}
                data-reveal-item
                className="group flex gap-6 bg-wood-medium p-8 transition-colors duration-500 hover:bg-wood-dark md:p-10"
              >
                <span className="font-display text-4xl italic text-wood-warm transition-colors duration-500 group-hover:text-wood-amber">
                  {service.workItemNumbers[i]}
                </span>
                <div>
                  <h3 className="font-display text-2xl italic text-cream">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-cream/65">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 4 — Galerie */}
      <section
        aria-labelledby="gallery-heading"
        className="bg-wood-dark py-20 md:py-28"
      >
        <div className="container-content">
          <h2
            id="gallery-heading"
            className="font-display text-3xl italic text-cream md:text-4xl"
          >
            {t('galleryHeading')}
          </h2>
          <Reveal
            stagger
            className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6"
          >
            {service.gallery.map((img, i) => (
              <div data-reveal-item key={img.src}>
                <ImageFrame
                  src={img.src}
                  alt={galleryAlt[i]}
                  aspect="4/3"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 5 — CTA */}
      <section className="border-t border-cream/10 bg-wood-medium py-20 md:py-28">
        <div className="container-content flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl italic text-cream md:text-4xl">
              {t('ctaHeading')}
            </h2>
            <p className="mt-3 max-w-md font-body text-base text-cream/70">
              {t('ctaText')}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button href="/kontakt" size="lg">
              {tCommon('nonbindingInquiry')} <Arrow />
            </Button>
            <a
              href={`tel:${SITE.phoneHref}`}
              className="inline-flex items-center justify-center border border-cream/30 px-8 py-4 font-body text-base font-medium uppercase tracking-widest text-cream transition-colors hover:border-wood-amber hover:text-wood-amber"
            >
              {SITE.phone}
            </a>
          </div>
        </div>
      </section>
    </article>
  )
}
