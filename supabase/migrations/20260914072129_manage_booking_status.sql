create or replace function public.manage_booking_status(
  target_booking_id uuid,
  next_status public.booking_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status public.booking_status;
begin
  if not exists (
    select 1
    from public.bookings booking
    join public.resources resource
      on resource.id = booking.resource_id
    join public.business_members membership
      on membership.business_id = resource.business_id
    where booking.id = target_booking_id
      and membership.user_id = auth.uid()
  ) then
    raise exception 'You do not have access to this booking';
  end if;

  select status
  into current_status
  from public.bookings
  where id = target_booking_id
  for update;

  if current_status is null then
    raise exception 'Booking was not found';
  end if;

  if current_status = 'PENDING'
     and next_status not in ('CONFIRMED', 'CANCELLED') then
    raise exception
      'PENDING bookings can only be confirmed or cancelled';
  end if;

  if current_status = 'CONFIRMED'
     and next_status not in ('COMPLETED', 'CANCELLED') then
    raise exception
      'CONFIRMED bookings can only be completed or cancelled';
  end if;

  if current_status in ('COMPLETED', 'CANCELLED', 'EXPIRED') then
    raise exception
      'This booking can no longer be changed';
  end if;

  update public.bookings
  set
    status = next_status,
    updated_at = now()
  where id = target_booking_id;
end;
$$;

revoke execute on function public.manage_booking_status(
  uuid,
  public.booking_status
)
from public, anon;

grant execute on function public.manage_booking_status(
  uuid,
  public.booking_status
)
to authenticated;