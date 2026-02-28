-- Interventions (planning calendar)
create table public.interventions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quote_id uuid references public.quotes(id) on delete set null,
  title text not null,
  client_name text not null,
  property_address text not null,
  intervention_date date not null,
  start_time text not null,
  end_time text not null,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.interventions enable row level security;
create policy "Users manage their own interventions"
  on public.interventions for all using (auth.uid() = user_id);

create trigger interventions_updated_at before update on public.interventions
  for each row execute function update_updated_at();
