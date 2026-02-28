import { z } from 'zod'

export const quoteItemSchema = z.object({
  id:              z.string().optional(),
  diagnostic_code: z.string().nullable().optional(),
  description:     z.string().min(1, 'Description requise'),
  quantity:        z.coerce.number().positive('Quantité > 0'),
  unit_price:      z.coerce.number().min(0, 'Prix invalide'),
  notes:           z.string().optional(),
})

export const quoteSchema = z.object({
  client_name:       z.string().min(2, 'Nom requis'),
  client_email:      z.string().email('Email invalide').or(z.literal('')).optional(),
  client_phone:      z.string().optional(),
  client_address:    z.string().optional(),
  client_type:       z.enum(['particulier', 'professionnel', 'agence']),
  property_address:  z.string().min(5, 'Adresse du bien requise'),
  property_type:     z.enum(['appartement', 'maison', 'local_commercial', 'autre']),
  property_surface:  z.coerce.number().positive().optional(),
  construction_year: z.coerce.number().min(1800).max(new Date().getFullYear()).optional(),
  transaction_type:  z.enum(['vente', 'location', 'avant_travaux', 'autre']),
  floors_count:      z.coerce.number().min(1).default(1),
  lot_number:        z.string().optional(),
  tva_rate:          z.coerce.number().refine(v => [5.5, 10, 20].includes(v)),
  validity_days:     z.coerce.number().min(1).default(30),
  intervention_date: z.string().optional(),
  notes:             z.string().optional(),
  quote_items:       z.array(quoteItemSchema).min(1, 'Sélectionnez au moins un diagnostic'),
})

export type QuoteFormValues = z.infer<typeof quoteSchema>
