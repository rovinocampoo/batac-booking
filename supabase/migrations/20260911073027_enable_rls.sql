-- ============================================================
-- Enable Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.resources enable row level security;
alter table public.resource_hours enable row level security;
alter table public.resource_pricing enable row level security;
alter table public.bookings enable row level security;