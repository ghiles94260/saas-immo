'use client'
import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import ScheduleInterventionModal from '@/components/planning/ScheduleInterventionModal'

export default function ScheduleButton({ quote }: { quote: any }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 text-xs font-medium transition-colors">
        <CalendarPlus size={13} /> Planifier
      </button>
      {open && <ScheduleInterventionModal quote={quote} onClose={() => setOpen(false)} />}
    </>
  )
}
