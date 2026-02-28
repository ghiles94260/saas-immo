'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Trash2, Download, Pencil, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import SendQuoteButton from './SendQuoteButton'
import CreateInvoiceButton from './CreateInvoiceButton'
import ScheduleButton from './ScheduleButton'
import type { Quote, QuoteItem } from '@/types'

export default function QuoteActions({ quote }: { quote: Quote & { quote_items: QuoteItem[] } }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading]     = useState<'duplicate' | 'delete' | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDuplicate = async () => {
    setLoading('duplicate')
    const toastId = toast.loading('Duplication...')
    try {
      const { data: newQuote, error } = await supabase.from('quotes').insert({
        user_id: quote.user_id, client_name: quote.client_name,
        client_email: quote.client_email, client_phone: quote.client_phone,
        client_address: quote.client_address, client_type: quote.client_type,
        property_address: quote.property_address, property_type: quote.property_type,
        property_surface: quote.property_surface, construction_year: quote.construction_year,
        transaction_type: quote.transaction_type, tva_rate: quote.tva_rate,
        total_ht: quote.total_ht, total_ttc: quote.total_ttc, notes: quote.notes, status: 'draft',
      }).select().single()
      if (error) throw error
      await supabase.from('quote_items').insert(
        quote.quote_items.map(item => ({
          quote_id: newQuote.id, diagnostic_code: item.diagnostic_code,
          description: item.description, quantity: item.quantity, unit_price: item.unit_price,
        }))
      )
      toast.success('Devis dupliqué.', { id: toastId })
      router.push(`/quotes/${newQuote.id}`); router.refresh()
    } catch { toast.error('Erreur.', { id: toastId }) } finally { setLoading(null) }
  }

  const handleDelete = async () => {
    setLoading('delete')
    await supabase.from('quotes').delete().eq('id', quote.id)
    toast.success('Devis supprimé.')
    router.push('/quotes'); router.refresh()
    setLoading(null); setShowConfirm(false)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <SendQuoteButton quoteId={quote.id} clientEmail={quote.client_email} status={quote.status} />
        <CreateInvoiceButton quote={quote} />
        <ScheduleButton quote={quote} />
        {quote.status !== 'paid' && (
          <a href={`/quotes/${quote.id}/edit`} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 text-xs font-medium transition-colors">
            <Pencil size={13} /> Modifier
          </a>
        )}
        <button onClick={handleDuplicate} disabled={loading === 'duplicate'}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-colors disabled:opacity-50">
          {loading === 'duplicate' ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />} Dupliquer
        </button>
        <button onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors">
          <Trash2 size={13} /> Supprimer
        </button>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-semibold text-zinc-100">Supprimer ce devis ?</h3>
            <p className="text-sm text-zinc-400">Le devis <span className="text-zinc-200 font-medium">#{String(quote.quote_number).padStart(4, '0')}</span> sera définitivement supprimé.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">Annuler</button>
              <button onClick={handleDelete} disabled={loading === 'delete'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
                {loading === 'delete' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
