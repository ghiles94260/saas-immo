import { FileText, Clock, CheckCircle, Euro } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentQuotes from '@/components/dashboard/RecentQuotes'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: quotes = [] } = await supabase
    .from('quotes').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })

  const total    = quotes?.length ?? 0
  const sent     = quotes?.filter(q => q.status === 'sent').length ?? 0
  const accepted = quotes?.filter(q => q.status === 'accepted').length ?? 0
  const revenue  = quotes?.filter(q => q.status === 'accepted').reduce((s, q) => s + (q.total_ttc ?? 0), 0) ?? 0
  const convRate = total > 0 ? Math.round((accepted / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <Link href="/quotes/new" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <FileText size={16} /> Nouveau devis
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total devis"   value={total}    icon={FileText}    accent="blue" />
        <StatsCard label="En attente"    value={sent}     icon={Clock}       accent="orange" trend="Devis envoyés" />
        <StatsCard label="Acceptés"      value={accepted} icon={CheckCircle} accent="green" />
        <StatsCard label="CA accepté"    value={revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} icon={Euro} accent="purple" trend="Sur devis acceptés" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><RecentQuotes quotes={quotes?.slice(0, 6) ?? []} /></div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="font-semibold text-zinc-100">Répartition</h2>
          {([
            { label: 'Brouillons', count: quotes?.filter(q => q.status === 'draft').length ?? 0,   color: 'bg-zinc-600'    },
            { label: 'Envoyés',    count: sent,                                                      color: 'bg-blue-500'    },
            { label: 'Acceptés',   count: accepted,                                                  color: 'bg-emerald-500' },
            { label: 'Refusés',    count: quotes?.filter(q => q.status === 'refused').length ?? 0,  color: 'bg-red-500'     },
            { label: 'Expirés',    count: quotes?.filter(q => q.status === 'expired').length ?? 0,  color: 'bg-amber-500'   },
          ] as const).map(({ label, count, color }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-zinc-400">{label}</span>
                  <span className="text-zinc-300 font-medium">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Taux de conversion</p>
            <p className="text-3xl font-bold text-zinc-100">{convRate}%</p>
            <p className="text-xs text-zinc-500 mt-1">Devis acceptés / total</p>
          </div>
        </div>
      </div>
    </div>
  )
}
