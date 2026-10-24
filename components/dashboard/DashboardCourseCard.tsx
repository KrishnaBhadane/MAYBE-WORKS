"use client";

import Link from "next/link";
import { Terminal, Database, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Course, CourseTrack, Enrollment } from "@/lib/supabase/types";

export interface DashboardCourseCardProps {
  course: Course;
  track: CourseTrack;
  enrollment: Enrollment;
}

export function DashboardCourseCard({
  course,
  track,
  enrollment,
}: DashboardCourseCardProps) {
  const percentComplete = Math.min(
    100,
    Math.round(((enrollment.current_day - 1) / track.total_days) * 100)
  );

  return (
    <div className="border-2 border-black bg-white flex flex-col justify-between hover:shadow-md transition-shadow duration-150 rounded-2xl overflow-hidden select-none">
      <div className="p-6 sm:p-7">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-black text-[#FAFF00] flex items-center justify-center border border-black rounded-xl">
            {course.slug === "dsa-cpp" ? (
              <Terminal className="w-5 h-5" />
            ) : (
              <Database className="w-5 h-5" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="yellow" className="rounded-full text-xs font-black">{track.daily_hours}H Pacing</Badge>
            {enrollment.is_completed && (
              <Badge variant="navy" className="rounded-full text-xs font-black">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-black tracking-tight">
          {course.title}
        </h3>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-neutral-600">
            <span>
              {enrollment.is_completed ? (
                <strong className="text-black">All {track.total_days} Days Completed</strong>
              ) : (
                <>Day <strong className="text-black">{enrollment.current_day}</strong> of {track.total_days}</>
              )}
            </span>
            <span className="font-bold text-black">{enrollment.is_completed ? "100%" : `${percentComplete}%`}</span>
          </div>

          <div className="w-full h-2.5 bg-neutral-100 border border-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300 ease-out"
              style={{ width: `${enrollment.is_completed ? 100 : percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 bg-[#F8F9FA] border-t-2 border-black flex items-center justify-between gap-3">
        <Link
          href={`/learn/${course.slug}/roadmap`}
          className="text-xs font-bold text-neutral-700 hover:text-black uppercase tracking-wider transition-colors"
        >
          View Roadmap
        </Link>

        {enrollment.is_completed ? (
          <Link href={`/learn/${course.slug}/roadmap`}>
            <Button variant="outline" size="sm" className="rounded-full font-black text-xs uppercase px-4 border-2">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 stroke-[3]" />
              Completed
            </Button>
          </Link>
        ) : (
          <Link href={`/learn/${course.slug}/roadmap`}>
            <Button variant="primary" size="sm" className="rounded-full font-black text-xs uppercase px-4 shadow-sm">
              <Play className="w-3.5 h-3.5 mr-1 fill-current" />
              Resume Day {enrollment.current_day}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
