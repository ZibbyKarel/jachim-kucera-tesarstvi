'use client'

import { useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { SITE } from '@/lib/constants'

type FieldErrors = Partial<Record<'name' | 'phone' | 'message', string>>

// Volné CZ/SK telefonní formáty: +420 777 123 456, 777123456, 00420…
const PHONE_RE = /^(\+|00)?\d[\d\s/-]{7,15}$/

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('contact')
  const uid = useId()
  const formRef = useRef<HTMLFormElement>(null)

  const [values, setValues] = useState({
    name: '',
    phone: '',
    message: '',
    website: '', // honeypot
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [serverError, setServerError] = useState<string | null>(null)

  const fid = (name: string) => `${uid}-${name}`

  const validateField = (name: keyof FieldErrors, value: string): string => {
    if (name === 'name' && !value.trim()) return t('errors.nameRequired')
    if (name === 'phone') {
      if (!value.trim()) return t('errors.phoneRequired')
      if (!PHONE_RE.test(value.trim())) return t('errors.phoneInvalid')
    }
    if (name === 'message' && !value.trim()) return t('errors.messageRequired')
    return ''
  }

  const onBlur = (name: keyof FieldErrors) => {
    const msg = validateField(name, values[name])
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }))
  }

  const onChange = (name: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (name in errors && errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: FieldErrors = {
      name: validateField('name', values.name) || undefined,
      phone: validateField('phone', values.phone) || undefined,
      message: validateField('message', values.message) || undefined,
    }
    setErrors(next)
    if (next.name || next.phone || next.message) {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]'
      )
      firstInvalid?.focus()
      return
    }

    setStatus('loading')
    setServerError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'send_failed')
      }
      setStatus('success')
      setValues({ name: '', phone: '', message: '', website: '' })
    } catch {
      setStatus('error')
      setServerError(t('errors.generic', { phone: SITE.phone }))
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="animate-fade-up flex flex-col items-start gap-4 rounded-sm border border-wood-amber/40 bg-wood-amber/10 p-8"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="var(--wood-amber)"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M12 20.5 18 26 28 14"
            stroke="var(--wood-amber)"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="font-display text-2xl italic text-cream">{t('success')}</p>
        <button
          onClick={() => setStatus('idle')}
          className="font-body text-xs uppercase tracking-widest text-wood-amber hover:text-wood-warm"
        >
          {t('submitAnother')}
        </button>
      </div>
    )
  }

  const inputClass = (invalid?: boolean) =>
    `w-full border-b bg-transparent py-3 font-body text-cream placeholder-cream/30 outline-none transition-colors duration-300 focus:border-wood-amber ${
      invalid ? 'border-red-600/70' : 'border-cream/25'
    }`

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot — skrytý před uživateli */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={values.website}
        onChange={(e) => onChange('website', e.target.value)}
        style={{ display: 'none' }}
      />

      <div className={compact ? 'grid gap-6 sm:grid-cols-2' : 'space-y-6'}>
        <div>
          <label
            htmlFor={fid('name')}
            className="mb-1 block font-body text-xs uppercase tracking-widest text-cream/60"
          >
            {t('name')} *
          </label>
          <input
            id={fid('name')}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            onBlur={() => onBlur('name')}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? fid('name-err') : undefined}
            className={inputClass(!!errors.name)}
            placeholder={t('namePlaceholder')}
          />
          {errors.name && (
            <p id={fid('name-err')} className="mt-1 text-sm text-red-700">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={fid('phone')}
            className="mb-1 block font-body text-xs uppercase tracking-widest text-cream/60"
          >
            {t('phone')} *
          </label>
          <input
            id={fid('phone')}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            onBlur={() => onBlur('phone')}
            aria-invalid={errors.phone ? 'true' : undefined}
            aria-describedby={errors.phone ? fid('phone-err') : undefined}
            className={inputClass(!!errors.phone)}
            placeholder="+420 777 123 456"
          />
          {errors.phone && (
            <p id={fid('phone-err')} className="mt-1 text-sm text-red-700">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={fid('message')}
          className="mb-1 block font-body text-xs uppercase tracking-widest text-cream/60"
        >
          {t('message')} *
        </label>
        <textarea
          id={fid('message')}
          name="message"
          rows={compact ? 3 : 4}
          value={values.message}
          onChange={(e) => onChange('message', e.target.value)}
          onBlur={() => onBlur('message')}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? fid('message-err') : undefined}
          className={`${inputClass(!!errors.message)} resize-none`}
          placeholder={t('messagePlaceholder')}
        />
        {errors.message && (
          <p id={fid('message-err')} className="mt-1 text-sm text-red-700">
            {errors.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-700">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center justify-center gap-2 bg-wood-amber px-8 py-4 font-body text-sm font-medium uppercase tracking-widest text-charcoal transition-all duration-300 hover:bg-wood-light disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading' ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-charcoal/30 border-t-charcoal" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  )
}
