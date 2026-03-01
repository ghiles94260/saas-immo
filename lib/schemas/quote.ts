import { z } from 'zod'

export const quoteItemSchema = z.object({
  diagnostic_code: z.string().nullable().optional(),
  label:           z.string().min(1, 'Libellé requis'),
  description:     z.string().optional(),
  quantity:        z.coerce.number().int().positive('Quantité > 0'),
  unit_price_ht:   z.coerce.number().min(0, 'Prix invalide'),
  tva_rate:        z.coerce.number().refine((v) => [5.5, 10, 20].includes(v), 'TVA invalide'),
})

export const quoteSchema = z.object({
  client_type:       z.enum(['individual', 'company']),
  client_name:       z.string().min(2, 'Nom requis'),
  client_email:      z.string().email('Email invalide'),
  client_phone:      z.string().optional(),
  client_address:    z.string().optional(),
  client_company:    z.string().optional(),
  client_siret:      z.string().optional(),
  property_address:  z.string().min(5, 'Adresse du bien requise'),
  property_type:     z.enum(['apartment', 'house', 'commercial', 'land', 'other']),
  property_surface:  z.coerce.number().positive().optional(),
  construction_year: z.coerce.number().min(1800).max(new Date().getFullYear()).optional(),
  transaction_type:  z.enum(['sale', 'rental', 'works', 'other']),
  valid_until:       z.string().optional(),
  payment_conditions: z.string().optional(),
  notes:             z.string().optional(),
  items:             z.array(quoteItemSchema).min(1, 'Ajoutez au moins un diagnostic'),
})

export type QuoteFormData = z.infer<typeof quoteSchema>
