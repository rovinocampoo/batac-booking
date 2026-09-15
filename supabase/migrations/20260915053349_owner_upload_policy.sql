create policy "Business members can upload business images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'business-images'
  and exists (
    select 1
    from public.business_members
    where business_members.business_id =
      split_part(name, '/', 1)::uuid
      and business_members.user_id = auth.uid()
  )
);