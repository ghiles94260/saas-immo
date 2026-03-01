'use client'
import { useWatch } from 'react-hook-form'
import { useMemo } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function TaxSummary({ form }: { form: any }) {
  const { control } = form
  const items   = useWatch({ control, name: 'items' }) ?? []
  const tvaRate = 20

  const { totalHT, montantTVA, totalTTC } = useMemo(() => {
    const totalHT = items.reduce((sum: number, item: any) =>
      sum + (Number(item.quantity) * Number(item.unit_price)), 0)
    const montantTVA = totalHT * (Number(tvaRate) / 100)
    return { totalHT, montantTVA, totalTTC: totalHT + montantTVA }
  }, [items, tvaRate])

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
      <h2 className="font-semibold text-zinc-100 mb-4">Récapitulatif</h2>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Sous-total HT</span>
        <span className="text-zinc-100 font-medium">{formatCurrency(totalHT)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">TVA ({tvaRate}%)</span>
        <span className="text-zinc-100 font-medium">{formatCurrency(montantTVA)}</span>
      </div>
      <div className="border-t border-zinc-700 pt-3 flex justify-between">
        <span className="font-semibold text-zinc-100">Total TTC</span>
        <span className="text-xl font-bold text-blue-400">{formatCurrency(totalTTC)}</span>
      </div>
    </div>
  )
}
