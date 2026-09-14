create policy "Admins can view import candidates"
on public.business_import_candidates
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