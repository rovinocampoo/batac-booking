alter table public.businesses
add column source text not null default 'MANUAL';

alter table public.businesses
add column external_id text;

alter table public.businesses
add column external_url text;

alter table public.businesses
add constraint businesses_source_check
check (source in ('MANUAL', 'OPENSTREETMAP'));

create unique index businesses_source_external_id_unique
on public.businesses (source, external_id)
where external_id is not null;