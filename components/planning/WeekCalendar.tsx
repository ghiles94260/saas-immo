'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Intervention } from '@/types'
import { cn } from '@/lib/utils'

interface WeekCalendarProps {
  interventions: Intervention[]
  onSlotClick?: (date: string, time: string) => void
  onInterventionClick?: (intervention: Intervention) => void
}

const TIME_SLOTS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

function getWeekDays(referenceDate: Date): Date[] {
  const day = referenceDate.getDay()
  const monday = new Date(referenceDate)
  monday.setDate(referenceDate.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 border-blue-400 text-blue-800',
  completed: 'bg-green-100 border-green-400 text-green-800',
  cancelled: 'bg-gray-100 border-gray-300 text-gray-500 line-through',
}

export default function WeekCalendar({ interventions, onSlotClick, onInterventionClick }: WeekCalendarProps) {
  const [referenceDate, setReferenceDate] = useState(new Date())
  const days = getWeekDays(referenceDate)
  const today = toDateStr(new Date())

  function prevWeek() {
    const d = new Date(referenceDate)
    d.setDate(d.getDate() - 7)
    setReferenceDate(d)
  }

  function nextWeek() {
    const d = new Date(referenceDate)
    d.setDate(d.getDate() + 7)
    setReferenceDate(d)
  }

  function getInterventionsForSlot(dateStr: string, timeSlot: string): Intervention[] {
    return interventions.filter(
      (i) => i.intervention_date === dateStr && i.start_time <= timeSlot && i.end_time > timeSlot
    )
  }

  const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button onClick={prevWeek} className="p-1 rounded hover:bg-gray-100 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          {' – '}
          {days[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextWeek} className="p-1 rounded hover:bg-gray-100 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-auto">
        <div className="grid" style={{ gridTemplateColumns: '64px repeat(7, 1fr)', minWidth: '700px' }}>
          {/* Header row */}
          <div className="border-b border-r border-gray-200" />
          {days.map((day, i) => {
            const dateStr = toDateStr(day)
            const isToday = dateStr === today
            return (
              <div
                key={dateStr}
                className={cn(
                  'text-center py-2 border-b border-r border-gray-200 text-xs font-medium',
                  isToday ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                )}
              >
                <p>{DAY_LABELS[i]}</p>
                <p className={cn('text-base', isToday && 'font-bold')}>{day.getDate()}</p>
              </div>
            )
          })}

          {/* Time slots */}
          {TIME_SLOTS.map((slot) => (
            <>
              <div key={`time-${slot}`} className="border-b border-r border-gray-100 text-xs text-gray-400 flex items-start justify-end pr-2 pt-1 h-14">
                {slot}
              </div>
              {days.map((day) => {
                const dateStr = toDateStr(day)
                const slotInterventions = getInterventionsForSlot(dateStr, slot)
                return (
                  <div
                    key={`${dateStr}-${slot}`}
                    onClick={() => onSlotClick?.(dateStr, slot)}
                    className="border-b border-r border-gray-100 h-14 p-0.5 cursor-pointer hover:bg-blue-50 transition-colors relative"
                  >
                    {slotInterventions.map((intervention) => (
                      <div
                        key={intervention.id}
                        onClick={(e) => { e.stopPropagation(); onInterventionClick?.(intervention) }}
                        className={cn(
                          'absolute inset-x-0.5 top-0.5 rounded text-xs px-1 py-0.5 border-l-2 cursor-pointer truncate',
                          STATUS_COLORS[intervention.status] || 'bg-gray-100'
                        )}
                      >
                        {intervention.client_name}
                      </div>
                    ))}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}
