import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-wood-dark px-6 text-center">
      <span className="font-display text-7xl italic text-wood-amber md:text-9xl">
        404
      </span>
      <h1 className="mt-4 font-display text-3xl italic text-cream md:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-4 max-w-md font-body text-base text-cream/70">
        {t('description')}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 bg-wood-amber px-6 py-3 font-body text-sm font-medium uppercase tracking-widest text-charcoal transition-colors hover:bg-wood-light"
      >
        {t('backHome')}
      </Link>
    </div>
  )
}
