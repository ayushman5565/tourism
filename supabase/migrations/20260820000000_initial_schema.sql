-- Run this migration in the Supabase SQL Editor or with `supabase db push`.
-- Authentication identities live in auth.users; never store passwords here.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trips (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  custom_name text not null,
  start_location text not null,
  destination text not null,
  travelers integer not null default 1 check (travelers > 0),
  days integer not null default 1 check (days > 0),
  travel_dates text,
  budget_tier text not null default 'moderate' check (budget_tier in ('budget', 'moderate', 'luxury', 'custom')),
  custom_budget integer,
  total_planned_budget integer,
  transport_mode text,
  plan_data jsonb not null default '{}'::jsonb,
  notes text,
  actual_spending numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_user_id_idx on public.trips (user_id);

alter table public.profiles enable row level security;
alter table public.trips enable row level security;

create policy "Users can read their profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can read their own trips"
  on public.trips for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own trips"
  on public.trips for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own trips"
  on public.trips for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own trips"
  on public.trips for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger trips_set_updated_at
  before update on public.trips
  for each row execute procedure public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set display_name = excluded.display_name,
        avatar_url = excluded.avatar_url;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();
