'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-100">Une erreur est survenue</h1>
          <p className="text-sm text-zinc-500">{error.message ?? 'Erreur inattendue.'}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            <RefreshCw size={15} /> Réessayer
          </button>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
