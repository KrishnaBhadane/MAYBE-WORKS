import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateNextUnlockTime, isDayUnlocked } from "@/lib/utils/unlockCalculator";

export interface TaskSubmissionPayload {
  enrollmentId: string;
  taskId: string;
  submittedCode?: string;
  userTimezone?: string;
}

export interface ProgressResult {
  success: boolean;
  alreadyCompleted: boolean;
  dayCompleted: boolean;
  newCurrentDay?: number;
  nextUnlockAt?: string;
  newStreak?: number;
  error?: string;
}

export interface DayProgress {
  enrollmentId: string;
  currentDay: number;
  isCompleted: boolean;
  nextDayUnlockAt: string;
  isUnlocked: boolean;
  totalTasks: number;
  completedTasks: number;
  allTasksCompleted: boolean;
  completedTaskIds: string[];
}

/**
 * Records a task completion idempotently and advances day/streak if all tasks for the current day are complete.
 */
export async function recordTaskCompletion(
  supabase: SupabaseClient,
  payload: TaskSubmissionPayload
): Promise<ProgressResult> {
  // 1. Idempotency Check: Return immediately if already completed
  const { data: existing } = await supabase
    .from("task_completions")
    .select("id")
    .eq("enrollment_id", payload.enrollmentId)
    .eq("task_id", payload.taskId)
    .maybeSingle();

  if (existing) {
    return {
      success: true,
      alreadyCompleted: true,
      dayCompleted: false,
    };
  }

  // 2. Insert completion
  const { error: insertErr } = await supabase.from("task_completions").insert({
    enrollment_id: payload.enrollmentId,
    task_id: payload.taskId,
    submitted_code: payload.submittedCode ?? null,
  });

  if (insertErr) {
    return { success: false, alreadyCompleted: false, dayCompleted: false, error: insertErr.message };
  }

  // 3. Fetch enrollment and track details
  const { data: enrollment, error: enrollErr } = await supabase
    .from("enrollments")
    .select("id, user_id, track_id, current_day, is_completed")
    .eq("id", payload.enrollmentId)
    .single();

  if (enrollErr || !enrollment) {
    return { success: false, alreadyCompleted: false, dayCompleted: false, error: "Enrollment not found" };
  }

  // 4. Find current track day
  const { data: trackDay } = await supabase
    .from("track_days")
    .select("id")
    .eq("track_id", enrollment.track_id)
    .eq("day_number", enrollment.current_day)
    .maybeSingle();

  if (!trackDay) {
    return { success: true, alreadyCompleted: false, dayCompleted: false };
  }

  // 5. Fetch all tasks for current day
  const { data: dayTasks } = await supabase
    .from("day_tasks")
    .select("id")
    .eq("day_id", trackDay.id);

  const taskIds = dayTasks?.map((t) => t.id) ?? [];
  if (taskIds.length === 0) {
    return { success: true, alreadyCompleted: false, dayCompleted: false };
  }

  // 6. Check completions for this day's tasks
  const { data: completions } = await supabase
    .from("task_completions")
    .select("task_id")
    .eq("enrollment_id", payload.enrollmentId)
    .in("task_id", taskIds);

  const completedCount = completions?.length ?? 0;
  if (completedCount < taskIds.length) {
    return { success: true, alreadyCompleted: false, dayCompleted: false };
  }

  // 7. All tasks for the day are complete -> Advance current_day & lock with next_day_unlock_at
  const nextUnlockAt = calculateNextUnlockTime(new Date(), payload.userTimezone).toISOString();

  const { data: track } = await supabase
    .from("course_tracks")
    .select("total_days")
    .eq("id", enrollment.track_id)
    .single();

  const totalDays = track?.total_days ?? 30;
  const isCourseFinished = enrollment.current_day >= totalDays;
  const newCurrentDay = isCourseFinished ? enrollment.current_day : enrollment.current_day + 1;

  await supabase
    .from("enrollments")
    .update({
      current_day: newCurrentDay,
      next_day_unlock_at: nextUnlockAt,
      is_completed: isCourseFinished,
    })
    .eq("id", payload.enrollmentId);

  // 8. Update User Streak atomically
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_active_date")
    .eq("id", enrollment.user_id)
    .single();

  const todayStr = new Date().toISOString().split("T")[0];
  let newStreak = profile?.streak_count ?? 0;

  if (profile?.last_active_date !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    newStreak = profile?.last_active_date === yesterdayStr ? newStreak + 1 : 1;

    await supabase
      .from("profiles")
      .update({
        streak_count: newStreak,
        last_active_date: todayStr,
      })
      .eq("id", enrollment.user_id);
  }

  return {
    success: true,
    alreadyCompleted: false,
    dayCompleted: true,
    newCurrentDay,
    nextUnlockAt,
    newStreak,
  };
}

/**
 * Returns the current day progress and lock state for an enrollment.
 */
export async function getDayProgress(
  supabase: SupabaseClient,
  enrollmentId: string
): Promise<DayProgress | null> {
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, track_id, current_day, is_completed, next_day_unlock_at")
    .eq("id", enrollmentId)
    .single();

  if (!enrollment) return null;

  const { data: trackDay } = await supabase
    .from("track_days")
    .select("id")
    .eq("track_id", enrollment.track_id)
    .eq("day_number", enrollment.current_day)
    .maybeSingle();

  const { data: tasks } = trackDay
    ? await supabase.from("day_tasks").select("id").eq("day_id", trackDay.id)
    : { data: [] };

  const taskIds = tasks?.map((t) => t.id) ?? [];

  const { data: completions } = taskIds.length > 0
    ? await supabase
        .from("task_completions")
        .select("task_id")
        .eq("enrollment_id", enrollmentId)
        .in("task_id", taskIds)
    : { data: [] };

  const completedTaskIds = completions?.map((c) => c.task_id) ?? [];

  return {
    enrollmentId,
    currentDay: enrollment.current_day,
    isCompleted: enrollment.is_completed,
    nextDayUnlockAt: enrollment.next_day_unlock_at,
    isUnlocked: isDayUnlocked(enrollment.next_day_unlock_at),
    totalTasks: taskIds.length,
    completedTasks: completedTaskIds.length,
    allTasksCompleted: taskIds.length > 0 && completedTaskIds.length === taskIds.length,
    completedTaskIds,
  };
}
