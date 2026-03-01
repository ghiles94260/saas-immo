'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, MapPin, Clock, FileText, CheckCircle, Loader2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Intervention, InterventionStatus } from '@/types'
import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  scheduled:  { label: 'Planifiée',  cls: 'bg-blue-100 text-blue-700'  },
  completed:  { label: 'Terminée',   cls: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Annulée',    cls: 'bg-gray-100 text-gray-500'   },
}

const TRANSITIONS: Record<string, { label: string; next: InterventionStatus; cls: string }[]> = {
  scheduled: [{ label: 'Marquer terminée', next: 'completed', cls: 'bg-green-600 hover:bg-green-500 text-white' }],
  completed: [],
  cancelled: [],
}

export default function InterventionDetailModal({ intervention, onClose }: { intervention: Intervention; onClose: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const st = STATUS_LABELS[intervention.status] ?? { label: intervention.status, cls: 'bg-gray-100 text-gray-700' }
  const transitions = TRANSITIONS[intervention.status] ?? []

  const updateStatus = async (next: InterventionStatus) => {
    setLoading(next)
    await supabase.from('interventions').update({ status: next }).eq('id', intervention.id)
    toast.success(`Intervention ${STATUS_LABELS[next]?.label.toLowerCase() ?? next}.`)
    router.refresh(); onClose()
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer cette intervention ?')) return
    setLoading('delete')
    await supabase.from('interventions').delete().eq('id', intervention.id)
    toast.success('Intervention supprimée.')
    router.refresh(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
            {st.label}
          </span>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-lg font-bold text-gray-900">{intervention.title}</p>
            <p className="text-sm text-gray-600">{intervention.client_name}</p>
            {intervention.quote_id && (
              <Link href={`/quotes/${intervention.quote_id}`} className="text-xs text-blue-600 hover:text-blue-700" onClick={onClose}>
                Voir le devis →
              </Link>
            )}
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2.5">
              <Clock size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <span className="text-gray-700">
                {new Date(intervention.intervention_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                <br />
                <span className="font-semibold">{intervention.start_time} – {intervention.end_time}</span>
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <span className="text-gray-700">{intervention.property_address}</span>
            </div>
            {intervention.notes && (
              <div className="flex items-start gap-2.5">
                <FileText size={15} className="text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-600 italic">{intervention.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-5 space-y-2">
          {transitions.map(({ label, next, cls }) => (
            <button key={next} onClick={() => updateStatus(next)} disabled={loading === next}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${cls}`}>
              {loading === next ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              {label}
            </button>
          ))}
          {intervention.status === 'scheduled' && (
            <button
              onClick={async () => { setLoading('cancel'); await supabase.from('interventions').update({ status: 'cancelled' }).eq('id', intervention.id); router.refresh(); onClose() }}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Annuler l&apos;intervention
            </button>
          )}
          <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={13} /> Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  )
}
