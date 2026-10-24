"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Clock, Calendar, Check } from "lucide-react";
import type { Course, CourseTrack, DailyHours } from "@/lib/supabase/types";

export interface HourSelectorModalProps {
  course: Course | null;
  tracks: CourseTrack[];
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (trackId: string, hours: DailyHours) => Promise<void>;
  isLoading?: boolean;
  activeEnrollmentCount?: number;
}

const PACING_DESCRIPTIONS: Record<DailyHours, { label: string; desc: string; structure: string }> = {
  2: {
    label: "Balanced",
    desc: "1 Theory Lesson + 1 Problem daily.",
    structure: "Ideal for full-time engineers maintaining steady consistency.",
  },
  3: {
    label: "Intensive",
    desc: "1 Theory Lesson + 2 Problems daily.",
    structure: "Recommended for targeted interview prep within 30-40 days.",
  },
  4: {
    label: "Immersion",
    desc: "1 Theory Lesson + 2 Problems + 1 Bonus daily.",
    structure: "Full-time curriculum to master algorithms in 3-4 weeks.",
  },
};

export function HourSelectorModal({
  course,
  tracks,
  isOpen,
  onClose,
  onEnroll,
  isLoading = false,
  activeEnrollmentCount = 0,
}: HourSelectorModalProps) {
  const [selectedHours, setSelectedHours] = useState<DailyHours>(3);

  if (!course) return null;

  const isLimitReached = activeEnrollmentCount >= 2;
  const selectedTrack = tracks.find((t) => t.daily_hours === selectedHours) || tracks[0];

  const handleConfirm = async () => {
    if (!selectedTrack || isLimitReached) return;
    await onEnroll(selectedTrack.id, selectedHours);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Choose Your Daily Commitment`}
      maxWidth="xl"
    >
      <div className="space-y-6 pt-2">
        {isLimitReached ? (
          <div className="p-4 bg-red-50 border-2 border-red-600 rounded-lg text-xs space-y-1">
            <strong className="text-red-900 block font-black uppercase tracking-wider">
              Enrollment Limit Reached (2 Active Courses)
            </strong>
            <p className="text-red-800 font-semibold leading-relaxed">
              You can only be actively enrolled in 2 courses at a time. Complete at least one ongoing course to unlock enrollment for a new track.
            </p>
          </div>
        ) : (
          <p className="text-sm text-black font-bold leading-relaxed">
            Select your daily time commitment for <strong className="text-black">{course.title}</strong>. Complete your daily tasks to maintain momentum and build discipline.
          </p>
        )}

        {/* Pacing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([2, 3, 4] as DailyHours[]).map((hours) => {
            const track = tracks.find((t) => t.daily_hours === hours);
            const isSelected = selectedHours === hours;
            const meta = PACING_DESCRIPTIONS[hours];

            return (
              <button
                key={hours}
                type="button"
                onClick={() => setSelectedHours(hours)}
                className={`p-4 border-2 text-left transition-all duration-150 rounded-lg flex flex-col justify-between cursor-pointer select-none ${
                  isSelected
                    ? "border-black bg-[#FAFF00] shadow-sm"
                    : "border-black/20 bg-white hover:border-black hover:bg-neutral-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xl font-black text-black">{hours}H</span>
                    {hours === 3 && (
                      <Badge variant="navy" size="sm" className="rounded-md">Popular</Badge>
                    )}
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider text-black">
                    {meta.label}
                  </div>
                  <p className="text-xs text-black font-medium mt-1 line-clamp-2">
                    {meta.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-black/15 flex items-center justify-between text-xs font-mono text-black font-bold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-black" />
                    {track ? `${track.total_days} Days` : "—"}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-black" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Summary Card */}
        <div className="p-4 bg-[#F8F9FA] border-2 border-black rounded-lg text-xs space-y-1">
          <div className="font-black text-black flex items-center gap-1.5 uppercase tracking-wide">
            <Clock className="w-4 h-4 text-black" />
            <span>Pacing Policy: {selectedHours} Hours Daily</span>
          </div>
          <p className="text-black font-medium text-xs">
            {PACING_DESCRIPTIONS[selectedHours].structure} Tasks must be completed daily to keep your engineering streak alive.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/15">
          <Button variant="ghost" size="sm" className="rounded-md font-bold text-black" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isLimitReached ? "outline" : "primary"}
            size="md"
            className="rounded-full font-bold"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLimitReached || isLoading}
          >
            {isLimitReached ? "Limit Reached (2/2 Courses)" : `Start Course (${selectedHours}h Track)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
