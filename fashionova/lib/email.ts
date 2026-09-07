import 'server-only'

/**
 * Transactional email through Resend's REST API.
 *
 * Called directly rather than through the SDK — it is one POST, and a
 * dependency that only wraps fetch is a dependency to keep updated for no
 * gain.
 *
 * With no RESEND_API_KEY the send is skipped and reported as such, so local
 * development and the pre-launch period work without an email account and
 * without pretending a message was sent.
 */
export const emailConfigured = Boolean(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'Fashionova <atelier@fashionova.com>'

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
}): Promise<{ sent: boolean; reason?: string }> {
  if (!emailConfigured) {
    console.info(`[email] skipped (no RESEND_API_KEY): "${subject}" → ${to}`)
    return { sent: false, reason: 'not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html, reply_to: replyTo }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('[email] send failed:', response.status, detail.slice(0, 300))
      return { sent: false, reason: 'send failed' }
    }

    return { sent: true }
  } catch (error) {
    console.error('[email] transport error:', error)
    return { sent: false, reason: 'transport error' }
  }
}

/** House email styling — inline, because mail clients strip stylesheets. */
export function emailLayout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f4ee;font-family:Helvetica,Arial,sans-serif;color:#16161a">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff" cellpadding="0" cellspacing="0">
        <tr><td style="background:#0b0b0c;padding:24px 32px">
          <span style="color:#f7f4ee;font-size:13px;letter-spacing:4px;text-transform:uppercase">Fashionova</span>
        </td></tr>
        <tr><td style="padding:36px 32px">
          <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.15">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #dcd4c7">
          <p style="margin:0;font-size:12px;color:#9a8b79">Fashionova · 18 Oxford Street, Osu, Accra</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}
