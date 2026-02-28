'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PROPERTY_LABELS, TRANSACTION_LABELS } from '@/lib/constants'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Building, FileText } from 'lucide-react'

interface ClientQuoteViewProps {
  quote: any
}

export default function ClientQuoteView({ quote }: ClientQuoteViewProps) {
  const [signedName, setSignedName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responded, setResponded] = useState(
    quote.status === 'accepted' || quote.status === 'refused'
  )
  const [response, setResponse] = useState<'accepted' | 'refused' | null>(
    quote.status === 'accepted' ? 'accepted' : quote.status === 'refused' ? 'refused' : null
  )

  const expired = quote.valid_until && new Date(quote.valid_until) < new Date() && quote.status === 'sent'
  const profile = quote.profiles

  async function handleRespond(action: 'accepted' | 'refused') {
    if (action === 'accepted' && !signedName.trim()) {
      toast.error('Veuillez saisir votre nom pour signer électroniquement')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/quotes/respond/${quote.public_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, signed_name: signedName }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Une erreur est survenue')
        return
      }
      setResponded(true)
      setResponse(action)
      toast.success(action === 'accepted' ? 'Devis accepté !' : 'Devis refusé')
    } finally {
      setIsSubmitting(false)
    }
  }

  const items = quote.quote_items || []

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Company header */}
        <div className="rounded-xl bg-white border border-gray-200 p-6 flex items-center justify-between">
          <div>
            {profile?.company_name && (
              <p className="text-xl font-bold text-gray-900">{profile.company_name}</p>
            )}
            {profile?.address && <p className="text-sm text-gray-500 mt-1">{profile.address}</p>}
            {profile?.email && <p className="text-sm text-gray-500">{profile.email}</p>}
            {profile?.phone && <p className="text-sm text-gray-500">{profile.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">DEVIS</p>
            <p className="font-semibold text-gray-800">{quote.quote_number}</p>
            <p className="text-sm text-gray-500 mt-1">Créé le {formatDate(quote.created_at)}</p>
            {quote.valid_until && (
              <p className="text-sm text-gray-500">Valable jusqu&apos;au {formatDate(quote.valid_until)}</p>
            )}
          </div>
        </div>

        {/* Status banner */}
        {responded && (
          <div className={`rounded-xl p-4 flex items-center gap-3 ${
            response === 'accepted' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {response === 'accepted'
              ? <CheckCircle className="h-5 w-5 text-green-600" />
              : <XCircle className="h-5 w-5 text-red-600" />
            }
            <div>
              <p className={`font-semibold ${response === 'accepted' ? 'text-green-800' : 'text-red-800'}`}>
                {response === 'accepted' ? 'Devis accepté' : 'Devis refusé'}
              </p>
              {quote.client_responded_at && (
                <p className={`text-sm ${response === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                  Le {formatDate(quote.client_responded_at)}
                  {quote.client_signed_name && ` · Signé par ${quote.client_signed_name}`}
                </p>
              )}
            </div>
          </div>
        )}

        {expired && !responded && (
          <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
            Ce devis a expiré le {formatDate(quote.valid_until)}. Contactez le diagnostiqueur pour un nouveau devis.
          </div>
        )}

        {/* Client */}
        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3 text-gray-600">
            <Building className="h-4 w-4" />
            <h2 className="font-semibold">Vos informations</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Nom</p>
              <p className="font-medium">{quote.client_name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Email</p>
              <p className="font-medium">{quote.client_email}</p>
            </div>
            {quote.client_phone && (
              <div>
                <p className="text-gray-500 text-xs">Téléphone</p>
                <p className="font-medium">{quote.client_phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Property */}
        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Bien immobilier</h2>
          <div className="text-sm space-y-1">
            <p className="font-medium text-gray-900">{quote.property_address}</p>
            <p className="text-gray-600">
              {PROPERTY_LABELS[quote.property_type as keyof typeof PROPERTY_LABELS] || quote.property_type}
              {' · '}
              {TRANSACTION_LABELS[quote.transaction_type as keyof typeof TRANSACTION_LABELS] || quote.transaction_type}
            </p>
            {quote.property_surface && <p className="text-gray-600">{quote.property_surface} m²</p>}
            {quote.construction_year && <p className="text-gray-600">Année : {quote.construction_year}</p>}
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <FileText className="h-4 w-4" />
            <h2 className="font-semibold">Prestations</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 text-xs">
                <th className="pb-2 font-medium">Prestation</th>
                <th className="pb-2 font-medium text-center">Qté</th>
                <th className="pb-2 font-medium text-right">PU HT</th>
                <th className="pb-2 font-medium text-right">TVA</th>
                <th className="pb-2 font-medium text-right">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-2">
                    <p className="font-medium">{item.label}</p>
                    {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                  </td>
                  <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-600">{formatCurrency(item.unit_price_ht)}</td>
                  <td className="py-2 text-right text-gray-600">{item.tva_rate}%</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(item.total_ht)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-1 text-sm border-t pt-3">
            <div className="flex justify-between text-gray-600">
              <span>Total HT</span>
              <span>{formatCurrency(quote.total_ht)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVA</span>
              <span>{formatCurrency(quote.total_tva)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base">
              <span>Total TTC</span>
              <span>{formatCurrency(quote.total_ttc)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="rounded-xl bg-white border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-700 mb-2">Notes</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{quote.notes}</p>
          </div>
        )}

        {/* Accept/Refuse */}
        {!responded && !expired && quote.status === 'sent' && (
          <div className="rounded-xl bg-white border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Votre réponse</h2>
            <p className="text-sm text-gray-600">
              En acceptant ce devis, vous vous engagez à régler le montant de{' '}
              <strong>{formatCurrency(quote.total_ttc)} TTC</strong> selon les conditions de paiement convenues.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signature électronique — saisissez votre nom complet
              </label>
              <input
                type="text"
                value={signedName}
                onChange={(e) => setSignedName(e.target.value)}
                placeholder="Prénom Nom"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleRespond('accepted')}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Accepter le devis
              </button>
              <button
                onClick={() => handleRespond('refused')}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Refuser le devis
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          DiagPro · Diagnostics immobiliers certifiés
        </p>
      </div>
    </div>
  )
}
