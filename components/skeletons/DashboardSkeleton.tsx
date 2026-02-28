export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-zinc-800 rounded-full" />
        <div className="h-8 w-8 bg-zinc-800 rounded-xl" />
      </div>
      <div className="h-8 w-32 bg-zinc-800 rounded-full" />
    </div>
  )
}

export function QuoteRowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 animate-pulse">
      <div className="col-span-1 h-4 bg-zinc-800 rounded-full" />
      <div className="col-span-3 space-y-1.5">
        <div className="h-4 bg-zinc-800 rounded-full w-3/4" />
        <div className="h-3 bg-zinc-800 rounded-full w-1/2" />
      </div>
      <div className="col-span-2 h-4 bg-zinc-800 rounded-full" />
      <div className="col-span-2 h-6 bg-zinc-800 rounded-full w-20" />
      <div className="col-span-2 h-4 bg-zinc-800 rounded-full ml-auto w-16" />
      <div className="col-span-2 h-4 bg-zinc-800 rounded-full ml-auto w-20" />
    </div>
  )
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-zinc-800 rounded-full animate-pulse" />
        <div className="h-10 w-36 bg-zinc-800 rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <div className="h-4 w-28 bg-zinc-800 rounded-full animate-pulse" />
        </div>
        <div className="divide-y divide-zinc-800">
          {Array.from({ length: 5 }).map((_, i) => <QuoteRowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
