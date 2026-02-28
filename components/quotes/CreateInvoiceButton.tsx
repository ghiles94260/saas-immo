'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function CreateInvoiceButton({ quote }: { quote: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  if (quote.invoiced_at) return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-400 px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
      <FileCheck size={13} /> Facture émise
    </span>
  )
  if (quote.status !== 'accepted') return null

  const handleCreate = async () => {
    setLoading(true)
    const toastId = toast.loading('Création de la facture...')
    try {
      const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 30)
      const { data: invoice, error: invError } = await supabase.from('invoices').insert({
        user_id: quote.user_id, quote_id: quote.id,
        client_name: quote.client_name, client_email: quote.client_email,
        client_phone: quote.client_phone, client_address: quote.client_address,
        client_type: quote.client_type, property_address: quote.property_address,
        property_type: quote.property_type, transaction_type: quote.transaction_type,
        total_ht: quote.total_ht, tva_rate: quote.tva_rate, total_ttc: quote.total_ttc,
        notes: quote.notes, due_date: dueDate.toISOString().split('T')[0], status: 'draft',
      }).select().single()
      if (invError) throw invError
      await supabase.from('invoice_items').insert(
        (quote.quote_items ?? []).map((item: any) => ({
          invoice_id: invoice.id, diagnostic_code: item.diagnostic_code,
          description: item.description, quantity: item.quantity, unit_price: item.unit_price,
        }))
      )
      await supabase.from('quotes').update({ invoiced_at: new Date().toISOString() }).eq('id', quote.id)
      toast.success('Facture créée !', { id: toastId })
      router.push(`/invoices/${invoice.id}`)
      router.refresh()
    } catch { toast.error('Erreur.', { id: toastId }) } finally { setLoading(false) }
  }

  return (
    <button onClick={handleCreate} disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-colors disabled:opacity-50">
      {loading ? <Loader2 size={13} className="animate-spin" /> : <FileCheck size={13} />} Créer la facture
    </button>
  )
}
