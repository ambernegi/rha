-- Booking system schema (Supabase Postgres)
-- Supports overlapping configurations (Entire Villa / 3BHK / Single Rooms) via atomic room locks.

-- Enable required extension for exclusion constraints.
create extension if not exists btree_gist;

-- ---------------
-- Profiles / roles
-- ---------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'guest' check (role in ('guest', 'host')),
  created_at timestamptz not null default now()
);

-- Create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'guest')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ----------------
-- Atomic resources
-- ----------------
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- -----------------
-- Configurations
-- -----------------
create table if not exists public.configurations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  price_per_night numeric not null check (price_per_night >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.configuration_resources (
  configuration_id uuid not null references public.configurations (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete restrict,
  primary key (configuration_id, resource_id)
);

-- -----------------
-- Bookings + locks
-- -----------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  configuration_id uuid not null references public.configurations (id) on delete restrict,
  guest_email text null,
  guest_name text null,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
  total_price numeric not null default 0 check (total_price >= 0),
  decision_note text null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz null,
  cancelled_at timestamptz null,
  constraint bookings_date_order check (start_date < end_date)
);

create index if not exists bookings_user_id_idx on public.bookings (user_id);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_dates_idx on public.bookings (start_date, end_date);

create table if not exists public.booking_locks (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete restrict,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  constraint booking_locks_date_order check (start_date < end_date)
);

create index if not exists booking_locks_resource_dates_idx
  on public.booking_locks (resource_id, start_date, end_date);

-- Prevent overlapping confirmed locks per resource (half-open range).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'booking_locks_no_overlap'
  ) then
    alter table public.booking_locks
    add constraint booking_locks_no_overlap
    exclude using gist (
      resource_id with =,
      daterange(start_date, end_date, '[)') with &&
    );
  end if;
end;
$$;

-- -------------------------
-- RLS helper: is_host()
-- -------------------------
create or replace function public.is_host()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'host'
  );
$$;

-- -------------
-- Row Level Security
-- -------------
alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.configurations enable row level security;
alter table public.configuration_resources enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_locks enable row level security;

-- profiles: user can read their own; host can read all; host can update roles.
drop policy if exists "profiles_select_own_or_host" on public.profiles;
create policy "profiles_select_own_or_host"
on public.profiles for select
using (auth.uid() = id or public.is_host());

drop policy if exists "profiles_update_host_only" on public.profiles;
create policy "profiles_update_host_only"
on public.profiles for update
using (public.is_host())
with check (public.is_host());

-- resources/configurations: readable by everyone (needed for booking UI), writable only by host.
drop policy if exists "resources_select_all" on public.resources;
create policy "resources_select_all"
on public.resources for select
using (true);

drop policy if exists "resources_write_host_only" on public.resources;
create policy "resources_write_host_only"
on public.resources for all
using (public.is_host())
with check (public.is_host());

drop policy if exists "configurations_select_all" on public.configurations;
create policy "configurations_select_all"
on public.configurations for select
using (true);

drop policy if exists "configurations_write_host_only" on public.configurations;
create policy "configurations_write_host_only"
on public.configurations for all
using (public.is_host())
with check (public.is_host());

drop policy if exists "configuration_resources_select_all" on public.configuration_resources;
create policy "configuration_resources_select_all"
on public.configuration_resources for select
using (true);

drop policy if exists "configuration_resources_write_host_only" on public.configuration_resources;
create policy "configuration_resources_write_host_only"
on public.configuration_resources for all
using (public.is_host())
with check (public.is_host());

-- bookings: guests manage their own pending requests; host can see/manage all.
drop policy if exists "bookings_select_own_or_host" on public.bookings;
create policy "bookings_select_own_or_host"
on public.bookings for select
using (auth.uid() = user_id or public.is_host());

drop policy if exists "bookings_insert_own_pending" on public.bookings;
create policy "bookings_insert_own_pending"
on public.bookings for insert
with check (
  auth.uid() = user_id
  and status = 'pending'
);

drop policy if exists "bookings_update_own_cancel_pending_or_host" on public.bookings;
create policy "bookings_update_own_cancel_pending_or_host"
on public.bookings for update
using (
  public.is_host()
  or (auth.uid() = user_id and status = 'pending')
)
with check (
  public.is_host()
  or (auth.uid() = user_id and status in ('pending', 'cancelled'))
);

-- booking_locks: readable (non-PII) for availability; write host-only.
drop policy if exists "booking_locks_select_all" on public.booking_locks;
create policy "booking_locks_select_all"
on public.booking_locks for select
using (true);

drop policy if exists "booking_locks_write_host_only" on public.booking_locks;
create policy "booking_locks_write_host_only"
on public.booking_locks for all
using (public.is_host())
with check (public.is_host());

-- -------------------------
-- RPC: host confirms booking (creates locks + updates status)
-- -------------------------
create or replace function public.confirm_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.bookings;
begin
  if not public.is_host() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select *
  into b
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  if b.status <> 'pending' then
    raise exception 'invalid_status' using errcode = 'P0001';
  end if;

  -- Create locks for the atomic resources that make up the booking configuration.
  insert into public.booking_locks (booking_id, resource_id, start_date, end_date)
  select b.id, cr.resource_id, b.start_date, b.end_date
  from public.configuration_resources cr
  where cr.configuration_id = b.configuration_id;

  -- Recalculate price defensively from configuration price (date diff yields integer days).
  update public.bookings bk
  set
    status = 'confirmed',
    confirmed_at = now(),
    total_price = (bk.end_date - bk.start_date) * c.price_per_night
  from public.configurations c
  where bk.id = b.id
    and c.id = bk.configuration_id
  returning * into b;

  return b;
end;
$$;

revoke all on function public.confirm_booking(uuid) from public;
grant execute on function public.confirm_booking(uuid) to authenticated;

-- RPC: host rejects booking (no locks)
create or replace function public.reject_booking(p_booking_id uuid, p_note text default null)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.bookings;
begin
  if not public.is_host() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.bookings bk
  set
    status = 'rejected',
    decision_note = p_note
  where bk.id = p_booking_id
    and bk.status = 'pending'
  returning * into b;

  if not found then
    raise exception 'not_found_or_not_pending' using errcode = 'P0002';
  end if;

  return b;
end;
$$;

revoke all on function public.reject_booking(uuid, text) from public;
grant execute on function public.reject_booking(uuid, text) to authenticated;


