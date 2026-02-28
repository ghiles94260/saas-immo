'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect.'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Diag<span className="text-blue-500">Pro</span></h1>
          <p className="text-sm text-zinc-400 mt-2">Connectez-vous à votre espace</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.fr"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            {error && <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Connexion...</> : <><LogIn size={16} /> Se connecter</>}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-zinc-500">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}
