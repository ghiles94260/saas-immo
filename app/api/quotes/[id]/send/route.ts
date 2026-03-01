export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createClient } from '@/lib/supabase/server'
import QuoteEmail from '@/emails/QuoteEmail'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const [{ data: quote }, { data: profile }] = await Promise.all([
      supabase.from('quotes').select('*, quote_items(*)').eq('id', params.id).eq('user_id', user.id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    if (!quote) return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    if (!quote.client_email) return NextResponse.json({ error: 'Aucun email client.' }, { status: 400 })

    const companyName = profile?.company_name ?? 'DiagPro Expertise'
    const quoteUrl    = `${process.env.NEXT_PUBLIC_APP_URL}/devis/${quote.public_token}`

    const html = await render(QuoteEmail({
      quoteNumber: quote.quote_number, clientName: quote.client_name, companyName,
      propertyAddress: quote.property_address, propertyType: quote.property_type,
      transactionType: quote.transaction_type, interventionDate: quote.intervention_date,
      validityDays: quote.validity_days, totalHT: quote.total_ht, tvaRate: quote.tva_rate,
      totalTTC: quote.total_ttc, items: quote.quote_items, notes: quote.notes, quoteUrl,
    }))

    const { error: emailError } = await resend.emails.send({
      from: `${companyName} <devis@resend.dev>`,
      to:   [quote.client_email],
      subject: `Devis diagnostics N°${String(quote.quote_number).padStart(4,'0')} — ${companyName}`,
      html,
    })

    if (emailError) return NextResponse.json({ error: emailError.message }, { status: 500 })
    await supabase.from('quotes').update({ status: 'sent' }).eq('id', quote.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
