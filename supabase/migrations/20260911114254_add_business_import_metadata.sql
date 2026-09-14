alter table public.businesses
add column latitude numeric(9,6),
add column longitude numeric(9,6);

alter table public.businesses
add constraint businesses_latitude_check
check (latitude is null or latitude between -90 and 90);

alter table public.businesses
add constraint businesses_longitude_check
check (longitude is null or longitude between -180 and 180);

create unique index businesses_source_external_id_idx
on public.businesses (source, external_id)
where external_id is not null;