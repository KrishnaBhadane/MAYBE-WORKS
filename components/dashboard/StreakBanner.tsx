"use client";

import { Flame, Clock, Calendar } from "lucide-react";
import { useUnlockCountdown } from "@/hooks/useUnlockCountdown";

export interface StreakBannerProps {
  streakCount: number;
  nextUnlockAt?: string;
  lastActiveDate?: string | null;
}

export function StreakBanner({
  streakCount,
  nextUnlockAt,
  lastActiveDate,
}: StreakBannerProps) {
  const countdown = useUnlockCountdown(nextUnlockAt);

  return (
    <div className="border-2 border-black bg-white p-6 mb-8 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Streak Metric */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black flex items-center justify-center border-2 border-black rounded-none shrink-0 shadow-xs">
            <Flame className="w-8 h-8 text-black fill-[#FAFF00]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-black tracking-tight font-mono">
                {streakCount}
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-black bg-[#FAFF00] px-2 py-0.5 border border-black">
                Day Streak
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-1 font-sans">
              {streakCount === 0
                ? "Complete today's milestone to start your streak."
                : "Active consistency streak maintained across your tracks."}
            </p>
          </div>
        </div>

        {/* 2:00 AM Cutoff Ticker */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-black/10">
          <div className="bg-[#F8F9FA] border border-black/15 p-3 flex items-center gap-3">
            <Clock className="w-4 h-4 text-neutral-600 shrink-0" />
            <div className="text-left font-mono">
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                Next 2:00 AM Unlock
              </div>
              <div className="text-sm font-black text-black">
                {countdown.formatted}
              </div>
            </div>
          </div>

          {lastActiveDate && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>Active: {lastActiveDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
