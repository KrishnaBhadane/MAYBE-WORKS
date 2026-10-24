import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileClient, type EnrolledCourseItem } from "@/components/profile/ProfileClient";
import type { DailyHours } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineer Profile & Settings — kreepycode",
  description: "Manage your registered engineering tracks, streak telemetry, and account settings.",
};

export const dynamic = "force-dynamic";

interface RawEnrollmentItem {
  id: string;
  current_day: number;
  is_completed: boolean;
  course_tracks: {
    daily_hours: DailyHours;
    total_days: number;
    courses: {
      title: string;
      slug: string;
    } | null;
  } | null;
}

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  // Parallel fetch: profile and active enrollments
  const [profileRes, enrollmentsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("enrollments")
      .select(`
        id,
        current_day,
        is_completed,
        course_tracks (
          daily_hours,
          total_days,
          courses (
            title,
            slug
          )
        )
      `)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  const profile = profileRes.data;

  const rawEnrollments = (enrollmentsRes.data ?? []) as unknown as RawEnrollmentItem[];

  const enrollments: EnrolledCourseItem[] = rawEnrollments.map((e) => {
    const track = e.course_tracks;
    const course = track?.courses;
    return {
      enrollmentId: e.id,
      courseTitle: course?.title || "Engineering Track",
      courseSlug: course?.slug || "dsa-cpp",
      dailyHours: track?.daily_hours || 3,
      currentDay: e.current_day || 1,
      totalDays: track?.total_days || 30,
      isCompleted: e.is_completed || false,
    };
  });

  return (
    <div className="flex-1 bg-[#F8F9FA] min-h-screen">
      <ProfileClient
        user={{ id: user.id, email: user.email ?? "" }}
        profile={profile}
        enrollments={enrollments}
      />
    </div>
  );
}
