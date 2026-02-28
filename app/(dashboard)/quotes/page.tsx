import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { QUOTE_STATUS } from '@/lib/constants'
import QuoteFilters from '@/components/quotes/QuoteFilters'
import type { Quote } from '@/types'

const PAGE_SIZE = 10

interface PageProps {
  searchParams: { q?: string; status?: string; sort?: string; page?: string }
}

function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-blue-500/30 text-blue-300 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default async function QuotesPage({ searchParams }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { q, status, sort = 'date_desc', page: pageParam } = searchParams
  const page = Math.max(1, Number(pageParam ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let query = supabase.from('quotes').select('*', { count: 'exact' }).eq('user_id', user!.id)
  if (q?.trim()) query = query.ilike('client_name', `%${q.trim()}%`)
  if (status && ['draft','sent','accepted','refused','expired'].includes(status)) query = query.eq('status', status)
  switch (sort) {
    case 'date_asc':    query = query.order('created_at', { ascending: true });  break
    case 'amount_desc': query = query.order('total_ttc',  { ascending: false }); break
    case 'amount_asc':  query = query.order('total_ttc',  { ascending: true });  break
    default:            query = query.order('created_at', { ascending: false }); break
  }
  const { data: quotes = [], count } = await query.range(from, to)
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Mes devis</h1>
          <p className="text-sm text-zinc-400 mt-1">{count ?? 0} résultat{(count ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <Link href="/quotes/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <Plus size={16} /> Nouveau devis
        </Link>
      </div>
      <QuoteFilters />
      {!quotes?.length ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 p-16 text-center space-y-4">
          <FileText size={40} className="mx-auto text-zinc-600" />
          <p className="text-zinc-300 font-medium">Aucun devis trouvé</p>
          <Link href="/quotes/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            <Plus size={16} /> Créer un devis
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wide">
              <span className="col-span-1">N°</span>
              <span className="col-span-3">Client</span>
              <span className="col-span-2">Bien</span>
              <span className="col-span-2">Statut</span>
              <span className="col-span-2 text-right">Total HT</span>
              <span className="col-span-2 text-right">Total TTC</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {quotes.map((quote: Quote) => {
                const st = QUOTE_STATUS[quote.status]
                return (
                  <Link key={quote.id} href={`/quotes/${quote.id}`} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-zinc-800/50 transition-colors group items-center">
                    <span className="col-span-1 text-sm font-mono text-zinc-400">#{String(quote.quote_number).padStart(4, '0')}</span>
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-zinc-100">{q?.trim() ? highlightMatch(quote.client_name, q.trim()) : quote.client_name}</p>
                      {quote.client_email && <p className="text-xs text-zinc-500 mt-0.5">{quote.client_email}</p>}
                    </div>
                    <span className="col-span-2 text-xs text-zinc-500 truncate">{quote.property_address}</span>
                    <span className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                      </span>
                    </span>
                    <span className="col-span-2 text-sm text-zinc-400 text-right">{formatCurrency(quote.total_ht)}</span>
                    <span className="col-span-2 text-sm font-semibold text-zinc-100 text-right">{formatCurrency(quote.total_ttc)}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const next = new URLSearchParams(searchParams as Record<string, string>)
                next.set('page', String(p))
                return (
                  <Link key={p} href={`/quotes?${next.toString()}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'}`}>
                    {p}
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
