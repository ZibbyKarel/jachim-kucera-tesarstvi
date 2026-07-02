export const runtime = 'nodejs'

const PHONE_RE = /^(\+|00)?\d[\d\s/-]{7,15}$/

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const phone = String(body.phone ?? '').trim()
  const message = String(body.message ?? '').trim()
  const honeypot = String(body.website ?? '').trim()

  // Honeypot — bot vyplnil skryté pole. Tváříme se úspěšně, ale nic neposíláme.
  if (honeypot) {
    return Response.json({ success: true })
  }

  // Serverová validace.
  if (!name) {
    return Response.json({ error: 'name_required' }, { status: 422 })
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return Response.json({ error: 'phone_invalid' }, { status: 422 })
  }
  if (!message) {
    return Response.json({ error: 'message_required' }, { status: 422 })
  }

  const accessKey = process.env.WEB3FORMS_KEY
  if (!accessKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[contact] WEB3FORMS_KEY chybí — poptávka:', {
        name,
        phone,
        message,
      })
      return Response.json({ success: true, dev: true })
    }
    return Response.json({ error: 'not_configured' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `Nová poptávka — ${name}`,
        from_name: 'Web — Jáchim & Kučera',
        name,
        phone,
        message,
        botcheck: '', // Web3Forms honeypot must be empty
      }),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok || !data?.success) {
      console.error('[contact] Web3Forms error:', data)
      return Response.json({ error: 'send_failed' }, { status: 502 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[contact] Unexpected error:', err)
    return Response.json({ error: 'send_failed' }, { status: 502 })
  }
}
