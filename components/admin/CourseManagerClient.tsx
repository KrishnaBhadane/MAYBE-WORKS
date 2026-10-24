"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Terminal, Database, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CreateCourseModal } from "@/components/admin/CreateCourseModal";
import type { Course, CourseTrack } from "@/lib/supabase/types";

export interface CourseManagerClientProps {
  courses: Course[];
  tracks: CourseTrack[];
}

export function CourseManagerClient({ courses, tracks }: CourseManagerClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
        <div>
          <Badge variant="yellow" className="mb-2">Curriculum CMS</Badge>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">
            Courses & Pacing Tracks
          </h1>
          <p className="text-xs text-neutral-600 mt-1 font-sans">
            Define available curricula, slug endpoints, and multi-track pacing schedules.
          </p>
        </div>

        <Button variant="yellow" size="sm" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-1.5 text-black" /> Add Course
        </Button>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 gap-6">
        {courses.map((course) => {
          const courseTracks = tracks.filter((t) => t.course_id === course.id);

          return (
            <div
              key={course.id}
              className="border-2 border-black bg-white p-6 rounded-none flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black text-[#FAFF00] flex items-center justify-center border border-black">
                    {course.slug.includes("sql") ? (
                      <Database className="w-3.5 h-3.5" />
                    ) : (
                      <Terminal className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <h2 className="text-xl font-black text-black uppercase tracking-tight">
                    {course.title}
                  </h2>
                  <Badge variant="subtle">/{course.slug}</Badge>
                </div>

                <p className="text-xs text-neutral-600 font-sans max-w-2xl leading-relaxed">
                  {course.description}
                </p>

                {/* Tracks Configuration Badges */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-500 block mb-1.5">
                    Pacing Configurations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courseTracks.map((tr) => (
                      <div
                        key={tr.id}
                        className="px-2.5 py-1 bg-[#F8F9FA] border border-black/20 text-xs font-mono"
                      >
                        <strong className="text-black">{tr.daily_hours}H / Day:</strong>{" "}
                        <span className="text-neutral-600">{tr.total_days} Total Days</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Course Meta */}
              <div className="shrink-0 flex flex-col items-end gap-2 text-right">
                <span className="text-[11px] font-mono text-neutral-400">
                  ID: {course.id.slice(0, 8)}...
                </span>
                <span className="px-2 py-0.5 bg-green-100 border border-green-600 text-green-900 font-mono text-[11px] font-bold uppercase">
                  Published
                </span>
              </div>
            </div>
          );
        })}

        {courses.length === 0 && (
          <div className="border-2 border-black bg-white p-12 text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30 text-black" />
            <h3 className="text-lg font-black uppercase text-black">No Courses Created Yet</h3>
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              Click &quot;Add Course&quot; to publish your first engineering curriculum.
            </p>
            <Button variant="yellow" size="sm" onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1 text-black" /> Add Course
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
