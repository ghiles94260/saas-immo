import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/settings/ProfileForm'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Paramètres</h1>
        <p className="text-sm text-zinc-400 mt-1">Ces informations apparaîtront sur vos devis et factures PDF.</p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  )
}
