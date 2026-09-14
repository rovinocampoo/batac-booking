create extension if not exists btree_gist;

-- Prevent overlapping active bookings for the same resource.
alter table public.bookings
add constraint bookings_no_overlap
exclude using gist (
  resource_id with =,
  tstzrange(starts_at, ends_at, '[)') with &&
)
where (status in ('PENDING', 'CONFIRMED'));