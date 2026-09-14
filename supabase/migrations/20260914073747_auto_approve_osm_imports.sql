create or replace function public.import_business_candidate(
  candidate_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  candidate public.business_import_candidates%rowtype;
  new_business_id uuid;
  base_slug text;
  final_slug text;
begin
  select *
  into candidate
  from public.business_import_candidates
  where id = candidate_id
  for update;

  if not found then
    raise exception 'Import candidate % was not found', candidate_id;
  end if;

  if candidate.status = 'IMPORTED' then
    raise exception 'Import candidate % has already been imported', candidate_id;
  end if;

  if candidate.status <> 'PENDING' then
    raise exception
      'Import candidate % cannot be imported because its status is %',
      candidate_id,
      candidate.status;
  end if;

  base_slug := trim(
    both '-'
    from regexp_replace(
      lower(candidate.name),
      '[^a-z0-9]+',
      '-',
      'g'
    )
  );

  if base_slug = '' then
    base_slug := 'business';
  end if;

  final_slug := base_slug;

  if exists (
    select 1
    from public.businesses
    where slug = final_slug
  ) then
    final_slug := base_slug || '-' || candidate.external_id;
  end if;

  insert into public.businesses (
    owner_id,
    name,
    slug,
    description,
    category,
    address,
    phone,
    status,
    source,
    external_id,
    external_url,
    latitude,
    longitude
  )
  values (
    null,
    candidate.name,
    final_slug,
    null,
    candidate.category,
    candidate.address,
    null,
    'APPROVED',
    candidate.source,
    candidate.external_id,
    candidate.external_url,
    candidate.latitude,
    candidate.longitude
  )
  returning id into new_business_id;

  update public.business_import_candidates
  set
    status = 'IMPORTED',
    updated_at = now()
  where id = candidate_id;

  return new_business_id;
end;
$$;

revoke execute on function public.import_business_candidate(uuid)
from public, anon, authenticated;

grant execute on function public.import_business_candidate(uuid)
to service_role;

update public.businesses
set
  status = 'APPROVED',
  updated_at = now()
where source = 'OPENSTREETMAP'
  and status = 'PENDING';