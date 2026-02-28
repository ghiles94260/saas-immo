import { QuoteRowSkeleton } from '@/components/skeletons/DashboardSkeleton'
export default function QuotesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-pulse">
        <div className="h-8 w-32 bg-zinc-800 rounded-full" />
        <div className="h-10 w-36 bg-zinc-800 rounded-xl" />
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="divide-y divide-zinc-800">
          {Array.from({ length: 8 }).map((_, i) => <QuoteRowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
