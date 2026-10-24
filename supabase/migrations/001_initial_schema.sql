-- ==============================================================================
-- KREEPYCODE DATABASE SCHEMA
-- Migration: 001_initial_schema.sql
-- Description: Core tables, foreign keys, triggers, and B-tree indexes
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. UPDATED_AT TRIGGER FUNCTION
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 3. PROFILES TABLE (Linked to Supabase Auth auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text default 'student' not null check (role in ('student', 'admin')),
  streak_count int default 0 not null check (streak_count >= 0),
  last_active_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Automatic profile sync trigger when a user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. COURSES TABLE
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text not null,
  icon text,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger tr_courses_updated_at
  before update on public.courses
  for each row execute function public.handle_updated_at();

-- 5. COURSE TRACKS (Pacing options: 2h, 3h, 4h daily)
create table if not exists public.course_tracks (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  daily_hours int not null check (daily_hours in (2, 3, 4)),
  total_days int not null check (total_days > 0),
  unique (course_id, daily_hours)
);

-- 6. TRACK DAYS
create table if not exists public.track_days (
  id uuid default gen_random_uuid() primary key,
  track_id uuid references public.course_tracks(id) on delete cascade not null,
  day_number int not null check (day_number > 0),
  title text not null,
  unique (track_id, day_number)
);

-- 7. DAY TASKS (Theory/Video, DSA Problem, SQL Sandbox, MCQ)
create table if not exists public.day_tasks (
  id uuid default gen_random_uuid() primary key,
  day_id uuid references public.track_days(id) on delete cascade not null,
  sequence_order int not null check (sequence_order > 0),
  task_type text not null check (task_type in ('theory_video', 'dsa_problem', 'sql_problem', 'mcq')),
  title text not null,
  estimated_minutes int not null check (estimated_minutes > 0),
  payload jsonb default '{}'::jsonb not null,
  unique (day_id, sequence_order)
);

-- 8. ENROLLMENTS & DAILY LOCK STATE
create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  track_id uuid references public.course_tracks(id) on delete cascade not null,
  current_day int default 1 not null check (current_day > 0),
  next_day_unlock_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, track_id)
);

create trigger tr_enrollments_updated_at
  before update on public.enrollments
  for each row execute function public.handle_updated_at();

-- 9. TASK COMPLETIONS
create table if not exists public.task_completions (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references public.enrollments(id) on delete cascade not null,
  task_id uuid references public.day_tasks(id) on delete cascade not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  submitted_code text,
  unique (enrollment_id, task_id)
);

-- ==============================================================================
-- B-TREE PERFORMANCE INDEXES
-- ==============================================================================

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_courses_slug on public.courses(slug);
create index if not exists idx_course_tracks_course_id on public.course_tracks(course_id);
create index if not exists idx_track_days_track_id on public.track_days(track_id);
create index if not exists idx_track_days_composite on public.track_days(track_id, day_number);
create index if not exists idx_day_tasks_day_id on public.day_tasks(day_id);
create index if not exists idx_day_tasks_sequence on public.day_tasks(day_id, sequence_order);
create index if not exists idx_enrollments_user_id on public.enrollments(user_id);
create index if not exists idx_enrollments_track_id on public.enrollments(track_id);
create index if not exists idx_enrollments_unlock on public.enrollments(next_day_unlock_at);
create index if not exists idx_task_completions_lookup on public.task_completions(enrollment_id, task_id);
