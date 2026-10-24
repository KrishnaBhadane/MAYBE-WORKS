import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { StreakBanner } from "@/components/dashboard/StreakBanner";
import { DashboardCourseCard } from "@/components/dashboard/DashboardCourseCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Course, CourseTrack, Enrollment, Profile } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard & Roadmap — kreepycode",
  description: "Track your active engineering tracks, streaks, and next 2:00 AM milestone unlock.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  // 1. Fetch Profile for Streak Tracking
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userProfile = profile as Profile | null;

  // 2. Fetch User Enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const enrollmentList = (enrollments as Enrollment[]) ?? [];
  const trackIds = enrollmentList.map((e) => e.track_id);

  // 3. Fetch Tracks
  const { data: tracks } = trackIds.length > 0
    ? await supabase.from("course_tracks").select("*").in("id", trackIds)
    : { data: [] };

  const trackList = (tracks as CourseTrack[]) ?? [];
  const courseIds = trackList.map((t) => t.course_id);

  // 4. Fetch Courses
  const { data: courses } = courseIds.length > 0
    ? await supabase.from("courses").select("*").in("id", courseIds)
    : { data: [] };

  const courseList = (courses as Course[]) ?? [];

  // Match each enrollment with its track and course
  const activeEnrollments = enrollmentList
    .map((enrollment) => {
      const track = trackList.find((t) => t.id === enrollment.track_id);
      const course = track ? courseList.find((c) => c.id === track.course_id) : null;
      if (!track || !course) return null;
      return { enrollment, track, course };
    })
    .filter((item): item is { enrollment: Enrollment; track: CourseTrack; course: Course } => item !== null);

  // Determine closest next unlock timestamp
  const nextUnlockAt = activeEnrollments[0]?.enrollment.next_day_unlock_at;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 select-none">
      {/* Header */}
      <div className="border-b-2 border-black pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge variant="yellow" className="mb-2">Daily Consistency Workspace</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase">
            Active Roadmap
          </h1>
          <p className="text-xs text-neutral-600 mt-1 font-sans">
            Welcome back, <strong className="text-black">{user.email?.split("@")[0]}</strong>. Complete daily tasks before 2:00 AM to advance.
          </p>
        </div>

        <Link href="/courses">
          <Button variant="outline" size="sm">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Browse Catalog
          </Button>
        </Link>
      </div>

      {/* Streak Counter & 2:00 AM Unlock Banner */}
      <StreakBanner
        streakCount={userProfile?.streak_count ?? 0}
        nextUnlockAt={nextUnlockAt}
        lastActiveDate={userProfile?.created_at?.split("T")[0]}
      />

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-neutral-500 font-mono">
            Enrolled Tracks ({activeEnrollments.length})
          </h2>
        </div>

        {activeEnrollments.length === 0 ? (
          <div className="border-2 border-black bg-white p-12 text-center rounded-none">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-black opacity-30" />
            <h3 className="text-xl font-black text-black uppercase tracking-tight">
              No Active Tracks Enrolled
            </h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto mt-2 font-sans leading-relaxed">
              Choose your daily habit commitment (2h, 3h, or 4h) for DSA in C++ or Production SQL to start Day 1.
            </p>
            <Link href="/courses" className="inline-block mt-6">
              <Button variant="yellow" size="md">
                Explore Tracks Catalog <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeEnrollments.map(({ enrollment, track, course }) => (
              <DashboardCourseCard
                key={enrollment.id}
                course={course}
                track={track}
                enrollment={enrollment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
