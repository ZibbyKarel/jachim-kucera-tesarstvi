'use client'

import { useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { SITE } from '@/lib/constants'

type FieldErrors = Partial<Record<'name' | 'phone' | 'message', string>>

// Volné CZ/SK telefonní formáty: +420 123 456 789, 123456789, 00420…
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
        className="animate-fade-up flex flex-col items-start gap-4 rounded-sm border border-ember bg-ember/10 p-8"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          aria-hidden="true"
          className="text-ember"
        >
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M12 20.5 18 26 28 14"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="font-display text-2xl italic text-timber">{t('success')}</p>
        <button
          onClick={() => setStatus('idle')}
          className="inline-flex min-h-11 items-center rounded-sm font-body text-xs uppercase tracking-widest text-ember transition-colors hover:text-ember-dim"
        >
          {t('submitAnother')}
        </button>
      </div>
    )
  }

  const inputClass = (invalid?: boolean) =>
    // border-timber/N as a border/line on paper needs N≥50 per
    // docs/superpowers/redesign/PALETTE-WOOD.md - /55 clears that floor
    // (this is the input's only visible edge: underline style, no fill).
    // placeholder text is treated as real visible text (timber/N on paper
    // needs N≥65), not decoration.
    `w-full rounded-sm border-b bg-transparent py-3 font-body text-timber placeholder-timber/65 outline-none transition-colors duration-300 focus:border-ember ${
      invalid ? 'border-red-600/85' : 'border-timber/55'
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
            className="mb-1 block font-body text-xs uppercase tracking-widest text-timber/70"
          >
            {t('name')}{' '}
            <span aria-hidden="true" className="text-ember">
              *
            </span>
          </label>
          <input
            id={fid('name')}
            name="name"
            type="text"
            required
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
            <p id={fid('name-err')} role="alert" className="mt-1 text-sm text-red-700">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={fid('phone')}
            className="mb-1 block font-body text-xs uppercase tracking-widest text-timber/70"
          >
            {t('phone')}{' '}
            <span aria-hidden="true" className="text-ember">
              *
            </span>
          </label>
          <input
            id={fid('phone')}
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            onBlur={() => onBlur('phone')}
            aria-invalid={errors.phone ? 'true' : undefined}
            aria-describedby={errors.phone ? fid('phone-err') : undefined}
            className={`${inputClass(!!errors.phone)} font-mono`}
            placeholder="+420 123 456 789"
          />
          {errors.phone && (
            <p id={fid('phone-err')} role="alert" className="mt-1 text-sm text-red-700">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={fid('message')}
          className="mb-1 block font-body text-xs uppercase tracking-widest text-timber/70"
        >
          {t('message')}{' '}
          <span aria-hidden="true" className="text-ember">
            *
          </span>
        </label>
        <textarea
          id={fid('message')}
          name="message"
          required
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
          <p id={fid('message-err')} role="alert" className="mt-1 text-sm text-red-700">
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
        aria-busy={status === 'loading'}
        className="inline-flex items-center justify-center gap-2 rounded-sm bg-ember px-8 py-4 font-body text-sm font-medium uppercase tracking-widest text-paper transition-all duration-300 hover:bg-ember-dim disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading' ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper"
            />
            <span role="status">{t('submitting')}</span>
          </>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  )
}
