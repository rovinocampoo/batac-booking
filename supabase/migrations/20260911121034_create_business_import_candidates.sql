create table public.business_import_candidates (
  id uuid primary key default gen_random_uuid(),

  source text not null,
  external_id text not null,
  external_url text,

  name text not null,
  category public.business_category not null,

  latitude numeric(9,6),
  longitude numeric(9,6),

  address text,
  website text,

  status text not null default 'PENDING',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint business_import_candidates_source_external_id_key
    unique (source, external_id),

  constraint business_import_candidates_latitude_check
    check (
      latitude is null
      or latitude between -90 and 90
    ),

  constraint business_import_candidates_longitude_check
    check (
      longitude is null
      or longitude between -180 and 180
    ),

  constraint business_import_candidates_status_check
    check (
      status in ('PENDING', 'REJECTED', 'IMPORTED')
    )
);

create index business_import_candidates_status_idx
  on public.business_import_candidates (status);

create index business_import_candidates_category_idx
  on public.business_import_candidates (category);