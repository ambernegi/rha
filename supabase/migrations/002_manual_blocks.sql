-- Manual availability blocks (for bookings from other channels)

-- Mark whether a booking originated from a guest request or a host/manual block.
alter table public.bookings
add column if not exists source text not null default 'guest'
  check (source in ('guest', 'manual'));

create index if not exists bookings_source_idx on public.bookings (source);

-- RPC: host creates a confirmed "manual block" that generates locks.
create or replace function public.create_manual_block(
  p_configuration_slug text,
  p_start_date date,
  p_end_date date,
  p_note text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg_id uuid;
  b public.bookings;
begin
  if not public.is_host() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_start_date is null or p_end_date is null or p_start_date >= p_end_date then
    raise exception 'invalid_dates' using errcode = '22007';
  end if;

  select id into cfg_id
  from public.configurations
  where slug = p_configuration_slug
  limit 1;

  if cfg_id is null then
    raise exception 'configuration_not_found' using errcode = 'P0002';
  end if;

  -- Insert a confirmed booking owned by the host user (auth.uid()).
  insert into public.bookings (
    user_id,
    configuration_id,
    guest_email,
    guest_name,
    start_date,
    end_date,
    status,
    total_price,
    decision_note,
    confirmed_at,
    source
  )
  values (
    auth.uid(),
    cfg_id,
    null,
    'Manual block',
    p_start_date,
    p_end_date,
    'confirmed',
    0,
    p_note,
    now(),
    'manual'
  )
  returning * into b;

  -- Create locks for the atomic resources that make up the configuration.
  insert into public.booking_locks (booking_id, resource_id, start_date, end_date)
  select b.id, cr.resource_id, b.start_date, b.end_date
  from public.configuration_resources cr
  where cr.configuration_id = b.configuration_id;

  return b;
end;
$$;

revoke all on function public.create_manual_block(text, date, date, text) from public;
grant execute on function public.create_manual_block(text, date, date, text) to authenticated;


