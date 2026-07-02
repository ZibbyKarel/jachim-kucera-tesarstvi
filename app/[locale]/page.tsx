import { HeroScroll } from '@/components/house/HeroScroll'
import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { ProjectsPreview } from '@/components/sections/ProjectsPreview'
import { ServicesScroll } from '@/components/sections/ServicesScroll'
import { StackCover } from '@/components/sections/StackCover'
import { Link } from '@/i18n/routing'
import { houseLabels } from '@/lib/constants'
import type { HouseLabel, NavLink } from '@/lib/types'
import { setRequestLocale, getTranslations } from 'next-intl/server'

function labelText(t: (key: string) => string, source: NavLink['textSource']) {
  return source.ns === 'service' ? t(`services.${source.slug}.title`) : t(`nav.${source.key}`)
}

function labelSubtext(t: (key: string) => string, label: HouseLabel) {
  return t(`houseLabels.${label.key}`)
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  return (
    <>
      {/* 1A — Hero: interaktivní dům „na papíře" se scroll choreografií.
          z-0: papírový panel na konci dráhy odplyne a navazující sekce (z-10)
          ho plynule překryje („je tu víc"). */}
      <section
        aria-label={t('home.heroAria')}
        className="relative z-0 bg-wood-dark"
      >
        <HeroScroll />

        {/* Přístupná / crawlovatelná navigace (vždy v SSR HTML, vizuálně skrytá). */}
        <nav aria-label={t('common.houseNavAria')} className="sr-only">
          <ul>
            {houseLabels.map((label) => (
              <li key={label.id}>
                <Link href={label.href}>
                  {labelText(t, label.textSource)} — {labelSubtext(t, label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {/* Jednotné překrytí: každá sekce na konci zamrzne (pin) a další po ní vyjede,
          dokud ji KOMPLETNĚ nezakryje (jako Služby zakryjí hero). Každá zamrzlá
          sekce nechá 100vh „dráhu", kterou nástupce svým −100vh náběhem zruší a
          šplhá přes ni. Hero drží sticky panel (viz HeroScroll) → také nechá 100vh. */}

      {/* 1B — Služby (vyjedou přes hero). Mají vlastní vnitřní pin (rozdání karet /
          horizontální pás / mobilní držení), jehož koncový úsek = 100vh výdrž →
          proto pin={false}, jinak by se dva piny v jednom regionu praly a scrub
          zamrznul (karty se rozdaly mimo okno). Náběh (climb) přes hero zůstává. */}
      <StackCover z={20} pin={false}>
        <ServicesScroll />
      </StackCover>

      {/* 1C — Realizace (vyjedou přes Služby) */}
      <StackCover z={30}>
        <ProjectsPreview />
      </StackCover>

      {/* 1D — O nás (vyjedou přes Realizace) */}
      <StackCover z={40}>
        <AboutSection />
      </StackCover>

      {/* 1E — Kontakt (vyjede přes O nás; poslední → už se nepinnuje) */}
      <StackCover z={50} pin={false}>
        <ContactSection />
      </StackCover>
    </>
  )
}
