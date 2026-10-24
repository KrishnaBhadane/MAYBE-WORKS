import { redirect, notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DayWorkspaceClient } from "@/components/workspace/DayWorkspaceClient";
import type { Course, CourseTrack, DayTask, Enrollment, TrackDay } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{
    courseSlug: string;
    dayNumber: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function DayPage({ params }: PageProps) {
  const { courseSlug, dayNumber: dayNumStr } = await params;
  const dayNumber = parseInt(dayNumStr, 10);

  if (isNaN(dayNumber) || dayNumber <= 0) {
    notFound();
  }

  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/learn/${courseSlug}/day/${dayNumber}`);
  }

  // 1. Fetch Course with associated Tracks in a single relational query
  const { data: course } = await supabase
    .from("courses")
    .select("*, course_tracks(*)")
    .eq("slug", courseSlug)
    .single();

  if (!course) {
    notFound();
  }

  const courseTracks: CourseTrack[] = (course as unknown as { course_tracks?: CourseTrack[] }).course_tracks ?? [];
  const trackIds = courseTracks.map((t) => t.id);

  // 2. Fetch User Enrollment for these track IDs
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .in("track_id", trackIds)
    .maybeSingle();

  if (!enrollment) {
    redirect("/courses");
  }

  const track = courseTracks.find((t) => t.id === enrollment.track_id);
  if (!track) {
    notFound();
  }

  // 3. Fetch Track Day for this track
  const { data: trackDay } = await supabase
    .from("track_days")
    .select("*")
    .eq("track_id", track.id)
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (!trackDay) {
    notFound();
  }

  // 4. Fetch Tasks and Profile in parallel
  const [tasksRes, profileRes] = await Promise.all([
    supabase
      .from("day_tasks")
      .select("*")
      .eq("day_id", trackDay.id)
      .order("sequence_order", { ascending: true }),
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single(),
  ]);

  const taskList = (tasksRes.data as DayTask[]) ?? [];
  const taskIds = taskList.map((t) => t.id);

  const { data: completions } = taskIds.length > 0
    ? await supabase
        .from("task_completions")
        .select("task_id")
        .eq("enrollment_id", enrollment.id)
        .in("task_id", taskIds)
    : { data: [] };

  const completedTaskIds = completions?.map((c) => c.task_id) ?? [];
  const profile = profileRes.data;

  return (
    <DayWorkspaceClient
      course={course as Course}
      track={track as CourseTrack}
      day={trackDay as TrackDay}
      tasks={taskList}
      enrollment={enrollment as Enrollment}
      completedTaskIds={completedTaskIds}
      userEmail={user.email ?? ""}
      userRole={profile?.role ?? "student"}
    />
  );
}
