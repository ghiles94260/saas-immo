import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend   = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const in3Days = new Date(); in3Days.setDate(in3Days.getDate() + 3)
  const dateMin = in3Days.toISOString().split('T')[0]

  const { data: quotes = [] } = await supabase.from('quotes')
    .select('*, quote_items(diagnostic_code, description, quantity, unit_price, total), profiles(company_name, email)')
    .eq('status', 'sent').not('client_email', 'is', null)

  const expiring = (quotes ?? []).filter((q: any) => {
    const expiry = new Date(q.created_at); expiry.setDate(expiry.getDate() + q.validity_days)
    return expiry.toISOString().split('T')[0] === dateMin
  })

  let sent = 0
  for (const q of expiring) {
    try {
      const companyName = (q as any).profiles?.company_name ?? 'DiagPro Expertise'
      const expiry = new Date(q.created_at); expiry.setDate(expiry.getDate() + q.validity_days)
      await resend.emails.send({
        from: `${companyName} <relance@resend.dev>`,
        to:   [q.client_email],
        subject: `⏰ Rappel : votre devis N°${String(q.quote_number).padStart(4,'0')} expire dans 3 jours`,
        html: `<p>Bonjour ${q.client_name},<br><br>Votre devis de diagnostics immobiliers pour le bien <strong>${q.property_address}</strong> expire le <strong>${expiry.toLocaleDateString('fr-FR')}</strong>.<br><br>Montant : <strong>${q.total_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong> TTC<br><br>Pour le consulter et l'accepter : ${process.env.NEXT_PUBLIC_APP_URL}/devis/${q.public_token}<br><br>Cordialement,<br>${companyName}</p>`,
      })
      sent++
    } catch (e) { console.error(e) }
  }

  return NextResponse.json({ sent, total: expiring.length })
}
