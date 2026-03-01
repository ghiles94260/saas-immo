export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'refused' | 'expired'
export type PropertyType = 'appartement' | 'maison' | 'local_commercial' | 'autre'
export type TransactionType = 'vente' | 'location' | 'avant_travaux' | 'autre'
export type ClientType = 'particulier' | 'professionnel' | 'agence'
export type InvoiceStatus = 'draft' | 'sent' | 'paid'
export type InterventionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface Profile {
  id: string
  email: string
  company_name: string | null
  created_at: string
}

export interface DiagnosticCatalog {
  id: string
  code: string
  label: string
  description: string | null
  default_price_ht: number
  tva_rate: number
  is_active: boolean
}

export interface QuoteItem {
  id: string
  quote_id: string
  diagnostic_code: string | null
  description: string
  quantity: number
  unit_price: number
  total: number
  notes: string | null
}

export interface Quote {
  id: string
  user_id: string
  quote_number: number
  public_token: string
  client_name: string
  client_email: string | null
  client_phone: string | null
  client_address: string | null
  client_type: ClientType
  property_address: string
  property_type: PropertyType
  property_surface: number | null
  construction_year: number | null
  transaction_type: TransactionType
  floors_count: number
  lot_number: string | null
  status: QuoteStatus
  validity_days: number
  intervention_date: string | null
  invoiced_at: string | null
  client_signed_name: string | null
  client_responded_at: string | null
  notes: string | null
  total_ht: number
  tva_rate: number
  total_ttc: number
  created_at: string
  updated_at: string
  quote_items?: QuoteItem[]
}

export interface DashboardStats {
  totalQuotes: number
  pendingQuotes: number
  acceptedQuotes: number
  totalRevenue: number
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  diagnostic_code: string | null
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Invoice {
  id: string
  user_id: string
  quote_id: string | null
  invoice_number: number
  client_name: string
  client_email: string | null
  client_phone: string | null
  client_address: string | null
  property_address: string | null
  property_type: string | null
  transaction_type: string | null
  status: InvoiceStatus
  due_date: string
  paid_at: string | null
  payment_method: string | null
  total_ht: number
  tva_rate: number
  total_ttc: number
  notes: string | null
  created_at: string
  invoice_items?: InvoiceItem[]
}

export interface Report {
  id: string
  user_id: string
  quote_id: string
  diagnostic_code: string | null
  label: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string
  uploaded_at: string
}

export interface Intervention {
  id: string
  user_id: string
  quote_id: string | null
  title: string
  client_name: string
  property_address: string
  intervention_date: string
  start_time: string
  end_time: string
  status: InterventionStatus
  notes: string | null
  created_at: string
  updated_at: string
}
