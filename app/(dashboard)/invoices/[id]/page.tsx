import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import InvoiceActions from '@/components/invoices/InvoiceActions'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select(`*, invoice_items(*)`)
    .eq('id', params.id)
    .single()

  if (!invoice) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  if (invoice.user_id !== user?.id) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const items = invoice.invoice_items || []

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    cancelled: 'Annulée',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Facture {invoice.invoice_number}</h1>
          <p className="text-sm text-gray-500">Émise le {formatDate(invoice.issue_date)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[invoice.status]}`}>
          {statusLabels[invoice.status]}
        </span>
        <InvoiceActions invoice={invoice} />
      </div>

      <div className="rounded-xl border border-gray-200 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between">
          <div>
            {profile?.company_name && <p className="text-xl font-bold text-gray-900">{profile.company_name}</p>}
            {profile?.address && <p className="text-sm text-gray-600 mt-1">{profile.address}</p>}
            {profile?.email && <p className="text-sm text-gray-600">{profile.email}</p>}
            {profile?.phone && <p className="text-sm text-gray-600">{profile.phone}</p>}
            {profile?.siret && <p className="text-sm text-gray-600">SIRET : {profile.siret}</p>}
            {profile?.tva_number && <p className="text-sm text-gray-600">TVA : {profile.tva_number}</p>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">FACTURE</p>
            <p className="text-lg font-semibold text-gray-800 mt-1">{invoice.invoice_number}</p>
            <p className="text-sm text-gray-500 mt-2">Date : {formatDate(invoice.issue_date)}</p>
            {invoice.due_date && <p className="text-sm text-gray-500">Échéance : {formatDate(invoice.due_date)}</p>}
          </div>
        </div>

        {/* Client */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Facturé à</p>
          <p className="font-semibold text-gray-900">{invoice.client_name}</p>
          {invoice.client_company && <p className="text-sm text-gray-600">{invoice.client_company}</p>}
          {invoice.client_address && <p className="text-sm text-gray-600">{invoice.client_address}</p>}
          <p className="text-sm text-gray-600">{invoice.client_email}</p>
          {invoice.client_phone && <p className="text-sm text-gray-600">{invoice.client_phone}</p>}
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-gray-600">
            <FileText className="h-4 w-4" />
            <h2 className="font-semibold">Détail des prestations</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-2 font-medium text-gray-600">Prestation</th>
                <th className="pb-2 font-medium text-gray-600 text-center">Qté</th>
                <th className="pb-2 font-medium text-gray-600 text-right">PU HT</th>
                <th className="pb-2 font-medium text-gray-600 text-right">TVA</th>
                <th className="pb-2 font-medium text-gray-600 text-right">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total HT</span>
              <span>{formatCurrency(invoice.total_ht)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVA</span>
              <span>{formatCurrency(invoice.total_tva)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2">
              <span>Total TTC</span>
              <span>{formatCurrency(invoice.total_ttc)}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        {invoice.payment_conditions && (
          <div className="border-t pt-4 text-sm text-gray-600">
            <p><strong>Conditions de paiement :</strong> {invoice.payment_conditions}</p>
            {profile?.payment_iban && <p className="mt-1"><strong>IBAN :</strong> {profile.payment_iban}</p>}
          </div>
        )}

        {invoice.notes && (
          <div className="border-t pt-4 text-sm text-gray-600">
            <p><strong>Notes :</strong> {invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
