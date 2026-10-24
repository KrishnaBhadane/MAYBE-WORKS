"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Unlock, RotateCcw, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { StudentEnrollmentRow } from "@/lib/services/adminService";

export interface StudentRosterClientProps {
  initialStudents: StudentEnrollmentRow[];
}

export function StudentRosterClient({ initialStudents }: StudentRosterClientProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentEnrollmentRow[]>(initialStudents);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currentTime] = useState<number>(() => Date.now());

  const handleForceUnlock = async (enrollmentId: string) => {
    setLoadingId(`unlock-${enrollmentId}`);
    try {
      const res = await fetch("/api/admin/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "FORCE_UNLOCK", enrollmentId }),
      });

      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) =>
            s.enrollmentId === enrollmentId
              ? { ...s, nextDayUnlockAt: new Date(Date.now() - 1000).toISOString() }
              : s
          )
        );
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleResetStreak = async (userId: string) => {
    setLoadingId(`streak-${userId}`);
    try {
      const res = await fetch("/api/admin/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_STREAK", userId, targetStreak: 0 }),
      });

      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.userId === userId ? { ...s, streakCount: 0 } : s))
        );
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
        <div>
          <Badge variant="yellow" className="mb-2">Student Telemetry</Badge>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">
            Student Roster & Overrides
          </h1>
          <p className="text-xs text-neutral-600 mt-1 font-sans">
            Inspect active student habits, unlock locked milestones on-demand, and manage streak records.
          </p>
        </div>

        <Badge variant="subtle">{students.length} Total Enrollments</Badge>
      </div>

      <div className="border-2 border-black bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#F8F9FA] border-b-2 border-black uppercase font-bold text-neutral-600">
              <tr>
                <th className="p-3.5">Student Email</th>
                <th className="p-3.5">Track</th>
                <th className="p-3.5">Milestone</th>
                <th className="p-3.5">Streak</th>
                <th className="p-3.5">Unlock Status</th>
                <th className="p-3.5 text-right">Support Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {students.map((st) => {
                const isLocked = new Date(st.nextDayUnlockAt).getTime() > currentTime;
                const isUnlocking = loadingId === `unlock-${st.enrollmentId}`;
                const isResetting = loadingId === `streak-${st.userId}`;

                return (
                  <tr key={st.enrollmentId} className="hover:bg-[#FAFAFA]">
                    <td className="p-3.5 font-bold text-black">
                      {st.userEmail}
                      <span className="block text-[10px] text-neutral-400 font-normal">
                        {st.userId.slice(0, 16)}...
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-black">{st.courseTitle}</span>
                      <span className="block text-[11px] text-neutral-500 font-normal">
                        {st.dailyHours}H / Day ({st.totalDays} Days)
                      </span>
                    </td>
                    <td className="p-3.5 font-bold">
                      Day {st.currentDay} / {st.totalDays}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-[#FAFF00] border border-black font-bold text-black">
                        {st.streakCount} DAYS
                      </span>
                    </td>
                    <td className="p-3.5">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" /> Locked until 2:00 AM
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700">
                          <Check className="w-3.5 h-3.5" /> Unlocked
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleForceUnlock(st.enrollmentId)}
                        disabled={isUnlocking || !isLocked}
                      >
                        <Unlock className="w-3.5 h-3.5 mr-1" />
                        {isUnlocking ? "Unlocking..." : "Force Unlock"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetStreak(st.userId)}
                        disabled={isResetting || st.streakCount === 0}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        {isResetting ? "Resetting..." : "Reset Streak"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30 text-black" />
            <h3 className="text-base font-black uppercase text-black">No Students Enrolled Yet</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Student accounts will appear here as soon as they enroll in a track.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
