create type public.business_claim_status as enum (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

create table public.business_claim_requests (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  requester_id uuid not null
    references public.profiles(id)
    on delete cascade,

  message text,

  status public.business_claim_status
    not null default 'PENDING',

  created_at timestamptz
    not null default now(),

  updated_at timestamptz
    not null default now()
);

create index business_claim_requests_business_idx
  on public.business_claim_requests (business_id);

create index business_claim_requests_requester_idx
  on public.business_claim_requests (requester_id);

create index business_claim_requests_status_idx
  on public.business_claim_requests (status);

  create unique index business_claim_requests_one_pending_idx
on public.business_claim_requests (business_id)
where status = 'PENDING';

