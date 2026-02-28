'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [companyName, setCompanyName] = useState(profile?.company_name ?? '')
  const [saving, setSaving]           = useState(false)
  const [saved,  setSaved]            = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setSaved(false)
    await supabase.from('profiles').update({ company_name: companyName }).eq('id', profile!.id)
    setSaving(false); setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-100">Informations du compte</h2>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Email</label>
          <input value={profile?.email ?? ''} disabled className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Nom de l&apos;entreprise</label>
          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="DiagPro SARL"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-400"><CheckCircle size={15} /> Sauvegardé</span>}
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors">
          {saving ? <><Loader2 size={16} className="animate-spin" /> Sauvegarde...</> : <><Save size={16} /> Sauvegarder</>}
        </button>
      </div>
    </form>
  )
}
