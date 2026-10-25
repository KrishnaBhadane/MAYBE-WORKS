import { getSupabaseServerClient } from "@/lib/supabase/server";
import { HeroWithMatrix } from "@/components/home/HeroWithMatrix";
import { CourseCatalogClient } from "@/components/dashboard/CourseCatalogClient";
import { MatrixRain } from "@/components/ui/matrix-rain";
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
    <div className="relative min-h-screen w-full bg-black text-white selection:bg-[#00FF66] selection:text-black">
      {/* FIXED GREEN CODE ANIMATION BACKGROUND - Remains static in viewport while foreground elements scroll */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black">
        <MatrixRain
          className="w-full h-full"
          background="#000000"
          color="#00FF66"
          highlight="#FFFFFF"
          fontSize={16}
          density={0.85}
          speed={0.85}
          trail={0.88}
          pointerResponse={false}
        />
        {/* Subtle atmospheric vignette to guarantee foreground text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-black/90 pointer-events-none" />
      </div>

      {/* FOREGROUND SCROLLABLE CONTENT: Hero, Enrolled Courses, Courses Catalog, Footer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        <HeroWithMatrix
          initialUser={user ? { id: user.id, email: user.email ?? "" } : null}
          hasEnrollment={enrolledTrackIds.length > 0}
          activeCourseSlug={activeCourseSlug}
          activeDayNumber={activeDayNumber}
          isCourseCompleted={isCourseCompleted}
        />

        {/* Tracks & Enrolled Courses Section - Scrolls smoothly over the fixed green background */}
        <section id="tracks" className="relative z-10 w-full">
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
        <footer className="mt-auto px-6 py-8 lg:px-8 bg-black/80 backdrop-blur-md border-t border-white/10 select-none">
          <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs font-bold uppercase text-neutral-400">
              &copy; 2026 kreepycode
            </span>
            <div className="flex items-center gap-6 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
