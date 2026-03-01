import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QuoteForm from '@/components/quotes/QuoteForm'

export default async function NewQuotePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: catalog = [] } = await supabase
    .from('diagnostics_catalog').select('*').eq('is_active', true).order('label')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Nouveau devis</h1>
        <p className="text-sm text-zinc-400 mt-1">Sélectionnez les diagnostics — les recommandations s&apos;adaptent automatiquement.</p>
      </div>
      <QuoteForm catalog={catalog ?? []} />
    </div>
  )
}
