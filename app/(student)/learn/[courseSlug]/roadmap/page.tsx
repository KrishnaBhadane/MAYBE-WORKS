import { redirect, notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { RoadmapTimeline, type TimelineDay } from "@/components/dashboard/RoadmapTimeline";
import type { Course, CourseTrack, Enrollment } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{
    courseSlug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function RoadmapPage({ params }: PageProps) {
  const { courseSlug } = await params;
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/learn/${courseSlug}/roadmap`);
  }

  // 1. Fetch Course with tracks in a single relational query
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

  // 2. Fetch User Enrollment for this Course
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .in("track_id", trackIds)
    .maybeSingle();

  // If not enrolled in this course, redirect to catalog to pick commitment hours
  if (!enrollment) {
    redirect("/courses");
  }

  const track = courseTracks.find((t) => t.id === enrollment.track_id);
  if (!track) {
    notFound();
  }

  // 4. Fetch Track Days & Tasks
  const { data: trackDays } = await supabase
    .from("track_days")
    .select("id, day_number, title")
    .eq("track_id", track.id)
    .order("day_number", { ascending: true });

  const dayIds = trackDays?.map((d) => d.id) ?? [];

  const { data: dayTasks } = await supabase
    .from("day_tasks")
    .select("id, day_id")
    .in("day_id", dayIds);

  const allTaskIds = dayTasks?.map((t) => t.id) ?? [];

  // 5. Fetch Completed Tasks for this enrollment
  const { data: completions } = await supabase
    .from("task_completions")
    .select("task_id")
    .eq("enrollment_id", enrollment.id)
    .in("task_id", allTaskIds);

  const completedTaskIdSet = new Set(completions?.map((c) => c.task_id) ?? []);

  // 6. Map to TimelineDay array
  const timelineDays: TimelineDay[] = (trackDays ?? []).map((d) => {
    const tasksForThisDay = dayTasks?.filter((t) => t.day_id === d.id) ?? [];
    const completedForThisDay = tasksForThisDay.filter((t) => completedTaskIdSet.has(t.id)).length;

    return {
      id: d.id,
      dayNumber: d.day_number,
      title: d.title,
      totalTasks: tasksForThisDay.length,
      completedTasks: completedForThisDay,
    };
  });

  return (
    <RoadmapTimeline
      course={course as Course}
      track={track as CourseTrack}
      enrollment={enrollment as Enrollment}
      days={timelineDays}
    />
  );
}
