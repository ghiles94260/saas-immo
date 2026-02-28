import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { QUOTE_STATUS } from '@/lib/constants'
import type { Quote } from '@/types'

export default function RecentQuotes({ quotes }: { quotes: Quote[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-zinc-100">Derniers devis</h2>
        <Link href="/quotes" className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-colors">
          Voir tout <ArrowUpRight size={12} />
        </Link>
      </div>
      {quotes.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">Aucun devis pour l&apos;instant.</p>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => {
            const status = QUOTE_STATUS[quote.status]
            return (
              <Link key={quote.id} href={`/quotes/${quote.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-xs text-zinc-500 font-mono w-16">#{String(quote.quote_number).padStart(4, '0')}</div>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{quote.client_name}</p>
                    <p className="text-xs text-zinc-500">{formatDate(quote.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${status.cls}`}>{status.label}</span>
                  <span className="text-sm font-semibold text-zinc-100">{formatCurrency(quote.total_ttc)}</span>
                  <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
