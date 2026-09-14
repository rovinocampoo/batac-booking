create or replace function public.moderate_business_claim(
  claim_id uuid,
  decision public.business_claim_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  claim public.business_claim_requests%rowtype;
begin
  /*
   * Only platform administrators can approve or reject claims.
   */
  if not exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.platform_role = 'ADMIN'
  ) then
    raise exception 'Only platform administrators can moderate business claims';
  end if;

  /*
   * Only APPROVED or REJECTED are valid admin decisions.
   */
  if decision not in ('APPROVED', 'REJECTED') then
    raise exception 'Invalid claim decision: %', decision;
  end if;

  /*
   * Lock the claim row so two admins cannot process
   * the same pending claim concurrently.
   */
  select *
  into claim
  from public.business_claim_requests
  where id = claim_id
  for update;

  if not found then
    raise exception 'Claim request % was not found', claim_id;
  end if;

  if claim.status <> 'PENDING' then
    raise exception
      'Claim request % is no longer pending',
      claim_id;
  end if;

  /*
   * Rejection is simple: close the request.
   */
  if decision = 'REJECTED' then
    update public.business_claim_requests
    set
      status = 'REJECTED',
      updated_at = now()
    where id = claim_id;

    return;
  end if;

  /*
   * The business must still be approved.
   */
  if not exists (
    select 1
    from public.businesses
    where id = claim.business_id
      and status = 'APPROVED'
  ) then
    raise exception
      'Business is no longer approved and cannot be claimed';
  end if;

  /*
   * A business must not already have an OWNER.
   */
  if exists (
    select 1
    from public.business_members
    where business_id = claim.business_id
      and role = 'OWNER'
  ) then
    raise exception
      'Business already has an owner';
  end if;

  /*
   * Create the owner relationship.
   */
  insert into public.business_members (
    business_id,
    user_id,
    role
  )
  values (
    claim.business_id,
    claim.requester_id,
    'OWNER'
  );

  /*
   * Keep the legacy/convenience owner_id synchronized
   * with the authoritative business membership.
   */
  update public.businesses
  set
    owner_id = claim.requester_id,
    updated_at = now()
  where id = claim.business_id;

  /*
   * Finally close the claim request.
   */
  update public.business_claim_requests
  set
    status = 'APPROVED',
    updated_at = now()
  where id = claim_id;
end;
$$;

revoke execute on function public.moderate_business_claim(
  uuid,
  public.business_claim_status
)
from public, anon, authenticated;

grant execute on function public.moderate_business_claim(
  uuid,
  public.business_claim_status
)
to authenticated;