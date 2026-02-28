'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props { quoteId: string; clientEmail: string | null; status: string }

export default function SendQuoteButton({ quoteId, clientEmail, status }: Props) {
  const router = useRouter()
  const [loading,  setLoading]  = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  if (!clientEmail) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 text-zinc-500 text-xs cursor-not-allowed" title="Aucun email client">
      <Send size={13} /> Envoyer
    </div>
  )
  if (status === 'paid') return null

  const handleSend = async () => {
    setLoading(true)
    const toastId = toast.loading('Envoi de l\'email...')
    setConfirm(false)
    const res  = await fetch(`/api/quotes/${quoteId}/send`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Erreur.', { id: toastId }); setLoading(false); return }
    toast.success(`Email envoyé à ${clientEmail}`, { id: toastId })
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setConfirm(true)} disabled={loading}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-medium transition-colors disabled:opacity-50">
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        {status === 'sent' ? 'Renvoyer' : 'Envoyer par email'}
      </button>
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-semibold text-zinc-100">Envoyer ce devis ?</h3>
            <p className="text-sm text-zinc-400">L&apos;email sera envoyé à <span className="text-zinc-200 font-medium">{clientEmail}</span>.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setConfirm(false)} className="px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">Annuler</button>
              <button onClick={handleSend} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
