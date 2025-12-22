-- Store user-provided contact details (name/phone/email) captured during "web registration".

create table if not exists public.user_contacts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text null,
  phone text null,
  email text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_contacts_set_updated_at on public.user_contacts;
create trigger user_contacts_set_updated_at
before update on public.user_contacts
for each row execute procedure public.set_updated_at();

alter table public.user_contacts enable row level security;

drop policy if exists "user_contacts_select_own_or_host" on public.user_contacts;
create policy "user_contacts_select_own_or_host"
on public.user_contacts for select
using (auth.uid() = user_id or public.is_host());

drop policy if exists "user_contacts_insert_own" on public.user_contacts;
create policy "user_contacts_insert_own"
on public.user_contacts for insert
with check (auth.uid() = user_id);

drop policy if exists "user_contacts_update_own" on public.user_contacts;
create policy "user_contacts_update_own"
on public.user_contacts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


