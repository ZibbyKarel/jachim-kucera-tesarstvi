import Image from 'next/image'

interface ImageFrameProps {
  src: string
  alt: string
  /** poměr stran, např. "4/3", "16/9", "3/4" */
  aspect?: string
  className?: string
  sizes?: string
  priority?: boolean
  rounded?: boolean
}

/**
 * Rámeček pro fotku realizace.
 *
 * Reálné fotky nejsou součástí zadání - komponenta proto vykresluje
 * technický/materiálový placeholder (jemný rastr + kótovací značky v rozích +
 * popisek), ne "chybí obrázek". Jakmile do `public{src}` přibude skutečný
 * soubor, stačí odkomentovat <Image> níže a placeholder se nahradí
 * optimalizovaným obrázkem.
 */
export function ImageFrame({
  src,
  alt,
  aspect = '4/3',
  className = '',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  rounded = true,
}: ImageFrameProps) {
  const hasRealAsset = false // přepni na true, až budou fotky v /public

  return (
    <div
      className={`group relative overflow-hidden bg-paper-dim tech-grid ${
        rounded ? 'rounded-sm' : ''
      } ${className}`}
      style={{ aspectRatio: aspect }}
    >
      {hasRealAsset ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
        >
          {/* rohové kótovací značky - signalizují "toto je záměrný rámeček", ne chybějící obrázek */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 text-oak/50"
          >
            <path d="M6 16V6h10M84 6h10v10M94 84v10H84M16 94H6V84" stroke="currentColor" strokeWidth="0.6" fill="none" />
          </svg>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="text-oak">
            <path
              d="M4 24 16 8l12 16M8 22v6h16v-6"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="max-w-[80%] font-mono text-[0.65rem] uppercase tracking-widest text-timber/70">
            {alt}
          </span>
        </div>
      )}
    </div>
  )
}
