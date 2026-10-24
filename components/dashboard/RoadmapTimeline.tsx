"use client";

import { useState } from "react";

import Link from "next/link";
import { Check, Lock, Play, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUnlockCountdown } from "@/hooks/useUnlockCountdown";
import type { Course, CourseTrack, Enrollment } from "@/lib/supabase/types";

export interface TimelineDay {
  id: string;
  dayNumber: number;
  title: string;
  totalTasks: number;
  completedTasks: number;
}

export interface RoadmapTimelineProps {
  course: Course;
  track: CourseTrack;
  enrollment: Enrollment;
  days: TimelineDay[];
}

export function RoadmapTimeline({
  course,
  track,
  enrollment,
  days,
}: RoadmapTimelineProps) {
  const [selectedLockedDay, setSelectedLockedDay] = useState<number | null>(null);
  const countdown = useUnlockCountdown(enrollment.next_day_unlock_at);

  const isCurrentDayLocked =
    enrollment.current_day > 1 &&
    !countdown.isUnlocked &&
    !enrollment.is_completed;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 select-none">
      {/* Course Banner */}
      <div className="border-2 border-black bg-white p-6 sm:p-7 mb-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="yellow" className="rounded-full text-xs font-black">{track.daily_hours}H / Day Track</Badge>
            <Badge variant="subtle" className="rounded-full text-xs font-black">{track.total_days} Days Total</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
            {course.title}
          </h1>
          <p className="text-xs text-neutral-600 mt-1 font-sans">
            {enrollment.is_completed
              ? "All curriculum days and tests completed! Track fully finished."
              : isCurrentDayLocked
              ? `Day ${enrollment.current_day} unlocks at 2:00 AM IST. Habit countdown: ${countdown.formatted}`
              : `Currently on Day ${enrollment.current_day} of ${track.total_days}. Complete all daily tasks before 2:00 AM IST.`}
          </p>
        </div>

        <div>
          {enrollment.is_completed ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-[#FAFF00] border-2 border-black rounded-full font-black text-xs uppercase tracking-wider shadow-sm">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Completed</span>
            </div>
          ) : isCurrentDayLocked ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 text-neutral-500 border-2 border-neutral-300 rounded-full font-black text-xs uppercase tracking-wider cursor-not-allowed">
              <Lock className="w-4 h-4" />
              <span>Day {enrollment.current_day} Locked (2:00 AM IST)</span>
            </div>
          ) : (
            <Link href={`/learn/${course.slug}/day/${enrollment.current_day}`}>
              <Button variant="primary" size="md" className="rounded-full font-black uppercase text-xs tracking-wider px-6">
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                Resume Day {enrollment.current_day}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-black/20 ml-6 sm:ml-8 pl-6 sm:pl-8 space-y-8">
        {days.map((day) => {
          const isDay2OrCurrentLocked =
            day.dayNumber === enrollment.current_day &&
            day.dayNumber > 1 &&
            !countdown.isUnlocked;

          const isCompleted =
            day.dayNumber < enrollment.current_day ||
            (enrollment.is_completed && day.dayNumber === enrollment.current_day);

          const isLocked = day.dayNumber > enrollment.current_day || isDay2OrCurrentLocked;
          const isActive =
            day.dayNumber === enrollment.current_day &&
            !isDay2OrCurrentLocked &&
            !enrollment.is_completed;
          const showTooltip = selectedLockedDay === day.dayNumber;

          return (
            <div key={day.id} className="relative group">
              {/* Node Icon on Timeline Spine */}
              <div
                className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border-2 border-black rounded-full transition-transform duration-200 ${
                  isCompleted
                    ? "bg-black text-[#FAFF00]"
                    : isActive
                    ? "bg-[#FAFF00] text-black shadow-xs ring-4 ring-black/10 scale-110"
                    : "bg-[#F8F9FA] text-neutral-400 border-neutral-300"
                }`}
              >
                {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                {isActive && <Sparkles className="w-4 h-4 fill-black" />}
                {isLocked && <Lock className="w-3.5 h-3.5" />}
              </div>

              {/* Day Card */}
              <div
                onClick={() => {
                  if (isLocked) {
                    setSelectedLockedDay(showTooltip ? null : day.dayNumber);
                  }
                }}
                className={`border-2 p-5 transition-all duration-150 rounded-2xl ${
                  isActive
                    ? "border-black bg-white shadow-md ring-2 ring-black/5"
                    : isCompleted
                    ? "border-black/20 bg-white hover:border-black"
                    : "border-black/10 bg-[#FAFAFA] opacity-75 cursor-pointer hover:border-black/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-black uppercase text-black">
                        Day {day.dayNumber}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-[#FAFF00] border border-black text-[10px] font-black uppercase tracking-wider rounded-full">
                          Active Milestone
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-black text-black tracking-tight">
                      {day.title}
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 font-mono">
                      {day.completedTasks} of {day.totalTasks} tasks completed
                    </p>
                  </div>

                  {/* Right Action - fixed width & distance from right */}
                  <div className="shrink-0 flex items-center justify-end sm:min-w-[130px]">
                    {isActive && (
                      <Link href={`/learn/${course.slug}/day/${day.dayNumber}`}>
                        <Button variant="yellow" size="sm" className="w-[124px] rounded-full font-black text-xs uppercase py-2 shadow-sm flex items-center justify-center gap-1.5">
                          Start Tasks <Play className="w-3.5 h-3.5 fill-black" />
                        </Button>
                      </Link>
                    )}
                    {isCompleted && (
                      <Link href={`/learn/${course.slug}/day/${day.dayNumber}`}>
                        <Button variant="outline" size="sm" className="w-[124px] rounded-full font-black text-xs uppercase py-2 border-2 border-black hover:bg-black hover:text-[#FAFF00] justify-center">
                          Review
                        </Button>
                      </Link>
                    )}
                    {isLocked && (
                      <span className="w-[124px] inline-flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-neutral-500 bg-neutral-100 py-1.5 rounded-full border border-neutral-300 whitespace-nowrap">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        {isDay2OrCurrentLocked ? `Locked 2AM` : "Locked"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Locked Tooltip Popover */}
                {isLocked && showTooltip && (
                  <div className="mt-4 p-3.5 bg-black text-white text-xs border border-black rounded-xl animate-in fade-in duration-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#FAFF00]" />
                      <span>
                        {isDay2OrCurrentLocked
                          ? `Day ${day.dayNumber} unlocks at exactly 2:00 AM Indian Standard Time (IST).`
                          : `Day ${day.dayNumber} unlocks at 2:00 AM IST once Day ${day.dayNumber - 1} is finished.`}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#FAFF00]">
                      {countdown.formatted}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
