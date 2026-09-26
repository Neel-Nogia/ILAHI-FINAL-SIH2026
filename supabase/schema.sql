-- ============================================================================
-- ILAHI Database Schema & Row-Level Security (RLS) Specification
-- SIH 2026 Ground-Up Specification (Updated)
-- ============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============ 2. GUIDES TABLE ============
create table if not exists guides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  photo_url text,
  state text not null check (state in ('Gujarat','Rajasthan')),
  primary_area text not null,          -- District
  fee_min numeric not null default 1000, -- Min fee per day (INR)
  fee_max numeric not null default 3000, -- Max fee per day (INR)
  areas_of_expertise text[] default '{}',
  specialties text[] default '{}',
  languages text[] default '{}',
  travel_style_tags text[] default '{}',
  safety_tags text[] default '{}',
  bio text,
  availability_preset text default 'flexible', -- 'weekday_mornings' | 'weekends' | 'flexible' | 'custom'
  is_verified boolean default false,   -- Pending admin review by default
  rating_avg numeric default 4.8,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Backward compatibility view if guide_profiles is referenced
create or replace view guide_profiles as select * from guides;

-- ============ 3. TOURISTS TABLE ============
create table if not exists tourists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  dob text,
  photo_url text,
  travel_styles text[] default '{}',
  categories_of_interest text[] default '{}',
  safety_preferences text[] default '{}',
  preferred_language text default 'English',
  budget_band text default 'medium',
  trusted_contacts jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============ 4. DESTINATION CONTENT (Gujarat + Rajasthan) ============
create table if not exists destinations (
  id text primary key,
  state text not null check (state in ('Gujarat','Rajasthan')),
  district text not null,
  place_name text not null,
  categories text[] not null,
  is_hidden_gem boolean default false,
  tags text[] not null,
  summary text not null,
  budget_band text check (budget_band in ('low','medium','high')),
  suggested_duration text,
  best_time text,
  image_url text
);

create table if not exists hidden_gems (
  id text primary key,
  parent_destination_id text references destinations(id) on delete cascade,
  state text,
  district text,
  spot_name text not null,
  categories text[],
  tags text[],
  summary text,
  budget_band text,
  suggested_duration text,
  best_time text,
  linked_main_place_name text,
  image_url text
);

-- ============ 5. BOOKINGS TABLE ============
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  tourist_id uuid references auth.users(id) on delete cascade,
  guide_id uuid references guides(id) on delete cascade,
  destination_id text,
  destination_name text,
  trip_start_date date not null,
  trip_end_date date not null,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled','held','released')),
  total_fee numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============ 6. GUIDE AVAILABILITY TABLE ============
create table if not exists guide_availability (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid references guides(id) on delete cascade,
  available_date date,
  start_date date,
  end_date date,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- ============ 7. REVIEWS TABLE ============
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  tourist_id uuid references auth.users(id) on delete cascade,
  guide_id uuid references guides(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ============ 8. REALTIME REPLICATION ============
-- Enable Postgres Changes publication for live dashboard updates
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table guides;
alter publication supabase_realtime add table guide_availability;
alter publication supabase_realtime add table reviews;

-- ============ 9. ROW LEVEL SECURITY (RLS) ============
alter table guides enable row level security;
alter table tourists enable row level security;
alter table destinations enable row level security;
alter table hidden_gems enable row level security;
alter table bookings enable row level security;
alter table guide_availability enable row level security;
alter table reviews enable row level security;

-- Guides: Public can read guides for search/matching; guides can only update their own row
create policy "Public can view guides" on guides
  for select using (true);

create policy "Guides can insert own profile" on guides
  for insert with check (auth.uid() = user_id);

create policy "Guides can update own profile" on guides
  for update using (auth.uid() = user_id);

-- Tourists: Tourists can only select, insert, and update their own profile
create policy "Tourists can select own profile" on tourists
  for select using (auth.uid() = user_id);

create policy "Tourists can insert own profile" on tourists
  for insert with check (auth.uid() = user_id);

create policy "Tourists can update own profile" on tourists
  for update using (auth.uid() = user_id);

-- Destinations & Hidden Gems: Publicly readable by all
create policy "Destinations readable by all" on destinations
  for select using (true);

create policy "Hidden gems readable by all" on hidden_gems
  for select using (true);

-- Bookings:
-- Tourists see only their own bookings; Guides see bookings where they are the guide
create policy "Tourists and Guides select own bookings" on bookings
  for select using (
    auth.uid() = tourist_id or
    guide_id in (select id from guides where user_id = auth.uid())
  );

create policy "Tourists can insert bookings" on bookings
  for insert with check (
    auth.uid() = tourist_id
  );

create policy "Guides and Tourists update their bookings" on bookings
  for update using (
    auth.uid() = tourist_id or
    guide_id in (select id from guides where user_id = auth.uid())
  );

-- Guide Availability:
-- Publicly readable so matching engine can check calendar; Guides manage their own rows
create policy "Availability readable by all" on guide_availability
  for select using (true);

create policy "Guides manage own availability" on guide_availability
  for all using (
    guide_id in (select id from guides where user_id = auth.uid())
  );

-- Reviews:
-- Publicly readable so ratings are visible; Tourists insert reviews for their bookings
create policy "Reviews readable by all" on reviews
  for select using (true);

create policy "Tourists insert own reviews" on reviews
  for insert with check (
    auth.uid() = tourist_id
  );
