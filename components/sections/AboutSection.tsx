'use client'

import { Arrow, Button } from '@/components/ui/Button'
import { Counter } from '@/components/ui/Counter'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/ui/Reveal'
import { aboutStats, aboutStory } from '@/lib/constants'
import { useTranslations } from 'next-intl'

export function AboutSection() {
  const t = useTranslations('home')

  return (
    <section
      aria-labelledby="about-heading"
      className="relative overflow-hidden bg-wood-medium py-24 md:py-32"
    >
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="container-content relative grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <Reveal>
          <ImageFrame
            src="/images/tym/tym-01.jpg"
            alt="Jáchim a Kučera se svou partou na střeše"
            aspect="4/5"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </Reveal>

        <Reveal stagger>
          <span className="eyebrow" data-reveal-item>
            {t('aboutHeading')}
          </span>
          <h2
            id="about-heading"
            data-reveal-item
            className="mt-4 font-display text-4xl italic leading-tight text-cream md:text-5xl"
          >
            Stavíme střechy, jako by byly naše vlastní
          </h2>
          {aboutStory.slice(0, 2).map((p) => (
            <p
              key={p.slice(0, 24)}
              data-reveal-item
              className="mt-5 max-w-prose font-body text-base leading-relaxed text-cream/75"
            >
              {p}
            </p>
          ))}

          <div
            data-reveal-item
            className="mt-10 grid grid-cols-2 gap-4 border-y border-cream/10 py-8"
          >
            {aboutStats.map((s) => (
              <Counter key={s.label} value={s.value} label={s.label} />
            ))}
          </div>

          <div data-reveal-item className="mt-8">
            <Button href="/o-nas" variant="outline">
              Náš příběh <Arrow />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
