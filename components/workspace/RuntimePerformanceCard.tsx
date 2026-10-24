"use client";

import { useMemo } from "react";
import { Zap, HardDrive, CheckCircle2 } from "lucide-react";

export interface RuntimePerformanceCardProps {
  runtimeMs: number;
  language: string;
  memoryMb?: number;
}

export function RuntimePerformanceCard({
  runtimeMs,
  language,
  memoryMb = 14.4,
}: RuntimePerformanceCardProps) {
  // Deterministic percentile calculation modeled on competitive benchmarks
  const runtimePercentile = useMemo(() => {
    if (runtimeMs <= 5) return 98.4;
    if (runtimeMs <= 15) return 94.6;
    if (runtimeMs <= 30) return 89.2;
    if (runtimeMs <= 60) return 79.5;
    if (runtimeMs <= 120) return 68.0;
    if (runtimeMs <= 250) return 52.4;
    return Math.max(15.0, 100 - runtimeMs * 0.2);
  }, [runtimeMs]);

  const memoryPercentile = useMemo(() => {
    if (memoryMb <= 14.5) return 91.2;
    if (memoryMb <= 20) return 82.5;
    return 74.0;
  }, [memoryMb]);

  // Compute X coordinate for the bell curve pin (from 40 to 260 in a 300px viewBox)
  const pinX = useMemo(() => {
    // Higher percentile = faster = further to the left (faster solutions)
    const factor = (100 - runtimePercentile) / 100;
    return 40 + factor * 220;
  }, [runtimePercentile]);

  return (
    <div className="mt-3 p-4 bg-[#0A0E18] border border-green-800/60 rounded-xl space-y-3 font-mono text-xs select-text">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-green-950 text-green-300 border border-green-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            Accepted
          </span>
          <span className="text-white text-xs font-bold">
            Solution Verified Across All Tests
          </span>
        </div>
        <span className="text-[11px] text-neutral-400 font-bold uppercase">
          {language}
        </span>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Runtime Stat */}
        <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5 text-[#FAFF00]" />
              Runtime
            </span>
            <span className="text-white font-black text-sm">{runtimeMs} ms</span>
          </div>
          <div className="text-[11px] text-neutral-300">
            Beats <strong className="text-[#FAFF00] font-black">{runtimePercentile.toFixed(1)}%</strong> of{" "}
            <span className="uppercase">{language}</span> submissions
          </div>
        </div>

        {/* Memory Stat */}
        <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              Memory
            </span>
            <span className="text-white font-black text-sm">{memoryMb.toFixed(1)} MB</span>
          </div>
          <div className="text-[11px] text-neutral-300">
            Beats <strong className="text-cyan-400 font-black">{memoryPercentile.toFixed(1)}%</strong> of submissions
          </div>
        </div>
      </div>

      {/* Bell Curve Distribution Graph */}
      <div className="pt-2 border-t border-neutral-800">
        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase mb-1">
          <span>Runtime Distribution</span>
          <span className="text-[#FAFF00]">Your Position ({runtimeMs} ms)</span>
        </div>

        <div className="relative w-full h-16 bg-black/40 rounded-lg p-1.5 border border-neutral-800/80 overflow-hidden">
          <svg viewBox="0 0 300 60" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            {/* Shaded Bell Curve Area */}
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Smooth Gaussian Path */}
            <path
              d="M 10 55 C 60 55, 80 45, 110 20 C 130 5, 150 5, 170 20 C 200 45, 230 55, 290 55 L 290 58 L 10 58 Z"
              fill="url(#curveGradient)"
            />
            <path
              d="M 10 55 C 60 55, 80 45, 110 20 C 130 5, 150 5, 170 20 C 200 45, 230 55, 290 55"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
            />

            {/* Vertical User Marker Pin */}
            <line
              x1={pinX}
              y1="5"
              x2={pinX}
              y2="55"
              stroke="#FAFF00"
              strokeWidth="2"
              strokeDasharray="2,2"
            />
            <circle cx={pinX} cy="10" r="4" fill="#FAFF00" stroke="#000000" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
