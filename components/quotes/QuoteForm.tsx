'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { quoteSchema, QuoteFormData } from '@/lib/schemas/quote'
import { DiagnosticCatalog } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import DiagnosticSelector from './DiagnosticSelector'
import TaxSummary from './TaxSummary'

interface QuoteFormProps {
  catalog: DiagnosticCatalog[]
}

export default function QuoteForm({ catalog }: QuoteFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      client_type: 'individual',
      property_type: 'apartment',
      transaction_type: 'sale',
      items: [],
      payment_conditions: '30 jours net',
    },
  })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form

  async function onSubmit(data: QuoteFormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Non connecté'); return }

    const totalHT = data.items.reduce((s, i) => s + i.quantity * i.unit_price_ht, 0)
    const totalTVA = data.items.reduce((s, i) => s + i.quantity * i.unit_price_ht * i.tva_rate / 100, 0)

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        user_id: user.id,
        quote_number: '',
        status: 'draft',
        client_type: data.client_type,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_address: data.client_address,
        client_company: data.client_company,
        client_siret: data.client_siret,
        property_address: data.property_address,
        property_type: data.property_type,
        property_surface: data.property_surface,
        construction_year: data.construction_year,
        transaction_type: data.transaction_type,
        valid_until: data.valid_until,
        notes: data.notes,
        payment_conditions: data.payment_conditions,
        total_ht: totalHT,
        total_tva: totalTVA,
        total_ttc: totalHT + totalTVA,
      })
      .select()
      .single()

    if (error || !quote) {
      toast.error('Erreur lors de la création du devis')
      return
    }

    if (data.items.length > 0) {
      await supabase.from('quote_items').insert(
        data.items.map((item, idx) => ({
          quote_id: quote.id,
          diagnostic_code: item.diagnostic_code || null,
          label: item.label,
          description: item.description,
          quantity: item.quantity,
          unit_price_ht: item.unit_price_ht,
          tva_rate: item.tva_rate,
          sort_order: idx,
        }))
      )
    }

    toast.success('Devis créé avec succès')
    router.push(`/quotes/${quote.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Client */}
      <section className="rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Informations client</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de client</label>
            <select {...register('client_type')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="individual">Particulier</option>
              <option value="company">Entreprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom / Raison sociale *</label>
            <input {...register('client_name')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.client_name && <p className="text-xs text-red-500 mt-1">{errors.client_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input {...register('client_email')} type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.client_email && <p className="text-xs text-red-500 mt-1">{errors.client_email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input {...register('client_phone')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse client</label>
            <input {...register('client_address')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </section>

      {/* Property */}
      <section className="rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Bien immobilier</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse du bien *</label>
            <input {...register('property_address')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.property_address && <p className="text-xs text-red-500 mt-1">{errors.property_address.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien</label>
            <select {...register('property_type')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="apartment">Appartement</option>
              <option value="house">Maison</option>
              <option value="commercial">Local commercial</option>
              <option value="land">Terrain</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de transaction</label>
            <select {...register('transaction_type')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="sale">Vente</option>
              <option value="rental">Location</option>
              <option value="works">Travaux</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
            <input {...register('property_surface', { valueAsNumber: true })} type="number" min="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année de construction</label>
            <input {...register('construction_year', { valueAsNumber: true })} type="number" min="1800" max={new Date().getFullYear()} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </section>

      {/* Diagnostics */}
      <section className="rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Prestations</h2>
        <DiagnosticSelector catalog={catalog} form={form} />
        {errors.items && <p className="text-xs text-red-500">{errors.items.message as string}</p>}
      </section>

      {/* Tax summary */}
      <TaxSummary form={form} />

      {/* Misc */}
      <section className="rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Conditions</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valable jusqu&apos;au</label>
            <input {...register('valid_until')} type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de paiement</label>
            <input {...register('payment_conditions')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea {...register('notes')} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Création...' : 'Créer le devis'}
        </button>
      </div>
    </form>
  )
}
