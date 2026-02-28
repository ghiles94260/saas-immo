'use client'

import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { QuoteFormData } from '@/lib/schemas/quote'
import { DiagnosticCatalog } from '@/types'
import { Plus, X, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DiagnosticSelectorProps {
  catalog: DiagnosticCatalog[]
  form: UseFormReturn<QuoteFormData>
}

function getRecommendedDiagnostics(
  constructionYear: number | null,
  transactionType: string
): string[] {
  const recs: string[] = ['DPE', 'ERP']

  if (transactionType === 'sale') {
    recs.push('ELECTRICITE', 'GAZ')
    if (constructionYear && constructionYear < 1997) recs.push('AMIANTE')
    if (constructionYear && constructionYear < 1949) recs.push('PLOMB')
    recs.push('TERMITES', 'CARREZ')
  }

  if (transactionType === 'rental') {
    recs.push('ELECTRICITE', 'GAZ')
    if (constructionYear && constructionYear < 1949) recs.push('PLOMB')
    recs.push('BOUTIN')
  }

  if (transactionType === 'works') {
    if (constructionYear && constructionYear < 1997) recs.push('AMIANTE')
    if (constructionYear && constructionYear < 1949) recs.push('PLOMB')
  }

  return [...new Set(recs)]
}

export default function DiagnosticSelector({ catalog, form }: DiagnosticSelectorProps) {
  const [showCatalog, setShowCatalog] = useState(false)
  const items = form.watch('items') || []
  const constructionYear = form.watch('construction_year')
  const transactionType = form.watch('transaction_type')

  const recommended = getRecommendedDiagnostics(
    constructionYear ? Number(constructionYear) : null,
    transactionType
  )

  const addedCodes = items.map((i: any) => i.diagnostic_code).filter(Boolean)

  function addDiagnostic(diag: DiagnosticCatalog) {
    if (addedCodes.includes(diag.code)) return
    const current = form.getValues('items') || []
    form.setValue('items', [
      ...current,
      {
        diagnostic_code: diag.code,
        label: diag.label,
        description: diag.description || '',
        quantity: 1,
        unit_price_ht: diag.default_price_ht,
        tva_rate: diag.tva_rate,
      },
    ])
  }

  function removeItem(index: number) {
    const current = form.getValues('items') || []
    form.setValue('items', current.filter((_: any, i: number) => i !== index))
  }

  function updateItem(index: number, field: string, value: any) {
    const current = form.getValues('items') || []
    const updated = [...current]
    updated[index] = { ...updated[index], [field]: value }
    form.setValue('items', updated)
  }

  function addCustomLine() {
    const current = form.getValues('items') || []
    form.setValue('items', [
      ...current,
      { diagnostic_code: null, label: '', description: '', quantity: 1, unit_price_ht: 0, tva_rate: 20 },
    ])
  }

  return (
    <div className="space-y-4">
      {/* Recommendations */}
      {recommended.length > 0 && transactionType && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3 text-amber-700 font-medium text-sm">
            <Lightbulb className="h-4 w-4" />
            Diagnostics recommandés
          </div>
          <div className="flex flex-wrap gap-2">
            {recommended.map((code) => {
              const diag = catalog.find((d) => d.code === code)
              if (!diag) return null
              const added = addedCodes.includes(code)
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => addDiagnostic(diag)}
                  disabled={added}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    added
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-100'
                  )}
                >
                  {added ? '✓ ' : '+ '}{diag.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Added items */}
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
            <span className="col-span-4">Prestation</span>
            <span className="col-span-2 text-center">Qté</span>
            <span className="col-span-2 text-right">PU HT (€)</span>
            <span className="col-span-2 text-right">TVA %</span>
            <span className="col-span-1 text-right">Total HT</span>
            <span className="col-span-1" />
          </div>
          {items.map((item: any, index: number) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-2">
              <div className="col-span-4">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(index, 'label', e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Libellé"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price_ht}
                  onChange={(e) => updateItem(index, 'unit_price_ht', Number(e.target.value))}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <select
                  value={item.tva_rate}
                  onChange={(e) => updateItem(index, 'tva_rate', Number(e.target.value))}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={5.5}>5,5%</option>
                  <option value={10}>10%</option>
                  <option value={20}>20%</option>
                </select>
              </div>
              <div className="col-span-1 text-right text-sm font-medium">
                {(item.quantity * item.unit_price_ht).toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowCatalog(!showCatalog)}
          className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Catalogue
          {showCatalog ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={addCustomLine}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ligne manuelle
        </button>
      </div>

      {/* Catalog panel */}
      {showCatalog && (
        <div className="rounded-lg border border-gray-200 divide-y">
          {catalog.map((diag) => {
            const added = addedCodes.includes(diag.code)
            return (
              <div key={diag.code} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{diag.label}</p>
                  {diag.description && (
                    <p className="text-xs text-gray-500">{diag.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{diag.default_price_ht} € HT</span>
                  <button
                    type="button"
                    onClick={() => addDiagnostic(diag)}
                    disabled={added}
                    className={cn(
                      'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                      added
                        ? 'bg-green-100 text-green-600 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    {added ? 'Ajouté' : 'Ajouter'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
