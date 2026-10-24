"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TaskPayloadForms } from "@/components/admin/TaskPayloadForms";
import type { Course, CourseTrack, TaskType } from "@/lib/supabase/types";

export interface TaskBuilderClientProps {
  courses: Course[];
  tracks: CourseTrack[];
}

export function TaskBuilderClient({ courses, tracks }: TaskBuilderClientProps) {
  const router = useRouter();

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");
  const courseTracks = tracks.filter((t) => t.course_id === selectedCourseId);
  const [selectedTrackId, setSelectedTrackId] = useState(courseTracks[0]?.id || "");

  const [dayNumber, setDayNumber] = useState("1");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("theory_video");
  const [sequenceOrder, setSequenceOrder] = useState("1");
  const [estimatedMinutes, setEstimatedMinutes] = useState("30");

  const [payloadForm, setPayloadForm] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePayloadChange = (key: string, val: string) => {
    setPayloadForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      let structuredPayload: Record<string, unknown> = {};

      if (taskType === "theory_video") {
        structuredPayload = {
          video_url: payloadForm.videoUrl || "",
          video_title: payloadForm.videoTitle || taskTitle,
          markdown_notes: payloadForm.markdownNotes || "",
        };
      } else if (taskType === "dsa_problem") {
        structuredPayload = {
          description: payloadForm.description || "",
          starter_code: payloadForm.starterCode || "",
          language: "cpp",
          sample_testcases: [
            {
              input: payloadForm.sampleInput || "",
              expected_output: payloadForm.expectedOutput || "",
            },
          ],
          hidden_testcases: [],
        };
      } else if (taskType === "sql_problem") {
        let expectedRows: unknown[] = [];
        try {
          expectedRows = payloadForm.expectedRowsJson ? JSON.parse(payloadForm.expectedRowsJson) : [];
        } catch {
          setErrorMsg("Invalid JSON in Expected Rows field");
          setIsSubmitting(false);
          return;
        }

        structuredPayload = {
          description: payloadForm.description || "",
          schema_sql: payloadForm.schemaSql || "",
          starter_query: payloadForm.starterQuery || "SELECT * FROM ...",
          expected_solution_query: payloadForm.starterQuery || "",
          expected_rows: expectedRows,
        };
      } else if (taskType === "mcq") {
        structuredPayload = {
          question: payloadForm.question || taskTitle,
          options: [
            payloadForm.option0 || "Option A",
            payloadForm.option1 || "Option B",
            payloadForm.option2 || "Option C",
            payloadForm.option3 || "Option D",
          ],
          correct_index: parseInt(payloadForm.correctIndex || "0", 10),
          explanation: payloadForm.explanation || "",
        };
      }

      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: selectedTrackId || courseTracks[0]?.id,
          dayNumber: parseInt(dayNumber, 10),
          taskType,
          title: taskTitle,
          sequenceOrder: parseInt(sequenceOrder, 10),
          estimatedMinutes: parseInt(estimatedMinutes, 10),
          payload: structuredPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Failed to create task");
        return;
      }

      setSuccessMsg(`Task "${taskTitle}" published successfully into Day ${dayNumber}!`);
      setTaskTitle("");
      setPayloadForm({});
      router.refresh();
    } catch {
      setErrorMsg("Failed to communicate with task API");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none">
      <div className="border-b-2 border-black pb-6">
        <Badge variant="yellow" className="mb-2">Task Builder Wizard</Badge>
        <h1 className="text-3xl font-black text-black tracking-tight uppercase">
          Curriculum Task Engine
        </h1>
        <p className="text-xs text-neutral-600 mt-1 font-sans">
          Construct daily milestones (Theory lessons, C++ DSA problems, SQL challenges, MCQs).
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-500 flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-600 flex items-start gap-2 text-xs text-green-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-2 border-black bg-white p-6 space-y-5">
        {/* Track Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-black font-mono mb-1">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                const sub = tracks.filter((t) => t.course_id === e.target.value);
                setSelectedTrackId(sub[0]?.id || "");
              }}
              className="w-full border-2 border-black p-2 text-xs font-mono bg-white focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-black font-mono mb-1">
              Pacing Model Track
            </label>
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="w-full border-2 border-black p-2 text-xs font-mono bg-white focus:outline-none"
            >
              {courseTracks.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.daily_hours}H / Day ({tr.total_days} Days)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Milestone Position */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-black uppercase text-black font-mono mb-1">
              Day Number
            </label>
            <Input
              type="number"
              min="1"
              value={dayNumber}
              onChange={(e) => setDayNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black font-mono mb-1">
              Sequence Order
            </label>
            <Input
              type="number"
              min="1"
              value={sequenceOrder}
              onChange={(e) => setSequenceOrder(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black font-mono mb-1">
              Est. Minutes
            </label>
            <Input
              type="number"
              min="5"
              step="5"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Task Type Tabs */}
        <div>
          <label className="block text-xs font-black uppercase text-black font-mono mb-2">
            Task Type Architecture
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { id: "theory_video", label: "Theory Video" },
                { id: "dsa_problem", label: "C++ DSA" },
                { id: "sql_problem", label: "SQL Query" },
                { id: "mcq", label: "MCQ Checkpoint" },
              ] as const
            ).map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTaskType(t.id)}
                className={`p-2.5 text-xs font-mono font-bold border-2 transition-colors ${
                  taskType === t.id
                    ? "bg-black text-white border-black"
                    : "bg-[#F8F9FA] text-black border-black/20 hover:border-black"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Title */}
        <div>
          <label className="block text-xs font-black uppercase text-black font-mono mb-1">
            Task Title
          </label>
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g. Inverting Binary Trees in O(N)"
            required
          />
        </div>

        {/* Dynamic Payload Form */}
        <TaskPayloadForms
          taskType={taskType}
          formData={payloadForm}
          onChange={handlePayloadChange}
        />

        <div className="flex justify-end pt-4 border-t border-black/10">
          <Button variant="yellow" size="md" type="submit" disabled={isSubmitting}>
            <PlusCircle className="w-4 h-4 mr-1.5 text-black" />
            {isSubmitting ? "Publishing Milestone..." : "Save & Publish Task"}
          </Button>
        </div>
      </form>
    </div>
  );
}
