'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, LayoutDashboard, LogOut, Settings, CalendarDays, Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export default function Navbar({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const navLink = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"

  return (
    <nav className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">Diag<span className="text-blue-500">Pro</span></span>
          <div className="flex items-center gap-1">
            <Link href="/dashboard" className={navLink}><LayoutDashboard size={16} /> Dashboard</Link>
            <Link href="/quotes" className={navLink}><FileText size={16} /> Devis</Link>
            <Link href="/invoices" className={navLink}><Receipt size={16} /> Factures</Link>
            <Link href="/planning" className={navLink}><CalendarDays size={16} /> Planning</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/settings" className={navLink}><Settings size={16} /></Link>
          <span className="text-sm text-zinc-400">{profile?.company_name ?? profile?.email}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  )
}
