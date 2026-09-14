-- ============================================================
-- Profiles
-- ============================================================

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);


-- ============================================================
-- Business members
-- ============================================================

create policy "Business members can view their memberships"
on public.business_members
for select
to authenticated
using (
  user_id = auth.uid()
);


-- ============================================================
-- Customer bookings
-- ============================================================

create policy "Customers can view their own bookings"
on public.bookings
for select
to authenticated
using (
  customer_id = auth.uid()
);

create policy "Customers can create their own bookings"
on public.bookings
for insert
to authenticated
with check (
  customer_id = auth.uid()
);

create policy "Customers can cancel their own bookings"
on public.bookings
for update
to authenticated
using (
  customer_id = auth.uid()
)
with check (
  customer_id = auth.uid()
);