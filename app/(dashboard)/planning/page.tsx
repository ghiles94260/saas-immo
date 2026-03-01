import { createClient } from '@/lib/supabase/server'
import { CalendarDays, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import WeekCalendar from '@/components/planning/WeekCalendar'

export default async function PlanningPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const from = new Date(); from.setMonth(from.getMonth() - 1)
  const to   = new Date(); to.setMonth(to.getMonth() + 3)

  const { data: interventions = [] } = await supabase
    .from('interventions').select('*').eq('user_id', user!.id)
    .gte('scheduled_date', from.toISOString().split('T')[0])
    .lte('scheduled_date', to.toISOString().split('T')[0])
    .order('scheduled_date').order('time_start')

  const today      = new Date().toISOString().split('T')[0]
  const weekEnd    = new Date(); weekEnd.setDate(weekEnd.getDate() + 7)
  const todayCount = interventions?.filter(i => i.scheduled_date === today).length ?? 0
  const weekCount  = interventions?.filter(i => i.scheduled_date >= today && i.scheduled_date <= weekEnd.toISOString().split('T')[0]).length ?? 0
  const doneCount  = interventions?.filter(i => i.status === 'completed').length ?? 0
  const pendingCount = interventions?.filter(i => i.status === 'scheduled').length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Planning</h1>
          <p className="text-sm text-zinc-400 mt-1">Gérez vos interventions de diagnostic</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { icon: CalendarDays, label: "Aujourd'hui", value: todayCount,   color: 'text-blue-400'    },
            { icon: Clock,        label: 'Cette semaine', value: weekCount,  color: 'text-amber-400'   },
            { icon: CheckCircle,  label: 'Terminées',    value: doneCount,   color: 'text-emerald-400' },
            { icon: AlertCircle,  label: 'Planifiées',   value: pendingCount, color: 'text-zinc-300'   },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900">
              <Icon size={15} className={color} />
              <div>
                <p className={`text-lg font-bold leading-none ${color}`}>{value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <WeekCalendar interventions={interventions ?? []} />
    </div>
  )
}
