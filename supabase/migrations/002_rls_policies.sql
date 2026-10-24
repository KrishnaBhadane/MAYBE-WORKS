-- ==============================================================================
-- KREEPYCODE DATABASE SCHEMA
-- Migration: 002_rls_policies.sql
-- Description: Row Level Security (RLS) policies and role-based access control
-- ==============================================================================

-- 1. HELPER FUNCTIONS
-- Helper to safely check if the current authenticated user has the 'admin' role
-- Uses SECURITY DEFINER to avoid recursive RLS lookups on public.profiles
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
end;
$$ language plpgsql security definer stable set search_path = public;

-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_tracks enable row level security;
alter table public.track_days enable row level security;
alter table public.day_tasks enable row level security;
alter table public.enrollments enable row level security;
alter table public.task_completions enable row level security;

-- 3. PROFILES POLICIES
-- Anyone authenticated can view their own profile; admins can view all profiles
create policy "profiles_select_policy"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Users can update their own profile; admins can update any profile
-- Disallow non-admins from changing their role to 'admin'
create policy "profiles_update_policy"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    (auth.uid() = id and (role = 'student' or public.is_admin()))
    or public.is_admin()
  );

-- Users can insert their own profile; admins can insert any profile
create policy "profiles_insert_policy"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

-- 4. COURSES POLICIES
-- Public (authenticated or anon) can view published courses; admins can view all
create policy "courses_select_policy"
  on public.courses for select
  using (is_published = true or public.is_admin());

-- Only admins can mutate courses
create policy "courses_insert_policy"
  on public.courses for insert
  with check (public.is_admin());

create policy "courses_update_policy"
  on public.courses for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "courses_delete_policy"
  on public.courses for delete
  using (public.is_admin());

-- 5. COURSE TRACKS POLICIES
-- Public can view tracks belonging to published courses; admins can view all
create policy "course_tracks_select_policy"
  on public.course_tracks for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = course_tracks.course_id
        and (courses.is_published = true or public.is_admin())
    )
  );

-- Only admins can mutate course tracks
create policy "course_tracks_insert_policy"
  on public.course_tracks for insert
  with check (public.is_admin());

create policy "course_tracks_update_policy"
  on public.course_tracks for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "course_tracks_delete_policy"
  on public.course_tracks for delete
  using (public.is_admin());

-- 6. TRACK DAYS POLICIES
-- Public can view track days belonging to published courses; admins can view all
create policy "track_days_select_policy"
  on public.track_days for select
  using (
    exists (
      select 1 from public.course_tracks
      join public.courses on courses.id = course_tracks.course_id
      where course_tracks.id = track_days.track_id
        and (courses.is_published = true or public.is_admin())
    )
  );

-- Only admins can mutate track days
create policy "track_days_insert_policy"
  on public.track_days for insert
  with check (public.is_admin());

create policy "track_days_update_policy"
  on public.track_days for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "track_days_delete_policy"
  on public.track_days for delete
  using (public.is_admin());

-- 7. DAY TASKS POLICIES
-- Public can view tasks belonging to published courses; admins can view all
create policy "day_tasks_select_policy"
  on public.day_tasks for select
  using (
    exists (
      select 1 from public.track_days
      join public.course_tracks on course_tracks.id = track_days.track_id
      join public.courses on courses.id = course_tracks.course_id
      where track_days.id = day_tasks.day_id
        and (courses.is_published = true or public.is_admin())
    )
  );

-- Only admins can mutate day tasks
create policy "day_tasks_insert_policy"
  on public.day_tasks for insert
  with check (public.is_admin());

create policy "day_tasks_update_policy"
  on public.day_tasks for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "day_tasks_delete_policy"
  on public.day_tasks for delete
  using (public.is_admin());

-- 8. ENROLLMENTS POLICIES
-- Students can only read their own enrollments; admins can read all
create policy "enrollments_select_policy"
  on public.enrollments for select
  using (auth.uid() = user_id or public.is_admin());

-- Students can insert their own enrollment; admins can insert any
create policy "enrollments_insert_policy"
  on public.enrollments for insert
  with check (auth.uid() = user_id or public.is_admin());

-- Students can update their own enrollment; admins can update any
create policy "enrollments_update_policy"
  on public.enrollments for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Students can delete their own enrollment; admins can delete any
create policy "enrollments_delete_policy"
  on public.enrollments for delete
  using (auth.uid() = user_id or public.is_admin());

-- 9. TASK COMPLETIONS POLICIES
-- Students can only view completions for their own enrollments; admins can view all
create policy "task_completions_select_policy"
  on public.task_completions for select
  using (
    exists (
      select 1 from public.enrollments
      where enrollments.id = task_completions.enrollment_id
        and (enrollments.user_id = auth.uid() or public.is_admin())
    )
  );

-- Students can only insert completions for their own enrollments; admins can insert any
create policy "task_completions_insert_policy"
  on public.task_completions for insert
  with check (
    exists (
      select 1 from public.enrollments
      where enrollments.id = task_completions.enrollment_id
        and (enrollments.user_id = auth.uid() or public.is_admin())
    )
  );

-- Students can only update completions for their own enrollments; admins can update any
create policy "task_completions_update_policy"
  on public.task_completions for update
  using (
    exists (
      select 1 from public.enrollments
      where enrollments.id = task_completions.enrollment_id
        and (enrollments.user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.enrollments
      where enrollments.id = task_completions.enrollment_id
        and (enrollments.user_id = auth.uid() or public.is_admin())
    )
  );

-- Students can delete their own completions; admins can delete any
create policy "task_completions_delete_policy"
  on public.task_completions for delete
  using (
    exists (
      select 1 from public.enrollments
      where enrollments.id = task_completions.enrollment_id
        and (enrollments.user_id = auth.uid() or public.is_admin())
    )
  );
