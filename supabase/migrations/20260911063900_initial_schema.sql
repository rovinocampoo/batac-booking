-- ============================================================
-- BatacHub — Initial Schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type public.business_category as enum (
  'SPORTS',
  'FITNESS',
  'FOOD_AND_DRINK',
  'EVENTS',
  'CREATIVE',
  'OTHER'
);

create type public.business_status as enum (
  'PENDING',
  'APPROVED',
  'SUSPENDED'
);

create type public.business_member_role as enum (
  'OWNER',
  'MANAGER',
  'STAFF'
);

create type public.resource_type as enum (
  'COURT',
  'GYM_AREA',
  'SEATING_AREA',
  'PRIVATE_ROOM',
  'EVENT_SPACE',
  'STUDIO',
  'OTHER'
);

create type public.resource_status as enum (
  'ACTIVE',
  'INACTIVE'
);

create type public.booking_status as enum (
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'EXPIRED'
);

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- BUSINESSES
-- ============================================================

create table public.businesses (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid not null
    references public.profiles(id),

  name text not null,
  slug text not null unique,
  description text,

  category public.business_category not null,

  address text,
  phone text,

  status public.business_status not null default 'PENDING',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- BUSINESS MEMBERS
-- ============================================================

create table public.business_members (
  business_id uuid not null
    references public.businesses(id) on delete cascade,

  user_id uuid not null
    references public.profiles(id) on delete cascade,

  role public.business_member_role not null,

  created_at timestamptz not null default now(),

  primary key (business_id, user_id)
);

-- ============================================================
-- RESOURCES
-- ============================================================

create table public.resources (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id) on delete cascade,

  name text not null,
  description text,

  resource_type public.resource_type not null,

  capacity integer,

  status public.resource_status not null default 'ACTIVE',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint resources_capacity_positive
    check (capacity is null or capacity > 0)
);

-- ============================================================
-- RESOURCE HOURS
-- ============================================================

create table public.resource_hours (
  id uuid primary key default gen_random_uuid(),

  resource_id uuid not null
    references public.resources(id) on delete cascade,

  day_of_week integer not null,

  opens_at time not null,
  closes_at time not null,

  constraint resource_hours_day_valid
    check (day_of_week between 0 and 6),

  constraint resource_hours_time_valid
    check (opens_at < closes_at)
);

-- ============================================================
-- RESOURCE PRICING
-- ============================================================

create table public.resource_pricing (
  id uuid primary key default gen_random_uuid(),

  resource_id uuid not null
    references public.resources(id) on delete cascade,

  name text not null,

  price numeric(10, 2) not null,

  duration_minutes integer not null,

  created_at timestamptz not null default now(),

  constraint resource_pricing_price_valid
    check (price >= 0),

  constraint resource_pricing_duration_valid
    check (duration_minutes > 0)
);

-- ============================================================
-- BOOKINGS
-- ============================================================

create table public.bookings (
  id uuid primary key default gen_random_uuid(),

  resource_id uuid not null
    references public.resources(id),

  customer_id uuid not null
    references public.profiles(id),

  starts_at timestamptz not null,
  ends_at timestamptz not null,

  status public.booking_status not null default 'PENDING',

  total_amount numeric(10, 2) not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bookings_time_valid
    check (starts_at < ends_at),

  constraint bookings_amount_valid
    check (total_amount >= 0)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index businesses_category_idx
  on public.businesses(category);

create index businesses_status_idx
  on public.businesses(status);

create index business_members_user_idx
  on public.business_members(user_id);

create index resources_business_idx
  on public.resources(business_id);

create index resource_hours_resource_idx
  on public.resource_hours(resource_id);

create index resource_pricing_resource_idx
  on public.resource_pricing(resource_id);

create index bookings_resource_time_idx
  on public.bookings(resource_id, starts_at, ends_at);

create index bookings_customer_idx
  on public.bookings(customer_id);