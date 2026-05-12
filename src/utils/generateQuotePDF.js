import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { company } from '../config/company'

const TEAL   = [46, 156, 171]
const DARK   = [27, 47, 57]
const GREY   = [113, 128, 150]
const LIGHT  = [240, 244, 248]
const WHITE  = [255, 255, 255]

const STATUS_MAP = {
  pending:  { label: 'En attente', color: [214, 158, 46],  bg: [255, 247, 230] },
  accepted: { label: 'Accepté',    color: [39,  174, 96],  bg: [230, 255, 240] },
  refused:  { label: 'Refusé',     color: [229, 62,  62],  bg: [255, 230, 230] },
  sent:     { label: 'Envoyé',     color: [66,  153, 225], bg: [230, 243, 255] },
}

function statusInfo(status) {
  return STATUS_MAP[status] || STATUS_MAP.pending
}

function fmtEur(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
}

function addValidityDate(quoteDate, days) {
  if (!quoteDate || !days) return '—'
  const d = new Date(quoteDate)
  d.setDate(d.getDate() + Number(days))
  return fmtDate(d.toISOString())
}

function paymentLabel(method) {
  const map = {
    virement: 'Virement bancaire',
    cheque: 'Chèque',
    cb: 'Carte bancaire',
    especes: 'Espèces',
    paypal: 'PayPal',
  }
  return map[method] || method || 'Virement bancaire'
}

export function generateQuotePDF(quote) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 14

  // ── En-tête ──────────────────────────────────────────────
  doc.setFillColor(...TEAL)
  doc.rect(0, 0, W, 28, 'F')

  doc.setTextColor(...WHITE)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('BambuCalc', margin, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Impression 3D professionnelle', margin, 18)
  if (company.website) doc.text(company.website, margin, 23)

  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('DEVIS', W - margin, 14, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(quote.quote_number || '', W - margin, 20, { align: 'right' })

  // ── Infos devis (bandeau gris) ────────────────────────────
  doc.setFillColor(...LIGHT)
  doc.rect(0, 28, W, 14, 'F')

  doc.setTextColor(...GREY)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')

  const st = statusInfo(quote.status)
  const infoItems = [
    ['Date d\'émission', fmtDate(quote.quote_date)],
    ['Validité', addValidityDate(quote.quote_date, quote.quote_validity_days || 30)],
    ['Durée validité', `${quote.quote_validity_days || 30} jours`],
  ]

  const colW = (W - margin * 2) / (infoItems.length + 1)
  infoItems.forEach(([label, value], i) => {
    const x = margin + i * colW
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GREY)
    doc.text(label.toUpperCase(), x, 34)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    doc.text(value, x, 39)
  })

  // Badge statut coloré
  const badgeX = margin + infoItems.length * colW
  const badgeW = colW - 2
  doc.setFillColor(...st.bg)
  doc.roundedRect(badgeX, 29, badgeW, 10, 3, 3, 'F')
  doc.setDrawColor(...st.color)
  doc.setLineWidth(0.5)
  doc.roundedRect(badgeX, 29, badgeW, 10, 3, 3, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...st.color)
  doc.text('STATUT', badgeX + badgeW / 2, 33.5, { align: 'center' })
  doc.setFontSize(9)
  doc.text(st.label, badgeX + badgeW / 2, 37.5, { align: 'center' })

  // ── Deux colonnes : Client | Prestataire ──────────────────
  let y = 50
  const colLeft  = margin
  const colRight = W / 2 + 3

  // Titres colonnes
  doc.setFillColor(...TEAL)
  doc.roundedRect(colLeft,  y - 5, W / 2 - 5, 7, 2, 2, 'F')
  doc.roundedRect(colRight, y - 5, W / 2 - 3, 7, 2, 2, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENT', colLeft + 3, y)
  doc.text('PRESTATAIRE', colRight + 3, y)

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  doc.setFontSize(9)

  // Bloc client
  const clientLines = []
  const clientName = quote.client_name || [quote.client_first_name, quote.client_last_name].filter(Boolean).join(' ')
  if (clientName) clientLines.push({ text: clientName, bold: true })
  if (quote.client_contact_name) clientLines.push({ text: `Contact : ${quote.client_contact_name}` })
  if (quote.client_address) clientLines.push({ text: quote.client_address })
  const cityLine = [quote.client_postal_code, quote.client_city].filter(Boolean).join(' ')
  if (cityLine) clientLines.push({ text: cityLine })
  if (quote.client_country && quote.client_country !== 'France') clientLines.push({ text: quote.client_country })
  if (quote.client_email) clientLines.push({ text: quote.client_email, color: TEAL })
  if (quote.client_phone) clientLines.push({ text: quote.client_phone })
  if (quote.client_siret) clientLines.push({ text: `SIRET : ${quote.client_siret}`, color: GREY })
  if (quote.client_vat_number) clientLines.push({ text: `TVA : ${quote.client_vat_number}`, color: GREY })

  // Bloc prestataire
  const providerLines = [
    { text: company.name, bold: true },
    { text: company.ownerName },
    { text: company.address },
    { text: [company.postalCode, company.city].filter(Boolean).join(' ') },
    { text: company.email, color: TEAL },
    company.phone ? { text: company.phone } : null,
    company.siret ? { text: `SIRET : ${company.siret}`, color: GREY } : null,
    company.vatNumber ? { text: `TVA : ${company.vatNumber}`, color: GREY } : null,
  ].filter(Boolean)

  const maxLines = Math.max(clientLines.length, providerLines.length)

  for (let i = 0; i < maxLines; i++) {
    const cl = clientLines[i]
    const pl = providerLines[i]
    const lineY = y + 5 + i * 5

    if (cl) {
      doc.setFont('helvetica', cl.bold ? 'bold' : 'normal')
      doc.setTextColor(...(cl.color || DARK))
      doc.text(cl.text, colLeft, lineY)
    }
    if (pl) {
      doc.setFont('helvetica', pl.bold ? 'bold' : 'normal')
      doc.setTextColor(...(pl.color || DARK))
      doc.text(pl.text, colRight, lineY)
    }
  }

  // ── Objet du devis ────────────────────────────────────────
  y = y + 5 + maxLines * 5 + 8

  doc.setFillColor(...LIGHT)
  doc.rect(margin, y, W - margin * 2, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.text('OBJET :', margin + 3, y + 4)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  doc.text(quote.project_name || '—', margin + 22, y + 4)

  // ── Tableau des prestations ───────────────────────────────
  y += 15

  const taxRate = quote.tax_rate ?? 20
  const unitPriceHT = (quote.cost_per_unit || 0) / (1 + taxRate / 100)
  const totalHT     = unitPriceHT * (quote.quantity || 1)
  const totalTVA    = (quote.total_cost || 0) - totalHT
  const printerLabel = {
    'p2s-combo': 'Bambu P2S Combo',
    'p2s-mono': 'Bambu P2S Monocouleur',
    'x1c': 'Bambu X1C',
    'a1-mini': 'Bambu A1 Mini',
    'a1': 'Bambu A1',
  }[quote.printer_model] || quote.printer_model || '—'

  const desc = [
    `Impression 3D — ${quote.project_name || '—'}`,
    `Matière : ${quote.material || '—'} | Imprimante : ${printerLabel} | Buse : ${quote.nozzle_size || '—'} mm`,
    `Profil : ${quote.print_profile || '—'} | Poids total : ${quote.weight || 0} g`,
  ].join('\n')

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Description', 'Qté', 'PU HT', `TVA ${taxRate}%`, 'Total TTC']],
    body: [[
      desc,
      quote.quantity ?? 1,
      fmtEur(unitPriceHT),
      fmtEur((quote.cost_per_unit || 0) - unitPriceHT),
      fmtEur(quote.cost_per_unit || 0),
    ]],
    styles: {
      fontSize: 8.5,
      cellPadding: 4,
      textColor: DARK,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: TEAL,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
  })

  // ── Totaux ────────────────────────────────────────────────
  const afterTable = doc.lastAutoTable.finalY + 6
  const totalsX = W - margin - 80

  const totals = [
    ['Sous-total HT', fmtEur(totalHT * (quote.quantity || 1))],
    [`TVA (${taxRate}%)`, fmtEur(totalTVA * (quote.quantity || 1))],
  ]
  if (quote.deposit_percent > 0) {
    const acompte = (quote.total_cost || 0) * (quote.deposit_percent / 100)
    totals.push([`Acompte (${quote.deposit_percent}%)`, fmtEur(acompte)])
  }

  let ty = afterTable
  doc.setFontSize(8.5)
  totals.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GREY)
    doc.text(label, totalsX, ty)
    doc.setTextColor(...DARK)
    doc.text(value, W - margin, ty, { align: 'right' })
    ty += 6
  })

  // Total TTC (en gras dans un rectangle)
  doc.setFillColor(...TEAL)
  doc.roundedRect(totalsX - 3, ty - 4, W - margin - totalsX + 3, 9, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.setFontSize(10)
  doc.text('Total TTC', totalsX, ty + 2)
  doc.text(fmtEur(quote.total_cost || 0), W - margin, ty + 2, { align: 'right' })

  // ── Conditions ────────────────────────────────────────────
  const condY = ty + 15
  doc.setFillColor(...LIGHT)
  doc.rect(margin, condY, W - margin * 2, 22, 'F')

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GREY)
  doc.text('CONDITIONS DE RÈGLEMENT', margin + 3, condY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  doc.text(`Mode de paiement : ${paymentLabel(quote.payment_method)}`, margin + 3, condY + 11)
  if (quote.deposit_percent > 0)
    doc.text(`Acompte de ${quote.deposit_percent}% à la commande`, margin + 3, condY + 16)
  doc.text(`Devis valable jusqu'au ${addValidityDate(quote.quote_date, quote.quote_validity_days || 30)}`, margin + 3, condY + (quote.deposit_percent > 0 ? 21 : 16))

  if (company.paymentIban) {
    doc.setTextColor(...GREY)
    doc.text(`IBAN : ${company.paymentIban}`, W - margin, condY + 11, { align: 'right' })
  }

  // ── Notes ─────────────────────────────────────────────────
  if (quote.quote_notes) {
    const notesY = condY + 27
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GREY)
    doc.text('NOTES', margin, notesY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    const lines = doc.splitTextToSize(quote.quote_notes, W - margin * 2)
    doc.text(lines, margin, notesY + 5)
  }

  // ── Zone signature ────────────────────────────────────────
  const sigY = Math.max(condY + 54, 240)
  doc.setDrawColor(...[226, 232, 240])
  doc.setLineWidth(0.3)
  doc.line(margin, sigY, margin + 70, sigY)
  doc.line(W - margin - 70, sigY, W - margin, sigY)

  doc.setFontSize(7.5)
  doc.setTextColor(...GREY)
  doc.setFont('helvetica', 'normal')
  doc.text('Signature client\n(Bon pour accord)', margin, sigY + 5)
  doc.text('Signature prestataire', W - margin - 70, sigY + 5)

  // ── Pied de page ──────────────────────────────────────────
  doc.setFontSize(7)
  doc.setTextColor(...GREY)
  doc.text(
    `BambuCalc — ${company.ownerName}${company.siret ? ' — SIRET : ' + company.siret : ''} — ${company.email}`,
    W / 2, 290, { align: 'center' }
  )

  // ── Sauvegarde ────────────────────────────────────────────
  doc.save(`devis-${quote.quote_number || 'bambucalc'}.pdf`)
}
