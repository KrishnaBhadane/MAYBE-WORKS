"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Database, CheckCircle2, Shield } from "lucide-react";
import { AntiMetalButton } from "@/components/ui/anti-metal-button";
import { HourSelectorModal } from "@/components/dashboard/HourSelectorModal";
import type { Course, CourseTrack } from "@/lib/supabase/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface UserEnrollmentItem {
  id: string;
  track_id: string;
  current_day: number;
  is_completed: boolean;
}

export interface CourseCatalogClientProps {
  courses: Course[];
  tracks: CourseTrack[];
  enrolledTrackIds: string[];
  userEnrollments?: UserEnrollmentItem[];
  activeEnrollmentCount?: number;
  userEmail?: string | null;
}

export function CourseCatalogClient({
  courses,
  tracks,
  enrolledTrackIds: _enrolledTrackIds = [],
  userEnrollments = [],
  activeEnrollmentCount = 0,
  userEmail,
}: CourseCatalogClientProps) {
  const router = useRouter();
  const [enrollmentList, setEnrollmentList] = useState<UserEnrollmentItem[]>(userEnrollments);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleOpenEnroll = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleEnroll = async (trackId: string) => {
    if (!userEmail) {
      router.push(`/login?redirectTo=/courses`);
      return;
    }

    setIsEnrolling(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirectTo=/courses`);
        return;
      }

      // Check active uncompleted enrollments
      const { data: activeEnrollments } = await supabase
        .from("enrollments")
        .select("id, track_id, is_completed")
        .eq("user_id", user.id)
        .eq("is_completed", false);

      const alreadyEnrolledThisTrack = activeEnrollments?.some((e: { track_id: string }) => e.track_id === trackId);
      if (!alreadyEnrolledThisTrack && activeEnrollments && activeEnrollments.length >= 2) {
        alert("Enrollment Limit: You can be actively enrolled in a maximum of 2 courses at a time. Complete an ongoing course to enroll in another.");
        return;
      }

      const { error } = await supabase.from("enrollments").upsert({
        user_id: user.id,
        track_id: trackId,
        current_day: 1,
        next_day_unlock_at: new Date().toISOString(),
        is_completed: false,
      }, { onConflict: "user_id,track_id" });

      if (error) {
        alert(`Enrollment failed: ${error.message}`);
        return;
      }

      setEnrollmentList((prev) => [
        {
          id: `new-${Date.now()}`,
          track_id: trackId,
          current_day: 1,
          is_completed: false,
        },
        ...prev,
      ]);

      setIsModalOpen(false);
      if (selectedCourse) {
        router.push(`/learn/${selectedCourse.slug}/roadmap`);
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  // Map enrolled items with their track and course information
  const enrolledItems = enrollmentList
    .map((enrollment) => {
      const track = tracks.find((t) => t.id === enrollment.track_id);
      const course = track ? courses.find((c) => c.id === track.course_id) : null;
      if (!track || !course) return null;
      return {
        enrollment,
        track,
        course,
      };
    })
    .filter((item): item is { enrollment: UserEnrollmentItem; track: CourseTrack; course: Course } => item !== null);

  const enrolledCourseIds = new Set(enrolledItems.map((item) => item.course.id));

  // The Course section will only show courses that are NOT already enrolled/completed
  const availableCourses = courses.filter((course) => !enrolledCourseIds.has(course.id));

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 sm:py-14 select-none">
      {/* 1. Enrolled Courses Section (Above Courses) */}
      {enrolledItems.length > 0 && (
        <div className="mb-10 sm:mb-14">
          <div className="border-b border-white/20 pb-4 sm:pb-6 mb-6 sm:mb-8 flex items-center justify-between">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase drop-shadow-md">
              Enrolled Courses
            </h2>
            <span className="text-xs font-mono font-black uppercase tracking-wider px-3.5 py-1 bg-[#FAFF00] text-black rounded-full shadow-sm">
              {enrolledItems.length} Enrolled
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {enrolledItems.map(({ enrollment, track, course }) => {
              const isFinished = enrollment.is_completed;

              return (
                <div
                  key={enrollment.id || course.id}
                  className="border border-white/20 bg-black/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#FAFF00]/50 transition-all duration-200 shadow-xl"
                >
                  {/* The Course Name */}
                  <div className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 text-[#FAFF00] flex items-center justify-center border border-white/20 rounded-xl shrink-0 shadow-xs">
                      {course.slug.includes("sql") ? (
                        <Database className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : course.slug.includes("reverse") ? (
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight truncate">
                        {course.title}
                      </h3>
                      <span className="text-[11px] font-mono text-neutral-400 font-bold uppercase tracking-wider">
                        Enrolled Curriculum
                      </span>
                    </div>
                  </div>

                  {/* The hour he enrolled for and Day going on in vertical order */}
                  <div className="shrink-0 flex flex-col items-start sm:items-center gap-1.5 sm:px-6 sm:min-w-[150px]">
                    {/* The hour he enrolled for */}
                    <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#FAFF00] border border-black text-xs font-mono font-black text-black shadow-xs whitespace-nowrap">
                      {track.daily_hours}H / Day Track
                    </span>

                    {/* Day going on */}
                    {isFinished ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-[#FAFF00] border border-white/20 text-xs font-mono font-black shadow-xs whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-mono font-bold whitespace-nowrap">
                        Day {enrollment.current_day} of {track.total_days}
                      </span>
                    )}
                  </div>

                  {/* Resume / Completed Button using AntiMetalButton matching Hero */}
                  <div className="shrink-0 flex items-center justify-end sm:min-w-[140px]">
                    {isFinished ? (
                      <Link href={`/learn/${course.slug}/roadmap`} className="w-full sm:w-auto">
                        <AntiMetalButton
                          label="Completed"
                          size="sm"
                          accentFrom="#FFFFFF"
                          accentTo="#E5E7EB"
                          dotColor="#000000"
                          className="w-full sm:w-auto"
                        />
                      </Link>
                    ) : (
                      <Link href={`/learn/${course.slug}/day/${enrollment.current_day}`} className="w-full sm:w-auto">
                        <AntiMetalButton
                          label="Resume"
                          size="sm"
                          accentFrom="#FAFF00"
                          accentTo="#EEF200"
                          dotColor="#000000"
                          className="w-full sm:w-auto"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Course Section (Available Un-enrolled Courses) */}
      <div>
        <div className="border-b border-white/20 pb-4 sm:pb-6 mb-6 sm:mb-8 flex items-center justify-between">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase drop-shadow-md">
            Course
          </h1>
          {availableCourses.length > 0 && (
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              {availableCourses.length} Available
            </span>
          )}
        </div>

        {availableCourses.length === 0 ? (
          <div className="p-8 sm:p-12 border border-dashed border-white/20 rounded-2xl text-center bg-black/60 backdrop-blur-md">
            <h3 className="text-lg font-black text-white uppercase">
              All Courses Enrolled
            </h3>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              You are currently enrolled in all available courses in our catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {availableCourses.map((course) => {
              const courseTracks = tracks.filter((t) => t.course_id === course.id);

              return (
                <div
                  key={course.id}
                  className="border border-white/20 bg-black/80 backdrop-blur-md flex flex-col justify-between hover:border-[#FAFF00]/50 transition-all duration-200 rounded-2xl overflow-hidden shadow-2xl min-w-0"
                >
                  <div className="p-4 sm:p-6 flex-1 flex flex-col">
                    {/* Course Icon & Category */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/10 text-[#FAFF00] flex items-center justify-center border border-white/20 rounded-xl shrink-0">
                        {course.slug.includes("sql") ? (
                          <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : course.slug.includes("reverse") ? (
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                    </div>

                    {/* Course Title Only */}
                    <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-snug line-clamp-2 min-h-[2.5rem]">
                      {course.title}
                    </h2>

                    {/* Available Pacing Tracks */}
                    <div className="mt-4 pt-4 border-t border-white/15">
                      <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        Available Pacing
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {courseTracks.map((t) => (
                          <span
                            key={t.id}
                            className="px-2.5 py-1 text-[11px] font-mono font-bold bg-white/10 border border-white/20 text-neutral-200 rounded-md whitespace-nowrap"
                          >
                            {t.daily_hours}H
                            <span> / Day ({t.total_days}d)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Footer: Enroll button styled identical to Hero using AntiMetalButton */}
                  <div className="p-3 sm:p-4 bg-black/60 border-t border-white/15 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-neutral-400 font-bold uppercase tracking-wide hidden sm:inline">
                      Daily Pacing
                    </span>
                    <AntiMetalButton
                      label="Enroll"
                      size="sm"
                      accentFrom="#FAFF00"
                      accentTo="#EEF200"
                      dotColor="#000000"
                      onClick={() => handleOpenEnroll(course)}
                      className="w-full sm:w-auto"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pacing Commitment Modal */}
      <HourSelectorModal
        course={selectedCourse}
        tracks={selectedCourse ? tracks.filter((t) => t.course_id === selectedCourse.id) : []}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnroll={handleEnroll}
        isLoading={isEnrolling}
        activeEnrollmentCount={activeEnrollmentCount}
      />
    </div>
  );
}
