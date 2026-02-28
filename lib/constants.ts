export const QUOTE_STATUS = {
  draft:    { label: 'Brouillon', cls: 'bg-zinc-700 text-zinc-300',            dot: 'bg-zinc-400'    },
  sent:     { label: 'Envoyé',    cls: 'bg-blue-500/20 text-blue-400',         dot: 'bg-blue-400'    },
  accepted: { label: 'Accepté',   cls: 'bg-emerald-500/20 text-emerald-400',   dot: 'bg-emerald-400' },
  refused:  { label: 'Refusé',    cls: 'bg-red-500/20 text-red-400',           dot: 'bg-red-400'     },
  expired:  { label: 'Expiré',    cls: 'bg-amber-500/20 text-amber-400',       dot: 'bg-amber-400'   },
} as const

export const INVOICE_STATUS = {
  draft: { label: 'Brouillon', cls: 'bg-zinc-700 text-zinc-300',           dot: 'bg-zinc-400'    },
  sent:  { label: 'Envoyée',   cls: 'bg-blue-500/20 text-blue-400',        dot: 'bg-blue-400'    },
  paid:  { label: 'Payée',     cls: 'bg-emerald-500/20 text-emerald-400',  dot: 'bg-emerald-400' },
} as const

export const INTERVENTION_STATUS = {
  scheduled:   { label: 'Planifiée',  cls: 'bg-blue-500/20 text-blue-400',       dot: 'bg-blue-400',    card: 'border-blue-500/40 bg-blue-500/10'      },
  in_progress: { label: 'En cours',   cls: 'bg-amber-500/20 text-amber-400',     dot: 'bg-amber-400',   card: 'border-amber-500/40 bg-amber-500/10'    },
  completed:   { label: 'Terminée',   cls: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400', card: 'border-emerald-500/40 bg-emerald-500/10' },
  cancelled:   { label: 'Annulée',    cls: 'bg-zinc-700 text-zinc-400',          dot: 'bg-zinc-500',    card: 'border-zinc-700 bg-zinc-800/50 opacity-60'},
} as const

export const PROPERTY_LABELS = {
  appartement:      'Appartement',
  maison:           'Maison / Villa',
  local_commercial: 'Local commercial',
  autre:            'Autre',
} as const

export const TRANSACTION_LABELS = {
  vente:         'Vente',
  location:      'Location',
  avant_travaux: 'Avant travaux',
  autre:         'Autre',
} as const

export const PAYMENT_METHODS = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'cheque',   label: 'Chèque'            },
  { value: 'cb',       label: 'Carte bancaire'     },
  { value: 'especes',  label: 'Espèces'            },
]

export const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const h = Math.floor(i / 2) + 7
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})
