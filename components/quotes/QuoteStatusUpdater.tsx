'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { QuoteStatus } from '@/types'

const TRANSITIONS: Record<string, { label: string; next: QuoteStatus; icon: any; cls: string }[]> = {
  draft:    [{ label: 'Marquer envoyé',          next: 'sent',     icon: Send,         cls: 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30'         }],
  sent:     [
    { label: 'Marquer accepté', next: 'accepted', icon: CheckCircle, cls: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30' },
    { label: 'Marquer refusé',  next: 'refused',  icon: XCircle,    cls: 'bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30'                 },
  ],
  accepted: [],
  refused:  [{ label: 'Remettre en brouillon', next: 'draft', icon: Send, cls: 'bg-zinc-700 text-zinc-300 border-zinc-600 hover:bg-zinc-600' }],
  expired:  [],
}

export default function QuoteStatusUpdater({ quoteId, currentStatus }: { quoteId: string; currentStatus: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const transitions = TRANSITIONS[currentStatus] ?? []

  const update = async (next: QuoteStatus) => {
    setLoading(next)
    await supabase.from('quotes').update({ status: next }).eq('id', quoteId)
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="flex items-center gap-2">
      {transitions.map(({ label, next, icon: Icon, cls }) => (
        <button key={next} onClick={() => update(next)} disabled={loading === next}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors disabled:opacity-50 ${cls}`}>
          {loading === next ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
          {label}
        </button>
      ))}
    </div>
  )
}
