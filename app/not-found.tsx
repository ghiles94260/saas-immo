import Link from 'next/link'
import { FileSearch } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto">
          <FileSearch size={40} className="text-blue-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-zinc-100">404</h1>
          <p className="text-xl font-semibold text-zinc-300">Page introuvable</p>
          <p className="text-sm text-zinc-500">La page que vous cherchez n&apos;existe pas.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
