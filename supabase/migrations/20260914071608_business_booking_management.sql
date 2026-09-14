create policy "Business members can view bookings"
on public.bookings
for select
to authenticated
using (
  exists (
    select 1
    from public.resources r
    join public.business_members bm
      on bm.business_id = r.business_id
    where r.id = bookings.resource_id
      and bm.user_id = auth.uid()
  )
);

create policy "Business members can update bookings"
on public.bookings
for update
to authenticated
using (
  exists (
    select 1
    from public.resources r
    join public.business_members bm
      on bm.business_id = r.business_id
    where r.id = bookings.resource_id
      and bm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.resources r
    join public.business_members bm
      on bm.business_id = r.business_id
    where r.id = bookings.resource_id
      and bm.user_id = auth.uid()
  )
);