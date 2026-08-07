import { useTranslations } from 'next-intl'
import type { Service } from '@/lib/types'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/ui/Reveal'
import { ContactSection } from '@/components/sections/ContactSection'
import { services } from '@/lib/constants'

/* -------------------------------------------------------------------------- */
/*  ServicePageTemplate — /sluzby/[slug], stejný jazyk jako homepage (T5/A)     */
/*                                                                              */
/*  1. Otvírák: paper, mono eyebrow (pořadové číslo + common.serviceLabel),     */
/*     font-display h1, tagline v oak. Žádný obrázkový hero, žádné tlačítko -   */
/*     stejný duch jako Opener.tsx. Fotky nejsou hlavní nosič designu (spec,    */
/*     "Organizující myšlenka"), zůstávají vyhrazené galerii níž.               */
/*  2. Popis: jeden široký sloupec max-w-[65ch] - shortDescription jako úvodní  */
/*     věta v timber, longDescription odstavce v oak.                          */
/*  3. Co zahrnuje: číslovaný rejstřík na timber poli, stejný vzor jako         */
/*     ServiceIndex na homepage, ale bez odkazů (položky, ne navigace).         */
/*  4. Galerie: ImageFrame beze změny funkce, mono popisky pod rámy jako u      */
/*     realizací na homepage.                                                  */
/*  5. Závěrečné CTA: sdílená ContactSection (stejná komponenta jako na         */
/*     homepage) s přepsaným heading/description z service.ctaHeading/ctaText, */
/*     ať nevzniká duplicitní split markup (spec: "pokud to jde sdílením        */
/*     komponenty, udělej to").                                                */
/* -------------------------------------------------------------------------- */

export function ServicePageTemplate({ service }: { service: Service }) {
  const t = useTranslations('service')
  const tCommon = useTranslations('common')
  const tService = useTranslations(`services.${service.slug}`)
  const title = tService('title')
  const longDescription = tService.raw('longDescription') as string[]
  const workItems = tService.raw('workItems') as { title: string; description: string }[]
  const galleryAlt = tService.raw('galleryAlt') as string[]
  const ordinal = services.findIndex((s) => s.slug === service.slug) + 1

  return (
    <article>
      {/* 1 — Otvírák */}
      <header className="bg-paper">
        <div className="container-content pb-14 pt-36 md:pb-20 md:pt-44">
          <p className="font-mono text-xs uppercase tracking-widest text-oak">
            {String(ordinal).padStart(2, '0')} · {tCommon('serviceLabel')}
          </p>
          <h1 className="mt-5 max-w-[16ch] text-balance font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-timber">
            {title}
          </h1>
          <p className="mt-6 max-w-[46ch] font-body text-lg text-oak md:text-xl">
            {tService('tagline')}
          </p>
        </div>
      </header>

      {/* 2 — Popis */}
      <section aria-label={t('descriptionAria')} className="bg-paper pb-20 md:pb-28">
        <div className="container-content max-w-[65ch]">
          <p className="font-body text-lg leading-relaxed text-timber md:text-xl">
            {tService('shortDescription')}
          </p>
          <Reveal stagger className="mt-8 space-y-5">
            {longDescription.map((p) => (
              <p
                key={p.slice(0, 24)}
                data-reveal-item
                className="font-body text-base leading-relaxed text-oak"
              >
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 3 — Co zahrnuje: číslovaný rejstřík na timber poli, stejný vzor jako ServiceIndex */}
      <section aria-labelledby="includes-heading" className="bg-timber py-20 md:py-28">
        <div className="container-content">
          <h2
            id="includes-heading"
            className="font-mono text-xs uppercase tracking-widest text-oak-soft"
          >
            {t('includesHeading')}
          </h2>

          <Reveal stagger as="div" className="mt-8 md:mt-12">
            {workItems.map((item, i) => (
              <div
                key={item.title}
                data-reveal-item
                className="flex flex-col gap-2 border-t border-paper/40 py-6 first:border-t-0 md:grid md:grid-cols-[auto_1fr_1.4fr] md:items-baseline md:gap-8 md:py-8"
              >
                <span className="font-mono text-sm text-oak-soft">
                  {service.workItemNumbers[i]}
                </span>
                <h3 className="font-display text-2xl text-paper md:text-3xl">
                  {item.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-oak-soft md:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 4 — Galerie: mřížka rámů s mono popiskami, jazyk realizací na homepage */}
      <section aria-labelledby="gallery-heading" className="bg-paper py-20 md:py-28">
        <div className="container-content">
          <h2 id="gallery-heading" className="font-display text-3xl text-timber md:text-4xl">
            {t('galleryHeading')}
          </h2>
          <Reveal stagger className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">
            {service.gallery.map((img, i) => (
              <div data-reveal-item key={img.src}>
                <ImageFrame
                  src={img.src}
                  alt={galleryAlt[i]}
                  aspect="4/3"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <p className="mt-3 border-t border-timber/20 pt-3 font-mono text-xs uppercase tracking-widest text-oak">
                  {galleryAlt[i]}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 5 — Závěrečné CTA: sdílený split se stejnou vizuální gramatikou jako homepage */}
      <ContactSection heading={t('ctaHeading')} description={t('ctaText')} />
    </article>
  )
}
