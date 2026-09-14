create or replace function public.prevent_platform_role_self_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.platform_role is distinct from old.platform_role
     and auth.role() <> 'service_role' then
    raise exception 'platform_role can only be changed by a trusted server operation';
  end if;

  return new;
end;
$$;

create trigger protect_platform_role
before update on public.profiles
for each row
execute function public.prevent_platform_role_self_change();