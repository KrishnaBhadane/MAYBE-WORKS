import { getSupabaseServerClient } from "@/lib/supabase/server";
import { HeroWithMatrix } from "@/components/home/HeroWithMatrix";
import { CourseCatalogClient } from "@/components/dashboard/CourseCatalogClient";
import type { Course, CourseTrack } from "@/lib/supabase/types";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();

  // Parallel high-performance database querying
  const [
    { data: courses },
    { data: tracks },
    {
      data: { user },
    },
  ] = await Promise.all([
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

  let enrolledTrackIds: string[] = [];
  let userEnrollments: { id: string; track_id: string; current_day: number; is_completed: boolean }[] = [];
  let activeCourseSlug: string | null = null;
  let activeDayNumber = 1;
  let isCourseCompleted = false;
  let activeEnrollmentCount = 0;

  if (user) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, track_id, current_day, is_completed, course_tracks(course_id, courses(slug))")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (enrollments && enrollments.length > 0) {
      enrolledTrackIds = enrollments.map((e) => e.track_id);
      activeEnrollmentCount = enrollments.filter((e) => !e.is_completed).length;
      userEnrollments = enrollments.map((e) => ({
        id: e.id,
        track_id: e.track_id,
        current_day: e.current_day || 1,
        is_completed: !!e.is_completed,
      }));
      const activeEnrollment = enrollments.find((e) => !e.is_completed) || enrollments[0];
      activeDayNumber = activeEnrollment.current_day || 1;
      isCourseCompleted = !!activeEnrollment.is_completed;
      // @ts-expect-error Supabase nested relation
      activeCourseSlug = activeEnrollment.course_tracks?.courses?.slug ?? null;
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      {/* Hero with Full Background MatrixRain & Creepycode Word-by-Word Animation */}
      <HeroWithMatrix
        initialUser={user ? { id: user.id, email: user.email ?? "" } : null}
        hasEnrollment={enrolledTrackIds.length > 0}
        activeCourseSlug={activeCourseSlug}
        activeDayNumber={activeDayNumber}
        isCourseCompleted={isCourseCompleted}
      />

      {/* Tracks Section Directly Under Hero */}
      <section id="tracks" className="border-b-2 border-black bg-white">
        <CourseCatalogClient
          courses={(courses as Course[]) ?? []}
          tracks={(tracks as CourseTrack[]) ?? []}
          enrolledTrackIds={enrolledTrackIds}
          userEnrollments={userEnrollments}
          activeEnrollmentCount={activeEnrollmentCount}
          userEmail={user?.email}
        />
      </section>

      {/* Minimal Footer */}
      <footer className="mt-auto px-6 py-8 lg:px-8 bg-white border-t border-black/10 select-none">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-xs font-bold uppercase text-black/60">
            &copy; 2026 kreepycode
          </span>
          <div className="flex items-center gap-6 text-xs font-mono font-bold uppercase tracking-wider text-black/60">
            <Link href="/privacy" className="hover:text-black">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-black">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
