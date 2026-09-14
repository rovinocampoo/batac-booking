-- ============================================================
-- Public discovery
-- ============================================================

create policy "Anyone can view approved businesses"
on public.businesses
for select
using (
  status = 'APPROVED'
);

create policy "Anyone can view active resources"
on public.resources
for select
using (
  status = 'ACTIVE'
  and exists (
    select 1
    from public.businesses b
    where b.id = resources.business_id
      and b.status = 'APPROVED'
  )
);

create policy "Anyone can view resource hours"
on public.resource_hours
for select
using (
  exists (
    select 1
    from public.resources r
    join public.businesses b
      on b.id = r.business_id
    where r.id = resource_hours.resource_id
      and r.status = 'ACTIVE'
      and b.status = 'APPROVED'
  )
);

create policy "Anyone can view resource pricing"
on public.resource_pricing
for select
using (
  exists (
    select 1
    from public.resources r
    join public.businesses b
      on b.id = r.business_id
    where r.id = resource_pricing.resource_id
      and r.status = 'ACTIVE'
      and b.status = 'APPROVED'
  )
);