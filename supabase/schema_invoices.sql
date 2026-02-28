-- Invoices
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quote_id uuid references public.quotes(id) on delete set null,
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft','sent','paid','cancelled')),
  -- Client info (copied from quote)
  client_name text not null,
  client_email text not null,
  client_phone text,
  client_address text,
  client_company text,
  -- Financials
  total_ht numeric(10,2) not null default 0,
  total_tva numeric(10,2) not null default 0,
  total_ttc numeric(10,2) not null default 0,
  -- Dates
  issue_date date not null default current_date,
  due_date date,
  paid_at timestamptz,
  notes text,
  payment_conditions text default '30 jours net',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.invoices enable row level security;
create policy "Users manage their own invoices"
  on public.invoices for all using (auth.uid() = user_id);

-- Invoice items
create table public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  label text not null,
  description text,
  quantity integer not null default 1,
  unit_price_ht numeric(10,2) not null,
  tva_rate numeric(5,2) not null default 20.00,
  total_ht numeric(10,2) generated always as (quantity * unit_price_ht) stored,
  sort_order integer default 0
);

alter table public.invoice_items enable row level security;
create policy "Users manage invoice items"
  on public.invoice_items for all
  using (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid()));

-- Auto-update updated_at
create trigger invoices_updated_at before update on public.invoices
  for each row execute function update_updated_at();

-- Auto-generate invoice number
create sequence invoice_number_seq start 1000;
create or replace function set_invoice_number()
returns trigger language plpgsql as $$
begin
  if new.invoice_number is null or new.invoice_number = '' then
    new.invoice_number := 'FA-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
  end if;
  return new;
end; $$;

create trigger invoices_set_number before insert on public.invoices
  for each row execute function set_invoice_number();
