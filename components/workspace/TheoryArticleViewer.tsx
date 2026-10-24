"use client";

import { useState } from "react";
import { Check, CheckCircle2, Clock, Play, BookOpen, Copy, ArrowRight, Calendar, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WikipediaArticleRenderer } from "@/components/ui/WikipediaArticleRenderer";

export interface TheoryArticleViewerProps {
  title: string;
  notes: string;
  videoUrl?: string;
  videoTitle?: string;
  timestamps?: Array<{ time: string; label: string }>;
  onComplete: () => Promise<void> | void;
  isCompleted: boolean;
  onNextTask?: () => void;
  hasNextTask?: boolean;
}

export function TheoryArticleViewer({
  title,
  notes,
  videoUrl,
  videoTitle,
  timestamps = [],
  onComplete,
  isCompleted,
  onNextTask,
  hasNextTask = false,
}: TheoryArticleViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkComplete = async () => {
    if (isCompleted || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 select-text text-black">
      {/* Top Breadcrumb & Category Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="yellow" className="rounded-md">Curriculum Article</Badge>
          <span className="text-xs font-mono font-bold text-neutral-500">
            Self-Paced Architecture Track
          </span>
        </div>

        {/* Top Mark as Completed Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked
                ? "bg-[#FAFF00] border-black text-black"
                : "border-black/20 hover:border-black text-neutral-600"
            }`}
            title="Bookmark Article"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-black" : ""}`} />
          </button>

          <Button
            size="sm"
            variant={isCompleted ? "outline" : "yellow"}
            onClick={handleMarkComplete}
            disabled={isCompleted || isSubmitting}
            className="rounded-full shadow-xs px-4"
          >
            {isCompleted ? (
              <span className="flex items-center gap-1.5 text-green-800 font-black">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> Completed
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-black font-black">
                <Check className="w-4 h-4 stroke-[3]" />
                {isSubmitting ? "Saving..." : "Mark as Completed"}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Article Header (GFG Style) */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
          {title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-600 border-b border-black/10 pb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-black" />
            <span className="font-bold text-black">Last Updated : 24 Oct, 2026</span>
          </div>
          <span className="h-3 w-px bg-black/20" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-black" />
            <span className="font-bold text-black">8 min read</span>
          </div>
          <span className="h-3 w-px bg-black/20" />
          <span className="font-bold text-neutral-500">Verified Technical Reference</span>
        </div>
      </header>

      {/* Embedded Video Architecture Lesson */}
      {videoUrl && (
        <div className="relative aspect-video w-full bg-[#0A1128] border-2 border-black rounded-xl overflow-hidden shadow-sm mb-8">
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
              <div className="w-16 h-16 bg-[#FAFF00] text-black flex items-center justify-center rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-150 mb-3">
                <Play className="w-7 h-7 fill-black ml-1" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                {videoTitle || "Watch Technical Walkthrough"}
              </span>
              <span className="text-xs font-mono text-neutral-300 mt-1">
                Click to stream conceptual video demonstration
              </span>
            </div>
          )}
        </div>
      )}

      {/* Video Key Timestamps */}
      {timestamps.length > 0 && (
        <div className="bg-[#F8F9FA] border border-black/15 p-4 rounded-xl mb-8">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-black mb-3">
            <Clock className="w-4 h-4 text-black" />
            <span>Key Topic Timestamps</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {timestamps.map((ts, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono bg-white p-2 border border-black/10 rounded-lg">
                <span className="px-2 py-0.5 bg-black text-[#FAFF00] font-bold rounded-md">
                  {ts.time}
                </span>
                <span className="text-black font-semibold truncate">{ts.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editorial Content & Technical Markdown (GFG Article Style) */}
      <div className="space-y-6 text-neutral-900 leading-relaxed text-sm">
        <div className="p-4 bg-[#F8F9FA] border-l-4 border-black rounded-r-xl">
          <p className="font-semibold text-black text-sm leading-relaxed">
            In this module, we review the foundational principles, algorithmic invariants, and system considerations necessary to implement the subsequent coding exercises.
          </p>
        </div>

        <div className="p-6 bg-white border border-black/15 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-black/10 pb-3">
            <div className="flex items-center gap-2 text-black font-black text-sm uppercase">
              <BookOpen className="w-4 h-4 text-black" />
              <span>Core Subject Notes</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-neutral-100 border border-black/20 rounded-md hover:border-black text-black transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="pt-2">
            <WikipediaArticleRenderer
              content={notes}
              showToc={true}
              articleMeta={{
                category: "Computer Science Theory & Analysis",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="mt-10 pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-neutral-600">
            {isCompleted ? "You have finished this topic." : "Mark as completed once you have reviewed all notes."}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            size="lg"
            variant={isCompleted ? "outline" : "yellow"}
            onClick={handleMarkComplete}
            disabled={isCompleted || isSubmitting}
            className="flex-1 sm:flex-none rounded-xl font-black text-sm px-6"
          >
            {isCompleted ? (
              <span className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </span>
            ) : (
              <span className="flex items-center gap-2 text-black">
                <Check className="w-4 h-4 stroke-[3]" />
                {isSubmitting ? "Marking Complete..." : "Mark as Completed"}
              </span>
            )}
          </Button>

          {hasNextTask && (
            <Button
              size="lg"
              variant="primary"
              onClick={onNextTask}
              className="flex-1 sm:flex-none rounded-full font-black text-sm px-6 bg-black text-white hover:bg-neutral-800"
            >
              Next Task <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
