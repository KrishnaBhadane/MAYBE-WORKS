import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CourseCatalogClient } from "@/components/dashboard/CourseCatalogClient";
import type { Course, CourseTrack } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses — kreepycode",
  description: "Explore engineering courses for Data Structures & Algorithms, Systems, and Production SQL.",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const supabase = await getSupabaseServerClient();

  // Run all database calls in PARALLEL to eliminate serial waterfall delay
  const [coursesRes, tracksRes, authRes] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, slug, icon, is_published, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("course_tracks")
      .select("*")
      .order("daily_hours", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  const courses = coursesRes.data;
  const tracks = tracksRes.data;
  const user = authRes.data?.user;

  let enrolledTrackIds: string[] = [];
  let userEnrollments: { id: string; track_id: string; current_day: number; is_completed: boolean }[] = [];
  let activeEnrollmentCount = 0;

  if (user) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, track_id, current_day, is_completed")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (enrollments) {
      userEnrollments = enrollments.map((e) => ({
        id: e.id,
        track_id: e.track_id,
        current_day: e.current_day || 1,
        is_completed: !!e.is_completed,
      }));
      enrolledTrackIds = enrollments.map((e) => e.track_id);
      activeEnrollmentCount = enrollments.filter((e) => !e.is_completed).length;
    }
  }

  return (
    <CourseCatalogClient
      courses={(courses as Course[]) ?? []}
      tracks={(tracks as CourseTrack[]) ?? []}
      enrolledTrackIds={enrolledTrackIds}
      userEnrollments={userEnrollments}
      activeEnrollmentCount={activeEnrollmentCount}
      userEmail={user?.email}
    />
  );
}
