import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClientQuoteView from '@/components/public/ClientQuoteView'

export default async function PublicQuotePage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select(`*, quote_items(*), profiles(company_name, address, email, phone, siret, tva_number, logo_url)`)
    .eq('public_token', params.token)
    .single()

  if (!quote) notFound()

  return <ClientQuoteView quote={quote} />
}
