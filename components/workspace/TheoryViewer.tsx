"use client";

import { useState } from "react";
import { Play, Check, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface TheoryViewerProps {
  title: string;
  notes: string;
  videoUrl?: string;
  videoTitle?: string;
  timestamps?: Array<{ time: string; label: string }>;
  onComplete?: () => void;
  isCompleted?: boolean;
  className?: string;
}

export function TheoryViewer({
  title,
  notes,
  videoUrl,
  videoTitle,
  timestamps = [],
  onComplete,
  isCompleted = false,
  className = "",
}: TheoryViewerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-6 select-text text-black ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-black/10 pb-4">
        <div>
          <Badge variant="yellow" className="mb-2">Theory &amp; Concept</Badge>
          <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        </div>
        {onComplete && (
          <Button
            size="sm"
            variant={isCompleted ? "outline" : "primary"}
            onClick={onComplete}
            disabled={isCompleted}
          >
            <Check className="w-4 h-4 mr-1.5" />
            {isCompleted ? "Completed" : "Complete Lesson"}
          </Button>
        )}
      </div>

      {/* Lazy YouTube Player */}
      {videoUrl && (
        <div className="relative aspect-video w-full bg-[#0A1128] border border-black/20 overflow-hidden shadow-xs">
          {isPlaying ? (
            <iframe
              src={`${videoUrl}${videoUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title={videoTitle || title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              onClick={() => setIsPlaying(true)}
              className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer group bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white text-center"
            >
              <div className="w-16 h-16 bg-[#FAFF00] text-black flex items-center justify-center rounded-xs shadow-md group-hover:scale-105 transition-transform duration-150 mb-3">
                <Play className="w-7 h-7 fill-black ml-1" />
              </div>
              <span className="text-base font-bold tracking-tight text-white/95">
                {videoTitle || "Watch Architecture Breakdown"}
              </span>
              <span className="text-xs text-neutral-400 mt-1">Click to stream video without page tracking</span>
            </div>
          )}
        </div>
      )}

      {/* Timestamps */}
      {timestamps.length > 0 && (
        <div className="bg-[#F8F9FA] border border-black/10 p-4 rounded-xs">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-black mb-2.5">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Key Video Milestones</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {timestamps.map((ts, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                <span className="px-1.5 py-0.5 bg-black text-[#FAFF00] font-bold rounded-xs">{ts.time}</span>
                <span className="text-neutral-700 truncate">{ts.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes / Technical Documentation */}
      <div className="prose prose-neutral max-w-none text-sm leading-relaxed border-t border-black/10 pt-4">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-neutral-500 mb-3">
          <BookOpen className="w-4 h-4" />
          <span>Technical Reference</span>
        </div>
        <div className="whitespace-pre-wrap font-sans text-neutral-800 space-y-3">
          {notes}
        </div>
      </div>
    </div>
  );
}
