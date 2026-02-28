'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Loader2, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error: signupError } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    if (data.user && companyName) {
      await supabase.from('profiles').update({ company_name: companyName }).eq('id', data.user.id)
    }
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 space-y-3">
          <div className="text-4xl">✉️</div>
          <h2 className="text-lg font-semibold text-zinc-100">Vérifiez votre email</h2>
          <p className="text-sm text-zinc-400">Un lien de confirmation a été envoyé à <span className="text-zinc-200 font-medium">{email}</span>.</p>
        </div>
        <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">← Retour à la connexion</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Diag<span className="text-blue-500">Pro</span></h1>
          <p className="text-sm text-zinc-400 mt-2">Créez votre compte professionnel</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Nom de l&apos;entreprise</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="DiagPro SARL"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.fr"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Mot de passe * (min. 8 caractères)</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            {error && <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Création...</> : <><UserPlus size={16} /> Créer mon compte</>}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-zinc-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
