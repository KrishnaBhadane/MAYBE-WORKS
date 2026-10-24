import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, Course, CourseTrack } from "@/lib/supabase/types";

export interface AdminStats {
  totalStudents: number;
  activeStreaks: number;
  totalCourses: number;
  totalEnrollments: number;
  popularTracks: Array<{
    trackId: string;
    courseTitle: string;
    dailyHours: number;
    enrollmentCount: number;
  }>;
}

export interface StudentEnrollmentRow {
  enrollmentId: string;
  userId: string;
  userEmail: string;
  courseTitle: string;
  dailyHours: number;
  currentDay: number;
  totalDays: number;
  streakCount: number;
  isCompleted: boolean;
  nextDayUnlockAt: string;
}

/**
 * Validates that current session belongs to an authorized admin.
 * Redirects non-admins to /dashboard or unauthenticated users to /login.
 */
export async function requireAdminSession(): Promise<{ userId: string; email: string }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return { userId: user.id, email: user.email ?? "" };
}

/**
 * Fetches platform overview metrics for Admin Dashboard.
 */
export async function getAdminOverviewStats(): Promise<AdminStats> {
  const supabase = await getSupabaseServerClient();

  // 1. Total students count
  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  // 2. Active streaks count (streak > 0)
  const { count: activeStreakCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gt("streak_count", 0);

  // 3. Courses count
  const { data: courses } = await supabase.from("courses").select("id, title");
  const courseList = courses ?? [];

  // 4. Enrollments count
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("track_id");

  const enrollmentList = enrollments ?? [];

  // 5. Tracks
  const { data: tracks } = await supabase
    .from("course_tracks")
    .select("id, course_id, daily_hours");

  const trackList = (tracks as CourseTrack[]) ?? [];

  // Compute popular tracks
  const trackCountMap = new Map<string, number>();
  enrollmentList.forEach((e) => {
    trackCountMap.set(e.track_id, (trackCountMap.get(e.track_id) ?? 0) + 1);
  });

  const popularTracks = trackList
    .map((t) => {
      const course = courseList.find((c) => c.id === t.course_id);
      return {
        trackId: t.id,
        courseTitle: course?.title ?? "Unknown Course",
        dailyHours: t.daily_hours,
        enrollmentCount: trackCountMap.get(t.id) ?? 0,
      };
    })
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount);

  return {
    totalStudents: studentCount ?? 0,
    activeStreaks: activeStreakCount ?? 0,
    totalCourses: courseList.length,
    totalEnrollments: enrollmentList.length,
    popularTracks,
  };
}

/**
 * Fetches all student enrollments with user profiles for admin overrides.
 */
export async function getAdminStudentList(): Promise<StudentEnrollmentRow[]> {
  const supabase = await getSupabaseServerClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*")
    .order("created_at", { ascending: false });

  if (!enrollments || enrollments.length === 0) return [];

  const userIds = Array.from(new Set(enrollments.map((e) => e.user_id)));
  const trackIds = Array.from(new Set(enrollments.map((e) => e.track_id)));

  const { data: profiles } = await supabase.from("profiles").select("*").in("id", userIds);
  const { data: tracks } = await supabase.from("course_tracks").select("*").in("id", trackIds);
  const { data: courses } = await supabase.from("courses").select("id, title");

  const profileMap = new Map((profiles as Profile[])?.map((p) => [p.id, p]) ?? []);
  const trackMap = new Map((tracks as CourseTrack[])?.map((t) => [t.id, t]) ?? []);
  const courseMap = new Map((courses as Course[])?.map((c) => [c.id, c.title]) ?? []);

  return enrollments.map((e) => {
    const prof = profileMap.get(e.user_id);
    const tr = trackMap.get(e.track_id);
    const courseTitle = tr ? courseMap.get(tr.course_id) ?? "Curriculum" : "Curriculum";

    return {
      enrollmentId: e.id,
      userId: e.user_id,
      userEmail: prof?.email ?? "Unknown",
      courseTitle,
      dailyHours: tr?.daily_hours ?? 3,
      currentDay: e.current_day,
      totalDays: tr?.total_days ?? 30,
      streakCount: prof?.streak_count ?? 0,
      isCompleted: e.is_completed,
      nextDayUnlockAt: e.next_day_unlock_at,
    };
  });
}
