create or replace function public.create_booking(
  target_resource_id uuid,
  target_pricing_id uuid,
  target_starts_at timestamptz
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_user_id uuid;
  duration_minutes integer;
  booking_ends_at timestamptz;
  new_booking_id uuid;
  price_amount numeric(10,2);
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'You must be signed in to create a booking';
  end if;

  select
    rp.duration_minutes,
    rp.price
  into
    duration_minutes,
    price_amount
  from public.resource_pricing rp
  join public.resources r
    on r.id = rp.resource_id
  join public.businesses b
    on b.id = r.business_id
  where rp.id = target_pricing_id
    and rp.resource_id = target_resource_id
    and r.status = 'ACTIVE'
    and b.status = 'APPROVED';

  if duration_minutes is null then
    raise exception
      'Resource or pricing option is not available';
  end if;

  booking_ends_at :=
    target_starts_at
    + make_interval(mins => duration_minutes);

  if target_starts_at < now() then
    raise exception 'Cannot book a time in the past';
  end if;

  /*
   * Verify the requested interval actually fits inside
   * one of the resource's operating periods.
   */
  if not exists (
    select 1
    from public.resource_hours rh
    where rh.resource_id = target_resource_id
      and rh.day_of_week =
        extract(
          dow from target_starts_at
            at time zone 'Asia/Manila'
        )::integer
      and (
        target_starts_at
          at time zone 'Asia/Manila'
      )::time >= rh.opens_at
      and (
        booking_ends_at
          at time zone 'Asia/Manila'
      )::time <= rh.closes_at
  ) then
    raise exception
      'Requested time is outside resource operating hours';
  end if;

  /*
   * The exclusion constraint on bookings is the final
   * concurrency protection against overlapping bookings.
   */
  insert into public.bookings (
    resource_id,
    customer_id,
    starts_at,
    ends_at,
    status,
    total_amount
  )
  values (
    target_resource_id,
    current_user_id,
    target_starts_at,
    booking_ends_at,
    'CONFIRMED',
    price_amount
  )
  returning id into new_booking_id;

  return new_booking_id;

exception
  when exclusion_violation then
    raise exception
      'The selected time is no longer available';
end;
$$;

revoke execute on function public.create_booking(
  uuid,
  uuid,
  timestamptz
)
from public, anon;

grant execute on function public.create_booking(
  uuid,
  uuid,
  timestamptz
)
to authenticated;