create type public.platform_role as enum (
  'USER',
  'ADMIN'
);

alter table public.profiles
add column platform_role public.platform_role
not null default 'USER';

create index profiles_platform_role_idx
on public.profiles(platform_role);