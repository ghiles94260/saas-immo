import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PROPERTY_LABELS, TRANSACTION_LABELS } from '@/lib/constants'
import QuoteStatusUpdater from '@/components/quotes/QuoteStatusUpdater'
import QuoteActions from '@/components/quotes/QuoteActions'
import Link from 'next/link'
import { ArrowLeft, Building, Calendar, User, FileText } from 'lucide-react'

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select(`*, quote_items(*)`)
    .eq('id', params.id)
    .single()

  if (!quote) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  if (quote.user_id !== user?.id) notFound()

  const items = quote.quote_items || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/quotes" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Devis {quote.quote_number}</h1>
          <p className="text-sm text-gray-500">Créé le {formatDate(quote.created_at)}</p>
        </div>
        <QuoteStatusUpdater quoteId={quote.id} currentStatus={quote.status} />
        <QuoteActions quote={quote} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Client */}
          <div className="rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <User className="h-4 w-4" />
              <h2 className="font-semibold">Client</h2>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">{quote.client_name}</p>
              {quote.client_company && <p className="text-gray-600">{quote.client_company}</p>}
              <p className="text-gray-600">{quote.client_email}</p>
              {quote.client_phone && <p className="text-gray-600">{quote.client_phone}</p>}
              {quote.client_address && <p className="text-gray-600">{quote.client_address}</p>}
            </div>
          </div>

          {/* Property */}
          <div className="rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <Building className="h-4 w-4" />
              <h2 className="font-semibold">Bien immobilier</h2>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">{quote.property_address}</p>
              <p className="text-gray-600">
                {PROPERTY_LABELS[quote.property_type as keyof typeof PROPERTY_LABELS] || quote.property_type}
                {' · '}
                {TRANSACTION_LABELS[quote.transaction_type as keyof typeof TRANSACTION_LABELS] || quote.transaction_type}
              </p>
              {quote.property_surface && <p className="text-gray-600">Surface : {quote.property_surface} m²</p>}
              {quote.construction_year && <p className="text-gray-600">Construction : {quote.construction_year}</p>}
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <FileText className="h-4 w-4" />
              <h2 className="font-semibold">Prestations</h2>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 border-b pb-2">
                <span className="col-span-5">Prestation</span>
                <span className="col-span-2 text-center">Qté</span>
                <span className="col-span-2 text-right">PU HT</span>
                <span className="col-span-1 text-right">TVA</span>
                <span className="col-span-2 text-right">Total HT</span>
              </div>
              {items.map((item: any) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 text-sm py-2 border-b border-gray-50">
                  <div className="col-span-5">
                    <p className="font-medium">{item.label}</p>
                    {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                  </div>
                  <p className="col-span-2 text-center text-gray-600">{item.quantity}</p>
                  <p className="col-span-2 text-right text-gray-600">{formatCurrency(item.unit_price_ht)}</p>
                  <p className="col-span-1 text-right text-gray-600">{item.tva_rate}%</p>
                  <p className="col-span-2 text-right font-medium">{formatCurrency(item.total_ht)}</p>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total HT</span>
                <span>{formatCurrency(quote.total_ht)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA</span>
                <span>{formatCurrency(quote.total_tva)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 text-base border-t pt-2">
                <span>Total TTC</span>
                <span>{formatCurrency(quote.total_ttc)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Dates */}
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3 text-gray-600">
              <Calendar className="h-4 w-4" />
              <h3 className="font-semibold text-sm">Dates</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">Créé le</p>
                <p className="font-medium">{formatDate(quote.created_at)}</p>
              </div>
              {quote.valid_until && (
                <div>
                  <p className="text-xs text-gray-500">Valable jusqu&apos;au</p>
                  <p className="font-medium">{formatDate(quote.valid_until)}</p>
                </div>
              )}
              {quote.client_responded_at && (
                <div>
                  <p className="text-xs text-gray-500">Réponse client</p>
                  <p className="font-medium">{formatDate(quote.client_responded_at)}</p>
                  {quote.client_signed_name && (
                    <p className="text-xs text-gray-600">par {quote.client_signed_name}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Public link */}
          {quote.status !== 'draft' && (
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Lien client</h3>
              <p className="text-xs text-gray-500 break-all">
                {process.env.NEXT_PUBLIC_APP_URL || ''}/devis/{quote.public_token}
              </p>
            </div>
          )}

          {/* Notes */}
          {quote.notes && (
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{quote.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
