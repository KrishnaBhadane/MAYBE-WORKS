"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, User } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { WorkspaceTopBar } from "@/components/workspace/WorkspaceTopBar";
import { TheoryArticleViewer } from "@/components/workspace/TheoryArticleViewer";
import { ProblemStatementPanel, type SubmissionHistoryItem } from "@/components/workspace/ProblemStatementPanel";
import { AttachedCompilerPanel } from "@/components/workspace/AttachedCompilerPanel";
import { SqlWorkspacePanel } from "@/components/workspace/SqlWorkspacePanel";
import { McqViewer } from "@/components/workspace/McqViewer";
import { useUnlockCountdown } from "@/hooks/useUnlockCountdown";
import type {
  Course,
  CourseTrack,
  DayTask,
  Enrollment,
  TrackDay,
  TheoryVideoPayload,
  McqPayload,
  DsaProblemPayload,
  SqlProblemPayload,
} from "@/lib/supabase/types";

export interface DayWorkspaceClientProps {
  course: Course;
  track: CourseTrack;
  day: TrackDay;
  tasks: DayTask[];
  enrollment: Enrollment;
  completedTaskIds: string[];
  userEmail?: string;
  userRole?: string;
}

export function DayWorkspaceClient({
  course,
  track,
  day,
  tasks,
  enrollment,
  completedTaskIds: initialCompletedIds,
  userEmail = "",
  userRole = "student",
}: DayWorkspaceClientProps) {
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set(initialCompletedIds));
  const [activeTaskId, setActiveTaskId] = useState<string>(tasks[0]?.id || "");
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, SubmissionHistoryItem[]>>({});
  const [nextUnlockAt, setNextUnlockAt] = useState(enrollment.next_day_unlock_at);
  const countdown = useUnlockCountdown(nextUnlockAt);

  const activeIndex = Math.max(0, tasks.findIndex((t) => t.id === activeTaskId));
  const activeTask = tasks[activeIndex] || tasks[0];
  const hasNextTask = activeIndex < tasks.length - 1;

  const handleNextTask = () => {
    if (hasNextTask) {
      setActiveTaskId(tasks[activeIndex + 1].id);
    }
  };

  const handleTaskComplete = async (taskId: string, submittedCode?: string) => {
    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: enrollment.id, taskId, submittedCode }),
      });

      const data = await res.json();
      if (data.success) {
        setCompletedSet((prev) => new Set([...prev, taskId]));
        if (data.nextUnlockAt) {
          setNextUnlockAt(data.nextUnlockAt);
        }
      }
    } catch (err) {
      console.error("Failed to mark task complete:", err);
    }
  };

  const recordSubmission = (taskId: string, item: SubmissionHistoryItem) => {
    setSubmissionsMap((prev) => ({
      ...prev,
      [taskId]: [item, ...(prev[taskId] || [])],
    }));
  };

  const isLockedDay =
    day.day_number > enrollment.current_day ||
    (day.day_number === enrollment.current_day &&
      day.day_number > 1 &&
      !countdown.isUnlocked);

  if (isLockedDay) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-white select-none">
        {/* Unified Top Header for Locked State */}
        <header className="h-16 border-b border-white/10 bg-black text-white px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Logo variant="mark" size="sm" href="/" />
            <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />
            <Link
              href={`/learn/${course.slug}/roadmap`}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 hover:border-[#FAFF00] hover:text-[#FAFF00] hover:bg-white/10 transition-colors text-white"
              title="Return to Roadmap"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-mono font-bold text-neutral-400 hidden sm:inline">
              {course.title} &bull; Day {day.day_number}
            </span>
          </div>

          {userEmail && (
            <Link
              href="/profile"
              className="flex items-center gap-2 border-2 border-white/30 bg-black/60 px-3.5 py-1 rounded-full text-white text-xs font-mono font-bold hover:border-[#FAFF00] hover:text-[#FAFF00] transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-3 w-3" />
              </div>
              <span className="hidden sm:inline">{userEmail.split("@")[0]}</span>
            </Link>
          )}
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-xl w-full border-2 border-black bg-white p-8 sm:p-10 rounded-2xl shadow-sm text-center">
            <Badge variant="yellow" className="mb-3 rounded-full text-xs font-black">2:00 AM Strict Habit Lock (IST)</Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
              Day {day.day_number} Is Locked
            </h1>
            <p className="mt-3 text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
              Consistency is built day-by-day. Day {day.day_number} unlocks on Indian Standard Time at 2:00 AM IST.
            </p>
            <div className="mt-8 p-4 bg-[#F8F9FA] border border-black/20 rounded-xl flex items-center justify-center gap-3">
              <Clock className="w-5 h-5 text-black" />
              <span className="font-mono text-sm font-black">
                Unlocks in: <strong className="text-black">{countdown.formatted}</strong>
              </span>
            </div>
            <Link href={`/learn/${course.slug}/roadmap`} className="inline-block mt-6">
              <Button variant="primary" size="md" className="rounded-full font-black text-xs uppercase px-6">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col h-screen w-full bg-white overflow-hidden select-none">
        <WorkspaceTopBar
          course={course}
          track={track}
          dayNumber={day.day_number}
          tasks={tasks}
          activeTaskId={activeTaskId}
          completedTaskIdSet={completedSet}
          onSelectTask={(id) => setActiveTaskId(id)}
          userEmail={userEmail}
          userRole={userRole}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="border border-black/20 p-8 rounded-xl bg-[#F8F9FA] max-w-md">
            <h2 className="text-xl font-black text-black uppercase">No Tasks Configured</h2>
            <p className="text-xs text-neutral-600 mt-2 font-mono">
              Tasks for Day {day.day_number} have not been added yet.
            </p>
            <Link href={`/learn/${course.slug}/roadmap`} className="inline-block mt-4">
              <Button variant="primary" size="sm" className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden select-none">
      {/* CodeChef Style Unified Header with Navigation, Pacing & Progress Controls */}
      <WorkspaceTopBar
        course={course}
        track={track}
        dayNumber={day.day_number}
        tasks={tasks}
        activeTaskId={activeTaskId}
        completedTaskIdSet={completedSet}
        onSelectTask={(id) => setActiveTaskId(id)}
        userEmail={userEmail}
        userRole={userRole}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-hidden">
        {/* 1. Article / Theory Task (GeeksforGeeks Reference Style) */}
        {activeTask?.task_type === "theory_video" && (() => {
          const theory = activeTask.payload as TheoryVideoPayload;
          return (
            <div className="h-full overflow-y-auto">
              <TheoryArticleViewer
                title={activeTask.title}
                notes={theory.markdown_notes}
                videoUrl={theory.video_url}
                videoTitle={theory.video_title}
                timestamps={theory.timestamps}
                onComplete={() => handleTaskComplete(activeTask.id)}
                isCompleted={completedSet.has(activeTask.id)}
                onNextTask={handleNextTask}
                hasNextTask={hasNextTask}
              />
            </div>
          );
        })()}

        {/* 2. DSA Problem / Coding Assignment (CodeChef Reference Style) */}
        {activeTask?.task_type === "dsa_problem" && (() => {
          const dsa = activeTask.payload as DsaProblemPayload;
          return (
            <WorkspaceLayout
              leftPanel={
                <ProblemStatementPanel
                  title={activeTask.title}
                  description={dsa.description}
                  sampleTestcases={dsa.sample_testcases.map((t) => ({
                    input: t.input,
                    expectedOutput: t.expected_output,
                    explanation: t.explanation,
                  }))}
                  isSolved={completedSet.has(activeTask.id)}
                  submissions={submissionsMap[activeTask.id] || []}
                />
              }
              rightPanel={
                <AttachedCompilerPanel
                  initialCode={dsa.starter_code}
                  defaultLanguage={dsa.language || "cpp"}
                  testcases={dsa.sample_testcases.map((t) => ({
                    input: t.input,
                    expectedOutput: t.expected_output,
                  }))}
                  isCompleted={completedSet.has(activeTask.id)}
                  onSubmitSuccess={async (code) => {
                    recordSubmission(activeTask.id, {
                      id: `${activeTask.id}-${Date.now()}`,
                      status: "passed",
                      runtimeMs: 45,
                      language: dsa.language || "cpp",
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      codeSnippet: code.substring(0, 100),
                    });
                    await handleTaskComplete(activeTask.id, code);
                  }}
                  onNextTask={handleNextTask}
                  hasNextTask={hasNextTask}
                />
              }
            />
          );
        })()}

        {/* 3. SQL Problem Workspace */}
        {activeTask?.task_type === "sql_problem" && (() => {
          const sql = activeTask.payload as SqlProblemPayload;
          return (
            <WorkspaceLayout
              leftPanel={
                <ProblemStatementPanel
                  title={activeTask.title}
                  description={sql.description}
                  isSolved={completedSet.has(activeTask.id)}
                  submissions={submissionsMap[activeTask.id] || []}
                />
              }
              rightPanel={
                <SqlWorkspacePanel
                  initialCode={sql.starter_query}
                  schemaSql={sql.schema_sql}
                  expectedOutput={sql.expected_rows}
                  onSubmitSuccess={async (code) => handleTaskComplete(activeTask.id, code)}
                  isCompleted={completedSet.has(activeTask.id)}
                />
              }
            />
          );
        })()}

        {/* 4. MCQ / Quiz Assessment */}
        {activeTask?.task_type === "mcq" && (() => {
          const mcq = activeTask.payload as McqPayload;
          return (
            <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto">
              <McqViewer
                question={mcq.question}
                options={mcq.options}
                correctIndex={mcq.correct_index}
                explanation={mcq.explanation}
                onAnswerCorrect={() => handleTaskComplete(activeTask.id)}
                isCompleted={completedSet.has(activeTask.id)}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
