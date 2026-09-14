-- ============================================================
-- Business access
-- ============================================================

create policy "Business members can view their business"
on public.businesses
for select
to authenticated
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = businesses.id
      and bm.user_id = auth.uid()
  )
);

create policy "Business owners and managers can update their business"
on public.businesses
for update
to authenticated
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = businesses.id
      and bm.user_id = auth.uid()
      and bm.role in ('OWNER', 'MANAGER')
  )
)
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = businesses.id
      and bm.user_id = auth.uid()
      and bm.role in ('OWNER', 'MANAGER')
  )
);


-- ============================================================
-- Resources
-- ============================================================

create policy "Business members can manage their resources"
on public.resources
for all
to authenticated
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = resources.business_id
      and bm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = resources.business_id
      and bm.user_id = auth.uid()
  )
);


-- ============================================================
-- Resource hours
-- ============================================================

create policy "Business members can manage resource hours"
on public.resource_hours
for all
to authenticated
using (
  exists (
    select 1
    from public.resources r
    join public.business_members bm
      on bm.business_id = r.business_id
    where r.id = resource_hours.resource_id
      and bm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.resources r
    join public.business_members bm
      on bm.business_id = r.business_id
    where r.id = resource_hours.resource_id
      and bm.user_id = auth.uid()
  )
);


-- ============================================================
-- Resource pricing
-- ============================================================

create policy "Business members can manage resource pricing"
on public.resource_pricing
for all
to authenticated
using (
  exists (
    select 1
    from public.resources r
    join public.business_members bm
      on bm.business_id = r.business_id
    where r.id = resource_pricing.resource_id
      and bm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.resources r
    join public.business_members bm
      on bm.business_id = r.business_id
    where r.id = resource_pricing.resource_id
      and bm.user_id = auth.uid()
  )
);