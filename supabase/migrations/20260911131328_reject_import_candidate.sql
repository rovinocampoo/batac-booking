create or replace function public.reject_business_import_candidate(
  candidate_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.business_import_candidates
  set
    status = 'REJECTED',
    updated_at = now()
  where id = candidate_id
    and status = 'PENDING';

  if not found then
    raise exception
      'Import candidate % was not found or is no longer pending',
      candidate_id;
  end if;
end;
$$;

revoke execute on function public.reject_business_import_candidate(uuid)
from public, anon, authenticated;

grant execute on function public.reject_business_import_candidate(uuid)
to service_role;