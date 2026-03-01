export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { data: invoice } = await supabase.from('invoices').select('*').eq('id', params.id).eq('user_id', user.id).single()
    const { data: profile  } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    if (!invoice.client_email) return NextResponse.json({ error: 'Aucun email client.' }, { status: 400 })

    const companyName = profile?.company_name ?? 'DiagPro Expertise'
    const num = String(invoice.invoice_number).padStart(5, '0')

    const { error: emailError } = await resend.emails.send({
      from: `${companyName} <factures@resend.dev>`,
      to:   [invoice.client_email],
      subject: `Facture N°${num} — ${companyName}`,
      html: `<p>Bonjour,<br><br>Veuillez trouver ci-joint votre facture N°${num} d'un montant de ${invoice.total_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} TTC.<br><br>Cordialement,<br>${companyName}</p>`,
    })

    if (emailError) return NextResponse.json({ error: emailError.message }, { status: 500 })
    await supabase.from('invoices').update({ status: 'sent' }).eq('id', invoice.id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
