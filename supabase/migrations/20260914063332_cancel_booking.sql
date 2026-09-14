create or replace function public.cancel_booking(
  target_booking_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.bookings
  set
    status = 'CANCELLED',
    updated_at = now()
  where id = target_booking_id
    and customer_id = auth.uid()
    and status in ('PENDING', 'CONFIRMED')
    and starts_at > now();

  if not found then
    raise exception
      'Booking was not found, is no longer active, or can no longer be cancelled';
  end if;
end;
$$;

revoke execute on function public.cancel_booking(uuid)
from public, anon;

grant execute on function public.cancel_booking(uuid)
to authenticated;