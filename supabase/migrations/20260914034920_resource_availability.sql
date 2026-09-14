create or replace function public.get_resource_availability(
  target_resource_id uuid,
  target_pricing_id uuid,
  target_date date
)
returns table (
  starts_at timestamptz,
  ends_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_duration integer;
begin
  /*
   * BatacHub currently operates in Asia/Manila.
   * This can become a business-level timezone later.
   */
  if target_date < (
    now() at time zone 'Asia/Manila'
  )::date then
    raise exception 'Cannot check availability for a past date';
  end if;

  /*
   * Verify that the resource exists, is active,
   * belongs to an approved business, and that the
   * pricing option belongs to this resource.
   */
  select rp.duration_minutes
  into selected_duration
  from public.resource_pricing rp
  join public.resources r
    on r.id = rp.resource_id
  join public.businesses b
    on b.id = r.business_id
  where rp.id = target_pricing_id
    and rp.resource_id = target_resource_id
    and r.status = 'ACTIVE'
    and b.status = 'APPROVED';

  if selected_duration is null then
    raise exception
      'Resource or pricing option is not available';
  end if;

  return query
  with resource_hours_local as (
    select
      (
        target_date + rh.opens_at
      ) at time zone 'Asia/Manila' as opens_at,
      (
        target_date + rh.closes_at
      ) at time zone 'Asia/Manila' as closes_at
    from public.resource_hours rh
    where rh.resource_id = target_resource_id
      and rh.day_of_week = extract(
        dow from target_date
      )::integer
  ),
  candidate_slots as (
    select
      slot_start as starts_at,
      slot_start
        + make_interval(mins => selected_duration)
        as ends_at
    from resource_hours_local hours
    cross join lateral generate_series(
      hours.opens_at,
      hours.closes_at
        - make_interval(mins => selected_duration),
      make_interval(mins => selected_duration)
    ) as slot_start
  )
  select
    candidate_slots.starts_at,
    candidate_slots.ends_at
  from candidate_slots
  where not exists (
    select 1
    from public.bookings booking
    where booking.resource_id = target_resource_id
      and booking.status in ('PENDING', 'CONFIRMED')
      and tstzrange(
        booking.starts_at,
        booking.ends_at,
        '[)'
      ) &&
      tstzrange(
        candidate_slots.starts_at,
        candidate_slots.ends_at,
        '[)'
      )
  )
  order by candidate_slots.starts_at;
end;
$$;

revoke execute on function public.get_resource_availability(
  uuid,
  uuid,
  date
)
from public;

grant execute on function public.get_resource_availability(
  uuid,
  uuid,
  date
)
to anon, authenticated;