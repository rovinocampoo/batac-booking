create or replace function public.request_business_claim(
  target_business_id uuid,
  claim_message text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  claim_id uuid;
begin
  if not exists (
    select 1
    from public.businesses
    where id = target_business_id
      and status = 'APPROVED'
  ) then
    raise exception
      'Business is not available for claiming';
  end if;

  if exists (
    select 1
    from public.business_members
    where business_id = target_business_id
      and role = 'OWNER'
  ) then
    raise exception
      'Business already has an owner';
  end if;

  insert into public.business_claim_requests (
    business_id,
    requester_id,
    message
  )
  values (
    target_business_id,
    auth.uid(),
    claim_message
  )
  returning id into claim_id;

  return claim_id;
end;
$$;

revoke execute on function public.request_business_claim(uuid, text)
from public, anon;

grant execute on function public.request_business_claim(uuid, text)
to authenticated;