-- Elev8U database schema
-- Run this in the Supabase SQL Editor

-- 1. PROFILES TABLE (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  role text not null check (role in ('freelancer', 'client')),
  avatar_url text,
  location text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- 2. FREELANCER PROFILES TABLE
create table public.freelancer_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique,
  bio text,
  category text not null,
  location text,
  is_vetted boolean default false,
  rating numeric(2,1) default 0.0,
  total_reviews integer default 0,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc', now())
);

-- 3. SERVICE TIERS TABLE
create table public.service_tiers (
  id uuid default gen_random_uuid() primary key,
  freelancer_id uuid references public.freelancer_profiles(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  type text not null check (type in ('one_time', 'subscription')),
  created_at timestamp with time zone default timezone('utc', now())
);

-- 4. LEADS TABLE
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete cascade,
  freelancer_id uuid references public.freelancer_profiles(id) on delete cascade,
  description text not null,
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  timeline text,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'completed')),
  created_at timestamp with time zone default timezone('utc', now())
);

-- 5. BOOKINGS TABLE
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) on delete cascade,
  freelancer_id uuid references public.freelancer_profiles(id) on delete cascade,
  client_id uuid references public.profiles(id) on delete cascade,
  scheduled_at timestamp with time zone not null,
  status text default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.freelancer_profiles enable row level security;
alter table public.service_tiers enable row level security;
alter table public.leads enable row level security;
alter table public.bookings enable row level security;

-- RLS POLICIES

-- Profiles: users can read all profiles but only update their own
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Freelancer profiles: public read, owner write
create policy "Freelancer profiles are viewable by everyone"
  on public.freelancer_profiles for select using (true);

create policy "Freelancers can manage their own profile"
  on public.freelancer_profiles for all using (
    auth.uid() = (select id from public.profiles where id = user_id)
  );

-- Service tiers: public read, owner write
create policy "Service tiers are viewable by everyone"
  on public.service_tiers for select using (true);

create policy "Freelancers can manage their own service tiers"
  on public.service_tiers for all using (
    auth.uid() = (
      select p.id from public.profiles p
      join public.freelancer_profiles fp on fp.user_id = p.id
      where fp.id = freelancer_id
    )
  );

-- Leads: client and freelancer can see their own leads
create policy "Users can view their own leads"
  on public.leads for select using (
    auth.uid() = client_id or
    auth.uid() = (select id from public.profiles where id = freelancer_id)
  );

create policy "Clients can create leads"
  on public.leads for insert with check (auth.uid() = client_id);

-- Bookings: both parties can view
create policy "Users can view their own bookings"
  on public.bookings for select using (
    auth.uid() = client_id or auth.uid() = freelancer_id
  );

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
