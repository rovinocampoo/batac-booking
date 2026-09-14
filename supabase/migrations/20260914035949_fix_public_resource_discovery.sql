drop policy if exists "Anyone can view active resources for approved businesses"
on public.resources;

create policy "Anyone can view active resources for approved businesses"
on public.resources
for select
to anon, authenticated
using (
  status = 'ACTIVE'
  and exists (
    select 1
    from public.businesses
    where businesses.id = resources.business_id
      and businesses.status = 'APPROVED'
  )
);