'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, MapPin, Clock, User, FileText, CheckCircle, Loader2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { INTERVENTION_STATUS } from '@/lib/constants'
import { toast } from 'sonner'
import type { Intervention, InterventionStatus } from '@/types'
import Link from 'next/link'

const TRANSITIONS: Record<string, { label: string; next: InterventionStatus; cls: string }[]> = {
  scheduled:   [{ label: 'Démarrer', next: 'in_progress', cls: 'bg-amber-600 hover:bg-amber-500 text-white'    }],
  in_progress: [{ label: 'Terminer', next: 'completed',   cls: 'bg-emerald-600 hover:bg-emerald-500 text-white' }],
  completed:   [], cancelled: [],
}

export default function InterventionDetailModal({ intervention, onClose }: { intervention: Intervention; onClose: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const st = INTERVENTION_STATUS[intervention.status]
  const transitions = TRANSITIONS[intervention.status] ?? []

  const updateStatus = async (next: InterventionStatus) => {
    setLoading(next)
    await supabase.from('interventions').update({ status: next }).eq('id', intervention.id)
    toast.success(`Intervention ${INTERVENTION_STATUS[next].label.toLowerCase()}.`)
    router.refresh(); onClose()
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer ?')) return
    setLoading('delete')
    await supabase.from('interventions').delete().eq('id', intervention.id)
    toast.success('Supprimée.')
    router.refresh(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
          </span>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-lg font-bold text-zinc-100">{intervention.client_name}</p>
            {intervention.quote_id && <Link href={`/quotes/${intervention.quote_id}`} className="text-xs text-blue-400 hover:text-blue-300" onClick={onClose}>Voir le devis →</Link>}
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 text-sm">
              <Clock size={15} className="text-zinc-500 mt-0.5 shrink-0" />
              <span className="text-zinc-300">
                {new Date(intervention.scheduled_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                <br /><span className="font-semibold">{intervention.time_start} – {intervention.time_end}</span>
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-sm"><MapPin size={15} className="text-zinc-500 mt-0.5 shrink-0" /><span className="text-zinc-300">{intervention.address}</span></div>
            {intervention.technician_name && <div className="flex items-center gap-2.5 text-sm"><User size={15} className="text-zinc-500 shrink-0" /><span className="text-zinc-300">{intervention.technician_name}</span></div>}
            {intervention.diagnostics.length > 0 && (
              <div className="flex items-start gap-2.5">
                <FileText size={15} className="text-zinc-500 mt-1 shrink-0" />
                <div className="flex flex-wrap gap-1.5">
                  {intervention.diagnostics.map(d => <span key={d} className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-bold">{d}</span>)}
                </div>
              </div>
            )}
            {intervention.notes && <div className="rounded-xl bg-zinc-800 px-4 py-3 text-sm text-zinc-400 italic">{intervention.notes}</div>}
          </div>
        </div>
        <div className="px-6 pb-5 space-y-3">
          {transitions.map(({ label, next, cls }) => (
            <button key={next} onClick={() => updateStatus(next)} disabled={loading === next}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${cls}`}>
              {loading === next ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}{label}
            </button>
          ))}
          {!['cancelled','completed'].includes(intervention.status) && (
            <button onClick={async () => { setLoading('cancel'); await supabase.from('interventions').update({ status: 'cancelled' }).eq('id', intervention.id); router.refresh(); onClose() }}
              className="w-full py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">
              Annuler l&apos;intervention
            </button>
          )}
          <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-red-400 hover:bg-red-400/10 transition-colors">
            <Trash2 size={13} /> Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  )
}
