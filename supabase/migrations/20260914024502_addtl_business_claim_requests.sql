alter table public.business_claim_requests
enable row level security;

create policy "Users can view their own claim requests"
on public.business_claim_requests
for select
to authenticated
using (
  requester_id = auth.uid()
);

create policy "Users can create their own claim requests"
on public.business_claim_requests
for insert
to authenticated
with check (
  requester_id = auth.uid()
);

create policy "Admins can view all claim requests"
on public.business_claim_requests
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