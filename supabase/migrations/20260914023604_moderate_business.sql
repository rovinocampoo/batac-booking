create or replace function public.moderate_business(
  business_id uuid,
  new_status public.business_status
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.platform_role = 'ADMIN'
  ) then
    raise exception 'Only platform administrators can moderate businesses';
  end if;

  if new_status not in ('APPROVED', 'SUSPENDED') then
    raise exception 'Invalid moderation status: %', new_status;
  end if;

  update public.businesses
  set
    status = new_status,
    updated_at = now()
  where id = business_id
    and status = 'PENDING';

  if not found then
    raise exception
      'Business % was not found or is no longer pending',
      business_id;
  end if;
end;
$$;

revoke execute on function public.moderate_business(
  uuid,
  public.business_status
)
from public, anon;

grant execute on function public.moderate_business(
  uuid,
  public.business_status
)
to authenticated;