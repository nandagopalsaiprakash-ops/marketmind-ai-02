create table public.gsc_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  selected_site text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gsc_connections enable row level security;

create policy "Users manage own gsc connection"
on public.gsc_connections for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index gsc_connections_user_id_idx on public.gsc_connections(user_id);