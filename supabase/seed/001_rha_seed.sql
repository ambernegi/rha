-- Seed data for RHA Villa inventory and configurations.
-- Safe to re-run: uses ON CONFLICT DO NOTHING patterns.

-- ----------------
-- Atomic resources
-- ----------------
insert into public.resources (key, label) values
  ('shared_1', 'Room with shared bathroom (1)'),
  ('attached_1', 'Room with attached bathroom (1)'),
  ('attached_2', 'Room with attached bathroom (2)'),
  ('attached_3', 'Room with attached bathroom (3)'),
  ('twin_1', 'Twin sharing room (1)')
on conflict (key) do nothing;

-- ----------------
-- Configurations
-- ----------------
insert into public.configurations (slug, label, price_per_night) values
  ('entire_villa', 'Entire Villa', 15000),
  ('villa_3bhk', '3BHK in Villa', 8000),
  ('shared_1', 'Single Room (Shared Bathroom)', 1200),
  ('attached_1', 'Single Room (Attached Bathroom)', 1500),
  ('attached_2', 'Single Room (Attached Bathroom)', 1500),
  ('attached_3', 'Single Room (Attached Bathroom)', 1500),
  ('twin_1', 'Twin Sharing Room', 1500)
on conflict (slug) do nothing;

-- ----------------------------------
-- Configuration → Resources mapping
-- ----------------------------------
with
  r as (
    select id, key from public.resources where key in ('shared_1','attached_1','attached_2','attached_3','twin_1')
  ),
  c as (
    select id, slug from public.configurations where slug in ('entire_villa','villa_3bhk','shared_1','attached_1','attached_2','attached_3','twin_1')
  )
insert into public.configuration_resources (configuration_id, resource_id)
select c.id, r.id
from c
join r on (
  -- Single-room configurations map to their corresponding single resource
  (c.slug in ('shared_1','attached_1','attached_2','attached_3','twin_1') and c.slug = r.key)
  -- Entire villa maps to all resources
  or (c.slug = 'entire_villa')
  -- 3BHK = 2 attached + 1 shared (choose attached_1 and attached_2 deterministically)
  or (c.slug = 'villa_3bhk' and r.key in ('shared_1','attached_1','attached_2'))
)
on conflict do nothing;


