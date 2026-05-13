import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const ADMIN_EMAIL = 'fanny.saez.0486@gmail.com'

function fmtEur(v: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
}

function paymentLabel(method: string) {
  const map: Record<string, string> = {
    virement: 'Virement bancaire',
    cheque: 'Chèque',
    cb: 'Carte bancaire',
    especes: 'Espèces',
    paypal: 'PayPal',
  }
  return map[method] ?? method ?? 'Virement bancaire'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { quote, settings = {} } = await req.json()
    if (!quote) return new Response(JSON.stringify({ error: 'No quote data' }), { status: 400 })

    // Paramètres personnalisables (depuis l'admin panel)
    const businessName    = settings.businessName    || 'BambuCalc'
    const businessAddress = settings.businessAddress || '143 bis Boulevard Lafayette, 63000 Clermont-Ferrand'
    const businessPhone   = settings.businessPhone   || ''
    const senderName      = settings.senderName      || businessName
    const replyTo         = settings.replyTo         || ADMIN_EMAIL
    const primaryColor    = settings.primaryColor    || '#2e9cab'
    const customIntro     = settings.emailIntroClient || ''

    const clientDisplay =
      quote.client_name ||
      [quote.client_first_name, quote.client_last_name].filter(Boolean).join(' ') ||
      '—'
    const adresse = [
      quote.client_address,
      quote.client_postal_code,
      quote.client_city,
      quote.client_country,
    ]
      .filter(Boolean)
      .join(', ')

    // Intro client : remplace [client] par le prénom
    const clientFirstName = quote.client_first_name || clientDisplay.split(' ')[0] || clientDisplay
    const introText = customIntro
      ? customIntro.replace(/\[client\]/gi, clientFirstName)
      : `Bonjour ${clientDisplay},<br/>Voici le récapitulatif de votre devis. N'hésitez pas à nous contacter pour toute question.`

    // Footer entreprise
    const footerLines = [businessName, businessAddress, businessPhone].filter(Boolean).join(' — ')

    const sharedStyles = `
  body { font-family: Inter, Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
  .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc); padding: 28px 32px; color: #fff; }
  .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
  .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.85; }
  .body { padding: 28px 32px; }
  .intro { font-size: 15px; color: #4a5568; line-height: 1.7; margin-bottom: 24px; }
  .badge { display: inline-block; background: #e8f7f9; color: #1f7f97; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-bottom: 18px; }
  .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #a0aec0; margin: 20px 0 8px; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f4f8; font-size: 14px; }
  .info-label { color: #718096; }
  .info-value { font-weight: 700; color: #1b2f39; text-align: right; }
  .total-row { background: #e8f7f9; border-radius: 10px; padding: 14px 16px; display: flex; justify-content: space-between; margin-top: 16px; }
  .total-label { font-weight: 800; color: #1b2f39; font-size: 15px; }
  .total-value { font-weight: 800; color: ${primaryColor}; font-size: 18px; }
  .notes { background: #f7f9fc; border-radius: 10px; padding: 14px 16px; margin-top: 16px; font-size: 13px; color: #4a5568; line-height: 1.6; }
  .footer { padding: 20px 32px; background: #f7f9fc; text-align: center; font-size: 12px; color: #a0aec0; }
  a { color: ${primaryColor}; }`

    // ── Email admin ───────────────────────────────────────
    const adminHtml = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>${sharedStyles}
</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🖨️ Nouveau devis ${businessName}</h1>
    <p>Un devis vient d'être sauvegardé</p>
  </div>
  <div class="body">
    <span class="badge">${quote.quote_number ?? '—'}</span>

    <div class="section-title">Client</div>
    <div class="info-row"><span class="info-label">Nom</span><span class="info-value">${clientDisplay}</span></div>
    ${quote.client_email ? `<div class="info-row"><span class="info-label">Email</span><span class="info-value"><a href="mailto:${quote.client_email}">${quote.client_email}</a></span></div>` : ''}
    ${quote.client_phone ? `<div class="info-row"><span class="info-label">Téléphone</span><span class="info-value">${quote.client_phone}</span></div>` : ''}
    ${adresse ? `<div class="info-row"><span class="info-label">Adresse</span><span class="info-value">${adresse}</span></div>` : ''}

    <div class="section-title">Devis</div>
    <div class="info-row"><span class="info-label">Pièce</span><span class="info-value">${quote.project_name ?? '—'}</span></div>
    <div class="info-row"><span class="info-label">Matière</span><span class="info-value">${quote.material ?? '—'}</span></div>
    <div class="info-row"><span class="info-label">Quantité</span><span class="info-value">${quote.quantity ?? 1} unité(s)</span></div>
    <div class="info-row"><span class="info-label">Paiement</span><span class="info-value">${paymentLabel(quote.payment_method)}</span></div>
    ${quote.deposit_percent > 0 ? `<div class="info-row"><span class="info-label">Acompte</span><span class="info-value">${quote.deposit_percent}%</span></div>` : ''}

    <div class="total-row">
      <span class="total-label">Total TTC</span>
      <span class="total-value">${fmtEur(quote.total_cost ?? 0)}</span>
    </div>
  </div>
  <div class="footer">${footerLines}</div>
</div>
</body>
</html>`

    const emails: Promise<Response>[] = []

    // Email à l'admin
    emails.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${senderName} <noreply@bambucalc.fr>`,
          to: [ADMIN_EMAIL],
          subject: `📋 Nouveau devis ${quote.quote_number ?? ''} — ${clientDisplay}`,
          html: adminHtml,
        }),
      }),
    )

    // Email au client (si email fourni)
    if (quote.client_email) {
      const clientHtml = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>${sharedStyles}
</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🖨️ Votre devis ${businessName}</h1>
    <p>Impression 3D professionnelle</p>
  </div>
  <div class="body">
    <p class="intro">${introText}</p>
    <span class="badge">${quote.quote_number ?? '—'}</span>

    <div class="section-title">Détail de la commande</div>
    <div class="info-row"><span class="info-label">Pièce</span><span class="info-value">${quote.project_name ?? '—'}</span></div>
    <div class="info-row"><span class="info-label">Matière</span><span class="info-value">${quote.material ?? '—'}</span></div>
    <div class="info-row"><span class="info-label">Quantité</span><span class="info-value">${quote.quantity ?? 1} unité(s)</span></div>
    <div class="info-row"><span class="info-label">Mode de paiement</span><span class="info-value">${paymentLabel(quote.payment_method)}</span></div>
    ${quote.deposit_percent > 0 ? `<div class="info-row"><span class="info-label">Acompte demandé</span><span class="info-value">${quote.deposit_percent}%</span></div>` : ''}

    <div class="total-row">
      <span class="total-label">Total TTC</span>
      <span class="total-value">${fmtEur(quote.total_cost ?? 0)}</span>
    </div>

    ${quote.quote_notes ? `<div class="notes"><strong>Notes :</strong><br/>${quote.quote_notes}</div>` : ''}
  </div>
  <div class="footer">${footerLines}</div>
</div>
</body>
</html>`

      emails.push(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${senderName} <noreply@bambucalc.fr>`,
            to: [quote.client_email],
            reply_to: replyTo,
            subject: `Votre devis ${businessName} — ${quote.quote_number ?? ''} — ${quote.project_name ?? ''}`,
            html: clientHtml,
          }),
        }),
      )
    }

    await Promise.all(emails)

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
