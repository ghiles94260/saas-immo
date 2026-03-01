'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Send, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PAYMENT_METHODS } from '@/lib/constants'

export default function InvoiceActions({ invoice, profile }: { invoice: any; profile?: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading,  setLoading]  = useState<string | null>(null)
  const [showPaid, setShowPaid] = useState(false)
  const [method,   setMethod]   = useState('virement')

  const handleSend = async () => {
    if (!invoice.client_email) { toast.error('Aucun email client.'); return }
    setLoading('send')
    const toastId = toast.loading('Envoi...')
    const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' })
    if (res.ok) { toast.success('Facture envoyée.', { id: toastId }); router.refresh() }
    else toast.error('Erreur.', { id: toastId })
    setLoading(null)
  }

  const handleMarkPaid = async () => {
    setLoading('paid')
    const toastId = toast.loading('Enregistrement...')
    await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: method }).eq('id', invoice.id)
    toast.success('Facture marquée payée !', { id: toastId })
    setShowPaid(false); setLoading(null); router.refresh()
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => toast.info('Téléchargez via le bouton PDF sur la page.')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-colors">
          <Download size={13} /> PDF
        </button>
        {invoice.status !== 'paid' && (
          <>
            <button onClick={handleSend} disabled={loading === 'send'}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-medium transition-colors">
              {loading === 'send' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Envoyer
            </button>
            <button onClick={() => setShowPaid(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-colors">
              <CheckCircle size={13} /> Marquer payée
            </button>
          </>
        )}
      </div>
      {showPaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-semibold text-zinc-100">Enregistrer le paiement</h3>
            <select value={method} onChange={e => setMethod(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors">
              {PAYMENT_METHODS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowPaid(false)} className="px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">Annuler</button>
              <button onClick={handleMarkPaid} disabled={loading === 'paid'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
                {loading === 'paid' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
