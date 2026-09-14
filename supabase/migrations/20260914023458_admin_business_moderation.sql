create policy "Admins can view all businesses"
on public.businesses
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.platform_role = 'ADMIN'
  )
);