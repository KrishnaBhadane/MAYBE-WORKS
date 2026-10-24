import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CourseManagerClient } from "@/components/admin/CourseManagerClient";
import type { Course, CourseTrack } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const supabase = await getSupabaseServerClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });

  const { data: tracks } = await supabase
    .from("course_tracks")
    .select("*")
    .order("daily_hours", { ascending: true });

  return (
    <CourseManagerClient
      courses={(courses as Course[]) ?? []}
      tracks={(tracks as CourseTrack[]) ?? []}
    />
  );
}
