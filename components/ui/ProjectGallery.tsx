'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import type { Project, ProjectCategory } from '@/lib/types'
import { ImageFrame } from './ImageFrame'

type Filter = ProjectCategory | 'all'

/** Focusovatelné potomky uvnitř kontejneru, ve skutečném pořadí v DOM.
 *  Filtrováno přes `tabIndex` (DOM property, ne atribut) - zachytí i
 *  `tabIndex={-1}` nastavený přes React props (zavírací overlay tlačítko,
 *  samotný dialog kontejner), což čistě atributový CSS selektor nezachytí
 *  spolehlivě u prvků, které jsou nativně focusovatelné bez [tabindex]. */
function getFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(
    'a[href], button, textarea, input, select, [tabindex]'
  )
  return Array.from(nodes).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1
  )
}

export function ProjectGallery({
  projects,
  enableFilter = true,
}: {
  projects: Project[]
  enableFilter?: boolean
}) {
  const t = useTranslations('projects')
  const tFull = useTranslations()
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<Project | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  // Tlačítko, které modal otevřelo - fokus se na něj musí vrátit po zavření.
  const triggerRef = useRef<HTMLElement | null>(null)

  const closeModal = () => {
    setSelected(null)
    triggerRef.current?.focus()
  }

  const visible =
    filter === 'all' ? projects : projects.filter((p) => p.category === filter)

  // Animace přechodu mezi filtry.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-project-card]',
        { opacity: 0, scale: 0.96, y: 16 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
        }
      )
    }, gridRef)
    return () => ctx.revert()
  }, [filter])

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('filterAll') },
    { key: 'tesarstvi', label: tFull('services.tesarstvi.title') },
    { key: 'pokryvacstvi', label: tFull('services.pokryvacstvi.title') },
    { key: 'klempirstvi', label: tFull('services.klempirstvi.title') },
  ]

  return (
    <div>
      {enableFilter && (
        <div
          role="tablist"
          aria-label={t('filterAria')}
          className="mb-10 flex flex-wrap gap-3"
        >
          {filters.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-5 py-2 font-body text-xs uppercase tracking-widest transition-colors duration-300 ${
                  active
                    ? 'border-patina bg-patina text-paper'
                    : 'border-slate/20 text-slate/70 hover:border-slate/50 hover:text-slate'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      )}

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((project, i) => {
          const title = tFull(`projectsData.${project.id}.title`)
          const location = tFull(`projectsData.${project.id}.location`)
          return (
            <article
              key={project.id}
              data-project-card
              className={
                // jemný masonry rytmus — každá pátá karta vyšší
                i % 5 === 0 ? 'sm:row-span-2' : ''
              }
            >
              <button
                onClick={(e) => {
                  triggerRef.current = e.currentTarget
                  setSelected(project)
                }}
                className="group block w-full text-left"
                aria-label={`${title}, ${location}, ${project.year}, ${t('viewDetailAria')}`}
              >
                <ImageFrame
                  src={project.thumbnail}
                  alt={`${title}, ${location}`}
                  aspect={i % 5 === 0 ? '3/4' : '4/3'}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="mt-3 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl italic text-slate transition-colors group-hover:text-patina">
                    {title}
                  </h3>
                  <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-steel">
                    {project.year}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-steel">
                  {tFull(`services.${project.category}.title`)} · {location}
                </p>
              </button>
            </article>
          )
        })}
      </div>

      {selected && <ProjectModal project={selected} onClose={closeModal} />}
    </div>
  )
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const t = useTranslations('projects')
  const tFull = useTranslations()
  const dialogRef = useRef<HTMLDivElement>(null)
  const title = tFull(`projectsData.${project.id}.title`)
  const location = tFull(`projectsData.${project.id}.location`)
  const description = tFull(`projectsData.${project.id}.description`)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      // Focus trap: Tab/Shift+Tab nesmí uniknout ze stránky pod modalem.
      if (e.key === 'Tab') {
        const dialog = dialogRef.current
        if (!dialog) return
        const focusable = getFocusable(dialog)
        if (focusable.length === 0) {
          e.preventDefault()
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement
        if (e.shiftKey) {
          if (active === first || !dialog.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else if (active === last || !dialog.contains(active)) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        className="absolute inset-0 bg-slate/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t('closeDetailAria')}
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="animate-fade-up relative z-10 max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-sm border border-slate/10 bg-paper p-6 outline-none md:p-10"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate/20 text-slate transition-colors hover:border-patina hover:text-patina"
          aria-label={tFull('common.close')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M3 3l10 10M13 3 3 13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <span className="eyebrow">
          {tFull(`services.${project.category}.title`)} · {location} · {project.year}
        </span>
        <h2 className="mt-3 font-display text-4xl italic text-slate">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-slate/70">
          {description}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.images.map((img, i) => (
            <ImageFrame
              key={img}
              src={img}
              alt={`${title}, ${t('photoAlt')} ${i + 1}`}
              aspect="4/3"
            />
          ))}
        </div>

        <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-3 border-t border-slate/10 pt-6 font-body text-sm">
          <div>
            <dt className="text-xs uppercase tracking-widest text-steel">
              {t('location')}
            </dt>
            <dd className="mt-1 text-slate">{location}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-steel">
              {t('year')}
            </dt>
            <dd className="mt-1 font-mono text-slate">{project.year}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
