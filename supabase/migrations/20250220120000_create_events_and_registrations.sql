-- Enable uuid generation if not already enabled
create extension if not exists "pgcrypto";

-- Events table storing the core event metadata
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date not null,
  time text not null,
  location text not null,
  category text not null,
  max_attendees integer not null check (max_attendees > 0),
  current_attendees integer not null default 0 check (current_attendees >= 0),
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists events_created_at_idx on public.events (created_at desc);

-- Event registrations capture per-user attendance information
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age_group text not null check (age_group in ('teens', 'twenties', 'thirties', 'forties', 'fifties', 'sixtiesPlus')),
  occupation text not null check (occupation in ('student', 'engineer', 'designer', 'planner', 'manager', 'other')),
  discovery text not null check (discovery in ('sns', 'search', 'friend', 'media', 'eventSite', 'other')),
  other text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint event_registrations_unique unique (event_id, user_id)
);

create index if not exists event_registrations_event_id_idx on public.event_registrations (event_id);
create index if not exists event_registrations_user_id_idx on public.event_registrations (user_id);
