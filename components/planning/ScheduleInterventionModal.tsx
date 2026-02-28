'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, CalendarPlus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TIME_SLOTS } from '@/lib/constants'
import { toast } from 'sonner'

interface Props { quote: any; onClose: () => void; existing?: any }

export default function ScheduleInterventionModal({ quote, onClose, existing }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const diagnostics = (quote.quote_items ?? []).filter((i: any) => i.diagnostic_code).map((i: any) => i.diagnostic_code)

  const [form, setForm] = useState({
    scheduled_date:  existing?.scheduled_date  ?? '',
    time_start:      existing?.time_start      ?? '09:00',
    time_end:        existing?.time_end        ?? '11:00',
    technician_name: existing?.technician_name ?? '',
    notes:           existing?.notes           ?? '',
    selectedDiags:   (existing?.diagnostics    ?? diagnostics) as string[],
  })
  const [loading, setLoading] = useState(false)
  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  const toggleDiag = (code: string) => set('selectedDiags',
    form.selectedDiags.includes(code) ? form.selectedDiags.filter(d => d !== code) : [...form.selectedDiags, code]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.scheduled_date) { toast.error('Choisissez une date.'); return }
    if (form.time_start >= form.time_end) { toast.error('Heure de fin invalide.'); return }
    setLoading(true)
    const toastId = toast.loading(existing ? 'Mise à jour...' : 'Planification...')
    try {
      const payload = {
        user_id: quote.user_id, quote_id: quote.id,
        scheduled_date: form.scheduled_date, time_start: form.time_start, time_end: form.time_end,
        address: quote.property_address, client_name: quote.client_name,
        diagnostics: form.selectedDiags, technician_name: form.technician_name || null,
        notes: form.notes || null, status: 'scheduled',
      }
      if (existing) await supabase.from('interventions').update(payload).eq('id', existing.id)
      else {
        await supabase.from('interventions').insert(payload)
        await supabase.from('quotes').update({ intervention_date: form.scheduled_date }).eq('id', quote.id)
      }
      toast.success(existing ? 'Intervention mise à jour.' : 'Intervention planifiée !', { id: toastId })
      router.refresh(); onClose()
    } catch { toast.error('Erreur.', { id: toastId }) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2"><CalendarPlus size={18} className="text-blue-400" /><h2 className="font-semibold text-zinc-100">Planifier l&apos;intervention</h2></div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"><X size={16} /></button>
        </div>
        <div className="px-6 py-3 bg-blue-500/5 border-b border-zinc-800">
          <p className="text-sm font-medium text-zinc-100">{quote.client_name}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{quote.property_address}</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1 space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Date *</label>
              <input type="date" value={form.scheduled_date} min={new Date().toISOString().split('T')[0]} onChange={e => set('scheduled_date', e.target.value)} required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Début</label>
              <select value={form.time_start} onChange={e => set('time_start', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors">
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Fin</label>
              <select value={form.time_end} onChange={e => set('time_end', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors">
                {TIME_SLOTS.filter(t => t > form.time_start).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {diagnostics.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Diagnostics à réaliser</label>
              <div className="flex flex-wrap gap-2">
                {diagnostics.map((code: string) => (
                  <button key={code} type="button" onClick={() => toggleDiag(code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${form.selectedDiags.includes(code) ? 'bg-blue-600 text-white border-blue-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Technicien</label>
            <input type="text" value={form.technician_name} onChange={e => set('technician_name', e.target.value)} placeholder="Nom du technicien"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Accès, présence requise..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Enregistrement...</> : <><CalendarPlus size={15} /> Planifier</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
