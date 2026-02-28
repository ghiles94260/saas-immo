'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function RealtimeQuotes({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const channel = useRef<any>(null)

  useEffect(() => {
    channel.current = supabase
      .channel(`quotes:${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quotes', filter: `user_id=eq.${userId}` }, (payload) => {
        const q = payload.new as any
        const num = String(q.quote_number).padStart(4, '0')
        if (q.status === 'accepted') toast.success(`🎉 Devis N°${num} accepté par ${q.client_signed_name ?? q.client_name} !`, { duration: 8000 })
        else if (q.status === 'refused') toast.error(`Devis N°${num} refusé par ${q.client_name}.`, { duration: 8000 })
        router.refresh()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel.current) }
  }, [userId, router, supabase])

  return null
}
