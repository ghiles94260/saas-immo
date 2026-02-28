import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  className?: string
  accent?: 'blue' | 'green' | 'orange' | 'purple'
}

const accents = {
  blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function StatsCard({ label, value, icon: Icon, trend, className, accent = 'blue' }: StatsCardProps) {
  return (
    <div className={cn('rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className={cn('p-2 rounded-xl border', accents[accent])}><Icon size={16} /></span>
      </div>
      <div>
        <p className="text-3xl font-bold text-zinc-100">{value}</p>
        {trend && <p className="text-xs text-zinc-500 mt-1">{trend}</p>}
      </div>
    </div>
  )
}
