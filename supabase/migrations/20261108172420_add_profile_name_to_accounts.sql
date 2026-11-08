alter table public.nextdns_accounts
add column if not exists profile_name text default '',
add column if not exists notes text default '';
