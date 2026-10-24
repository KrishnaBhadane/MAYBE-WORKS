# Master Project Task Breakdown (task.md)

This document breaks down the entire platform build into atomic, high-performance, and verifiable micro-tasks for **kreepycode**.

---

## Phase 1: Project Scaffolding & Foundation Setup

### Task 1.1: Next.js 15 App Initialization & Strict TypeScript Setup [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Initialize Next.js 15 with App Router, TypeScript, and ESLint in the workspace.
- [x] Enforce strict TypeScript settings in `tsconfig.json` (`noUnusedLocals: true`, `noUnusedParameters: true`, `strict: true`).
- [x] Clean out all boilerplate default CSS and assets to ensure zero dead code.
- [x] **Verification:** Run `npm run build` to confirm zero lint or type errors. (Passed: 0 errors).

### Task 1.2: Design System & kreepycode Styling Tokens [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Configure Tailwind theme tokens with brand palette:
  - Background: `#FFFFFF`
  - Text: Bold Black (`#000000`) with Apple typography scale
  - Accents: Lemon Yellow (`#FAFF00`), Deep Navy (`#0A1128`)
- [x] Build the official **kreepycode** circular logo component (`components/ui/Logo.tsx`) and vector round favicon (`app/icon.svg`).
- [x] Setup Lucide React icons with tree-shaking support.
- [x] Create atomic UI primitives in `components/ui/` (`Button` with sharp geometry, `Badge`, `Modal`, `Input`, `Tabs`, `SkeletonLoader`).
- [x] Build the single, unified global header component in `components/layout/Header.tsx`.
- [x] **Verification:** Verified `npm run build` passed with zero errors, zero pill buttons, zero purple gradients, and zero CLS.

### Task 1.3: Environment & Supabase Client Architecture [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `.env.example` with documented keys.
- [x] Implement modular Supabase clients in `lib/supabase/`:
  - `types.ts` (Database TypeScript interfaces: profiles, courses, tracks, days, tasks, enrollments, completions).
  - `client.ts` (Browser client with singleton instance).
  - `server.ts` (Server Component / Action client with cookie handling and admin service role client).
  - `middleware.ts` (Session validation & route guard).
- [x] Root `middleware.ts` configured for route protection (`/dashboard`, `/learn`, `/admin`).
- [x] **Verification:** Verified `npm run build` with zero errors.

---

## Phase 2: Database Schema & Supabase Architecture

### Task 2.1: Supabase PostgreSQL Schema Definition [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `supabase/migrations/001_initial_schema.sql` defining:
  - `profiles` (linked to `auth.users` with auto-creation trigger).
  - `courses` & `course_tracks` (2h, 3h, 4h pacing).
  - `track_days` & `day_tasks`.
  - `enrollments` & `task_completions`.
- [x] Implement explicit B-tree indexes for all foreign keys and lookup queries.
- [x] Added automated `updated_at` and `on_auth_user_created` trigger functions.
- [x] **Verification:** Verified clean SQL structure with zero circular dependencies.

### Task 2.2: Row Level Security (RLS) & Role Policies [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `supabase/migrations/002_rls_policies.sql`.
- [x] Enforce strict policies:
  - Students can only read/write their own enrollments and completions.
  - Public can view published courses and tracks.
  - Only users with `role = 'admin'` can mutate courses, days, and tasks.
- [x] **Verification:** Verified SQL schema and policies with recursion-free `security definer` role check; verified `npm run build` succeeds with zero errors.

### Task 2.3: Database Seed Script (Real DSA & SQL Curriculum) [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `supabase/seed.sql` with rich, high-quality technical curriculum:
  - Course 1: *DSA in C++* (Day 1: Arrays & Kadane's Algorithm; Day 2: Two Pointers).
  - Course 2: *Mastering SQL* (Day 1: Filtering & Grouping; Day 2: Window Functions).
  - Pacing variants: 2 Hours (1 theory + 1 problem), 3 Hours (1 theory + 2 problems), 4 Hours (1 theory + 2 problems + 1 bonus).
- [x] **Verification:** Verified idempotent execution using `ON CONFLICT (...) DO UPDATE`; validated all 36 task JSON payloads against TypeScript interfaces with zero schema errors.

---

## Phase 3: High-Performance Execution & Algorithm Engines

### Task 3.1: Code Runner Service (OnlineCompiler.io / Piston Drop-In) [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `lib/services/codeRunner.ts` integrating with Piston-compatible runners (`OnlineCompiler.io` and standard Piston).
- [x] Implement request payload compression, API key authorization, and 5000ms timeout abort controller.
- [x] Add response parser for runtime errors, compilation errors, signals, and exit codes.
- [x] **Verification:** Verified live execution with C++ test snippet (server execution time: 23ms); verified compile errors, runtime errors, and stdin test cases with 100% pass rate.

### Task 3.2: In-Browser SQLite WebAssembly Worker Engine [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `lib/services/sqlWorker.ts` and `public/workers/sql.worker.js` running `sql.js` (WebAssembly) inside a Dedicated Web Worker.
- [x] Implement asynchronous message-passing contract (`INIT_DB`, `EXEC_QUERY`, `RESET_DB`).
- [x] Ensure the main thread is never blocked during multi-table query processing.
- [x] **Verification:** Verified live browser execution in Chromium subagent executing complex multi-table analytical query (`JOIN`, `GROUP BY`, `DENSE_RANK`, `AVG`, `SUM` window functions) in 0.6ms with zero UI frame drops.

### Task 3.3: $O(N)$ Testcase Comparison Engine (DSA & SQL) [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `lib/utils/testcaseEvaluator.ts`:
  - **DSA Evaluator:** Strips whitespace, normalizes carriage returns, and checks testcases in $O(N)$ string time with float epsilon support.
  - **SQL Evaluator:** Compares actual output rows against expected output rows using a hash-indexed diff algorithm ($O(R \cdot C)$).
- [x] Return structured feedback: `status`, `runtimeMs`, `passedCount`, `totalCount`, `mismatchDetails`.
- [x] **Verification:** Unit tested 14 edge cases (floats, column casing insensitivity, column order swapping, null handling, empty results, row count mismatches, strict ordering vs unordered). Passed with 100% success rate.

---

## Phase 4: Habit Engine: Daily Unlocking & 2:00 AM Logic

### Task 4.1: Unlock Calculator & Timezone Math [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `lib/utils/unlockCalculator.ts`.
- [x] Calculate the exact 2:00 AM timestamp of the next day based on the user's localized timezone.
- [x] Handle edge cases: submissions made between 12:00 AM and 2:00 AM unlock at 2:00 AM the same day.
- [x] **Verification:** Unit tests verifying accuracy across international timezones (America/New_York, Asia/Kolkata, UTC). Passed with 100% precision.

### Task 4.2: High-Precision Countdown Hook [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `hooks/useUnlockCountdown.ts` using precision interval ticker.
- [x] Prevent unnecessary re-renders by updating only when formatted time strings (`HH:MM:SS`) change.
- [x] Fire an `onUnlock` callback automatically when the countdown reaches zero.
- [x] **Verification:** Verified clean interval lifecycle and memoized state change prevention.

### Task 4.3: Daily Streak & Day Completion Handler [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `lib/services/progressService.ts`.
- [x] Check if all tasks for Day $N$ are completed.
- [x] Update user's `streak_count` atomically and advance `current_day`.
- [x] Lock future days with calculated `next_day_unlock_at`.
- [x] **Verification:** Verified idempotency (re-submissions never duplicate count), atomic day advancement, and streak accumulation.

---

## Phase 5: Student Workspace & IDE Interface

### Task 5.1: Split-Screen Resizable Layout [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `components/workspace/WorkspaceLayout.tsx` supporting split views:
  - Left Panel: Problem description, theory notes, YouTube video player, MCQs.
  - Right Panel: Code/SQL editor and testcase console.
- [x] Add draggable divider with smooth CSS transforms and zero DOM lag.
- [x] **Verification:** Verified zero lag panel resizing clamped between 25% and 75% on desktop and responsive stacked layout on mobile.

### Task 5.2: Monaco Editor Dynamic Integration [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `components/workspace/CodeEditor.tsx` using dynamic import (`ssr: false`).
- [x] Pre-configure C++, Python, and SQL language settings, high-contrast dark theme, font ligatures, and code snippets.
- [x] Add keyboard shortcut: `Ctrl+Enter` / `Cmd+Enter` to trigger execution.
- [x] **Verification:** Verified dynamic loading with zero CLS skeleton fallback and active shortcut handler.

### Task 5.3: SQL Interactive Terminal & Output Table Diff [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `components/workspace/SqlRunner.tsx`.
- [x] Render virtualized table view for query outputs with row counts and execution timing.
- [x] Highlight mismatched rows/columns against expected output in distinct lemon/navy indicators.
- [x] **Verification:** Verified clean tabular rendering with diff badges, timing metrics, and sticky headers.

### Task 5.4: Theory, Video Player & Markdown Reader [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `components/workspace/TheoryViewer.tsx`.
- [x] Embed responsive YouTube player with lazy-loading (zero iframe payload on initial load, click-to-stream poster).
- [x] Render sanitized Markdown notes with syntax-highlighted code blocks.
- [x] **Verification:** Verified 16:9 aspect ratio container without CLS and zero third-party iframe script penalty.

### Task 5.5: MCQ Checkpoint Component [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `components/workspace/McqViewer.tsx`.
- [x] Support single-select quiz checkpoints with instantaneous architectural explanation feedback.
- [x] Provide instant visual feedback with explanation cards upon selection.
- [x] **Verification:** Verified clean state reset on question transition and correct answer persistence.

---

## Phase 6: Student Dashboard & Dynamic Roadmap

### Task 6.1: Course Catalog & Hour Selector (2h / 3h / 4h) [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `app/(student)/courses/page.tsx` displaying available tracks.
- [x] Build interactive modal where student picks daily time commitment (2h, 3h, 4h) (`components/dashboard/HourSelectorModal.tsx`).
- [x] Save selection to Supabase `enrollments` table via client & server actions.
- [x] **Verification:** Enrolling successfully initializes Day 1 unlocked and Days 2+ locked. Verified live database enrollment for 2h, 3h, and 4h tracks across DSA in C++ and Mastering SQL.

### Task 6.2: Dynamic Roadmap Timeline (Locked vs. Unlocked Nodes) [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `app/(student)/learn/[courseSlug]/roadmap/page.tsx`.
- [x] Render day-by-day roadmap (`components/dashboard/RoadmapTimeline.tsx`):
  - Completed Days: Solid node with checkmark and review link.
  - Active Day: High-contrast highlighted node with current task progress (e.g., 2/3 tasks done).
  - Locked Days: Padlock icon with countdown badge (*"Unlocks at 2:00 AM"*).
- [x] **Verification:** Verified dynamic locked/unlocked state calculation, non-intrusive countdown tooltip popover on locked nodes, and verified HTTP 200 server render for enrolled student.

### Task 6.3: Student Dashboard & Streak Analytics [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `app/(student)/dashboard/page.tsx`.
- [x] Display active enrolled courses, current day progress bar, and streak counter (`StreakBanner.tsx`, `DashboardCourseCard.tsx`).
- [x] Provide a one-click "Resume Today's Tasks" action button navigating to `/learn/[courseSlug]/day/[dayNumber]`.
- [x] **Verification:** Verified end-to-end user journey (auth redirection, course enrollment, task completion via `/api/tasks/complete`, atomic day advancement, and streak accumulation) with 100% pass rate. Next.js 16 production build compiles with zero errors.

---

## Phase 7: Admin Panel & Curriculum CMS

### Task 7.1: Admin Role Protection & Dashboard [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `app/admin/layout.tsx` with role-based guard (`profiles.role === 'admin'`).
- [x] Build Admin Overview page with statistics: Total Students, Active Streaks, Popular Tracks (`app/admin/page.tsx`).
- [x] **Verification:** Verified role protection: unauthenticated users redirected to `/login?redirectTo=/admin`, non-admin students blocked and redirected to `/dashboard`, verified 200 OK for admin sessions.

### Task 7.2: Course & Track Manager [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `app/admin/courses/page.tsx` to create and update courses and pacing configurations (`CourseManagerClient.tsx`, `CreateCourseModal.tsx`).
- [x] Allow configuring day count and daily hours (2h, 3h, 4h).
- [x] Create API endpoint `app/api/admin/courses/route.ts` with admin session check.
- [x] **Verification:** Created "Systems Programming in Rust" (`systems-rust`) with 2h (60d), 3h (40d), and 4h (30d) tracks; verified live database creation and appearance in student catalog.

### Task 7.3: Day & Task Builder (Theory, DSA, SQL, MCQs) [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `app/admin/tasks/page.tsx` with interactive task creation wizard (`TaskBuilderClient.tsx`, `TaskPayloadForms.tsx`):
  - Add YouTube URLs and Markdown documentation for `theory_video`.
  - Add C++ boilerplate and testcases (Input, Expected Output) for `dsa_problem`.
  - Add SQL schema seeds and expected query solutions for `sql_problem`.
  - Add MCQ questions, options, and explanations for `mcq`.
- [x] Create API endpoint `app/api/admin/tasks/route.ts` with track day auto-resolution.
- [x] **Verification:** Built Day 1 milestone with 3 distinct task types (Theory lesson, zero-copy DSA challenge, and memory safety MCQ checkpoint). Verified live insertion into `day_tasks` and proper JSON payload structure.

### Task 7.4: User Management & Override Controls [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Create `app/admin/users/page.tsx` listing enrolled students (`StudentRosterClient.tsx`).
- [x] Provide admin overrides: "Force Unlock Next Day" or "Reset Streak" for testing and support.
- [x] Create API endpoint `app/api/admin/overrides/route.ts` handling `FORCE_UNLOCK` and `RESET_STREAK`.
- [x] **Verification:** Triggered live "Force Unlock" on student enrollment (immediately setting `next_day_unlock_at` to past timestamp) and "Reset Streak"; verified instant reflection in database.

---

## Phase 8: Legal Pages, Dead-Code Purge & Launch Polish

### Task 8.1: Privacy Policy & Terms of Service Pages [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Implement `/privacy` and `/terms` pages adhering to the clean Apple typography layout.
- [x] Ensure all legal disclaimers and privacy data usage disclosures are accurately stated (`app/privacy/page.tsx`, `app/terms/page.tsx`).
- [x] **Verification:** Verified clean rendering with Apple typography layout, monochromatic borders, zero emojis, zero purple gradients, and verified HTTP 200 responses.

### Task 8.2: Dead Code & Unused Module Elimination [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Run `tsc --noEmit` and ESLint with strict unused checks.
- [x] Purge any unused packages, helper files, or dead styles.
- [x] **Verification:** `tsc --noEmit` passed with 0 errors; ESLint passed with 0 warnings, 0 lint errors, and 0 unused imports.

### Task 8.3: Bundle Size Optimization & Dynamic Imports [COMPLETED]
> ⚠️ **Prerequisite:** Read `rule.md` first.
- [x] Analyze client bundles and code splitting.
- [x] Ensure heavy modules (Monaco Editor, SQL WebAssembly) are isolated into deferred chunks via `next/dynamic(..., { ssr: false })` and Dedicated Web Worker.
- [x] **Verification:** Initial page load chunks exclude Monaco and WebAssembly. Next.js 16 production build compiles all 21 application routes with 100% success.

