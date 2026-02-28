-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  company_name text not null,
  siret text,
  address text,
  phone text,
  email text,
  logo_url text,
  tva_number text,
  payment_iban text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can manage their own profile"
  on public.profiles for all using (auth.uid() = id);

-- Diagnostics catalog
create table public.diagnostics_catalog (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  label text not null,
  description text,
  default_price_ht numeric(10,2) not null default 0,
  tva_rate numeric(5,2) not null default 20.00,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Seed diagnostics catalog
insert into public.diagnostics_catalog (code, label, description, default_price_ht, tva_rate) values
  ('DPE', 'DPE', 'Diagnostic de Performance Énergétique', 120.00, 20.00),
  ('AMIANTE', 'Amiante', 'Diagnostic amiante avant vente/travaux', 150.00, 20.00),
  ('PLOMB', 'Plomb (CREP)', 'Constat de Risque d''Exposition au Plomb', 130.00, 20.00),
  ('ELECTRICITE', 'Électricité', 'Diagnostic installation électrique', 110.00, 20.00),
  ('GAZ', 'Gaz', 'Diagnostic installation gaz', 110.00, 20.00),
  ('TERMITES', 'Termites', 'État relatif à la présence de termites', 90.00, 20.00),
  ('CARREZ', 'Loi Carrez', 'Mesurage loi Carrez', 80.00, 20.00),
  ('BOUTIN', 'Loi Boutin', 'Mesurage loi Boutin (location)', 70.00, 20.00),
  ('ERP', 'ERP', 'État des Risques et Pollutions', 60.00, 20.00),
  ('ASSAINISSEMENT', 'Assainissement', 'Diagnostic assainissement non collectif', 200.00, 20.00),
  ('RADON', 'Radon', 'Diagnostic radon', 90.00, 20.00),
  ('MERULE', 'Mérule', 'Diagnostic mérule', 100.00, 20.00);

-- Quotes
create table public.quotes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  public_token uuid default uuid_generate_v4() unique not null,
  quote_number text not null,
  status text not null default 'draft' check (status in ('draft','sent','accepted','refused','expired')),
  -- Client info
  client_type text not null default 'individual' check (client_type in ('individual','company')),
  client_name text not null,
  client_email text not null,
  client_phone text,
  client_address text,
  client_company text,
  client_siret text,
  -- Property info
  property_address text not null,
  property_type text not null check (property_type in ('apartment','house','commercial','land','other')),
  property_surface numeric(8,2),
  construction_year integer,
  transaction_type text not null check (transaction_type in ('sale','rental','works','other')),
  -- Financials
  total_ht numeric(10,2) not null default 0,
  total_tva numeric(10,2) not null default 0,
  total_ttc numeric(10,2) not null default 0,
  -- Dates & misc
  valid_until date,
  notes text,
  payment_conditions text default '30 jours net',
  -- Client response
  client_signed_name text,
  client_responded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.quotes enable row level security;
create policy "Users manage their own quotes"
  on public.quotes for all using (auth.uid() = user_id);
create policy "Public can read quotes by token"
  on public.quotes for select using (true);

-- Quote items
create table public.quote_items (
  id uuid default uuid_generate_v4() primary key,
  quote_id uuid references public.quotes(id) on delete cascade not null,
  diagnostic_code text references public.diagnostics_catalog(code),
  label text not null,
  description text,
  quantity integer not null default 1,
  unit_price_ht numeric(10,2) not null,
  tva_rate numeric(5,2) not null default 20.00,
  total_ht numeric(10,2) generated always as (quantity * unit_price_ht) stored,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.quote_items enable row level security;
create policy "Users manage items via quotes"
  on public.quote_items for all
  using (exists (select 1 from public.quotes q where q.id = quote_id and q.user_id = auth.uid()));
create policy "Public can read quote items by token"
  on public.quote_items for select using (true);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger quotes_updated_at before update on public.quotes
  for each row execute function update_updated_at();

-- Auto-generate quote number
create sequence quote_number_seq start 1000;
create or replace function set_quote_number()
returns trigger language plpgsql as $$
begin
  if new.quote_number is null or new.quote_number = '' then
    new.quote_number := 'DG-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('quote_number_seq')::text, 4, '0');
  end if;
  return new;
end; $$;

create trigger quotes_set_number before insert on public.quotes
  for each row execute function set_quote_number();
