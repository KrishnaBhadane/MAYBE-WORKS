"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Bookmark,
  List,
  CheckCircle2,
  User,
  Shield,
  Trophy,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Course, CourseTrack, DayTask } from "@/lib/supabase/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface WorkspaceTopBarProps {
  course: Course;
  track?: CourseTrack;
  dayNumber: number;
  tasks: DayTask[];
  activeTaskId: string;
  completedTaskIdSet: Set<string>;
  onSelectTask: (taskId: string) => void;
  userEmail?: string;
  userRole?: string;
}

export function WorkspaceTopBar({
  course,
  track,
  dayNumber,
  tasks,
  activeTaskId,
  completedTaskIdSet,
  onSelectTask,
  userEmail = "",
  userRole = "student",
}: WorkspaceTopBarProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; role?: string } | null>(
    userEmail ? { email: userEmail, role: userRole } : null
  );

  useEffect(() => {
    if (currentUser?.email) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then((res: { data: { user: SupabaseUser | null } }) => {
      if (res.data.user?.email) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", res.data.user.id)
          .single()
          .then((pRes: { data: { role?: string } | null }) => {
            setCurrentUser({ email: res.data.user!.email!, role: pRes.data?.role });
          });
      }
    });
  }, [currentUser]);

  const activeIndex = Math.max(0, tasks.findIndex((t) => t.id === activeTaskId));
  const activeTask = tasks[activeIndex] || tasks[0];
  const isCurrentTaskSolved = activeTask ? completedTaskIdSet.has(activeTask.id) : false;
  const isAdmin = currentUser?.role === "admin";

  const handlePrev = () => {
    if (activeIndex > 0) {
      onSelectTask(tasks[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (activeIndex < tasks.length - 1) {
      onSelectTask(tasks[activeIndex + 1].id);
    }
  };

  return (
    <header className="relative flex items-center justify-between border-b border-white/10 bg-black text-white px-3 sm:px-6 h-16 select-none shrink-0 z-40">
      {/* Left: Brand Logo + Roadmap Arrow + Three-Line Task Drawer + Difficulty + Track */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Kreepycode Logo Mark */}
        <Logo variant="mark" size="sm" href="/" />

        {/* Divider */}
        <div className="h-4 w-px bg-white/20 mx-0.5 hidden sm:block" />

        {/* Return to Roadmap Arrow */}
        <Link
          href={`/learn/${course.slug}/roadmap`}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 hover:border-[#FAFF00] hover:text-[#FAFF00] hover:bg-white/10 transition-colors text-white"
          title="Return to Roadmap"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Three-Line Menu (Curriculum Drawer) */}
        <div className="relative">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
              isDrawerOpen
                ? "bg-[#FAFF00] text-black border-[#FAFF00]"
                : "border-white/20 hover:border-white hover:bg-white/10 text-white"
            }`}
            title="View All Day Tasks"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Dropdown Task Drawer */}
          {isDrawerOpen && (
            <div className="absolute top-11 left-0 w-80 bg-[#0A0E1A] border-2 border-white/20 rounded-2xl shadow-2xl p-2.5 z-50 text-white animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-white/10 text-xs font-mono font-black uppercase text-white flex items-center justify-between">
                <span>Day {dayNumber} Curriculum</span>
                <span className="text-neutral-400 font-bold">{tasks.length} Tasks</span>
              </div>
              <div className="max-h-72 overflow-y-auto py-1 divide-y divide-white/5">
                {tasks.map((task, idx) => {
                  const isDone = completedTaskIdSet.has(task.id);
                  const isSelected = task.id === activeTaskId;
                  return (
                    <button
                      key={task.id}
                      onClick={() => {
                        onSelectTask(task.id);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        isSelected
                          ? "bg-[#FAFF00] text-black font-black"
                          : "hover:bg-white/10 text-white font-semibold"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="font-mono opacity-60">0{idx + 1}.</span>
                        <span className="truncate">{task.title}</span>
                      </div>
                      {isDone && (
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-black text-[#FAFF00]" : "bg-emerald-500 text-white"
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-white">
          {isCurrentTaskSolved ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FAFF00] stroke-[2.5]" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-neutral-400" />
          )}
          <span className="font-bold opacity-80 hidden md:inline">Difficulty:</span>
          <span className="font-black text-white">
            {activeTask?.task_type === "theory_video" ? "Concept" : "Easy"}
          </span>
        </div>

        {/* 2H / 3H / 4H Track Badge */}
        {track && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FAFF00] border border-black text-[11px] font-mono font-black text-black">
            {track.daily_hours}H Track
          </span>
        )}

        {/* Bookmark Button */}
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
            isBookmarked
              ? "bg-[#FAFF00] border-[#FAFF00] text-black"
              : "border-white/20 hover:border-white text-neutral-300 hover:text-white hover:bg-white/10"
          }`}
          title="Bookmark this task"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-black" : ""}`} />
        </button>
      </div>

      {/* Right: Task Progress Navigation + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold border border-white/20 hover:border-white text-white disabled:opacity-20 disabled:pointer-events-none hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Segmented Task Pills */}
        <div className="flex items-center gap-1.5">
          {tasks.map((task, idx) => {
            const isCompleted = completedTaskIdSet.has(task.id);
            const isActive = task.id === activeTaskId;

            return (
              <button
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                title={`Task ${idx + 1}: ${task.title}`}
                className={`h-2.5 sm:h-3 rounded-full transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "w-7 sm:w-9 bg-white border border-white ring-2 ring-[#FAFF00]"
                    : isCompleted
                    ? "w-5 sm:w-7 bg-[#FAFF00] border border-[#FAFF00]"
                    : "w-4 sm:w-5 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
                }`}
              />
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={activeIndex >= tasks.length - 1}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold border border-white/20 hover:border-white text-white disabled:opacity-20 disabled:pointer-events-none hover:bg-white/10 transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

        {/* Contests Button */}
        <Link href="/contests" prefetch={true}>
          <button
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border border-white/20 hover:border-[#FAFF00] hover:text-[#FAFF00] text-white hover:bg-white/10 transition-colors"
            title="Open Proctored Contests"
          >
            <Trophy className="w-3 h-3 text-[#FAFF00]" />
            <span className="hidden sm:inline">Contest</span>
          </button>
        </Link>

        {/* Admin Button if Admin */}
        {isAdmin && (
          <Link href="/admin" prefetch={true}>
            <Button
              variant="yellow"
              size="sm"
              className="rounded-full font-black uppercase tracking-wider text-xs border border-black flex items-center gap-1 px-3 shadow-sm hidden md:flex"
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </Button>
          </Link>
        )}

        {/* User Profile Pill or Sign In */}
        {currentUser?.email ? (
          <Link
            href="/profile"
            className="flex items-center gap-1.5 sm:gap-2 border-2 border-white/30 bg-black/60 px-3 sm:px-3.5 py-1 rounded-full hover:border-[#FAFF00] hover:text-[#FAFF00] text-white transition-colors shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-3 w-3" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider hidden sm:inline">
              {currentUser.email.split("@")[0]}
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-full font-black tracking-wider text-xs uppercase bg-white text-black hover:bg-[#FAFF00] hover:text-black transition-colors shadow-sm select-none"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
