-- Diagnostic reports (uploaded PDFs)
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quote_id uuid references public.quotes(id) on delete cascade not null,
  diagnostic_code text references public.diagnostics_catalog(code),
  file_name text not null,
  file_path text not null,
  file_size integer,
  mime_type text default 'application/pdf',
  uploaded_at timestamptz default now()
);

alter table public.reports enable row level security;
create policy "Users manage their own reports"
  on public.reports for all using (auth.uid() = user_id);

-- Storage bucket for reports
insert into storage.buckets (id, name, public) values ('reports', 'reports', false);

create policy "Users can upload reports"
  on storage.objects for insert
  with check (bucket_id = 'reports' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read their own reports"
  on storage.objects for select
  using (bucket_id = 'reports' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own reports"
  on storage.objects for delete
  using (bucket_id = 'reports' and auth.uid()::text = (storage.foldername(name))[1]);
