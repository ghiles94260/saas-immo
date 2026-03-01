export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { action, signature } = await req.json()
    if (!['accepted', 'refused'].includes(action)) return NextResponse.json({ error: 'Action invalide.' }, { status: 400 })

    const supabase = createClient()
    const { data: quote, error } = await supabase.from('quotes')
      .select('id, status, validity_days, created_at').eq('public_token', params.token).single()

    if (error || !quote) return NextResponse.json({ error: 'Devis introuvable.' }, { status: 404 })
    if (['accepted', 'refused', 'expired'].includes(quote.status)) return NextResponse.json({ error: 'Ce devis a déjà reçu une réponse.' }, { status: 409 })

    const expiry = new Date(quote.created_at)
    expiry.setDate(expiry.getDate() + (quote.validity_days ?? 30))
    if (new Date() > expiry) {
      await supabase.from('quotes').update({ status: 'expired' }).eq('id', quote.id)
      return NextResponse.json({ error: 'Ce devis a expiré.' }, { status: 410 })
    }

    await supabase.from('quotes').update({
      status: action,
      client_signed_name: action === 'accepted' ? signature : null,
      client_responded_at: new Date().toISOString(),
    }).eq('id', quote.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
