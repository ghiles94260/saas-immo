'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

const STATUSES = [
  { value: '',         label: 'Tous'      },
  { value: 'draft',    label: 'Brouillon' },
  { value: 'sent',     label: 'Envoyé'    },
  { value: 'accepted', label: 'Accepté'   },
  { value: 'refused',  label: 'Refusé'    },
]
const SORTS = [
  { value: 'date_desc',   label: 'Plus récent' },
  { value: 'date_asc',    label: 'Plus ancien' },
  { value: 'amount_desc', label: 'Montant ↓'   },
  { value: 'amount_asc',  label: 'Montant ↑'   },
]

export default function QuoteFilters() {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const [pending, startTransition] = useTransition()

  const setParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }, [params, pathname, router])

  const clearAll = () => startTransition(() => router.push(pathname))
  const hasFilters = params.has('q') || params.has('status') || params.has('sort')

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-48">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input type="text" defaultValue={params.get('q') ?? ''} onChange={e => setParam('q', e.target.value)}
          placeholder="Rechercher un client…"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors" />
      </div>
      <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-xl p-1">
        {STATUSES.map(({ value, label }) => {
          const active = (params.get('status') ?? '') === value
          return (
            <button key={value} onClick={() => setParam('status', value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'}`}>
              {label}
            </button>
          )
        })}
      </div>
      <select value={params.get('sort') ?? 'date_desc'} onChange={e => setParam('sort', e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
        {SORTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
      {hasFilters && (
        <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-700 transition-colors">
          <X size={13} /> Effacer
        </button>
      )}
      {pending && <Loader2 size={16} className="animate-spin text-zinc-500" />}
    </div>
  )
}
