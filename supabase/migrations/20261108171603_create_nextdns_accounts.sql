create table if not exists public.nextdns_accounts (
    id uuid primary key default gen_random_uuid(),
    profile_id text not null unique,
    email text not null,
    password text not null,
    dns_url text not null,
    fly_ip text not null default '66.241.124.216',
    rewrites jsonb default '[]'::jsonb,
    query_count integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Index on profile_id and email for fast lookups
create index if not exists idx_nextdns_accounts_profile_id on public.nextdns_accounts(profile_id);
create index if not exists idx_nextdns_accounts_email on public.nextdns_accounts(email);

-- Enable Row Level Security
alter table public.nextdns_accounts enable row level security;

-- Allow anon read-only by profile_id
create policy "Allow anon select by profile_id"
on public.nextdns_accounts for select
to anon
using (true);

-- Allow service_role full access
create policy "Allow service_role all"
on public.nextdns_accounts for all
to service_role
using (true)
with check (true);
