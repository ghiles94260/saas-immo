import Link from 'next/link'
import { Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { INVOICE_STATUS } from '@/lib/constants'
import type { Invoice } from '@/types'

export default async function InvoicesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: invoices = [], count } = await supabase
    .from('invoices').select('*', { count: 'exact' }).eq('user_id', user!.id).order('created_at', { ascending: false })

  const totalPaid    = invoices?.filter(i => i.status === 'paid').reduce((s, i) => s + i.total_ttc, 0) ?? 0
  const totalPending = invoices?.filter(i => i.status !== 'paid').reduce((s, i) => s + i.total_ttc, 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Factures</h1>
          <p className="text-sm text-zinc-400 mt-1">{count ?? 0} factures</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total factures', value: count ?? 0,                accent: 'text-zinc-100',    sub: 'émises'      },
          { label: 'En attente',     value: formatCurrency(totalPending), accent: 'text-blue-400',  sub: 'à encaisser' },
          { label: 'Encaissé',       value: formatCurrency(totalPaid),    accent: 'text-emerald-400', sub: 'TTC payé'  },
        ].map(({ label, value, accent, sub }) => (
          <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
      {!invoices?.length ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 p-16 text-center space-y-3">
          <Receipt size={40} className="mx-auto text-zinc-600" />
          <p className="text-zinc-300 font-medium">Aucune facture pour l&apos;instant</p>
          <p className="text-sm text-zinc-500">Les factures sont générées depuis les devis acceptés.</p>
          <Link href="/quotes" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors">Voir mes devis</Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wide">
            <span className="col-span-1">N°</span>
            <span className="col-span-3">Client</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-2">Échéance</span>
            <span className="col-span-2">Statut</span>
            <span className="col-span-2 text-right">Total TTC</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {invoices.map((inv: Invoice) => {
              const st      = INVOICE_STATUS[inv.status]
              const overdue = inv.status !== 'paid' && new Date(inv.due_date) < new Date()
              return (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-zinc-800/50 transition-colors group items-center">
                  <span className="col-span-1 text-sm font-mono text-zinc-400">#{String(inv.invoice_number).padStart(5, '0')}</span>
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-zinc-100 group-hover:text-white">{inv.client_name}</p>
                    {inv.client_email && <p className="text-xs text-zinc-500 mt-0.5">{inv.client_email}</p>}
                  </div>
                  <span className="col-span-2 text-sm text-zinc-400">{formatDate(inv.created_at)}</span>
                  <span className={`col-span-2 text-sm ${overdue ? 'text-red-400 font-medium' : 'text-zinc-400'}`}>
                    {formatDate(inv.due_date)}{overdue && <span className="block text-xs">En retard</span>}
                  </span>
                  <span className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                    </span>
                  </span>
                  <span className="col-span-2 text-sm font-bold text-zinc-100 text-right">{formatCurrency(inv.total_ttc)}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
